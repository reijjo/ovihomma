import type { APIRoute } from "astro";

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 50;
const MAX_DETAILS_LENGTH = 3000;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 15;
const RATE_LIMIT_MAX_REQUESTS = 5;

type RateLimitStore = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

type RuntimeEnv = {
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_RATE_LIMIT?: RateLimitStore;
};

const json = (body: Record<string, string>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });

function getText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function containsControlCharacters(value: string) {
  return /[\u0000-\u001f\u007f\r\n]/.test(value);
}

function containsUnsafeDetailsCharacters(value: string) {
  return /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
}

function isValidEmail(value: string) {
  return value.length <= MAX_EMAIL_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function isRateLimited(store: RateLimitStore | undefined, key: string) {
  if (!store) return false;

  const now = Math.floor(Date.now() / 1000);
  const existing = await store.get(key);
  const record = existing ? JSON.parse(existing) as { count: number; expiresAt: number } : null;

  if (!record || record.expiresAt <= now) {
    await store.put(
      key,
      JSON.stringify({ count: 1, expiresAt: now + RATE_LIMIT_WINDOW_SECONDS }),
      { expirationTtl: RATE_LIMIT_WINDOW_SECONDS },
    );
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) return true;

  await store.put(
    key,
    JSON.stringify({ ...record, count: record.count + 1 }),
    { expirationTtl: Math.max(1, record.expiresAt - now) },
  );
  return false;
}

export const POST: APIRoute = async ({ request, clientAddress, locals }) => {
  const runtime = (locals as { runtime?: { env?: RuntimeEnv } }).runtime;
  const env = runtime?.env;

  if (!env?.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL || !env.CONTACT_RATE_LIMIT) {
    return json({ code: "server_error" }, 500);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ code: "invalid_request" }, 400);
  }

  if (getText(formData, "website")) {
    return json({ code: "success" });
  }

  const name = getText(formData, "name");
  const email = getText(formData, "email");
  const phone = getText(formData, "phone");
  const requestDetails = getText(formData, "requestDetails");

  const invalid =
    !name || name.length > MAX_NAME_LENGTH ||
    !isValidEmail(email) ||
    !phone || phone.length > MAX_PHONE_LENGTH ||
    !requestDetails || requestDetails.length > MAX_DETAILS_LENGTH ||
    [name, email, phone].some(containsControlCharacters) ||
    containsUnsafeDetailsCharacters(requestDetails);

  if (invalid) return json({ code: "validation_error" }, 400);

  const ip = clientAddress ?? request.headers.get("CF-Connecting-IP") ?? "unknown";
  try {
    if (await isRateLimited(env.CONTACT_RATE_LIMIT, `contact:${ip}`)) {
      return json({ code: "rate_limited" }, 429);
    }
  } catch {
    return json({ code: "server_error" }, 500);
  }

  const message = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    "",
    "Request details:",
    requestDetails,
  ].join("\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: [env.CONTACT_TO_EMAIL],
        reply_to: email,
        subject: `New contact form message from ${name}`,
        text: message,
      }),
    });

    if (!response.ok) return json({ code: "server_error" }, 502);
  } catch {
    return json({ code: "server_error" }, 502);
  } finally {
    clearTimeout(timeout);
  }

  return json({ code: "success" });
};

export const GET: APIRoute = () => json({ code: "method_not_allowed" }, 405);

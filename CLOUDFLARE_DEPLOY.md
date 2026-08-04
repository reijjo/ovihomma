# Deploy Ovihomma to Cloudflare

## 1. Create a Resend account

1. Go to [resend.com](https://resend.com).
2. Create the account with `rantarepo@hotmail.com`.
3. Open the verification email and verify the address.

The temporary Resend sender can only deliver messages to the email address used for the Resend account. This is why the account must use `rantarepo@hotmail.com`.

## 2. Create a Resend API key

1. In Resend, open **API Keys**.
2. Create a new key named `ovihomma-contact-form`.
3. Copy the key.

Keep this key private. Never put it in the code or commit it to Git.

## 3. Add the contact-form settings to Cloudflare

1. Open the Cloudflare dashboard.
2. Go to **Workers & Pages**.
3. Open the `ovihomma` project.
4. Open **Settings → Variables and Secrets**.
5. Add these variables to the **Production** environment:

```text
RESEND_API_KEY=your Resend API key
CONTACT_TO_EMAIL=rantarepo@hotmail.com
CONTACT_FROM_EMAIL=Ovihomma <onboarding@resend.dev>
```

Mark `RESEND_API_KEY` as **Encrypted**. The other two values can be regular variables.

If you also want to test a preview deployment, add the same values to the **Preview** environment.

## 4. Enable rate limiting

Rate limiting protects the form from repeated automated submissions.

From the project folder, run:

```sh
bunx wrangler login
bunx wrangler kv namespace create CONTACT_RATE_LIMIT
```

Wrangler will print a namespace ID. Copy that ID and add this section to `wrangler.jsonc`:

```jsonc
"kv_namespaces": [
  {
    "binding": "CONTACT_RATE_LIMIT",
    "id": "paste-the-namespace-id-here"
  }
]
```

The `binding` name must be exactly `CONTACT_RATE_LIMIT`.

## 5. Deploy the site

If Cloudflare is connected to GitHub, push the changes and Cloudflare will deploy automatically.

For a manual deployment, run:

```sh
bun run build
bunx wrangler deploy
```

The build command should finish without errors.

## 6. Test the contact form

1. Open the deployed contact page.
2. Fill in all fields with a real test message.
3. Submit the form.
4. Confirm that the success message appears.
5. Check `rantarepo@hotmail.com` for the message.

## When the company domain is ready

1. Add and verify the domain in Resend.
2. Change `CONTACT_FROM_EMAIL` in Cloudflare to an address on that domain, for example:

```text
Ovihomma <contact@your-domain.com>
```

3. Deploy the site again.

## If something does not work

- A server error usually means `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, or `CONTACT_FROM_EMAIL` is missing.
- If rate limiting is not active, check that the KV binding name is exactly `CONTACT_RATE_LIMIT`.
- If Resend rejects the email, confirm that the Resend account email is `rantarepo@hotmail.com` and that the temporary sender is still `onboarding@resend.dev`.
- After changing Cloudflare variables, deploy the site again so the new settings are used.

## Astro deployment settings

When creating the Cloudflare project from GitHub, use:

- Build command: `bun run build`
- Deploy command: `bunx wrangler deploy`

The project uses the Astro Cloudflare adapter and server output because the contact form has a server API endpoint.

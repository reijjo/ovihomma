# Deploy Ovihomma to Cloudflare

## Basics

- Create Account and log in

## Start deploying

On the sidebar open *compute* -dropdown menu

- Choose *Workers & Pages*
- Then *Create application* button on the top of the page
- Click _Looking to deploy Pages? Get started_ button under the clickable options

### From GitHub

*Import an existing Git repository* -> Choose the repository you want to deploy

<details>
<summary>Astro</summary>

Be sure that you have the `@astrojs/check` and `typescript` packages installed

- Framework preset: **Astro**
- Build command: **bun run build**
- Build output directory: **dist**
- Click **Save and Deploy** button

</details>

### From Static files

### Wrangler setup

**Prerequirements**

<https://docs.astro.build/en/guides/deploy/cloudflare/>

1. Install Wrangler CLI -> `bun add -d wrangler@latest`
2. Install Cloudflare adapter -> `bunx astro add cloudflare`
3. Preview your project locally with Wrangler -> `bunx astro build && bunx wrangler dev`
4. For custom not-found pages (*src/pages/404.html*) update the `wrangler.jsonc` file:

```jsonc
{
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

**Deploy settings**

- Build command: `bun run build`
- Deploy command: `bunx wrangler deploy`
- Click `Deploy` button

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

Select **Secret** for `RESEND_API_KEY`. Select **Text** for `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`; do not use JSON.

If you also want to test a preview deployment, add the same values to the **Preview** environment.

### Local development with `.dev.vars`

The project already has a local `.dev.vars` file. Keep using that file for local testing, and do not commit it or share its contents. It is ignored by Git.

The file should contain the same variable names as Cloudflare, with local values:

```text
RESEND_API_KEY=your Resend API key
CONTACT_TO_EMAIL=your company email address
CONTACT_FROM_EMAIL=Ovihomma <contact@bestpartners.fi>
```

Use the actual verified sender address after `bestpartners.fi` has been verified in Resend. Do not put the API key in `wrangler.jsonc`, source code, or any tracked file. For Wrangler local development, `.dev.vars` is the recommended place for secrets.

Cloudflare Production and Preview variables are separate from `.dev.vars`. Changing `.dev.vars` does not change Cloudflare, and changing Cloudflare variables does not change the local file.

## 4. Enable rate limiting

Rate limiting protects the form from repeated automated submissions.

The contact endpoint stores a small counter in Cloudflare KV. In this project, one IP address can submit five times during a 15-minute window. KV is not an email service and does not store the contact messages; it only stores the temporary rate-limit counter.

From the project folder, run:

```sh
bunx wrangler login
bunx wrangler kv namespace create CONTACT_RATE_LIMIT
```

Run the namespace command only once. Wrangler will print a namespace ID. Copy the real ID and add this top-level section to the existing `wrangler.jsonc`:

```jsonc
"kv_namespaces": [
  {
    "binding": "CONTACT_RATE_LIMIT",
    "id": "paste-the-namespace-id-here"
  }
]
```

Do not replace the existing `assets` or `observability` sections in `wrangler.jsonc`; add `kv_namespaces` alongside them. The `binding` name must be exactly `CONTACT_RATE_LIMIT`.

The namespace ID is not a secret and may be stored in `wrangler.jsonc`. The Resend API key is different and must remain a Cloudflare Secret and a local `.dev.vars` value only.

If the KV binding is missing or the binding name is different, the contact endpoint returns a server error instead of sending the message.

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

## Move `bestpartners.fi` from Zoner DNS to Cloudflare

This changes **DNS management only**. The domain stays registered at Zoner. Do **not** choose **Transfer a domain**.

The site and contact form keep working on the default Cloudflare Worker address while you do these steps. Do not change the sender address until the last Resend step.

### Before you start

1. Log in to Zoner and Cloudflare in separate browser tabs.
2. At Zoner, copy or screenshot **every** current DNS record. This is your backup if something is missing after the move.
3. In particular, save all company-email records:
   - MX records
   - SPF TXT record
   - DKIM records
   - DMARC TXT record
   - Any mailbox, forwarding, verification, or service records

Do not delete or change the Zoner records yet.

### 1. Add the domain to Cloudflare

1. In Cloudflare, select **Add a domain** or **Add site**.
2. Enter `bestpartners.fi`.
3. Choose the free plan if no paid Cloudflare feature is needed.
4. Let Cloudflare scan the DNS records.
5. Compare the scanned records in Cloudflare with your Zoner backup.
6. Add every missing record in Cloudflare before continuing.

The automatic scan is helpful, but it can miss records. The company email can stop working if an MX, SPF, DKIM, or DMARC record is missing in Cloudflare.

### 2. Check DNSSEC before changing nameservers

1. In Zoner, look for **DNSSEC** or a **DS record** for `bestpartners.fi`.
2. If DNSSEC is off and there is no DS record, continue to the next section.
3. If DNSSEC is on, disable it or remove the DS record at Zoner.
4. Wait until the DS record's TTL has expired before changing nameservers. If Zoner does not show the TTL, wait 24 hours.

Do not skip this. Changing nameservers while old DNSSEC information is still active can make the domain fail to resolve for some visitors.

### 3. Change the nameservers at Zoner

1. In Cloudflare, copy the two nameservers shown for `bestpartners.fi`.
2. In Zoner, replace the current nameservers with **only** those two Cloudflare nameservers.
3. Save the change at Zoner.
4. Wait for Cloudflare to show the domain status as **Active**.

This can take a few minutes or up to 24 hours. Do not add or edit DNS records at Zoner after this point; Cloudflare becomes the place to manage them.

### 4. Verify `bestpartners.fi` in Resend

Do this only after Cloudflare shows the domain as **Active**.

1. In Resend, open **Domains** and select **Add Domain**.
2. Enter `bestpartners.fi`.
3. Resend will show the exact DNS records it needs. Open **Cloudflare → DNS → Records** in another tab.
4. Add every Resend record exactly as shown: same name, type, priority, and value.
5. For any Resend **CNAME** record, set **Proxy status** to **DNS only** (grey cloud).
6. Do not replace the existing company-email MX records at the root domain. Resend's sending records normally use the `send` subdomain.
7. Do not turn on Resend **Receiving** for the root domain. The existing mailbox service already receives company email.
8. Return to Resend and select **I've added the records** or **Verify DNS Records**.
9. Wait until Resend shows **Verified**.

If Resend does not verify, compare every field with the Resend screen. Do not create a second SPF record for the same hostname; use the exact record location Resend provides.

### 5. Connect the main address to the Worker

1. In Cloudflare, open **Workers & Pages** and select the deployed `ovihomma` Worker.
2. Open **Settings → Domains & Routes**.
3. Before adding the domain, check **Cloudflare → DNS → Records** for a CNAME record named `bestpartners.fi` (or `@`).
4. If that CNAME exists and is for an old website, remove it. A Worker Custom Domain cannot be added while a CNAME already exists on the same hostname.
5. Return to **Settings → Domains & Routes**.
6. Select **Add → Custom Domain**.
7. Enter `bestpartners.fi` and select **Add Custom Domain**.
8. Wait for Cloudflare to create the DNS record and issue the HTTPS certificate.

Do not manually create a CNAME for the Worker. Cloudflare creates the required record when you add the Custom Domain.

### 6. Redirect `www` to the main address

The main address is `https://bestpartners.fi`. Set up `www` only as a redirect.

1. In **Cloudflare → DNS → Records**, add an **A** record:
   - Name: `www`
   - IPv4 address: `192.0.2.0`
   - Proxy status: **Proxied** (orange cloud)
2. Open **Rules → Redirect Rules** and create a redirect rule.
3. Set the condition to: hostname equals `www.bestpartners.fi`.
4. Set the action to redirect to `https://bestpartners.fi`, preserving the path and query string.
5. Save and deploy the rule.

The placeholder IP is safe because Cloudflare intercepts the proxied request and sends the redirect; visitors never connect to that IP.

### 7. Use the verified sender address

After Resend shows **Verified**:

1. Open the `ovihomma` project in Cloudflare.
2. Open **Settings → Variables and Secrets**.
3. Change the Production `CONTACT_FROM_EMAIL` text value to:

```text
Ovihomma <contact@bestpartners.fi>
```

4. Trigger a new production deployment if Cloudflare asks for one after saving the variable.

Resend does not require `contact@bestpartners.fi` to be a separate mailbox, but it is best if replies can be received at that address.

## Final check

- [ ] Cloudflare says `bestpartners.fi` is **Active**.
- [ ] The company email can send and receive messages.
- [ ] Resend says `bestpartners.fi` is **Verified**.
- [ ] `https://bestpartners.fi` opens the site with a valid HTTPS lock icon.
- [ ] `https://www.bestpartners.fi` redirects to `https://bestpartners.fi`.
- [ ] A real contact-form test message reaches `rantarepo@hotmail.com`.
- Confirm that the form success message appears.
- Confirm that the email arrives at `CONTACT_TO_EMAIL`.
- Reply to the received message and confirm that the reply goes to the form sender.
- Send a normal email to the company mailbox and confirm that inbound email still works.
- Submit the form repeatedly from the same IP and confirm that rate limiting eventually returns the form's rate-limit error.
- Check Resend's domain status and email logs if delivery fails.

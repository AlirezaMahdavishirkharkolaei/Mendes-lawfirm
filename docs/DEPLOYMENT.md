# Deployment (Cloudflare, free tier)

## 1. One-time Cloudflare setup

```bash
npx cf auth login                  # or set CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
```

The D1 database (`mendes-db`) is provisioned automatically on first deploy, and the schema migrates itself on the first request.

**File storage.** By default, uploaded documents and article PDFs are stored in D1 in 1 MB chunks (max 10 MB per file), so no payment method is needed. For larger files, enable R2 on the account, create a bucket named `mendes-files`, and uncomment the `FILES` binding in `cloudflare.config.ts`. Uploads then go to R2 with a 20 MB limit. Files already stored in D1 stay there.

## 2. E-mail

The platform sends e-mail through **Resend** when the `RESEND_API_KEY` secret is set, and through Cloudflare Email Service otherwise.

**Resend (recommended, free tier):**

1. Create an account at https://resend.com and an API key at https://resend.com/api-keys (permission: *Sending access*).
2. Add it as a Worker secret named `RESEND_API_KEY` (dashboard → mendes → Settings → Variables and Secrets).
3. **Test mode:** with no verified domain the sender is `onboarding@resend.dev`, and Resend only delivers to the address the Resend account was created with. That's fine for testing. To e-mail clients and the managing partner, verify the firm's domain in Resend (Domains → Add domain → add the DNS records it shows), then set Admin → Settings → *Sender address* to e.g. `no-reply@your-domain.com`.
4. Use Admin → Settings → *Send test* to confirm delivery.

**Cloudflare Email Service (alternative):** enable Email Sending for a domain on the account and set *Sender address* to an address on it.

*Optional, automatic logging of outreach replies:* enable Email Routing, route the reply-to address to the `mendes` Worker, and add `triggers.email({ addresses: ["outreach@your-domain.com"] })` to `cloudflare.config.ts`.

## 3. Secrets

Secrets aren't needed for the deploy itself. Add them **after** the first successful deploy, in the dashboard (Workers & Pages → mendes → Settings → Variables and Secrets → Add → type *Secret*) or with `npx cf workers secrets put <NAME>`:

| Secret | Required? | Purpose |
|---|---|---|
| `ADMIN_SETUP_TOKEN` | once | Lets you create the first admin at `/admin/setup` |
| `GEMINI_API_KEY` | for AI | Free key from aistudio.google.com. Without it the chatbot uses keyword mode and no AI text is generated |
| `TAVILY_API_KEY` | optional | Free key from app.tavily.com (1,000 searches a month, no card). Lets the chatbot search the web and cite sources; capped at about 30 searches a day |
| `RESEND_API_KEY` | for e-mail | From resend.com/api-keys — see section 2 |
| `AUTH_SECRET` | optional | Signs e-mail links. If it isn't set, a random one is generated and kept in D1 |
| `ANTHROPIC_API_KEY` / `GROQ_API_KEY` / `OPENAI_API_KEY` | optional | Alternative AI providers |

Changing `AUTH_SECRET` invalidates outstanding booking-decision and unsubscribe links.

## 4. Site URL

E-mail links use the site's public address. It's detected automatically from incoming requests and remembered for cron jobs. To force a custom domain, set the `SITE_URL` text binding in `cloudflare.config.ts` (e.g. `https://mendes.law`).

## 5. Deploy

```bash
npm run deploy
```

## 6. First run

1. Open `https://your-domain/admin/setup`, enter `ADMIN_SETUP_TOKEN` and create the admin account.
2. **Admin → Settings:** managing partner e-mail, your e-mail, report recipients, office details, booking hours. Then use "Send test" to confirm e-mail delivery.
3. **Admin → Team:** complete the managing partner's profile and add phone numbers and e-mails.
4. **Admin → Cyprus laws:** press "Generate missing" (repeat until done), then have a lawyer review each language.
5. **Admin → Users:** invite lawyers and clients. They receive an e-mail to set their own password.

## Cron triggers

| Schedule (UTC) | Job |
|---|---|
| `0 6 1 * *` | Monthly outreach report to the partners |
| `0 7 * * *` | Reminders for meetings in the next ~30 h; AI outreach drafts for approval; missing law explanations |

To test locally while `npm run dev` is running:

```bash
curl -X POST "http://localhost:3001/cdn-cgi/local/explorer/api/local/scheduled?worker=mendes" \
  -H 'content-type: application/json' -d '{"cron":"0 7 * * *"}'
```

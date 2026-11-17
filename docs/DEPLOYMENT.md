# Deployment (Cloudflare, free tier)

## 1. One-time Cloudflare setup

```bash
npx cf auth login                  # or set CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
```

The D1 database (`mendes-db`) is provisioned automatically on first deploy, and the schema migrates itself on the first request.

**File storage.** By default, uploaded documents and article PDFs are stored in D1 in 1 MB chunks (max 10 MB per file), so no payment method is needed. For larger files, enable R2 on the account, create a bucket named `mendes-files`, and uncomment the `FILES` binding in `cloudflare.config.ts`. Uploads then go to R2 with a 20 MB limit. Files already stored in D1 stay there.

## 2. E-mail (Cloudflare Email Service)

1. Add the firm's domain to Cloudflare and enable **Email Sending** for it (Dashboard → Email Service, or `npx wrangler email sending enable your-domain.com`). This sets up SPF/DKIM.
2. Change the `MAIL_FROM` text binding in `cloudflare.config.ts` to an address on that domain, e.g. `no-reply@your-domain.com`.
3. *Optional, for automatic outreach replies:* enable **Email Routing** and route the reply-to address (Admin → Settings → "Outreach reply-to address") to the `mendes` Worker. Then add `triggers.email({ addresses: ["outreach@your-domain.com"] })` to `cloudflare.config.ts`.

Email Service is meant for transactional mail. Outreach is low-volume, one-to-one, human-approved and capped per day. If volume grows, move it to a dedicated outbound provider.

## 3. Secrets

Secrets aren't needed for the deploy itself. Add them **after** the first successful deploy, in the dashboard (Workers & Pages → mendes → Settings → Variables and Secrets → Add → type *Secret*) or with `npx cf workers secrets put <NAME>`:

| Secret | Required? | Purpose |
|---|---|---|
| `ADMIN_SETUP_TOKEN` | once | Lets you create the first admin at `/admin/setup` |
| `GEMINI_API_KEY` | for AI | Free key from aistudio.google.com. Without it the chatbot uses keyword mode and no AI text is generated |
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
| `0 7 * * *` | AI drafts outreach e-mails/replies for approval; fills missing law explanations |

To test locally while `npm run dev` is running:

```bash
curl -X POST "http://localhost:3001/cdn-cgi/local/explorer/api/local/scheduled?worker=mendes" \
  -H 'content-type: application/json' -d '{"cron":"0 7 * * *"}'
```

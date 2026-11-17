# Architecture

## Runtime

```
Browser ──► Cloudflare Worker (worker/index.ts)
              ├─ fetch      → vinext (Next.js 16 App Router, RSC, server actions)
              ├─ scheduled  → cron: monthly report (0 6 1 * *), daily AI drafting (0 7 * * *)
              └─ email      → inbound outreach replies (Email Routing)
            Bindings: DB (D1) · FILES (R2) · EMAIL (send_email) · IMAGES · secrets
```

Bindings are declared in `cloudflare.config.ts` and read with `import { env } from "cloudflare:workers"` (wrapped in `src/lib/env.ts`). Types are generated into `.cloudflare/types`.

## Directory structure

```
cloudflare.config.ts      Worker definition: bindings, cron triggers, secrets
vite.config.ts            vinext + Cloudflare Vite plugin
worker/index.ts           Worker entry: fetch / scheduled / email
migrations/               D1 schema (applied automatically on first request)
src/
├── app/
│   ├── [locale]/         Public site + Client Club (root layout with lang/dir)
│   │   ├── booking/  laws/  insights/  authors/  portal/  team/  practice/ …
│   │   └── template.tsx  Page-transition wrapper
│   ├── (system)/         Second root layout (English, noindex)
│   │   ├── page.tsx      "/" → language negotiation redirect
│   │   ├── admin/        Control room — (panel) for staff, (panel)/(admin-only) for admins
│   │   ├── booking/decision/  Partner's approve/reject page (signed link)
│   │   └── unsubscribe/
│   └── api/              chat · documents/[id] · articles/[id]/pdf · unsubscribe
├── components/           ui/ layout/ sections/ chat/ booking/ portal/ insights/ laws/ admin/ system/
├── lib/
│   ├── ai/               provider.ts (Gemini/Claude/Groq/OpenAI) · chat.ts (intake + referral)
│   ├── data/             bookings · cases · articles · laws · outreach · reports · team
│   ├── db/               D1 access, migrator, first-run seed
│   ├── email/            Email Service sender, branded templates
│   ├── i18n/             locale config, 5 dictionaries, admin overrides, formatting
│   ├── security/         PBKDF2 passwords, HMAC-signed tokens, D1 rate limiter
│   ├── auth.ts           sessions, roles, invites/resets
│   ├── settings.ts       settings table + audit log
│   ├── topics.ts         legal topic taxonomy + offline classifier
│   └── markdown.ts       safe Markdown renderer
└── styles/tokens.css     design tokens
```

## Data model (D1)

`users` (roles: client · lawyer · admin · author) · `sessions` · `user_tokens` · `team_members` · `bookings` · `cases` · `case_events` · `documents` · `articles` · `laws` · `chat_sessions` · `chat_messages` · `prospects` · `outreach_messages` · `suppressions` · `reports` · `settings` · `content_overrides` · `audit_log` · `rate_limits`.

Per-locale text (team positions and bios, law titles and explanations) is stored as JSON keyed by locale.

## Key flows

**Booking.** `availability()` builds slots from the booking settings in the firm's time zone (`Asia/Famagusta`) and blocks pending and approved slots. `createBooking()` re-validates the slot and rejects double-bookings. It then e-mails the managing partner two HMAC-signed links (14-day expiry) and sends the client an acknowledgement. The links open `/booking/decision`, a confirmation page with a POST form, so a mail-scanner prefetch can never decide a request. `decideBooking()` is idempotent and e-mails the client in their locale. A rejected client gets a re-booking link.

**AI referral.** `lib/ai/chat.ts` sends the conversation and the team directory to the provider and asks for JSON `{reply, topics, recommend}`. The specialist is then chosen deterministically by `routeToMember()`: a *referral lead* who covers the topic wins (this is how contract, trade, international tax and cybercrime matters reach Alireza), then the best specialty match, then the managing partner. Without an API key, a multilingual keyword classifier produces the same structure.

**Laws.** `generateLawExplanation()` asks for a fixed section structure and forbids invented figures. The result is stored as `review[locale] = "ai"`. Missing languages are filled on first visit (in the background via `after()`), by the daily cron, or from the admin.

**Outreach.** Staff add prospects by hand or by CSV. The daily cron or an admin action drafts e-mails up to the daily cap. Staff edit, approve and send. Each e-mail carries a signed unsubscribe link and RFC 8058 one-click headers, and suppressed addresses are never contacted again. Replies come in through the Worker's `email()` handler or are pasted by staff, and an AI answer draft is created. On the 1st of each month, `buildAndSendMonthlyReport()` aggregates last month's activity and adds an AI-written summary.

## Extending

- **New locale:** add it to `src/lib/i18n/config.ts` and add a dictionary (`satisfies Dictionary` keeps keys in sync).
- **New AI provider:** add a branch in `lib/ai/provider.ts`.
- **New legal topic:** add it to `src/lib/topics.ts`. It then appears in booking, practice areas, team specialties and the classifier.
- **New migration:** add `migrations/000N_*.sql` and register it in `src/lib/db/migrate.ts`.

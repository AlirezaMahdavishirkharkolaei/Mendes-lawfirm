# Mendes — Law & Consultancy Platform

A multilingual law-firm platform for **Mendes Law & Consultancy** (Kyrenia, North Cyprus), running entirely on Cloudflare's free tier.

| | |
|---|---|
| **Languages** | English · Türkçe · فارسی · Русский · العربية (full RTL for Persian and Arabic) |
| **Stack** | Next.js 16 App Router on Cloudflare Workers via [vinext](https://github.com/cloudflare/vinext) · D1 · R2 · Email Service · Cron Triggers |
| **AI** | Provider-agnostic (Gemini by default, or Claude / Groq / OpenAI) with an offline fallback |

## What it does

- **Meeting booking with partner approval.** A client picks a free slot and sends the request. The managing partner receives an e-mail with **Approve** and **Reject** buttons. Approving e-mails the client a confirmation in their own language; rejecting e-mails them a link to choose another time.
- **AI intake assistant.** The assistant chats with visitors in any of the five languages, works out which legal topics are involved, and introduces the right specialist with their phone number and e-mail. Contract, international trade, international tax and cybercrime matters always go to Alireza, who is the *referral lead* for those topics.
- **Client Club (portal).** Each client has a private area for their cases. It shows progress, the next step and a case timeline, and both client and lawyer can upload documents. Files live in R2, and every download checks permissions.
- **Cyprus law explained.** A catalogue of key TRNC statutes (Cap. 149, Cap. 113, Cap. 224 and others). The AI writes plain-language explanations in every site language. Each one shows an "AI-generated, not yet reviewed" notice until a lawyer marks it reviewed.
- **Student publishing.** Law students register as authors and submit articles for editorial review. Each published article gets a permanent, citable URL and the author gets a public author page, so both can go on a CV.
- **AI business outreach.** For companies abroad interested in investment, construction or company formation in North Cyprus. The AI drafts personalised e-mails and replies in each company's language, and **nothing is sent until a person approves it**. A monthly report goes to the partners on the 1st of every month.
- **Admin control room** (`/admin`). Covers bookings, cases, users, articles, laws, outreach, chat transcripts, team profiles, site copy in every language, settings and a full activity log.

## Quick start

```bash
npm install
cp .dev.vars.example .dev.vars   # set AUTH_SECRET and ADMIN_SETUP_TOKEN
npm run dev                      # http://localhost:3001
```

Then open `http://localhost:3001/admin/setup`, enter your `ADMIN_SETUP_TOKEN` and create the first admin account. The database migrates and seeds itself on the first request.

| Command | |
|---|---|
| `npm run dev` | Local dev server (workerd + local D1/R2 simulation) |
| `npm run build` | Production build |
| `npm run preview` | Run the built Worker locally |
| `npm run deploy` | Build and deploy to Cloudflare |
| `npm run check` | Typecheck + lint + build |

## Documentation

- [`docs/PROJECT.md`](docs/PROJECT.md) — scope and features
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — code structure, data model and flows
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — step-by-step Cloudflare deployment
- [`docs/SECURITY.md`](docs/SECURITY.md) — security and privacy posture
- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) — working on the code
- [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) — visual language, tokens and motion

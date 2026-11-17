# Mendes — Project Overview

## What this is

Mendes is the public website and the client and operations platform of Mendes Law & Consultancy in Kyrenia (Girne), North Cyprus. It serves five audiences:

| Audience | What they get |
|---|---|
| Prospective clients | Marketing site in 5 languages, an AI intake assistant, plain-language Cyprus law guides, meeting booking |
| Clients | The Client Club: case progress, timeline and secure document exchange |
| Law students | A peer-reviewed publishing channel with citable permalinks and author pages |
| Companies abroad | AI-assisted, human-approved business outreach about investing, building or incorporating in North Cyprus |
| Partners & staff | The `/admin` control room for every activity, piece of content and setting |

## Feature map

| Feature | Public route | Admin |
|---|---|---|
| Home, About, Practice, Team, Contact | `/{locale}/…` | Team, Site content |
| Meeting booking | `/{locale}/booking` | Bookings (+ e-mail decision links) |
| AI assistant | floating widget on every page | AI chats |
| Cyprus law explainer | `/{locale}/laws`, `/{locale}/laws/{slug}` | Cyprus laws |
| Articles | `/{locale}/insights`, `/{locale}/insights/submit`, `/{locale}/authors/{slug}` | Articles |
| Client Club | `/{locale}/portal`, `/{locale}/portal/cases/{id}` | Cases, Users |
| Outreach & monthly report | — (e-mail) | AI outreach |

Locales: `en`, `tr`, `fa` (RTL), `ru`, `ar` (RTL).

## Principles

- **Human in the loop.** The AI never sends an outreach e-mail, publishes a law explanation as "reviewed", or decides a booking on its own.
- **Honest AI output.** Prompts forbid invented statutes, numbers, clients or guarantees. Law pages show their review status.
- **Zero/near-zero cost.** Everything runs on Cloudflare's free tier plus a free Gemini API key. Paid providers are optional.
- **Editable without code.** Recipients, booking hours, team profiles, specialties, site copy, AI provider and feature switches all live in Admin → Settings / Team / Content.

## Content that must be completed before launch

- The managing partner's real profile (seeded as a placeholder) and any other team members: Admin → Team.
- Phone numbers and e-mails for each team member. These are shown by the chatbot when it refers a visitor.
- Recipient e-mails (managing partner, owner, report recipients) and office details: Admin → Settings.
- Lawyer review of each AI-generated law explanation: Admin → Cyprus laws.

# Security

## Current posture

This is a foundation-phase public marketing site with no authentication,
no client data storage, and no form submission handling implemented yet.
The attack surface today is minimal by design.

## Principles for what comes next

These apply as soon as form handling (Contact, Consultation Request) or
any future client-facing feature is implemented:

- **Server-side validation is mandatory.** Every form input must be
  validated against its Zod schema (see `src/lib/schemas/`) on the
  server, not just in the client. Client-side validation is a UX
  affordance, not a security boundary.
- **No secrets in the client bundle.** Any future API keys or credentials
  (e.g. for an email-sending provider) must be read from server-only
  environment variables and never exposed to `NEXT_PUBLIC_*` unless the
  value is genuinely safe to expose publicly.
- **Confidentiality by default.** This is a law firm. Any future feature
  that could touch client-identifying information (consultation request
  contents, future client portal data) must be treated as sensitive by
  default — encrypted in transit (HTTPS, enforced by Vercel/hosting),
  and not logged in plaintext.
- **Spam/abuse mitigation on public forms.** The consultation request
  schema (`src/lib/schemas/consultation-request.ts`) includes a honeypot
  field as a first line of defense. This is a minimal, free measure — if
  abuse becomes a real problem, evaluate options (including paid ones)
  separately rather than silently adding a paid service.
- **No fabricated professional claims.** Content in `src/content/` must
  never present placeholder/demonstration attorneys, credentials, or
  publications as real. This is enforced today only by the
  `isPlaceholder` flag and file-level comments — it is a content
  discipline requirement, not something the code can fully guarantee.
- **Dependency hygiene.** Avoid adding dependencies casually. Every new
  dependency is additional attack surface and additional maintenance
  burden. Run `npm audit` periodically.

## Not yet addressed (flag before building)

- Rate limiting on any future public form endpoint
- CSRF considerations for any future authenticated area
- A real spam-prevention strategy beyond the honeypot field, if abuse is
  observed
- Data retention policy for consultation request submissions, once that
  flow actually stores or forwards data

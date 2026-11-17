# Security & privacy

## Authentication

- Passwords are hashed with PBKDF2-SHA256 (100,000 iterations, per-user salt) using WebCrypto. Login does a dummy hash for unknown e-mails to blunt timing-based enumeration.
- Sessions use a random 256-bit token in an `HttpOnly; Secure; SameSite=Lax` cookie. Only its SHA-256 hash is stored. Sessions expire after 14 days and are revoked on password change or account deactivation.
- Staff never handle passwords. Invited users set their own through a one-time, expiring, hashed token.
- The first admin is created at `/admin/setup`, which needs the `ADMIN_SETUP_TOKEN` secret and disables itself once an admin exists.

## Authorization

- Roles: `client`, `lawyer`, `admin`, `author`. Every admin page checks the role itself (layouts alone are not trusted), and firm-wide pages require `admin`.
- A case and its documents are visible only to the case's client, its assigned lawyer and admins (`canAccessCase`). Document downloads re-check this on every request and are logged.
- Booking decision links and unsubscribe links are HMAC-SHA256 signed with expiry. Decisions need an explicit POST on a confirmation page, so a link preview can't approve or reject by accident.

## Input & output

- All form input is validated with Zod on the server. Uploads are limited to 20 MB with a MIME allow-list, stored in R2 under random keys and served with `nosniff` and a sandboxing CSP.
- User-submitted Markdown is HTML-escaped before rendering. Links are limited to `http(s)`/`mailto` with `rel="nofollow noopener"`.
- Rate limits (D1): login, registration, password reset, booking, chat, uploads and article submissions. Booking has a honeypot field.
- Server actions get Next.js's built-in Origin check. JSON route handlers check Origin explicitly.
- Security headers: HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy and Permissions-Policy.

## Privacy

- Chat transcripts are anonymous (no account link) and admins can delete them. IP addresses are only ever stored as salted hashes.
- Outreach goes only to business addresses that staff add, every message is approved by a person, and each one includes an unsubscribe link and RFC 8058 one-click headers. Unsubscribes are permanent.
- The AI provider receives chat messages, law titles and prospect details. It never receives case files or client documents.
- Every significant action is written to `audit_log` (Admin → Activity log).

## Secrets

`AUTH_SECRET`, `ADMIN_SETUP_TOKEN` and the AI keys are Worker secrets. They are never stored in the repository or the database. `.dev.vars` is git-ignored.

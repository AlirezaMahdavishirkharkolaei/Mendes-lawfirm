# Deployment

## Target

The project is built to be compatible with deployment on **Vercel**
(zero-cost tier is sufficient for the current foundation/MVP phase — no
paid Vercel features are required by anything in this codebase today).

## Build

```bash
npm run build
```

This runs a standard Next.js production build. There is currently no
custom build configuration beyond the default `create-next-app`
(App Router, TypeScript, Tailwind v4) setup.

## Environment variables

None are required today. See `.env.example` and `SECURITY.md`. When the
consultation request flow is built out beyond its current structural
schema, any provider credentials it needs (e.g. for sending email) should
be added as environment variables in the hosting platform's dashboard —
never committed to the repository.

## Process (once a real hosting target is connected)

1. Connect the Git repository to Vercel (or the chosen host).
2. Confirm the build command (`next build`) and output are auto-detected
   correctly — no custom `next.config.ts` output overrides exist today.
3. Set any required environment variables in the hosting dashboard once
   they exist.
4. Deploy from the main branch; use preview deployments for review before
   merging.

## Not yet set up

- No CI pipeline exists yet (no GitHub Actions workflow, etc.) — add one
  when the team wants automated lint/typecheck/build checks on PRs.
- No custom domain, hosting account, or Vercel project has been
  connected in this environment. This documentation describes the
  intended process, not a completed setup.

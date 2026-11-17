# Development

## Requirements

- Node.js (a recent LTS version)
- npm (project is set up with a `package-lock.json`)

## Setup

```bash
npm install
```

## Common commands

```bash
npm run dev      # start the local dev server
npm run build    # production build
npm run start    # run the production build locally
npm run lint     # run ESLint
npx tsc --noEmit # TypeScript type-check without emitting output
```

## Project conventions

- **Content changes** (Practice Areas, Attorneys, Insights) go in
  `src/content/*.ts`. Each file's data is validated against a Zod schema
  in `src/lib/schemas/` at import time — if the shape is wrong, the app
  will fail fast with a validation error rather than rendering broken
  content.
- **New UI primitives** go in `src/components/ui/`; **layout chrome**
  (header/footer/nav) goes in `src/components/layout/`; **page-section
  components** go in `src/components/sections/`.
- **New public pages** go under `src/app/(marketing)/`.
- Do not hardcode Practice Area / Attorney / Insight content directly
  into page or component files — add it to `src/content/` instead.
- Do not add a new dependency (especially a paid service SDK) without
  confirming it against the current cost constraint in `PROJECT.md`.

## Environment variables

None are required at this phase. See `.env.example`.

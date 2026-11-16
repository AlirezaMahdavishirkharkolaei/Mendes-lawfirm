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
npm run dev          # start the local dev server (open /en/)
npm test             # Vitest: dictionaries, content integrity, sitemap, consultation logic
npm run lint         # ESLint
npm run typecheck    # TypeScript type-check
npm run build        # static export to out/
npm run build:pages  # static export under the /mendes-lawfirm base path (GitHub Pages)
npm run preview      # serve out/ locally
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
- **New public pages** go under `src/app/[lang]/`. Every page reads the
  language with `resolveLocale(params)` and its text from
  `getDictionary(locale)`; add new strings to `src/i18n/dictionaries/en.ts`
  first; TypeScript then requires them in `tr.ts` and `fa.ts`, and the
  tests check that list lengths match.
- **Firm details** (address, phone, WhatsApp, hours, social links) go in
  `src/content/firm.ts`. Optional fields that are left out are simply not
  shown; never fill a field with a placeholder.
- Do not hardcode Practice Area / Attorney / Insight content directly
  into page or component files — add it to `src/content/` instead.
- Do not add a new dependency (especially a paid service SDK) without
  confirming it against the current cost constraint in `PROJECT.md`.

## Environment variables

`NEXT_PUBLIC_BASE_PATH` (optional) sets the sub-path the site is served
from, e.g. `/mendes-lawfirm` on GitHub Pages. Leave it empty on a domain
root. See `.env.example`.

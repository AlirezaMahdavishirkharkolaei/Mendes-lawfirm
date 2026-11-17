# Development

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev          # http://localhost:3001 — workerd with local D1, R2 and e-mail simulation
```

- Local data lives in `.cloudflare/state`. Delete that folder to reset the database.
- Without an AI key, the chatbot uses its offline keyword classifier and law generation is skipped. Add `GEMINI_API_KEY` to `.dev.vars` to test the full AI behaviour.
- Bindings are read with `import { env } from "cloudflare:workers"` (see `src/lib/env.ts`). Don't use `process.env`.
- Before committing, run `npm run check` (typecheck + lint + build).

## Conventions

- **Copy** lives in `src/lib/i18n/dictionaries/*.ts`. Every locale must satisfy the `Dictionary` type, so a missing key is a type error.
- **Data access** lives in `src/lib/data/*`. Pages and actions call these functions and never write SQL inline (the admin dashboard counts are the one exception).
- **Server actions** sit next to their route (`actions.ts`), and admin actions are all in `src/app/(system)/admin/actions.ts`. Every action re-checks the user's role.
- **RTL:** use logical utilities (`ms-`, `ps-`, `start-`, `end-`, `border-s`) instead of `left`/`right`.
- **Motion:** use the primitives in `globals.css` and `components/ui` (`Reveal`, `SplitWords`, `Spotlight`, `Magnetic`). All motion respects `prefers-reduced-motion`.

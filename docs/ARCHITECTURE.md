# Architecture

## Stack

- **Next.js (App Router)** — routing, rendering, server actions/route
  handlers for form processing
- **React + TypeScript** — component layer
- **Tailwind CSS v4** — styling
- **Zod** — schema validation for content and form input

No CMS, CRM, scheduling system, analytics platform, or AI API is
integrated at this phase. See `PROJECT.md` for the cost constraint this
enforces.

## Directory structure

```
src/
├── app/
│   ├── (marketing)/       # public marketing site route group
│   │   ├── layout.tsx     # Header + #main-content landmark + Footer, shared by every route in this group
│   │   └── page.tsx       # Home (placeholder content, structure only)
│   ├── layout.tsx         # root layout — html/body shell, SkipLink, global metadata
│   └── globals.css        # Tailwind + design-token bridge, base styles
├── assets/
│   └── fonts/             # where self-hosted font files go (not yet added — see README.md there)
├── components/
│   ├── ui/                # design-system primitives — see docs/DESIGN-SYSTEM.md
│   ├── layout/             # Header, Nav, MobileNav, Footer, Wordmark, Container primitives — see docs/DESIGN-SYSTEM.md
│   └── sections/           # page-section-level components (not yet built)
├── content/                # typed, Zod-validated placeholder content
│   ├── attorneys.ts
│   ├── practice-areas.ts
│   └── insights.ts
├── lib/
│   ├── fonts.ts             # next/font/local scaffold (inactive until font files are added)
│   ├── motion.ts            # motion timing constants, mirrors tokens.css
│   └── schemas/             # Zod schemas backing content + form validation
│       ├── attorney.ts
│       ├── practice-area.ts
│       ├── insight.ts
│       └── consultation-request.ts
├── styles/
│   └── tokens.css           # single source of truth for design tokens — see docs/DESIGN-SYSTEM.md
└── types/                  # shared TypeScript types (not yet populated)
```

## Design system

The full color/type/spacing/layout/motion token system and the
`src/components/ui/` primitive inventory are documented in
`docs/DESIGN-SYSTEM.md` — read that alongside this file when touching
anything visual.

## Route groups

Only `(marketing)` exists today. It is a route group (not a URL segment)
so that future groups — e.g. `(portal)`, `(admin)`, or a future AI-driven
section — can be added as siblings under `src/app/` without moving or
restructuring the current public site. This was a specific requirement:
the public site and any future authenticated application(s) must be able
to grow independently.

## Content layer

Practice Areas, Attorneys, and Insights are modeled as typed TypeScript
objects in `src/content/`, each validated at import time against a Zod
schema in `src/lib/schemas/`. This is deliberate:

- **Why not hardcode content into page components?** Because Practice
  Areas, Attorneys, and Insights are all expected to grow, and mixing
  content with markup makes that content hard to find, review, or migrate.
- **Why not a CMS yet?** Cost constraint for this phase — see `PROJECT.md`.
- **How does this support a future CMS?** The Zod schemas
  (`attorneySchema`, `practiceAreaSchema`, `insightSchema`) define the
  contract that content must satisfy, independent of where it comes from.
  When a CMS is introduced, the migration path is: replace the
  `src/content/*.ts` data source with a fetch from the CMS, validate the
  response against the same schema, and leave every component that
  consumes `Attorney[]` / `PracticeArea[]` / `Insight[]` unchanged.

All attorney data in `src/content/attorneys.ts` is explicitly marked
placeholder/demonstration content (`isPlaceholder: true`) and must be
replaced with real data before launch — see the file-level comment there.

## Forms / consultation request

Only the structural schema for consultation requests exists so far
(`src/lib/schemas/consultation-request.ts`). The intended flow is:

```
User → Consultation Form → server-side validation (Zod) → secure
processing → confirmation
```

No form UI, server action, or "secure processing" step has been built
yet — that is explicitly out of scope for the foundation phase. When it
is built, it should not introduce any external CRM, scheduling, or
payment integration without separate approval.

## Internationalization

The site is English-first. No i18n library or routing is installed. As a
soft convention (not enforced by tooling at this phase), user-facing copy
is kept identifiable rather than deeply interpolated into JSX, so that a
future i18n pass is additive rather than a rewrite. This is a convention
to keep in mind during future development, not a guarantee already built
into the code.

## AI

No AI functionality or AI API dependency exists in this codebase. The
content-layer/schema separation above is the main thing that would make a
future AI layer (e.g. AI-assisted Insights drafting, or a client-facing
legal AI tool under a future route group) additive rather than a
restructuring.

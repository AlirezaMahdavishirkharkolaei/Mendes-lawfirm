# Architecture

## Stack

- **Next.js 16 (App Router), static export:** every page is prerendered
  to HTML (`output: "export"`); there is no server at runtime
- **React 19 + TypeScript**: component layer
- **Tailwind CSS v4**: styling, with tokens in `src/styles/tokens.css`
- **Zod v4**: schema validation for content and form input
- **@fontsource**: self-hosted Fraunces, IBM Plex Sans/Mono and Vazirmatn
- **Vitest**: tests in `tests/`

No CMS, CRM, scheduling system, analytics platform, or AI API is
integrated. See `PROJECT.md` for the cost constraint this enforces.

## Directory structure

```
src/
├── app/
│   ├── [lang]/              # root layout per language (html lang/dir, fonts, metadata)
│   │   ├── layout.tsx       # Header + #main-content + Footer
│   │   ├── page.tsx         # Home
│   │   ├── about/ contact/ consultation/ privacy/ disclaimer/
│   │   ├── practice-areas/  # index + [slug]
│   │   ├── team/            # index + [slug]; hidden while the team list is empty
│   │   └── insights/        # index + [slug]; hidden while there are no articles
│   ├── (root)/              # "/" language picker + redirect to the browser language
│   ├── global-not-found.tsx # trilingual 404
│   ├── sitemap.ts robots.ts icon.svg globals.css
├── i18n/
│   ├── config.ts            # locales, direction, href() helper
│   ├── get.ts               # getDictionary(), resolveLocale()
│   └── dictionaries/        # en.ts (reference), tr.ts, fa.ts
├── components/
│   ├── ui/                  # design-system primitives (see docs/DESIGN-SYSTEM.md)
│   ├── layout/              # Header, Nav, MobileNav, Footer, Wordmark, LanguageSwitcher, containers
│   ├── sections/            # Hero, Philosophy, PracticeAreasIndex, PageHeader, ConsultationCTA ...
│   └── forms/               # ConsultationForm
├── content/                 # Zod-validated content: firm, practice areas, attorneys, insights
├── lib/
│   ├── navigation.ts        # shared nav data
│   ├── seo.ts               # canonical + hreflang alternates
│   ├── motion.ts            # motion timing constants, mirrors tokens.css
│   └── schemas/             # Zod schemas (localized strings, content, consultation request)
└── styles/tokens.css        # design tokens
tests/site.test.ts           # dictionary parity, content integrity, sitemap, form logic
```

## Design system

The full color/type/spacing/layout/motion token system and the
`src/components/ui/` primitive inventory are documented in
`docs/DESIGN-SYSTEM.md` — read that alongside this file when touching
anything visual.

## Routing

Every public URL starts with a language segment: `/en/`, `/tr/`, `/fa/`.
`app/[lang]/layout.tsx` is a root layout, so each language renders its
own `<html lang dir>`; Persian is `dir="rtl"` and layouts use logical
properties (`ms-`, `pe-`, `text-start`) so they mirror automatically.
`generateStaticParams` + `dynamicParams = false` mean only known
languages and slugs exist; anything else is the global 404.

`app/(root)` is a second root layout serving only `/`: a language picker
that redirects to the visitor's browser language with a small inline
script, and still works without JavaScript.

A future authenticated area (client portal, admin) can be added as a
sibling route group without touching the public site; it would need to
leave static export at that point (see `DEPLOYMENT.md`).

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

Text fields are localized objects (`{ en, tr, fa }`) validated by
`localizedString` / `localizedList`, so a missing translation fails the
build. Only firm-approved facts are published: `attorneys.ts` and
`insights.ts` are empty until real profiles and articles exist, and the
navigation hides those sections while they are empty.

## Forms / consultation request

```
Visitor → ConsultationForm → Zod validation in the browser →
mailto: (or WhatsApp) with a structured message → firm's inbox
```

Because the site is static, nothing is posted to a server and nothing is
stored. A honeypot field drops naive bots. `?area=<slug>` preselects a
practice area. When the firm needs server-side intake, the same schema
moves into a server action or route handler.

## Internationalization

Three languages: English (reference), Turkish and Persian. UI text lives
in `src/i18n/dictionaries/`; `en.ts` defines the shape and TypeScript
requires the same keys in `tr.ts` and `fa.ts`; tests also check that
list lengths match. Content in `src/content/` carries its own
translations. Each page has a canonical URL plus `hreflang` alternates
(and `x-default` → English), and the sitemap lists all languages.

## AI

No AI functionality or AI API dependency exists in this codebase. The
content-layer/schema separation above is the main thing that would make a
future AI layer (e.g. AI-assisted Insights drafting, or a client-facing
legal AI tool under a future route group) additive rather than a
restructuring.

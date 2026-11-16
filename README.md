# Mendes — law firm website

Website of **Mendes Law and Consultancy**, Northern Cyprus. It is a fully static Next.js 16 site in **English, Turkish and Persian** (Persian is right to left), with no server and no tracking.

**Live:** https://alirezamahdavishirkharkolaei.github.io/mendes-lawfirm/

| Page | Path |
|---|---|
| Home | `/{en,tr,fa}/` |
| About | `/{lang}/about/` |
| Practice areas, plus a page for each area | `/{lang}/practice-areas/`, `/{lang}/practice-areas/{slug}/` |
| Contact | `/{lang}/contact/` |
| Consultation request | `/{lang}/consultation/` |
| Privacy, legal disclaimer | `/{lang}/privacy/`, `/{lang}/disclaimer/` |
| Team, insights | Appear by themselves once profiles or articles are added in `src/content/` |

The root path `/` sends visitors to their browser language and falls back to English.

## Highlights

- **Three languages:**
  - Every page is prerendered in each language, with `hreflang` alternates and a sitemap.
  - The language switcher keeps you on the same page.
  - Persian pages use Vazirmatn and a mirrored layout.
- **The consultation request needs no backend:**
  - The form is checked in the browser with zod.
  - It then opens the visitor's email app, or WhatsApp once a number is configured, with a structured request.
  - Nothing is stored or sent to a third party, and the privacy page says so.
  - A practice-area page links to the form with that area already selected.
- **Content-first architecture:**
  - Firm details, practice areas, team and articles live in `src/content/` and are validated with zod at build time.
  - A detail the firm has not provided is left out of the page; the site never shows a placeholder in its place.
- **Design system "The Citation Mark":**
  - Fonts: Fraunces, IBM Plex Sans and IBM Plex Mono, self-hosted through `@fontsource`.
  - Design tokens are defined in `src/styles/tokens.css`.
  - The site follows an accessibility baseline: a skip link, visible focus, reduced-motion support, and a mobile menu that traps keyboard focus.
- **Quality:**
  - ESLint, TypeScript and Vitest tests cover the dictionaries, content integrity, the sitemap and the consultation-request logic.
  - CI runs these checks on every push.
  - GitHub Pages deploys `main` automatically.

## Develop

```bash
npm ci
npm run dev          # http://localhost:3000/en/
npm test && npm run lint && npm run typecheck
npm run build        # static site in out/
npm run build:pages  # same, under the /mendes-lawfirm base path
```

## Where things live

```
src/app/[lang]/       pages (root layout per language)
src/app/(root)/       "/" → language redirect
src/i18n/             locales and the en / tr / fa dictionaries
src/content/          firm details, practice areas, team, insights
src/components/       ui primitives, layout chrome, page sections, forms
src/lib/              navigation, SEO helpers, zod schemas
docs/                 PROJECT, ARCHITECTURE, DESIGN-SYSTEM, DEVELOPMENT, DEPLOYMENT, SECURITY
```

## Credits

Built by **Alireza Mahdavishirkharkolaei** for Mendes Law and Consultancy.

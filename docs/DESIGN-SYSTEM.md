# Design system — "Obsidian & Champagne" (v1.0)

## Direction

Quiet luxury. A near-black obsidian ground, warm ivory type and a champagne-gold accent kept for emphasis only: hairlines, marks, focus states and primary actions. Editorial serif display type with a technical mono layer for labels and citations.

## Tokens (`src/styles/tokens.css`)

| Token | Value | Use |
|---|---|---|
| `night` / `night-2` / `night-3` | `#0a0a0c` / `#111114` / `#18181c` | page / raised / inputs & cards |
| `paper` | `#f4efe6` | ivory editorial bands (philosophy, values) |
| `ivory` / `ivory-muted` | `#f2ece1` / `#a59d8f` | text on dark |
| `gold` / `gold-light` / `gold-deep` | `#c9a96a` / `#e8d5a8` / `#8a6d3b` | accent, gradients |
| `line` / `line-strong` | gold at 18% / 42% | hairlines and borders |

## Typography

| Role | Latin & Cyrillic | Persian & Arabic |
|---|---|---|
| Display | Cormorant Garamond (variable) | Vazirmatn 600 |
| Body / UI | Inter (variable) | Vazirmatn |
| Labels / citations | IBM Plex Mono, uppercase, wide tracking | Vazirmatn, no tracking |

All fonts are self-hosted via `@fontsource`, so the site makes no third-party font requests.

## Motion (`src/app/globals.css`)

| Primitive | Effect |
|---|---|
| `SplitWords` | headline words rise in sequence |
| `Reveal` (`fade`/`clip`/`scale`) | scroll-triggered entrance with blur-to-sharp |
| `template.tsx` → `.page-enter` | soft page transition on every navigation |
| `Spotlight` | gold light follows the pointer on cards |
| `Magnetic` | CTA drifts toward the pointer |
| `HeroParallax` | pointer and scroll depth on hero layers |
| `.aurora`, `.grain`, `.orbit`, `.gold-text`, `.marquee`, `.btn-sheen`, `.pulse-ring`, `.draw-line` | ambient atmosphere |
| Header | transparent → blurred glass on scroll, with a gold reading-progress line |

Everything is disabled under `prefers-reduced-motion: reduce`. Content is visible without JavaScript; reveal pre-states are only applied after mount.

## Components

`components/ui`: `Button`/`ButtonLink` (gold · outline · ghost · danger), `Field`/`Input`/`Textarea`/`Select`/`Checkbox`, `SubmitButton`, `Badge`, `Notice`, `Card`, `Container`, `Label`, `SectionHeading`, `Seal`.

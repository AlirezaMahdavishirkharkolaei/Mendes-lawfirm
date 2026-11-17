# Design System — "The Citation Mark"

Status: **foundation implemented, approved for use.** This documents
what exists in code today. See `docs/PROJECT.md` for the brand
rationale.

## Source of truth

All raw design values live in **`src/styles/tokens.css`**. Nothing else
should hardcode a hex color, font stack, or the fluid type-scale
values — reference the token (directly in CSS, or via the Tailwind
utilities bridged in `src/app/globals.css`'s `@theme inline` block).

## Color

| Token (CSS) | Tailwind utility | Hex | Role |
|---|---|---|---|
| `--mendes-surface` | `bg-surface` | `#F1F0EA` | Primary background |
| `--mendes-surface-alt` | `bg-surface-alt` | `#E7E5DC` | Secondary background |
| `--mendes-ink` | `text-ink` | `#16181B` | Primary text |
| `--mendes-ink-muted` | `text-ink-muted` | `#5B5C56` | Secondary text |
| `--mendes-border` | `border-border` | `#D9D7CD` | Hairline border |
| `--mendes-accent` | `bg-accent` / `text-accent` / `border-accent` | `#1C3A2E` | Primary accent |
| `--mendes-accent-hover` | `bg-accent-hover` etc. | `#143025` | Accent hover/active |
| `--mendes-surface-dark` | `bg-surface-dark` | `#101312` | Dark surface (e.g. footer) |
| `--mendes-ink-dark` | `text-ink-dark` | `#F1F0EA` | Text on dark surface |
| `--mendes-accent-on-dark` | `text-accent-on-dark` | `#7FA08F` | Accent on dark surface |

No additional brand colors exist. Utility colors (error/success states)
may be added later but must stay visually subordinate — see the muted
red used for form validation in `Input`/`Textarea` as the only current
example.

## Typography

**Approved typefaces:** Fraunces (display), IBM Plex Sans
(heading/body/UI), IBM Plex Mono (technical/citation layer).

**Current state:** the licensed font files are not yet in the repo, so
`--font-display` / `--font-body` / `--font-mono` currently resolve to
system-font fallback stacks defined in `tokens.css`. This is intentional
and documented — see `src/assets/fonts/README.md` for exactly which
files are expected and where, and `src/lib/fonts.ts` for the
ready-to-uncomment `next/font/local` setup. Activating real fonts is a
drop-in — no component changes needed, because the CSS variable names
match what `next/font/local` generates.

**Do not add a runtime Google Fonts `<link>` or `next/font/google` call**
— that was explicitly reverted from the initial scaffold for this reason.

### Type scale

| Token | Tailwind utility | Value | Use |
|---|---|---|---|
| `--mendes-text-ui-sm` | `text-ui-sm` | 12px | Smallest UI/mono text |
| `--mendes-text-ui` | `text-ui` | 14px | UI text, nav |
| `--mendes-text-body` | `text-body` | 16px | Body copy |
| `--mendes-text-lead` | `text-lead` | 18px | Lead paragraphs |
| `--mendes-text-h3` | `text-h3` | 22px | H3 |
| `--mendes-text-h2` | `text-h2` | 28px | H2 |
| `--mendes-text-h1` | `text-h1` | `clamp(2rem, 1.6rem + 2vw, 2.5rem)` (~32–40px) | H1 |
| `--mendes-text-display` | `text-display` | `clamp(2.5rem, 1.1rem + 4.5vw, 4.5rem)` (~40–72px) | Hero/display statements |

Font-family utilities: `font-display` (Fraunces — hero statements, major
editorial statements, selected headings, pull quotes — not restricted to
the homepage), `font-body` (IBM Plex Sans — most headings, body, UI),
`font-mono` (IBM Plex Mono — the citation/technical layer described
below; never for large body paragraphs or major headings).

Tracking utilities: `tracking-display` (-0.02em), `tracking-heading`
(-0.01em), `tracking-mono` (0.08em, used uppercase for the mono layer).

## Spacing

The approved scale (4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192px) is
**not** duplicated as separate custom properties. Tailwind v4's default
spacing scale is already a dynamic 4px-based system
(`--spacing: 0.25rem`), so it lands exactly on every value in the
approved scale:

| px | Tailwind utility (e.g. padding) |
|---|---|
| 4 | `p-1` |
| 8 | `p-2` |
| 12 | `p-3` |
| 16 | `p-4` |
| 24 | `p-6` |
| 32 | `p-8` |
| 48 | `p-12` |
| 64 | `p-16` |
| 96 | `p-24` |
| 128 | `p-32` |
| 192 | `p-48` |

Use these (or `gap-*`, `m-*`, etc. at the same numbers) instead of
one-off pixel values or arbitrary-value utilities like `p-[17px]`.

## Layout

Tokens in `tokens.css`: `--mendes-width-structural` (1280px, structural
sections), `--mendes-width-reading` (720px, long-form reading columns),
`--mendes-gutter-desktop` (24px), `--mendes-margin-{desktop,tablet,mobile}`
(80/48/20px), `--mendes-section-space-desktop-{min,max}` (96–160px),
`--mendes-section-space-mobile` (64px). These aren't yet bridged into
Tailwind utilities (no page layout consumes them yet, per the Phase 1.1
scope restriction) — reference them directly via `var(--mendes-...)` or
Tailwind arbitrary values (e.g. `max-w-[var(--mendes-width-structural)]`)
when building actual pages.

Composition should default to **asymmetric** layouts (e.g. a 7/5 hero
split) rather than forcing every page into a centered symmetric layout.

## Motion

Tokens: `--mendes-duration-reveal` (450ms), `--mendes-duration-hover`
(175ms), `--mendes-stagger-step` (70ms), `--mendes-reveal-distance`
(12px), `--mendes-ease-editorial`. JS-side mirror in `src/lib/motion.ts`
(`motion` object + `staggerDelay()` + `prefersReducedMotion()`).

**Progressive enhancement is load-bearing, not decorative.** The
`Reveal` component (`src/components/ui/Reveal.tsx`) renders content
fully visible by default — no JS, no IntersectionObserver support, or a
`prefers-reduced-motion: reduce` preference all result in plain,
unanimated, fully visible content. Only when JS is available and the
user hasn't requested reduced motion does it opt into the
hidden-then-reveal-on-scroll sequence. The corresponding CSS
(`.reveal` / `[data-visible]` in `globals.css`) also has its own
`prefers-reduced-motion` block as a second line of defense.

No parallax, bounce, elastic easing, or carousels anywhere in the
system.

## Component primitives (`src/components/ui/`)

| Component | Notes |
|---|---|
| `Button` | `primary` (outlined rectangle, `rounded-button` ≈3px, accent border/text, solid accent fill on hover) and `secondary` (text + underline) variants. Renders `<a>` when given `href`. No pill shapes. |
| `Input` / `Textarea` | Signature-line treatment: always-visible mono label, bottom-border field, focus state, optional `error` with `aria-invalid`/`aria-describedby`. |
| `Divider` | Hairline rule, optionally paired with a `§ NN — Label` citation index — pass `index`/`label` only where content is genuinely enumerable (Practice Areas, Insights), not decoratively. |
| `Tag` | Bracketed mono text (`[Corporate & M&A]`), not a filled pill. |
| `SectionLabel` | Standalone mono eyebrow/kicker text. |
| `Breadcrumbs` | Mono, `/`-separated, correct `nav`/`aria-current` semantics. |
| `Metadata` | Em-dash-joined mono metadata row (date — read time — practice area). |
| `SkipLink` | Visually hidden until focused; wired into `layout.tsx`, targets `#main-content`. |
| `Reveal` | Motion wrapper — see Motion section above. |

Import from the barrel: `import { Button, Input, ... } from "@/components/ui"`.

## Global layout components (`src/components/layout/`)

| Component | Notes |
|---|---|
| `Header` | Sticky, `h-16 md:h-20`. Subtle border-only transition on scroll (no blur/shadow/glassmorphism). Desktop shows `Wordmark` + `Nav` + primary `Button` CTA; below `lg` (1024px), `MobileNav`'s trigger takes over. |
| `Wordmark` | Text-based (`font-display`), links to `/`. `onDark` prop for use on the footer's dark surface. A real logo can replace its internals later without changing `Header`/`Footer`. |
| `Nav` | Desktop nav — semantic `<nav aria-label="Primary">`, mono labels, `aria-current="page"` on the active item (accent color, not just weight). |
| `MobileNav` | Trigger (mono "Menu"/"Close" text, not an icon — deliberately avoids the generic hamburger pattern) + full-screen panel. `aria-expanded`/`aria-controls` on the trigger; panel is `role="dialog" aria-modal="true"`, gets a Tab focus trap, closes and returns focus on `Escape`, locks `document.body` scroll while open. |
| `Footer` | Dark surface (`bg-surface-dark`). Brand blurb, primary nav, placeholder Practice Area links (reuses `src/content/practice-areas.ts`, doesn't invent separate copy), clearly-labeled placeholder contact block, legal links, and a dynamic `new Date().getFullYear()` copyright line. |
| `PageContainer` | Structural max-width (`--mendes-width-structural`) + responsive horizontal margins (20/48/80px via Tailwind's `px-5 md:px-12 lg:px-20`, matching the tokens). |
| `SectionContainer` | Vertical rhythm wrapper (`py-16 md:py-24 lg:py-32`, within the approved 96–160px desktop range), renders as `<section>` by default. |
| `ReadingContainer` | Long-form width (`--mendes-width-reading`, 720px) for article/body copy. |

Shared nav data (`primaryNav`, `consultationCta`, `footerLegalLinks`) lives in
`src/lib/navigation.ts` so `Header`, `Nav`, `MobileNav`, and `Footer` never
duplicate the link list.

`(marketing)/layout.tsx` composes `Header` + the `#main-content` `<main>`
landmark + `Footer` once, so every route under the group gets them
automatically — individual pages (like the current placeholder `Home`)
never render their own header/footer.

## Accessibility baseline implemented in the foundation

- Global `:focus-visible` style (2px accent outline, 2px offset) in
  `globals.css` — never removed without replacement.
- `SkipLink` + `#main-content` landmark wired into the root layout (the
  landmark itself now lives in `(marketing)/layout.tsx`).
- `Input`/`Textarea` always render a real, visible `<label>`.
- `Breadcrumbs` uses `<nav aria-label="Breadcrumb">`, an ordered list,
  and `aria-current="page"` on the current item.
- `Nav` uses `<nav aria-label="Primary">` and `aria-current="page"`.
- `MobileNav`'s panel is a proper `role="dialog" aria-modal="true"` with
  a focus trap, `Escape`-to-close with focus return to the trigger, and
  body scroll lock while open — and its trigger correctly toggles
  `aria-expanded`/`aria-label`.
- `Reveal`'s progressive-enhancement contract (see Motion) and the CSS
  `prefers-reduced-motion` block.
- No component here relies on color alone to convey state (e.g. focus
  also changes border weight, not just color; nav active state uses
  both `aria-current` and color).

This is a baseline, not a complete audit — re-verify accessibility as
each real page is built on top of these primitives.

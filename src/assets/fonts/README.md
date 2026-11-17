# Font assets

This directory is where licensed, self-hosted font files must be placed
before `src/lib/fonts.ts` is wired into the app. No font files exist here
yet — this task deliberately does not fetch or invent any, per the
project's instruction not to add unverified font files.

## Expected files

```
src/assets/fonts/
├── fraunces/
│   └── Fraunces-Variable.woff2
├── ibm-plex-sans/
│   ├── IBMPlexSans-Regular.woff2
│   ├── IBMPlexSans-Medium.woff2
│   └── IBMPlexSans-SemiBold.woff2
└── ibm-plex-mono/
    ├── IBMPlexMono-Regular.woff2
    └── IBMPlexMono-Medium.woff2
```

Both Fraunces and IBM Plex are open source under the SIL Open Font
License. Source them from their official repositories (or a trusted
distributor such as Google Fonts' own hosting) rather than an arbitrary
third-party download, and keep the license file alongside them or in a
top-level `LICENSES/` folder per the license's redistribution terms.

## Activation

Once the files above exist:

1. Open `src/lib/fonts.ts` and uncomment the `next/font/local`
   declarations (`displayFont`, `bodyFont`, `monoFont`).
2. Import them into `src/app/layout.tsx` and add their `.variable`
   classes to the `<html>` element's `className`.
3. Nothing else changes — `globals.css` already reads font families
   through the `--font-display` / `--font-body` / `--font-mono` custom
   properties (see `src/styles/tokens.css`), and `next/font/local`
   generates those exact variable names, so its output overrides the
   system-font fallback automatically via normal CSS cascade rules.

Until this is done, the site renders with system-font fallbacks — never
a runtime Google Fonts request — so nothing is broken by the fonts not
being present yet.

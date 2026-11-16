# Deployment

The site is a **static export** (`output: "export"` in `next.config.ts`):
`npm run build` writes plain HTML, CSS and JS to `out/`, which any static
host can serve. No server, database or paid service is needed.

## GitHub Pages (current)

`.github/workflows/pages.yml` builds `main` with
`NEXT_PUBLIC_BASE_PATH=/<repository name>` and publishes `out/`.
GitHub Pages must be switched on once in the repository settings
(Settings → Pages → Source: **GitHub Actions**).

## Own domain / Vercel / Netlify

Build without a base path (`npm run build`) and serve `out/`. On Vercel,
set the output directory to `out`. Update `siteUrl` in
`src/content/firm.ts` so canonical links, hreflang and the sitemap use
the new address.

## Later phases

When a feature needs a server (e.g. sending the consultation request
from the server, a client portal), remove `output: "export"` and deploy
to a Node-capable host. The content layer and pages do not change.

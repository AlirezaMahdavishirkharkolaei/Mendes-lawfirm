import { bindings, defineConfig, defineWorker, triggers } from "cf/config";
import { createWorkersCacheConfig } from "@vinext/cloudflare/cache/config";

const cache = await createWorkersCacheConfig();

/**
 * Mendes platform — Cloudflare Worker definition.
 *
 * Everything the app needs at runtime is declared here: the D1 database,
 * the R2 bucket for case documents and article attachments, outbound
 * email, cron triggers and the secrets the app reads. Values that change
 * per deployment (recipient addresses, AI model) are editable later from
 * the admin panel; the text bindings below are only first-run defaults.
 */
export default defineConfig({
  worker: defineWorker({
    ...cache,
    name: "mendes",
    // Custom entry: hands HTTP traffic to vinext and adds the cron
    // (`scheduled`) and inbound-mail (`email`) handlers.
    entrypoint: "./worker/index.ts",
    compatibilityDate: "2026-11-17",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    triggers: [
      // 06:00 UTC on the 1st of every month — monthly outreach report.
      triggers.scheduled({ schedule: "0 6 1 * *" }),
      // 07:00 UTC daily — AI drafts outreach emails / replies for review.
      triggers.scheduled({ schedule: "0 7 * * *" }),
    ],
    observability: { enabled: true },
    env: {
      ...cache.env,
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),

      // Bound by ID: the database "mendes-db" already exists on the account,
      // and the deploy aborts if the local binding differs from the remote one.
      DB: bindings.d1({ id: "5c6beb27-17a4-493d-969b-289273e4b7b4" }),
      // Optional: enable R2 on the account and uncomment for larger uploads.
      // FILES: bindings.r2({ name: "mendes-files" }),
      EMAIL: bindings.sendEmail(),

      // First-run defaults (overridable in Admin → Settings).
      // Public origin, used in e-mail links and metadata. Change it when a custom domain is added.
      SITE_URL: bindings.text("https://mendes.lawyer-alirezamahdavi.workers.dev"),
      MAIL_FROM: bindings.text("no-reply@mendes.law"),
      AI_PROVIDER: bindings.text("gemini"),
      AI_MODEL: bindings.text("gemini-2.5-flash"),

      // Secrets are NOT declared here so a deploy never blocks on them.
      // Set them after the first deploy in the dashboard (Settings →
      // Variables and Secrets) or with `cf workers secrets put`:
      //   ADMIN_SETUP_TOKEN — needed once, to create the first admin
      //   GEMINI_API_KEY    — enables the AI features
      //   AUTH_SECRET       — optional; one is generated and stored in D1 if unset
    },
  }),
});

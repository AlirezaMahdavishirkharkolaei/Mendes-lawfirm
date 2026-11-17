/**
 * Worker entry point.
 *
 * - fetch:     every HTTP request is handled by vinext (the Next.js app).
 * - scheduled: cron triggers declared in cloudflare.config.ts.
 *     "0 6 1 * *" → monthly outreach report to the partners
 *     "0 7 * * *" → AI drafts outreach e-mails/replies for human approval,
 *                   and fills in missing Cyprus-law explanations
 * - email:     inbound replies from prospects (enable Email Routing for the
 *              outreach reply address and point it at this Worker).
 */
import handler from "vinext/server/fetch-handler";
import PostalMime from "postal-mime";
import { buildAndSendMonthlyReport } from "../src/lib/data/reports";
import { dailyAutodraft, recordInbound } from "../src/lib/data/outreach";
import { generateMissingLaws } from "../src/lib/data/laws";
import { getSetting } from "../src/lib/settings";

export default {
  fetch: handler.fetch,

  async scheduled(controller: ScheduledController, _env: Env, ctx: ExecutionContext) {
    if (controller.cron === "0 6 1 * *") {
      ctx.waitUntil(
        buildAndSendMonthlyReport(new Date(controller.scheduledTime)).then((r) => console.log("monthly report", r)),
      );
      return;
    }
    ctx.waitUntil(
      (async () => {
        const drafts = await dailyAutodraft();
        const laws = (await getSetting("laws_autogenerate", "1")) === "1" ? await generateMissingLaws(6) : 0;
        console.log("daily job", { drafts, laws });
      })(),
    );
  },

  async email(message: ForwardableEmailMessage) {
    const raw = await new Response(message.raw).arrayBuffer();
    const parsed = await PostalMime.parse(raw);
    const from = (parsed.from?.address ?? message.from).toLowerCase();
    const body = parsed.text ?? (parsed.html ?? "").replace(/<[^>]+>/g, " ");
    const matched = await recordInbound(from, parsed.subject ?? "(no subject)", body);
    if (!matched) {
      const forward = await getSetting("outreach_reply_to", "");
      if (forward) await message.forward(forward).catch((e) => console.error("forward failed", e));
    }
  },
} satisfies ExportedHandler<Env>;

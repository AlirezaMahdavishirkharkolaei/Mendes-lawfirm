import { z } from "zod";
import { chat } from "@/lib/ai/chat";
import { asLocale } from "@/lib/i18n/config";
import { clientIp, sameOrigin } from "@/lib/http";
import { hashIp } from "@/lib/security/crypto";
import { rateLimit } from "@/lib/security/rate-limit";
import { getSettings } from "@/lib/settings";

const body = z.object({
  sessionId: z.string().uuid().nullable().optional(),
  message: z.string().trim().min(1).max(2000),
  locale: z.string(),
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "forbidden" }, { status: 403 });
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });

  const settings = await getSettings();
  if (settings.chatbot_enabled === "0") return Response.json({ error: "disabled" }, { status: 503 });

  const ip = (await hashIp(await clientIp())) ?? "anon";
  if (!(await rateLimit(`chat:${ip}`, 40, 3600))) return Response.json({ error: "rate" }, { status: 429 });

  const result = await chat({
    sessionId: parsed.data.sessionId,
    message: parsed.data.message,
    locale: asLocale(parsed.data.locale),
    firm: settings.firm_name || "Mendes Law & Consultancy",
  });
  return Response.json(result, { headers: { "cache-control": "no-store" } });
}

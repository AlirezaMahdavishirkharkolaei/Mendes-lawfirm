import { verifyPayload } from "@/lib/security/crypto";
import { suppress } from "@/lib/data/outreach";

/** RFC 8058 one-click unsubscribe (mail clients POST here). */
export async function POST(request: Request) {
  const t = new URL(request.url).searchParams.get("t") ?? "";
  const payload = await verifyPayload<{ e: string; p: string }>(t);
  if (payload?.p === "unsub" && payload.e) await suppress(payload.e, "one-click");
  return new Response("Unsubscribed", { status: 200 });
}

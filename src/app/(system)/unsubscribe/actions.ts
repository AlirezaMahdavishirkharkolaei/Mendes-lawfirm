"use server";

import { redirect } from "next/navigation";
import { verifyPayload } from "@/lib/security/crypto";
import { suppress } from "@/lib/data/outreach";

export async function unsubscribe(form: FormData) {
  const payload = await verifyPayload<{ e: string; p: string }>(String(form.get("t") ?? ""));
  if (payload?.p === "unsub" && payload.e) await suppress(payload.e, "unsubscribe link");
  redirect("/unsubscribe?done=1");
}

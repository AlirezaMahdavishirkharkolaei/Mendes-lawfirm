"use server";

import { redirect } from "next/navigation";
import { verifyPayload } from "@/lib/security/crypto";
import { decideBooking } from "@/lib/data/bookings";

export async function decideFromEmail(form: FormData) {
  const token = String(form.get("t") ?? "");
  const decision = form.get("decision") === "approve" ? "approve" : "reject";
  const note = String(form.get("note") ?? "").slice(0, 1000);
  const payload = await verifyPayload<{ b: string; p: string }>(token);
  if (!payload || payload.p !== "booking") redirect("/booking/decision?invalid=1");
  const result = await decideBooking(payload.b, decision, "managing-partner (email link)", note);
  redirect(`/booking/decision?t=${encodeURIComponent(token)}&done=${result.ok ? decision : "already"}`);
}

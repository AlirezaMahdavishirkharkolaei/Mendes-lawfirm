"use server";

import { redirect } from "next/navigation";
import { asLocale } from "@/lib/i18n/config";
import { cancelByClient } from "@/lib/data/bookings";

export async function cancelMeeting(form: FormData) {
  const locale = asLocale(form.get("locale"));
  const token = String(form.get("t") ?? "");
  const result = await cancelByClient(token);
  const then = form.get("then") === "rebook" && result.booking ? `/${locale}/booking?topic=${encodeURIComponent(result.booking.topic)}` : null;
  redirect(then ?? `/${locale}/booking/manage?t=${encodeURIComponent(token)}&done=1`);
}

"use server";

import { bookingInput, createBooking } from "@/lib/data/bookings";
import { currentUser } from "@/lib/auth";
import { clientIp } from "@/lib/http";
import { hashIp } from "@/lib/security/crypto";
import { rateLimit } from "@/lib/security/rate-limit";

export type BookingState = { ok?: boolean; email?: string; error?: "slot" | "invalid" | "rate" | "fields" };

export async function requestBooking(_: BookingState, form: FormData): Promise<BookingState> {
  // Honeypot: real users never fill this hidden field.
  if (String(form.get("website") ?? "")) return { ok: true, email: "" };
  const parsed = bookingInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "fields" };
  const ip = await hashIp(await clientIp());
  if (!(await rateLimit(`booking:${ip ?? parsed.data.email}`, 5, 3600))) return { error: "rate" };
  const user = await currentUser();
  const result = await createBooking(parsed.data, { userId: user?.id ?? null, ipHash: ip });
  if (!result.ok) return { error: result.error };
  return { ok: true, email: parsed.data.email };
}

import "server-only";
import { z } from "zod";
import { all, db, now, uuid } from "@/lib/db";
import { siteUrl } from "@/lib/env";
import { asLocale, type Locale } from "@/lib/i18n/config";
import { emailList, getSettings, audit } from "@/lib/settings";
import { signPayload, verifyPayload } from "@/lib/security/crypto";
import { meetingIcs } from "@/lib/ics";
import { sendMail } from "@/lib/email/send";
import { bookingCancelledToBoss, bookingDecision, bookingReceived, bookingReminder, bookingRequestToBoss, type BookingExtras, type BookingLike } from "@/lib/email/templates";
import { addDays, dayInZone, isoWeekday, zonedToUtc } from "@/lib/time";
import { TOPIC_KEYS } from "@/lib/topics";

export interface Booking extends BookingLike {
  status: "pending" | "approved" | "rejected" | "cancelled";
  decided_by: string | null;
  decided_at: string | null;
  reminder_sent_at: string | null;
  client_tz: string | null;
  user_id: string | null;
  created_at: string;
}

export interface BookingConfig {
  days: number[];
  start: string;
  end: string;
  slotMinutes: number;
  timeZone: string;
  horizonDays: number;
}

export async function bookingConfig(): Promise<BookingConfig> {
  const s = await getSettings();
  return {
    days: (s.booking_days || "1,2,3,4,5").split(",").map(Number).filter((n) => n >= 1 && n <= 7),
    start: s.booking_start || "09:00",
    end: s.booking_end || "17:00",
    slotMinutes: Math.min(180, Math.max(15, Number(s.booking_slot_minutes) || 45)),
    timeZone: s.booking_timezone || "Asia/Famagusta",
    horizonDays: Math.min(90, Math.max(3, Number(s.booking_horizon_days) || 30)),
  };
}

export interface DayAvailability {
  day: string;
  slots: { start: string; free: boolean }[];
}

const MIN_LEAD_MS = 2 * 3600_000;

function slotsForDay(day: string, cfg: BookingConfig): Date[] {
  if (!cfg.days.includes(isoWeekday(day))) return [];
  const out: Date[] = [];
  const start = zonedToUtc(day, cfg.start, cfg.timeZone).getTime();
  const end = zonedToUtc(day, cfg.end, cfg.timeZone).getTime();
  for (let t = start; t + cfg.slotMinutes * 60000 <= end; t += cfg.slotMinutes * 60000) out.push(new Date(t));
  return out;
}

export async function availability(): Promise<{ config: BookingConfig; days: DayAvailability[] }> {
  const cfg = await bookingConfig();
  const database = await db();
  const today = dayInZone(new Date(), cfg.timeZone);
  const until = zonedToUtc(addDays(today, cfg.horizonDays + 1), "00:00", cfg.timeZone).toISOString();
  const taken = await all<{ slot_start: string; duration_min: number }>(
    database
      .prepare("SELECT slot_start, duration_min FROM bookings WHERE status IN ('pending','approved') AND slot_start >= ? AND slot_start < ?")
      .bind(new Date(Date.now() - 86400_000).toISOString(), until),
  );
  const blocked = taken.map((b) => ({ s: Date.parse(b.slot_start), e: Date.parse(b.slot_start) + b.duration_min * 60000 }));
  const earliest = Date.now() + MIN_LEAD_MS;

  const days: DayAvailability[] = [];
  for (let i = 0; i <= cfg.horizonDays; i++) {
    const day = addDays(today, i);
    const slots = slotsForDay(day, cfg)
      .filter((d) => d.getTime() >= earliest)
      .map((d) => {
        const s = d.getTime();
        const e = s + cfg.slotMinutes * 60000;
        return { start: d.toISOString(), free: !blocked.some((b) => s < b.e && e > b.s) };
      });
    if (slots.length) days.push({ day, slots });
  }
  return { config: cfg, days };
}

export const bookingInput = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  topic: z.enum(TOPIC_KEYS as [string, ...string[]]),
  message: z.string().trim().min(10).max(4000),
  slot: z.string().datetime(),
  mode: z.enum(["online", "office"]),
  locale: z.string(),
  consent: z.literal("on"),
  client_tz: z.string().max(64).optional(),
});

export type BookingInput = z.infer<typeof bookingInput>;

export async function getBooking(id: string): Promise<Booking | null> {
  const database = await db();
  return database.prepare("SELECT * FROM bookings WHERE id = ?").bind(id).first<Booking>();
}

async function decisionLinks(id: string) {
  const token = await signPayload({ b: id, p: "booking" }, 14 * 86400);
  const base = (await siteUrl());
  return {
    approve: `${base}/booking/decision?t=${encodeURIComponent(token)}&a=approve`,
    reject: `${base}/booking/decision?t=${encodeURIComponent(token)}&a=reject`,
    admin: `${base}/admin/bookings`,
  };
}

function validTz(tz: string | undefined): string | null {
  if (!tz) return null;
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return tz;
  } catch {
    return null;
  }
}

/** Signed link that lets the client cancel or move their own meeting (no login). */
export async function manageUrl(b: Pick<Booking, "id" | "locale">): Promise<string> {
  const token = await signPayload({ b: b.id, p: "manage" }, 120 * 86400);
  return `${await siteUrl()}/${asLocale(b.locale)}/booking/manage?t=${encodeURIComponent(token)}`;
}

export async function bookingFromManageToken(token: string): Promise<Booking | null> {
  const payload = await verifyPayload<{ b: string; p: string }>(token);
  if (!payload || payload.p !== "manage") return null;
  return getBooking(payload.b);
}

async function extrasFor(b: Booking, settings: Record<string, string>): Promise<BookingExtras> {
  return { manageUrl: await manageUrl(b), meetingLink: settings.meeting_link || undefined, clientTz: b.client_tz };
}

function invite(b: Booking, settings: Record<string, string>, cancelled = false) {
  const firm = settings.firm_name || "Mendes";
  const online = b.meeting_mode !== "office";
  return {
    filename: cancelled ? "mendes-meeting-cancelled.ics" : "mendes-meeting.ics",
    contentType: "text/calendar; charset=utf-8",
    content: meetingIcs({
      uid: b.id,
      start: new Date(b.slot_start),
      minutes: b.duration_min,
      title: `${firm} — consultation`,
      description: online && settings.meeting_link ? `Video link: ${settings.meeting_link}` : `${firm}, ${settings.office_address || "Girne, North Cyprus"}`,
      location: online ? settings.meeting_link || "Online" : settings.office_address || "Girne, North Cyprus",
      organizerEmail: emailList(settings.office_email || settings.boss_email)[0],
      organizerName: firm,
      cancelled,
    }),
  };
}

export type CreateBookingResult = { ok: true; booking: Booking } | { ok: false; error: "slot" | "invalid" };

export async function createBooking(input: BookingInput, extra: { userId?: string | null; ipHash?: string | null }): Promise<CreateBookingResult> {
  const cfg = await bookingConfig();
  const start = new Date(input.slot);
  const day = dayInZone(start, cfg.timeZone);
  const valid = slotsForDay(day, cfg).some((d) => d.getTime() === start.getTime()) && start.getTime() >= Date.now() + MIN_LEAD_MS;
  if (!valid) return { ok: false, error: "invalid" };

  const database = await db();
  const s = start.toISOString();
  const e = new Date(start.getTime() + cfg.slotMinutes * 60000).toISOString();
  const clash = await database
    .prepare(
      `SELECT 1 FROM bookings WHERE status IN ('pending','approved')
       AND slot_start < ? AND datetime(slot_start, '+' || duration_min || ' minutes') > datetime(?) LIMIT 1`,
    )
    .bind(e, s)
    .first();
  if (clash) return { ok: false, error: "slot" };

  const id = uuid();
  const locale = asLocale(input.locale);
  await database
    .prepare(
      `INSERT INTO bookings (id, name, email, phone, company, topic, message, slot_start, duration_min, meeting_mode, locale, status, user_id, created_at, ip_hash, client_tz)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
    )
    .bind(id, input.name, input.email, input.phone || null, input.company || null, input.topic, input.message, s, cfg.slotMinutes, input.mode, locale, extra.userId ?? null, now(), extra.ipHash ?? null, validTz(input.client_tz))
    .run();
  const booking = (await getBooking(id))!;

  const settings = await getSettings();
  const firm = settings.firm_name || "Mendes";
  const boss = emailList(settings.boss_email);
  if (boss.length) {
    const m = bookingRequestToBoss(booking, await decisionLinks(id), firm);
    await sendMail({ to: boss, ...m });
  } else {
    console.warn("booking created but boss_email is not configured (Admin → Settings)");
  }
  await sendMail({ to: booking.email, ...bookingReceived(booking, locale, firm, await extrasFor(booking, settings)) });
  await audit(input.email, "booking.created", "booking", id, { slot: s, topic: input.topic });
  return { ok: true, booking };
}

export async function decideBooking(
  id: string,
  decision: "approve" | "reject",
  actor: string,
  note?: string | null,
): Promise<{ ok: boolean; booking: Booking | null; already?: boolean }> {
  const database = await db();
  const booking = await getBooking(id);
  if (!booking) return { ok: false, booking: null };
  if (booking.status !== "pending") return { ok: false, booking, already: true };

  const status = decision === "approve" ? "approved" : "rejected";
  const res = await database
    .prepare("UPDATE bookings SET status = ?, decision_note = ?, decided_by = ?, decided_at = ? WHERE id = ? AND status = 'pending'")
    .bind(status, note?.trim() || null, actor, now(), id)
    .run();
  if (!res.meta.changes) return { ok: false, booking, already: true };

  const updated = (await getBooking(id))!;
  const locale = asLocale(updated.locale) as Locale;
  const settings = await getSettings();
  const rebook = `${(await siteUrl())}/${locale}/booking?topic=${encodeURIComponent(updated.topic)}`;
  const approved = status === "approved";
  await sendMail({
    to: updated.email,
    ...bookingDecision(updated, locale, approved, rebook, settings.firm_name || "Mendes", await extrasFor(updated, settings)),
    ...(approved ? { attachments: [invite(updated, settings)] } : {}),
  });
  await audit(actor, `booking.${status}`, "booking", id, { note: note ?? null });
  return { ok: true, booking: updated };
}

export async function listBookings(filter?: { status?: string; email?: string; limit?: number }): Promise<Booking[]> {
  const database = await db();
  const where: string[] = [];
  const binds: unknown[] = [];
  if (filter?.status) {
    where.push("status = ?");
    binds.push(filter.status);
  }
  if (filter?.email) {
    where.push("email = ?");
    binds.push(filter.email);
  }
  return all<Booking>(
    database
      .prepare(`SELECT * FROM bookings ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY slot_start DESC LIMIT ?`)
      .bind(...binds, filter?.limit ?? 200),
  );
}

/** Client cancels their own meeting from the signed link in their e-mail. */
export async function cancelByClient(token: string): Promise<{ ok: boolean; booking: Booking | null }> {
  const booking = await bookingFromManageToken(token);
  if (!booking) return { ok: false, booking: null };
  if (booking.status === "cancelled" || booking.status === "rejected") return { ok: true, booking };
  const database = await db();
  await database
    .prepare("UPDATE bookings SET status = 'cancelled', decided_by = 'client', decided_at = ? WHERE id = ?")
    .bind(now(), booking.id)
    .run();
  const settings = await getSettings();
  const boss = emailList(settings.boss_email);
  if (boss.length) {
    await sendMail({ to: boss, ...bookingCancelledToBoss(booking, settings.firm_name || "Mendes"), attachments: booking.status === "approved" ? [invite(booking, settings, true)] : undefined });
  }
  await audit(booking.email, "booking.cancelled_by_client", "booking", booking.id);
  return { ok: true, booking: (await getBooking(booking.id))! };
}

/** Daily job: remind clients of approved meetings in the next ~30 hours. */
export async function sendReminders(): Promise<number> {
  const database = await db();
  const due = await all<Booking>(
    database
      .prepare("SELECT * FROM bookings WHERE status = 'approved' AND reminder_sent_at IS NULL AND slot_start > ? AND slot_start <= ?")
      .bind(new Date().toISOString(), new Date(Date.now() + 30 * 3600_000).toISOString()),
  );
  if (!due.length) return 0;
  const settings = await getSettings();
  let sent = 0;
  for (const b of due) {
    const r = await sendMail({ to: b.email, ...bookingReminder(b, asLocale(b.locale), settings.firm_name || "Mendes", await extrasFor(b, settings)) });
    if (r.ok) {
      await database.prepare("UPDATE bookings SET reminder_sent_at = ? WHERE id = ?").bind(now(), b.id).run();
      sent++;
    }
  }
  return sent;
}

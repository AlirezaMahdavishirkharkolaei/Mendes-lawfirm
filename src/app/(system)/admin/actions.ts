"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { forgetAll } from "@/lib/memo";
import { z } from "zod";
import {
  checkCredentials,
  createUser,
  currentUser,
  endSession,
  getUserByEmail,
  issueUserToken,
  randomPassword,
  setPassword,
  startSession,
  type Role,
  type User,
} from "@/lib/auth";
import { db, now, uuid } from "@/lib/db";
import { optional, siteUrl } from "@/lib/env";
import { asLocale, locales, isLocale, type Locale } from "@/lib/i18n/config";
import { EDITABLE_KEYS } from "@/lib/i18n";
import { audit, getSettings, setSettings } from "@/lib/settings";
import { safeEqual } from "@/lib/security/crypto";
import { rateLimit } from "@/lib/security/rate-limit";
import { clientIp } from "@/lib/http";
import { sendMail } from "@/lib/email/send";
import { accountLink } from "@/lib/email/templates";
import { decideBooking } from "@/lib/data/bookings";
import { addCaseEvent, createCase, updateCase, CASE_STATUSES } from "@/lib/data/cases";
import { reviewArticle, updateArticleContent, type ArticleStatus } from "@/lib/data/articles";
import { generateLawExplanation, generateMissingLaws, getLaw, saveLawLocale } from "@/lib/data/laws";
import { addProspect, approveAndSend, createDraft, dailyAutodraft, discardDraft, parseProspectCsv, recordInbound, INTERESTS } from "@/lib/data/outreach";
import { buildAndSendMonthlyReport } from "@/lib/data/reports";
import { generate, generateDetailed, AiUnavailable } from "@/lib/ai/provider";
import { TOPIC_KEYS } from "@/lib/topics";
import { slugify } from "@/lib/auth";

/** Revalidates pages and drops this isolate's cached reads so edits show at once. */
function refresh(...paths: string[]) {
  forgetAll();
  for (const path of paths) revalidatePath(path);
  // Public pages are edge-cached for a few minutes; an admin edit refreshes them all.
  revalidatePath("/", "layout");
}

export type AdminState = { ok?: boolean; error?: string; message?: string };

async function guard(roles: Role[] = ["admin"]): Promise<User> {
  const user = await currentUser();
  if (!user || !roles.includes(user.role)) redirect("/admin/login");
  return user;
}

const str = (f: FormData, k: string, max = 2000) => String(f.get(k) ?? "").trim().slice(0, max);
const done = (path: string, message = "Saved"): AdminState => {
  refresh(path);
  return { ok: true, message };
};

// ── Auth ──────────────────────────────────────────────────────────────

export async function adminLogin(_: AdminState, form: FormData): Promise<AdminState> {
  const email = str(form, "email", 200).toLowerCase();
  const ip = (await clientIp()) ?? "anon";
  if (!(await rateLimit(`admin-login:${ip}`, 8, 900))) return { error: "Too many attempts. Try again in 15 minutes." };
  const user = await checkCredentials(email, String(form.get("password") ?? ""));
  if (!user || !["admin", "lawyer"].includes(user.role)) {
    await audit(email, "admin.login_failed");
    return { error: "Incorrect e-mail or password, or no staff access." };
  }
  await startSession(user.id);
  await audit(user.email, "admin.login");
  redirect("/admin");
}

export async function setAdminLang(form: FormData) {
  await guard(["admin", "lawyer"]);
  const { cookies } = await import("next/headers");
  (await cookies()).set("mendes_admin_lang", form.get("lang") === "tr" ? "tr" : "en", { path: "/", maxAge: 31536000, sameSite: "lax", secure: true, httpOnly: true });
  forgetAll();
  revalidatePath("/admin", "layout");
}

export async function adminLogout() {
  await endSession();
  redirect("/admin/login");
}

/** First-run: create the first admin, protected by ADMIN_SETUP_TOKEN. */
export async function setupAdmin(_: AdminState, form: FormData): Promise<AdminState> {
  if (!(await rateLimit(`setup:${await clientIp()}`, 10, 3600))) return { error: "Too many attempts. Wait an hour and try again." };
  // Trim both sides: a stray space or newline pasted into the dashboard is a common cause of "invalid token".
  const expected = (optional("ADMIN_SETUP_TOKEN") ?? "").trim();
  if (!expected) return { error: "ADMIN_SETUP_TOKEN is not set yet. Add it in Cloudflare → mendes → Settings → Variables and Secrets, then try again." };
  if (!safeEqual(str(form, "token", 300).trim(), expected)) return { error: "Invalid setup token. It must match the ADMIN_SETUP_TOKEN secret exactly, including capital letters." };
  const parsed = z
    .object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(12) })
    .safeParse({ name: str(form, "name"), email: str(form, "email").toLowerCase(), password: String(form.get("password") ?? "") });
  if (!parsed.success) return { error: "Name, valid e-mail and a password of at least 12 characters are required." };

  const database = await db();
  const hasAdmin = !!(await database.prepare("SELECT 1 FROM users WHERE role = 'admin' LIMIT 1").first());
  const existing = await getUserByEmail(parsed.data.email);
  let userId: string;
  if (existing) {
    // Same token also recovers access: resets the password of an existing admin
    // (or promotes the account when no admin exists yet).
    if (existing.role !== "admin" && hasAdmin) return { error: "An admin already exists. Enter that admin's e-mail to reset its password." };
    await setPassword(existing.id, parsed.data.password);
    await database.prepare("UPDATE users SET role = 'admin', name = ?, is_active = 1 WHERE id = ?").bind(parsed.data.name, existing.id).run();
    userId = existing.id;
    await audit(existing.email, hasAdmin ? "admin.password_reset" : "admin.setup");
  } else {
    if (hasAdmin) return { error: "An admin already exists. Enter that admin's e-mail to reset its password." };
    const user = await createUser({ ...parsed.data, role: "admin" });
    userId = user.id;
    await audit(user.email, "admin.setup");
  }
  await startSession(userId);
  redirect("/admin");
}

// ── Bookings ──────────────────────────────────────────────────────────

export async function decideBookingAdmin(form: FormData) {
  const user = await guard(["admin", "lawyer"]);
  await decideBooking(str(form, "id"), form.get("decision") === "approve" ? "approve" : "reject", user.email, str(form, "note", 1000));
  refresh("/admin/bookings");
  refresh("/admin");
}

export async function cancelBooking(form: FormData) {
  const user = await guard(["admin", "lawyer"]);
  const database = await db();
  await database.prepare("UPDATE bookings SET status = 'cancelled', decided_by = ?, decided_at = ? WHERE id = ?").bind(user.email, now(), str(form, "id")).run();
  await audit(user.email, "booking.cancelled", "booking", str(form, "id"));
  refresh("/admin/bookings");
}

// ── Users ─────────────────────────────────────────────────────────────

async function invite(userId: string, email: string, locale: Locale) {
  const token = await issueUserToken(userId, "invite", 7 * 24);
  const settings = await getSettings();
  const url = `${(await siteUrl())}/${locale}/portal/reset?t=${encodeURIComponent(token)}`;
  return sendMail({ to: email, ...accountLink(locale, "invite", url, settings.firm_name || "Mendes") });
}

export async function createUserAdmin(_: AdminState, form: FormData): Promise<AdminState> {
  const actor = await guard(["admin", "lawyer"]);
  const role = str(form, "role") as Role;
  if (!["client", "lawyer", "admin", "author"].includes(role)) return { error: "Invalid role" };
  if (actor.role !== "admin" && role !== "client") return { error: "Lawyers can only create client accounts." };
  const email = str(form, "email", 200).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Invalid e-mail" };
  if (await getUserByEmail(email)) return { error: "A user with this e-mail already exists." };
  const locale = asLocale(form.get("locale"));
  const user = await createUser({ email, name: str(form, "name", 120), password: randomPassword(), role, phone: str(form, "phone", 40) || null, locale });
  const sent = await invite(user.id, user.email, locale);
  await audit(actor.email, "user.created", "user", user.id, { role });
  return done("/admin/users", sent.ok ? `Account created — invitation e-mailed to ${email}.` : `Account created, but the invitation e-mail failed (${sent.error}).`);
}

export async function updateUserAdmin(form: FormData) {
  const actor = await guard();
  const id = str(form, "id");
  const database = await db();
  const role = str(form, "role");
  const active = form.get("is_active") === "on" ? 1 : 0;
  if (id === actor.id && (role !== "admin" || !active)) return; // can't demote/lock yourself out
  if (["client", "lawyer", "admin", "author"].includes(role)) {
    await database.prepare("UPDATE users SET role = ?, is_active = ? WHERE id = ?").bind(role, active, id).run();
    if (!active) await database.prepare("DELETE FROM sessions WHERE user_id = ?").bind(id).run();
    await audit(actor.email, "user.updated", "user", id, { role, active });
  }
  refresh("/admin/users");
}

export async function resendInvite(form: FormData) {
  const actor = await guard(["admin", "lawyer"]);
  const database = await db();
  const u = await database.prepare("SELECT id, email, locale FROM users WHERE id = ?").bind(str(form, "id")).first<{ id: string; email: string; locale: string }>();
  if (u) {
    await invite(u.id, u.email, asLocale(u.locale));
    await audit(actor.email, "user.invite_resent", "user", u.id);
  }
  refresh("/admin/users");
}

// ── Cases ─────────────────────────────────────────────────────────────

export async function createCaseAdmin(_: AdminState, form: FormData): Promise<AdminState> {
  const actor = await guard(["admin", "lawyer"]);
  let clientId = str(form, "client_id");
  const newEmail = str(form, "client_email", 200).toLowerCase();
  if (!clientId && newEmail) {
    const existing = await getUserByEmail(newEmail);
    if (existing) clientId = existing.id;
    else {
      const locale = asLocale(form.get("client_locale"));
      const u = await createUser({ email: newEmail, name: str(form, "client_name", 120) || newEmail, password: randomPassword(), role: "client", locale });
      await invite(u.id, u.email, locale);
      clientId = u.id;
    }
  }
  const title = str(form, "title", 200);
  if (!clientId || !title) return { error: "Choose a client (or enter a new client's e-mail) and a title." };
  const id = await createCase({
    title,
    description: str(form, "description", 5000) || null,
    clientId,
    lawyerId: str(form, "lawyer_id") || (actor.role === "lawyer" ? actor.id : null),
    practiceArea: str(form, "practice_area") || null,
    actor: actor.email,
  });
  redirect(`/admin/cases/${id}`);
}

export async function updateCaseAdmin(_: AdminState, form: FormData): Promise<AdminState> {
  const actor = await guard(["admin", "lawyer"]);
  const id = str(form, "id");
  const status = str(form, "status");
  await updateCase(
    id,
    {
      title: str(form, "title", 200),
      description: str(form, "description", 5000) || null,
      lawyer_id: str(form, "lawyer_id") || null,
      practice_area: str(form, "practice_area") || null,
      status: (CASE_STATUSES as readonly string[]).includes(status) ? (status as (typeof CASE_STATUSES)[number]) : "intake",
      progress: Math.max(0, Math.min(100, Number(form.get("progress")) || 0)),
      next_step: str(form, "next_step", 300) || null,
      next_date: str(form, "next_date", 10) || null,
    },
    actor.email,
  );
  if (form.get("notify") === "on") {
    await addCaseEvent({ caseId: id, title: str(form, "event_title", 200) || "sys:details_updated", kind: "update", authorId: actor.id, notify: true });
  }
  return done(`/admin/cases/${id}`);
}

// ── Team ──────────────────────────────────────────────────────────────

function localeMap(form: FormData, prefix: string, max = 5000) {
  return Object.fromEntries(locales.map((l) => [l, str(form, `${prefix}_${l}`, max)]).filter(([, v]) => v));
}

export async function saveTeamMember(_: AdminState, form: FormData): Promise<AdminState> {
  const actor = await guard();
  const database = await db();
  const id = str(form, "id") || uuid();
  const name = str(form, "name", 120);
  if (!name) return { error: "Name is required" };
  const slug = slugify(str(form, "slug", 80) || name);
  const specialties = form.getAll("specialties").map(String).filter((s) => (TOPIC_KEYS as string[]).includes(s));
  const list = (k: string) => JSON.stringify(str(form, k, 500).split(",").map((s) => s.trim()).filter(Boolean));
  const email = str(form, "email", 200) || null;
  const linked = email ? await getUserByEmail(email) : null;
  await database
    .prepare(
      `INSERT INTO team_members (id, slug, name, position, biography, specialties, languages, education, email, phone, photo_url, user_id, is_referral_lead, is_active, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, name=excluded.name, position=excluded.position, biography=excluded.biography,
         specialties=excluded.specialties, languages=excluded.languages, education=excluded.education, email=excluded.email, phone=excluded.phone,
         photo_url=excluded.photo_url, user_id=excluded.user_id, is_referral_lead=excluded.is_referral_lead, is_active=excluded.is_active,
         sort_order=excluded.sort_order, updated_at=excluded.updated_at`,
    )
    .bind(
      id,
      slug,
      name,
      JSON.stringify(localeMap(form, "position", 300)),
      JSON.stringify(localeMap(form, "bio")),
      JSON.stringify(specialties),
      list("languages"),
      list("education"),
      email,
      str(form, "phone", 40) || null,
      str(form, "photo_url", 500) || null,
      linked && ["lawyer", "admin"].includes(linked.role) ? linked.id : null,
      form.get("is_referral_lead") === "on" ? 1 : 0,
      form.get("is_active") === "on" ? 1 : 0,
      Number(form.get("sort_order")) || 100,
      now(),
    )
    .run();
  await audit(actor.email, "team.saved", "team_member", id, { name });
  if (!str(form, "id")) redirect(`/admin/team/${id}`);
  return done(`/admin/team/${id}`);
}

export async function deleteTeamMember(form: FormData) {
  const actor = await guard();
  const database = await db();
  await database.prepare("DELETE FROM team_members WHERE id = ?").bind(str(form, "id")).run();
  await audit(actor.email, "team.deleted", "team_member", str(form, "id"));
  redirect("/admin/team");
}

/** Fills empty languages of a text from the English version, with AI. */
export async function translateFields(_: AdminState, form: FormData): Promise<AdminState> {
  await guard();
  const source = str(form, "source", 6000);
  if (!source) return { error: "Write the English text first." };
  try {
    const raw = await generate({
      system: "Translate the user's text for a law firm website. Keep the meaning, register and any names exactly. Return ONLY JSON with keys tr, fa, ru, ar.",
      messages: [{ role: "user", content: source }],
      json: true,
      maxTokens: 3000,
      temperature: 0.2,
    });
    const parsed = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1)) as Record<string, string>;
    return { ok: true, message: JSON.stringify(parsed) };
  } catch (error) {
    return { error: error instanceof AiUnavailable ? "No AI provider key configured (Settings → AI)." : "Translation failed." };
  }
}

// ── Articles ──────────────────────────────────────────────────────────

export async function reviewArticleAdmin(_: AdminState, form: FormData): Promise<AdminState> {
  const actor = await guard(["admin", "lawyer"]);
  const id = str(form, "id");
  const status = str(form, "status") as ArticleStatus;
  if (!["submitted", "revision", "published", "rejected"].includes(status)) return { error: "Invalid status" };
  if (form.get("save_content") === "on") {
    await updateArticleContent(
      id,
      {
        title: str(form, "title", 220),
        abstract: str(form, "abstract", 2500),
        body: str(form, "body", 80000),
        keywords: str(form, "keywords", 300).split(",").map((k) => k.trim()).filter(Boolean),
        category: str(form, "category", 80) || null,
      },
      actor.email,
    );
  }
  await reviewArticle(id, status, str(form, "note", 3000) || null, actor.email);
  return done(`/admin/articles/${id}`, status === "published" ? "Published — the author has been e-mailed the permanent link." : "Saved and author notified.");
}

// ── Laws ──────────────────────────────────────────────────────────────

export async function saveLaw(_: AdminState, form: FormData): Promise<AdminState> {
  const actor = await guard(["admin", "lawyer"]);
  const database = await db();
  const id = str(form, "id");
  const locale = str(form, "locale");
  if (!id || !isLocale(locale)) return { error: "Invalid" };
  await database
    .prepare("UPDATE laws SET reference = ?, category = ?, source_url = ?, status = ?, sort_order = ?, updated_at = ? WHERE id = ?")
    .bind(str(form, "reference", 120), str(form, "category", 40), str(form, "source_url", 500) || null, form.get("published") === "on" ? "published" : "draft", Number(form.get("sort_order")) || 100, now(), id)
    .run();
  await saveLawLocale(id, locale, {
    title: str(form, "title", 300),
    summary: str(form, "summary", 1500),
    body: str(form, "body", 40000),
    review: form.get("reviewed") === "on" ? "reviewed" : "ai",
  });
  await audit(actor.email, "law.saved", "law", id, { locale });
  return done(`/admin/laws/${id}`);
}

export async function createLaw(_: AdminState, form: FormData): Promise<AdminState> {
  const actor = await guard(["admin", "lawyer"]);
  const database = await db();
  const title = str(form, "title", 300);
  if (!title) return { error: "Title required" };
  const id = uuid();
  await database
    .prepare("INSERT INTO laws (id, slug, reference, category, title, status, sort_order, updated_at) VALUES (?, ?, ?, ?, ?, 'draft', 500, ?)")
    .bind(id, slugify(`${title} ${str(form, "reference", 60)}`), str(form, "reference", 120) || "—", str(form, "category", 40) || "contracts", JSON.stringify({ en: title }), now())
    .run();
  await audit(actor.email, "law.created", "law", id);
  redirect(`/admin/laws/${id}`);
}

export async function generateLaw(_: AdminState, form: FormData): Promise<AdminState> {
  await guard(["admin", "lawyer"]);
  const law = await getLaw(str(form, "slug"));
  if (!law) return { error: "Not found" };
  const targets = str(form, "locale") === "all" ? [...locales] : isLocale(str(form, "locale")) ? [str(form, "locale") as Locale] : [];
  let n = 0;
  for (const l of targets) if (await generateLawExplanation((await getLaw(law.slug))!, l, form.get("force") === "on")) n++;
  return done(`/admin/laws/${law.id}`, n ? `Generated ${n} language version(s). Review before marking as reviewed.` : "Nothing generated — check the AI provider key in Settings, or the text is already reviewed.");
}

export async function generateAllLaws(): Promise<AdminState> {
  await guard();
  const n = await generateMissingLaws(10);
  return done("/admin/laws", `Generated ${n} explanation(s). Run again to continue.`);
}

// ── Outreach ──────────────────────────────────────────────────────────

const prospectSchema = z.object({
  company: z.string().trim().min(2).max(160),
  country: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  contact_name: z.string().trim().max(120).optional(),
  sector: z.string().trim().max(120).optional(),
  interest: z.enum(INTERESTS),
  language: z.string(),
  website: z.string().trim().max(300).optional(),
  source: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export async function addProspectAdmin(_: AdminState, form: FormData): Promise<AdminState> {
  const actor = await guard();
  const parsed = prospectSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Company, country, a valid e-mail and interest are required." };
  const p = parsed.data;
  await addProspect({ ...p, contact_name: p.contact_name || null, sector: p.sector || null, website: p.website || null, source: p.source || "manual", notes: p.notes || null }, actor.email);
  return done("/admin/outreach", "Prospect added. Draft its first e-mail from the list, or let the daily job do it.");
}

export async function importProspects(_: AdminState, form: FormData): Promise<AdminState> {
  const actor = await guard();
  const rows = parseProspectCsv(str(form, "csv", 200000));
  for (const r of rows) await addProspect(r as Parameters<typeof addProspect>[0], actor.email);
  return done("/admin/outreach", `Imported ${rows.length} prospect(s) (duplicates skipped).`);
}

export async function draftProspect(form: FormData) {
  const actor = await guard();
  await createDraft(str(form, "id"), actor.email);
  refresh("/admin/outreach");
  refresh(`/admin/outreach/${str(form, "id")}`);
}

export async function sendDraft(_: AdminState, form: FormData): Promise<AdminState> {
  const actor = await guard();
  const r = await approveAndSend(str(form, "id"), actor.email, { subject: str(form, "subject", 200), body: str(form, "body", 6000) });
  refresh("/admin/outreach");
  return r.ok ? { ok: true, message: "Sent." } : { error: r.error };
}

export async function discardDraftAdmin(form: FormData) {
  const actor = await guard();
  await discardDraft(str(form, "id"), actor.email);
  refresh("/admin/outreach");
}

export async function updateProspectStatus(form: FormData) {
  const actor = await guard();
  const database = await db();
  const status = str(form, "status");
  const id = str(form, "id");
  if (["new", "drafted", "contacted", "replied", "meeting", "declined"].includes(status)) {
    await database.prepare("UPDATE prospects SET status = ?, notes = COALESCE(NULLIF(?, ''), notes), updated_at = ? WHERE id = ?").bind(status, str(form, "notes", 2000), now(), id).run();
    if (status === "meeting" || status === "declined") await audit(actor.email, `prospect.${status}`, "prospect", id);
  }
  refresh(`/admin/outreach/${id}`);
}

export async function logInboundReply(_: AdminState, form: FormData): Promise<AdminState> {
  const actor = await guard();
  const ok = await recordInbound(str(form, "email", 200), str(form, "subject", 300) || "(reply)", str(form, "body", 20000), actor.email);
  return ok ? done(`/admin/outreach/${str(form, "id")}`, "Reply logged — an AI draft answer is waiting for approval.") : { error: "No prospect with that e-mail." };
}

export async function runDailyNow(): Promise<AdminState> {
  await guard();
  const n = await dailyAutodraft();
  return done("/admin/outreach", `${n} new draft(s) created.`);
}

export async function sendReportNow(): Promise<AdminState> {
  await guard();
  const r = await buildAndSendMonthlyReport(new Date(), true);
  return done("/admin/outreach", r.sentTo.length ? `Report for ${r.period} sent to ${r.sentTo.join(", ")}.` : `Report for ${r.period} saved — add recipients in Settings to e-mail it.`);
}

// ── Content & settings ────────────────────────────────────────────────

export async function saveContent(_: AdminState, form: FormData): Promise<AdminState> {
  const actor = await guard();
  const database = await db();
  const locale = str(form, "locale");
  if (!isLocale(locale)) return { error: "Invalid locale" };
  const stmts: D1PreparedStatement[] = [];
  for (const key of EDITABLE_KEYS) {
    const value = str(form, key, 3000);
    stmts.push(
      value
        ? database.prepare("INSERT INTO content_overrides (locale, key, value, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at").bind(locale, key, value, now())
        : database.prepare("DELETE FROM content_overrides WHERE locale = ? AND key = ?").bind(locale, key),
    );
  }
  await database.batch(stmts);
  await audit(actor.email, "content.saved", "content", locale);
  return done("/admin/content", "Saved — the public site updates immediately.");
}

const SETTING_KEYS = [
  "firm_name", "boss_email", "owner_email", "report_recipients", "outreach_reply_to", "office_phone", "office_address", "office_email", "office_map_url", "mail_from", "meeting_link",
  "booking_days", "booking_start", "booking_end", "booking_slot_minutes", "booking_timezone", "booking_horizon_days",
  "ai_provider", "ai_model", "outreach_daily_limit", "announcement",
];
const TOGGLES = ["chatbot_enabled", "laws_autogenerate", "articles_open", "outreach_autodraft"];

export async function saveSettings(_: AdminState, form: FormData): Promise<AdminState> {
  const actor = await guard();
  const values: Record<string, string> = {};
  for (const k of SETTING_KEYS) values[k] = str(form, k, 1000);
  values.booking_days = form.getAll("booking_days").map(String).filter((d) => /^[1-7]$/.test(d)).join(",") || "1,2,3,4,5";
  for (const k of TOGGLES) values[k] = form.get(k) === "on" ? "1" : "0";
  await setSettings(values);
  await audit(actor.email, "settings.saved", "settings", undefined, values);
  return done("/admin/settings");
}

export async function testEmail(_: AdminState, form: FormData): Promise<AdminState> {
  const actor = await guard();
  const to = str(form, "to", 200) || actor.email;
  const r = await sendMail({ to, subject: "Mendes — test e-mail", html: "<p>E-mail sending from the Mendes platform works.</p>", text: "E-mail sending from the Mendes platform works." });
  return r.ok ? { ok: true, message: `Test e-mail sent to ${to}.` } : { error: `Sending failed: ${r.error}` };
}

export async function testAi(): Promise<AdminState> {
  await guard();
  try {
    const r = await generateDetailed({
      system: "You are a health check. Reply with one short friendly sentence in English confirming you work.",
      messages: [{ role: "user", content: "Are you working?" }],
      maxTokens: 200,
    });
    return { ok: true, message: `AI works — ${r.provider} / ${r.model}: "${r.text.trim().slice(0, 160)}"` };
  } catch (error) {
    return { error: `AI failed: ${(error instanceof Error ? error.message : String(error)).slice(0, 600)}` };
  }
}

export async function deleteChat(form: FormData) {
  const actor = await guard();
  const database = await db();
  await database.prepare("DELETE FROM chat_sessions WHERE id = ?").bind(str(form, "id")).run();
  await audit(actor.email, "chat.deleted", "chat", str(form, "id"));
  redirect("/admin/chats");
}

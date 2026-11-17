"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  checkCredentials,
  consumeUserToken,
  createUser,
  currentUser,
  endSession,
  getUserByEmail,
  isStaff,
  issueUserToken,
  setPassword,
  startSession,
} from "@/lib/auth";
import { asLocale } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/env";
import { clientIp } from "@/lib/http";
import { hashIp } from "@/lib/security/crypto";
import { rateLimit } from "@/lib/security/rate-limit";
import { audit, getSettings } from "@/lib/settings";
import { sendMail } from "@/lib/email/send";
import { accountLink } from "@/lib/email/templates";
import { addCaseEvent, canAccessCase, checkUpload, getCase, storeDocument, updateCase, CASE_STATUSES } from "@/lib/data/cases";
import { revalidatePath } from "next/cache";

export type FormState = { ok?: boolean; error?: string };

function safeNext(next: unknown, locale: string): string {
  const v = typeof next === "string" ? next : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : `/${locale}/portal`;
}

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const locale = asLocale(form.get("locale"));
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const ip = (await hashIp(await clientIp())) ?? "anon";
  if (!(await rateLimit(`login:${ip}`, 10, 900)) || !(await rateLimit(`login:${email}`, 8, 900))) return { error: "rate" };
  const user = await checkCredentials(email, password);
  if (!user) {
    await audit(email, "auth.failed");
    return { error: "invalid" };
  }
  await startSession(user.id);
  await audit(user.email, "auth.login");
  const next = safeNext(form.get("next"), locale);
  redirect(isStaff(user) && next === `/${locale}/portal` ? "/admin" : next);
}

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(10).max(200),
  phone: z.string().trim().max(40).optional(),
  university: z.string().trim().max(160).optional(),
  type: z.enum(["client", "author"]),
});

export async function register(_: FormState, form: FormData): Promise<FormState> {
  const locale = asLocale(form.get("locale"));
  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "fields" };
  const ip = (await hashIp(await clientIp())) ?? "anon";
  if (!(await rateLimit(`register:${ip}`, 5, 3600))) return { error: "rate" };
  if (await getUserByEmail(parsed.data.email)) return { error: "taken" };
  const user = await createUser({
    email: parsed.data.email,
    name: parsed.data.name,
    password: parsed.data.password,
    role: parsed.data.type,
    phone: parsed.data.phone || null,
    university: parsed.data.type === "author" ? parsed.data.university || null : null,
    locale,
  });
  await startSession(user.id);
  await audit(user.email, "auth.registered", "user", user.id, { role: user.role });
  redirect(safeNext(form.get("next"), locale));
}

export async function logout(form: FormData) {
  const locale = asLocale(form.get("locale"));
  await endSession();
  redirect(`/${locale}`);
}

export async function requestReset(_: FormState, form: FormData): Promise<FormState> {
  const locale = asLocale(form.get("locale"));
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!(await rateLimit(`reset:${email}`, 3, 3600))) return { ok: true };
  const user = await getUserByEmail(email);
  if (user) {
    const token = await issueUserToken(user.id, "reset", 2);
    const settings = await getSettings();
    const url = `${siteUrl()}/${asLocale(user.locale || locale)}/portal/reset?t=${encodeURIComponent(token)}`;
    await sendMail({ to: user.email, ...accountLink(asLocale(user.locale || locale), "reset", url, settings.firm_name || "Mendes") });
  }
  return { ok: true };
}

export async function resetPassword(_: FormState, form: FormData): Promise<FormState> {
  const token = String(form.get("t") ?? "");
  const password = String(form.get("password") ?? "");
  if (password.length < 10) return { error: "short" };
  const userId = await consumeUserToken(token);
  if (!userId) return { error: "token" };
  await setPassword(userId, password);
  await audit(userId, "auth.password_set", "user", userId);
  return { ok: true };
}

// ── Case page actions (client or assigned lawyer) ─────────────────────

export async function uploadDocument(_: FormState, form: FormData): Promise<FormState> {
  const user = await currentUser();
  if (!user) return { error: "auth" };
  const c = await getCase(String(form.get("caseId") ?? ""));
  if (!c || !canAccessCase(user, c)) return { error: "denied" };
  const file = form.get("file");
  if (!(file instanceof File)) return { error: "file" };
  const check = checkUpload(file);
  if (check !== "ok") return { error: check };
  if (!(await rateLimit(`upload:${user.id}`, 40, 3600))) return { error: "rate" };
  await storeDocument({ caseId: c.id, file, uploaderId: user.id, note: String(form.get("note") ?? "").slice(0, 500) || null });
  revalidatePath(`/${asLocale(form.get("locale"))}/portal/cases/${c.id}`);
  return { ok: true };
}

export async function postCaseUpdate(_: FormState, form: FormData): Promise<FormState> {
  const user = await currentUser();
  if (!user || !isStaff(user)) return { error: "denied" };
  const c = await getCase(String(form.get("caseId") ?? ""));
  if (!c || !canAccessCase(user, c)) return { error: "denied" };
  const title = String(form.get("title") ?? "").trim().slice(0, 200);
  if (!title) return { error: "fields" };
  await addCaseEvent({
    caseId: c.id,
    title,
    body: String(form.get("body") ?? "").slice(0, 5000) || null,
    kind: String(form.get("kind") ?? "update"),
    authorId: user.id,
    internal: form.get("internal") === "on",
    notify: form.get("internal") !== "on",
  });
  const status = String(form.get("status") ?? "");
  const progress = Number(form.get("progress"));
  await updateCase(
    c.id,
    {
      ...((CASE_STATUSES as readonly string[]).includes(status) ? { status: status as (typeof CASE_STATUSES)[number] } : {}),
      ...(Number.isFinite(progress) && progress >= 0 && progress <= 100 ? { progress } : {}),
      ...(form.get("next_step") ? { next_step: String(form.get("next_step")).slice(0, 300) } : {}),
      ...(form.get("next_date") ? { next_date: String(form.get("next_date")) } : {}),
    },
    user.email,
  );
  revalidatePath(`/${asLocale(form.get("locale"))}/portal/cases/${c.id}`);
  return { ok: true };
}

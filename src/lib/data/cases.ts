import "server-only";
import { all, db, now, uuid } from "@/lib/db";
import { siteUrl } from "@/lib/env";
import { maxUploadBytes, putFile } from "@/lib/storage";
import { asLocale } from "@/lib/i18n/config";
import type { User } from "@/lib/auth";
import { getSettings, audit } from "@/lib/settings";
import { sendMail } from "@/lib/email/send";
import { caseUpdate } from "@/lib/email/templates";

export const CASE_STATUSES = ["intake", "in_progress", "awaiting_client", "in_court", "settled", "closed"] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export interface CaseRow {
  id: string;
  reference: string;
  title: string;
  description: string | null;
  client_id: string;
  lawyer_id: string | null;
  practice_area: string | null;
  status: CaseStatus;
  progress: number;
  next_step: string | null;
  next_date: string | null;
  created_at: string;
  updated_at: string;
  client_name?: string;
  client_email?: string;
  lawyer_name?: string | null;
  lawyer_email?: string | null;
}

export interface CaseEvent {
  id: string;
  case_id: string;
  title: string;
  body: string | null;
  kind: string;
  author_id: string | null;
  author_name: string | null;
  is_internal: number;
  created_at: string;
}

export interface DocumentRow {
  id: string;
  case_id: string;
  uploader_id: string | null;
  uploader_name: string | null;
  filename: string;
  r2_key: string;
  mime_type: string;
  size_bytes: number;
  note: string | null;
  created_at: string;
}

const SELECT_CASE = `SELECT c.*, cu.name AS client_name, cu.email AS client_email, lu.name AS lawyer_name, lu.email AS lawyer_email
  FROM cases c JOIN users cu ON cu.id = c.client_id LEFT JOIN users lu ON lu.id = c.lawyer_id`;

/** Whether `user` may see the case: its client, its lawyer, or an admin. */
export function canAccessCase(user: Pick<User, "id" | "role">, c: Pick<CaseRow, "client_id" | "lawyer_id">): boolean {
  return user.role === "admin" || c.client_id === user.id || (user.role === "lawyer" && c.lawyer_id === user.id);
}

export async function casesFor(user: Pick<User, "id" | "role">): Promise<CaseRow[]> {
  const database = await db();
  if (user.role === "admin") return all<CaseRow>(database.prepare(`${SELECT_CASE} ORDER BY c.updated_at DESC`));
  if (user.role === "lawyer")
    return all<CaseRow>(database.prepare(`${SELECT_CASE} WHERE c.lawyer_id = ? OR c.client_id = ? ORDER BY c.updated_at DESC`).bind(user.id, user.id));
  return all<CaseRow>(database.prepare(`${SELECT_CASE} WHERE c.client_id = ? ORDER BY c.updated_at DESC`).bind(user.id));
}

export async function getCase(id: string): Promise<CaseRow | null> {
  const database = await db();
  return database.prepare(`${SELECT_CASE} WHERE c.id = ?`).bind(id).first<CaseRow>();
}

export async function caseEvents(caseId: string, includeInternal: boolean): Promise<CaseEvent[]> {
  const database = await db();
  return all<CaseEvent>(
    database
      .prepare(
        `SELECT e.*, u.name AS author_name FROM case_events e LEFT JOIN users u ON u.id = e.author_id
         WHERE e.case_id = ? ${includeInternal ? "" : "AND e.is_internal = 0"} ORDER BY e.created_at DESC`,
      )
      .bind(caseId),
  );
}

export async function caseDocuments(caseId: string): Promise<DocumentRow[]> {
  const database = await db();
  return all<DocumentRow>(
    database
      .prepare(`SELECT d.*, u.name AS uploader_name FROM documents d LEFT JOIN users u ON u.id = d.uploader_id WHERE d.case_id = ? ORDER BY d.created_at DESC`)
      .bind(caseId),
  );
}

async function nextReference(): Promise<string> {
  const database = await db();
  const year = new Date().getUTCFullYear();
  const row = await database
    .prepare("SELECT COUNT(*) AS n FROM cases WHERE reference LIKE ?")
    .bind(`MND-${year}-%`)
    .first<{ n: number }>();
  return `MND-${year}-${String((row?.n ?? 0) + 1).padStart(4, "0")}`;
}

export async function createCase(input: {
  title: string;
  description?: string | null;
  clientId: string;
  lawyerId?: string | null;
  practiceArea?: string | null;
  actor: string;
}): Promise<string> {
  const database = await db();
  const id = uuid();
  const stamp = now();
  const reference = await nextReference();
  await database.batch([
    database
      .prepare(
        `INSERT INTO cases (id, reference, title, description, client_id, lawyer_id, practice_area, status, progress, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'intake', 5, ?, ?)`,
      )
      .bind(id, reference, input.title, input.description ?? null, input.clientId, input.lawyerId ?? null, input.practiceArea ?? null, stamp, stamp),
    database
      .prepare("INSERT INTO case_events (id, case_id, title, kind, author_id, created_at) VALUES (?, ?, ?, 'milestone', ?, ?)")
      .bind(uuid(), id, "Case opened", null, stamp),
  ]);
  await audit(input.actor, "case.created", "case", id, { reference });
  return id;
}

export async function updateCase(
  id: string,
  fields: Partial<Pick<CaseRow, "title" | "description" | "lawyer_id" | "practice_area" | "status" | "progress" | "next_step" | "next_date">>,
  actor: string,
): Promise<void> {
  const database = await db();
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (!keys.length) return;
  await database
    .prepare(`UPDATE cases SET ${keys.map((k) => `${k} = ?`).join(", ")}, updated_at = ? WHERE id = ?`)
    .bind(...keys.map((k) => fields[k] ?? null), now(), id)
    .run();
  await audit(actor, "case.updated", "case", id, fields);
}

export async function addCaseEvent(input: {
  caseId: string;
  title: string;
  body?: string | null;
  kind?: string;
  authorId: string;
  internal?: boolean;
  notify?: boolean;
}): Promise<void> {
  const database = await db();
  await database.batch([
    database
      .prepare("INSERT INTO case_events (id, case_id, title, body, kind, author_id, is_internal, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(uuid(), input.caseId, input.title, input.body ?? null, input.kind ?? "update", input.authorId, input.internal ? 1 : 0, now()),
    database.prepare("UPDATE cases SET updated_at = ? WHERE id = ?").bind(now(), input.caseId),
  ]);
  if (input.notify && !input.internal) await notifyCaseParty(input.caseId, input.authorId, input.title);
}

/** E-mails the other side of the case (client ↔ lawyer) about an update. */
export async function notifyCaseParty(caseId: string, actorId: string, title: string): Promise<void> {
  const c = await getCase(caseId);
  if (!c) return;
  const database = await db();
  const targetId = actorId === c.client_id ? c.lawyer_id : c.client_id;
  if (!targetId) return;
  const target = await database.prepare("SELECT email, locale FROM users WHERE id = ?").bind(targetId).first<{ email: string; locale: string }>();
  if (!target) return;
  const locale = asLocale(target.locale);
  const settings = await getSettings();
  const url = `${(await siteUrl())}/${locale}/portal/cases/${c.id}`;
  await sendMail({ to: target.email, ...caseUpdate(locale, c.reference, title, url, settings.firm_name || "Mendes") });
}

// ── Documents (R2) ────────────────────────────────────────────────────
const ALLOWED = new Map<string, string>([
  ["application/pdf", "pdf"],
  ["application/msword", "doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
  ["application/vnd.ms-excel", "xls"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/heic", "heic"],
  ["text/plain", "txt"],
]);

export function checkUpload(file: File): "ok" | "size" | "type" {
  if (file.size <= 0 || file.size > maxUploadBytes()) return "size";
  if (!ALLOWED.has(file.type)) return "type";
  return "ok";
}

export function safeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "_").slice(-140) || "document";
}

export async function storeDocument(input: { caseId: string; file: File; uploaderId: string; note?: string | null }): Promise<string> {
  const id = uuid();
  const ext = ALLOWED.get(input.file.type) ?? "bin";
  const key = `cases/${input.caseId}/${id}.${ext}`;
  await putFile(key, input.file, input.file.type);
  const database = await db();
  await database
    .prepare("INSERT INTO documents (id, case_id, uploader_id, filename, r2_key, mime_type, size_bytes, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(id, input.caseId, input.uploaderId, safeFilename(input.file.name), key, input.file.type, input.file.size, input.note ?? null, now())
    .run();
  await addCaseEvent({ caseId: input.caseId, title: `Document uploaded: ${safeFilename(input.file.name)}`, kind: "document", authorId: input.uploaderId, notify: true });
  await audit(input.uploaderId, "document.uploaded", "document", id, { caseId: input.caseId, size: input.file.size });
  return id;
}

export async function getDocument(id: string): Promise<DocumentRow | null> {
  const database = await db();
  return database.prepare("SELECT d.*, NULL AS uploader_name FROM documents d WHERE d.id = ?").bind(id).first<DocumentRow>();
}

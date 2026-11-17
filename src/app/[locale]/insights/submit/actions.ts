"use server";

import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { submitArticle } from "@/lib/data/articles";
import { getSetting } from "@/lib/settings";
import { rateLimit } from "@/lib/security/rate-limit";
import { isLocale } from "@/lib/i18n/config";

export type SubmitState = { ok?: boolean; error?: string };

const schema = z.object({
  title: z.string().trim().min(8).max(220),
  abstract: z.string().trim().min(200).max(2500),
  body: z.string().trim().min(3000).max(80000),
  keywords: z.string().trim().max(300),
  category: z.string().trim().max(80),
  language: z.string(),
  originality: z.literal("on"),
});

export async function submitArticleAction(_: SubmitState, form: FormData): Promise<SubmitState> {
  const user = await currentUser();
  if (!user) return { error: "auth" };
  if ((await getSetting("articles_open", "1")) === "0") return { error: "closed" };
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.path.join(".")).join(", ") };
  if (!(await rateLimit(`article:${user.id}`, 5, 86400))) return { error: "rate" };

  const file = form.get("attachment");
  const attachment = file instanceof File && file.size > 0 ? file : null;
  if (attachment && (attachment.type !== "application/pdf" || attachment.size > 10 * 1024 * 1024)) return { error: "attachment" };

  await submitArticle({
    authorId: user.id,
    title: parsed.data.title,
    abstract: parsed.data.abstract,
    body: parsed.data.body,
    keywords: parsed.data.keywords.split(",").map((k) => k.trim()).filter(Boolean).slice(0, 10),
    category: parsed.data.category || null,
    locale: isLocale(parsed.data.language) ? parsed.data.language : "en",
    attachment,
  });
  return { ok: true };
}

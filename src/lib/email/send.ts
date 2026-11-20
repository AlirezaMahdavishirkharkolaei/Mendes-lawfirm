import "server-only";
import { getEnv, optional } from "@/lib/env";
import { getSettings } from "@/lib/settings";

export interface Attachment {
  filename: string;
  /** File content; strings are sent as UTF-8. */
  content: string;
  contentType: string;
}

export interface Mail {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  headers?: Record<string, string>;
  attachments?: Attachment[];
}

export interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
  provider?: "resend" | "cloudflare";
}

function b64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

/**
 * Sends a transactional e-mail. Failures never throw — callers record the
 * result — so a mail outage can't break a booking or a portal action.
 *
 * Provider order:
 *  1. Resend (https://resend.com) when the RESEND_API_KEY secret is set.
 *     Until a domain is verified in Resend, the sender must be
 *     "onboarding@resend.dev" and Resend only delivers to the address the
 *     Resend account was created with.
 *  2. Cloudflare Email Service (the EMAIL binding) otherwise — needs the
 *     sender's domain onboarded to Email Sending.
 *
 * The sender address comes from Admin → Settings → "Sender address"
 * (mail_from), then the MAIL_FROM binding.
 */
export async function sendMail(mail: Mail): Promise<SendResult> {
  const recipients = (Array.isArray(mail.to) ? mail.to : [mail.to]).filter(Boolean);
  if (recipients.length === 0) return { ok: false, error: "no recipients" };

  const settings = await getSettings();
  const firm = settings.firm_name || "Mendes";
  const resendKey = optional("RESEND_API_KEY");

  if (resendKey) {
    const from = settings.mail_from || "onboarding@resend.dev";
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        signal: AbortSignal.timeout(15_000),
        headers: { authorization: `Bearer ${resendKey}`, "content-type": "application/json" },
        body: JSON.stringify({
          from: `${firm} <${from}>`,
          to: recipients,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
          ...(mail.headers ? { headers: mail.headers } : {}),
          ...(mail.attachments?.length
            ? { attachments: mail.attachments.map((a) => ({ filename: a.filename, content: b64(a.content), content_type: a.contentType })) }
            : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string; name?: string };
      if (!res.ok) {
        const error = `resend ${res.status}: ${data.message ?? data.name ?? "error"}`;
        console.error("sendMail failed", error);
        return { ok: false, error, provider: "resend" };
      }
      return { ok: true, id: data.id, provider: "resend" };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("sendMail failed", message);
      return { ok: false, error: message, provider: "resend" };
    }
  }

  const from = settings.mail_from || optional("MAIL_FROM") || "no-reply@mendes.law";
  try {
    const result = await getEnv().EMAIL.send({
      to: recipients,
      from: { email: from, name: firm },
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
      ...(mail.headers ? { headers: mail.headers } : {}),
      ...(mail.attachments?.length
        ? { attachments: mail.attachments.map((a) => ({ filename: a.filename, content: a.content, type: a.contentType, disposition: "attachment" })) }
        : {}),
    } as never);
    const id = (result as { messageId?: string } | undefined)?.messageId;
    return { ok: true, id, provider: "cloudflare" };
  } catch (error) {
    const message = error instanceof Error ? `${(error as { code?: string }).code ?? ""} ${error.message}`.trim() : String(error);
    console.error("sendMail failed", message);
    return { ok: false, error: message, provider: "cloudflare" };
  }
}

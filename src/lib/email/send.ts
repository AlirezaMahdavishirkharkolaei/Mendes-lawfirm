import "server-only";
import { getEnv, optional } from "@/lib/env";
import { getSetting } from "@/lib/settings";

export interface Mail {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

export interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/**
 * Sends a transactional e-mail through the Cloudflare Email Service
 * binding. Failures never throw — callers record the result — so a mail
 * outage can't break a booking or a portal action.
 */
export async function sendMail(mail: Mail): Promise<SendResult> {
  const recipients = (Array.isArray(mail.to) ? mail.to : [mail.to]).filter(Boolean);
  if (recipients.length === 0) return { ok: false, error: "no recipients" };

  const from = optional("MAIL_FROM") ?? "no-reply@mendes.law";
  const firm = await getSetting("firm_name", "Mendes");
  try {
    const result = await getEnv().EMAIL.send({
      to: recipients,
      from: { email: from, name: firm },
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
      ...(mail.headers ? { headers: mail.headers } : {}),
    } as never);
    const id = (result as { messageId?: string } | undefined)?.messageId;
    return { ok: true, id };
  } catch (error) {
    const message = error instanceof Error ? `${(error as { code?: string }).code ?? ""} ${error.message}`.trim() : String(error);
    console.error("sendMail failed", message);
    return { ok: false, error: message };
  }
}

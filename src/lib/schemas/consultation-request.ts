import { z } from "zod";

/**
 * Consultation request form schema: User -> form -> validation (this
 * schema, in the browser) -> the visitor's own email app or WhatsApp.
 *
 * The site is static and stores nothing. If a server-side flow is added
 * later (e.g. an email-sending provider), validate with this same schema
 * on the server.
 */
export const consultationRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(200),
  email: z.string().trim().email(),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s().-]*$/)
    .optional()
    .or(z.literal("")),
  practiceAreaSlug: z.string().optional(),
  preferredLanguage: z.enum(["en", "tr", "fa"]),
  message: z.string().trim().min(10).max(4000),
  /** Honeypot field for basic spam mitigation; must stay empty. */
  companyWebsite: z.string().max(0).optional(),
});

export type ConsultationRequestInput = z.infer<typeof consultationRequestSchema>;

/** First error per field, keyed by field name. */
export function consultationErrors(data: unknown): Partial<Record<keyof ConsultationRequestInput, true>> | null {
  const r = consultationRequestSchema.safeParse(data);
  if (r.success) return null;
  const out: Partial<Record<keyof ConsultationRequestInput, true>> = {};
  for (const issue of r.error.issues) out[issue.path[0] as keyof ConsultationRequestInput] = true;
  return out;
}

/** Plain-text email body for a valid request. */
export function consultationBody(d: ConsultationRequestInput, areaTitle?: string): string {
  return [
    d.message.trim(),
    "",
    "—",
    `Name: ${d.fullName.trim()}`,
    `Email: ${d.email.trim()}`,
    d.phone ? `Phone: ${d.phone.trim()}` : "",
    areaTitle ? `Practice area: ${areaTitle}` : "",
    `Preferred language: ${{ en: "English", tr: "Türkçe", fa: "فارسی" }[d.preferredLanguage]}`,
  ]
    .filter((line, i) => line !== "" || i === 1)
    .join("\n");
}

export function mailtoHref(to: string, subject: string, body: string): string {
  const q = new URLSearchParams({ subject, body }).toString().replace(/\+/g, "%20");
  return `mailto:${to}?${q}`;
}

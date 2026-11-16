import { z } from "zod";
import { localizedString } from "@/lib/schemas/localized";

/**
 * The firm's own details, in one place. Every optional field is only
 * rendered when it is filled in — leave a field undefined rather than
 * putting a placeholder in it. Only facts confirmed by the firm belong
 * here.
 */
const firmSchema = z.object({
  name: z.string().min(1),
  legalName: z.string().min(1),
  tagline: localizedString,
  email: z.string().email(),
  phone: z.string().optional(), // international format, e.g. "+90 548 000 00 00"
  whatsapp: z.string().regex(/^\d{10,15}$/).optional(), // digits only
  address: z
    .object({ street: z.string(), city: z.string(), country: localizedString, lat: z.number().optional(), lng: z.number().optional() })
    .optional(),
  hours: localizedString.optional(),
  founded: z.number().int().optional(),
  social: z.object({ linkedin: z.string().url().optional(), instagram: z.string().url().optional() }).default({}),
  siteUrl: z.string().url(),
});

export type Firm = z.infer<typeof firmSchema>;

export const firm: Firm = firmSchema.parse({
  name: "Mendes",
  legalName: "Mendes Law and Consultancy",
  tagline: {
    en: "Legal counsel in Northern Cyprus — in English, Turkish and Persian.",
    tr: "Kuzey Kıbrıs'ta hukuki danışmanlık — Türkçe, İngilizce ve Farsça.",
    fa: "مشاورهٔ حقوقی در قبرس شمالی — به فارسی، ترکی و انگلیسی.",
  },
  email: "Mendes.lawfirm@outlook.com",
  social: {},
  siteUrl: "https://alirezamahdavishirkharkolaei.github.io/mendes-lawfirm",
});

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
export const waHref = (digits: string, text: string) => `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;

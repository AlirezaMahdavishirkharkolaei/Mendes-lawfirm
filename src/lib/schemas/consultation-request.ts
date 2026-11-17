import { z } from "zod";

/**
 * Consultation request form schema.
 *
 * This is intentionally minimal and structural for the foundation phase:
 * User -> Consultation Form -> server-side validation (this schema) ->
 * secure processing -> confirmation.
 *
 * No external CRM, scheduling, or payment integration is wired in yet.
 * The server action / route handler that consumes this schema is
 * responsible for the "secure processing" step and should not be built
 * until that flow is explicitly scoped.
 */
export const consultationRequestSchema = z.object({
  fullName: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z.string().min(5).max(30).optional(),
  practiceAreaSlug: z.string().min(1).optional(),
  message: z.string().min(10).max(4000),
  /** Honeypot field for basic spam mitigation; must stay empty. */
  companyWebsite: z.string().max(0).optional(),
});

export type ConsultationRequestInput = z.infer<
  typeof consultationRequestSchema
>;

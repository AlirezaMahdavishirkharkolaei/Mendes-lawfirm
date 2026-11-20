import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/**
 * Case-timeline titles written by the system are stored as keys
 * ("sys:case_opened", "sys:document_uploaded:<file>") and rendered in the
 * reader's language. Older rows stored in English are mapped too.
 * Titles typed by lawyers are shown as written.
 */
export function eventTitle(title: string, d: Pick<Dictionary, "portal">): string {
  const s = d.portal.sys;
  if (title === "sys:case_opened" || title === "Case opened") return s.caseOpened;
  if (title === "sys:details_updated" || title === "Case details updated") return s.detailsUpdated;
  const doc = /^(?:sys:document_uploaded:|Document uploaded: )(.*)$/.exec(title);
  if (doc) return `${s.documentUploaded}: ${doc[1]}`;
  return title;
}

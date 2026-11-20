import { describe, expect, it } from "vitest";
import { routeToMember } from "@/lib/routing";
import { classifyTopics } from "@/lib/topics";

const team = [
  { slug: "digdem-koc", specialties: ["real_estate", "company_formation", "litigation"], isReferralLead: false, isActive: true, sortOrder: 10 },
  { slug: "alireza-mahdavi", specialties: ["contract", "international_trade", "international_tax", "cybercrime"], isReferralLead: true, isActive: true, sortOrder: 20 },
  { slug: "nadia-arslan", specialties: ["immigration"], isReferralLead: true, isActive: true, sortOrder: 30 },
  { slug: "hidden", specialties: ["family"], isReferralLead: true, isActive: false, sortOrder: 5 },
];

describe("routeToMember", () => {
  it("sends contract, trade, tax and cybercrime matters to the referral lead", () => {
    for (const topic of ["contract", "international_trade", "international_tax", "cybercrime"] as const) {
      expect(routeToMember([topic], team)?.slug).toBe("alireza-mahdavi");
    }
  });
  it("prefers a referral lead even when listed after another topic", () => {
    expect(routeToMember(["real_estate", "cybercrime"], team)?.slug).toBe("alireza-mahdavi");
  });
  it("falls back to best coverage, then the first member", () => {
    expect(routeToMember(["real_estate"], team)?.slug).toBe("digdem-koc");
    expect(routeToMember(["family"], team)?.slug).toBe("digdem-koc");
  });
  it("ignores inactive members and returns null without topics", () => {
    expect(routeToMember([], team)).toBeNull();
    expect(routeToMember(["family"], team)?.slug).not.toBe("hidden");
  });
});

describe("classifyTopics (offline fallback)", () => {
  it("understands every site language", () => {
    expect(classifyTopics("Someone hacked our company email")).toContain("cybercrime");
    expect(classifyTopics("tapu devri ve arsa satın alma")).toContain("real_estate");
    expect(classifyTopics("می‌خواهم در قبرس شمالی شرکت ثبت کنم")).toContain("company_formation");
    expect(classifyTopics("нужен вид на жительство")).toContain("immigration");
    expect(classifyTopics("لدي نزاع حول عقد مع مورد")).toContain("contract");
  });
  it("does not treat a passing mention of 'company' as company formation", () => {
    expect(classifyTopics("my company's email was hacked")).not.toContain("company_formation");
  });
});

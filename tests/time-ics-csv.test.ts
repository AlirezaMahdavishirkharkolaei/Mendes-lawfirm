import { describe, expect, it } from "vitest";
import { addDays, dayInZone, isoWeekday, zonedToUtc } from "@/lib/time";
import { meetingIcs } from "@/lib/ics";
import { parseProspectCsv } from "@/lib/csv";
import { eventTitle } from "@/lib/case-events";
import fa from "@/lib/i18n/dictionaries/fa";

describe("time zones", () => {
  it("converts North Cyprus wall time to UTC across DST", () => {
    expect(zonedToUtc("2026-07-01", "09:00", "Asia/Famagusta").toISOString()).toBe("2026-07-01T06:00:00.000Z");
    expect(zonedToUtc("2026-01-15", "09:00", "Asia/Famagusta").toISOString()).toBe("2026-01-15T07:00:00.000Z");
  });
  it("handles days and weekdays", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(isoWeekday("2026-11-16")).toBe(1);
    expect(isoWeekday("2026-11-22")).toBe(7);
    expect(dayInZone(new Date("2026-11-19T22:30:00Z"), "Asia/Famagusta")).toBe("2026-11-20");
  });
});

describe("meetingIcs", () => {
  it("produces a valid, folded calendar event", () => {
    const ics = meetingIcs({ uid: "abc", start: new Date("2026-12-01T07:00:00Z"), minutes: 45, title: "Mendes — consultation", description: "Video link: https://meet.google.com/xyz-abcd-efg, see you", location: "Online" });
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART:20261201T070000Z");
    expect(ics).toContain("DTEND:20261201T074500Z");
    expect(ics).toContain("\\,");
    for (const line of ics.split("\r\n")) expect(line.length).toBeLessThanOrEqual(75);
  });
});

describe("parseProspectCsv", () => {
  it("parses quoted cells, skips the header and invalid e-mails", () => {
    const rows = parseProspectCsv('company,country,email\n"Bar, Inc",UK,info@bar.example,,,construction,en\nNo Mail Ltd,UAE,not-an-email\n');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ company: "Bar, Inc", country: "UK", email: "info@bar.example", interest: "construction" });
  });
});

describe("eventTitle", () => {
  it("translates system timeline entries", () => {
    expect(eventTitle("sys:case_opened", fa)).toBe(fa.portal.sys.caseOpened);
    expect(eventTitle("sys:document_uploaded:deed.pdf", fa)).toBe(`${fa.portal.sys.documentUploaded}: deed.pdf`);
    expect(eventTitle("Case opened", fa)).toBe(fa.portal.sys.caseOpened);
    expect(eventTitle("Hearing set for 12 May", fa)).toBe("Hearing set for 12 May");
  });
});

/** Minimal RFC 5545 calendar invitation for a booked meeting. */

function stamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Folds lines longer than 75 octets as the spec requires. */
function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = " " + rest.slice(74);
  }
  out.push(rest);
  return out.join("\r\n");
}

export function meetingIcs(opts: {
  uid: string;
  start: Date;
  minutes: number;
  title: string;
  description: string;
  location: string;
  organizerEmail?: string;
  organizerName?: string;
  cancelled?: boolean;
}): string {
  const end = new Date(opts.start.getTime() + opts.minutes * 60000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mendes Law & Consultancy//Platform//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${opts.cancelled ? "CANCEL" : "PUBLISH"}`,
    "BEGIN:VEVENT",
    `UID:${opts.uid}@mendes`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(opts.start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escapeText(opts.title)}`,
    `DESCRIPTION:${escapeText(opts.description)}`,
    `LOCATION:${escapeText(opts.location)}`,
    ...(opts.organizerEmail ? [`ORGANIZER;CN=${escapeText(opts.organizerName ?? "Mendes")}:mailto:${opts.organizerEmail}`] : []),
    `STATUS:${opts.cancelled ? "CANCELLED" : "CONFIRMED"}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(opts.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

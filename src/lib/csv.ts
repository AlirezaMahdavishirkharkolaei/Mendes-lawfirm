export const INTERESTS = ["investment", "construction", "company_formation", "other"] as const;

/** Parses CSV: company,country,email,contact_name,sector,interest,language,website,source */
export function parseProspectCsv(csv: string) {
  const rows = csv
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (rows.length && /company/i.test(rows[0])) rows.shift();
  return rows
    .map((line) => {
      const cells = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g)?.map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"').trim()) ?? [];
      const [company, country, email, contact_name, sector, interest, language, website, source] = cells;
      return { company, country, email, contact_name: contact_name || null, sector: sector || null, interest: (INTERESTS as readonly string[]).includes(interest) ? interest : "company_formation", language: language || "en", website: website || null, source: source || "csv import" };
    })
    .filter((r) => r.company && r.country && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email ?? ""));
}


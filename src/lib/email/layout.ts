import type { Locale } from "@/lib/i18n/config";
import { localeMeta } from "@/lib/i18n/config";

export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function nl2br(value: string): string {
  return esc(value).replace(/\n/g, "<br>");
}

export function button(href: string, label: string, tone: "gold" | "dark" | "outline" = "gold"): string {
  const styles = {
    gold: "background:#c9a96a;color:#0b0b0d;border:1px solid #c9a96a;",
    dark: "background:#141417;color:#f4efe6;border:1px solid #3a3426;",
    outline: "background:transparent;color:#8a6d3b;border:1px solid #c9a96a;",
  }[tone];
  return `<a href="${esc(href)}" style="${styles}display:inline-block;padding:14px 28px;margin:6px 8px 6px 0;font:600 14px/1 Helvetica,Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;border-radius:2px">${esc(label)}</a>`;
}

export function row(label: string, value: string): string {
  return `<tr><td style="padding:10px 0;border-bottom:1px solid #ece6da;color:#8a8170;font:12px/1.4 Helvetica,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;width:34%;vertical-align:top">${esc(label)}</td><td style="padding:10px 0 10px 16px;border-bottom:1px solid #ece6da;color:#1a1814;font:15px/1.5 Helvetica,Arial,sans-serif">${value}</td></tr>`;
}

export function table(rows: string[]): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:18px 0">${rows.join("")}</table>`;
}

/** Wraps content in the branded e-mail shell (inline styles for clients). */
export function shell(opts: { locale?: Locale; title: string; preheader?: string; body: string; firm?: string }): string {
  const dir = localeMeta[opts.locale ?? "en"].dir;
  const firm = esc(opts.firm ?? "Mendes");
  return `<!doctype html><html lang="${opts.locale ?? "en"}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#f4efe6">
<span style="display:none;opacity:0;max-height:0;overflow:hidden">${esc(opts.preheader ?? "")}</span>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4efe6;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e6dcc6">
<tr><td style="background:#0b0b0d;padding:28px 36px;border-bottom:2px solid #c9a96a">
<div style="font:400 26px/1 Georgia,'Times New Roman',serif;letter-spacing:.32em;color:#e8d5a8;text-transform:uppercase">${firm}</div>
<div style="margin-top:8px;font:11px/1 Helvetica,Arial,sans-serif;letter-spacing:.3em;color:#8a8170;text-transform:uppercase">Law · Consultancy · North Cyprus</div>
</td></tr>
<tr><td dir="${dir}" style="padding:36px;color:#1a1814;font:15px/1.65 Helvetica,Arial,sans-serif;text-align:${dir === "rtl" ? "right" : "left"}">
<h1 style="margin:0 0 18px;font:400 24px/1.3 Georgia,'Times New Roman',serif;color:#0b0b0d">${esc(opts.title)}</h1>
${opts.body}
</td></tr>
<tr><td style="padding:20px 36px;background:#faf7f1;border-top:1px solid #ece6da;color:#8a8170;font:12px/1.6 Helvetica,Arial,sans-serif">
${firm} — This message was sent by the firm's platform. Please do not share it if it contains confidential information.
</td></tr></table></td></tr></table></body></html>`;
}

export function toText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h1|h2|li)>/gi, "\n")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/gi, "$2: $1")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

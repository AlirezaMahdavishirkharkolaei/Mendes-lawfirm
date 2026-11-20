import { describe, expect, it } from "vitest";
import { plainExcerpt, readingMinutes, renderMarkdown } from "@/lib/markdown";

describe("renderMarkdown", () => {
  it("escapes raw HTML", () => {
    const html = renderMarkdown("<script>alert(1)</script> <img src=x onerror=alert(1)>");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
  });
  it("only allows http(s) and mailto links", () => {
    const html = renderMarkdown("[bad](javascript:alert(1)) [ok](https://example.com)");
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain('<a href="https://example.com" rel="nofollow noopener noreferrer" target="_blank">ok</a>');
  });
  it("renders headings, lists, quotes and emphasis", () => {
    const html = renderMarkdown("# Title\n\n- one\n- two\n\n1. a\n2. b\n\n> quoted\n\n**bold** and *italic*");
    expect(html).toContain("<h2>Title</h2>");
    expect(html).toContain("<ul><li>one</li><li>two</li></ul>");
    expect(html).toContain("<ol><li>a</li><li>b</li></ol>");
    expect(html).toContain("<blockquote><p>quoted</p></blockquote>");
    expect(html).toContain("<strong>bold</strong> and <em>italic</em>");
  });
});

describe("text helpers", () => {
  it("estimates reading time", () => {
    expect(readingMinutes("word ".repeat(440))).toBe(2);
    expect(readingMinutes("short")).toBe(1);
  });
  it("makes excerpts without markdown symbols", () => {
    expect(plainExcerpt("## Hello **world**", 50)).toBe("Hello world");
    expect(plainExcerpt("a ".repeat(200), 20).endsWith("…")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

describe("sanitizeHtml", () => {
  it("strips script tags", () => {
    const html = `<p>Hello</p><script>alert(1)</script>`;
    const out = sanitizeHtml(html);
    expect(out).toContain("Hello");
    expect(out.toLowerCase()).not.toContain("<script");
  });

  it("keeps safe links and adds rel", () => {
    const html = `<a href="https://example.com">link</a>`;
    const out = sanitizeHtml(html);
    expect(out).toContain("https://example.com");
    expect(out).toContain("noopener");
  });

  it("removes javascript: urls", () => {
    const html = `<a href="javascript:alert(1)">x</a>`;
    const out = sanitizeHtml(html);
    expect(out.toLowerCase()).not.toContain("javascript:");
  });
});

import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { extractR2ObjectKey } from "@/lib/r2-helpers";

describe("extractR2ObjectKey", () => {
  const prevPublic = process.env.R2_PUBLIC_URL;
  const prevDomain = process.env.NEXT_PUBLIC_R2_DOMAIN;

  beforeEach(() => {
    process.env.R2_PUBLIC_URL = "https://pub-example.r2.dev";
    process.env.NEXT_PUBLIC_R2_DOMAIN = "pub-example.r2.dev";
  });

  afterEach(() => {
    process.env.R2_PUBLIC_URL = prevPublic;
    process.env.NEXT_PUBLIC_R2_DOMAIN = prevDomain;
  });

  it("extracts object key from valid R2 URL", () => {
    const result = extractR2ObjectKey(
      "https://pub-example.r2.dev/1234-avatar.webp"
    );
    expect(result).toEqual({ ok: true, key: "1234-avatar.webp" });
  });

  it("rejects foreign host", () => {
    const result = extractR2ObjectKey("https://evil.com/secret.webp");
    expect(result.ok).toBe(false);
  });

  it("rejects path traversal", () => {
    const result = extractR2ObjectKey(
      "https://pub-example.r2.dev/../secret.webp"
    );
    expect(result.ok).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  isPrivateOrBlockedHostname,
  parsePublicHttpsUrl,
} from "@/lib/url-safety";

describe("url-safety", () => {
  it("blocks localhost and private ranges", () => {
    expect(isPrivateOrBlockedHostname("localhost")).toBe(true);
    expect(isPrivateOrBlockedHostname("127.0.0.1")).toBe(true);
    expect(isPrivateOrBlockedHostname("10.0.0.5")).toBe(true);
    expect(isPrivateOrBlockedHostname("192.168.1.1")).toBe(true);
    expect(isPrivateOrBlockedHostname("169.254.169.254")).toBe(true);
    expect(isPrivateOrBlockedHostname("example.com")).toBe(false);
  });

  it("rejects non-https and blocked hosts", () => {
    expect(parsePublicHttpsUrl("http://example.com").ok).toBe(false);
    expect(parsePublicHttpsUrl("https://127.0.0.1/x").ok).toBe(false);
    expect(parsePublicHttpsUrl("not-a-url").ok).toBe(false);
  });

  it("allows public https hosts", () => {
    const result = parsePublicHttpsUrl("https://www.facebook.com/foo");
    expect(result.ok).toBe(true);
  });

  it("enforces optional allowlist", () => {
    const ok = parsePublicHttpsUrl("https://www.facebook.com/x", [
      "facebook.com",
      "www.facebook.com",
    ]);
    expect(ok.ok).toBe(true);

    const bad = parsePublicHttpsUrl("https://evil.example.com/x", [
      "facebook.com",
    ]);
    expect(bad.ok).toBe(false);
  });
});

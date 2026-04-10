import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn utility", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles falsy values", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("handles conditional classes", () => {
    const condition = true;
    expect(cn("base", condition && "active")).toBe("base active");
    expect(cn("base", !condition && "active")).toBe("base");
  });

  it("handles arrays", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("handles objects", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });
});

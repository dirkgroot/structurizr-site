import { describe, expect, it } from "vitest";
import { SITE_NAME, siteName } from "./site";

describe("siteName", () => {
  it("uses the workspace name when present", () => {
    expect(siteName({ name: "My Architecture" })).toBe("My Architecture");
  });

  it("falls back to the site name when the workspace has no name", () => {
    expect(siteName({})).toBe(SITE_NAME);
  });

  it("falls back when the name is blank", () => {
    expect(siteName({ name: "   " })).toBe(SITE_NAME);
  });

  it("falls back when no workspace is loaded", () => {
    expect(siteName(undefined)).toBe(SITE_NAME);
  });
});

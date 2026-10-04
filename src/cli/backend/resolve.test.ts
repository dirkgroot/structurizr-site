import { describe, expect, it } from "vitest";
import { DEFAULT_STRUCTURIZR_COMMAND, resolveStructurizr } from "./resolve";

describe("resolveStructurizr", () => {
  it("defaults to structurizr on PATH", () => {
    expect(resolveStructurizr()).toBe(DEFAULT_STRUCTURIZR_COMMAND);
  });

  it("uses an explicit override", () => {
    expect(resolveStructurizr("java -jar structurizr.war")).toBe("java -jar structurizr.war");
  });

  it("ignores a blank override", () => {
    expect(resolveStructurizr("   ")).toBe(DEFAULT_STRUCTURIZR_COMMAND);
  });
});

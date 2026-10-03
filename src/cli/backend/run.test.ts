import { describe, expect, it, vi } from "vitest";
import { runStructurizr } from "./run.js";

describe("runStructurizr", () => {
  it("runs the resolved backend with the given args", async () => {
    const spawn = vi.fn().mockResolvedValue({ stdout: "", stderr: "" });

    await runStructurizr(["export", "-f", "json"], {}, spawn);

    expect(spawn).toHaveBeenCalledWith("structurizr", ["export", "-f", "json"]);
  });

  it("honours the override", async () => {
    const spawn = vi.fn().mockResolvedValue({ stdout: "", stderr: "" });

    await runStructurizr(["export"], { override: "java -jar structurizr.war" }, spawn);

    expect(spawn).toHaveBeenCalledWith("java -jar structurizr.war", ["export"]);
  });
});

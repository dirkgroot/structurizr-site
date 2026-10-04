import { describe, expect, it, vi } from "vitest";
import { exportJson } from "./export-json";

describe("exportJson", () => {
  it("invokes structurizr export with the json format and output directory", async () => {
    const spawn = vi.fn().mockResolvedValue({ stdout: "", stderr: "" });

    await exportJson({ workspaceFile: "workspace.dsl", outputDir: "/out/site" }, spawn);

    expect(spawn).toHaveBeenCalledWith("structurizr", [
      "export",
      "-w",
      "workspace.dsl",
      "-f",
      "json",
      "-o",
      "/out/site",
    ]);
  });

  it("passes the backend override through", async () => {
    const spawn = vi.fn().mockResolvedValue({ stdout: "", stderr: "" });

    await exportJson(
      { workspaceFile: "workspace.dsl", outputDir: "/out", structurizr: "my-structurizr" },
      spawn,
    );

    expect(spawn).toHaveBeenCalledWith("my-structurizr", expect.any(Array));
  });
});

import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateSite } from "./generate-site";

const { assemble } = vi.hoisted(() => ({ assemble: vi.fn() }));
const { exportJson } = vi.hoisted(() => ({ exportJson: vi.fn() }));
const { renderLandscape } = vi.hoisted(() => ({ renderLandscape: vi.fn() }));

vi.mock("../assembly/assemble.js", () => ({ assemble }));
vi.mock("../pipeline/export-json.js", () => ({ exportJson }));
vi.mock("../pipeline/render-landscape.js", () => ({ renderLandscape }));

describe("generateSite", () => {
  beforeEach(() => {
    assemble.mockReset();
    assemble.mockResolvedValue(undefined);
    exportJson.mockReset();
    exportJson.mockResolvedValue(undefined);
    renderLandscape.mockReset();
    renderLandscape.mockResolvedValue(undefined);
    vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("assembles into the default build directory", async () => {
    await generateSite({});
    expect(assemble).toHaveBeenCalledWith(resolve("build"));
    expect(process.stdout.write).toHaveBeenCalledWith(`Site written to ${resolve("build")}\n`);
  });

  it("resolves a relative output directory against the cwd", async () => {
    await generateSite({ output: "out/site" });
    expect(assemble).toHaveBeenCalledWith(resolve("out/site"));
  });

  it("keeps an absolute output directory", async () => {
    const output = resolve("somewhere/absolute");
    await generateSite({ output });
    expect(assemble).toHaveBeenCalledWith(output);
  });

  it("does not export a workspace when none is given", async () => {
    await generateSite({ output: "out" });
    expect(exportJson).not.toHaveBeenCalled();
    expect(renderLandscape).not.toHaveBeenCalled();
  });

  it("exports the workspace JSON into the output directory when a workspace file is given", async () => {
    await generateSite({ output: "out", workspaceFile: "workspace.dsl" });

    expect(exportJson).toHaveBeenCalledWith({
      workspaceFile: "workspace.dsl",
      outputDir: resolve("out"),
      structurizr: undefined,
    });
  });

  it("renders the landscape diagram after exporting the workspace", async () => {
    await generateSite({ output: "out", workspaceFile: "workspace.dsl", plantuml: "pu" });

    expect(renderLandscape).toHaveBeenCalledWith({
      workspaceFile: "workspace.dsl",
      outputDir: resolve("out"),
      structurizr: undefined,
      plantuml: "pu",
    });
  });

  it("assembles before exporting and rendering, so both land in the deployed directory", async () => {
    const order: string[] = [];
    assemble.mockImplementation(async () => {
      order.push("assemble");
    });
    exportJson.mockImplementation(async () => {
      order.push("exportJson");
    });
    renderLandscape.mockImplementation(async () => {
      order.push("renderLandscape");
    });

    await generateSite({ output: "out", workspaceFile: "workspace.dsl" });

    expect(order).toEqual(["assemble", "exportJson", "renderLandscape"]);
  });

  it("passes the structurizr override to the export", async () => {
    await generateSite({ output: "out", workspaceFile: "w.dsl", structurizr: "my-structurizr" });

    expect(exportJson).toHaveBeenCalledWith({
      workspaceFile: "w.dsl",
      outputDir: resolve("out"),
      structurizr: "my-structurizr",
    });
    expect(renderLandscape).toHaveBeenCalledWith({
      workspaceFile: "w.dsl",
      outputDir: resolve("out"),
      structurizr: "my-structurizr",
      plantuml: undefined,
    });
  });
});

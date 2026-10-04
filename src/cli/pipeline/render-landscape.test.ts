import { mkdir, mkdtemp, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderLandscape } from "./render-landscape.js";
import type { SpawnFn } from "../backend/run.js";

describe("renderLandscape", () => {
  let outputDir: string;
  let spawn: ReturnType<typeof vi.fn<SpawnFn>>;

  beforeEach(async () => {
    outputDir = await mkdtemp(join(tmpdir(), "structurizr-site-render-test-"));
    await mkdir(join(outputDir), { recursive: true });
    spawn = vi.fn<SpawnFn>().mockResolvedValue({ stdout: "", stderr: "" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function writeWorkspace(json: unknown): Promise<void> {
    return writeFile(join(outputDir, "workspace.json"), JSON.stringify(json));
  }

  it("returns without running backends when there is no system landscape view", async () => {
    await writeWorkspace({ views: { systemContextViews: [] } });

    await renderLandscape({ workspaceFile: "w.dsl", outputDir }, spawn);

    expect(spawn).not.toHaveBeenCalled();
  });

  it("exports PlantUML, renders SVG, and names it after the view key", async () => {
    await writeWorkspace({ views: { systemLandscapeViews: [{ key: "SystemLandscape-001" }] } });

    // Materialize the artifacts the real backends would write, keyed on the args.
    spawn.mockImplementation(async (command, args) => {
      if (args.includes("-f")) {
        const dir = args[args.indexOf("-o") + 1];
        await writeFile(join(dir, "structurizr-SystemLandscape-001.puml"), "@startuml\n");
      } else {
        const puml = args[args.length - 1];
        await writeFile(puml.replace(/\.puml$/, ".svg"), "<svg/>");
      }
      return { stdout: "", stderr: "" };
    });

    await renderLandscape(
      { workspaceFile: "w.dsl", outputDir, structurizr: "szr", plantuml: "pu" },
      spawn,
    );

    expect(spawn.mock.calls[0]).toEqual([
      "szr",
      ["export", "-w", "w.dsl", "-f", "plantuml/c4plantuml", "-o", expect.any(String)],
    ]);
    expect(spawn.mock.calls[1][0]).toBe("pu");
    expect(spawn.mock.calls[1][1][0]).toBe("-tsvg");
    expect(spawn.mock.calls[1][1][1]).toMatch(/structurizr-SystemLandscape-001\.puml$/);

    expect(await readdir(join(outputDir, "diagrams"))).toEqual(["SystemLandscape-001.svg"]);
  });
});

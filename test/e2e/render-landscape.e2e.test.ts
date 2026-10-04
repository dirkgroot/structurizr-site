import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defaultSpawn } from "../../src/cli/backend/run";
import { exportJson } from "../../src/cli/pipeline/export-json";
import { renderLandscape } from "../../src/cli/pipeline/render-landscape";

const fixture = resolve(fileURLToPath(new URL("../fixtures/workspace.dsl", import.meta.url)));

/**
 * Exercises the real Structurizr + PlantUML backends end to end
 * (DSL -> workspace.json -> puml -> SVG). Skipped when either tool is absent, so
 * the unit suite stays hermetic; CI's verify job does not install a backend.
 */
describe.skipIf(!(await hasAllBackends()))("renderLandscape (e2e)", () => {
  let outputDir: string;

  beforeEach(async () => {
    outputDir = await mkdtemp(join(tmpdir(), "structurizr-site-render-"));
  });

  afterEach(async () => {
    await rm(outputDir, { recursive: true, force: true });
  });

  it("renders the system landscape view to a plain SVG", async () => {
    await exportJson({ workspaceFile: fixture, outputDir });
    await renderLandscape({ workspaceFile: fixture, outputDir });

    const svg = await readFile(join(outputDir, "diagrams", "SystemLandscape-001.svg"), "utf8");
    expect(svg).toContain("<svg");
    expect(svg).toContain("System Landscape View");
    // Plain rendering: no links are injected, so no anchors are present.
    expect(svg).not.toContain("<a ");
  });
});

async function hasAllBackends(): Promise<boolean> {
  try {
    await defaultSpawn("structurizr", ["version"]);
    await defaultSpawn("plantuml", ["-version"]);
    return true;
  } catch {
    return false;
  }
}

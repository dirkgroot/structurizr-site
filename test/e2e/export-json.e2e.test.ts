import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defaultSpawn } from "../../src/cli/backend/run";
import { exportJson } from "../../src/cli/pipeline/export-json";

const fixture = resolve(fileURLToPath(new URL("../fixtures/workspace.dsl", import.meta.url)));

/**
 * Exercises the real Structurizr backend end to end (DSL -> workspace.json).
 * Skipped when `structurizr` is not on PATH, so the unit suite stays hermetic;
 * CI's verify job does not install a backend.
 */
describe.skipIf(!(await hasStructurizr()))("exportJson (e2e)", () => {
  let outputDir: string;

  beforeEach(async () => {
    outputDir = await mkdtemp(join(tmpdir(), "structurizr-site-export-"));
  });

  afterEach(async () => {
    await rm(outputDir, { recursive: true, force: true });
  });

  it("exports the workspace name into workspace.json", async () => {
    await exportJson({ workspaceFile: fixture, outputDir });

    const workspace = JSON.parse(await readFile(join(outputDir, "workspace.json"), "utf8"));
    expect(workspace.name).toBe("My Architecture");
  });
});

async function hasStructurizr(): Promise<boolean> {
  try {
    await defaultSpawn("structurizr", ["version"]);
    return true;
  } catch {
    return false;
  }
}

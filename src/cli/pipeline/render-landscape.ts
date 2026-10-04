import { mkdir, mkdtemp, readFile, rename, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DIAGRAMS_DIR, diagramFileName, systemLandscapeViewKey } from "../../shared/diagrams.js";
import type { Workspace } from "../../shared/workspace/index.js";
import { runPlantUml } from "../backend/plantuml.js";
import type { SpawnFn } from "../backend/run.js";
import { exportPlantUml } from "./export-plantuml.js";

export interface RenderLandscapeOptions {
  /** The workspace file used to export PlantUML (`.dsl` or `.json`). */
  workspaceFile: string;
  /** The output directory holding `workspace.json`; must already exist. */
  outputDir: string;
  /** `--structurizr` backend override. */
  structurizr?: string;
  /** `--plantuml` backend override. */
  plantuml?: string;
}

/**
 * Render the workspace's system landscape view to `<outputDir>/diagrams/<viewKey>.svg`.
 *
 * The web app addresses the asset by view key (see lode/architecture/routing.md),
 * so the file name comes from the view key in `workspace.json`. A workspace
 * without a system landscape view is a no-op. No links are injected or stripped:
 * this is plain rendering.
 */
export async function renderLandscape(
  options: RenderLandscapeOptions,
  spawnFn?: SpawnFn,
): Promise<void> {
  const workspace = JSON.parse(
    await readFile(join(options.outputDir, "workspace.json"), "utf8"),
  ) as Workspace;
  const viewKey = systemLandscapeViewKey(workspace);
  if (!viewKey) {
    return;
  }

  const workDir = await mkdtemp(join(tmpdir(), "structurizr-site-render-"));
  try {
    await exportPlantUml(
      {
        workspaceFile: options.workspaceFile,
        outputDir: workDir,
        structurizr: options.structurizr,
      },
      spawnFn,
    );

    await runPlantUml(
      ["-tsvg", join(workDir, `structurizr-${viewKey}.puml`)],
      { override: options.plantuml },
      spawnFn,
    );

    const diagramsDir = join(options.outputDir, DIAGRAMS_DIR);
    await rm(diagramsDir, { recursive: true, force: true });
    await mkdir(diagramsDir, { recursive: true });
    await rename(
      join(workDir, `structurizr-${viewKey}.svg`),
      join(diagramsDir, diagramFileName(viewKey)),
    );
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

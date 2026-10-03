import { runStructurizr, type SpawnFn } from "../backend/run.js";

export interface ExportJsonOptions {
  /** The workspace file (`.dsl` or `.json`) to export. */
  workspaceFile: string;
  /** Directory to write `workspace.json` into. Must already exist. */
  outputDir: string;
  /** `--structurizr` backend override. */
  structurizr?: string;
}

/**
 * Export the workspace as Structurizr JSON into `outputDir`, where Structurizr
 * writes it as `workspace.json`. This is the web app's runtime data source and
 * the input to the rest of the pipeline. See lode/architecture/diagrams.md.
 */
export async function exportJson(options: ExportJsonOptions, spawnFn?: SpawnFn): Promise<void> {
  await runStructurizr(
    ["export", "-w", options.workspaceFile, "-f", "json", "-o", options.outputDir],
    { override: options.structurizr },
    spawnFn,
  );
}

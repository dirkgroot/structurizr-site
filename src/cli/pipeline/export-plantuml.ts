import { runStructurizr, type SpawnFn } from "../backend/run.js";

export interface ExportPlantUmlOptions {
  /** The workspace file (`.dsl` or `.json`) to export. */
  workspaceFile: string;
  /** Directory to write `structurizr-<viewKey>.puml` files into. Must already exist. */
  outputDir: string;
  /** `--structurizr` backend override. */
  structurizr?: string;
}

/**
 * Export every view of the workspace as C4-PlantUML into `outputDir`. Structurizr
 * has no single-view export, so this emits `.puml` files for all views; the
 * caller renders only the ones it needs. See lode/architecture/diagrams.md.
 *
 * The `c4plantuml` format is hard-coded for now; making the exporter configurable
 * (`generatr.site.exporter`) comes later.
 */
export async function exportPlantUml(
  options: ExportPlantUmlOptions,
  spawnFn?: SpawnFn,
): Promise<void> {
  await runStructurizr(
    ["export", "-w", options.workspaceFile, "-f", "plantuml/c4plantuml", "-o", options.outputDir],
    { override: options.structurizr },
    spawnFn,
  );
}

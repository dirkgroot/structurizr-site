import { resolve } from "node:path";
import { DEFAULT_OUTPUT_DIR } from "../../shared/site";
import { assemble } from "../assembly/assemble";
import { exportJson } from "../pipeline/export-json";
import { renderLandscape } from "../pipeline/render-landscape";

export interface GenerateSiteOptions {
  output?: string;
  /** Structurizr workspace file to export; omit to emit the web app only. */
  workspaceFile?: string;
  /** `--structurizr` backend override. */
  structurizr?: string;
  /** `--plantuml` backend override. */
  plantuml?: string;
}

/**
 * Emit the deployable site directory: the prebuilt web app, `workspace.json`
 * exported from the workspace file, and the system landscape diagram. Rendering
 * runs after the export (assemble wipes the directory first) and after the
 * export so `workspace.json` is available. Link injection comes later.
 */
export async function generateSite(options: GenerateSiteOptions): Promise<void> {
  const outputDir = resolve(options.output ?? DEFAULT_OUTPUT_DIR);
  await assemble(outputDir);

  if (options.workspaceFile) {
    await exportJson({
      workspaceFile: options.workspaceFile,
      outputDir,
      structurizr: options.structurizr,
    });

    await renderLandscape({
      workspaceFile: options.workspaceFile,
      outputDir,
      structurizr: options.structurizr,
      plantuml: options.plantuml,
    });
  }

  process.stdout.write(`Site written to ${outputDir}\n`);
}

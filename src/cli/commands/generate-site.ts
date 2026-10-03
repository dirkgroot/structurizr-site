import { resolve } from "node:path";
import { DEFAULT_OUTPUT_DIR } from "../../shared/site.js";
import { assemble } from "../assembly/assemble.js";
import { exportJson } from "../pipeline/export-json.js";

export interface GenerateSiteOptions {
  output?: string;
  /** Structurizr workspace file to export; omit to emit the web app only. */
  workspaceFile?: string;
  /** `--structurizr` backend override. */
  structurizr?: string;
}

/**
 * Emit the deployable site directory: the prebuilt web app, plus `workspace.json`
 * exported from the workspace file when one is given. Diagram rendering and link
 * injection come later.
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
  }

  process.stdout.write(`Site written to ${outputDir}\n`);
}

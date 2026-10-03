import { resolve } from "node:path";
import { DEFAULT_OUTPUT_DIR } from "../../shared/site.js";
import { assemble } from "../assembly/assemble.js";

export interface GenerateSiteOptions {
  output?: string;
}

/**
 * Emit the deployable site directory. For now this only assembles the prebuilt
 * SPA; Structurizr export, diagram rendering, and link injection come later.
 */
export async function generateSite(options: GenerateSiteOptions): Promise<void> {
  const outputDir = resolve(options.output ?? DEFAULT_OUTPUT_DIR);
  await assemble(outputDir);
  process.stdout.write(`Site written to ${outputDir}\n`);
}

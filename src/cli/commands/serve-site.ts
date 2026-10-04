import { resolve } from "node:path";
import { DEFAULT_OUTPUT_DIR } from "../../shared/site";
import { DEFAULT_PORT, serve } from "../serve/serve";
import { generateSite } from "./generate-site";

export interface ServeSiteOptions {
  output?: string;
  port?: number;
  /** Structurizr workspace file to export; omit to serve the web app only. */
  workspaceFile?: string;
  /** `--structurizr` backend override. */
  structurizr?: string;
  /** `--plantuml` backend override. */
  plantuml?: string;
}

/**
 * Generate the deployable site, then serve it over HTTP until the process is
 * stopped. The web app uses hash routes, so a plain static file server suffices.
 */
export async function serveSite(options: ServeSiteOptions): Promise<void> {
  const outputDir = resolve(options.output ?? DEFAULT_OUTPUT_DIR);
  await generateSite({
    output: outputDir,
    workspaceFile: options.workspaceFile,
    structurizr: options.structurizr,
    plantuml: options.plantuml,
  });

  const server = await serve(outputDir, { port: options.port ?? DEFAULT_PORT });
  process.stdout.write(`Serving ${outputDir} at http://localhost:${server.port}\n`);
}

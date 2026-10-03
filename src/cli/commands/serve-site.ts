import { resolve } from "node:path";
import { DEFAULT_OUTPUT_DIR } from "../../shared/site.js";
import { DEFAULT_PORT, serve } from "../serve/serve.js";
import { generateSite } from "./generate-site.js";

export interface ServeSiteOptions {
  output?: string;
  port?: number;
}

/**
 * Generate the deployable site, then serve it over HTTP until the process is
 * stopped. The SPA uses hash routes, so a plain static file server suffices.
 */
export async function serveSite(options: ServeSiteOptions): Promise<void> {
  const outputDir = resolve(options.output ?? DEFAULT_OUTPUT_DIR);
  await generateSite({ output: outputDir });

  const server = await serve(outputDir, { port: options.port ?? DEFAULT_PORT });
  process.stdout.write(`Serving ${outputDir} at http://localhost:${server.port}\n`);
}

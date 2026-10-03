import { access, cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = dirname(fileURLToPath(import.meta.url));

/**
 * The prebuilt web app bundle next to the compiled CLI (`dist/cli/assembly/` ->
 * `dist/web/`). Used when running from the build output.
 */
const builtWebDir = resolve(moduleDir, "../../web");

/**
 * The web app directory for the compiled binary, where the bundle is embedded and
 * materialized to a temp directory at startup. Set by the binary entry point.
 */
let embeddedWebDir: string | undefined;

export function setWebBundleDir(dir: string): void {
  embeddedWebDir = dir;
}

/**
 * Copy the prebuilt web app into `outputDir`, replacing any previous contents.
 * `sourceDir` defaults to the embedded bundle (compiled binary) or the shipped
 * build output; it is injectable for tests.
 */
export async function assemble(
  outputDir: string,
  sourceDir: string = embeddedWebDir ?? builtWebDir,
): Promise<void> {
  try {
    await access(sourceDir);
  } catch {
    throw new Error(`prebuilt web app not found at ${sourceDir}; run "npm run build:web" first`);
  }

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await cp(sourceDir, outputDir, { recursive: true });
}

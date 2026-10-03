import { access, cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = dirname(fileURLToPath(import.meta.url));

/**
 * The prebuilt SPA bundle next to the compiled CLI (`dist/cli/assembly/` ->
 * `dist/spa/`). Used when running from the build output.
 */
const builtSpaDir = resolve(moduleDir, "../../spa");

/**
 * The SPA directory for the compiled binary, where the bundle is embedded and
 * materialized to a temp directory at startup. Set by the binary entry point.
 */
let embeddedSpaDir: string | undefined;

export function setSpaBundleDir(dir: string): void {
  embeddedSpaDir = dir;
}

/**
 * Copy the prebuilt SPA into `outputDir`, replacing any previous contents.
 * `sourceDir` defaults to the embedded bundle (compiled binary) or the shipped
 * build output; it is injectable for tests.
 */
export async function assemble(
  outputDir: string,
  sourceDir: string = embeddedSpaDir ?? builtSpaDir,
): Promise<void> {
  try {
    await access(sourceDir);
  } catch {
    throw new Error(`prebuilt SPA not found at ${sourceDir}; run "npm run build:spa" first`);
  }

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await cp(sourceDir, outputDir, { recursive: true });
}

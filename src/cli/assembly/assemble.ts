import { access, cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = dirname(fileURLToPath(import.meta.url));

/**
 * The prebuilt SPA bundle. Resolved relative to the compiled module so there is
 * no cross-package lookup: dist/cli/assembly/ -> dist/spa/.
 */
export const spaBundleDir = resolve(moduleDir, "../../spa");

/**
 * Copy the prebuilt SPA into `outputDir`, replacing any previous contents.
 * `sourceDir` defaults to the shipped bundle and is injectable for tests.
 */
export async function assemble(outputDir: string, sourceDir: string = spaBundleDir): Promise<void> {
  try {
    await access(sourceDir);
  } catch {
    throw new Error(`prebuilt SPA not found at ${sourceDir}; run "npm run build:spa" first`);
  }

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await cp(sourceDir, outputDir, { recursive: true });
}

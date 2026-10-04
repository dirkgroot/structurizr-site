import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = dirname(fileURLToPath(import.meta.url));

/**
 * The prebuilt web app bundle next to the bundled CLI (`dist/cli/bin.js` ->
 * `dist/web/`). Used when running from the build output.
 */
const builtWebDir = resolve(moduleDir, "../web");

/**
 * Relative path -> embedded file path for the compiled binary, where Bun embeds
 * the web app into the executable. Set by the binary entry point; the assembler
 * copies these files straight into the output directory, with no temp extraction.
 */
let embeddedWebAssets: Record<string, string> | undefined;

export function setWebBundleAssets(assets: Record<string, string> | undefined): void {
  embeddedWebAssets = assets;
}

/**
 * Copy the prebuilt web app into `outputDir`, replacing any previous contents.
 * The source is the embedded bundle when running from a compiled binary, or the
 * shipped build output otherwise. `sourceDir` overrides the latter for tests.
 */
export async function assemble(outputDir: string, sourceDir?: string): Promise<void> {
  if (!sourceDir && embeddedWebAssets) {
    await copyAssets(embeddedWebAssets, outputDir);
    return;
  }

  const dir = sourceDir ?? builtWebDir;
  try {
    await access(dir);
  } catch {
    throw new Error(`prebuilt web app not found at ${dir}; run "npm run build:web" first`);
  }

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await cp(dir, outputDir, { recursive: true });
}

/**
 * Write an embedded asset map (relative path -> source file) into `outputDir`.
 * Bun's embedded paths (`/$bunfs/...`) are read-only virtual files that `cp` and
 * `copyFile` cannot open, so each file is read and written directly.
 */
async function copyAssets(assets: Record<string, string>, outputDir: string): Promise<void> {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await Promise.all(
    Object.entries(assets).map(async ([relativePath, sourcePath]) => {
      const destination = join(outputDir, relativePath);
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, await readFile(sourcePath));
    }),
  );
}

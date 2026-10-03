// Build-only entry point for the compiled, self-contained binary. Not part of
// the shipped source tree and not covered by tsconfig.
//
// The web app is embedded into the binary by Bun (see packaging/binary/build.mjs).
// At startup we materialize the embedded files into a temp directory and point
// the assembler at it, then run the normal CLI.
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { setWebBundleDir } from "../../src/cli/assembly/assemble.ts";
import { run } from "../../src/cli/main.ts";
import { webAssets } from "../../dist/binary/web-assets.ts";

async function materializeWeb(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "structurizr-site-web-"));
  for (const [relativePath, embeddedPath] of Object.entries(webAssets)) {
    const destination = join(dir, relativePath);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, await readFile(embeddedPath));
  }
  return dir;
}

setWebBundleDir(await materializeWeb());

try {
  await run(process.argv.slice(2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`structurizr-site: ${message}`);
  process.exitCode = 1;
}

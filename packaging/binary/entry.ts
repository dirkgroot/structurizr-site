// Build-only entry point for the compiled, self-contained binary. Not part of
// the shipped source tree and not covered by tsconfig.
//
// The web app is embedded into the binary by Bun (see packaging/binary/build.mjs).
// The assembler copies the embedded files straight into the output directory, so
// there is no startup extraction step.
import { setWebBundleAssets } from "../../src/cli/assembly/assemble.ts";
import { run } from "../../src/cli/main.ts";
import { webAssets } from "../../dist/binary/web-assets.ts";

setWebBundleAssets(webAssets);

try {
  await run(process.argv.slice(2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`structurizr-site: ${message}`);
  process.exitCode = 1;
}

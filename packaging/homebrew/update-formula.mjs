#!/usr/bin/env node
// Fill in the `url` and `sha256` of structurizr-site.rb for the version in
// package.json. Run it after that version is published to npm:
//
//   node packaging/homebrew/update-formula.mjs
//
// Pass a tarball URL or a local tarball path to hash something other than the
// published tarball (useful before the first publish):
//
//   node packaging/homebrew/update-formula.mjs structurizr-site-0.1.0.tgz
//
// The formula is then copied into the Homebrew tap.
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");

const pkg = JSON.parse(await readFile(resolve(repoRoot, "package.json"), "utf8"));
const formulaPath = resolve(here, "structurizr-site.rb");
const formulaUrl = `https://registry.npmjs.org/${pkg.name}/-/${pkg.name}-${pkg.version}.tgz`;

const source = process.argv[2];
let tarball;
if (source && !source.startsWith("http")) {
  tarball = await readFile(resolve(process.cwd(), source));
} else {
  const url = source ?? formulaUrl;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`failed to download ${url}: ${response.status} ${response.statusText}`);
  }
  tarball = Buffer.from(await response.arrayBuffer());
}

const sha256 = createHash("sha256").update(tarball).digest("hex");

const formula = await readFile(formulaPath, "utf8");
const updated = formula
  .replace(/^(\s*url\s+").*(")$/m, `$1${formulaUrl}$2`)
  .replace(/^(\s*sha256\s+").*(")$/m, `$1${sha256}$2`);
await writeFile(formulaPath, updated);

console.log(`Updated ${formulaPath}`);
console.log(`  url:    ${formulaUrl}`);
console.log(`  sha256: ${sha256}`);

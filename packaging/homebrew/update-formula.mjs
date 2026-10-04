#!/usr/bin/env node
// Fill in the per-platform `url` and `sha256` of structurizr-site.rb from the
// GitHub release assets for the version in package.json. Run it after that
// version's GitHub release is published:
//
//   node packaging/homebrew/update-formula.mjs
//
// The rendered formula is written to a temp file and its path is printed; copy
// that file into the Homebrew tap. Pass `--output <path>` to write it somewhere
// else instead, such as the tap checkout:
//
//   node packaging/homebrew/update-formula.mjs --output <tap>/Formula/structurizr-site.rb
//
// Pass a local directory containing the four release assets to hash those
// instead of downloading them (useful before/without a release):
//
//   node packaging/homebrew/update-formula.mjs dist/binaries
//
// The assets are public, so Homebrew installs them without registry
// credentials and without notarization (formulas are not quarantined).
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");

let outputArg;
let localDir;
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--output") {
    outputArg = args[i + 1];
    i += 1;
  } else {
    localDir = args[i];
  }
}

const pkg = JSON.parse(await readFile(resolve(repoRoot, "package.json"), "utf8"));
const templatePath = resolve(here, "structurizr-site.rb.template");
const formulaPath = resolve(outputArg ?? join(tmpdir(), "structurizr-site.rb"));

const repoMatch = /github\.com[/:]([^/]+)\/([^/.]+)/.exec(pkg.repository.url);
if (!repoMatch) {
  throw new Error(`cannot derive GitHub owner/repo from ${pkg.repository.url}`);
}
const [, owner, repo] = repoMatch;

const PLATFORMS = ["darwin-arm64", "darwin-x64", "linux-x64", "linux-arm64"];

function token(platform) {
  return platform.toUpperCase().replaceAll("-", "_");
}

function assetName(platform) {
  return `structurizr-site-${platform}`;
}

function assetUrl(platform) {
  return `https://github.com/${owner}/${repo}/releases/download/v${pkg.version}/${assetName(platform)}`;
}

async function readAsset(platform, localDir) {
  if (localDir) {
    return readFile(resolve(process.cwd(), localDir, assetName(platform)));
  }
  const url = assetUrl(platform);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`failed to download ${url}: ${response.status} ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

const replacements = { __VERSION__: pkg.version };

for (const platform of PLATFORMS) {
  const bytes = await readAsset(platform, localDir);
  replacements[`__URL_${token(platform)}__`] = assetUrl(platform);
  replacements[`__SHA256_${token(platform)}__`] = createHash("sha256").update(bytes).digest("hex");
}

let formula = await readFile(templatePath, "utf8");
for (const [placeholder, value] of Object.entries(replacements)) {
  formula = formula.replaceAll(placeholder, value);
}
await writeFile(formulaPath, formula);

console.log(`Wrote ${formulaPath} from ${templatePath}`);
for (const platform of PLATFORMS) {
  console.log(`  ${platform}: ${replacements[`__SHA256_${token(platform)}__`]}`);
}

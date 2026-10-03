#!/usr/bin/env node
// Suggest the next version for a structurizr-site release.
//
// The project is pre-alpha and holds the 0.y.z version steady while the
// -pre-alpha.N counter increments (0.2.0-pre-alpha.1 -> 0.2.0-pre-alpha.2).
// git-cliff's --bumped-version does not understand that counter, so this
// script computes the suggestion from the unreleased commit types instead.
//
// Usage:
//   node .opencode/skills/release/scripts/suggest-version.mjs
//
// Output is plain text for the agent to present and the human to approve.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const root = process.cwd();

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

const pkg = JSON.parse(readFileSync(`${root}/package.json`, "utf8"));
const current = pkg.version;

let lastTag = "";
try {
  lastTag = git(["describe", "--tags", "--abbrev=0", "--match", "v[0-9]*"]);
} catch {
  // No tags yet; treat all history as unreleased.
}

const range = lastTag ? `${lastTag}..HEAD` : "HEAD";
const subjects = git(["log", range, "--pretty=format:%s"]).split("\n").filter(Boolean);

const TYPE_RE = /^(?<type>[a-zA-Z]+)(\((?<scope>[^)]*)\))?(?<breaking>!)?:/;
const BREAKING_BODY = /BREAKING[ -]CHANGE/;

const counts = new Map();
let hasBreaking = false;
let hasFeature = false;
let hasFix = false;

for (const subject of subjects) {
  const m = TYPE_RE.exec(subject);
  const type = m?.groups?.type?.toLowerCase() ?? "other";
  if (m?.groups?.breaking) hasBreaking = true;
  if (type === "feat") hasFeature = true;
  if (type === "fix" || type === "perf") hasFix = true;
  counts.set(type, (counts.get(type) ?? 0) + 1);
}

// Breaking changes can also be declared in the commit body.
if (!hasBreaking && subjects.length > 0) {
  try {
    const bodies = git(["log", range, "--pretty=format:%b"]);
    if (BREAKING_BODY.test(bodies)) hasBreaking = true;
  } catch {
    // ignore
  }
}

function nextPreAlpha(version) {
  const m = /^(?<base>\d+\.\d+\.\d+)-pre-alpha\.(?<n>\d+)$/.exec(version);
  if (m) {
    return `${m.groups.base}-pre-alpha.${Number(m.groups.n) + 1}`;
  }
  // Not yet on the counter scheme: start the counter on the current base.
  const base = version.split("-")[0];
  return `${base}-pre-alpha.1`;
}

const suggestion = nextPreAlpha(current);

const notable = [];
if (hasBreaking) notable.push("breaking change");
if (hasFeature) notable.push("feature");
if (hasFix) notable.push("fix");

const lines = [];
lines.push(`current:      ${current}`);
lines.push(`last tag:     ${lastTag || "(none)"}`);
lines.push(`commits since: ${subjects.length}`);
lines.push("");
lines.push("commit types:");
for (const [type, n] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
  lines.push(`  ${type.padEnd(10)} ${n}`);
}
lines.push("");
lines.push(`suggested:    ${suggestion}`);
if (notable.length > 0) {
  lines.push(`reason:       ${notable.join(", ")} since ${lastTag || "the start"}`);
} else {
  lines.push(`reason:       only maintenance commits — the counter still increments per release,`);
  lines.push(`              but releasing may not be worthwhile. Confirm with the human.`);
}
lines.push("");
lines.push("Promote to a new 0.y.z or drop the -pre-alpha suffix only by explicit human decision.");

console.log(lines.join("\n"));

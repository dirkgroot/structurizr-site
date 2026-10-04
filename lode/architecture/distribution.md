# Distribution & Packaging

How the CLI is packaged and shipped. Related: [summary.md](summary.md), [diagrams.md](diagrams.md),
[repository-layout.md](repository-layout.md).

## Decisions

- **Structurizr is an external runtime dependency, not vendored.** The legacy `structurizr-cli` is archived; vendoring it
  would freeze the DSL parser and block new DSL features. The maintained vNext tooling is invoked as an external
  command, so new DSL features arrive by updating Structurizr, independent of this tool's releases. Vendoring the
  prebuilt war is also not permitted (see Vendoring constraint), and vendoring the Apache-2.0 libraries would add an
  owned Java shim for self-containment this project does not need.
- **Distribution: self-contained binaries built with Bun.** Each `v*` tag compiles the CLI plus the embedded web app into
  four standalone executables (`darwin-arm64`, `darwin-x64`, `linux-x64`, `linux-arm64`) with `bun build --compile`,
  attached to a GitHub release. Nothing is published to a package registry.
- **Bun is the distribution runtime; Node is a build/test tool only.** The binary embeds the Bun runtime
  (JavaScriptCore), so users need no Node. Node + npm remain for Vite, Vitest, `tsc`, and the build scripts.
- **The web app is embedded in the binary.** `dist/web` is embedded at build time; the assembler copies the embedded files
  straight into the output directory, so there is no sidecar asset and no startup extraction. See
  [repository-layout.md](repository-layout.md).
- **macOS binaries are ad-hoc signed, not notarized.** They ship through a Homebrew _formula_, and formula downloads are
  not quarantined, so Gatekeeper does not demand notarization. Ad-hoc signing is still required for arm64 execution. A
  cask or browser download would require a paid Apple Developer notarization; both are rejected.
- **PlantUML stays a dependency.** `depends_on "plantuml"` pulls `graphviz` and `openjdk`. PlantUML is GPL-3.0, so it
  is not vendored into this distribution.
- **License: MIT.** Bun is MIT; the compiled binary embeds JavaScriptCore/WebKit, whose notices ship in
  `THIRD-PARTY-NOTICES.md`.

## Compiled binary

`packaging/binary/build.mjs` compiles `packaging/binary/entry.ts` with `bun build --compile` into
`dist/binaries/structurizr-site-<platform>` (one executable per target). The build embeds the web app and injects the
version; there are no runtime dependencies.

- **web app embedding.** `build.mjs` walks `dist/web` and generates `dist/binary/web-assets.ts`, importing each file with
  `{ type: "file" }` and mapping its original relative path to the embedded path. `entry.ts` registers that map via
  `setWebBundleAssets()` before `run()`; `assemble()` then copies each embedded file directly into the output directory.
  Bun content-hashes embedded names, so the explicit map is what preserves the `index.html` + `assets/*` layout.
- **Version injection.** `main.ts` reads `__STRUCTURIZR_SITE_VERSION__`, replaced at compile time via `--define`. When
  running from source the guard is false and it falls back to `package.json`.
- **Signing.** `build.mjs` ad-hoc signs each macOS binary (`codesign --force --sign -` with JIT entitlements from
  `packaging/binary/entitlements.plist`) and verifies it with `codesign --verify --strict`.
- **Sizes** are ~59 MB (darwin-arm64) to ~78 MB (linux). The binary embeds the Bun runtime.

`src/cli` still compiles to `dist/cli` via `tsc` for `npm run generate`/`serve` from source; that path is dev-only
and not shipped.

## Versioning

Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html). The project is **pre-alpha**, so the
version carries an explicit `-pre-alpha.N` pre-release identifier: `0.y.z` already marks initial development, and the
suffix makes the pre-alpha stage explicit and sorts before the eventual `0.2.0`. The counter increments per
pre-release. `release.yml` passes `--prerelease` to `gh release create` when the version contains a `-`, so pre-alpha
tags are never published as "Latest". The Homebrew formula is rendered from a published release's assets, so it pins a
published release rather than the `package.json` version.

## Release automation

- **CI** (`.github/workflows/ci.yml`) has two jobs. `verify` runs on Ubuntu: `npm ci`, `format:check`, `lint`,
  `typecheck`, `npm test`. `binary` runs on `macos-latest`: `build:web`, `build:binary` (native target, which signs and
  verifies on macOS), then runs the compiled binary for `--version` and `generate`. Node and Bun both come from
  `mise.toml` via `jdx/mise-action`.
- **Release** (`.github/workflows/release.yml`) triggers on `v*` tags, on `macos-latest`. It verifies the tag equals the
  `package.json` version, runs the checks, builds all four binaries (`build:binary:all`), smoke-tests the native binary,
  writes `SHA256SUMS`, generates the release notes from the changelog, and attaches the binaries and checksums to a
  GitHub release (`contents: write`, built-in `GITHUB_TOKEN`). No registry credentials are needed. Checkout uses
  `fetch-depth: 0` so git-cliff sees the full history and tags.
- **Changelog** is generated by `git-cliff` (pinned in `mise.toml`, config `cliff.toml`). `npm run changelog` writes
  `CHANGELOG.md` (with an `Unreleased` section); `npm run changelog:release` labels the unreleased commits with the
  `package.json` version and is run after bumping, before tagging. Release notes are `git cliff --latest --strip header`,
  so the changelog and the GitHub notes come from the same commit history. Commit messages follow Conventional Commits;
  non-conforming commits are grouped under `Other` rather than dropped.
- Cutting a release: bump `version`, run `npm run changelog:release`, commit both, then push a tag matching the new
  version (`git tag v<version> && git push origin v<version>`).

## Structurizr backend resolution

The CLI resolves a Structurizr backend, in order:

1. Explicit override: `--structurizr <command>` or an environment variable.
2. `structurizr` on `PATH` (Homebrew community build).
3. `java -jar <structurizr.war>` when a war path is configured.
4. Docker image `structurizr/structurizr`.

Minimum supported: `structurizr-*` 6.2.x, Java 21+.

Verified 2026-10-03 against vNext 2026.09.19 (`structurizr-*` 6.2.3): DSL → JSON, element `url` in JSON → `$link` in
PlantUML, PlantUML → SVG anchors. The pipeline is unchanged from the legacy CLI.

Trade-off: diagram output can change with upstream versions. To pin, point `--structurizr` at a specific war or Docker
tag.

## Homebrew formula

`packaging/homebrew/structurizr-site.rb.template` is the formula source, with per-platform `url`/`sha256` placeholders;
`packaging/homebrew/update-formula.mjs` fills them from the release assets and writes the rendered formula to a temp
file (`--output <path>` overrides the location). It is copied into the `homebrew-structurizr-site` tap; the repo never
stores it. The release skill works in a clone of the tap at the git-ignored `lode/tmp/homebrew-structurizr-site` and
commits from there, so nothing is ever written inside Homebrew's own directories.

The tap is `dirkgroot/homebrew-structurizr-site` (a public repo; formula at `Formula/structurizr-site.rb`). Installing
is `brew install dirkgroot/structurizr-site/structurizr-site`, which auto-taps on first use. The tap must stay public,
because Homebrew downloads the release assets anonymously and a private repo's asset URLs return 404 without a token.

The formula installs the platform binary directly; it has no `node` dependency. `openjdk`, the Structurizr backend, and
`plantuml` become dependencies when the diagram pipeline lands.

```ruby
class StructurizrSite < Formula
  desc "Static site generator for Structurizr workspaces"
  homepage "https://github.com/dirkgroot/structurizr-site"
  version "0.1.0"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.1.0/structurizr-site-darwin-arm64"
      sha256 "..."
    end

    on_intel do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.1.0/structurizr-site-darwin-x64"
      sha256 "..."
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.1.0/structurizr-site-linux-arm64"
      sha256 "..."
    end

    on_intel do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.1.0/structurizr-site-linux-x64"
      sha256 "..."
    end
  end

  def install
    bin.install Dir["structurizr-site-*"].first => "structurizr-site"
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/structurizr-site --version")
  end
end
```

## Vendoring constraint

The prebuilt vNext `.war` is **not redistributable**. It bundles the open-core server under an End-User License
Agreement (embedded at `com/structurizr/server/web/eula/`) that grants download/install/use but prohibits distribution:
"distribute, transmit, host, outsource, disclose or otherwise commercially exploit the Application or make the
Application available to any third party", and prohibits derivative works. The `export` command is free to _use_ from
the binary, but that is a use right, not a redistribution right.

Homebrew's `structurizr` formula sidesteps this by building from the Apache-2.0 source (`mvn package`) instead of
redistributing the war.

Consequence: if the backend is ever vendored, it must be built from the Apache-2.0 source or assembled from the
Apache-2.0 Maven Central artifacts (`com.structurizr:structurizr-dsl` and friends) plus an owned shim — never the
prebuilt war.

## Constraints

- The compiled binary is large (~59–78 MB) because it embeds the Bun runtime. Homebrew downloads it directly; nothing is
  built at install time.
- Bun is pinned in `mise.toml` (currently `1.4.2`). `bun build --compile` had a macOS signing regression in 1.3.12; the
  build re-signs ad-hoc and runs `codesign --verify --strict` on every macOS binary, and CI executes the binary, to
  catch such regressions.
- macOS binaries are ad-hoc signed, so they run when installed by Homebrew (downloads are not quarantined) but would be
  blocked by Gatekeeper if downloaded through a browser. Notarization (paid Apple Developer Program) is deliberately not
  used.
- The binary embeds JavaScriptCore/WebKit (LGPL-2.1 + BSD components); `THIRD-PARTY-NOTICES.md` carries the notices.
- The Homebrew `structurizr` formula is a **community build**, not maintained by Structurizr. Users who want the newest
  features override the backend with their own war or Docker image.
- PlantUML is GPL-3.0; it is depended on, not redistributed.
- Java 21+ is required by vNext.

## Open

- Whether the formula depends on the community `structurizr` build or requires a user-provided backend.
- Whether to offer an opt-in pinned backend for reproducible output.
- When to add `openjdk` / Structurizr / `plantuml` formula dependencies (tied to the diagram pipeline).
- Whether the release workflow should update the tap automatically instead of by hand.
- Whether to add a Windows target (currently macOS + Linux only).
- Whether to notarize later to support a cask or browser downloads.

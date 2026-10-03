# Distribution & Packaging

How the CLI is packaged and shipped. Related: [summary.md](summary.md), [diagrams.md](diagrams.md),
[repository-layout.md](repository-layout.md).

## Decisions

- **Structurizr is an external runtime dependency, not vendored.** The legacy `structurizr-cli` is archived; vendoring it
  would freeze the DSL parser and block new DSL features. The maintained vNext tooling is invoked as an external
  command, so new DSL features arrive by updating Structurizr, independent of this tool's releases. Vendoring the
  prebuilt war is also not permitted (see Vendoring constraint), and vendoring the Apache-2.0 libraries would add an
  owned Java shim for self-containment this project does not need.
- **Node is a runtime dependency, not bundled.** The Homebrew formula declares `depends_on "node"`. The tool already
  needs Java and Graphviz, so bundling Node would not make it self-contained. Homebrew is the dependency manager.
- **PlantUML stays a dependency.** `depends_on "plantuml"` pulls `graphviz` and `openjdk`. PlantUML is GPL-3.0, so it
  is not vendored into this distribution.
- **SPA bundle ships as package files.** The prebuilt SPA is included in the npm package; it is not built or fetched at
  install time. See [repository-layout.md](repository-layout.md) for the package layout.
- **Distribution: GitHub release with the packed tarball as an asset.** Each `v*` tag produces a GitHub release whose
  asset is the `npm pack` tarball. Homebrew installs from that asset, so installation needs no registry credentials.
  Nothing is published to a package registry.
- **GitHub Packages is not used.** Its npm registry requires an auth token even for public installs, which would break
  `brew install`. A GitHub release asset is public and works with the standard Homebrew npm-formula pattern.
- **License: MIT.** `LICENSE` ships in the package and the Homebrew formula declares `license "MIT"`.

## Packaged tarball

`npm pack` ships `dist/` plus npm's always-included `package.json`, `README.md`, and `LICENSE`:

- `dist/cli/` — the compiled CLI; `bin` maps `structurizr-site` to `dist/cli/bin.js`.
- `dist/spa/` — the prebuilt React + Vite bundle the CLI copies into the generated site.

`package.json` sets `files: ["dist", "!dist/**/*.map"]`: source maps are built for local debugging but excluded from the
tarball. `prepack` runs `clean` then `build`, so `dist/` is always fresh when the release workflow runs `npm pack`. The
package has no runtime dependencies — every entry in `package.json` is a dev dependency.

## Release automation

- **CI** (`.github/workflows/ci.yml`) runs on pushes to `main` and on pull requests: `npm ci`, `format:check`, `lint`,
  `typecheck`, `npm test`, and `npm pack --dry-run`. Node comes from `mise.toml` via `jdx/mise-action`.
- **Release** (`.github/workflows/release.yml`) triggers on `v*` tags. It verifies the tag equals the `package.json`
  version, runs the checks (including `npm test`), runs `npm pack`, then attaches the tarball to a GitHub release
  (`contents: write`, using the built-in `GITHUB_TOKEN`). No registry credentials are needed.
- Cutting a release is only: bump `version`, commit, then `git tag v0.1.0 && git push origin v0.1.0`.

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

`packaging/homebrew/structurizr-site.rb` is the formula template; `packaging/homebrew/update-formula.mjs` fills its
`url` and `sha256` from the GitHub release asset for the version in `package.json`. The result is copied into the
`homebrew-structurizr-site` tap.

The formula currently depends on `node` only, because the generator does not yet invoke Structurizr or render diagrams.
`openjdk`, the Structurizr backend, and `plantuml` become dependencies when the pipeline lands.

```ruby
class StructurizrSite < Formula
  desc "Static site generator for Structurizr workspaces"
  homepage "https://github.com/dirkgroot/structurizr-site"
  url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.1.0/structurizr-site-0.1.0.tgz"
  sha256 "..."
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink libexec.glob("bin/*")
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

- Homebrew's `std_npm_args` installs a packed tarball and ignores lifecycle scripts by default. The tarball ships the
  prebuilt CLI JS and SPA bundle; nothing builds or fetches at install time.
- The Homebrew `structurizr` formula is a **community build**, not maintained by Structurizr. Users who want the newest
  features override the backend with their own war or Docker image.
- PlantUML is GPL-3.0; it is depended on, not redistributed.
- Java 21+ is required by vNext.

## Open

- Whether the formula depends on the community `structurizr` build or requires a user-provided backend.
- Whether to offer an opt-in pinned backend for reproducible output.
- When to add `openjdk` / Structurizr / `plantuml` formula dependencies (tied to the diagram pipeline).
- Whether the release workflow should update the tap automatically instead of by hand.

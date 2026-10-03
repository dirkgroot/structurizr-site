# Distribution & Packaging

How the CLI is packaged and shipped. Related: [summary.md](summary.md), [diagrams.md](diagrams.md).

## Decisions

- **Structurizr is an external runtime dependency, not vendored.** The legacy `structurizr-cli` is archived; vendoring it
  would freeze the DSL parser and block new DSL features. The maintained vNext tooling is invoked as an external
  command, so new DSL features arrive by updating Structurizr, independent of this tool's releases.
- **Node is a runtime dependency, not bundled.** The Homebrew formula declares `depends_on "node"`. The tool already
  needs Java and Graphviz, so bundling Node would not make it self-contained. Homebrew is the dependency manager.
- **PlantUML stays a dependency.** `depends_on "plantuml"` pulls `graphviz` and `openjdk`. PlantUML is GPL-3.0, so it
  is not vendored into this distribution.
- **SPA bundle ships as package files.** The prebuilt SPA is included in the npm package; it is not built or fetched at
  install time.

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

## Homebrew formula shape

```ruby
class StructurizrSite < Formula
  desc "Static site generator for Structurizr workspaces"
  homepage "https://github.com/you/structurizr-site"
  url "https://registry.npmjs.org/@you/structurizr-site/-/structurizr-site-0.1.0.tgz"
  sha256 "..."
  license "Apache-2.0"

  depends_on "node"
  depends_on "openjdk"      # 21+
  depends_on "structurizr"  # community build; see Open
  depends_on "plantuml"     # pulls graphviz + openjdk

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink libexec.glob("bin/*")
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/structurizr-site --version")
  end
end
```

This is a tap (`brew tap you/structurizr-site`), not homebrew-core.

## Vendoring constraint

The prebuilt vNext `.war` is **not redistributable**. It bundles the open-core server under an End-User License
Agreement (embedded at `com/structurizr/server/web/eula/`) that grants download/install/use but prohibits distribution:
"distribute, transmit, host, outsource, disclose or otherwise commercially exploit the Application or make the
Application available to any third party", and prohibits derivative works. The `export` command is free to *use* from
the binary, but that is a use right, not a redistribution right.

Homebrew's `structurizr` formula sidesteps this by building from the Apache-2.0 source (`mvn package`) instead of
redistributing the war.

Consequence: if the backend is ever vendored, it must be built from the Apache-2.0 source or assembled from the
Apache-2.0 Maven Central artifacts (`com.structurizr:structurizr-dsl` and friends) plus an owned shim — never the
prebuilt war.

## Constraints

- Homebrew's `std_npm_args` installs a packed tarball and ignores lifecycle scripts by default. Ship the prebuilt CLI JS
  and the prebuilt SPA bundle as package files; do not build or fetch at install time.
- The Homebrew `structurizr` formula is a **community build**, not maintained by Structurizr. Users who want the newest
  features override the backend with their own war or Docker image.
- PlantUML is GPL-3.0; it is depended on, not redistributed.
- Java 21+ is required by vNext.

## Open

- Whether the formula depends on the community `structurizr` build or requires a user-provided backend.
- Whether to vendor an Apache-2.0 backend (libraries + shim, or source build) for self-containment and reproducible
  output, versus depending on an external vNext install. The prebuilt war is not an option (see Vendoring constraint).
- Primary distribution channel: npm package vs GitHub release tarball; Homebrew is a convenience wrapper either way.
- Whether to offer an opt-in pinned backend for reproducible output.

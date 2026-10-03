# Distribution & Packaging

How the CLI is packaged and shipped. Related: [summary.md](summary.md), [diagrams.md](diagrams.md).

## Decisions

- **Vendored Structurizr artifact.** The Structurizr DSL/export jars ship with the tool and are invoked via `java`,
  rather than resolved from Homebrew. This pins diagram output and avoids the deprecated `structurizr-cli` formula
  and version drift.
- **Node is a runtime dependency, not bundled.** The Homebrew formula declares `depends_on "node"`. The tool already
  needs Java and Graphviz, so bundling Node would not make it self-contained. Homebrew is the dependency manager.
- **PlantUML stays a dependency.** `depends_on "plantuml"` pulls `graphviz` and `openjdk`. PlantUML is GPL-3.0, so it
  is not vendored into this distribution.
- **SPA bundle ships as package files.** The prebuilt SPA is included in the npm package; it is not built or fetched at
  install time.

## Homebrew formula shape

```ruby
class StructurizrSite < Formula
  desc "Static site generator for Structurizr workspaces"
  homepage "https://github.com/you/structurizr-site"
  url "https://registry.npmjs.org/@you/structurizr-site/-/structurizr-site-0.1.0.tgz"
  sha256 "..."
  license "Apache-2.0"

  depends_on "node"
  depends_on "openjdk"    # invoked directly for the vendored Structurizr jars
  depends_on "plantuml"   # pulls graphviz + openjdk

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

## Constraints

- Homebrew's `std_npm_args` installs a packed tarball and ignores lifecycle scripts by default. Ship the prebuilt CLI JS
  and the prebuilt SPA bundle as package files; do not build or fetch at install time.
- The vendored Structurizr jars are Apache-2.0. PlantUML (GPL-3.0) is depended on, not redistributed.
- The CLI invokes `java` for the vendored jars and `plantuml` for SVG rendering; both must be on `PATH` at runtime.

## Open

- Which Structurizr artifact to vendor: the legacy `structurizr-cli` release `lib/` (Apache-2.0, closest to the
  reference behavior line) or the vNext Spring Boot war. This determines the invocation.
- Java version floor (vNext requires 17+).
- Primary distribution channel: npm package vs GitHub release tarball; Homebrew is a convenience wrapper either way.

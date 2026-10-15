# Original Tool: structurizr-site-generatr

The tool being rewritten. Source of truth: https://github.com/avisi-cloud/structurizr-site-generatr (Apache-2.0), demo at https://avisi-cloud.github.io/structurizr-site-generatr/.

## What it is

A Kotlin/JVM static site generator for C4 architecture models written in Structurizr DSL. Input is a workspace DSL file (plus assets), either local or from a git repository; output is a fully static website with diagrams, documentation, ADRs, and search, hostable on any static web server.

## Observed command surface

From the README (not yet a full inventory of options):

```
structurizr-site-generatr generate-site
    --git-url https://github.com/avisi-cloud/structurizr-site-generatr.git
    --workspace-file docs/example/workspace.dsl
    --assets-dir docs/example/assets
    --branches main,future,old
    --default-branch main
```

- Branch selection: explicit `--branches`, `--all-branches` with `--exclude-branches`, and a `--default-branch`.

## Feature surface (parity target)

- Diagrams from workspace views; rendering via Structurizr's C4-PlantUML exporter and Mermaid.
- Documentation: Markdown and AsciiDoc (asciidoctorj), math via KaTeX.
- ADRs (`.adr-dir` marker in the example workspace).
- Images / assets directory support.
- Multi-branch sites with a default branch.
- Themes, to the extent C4-PlantUML supports them (`c4plantuml.tags` workspace property).
- Client-side search (lunr, with lunr-languages).

## Stack signals (from release notes)

Kotlin 2.x on Java 21, Gradle; Structurizr Java libraries; PlantUML; Mermaid 11; KaTeX; asciidoctorj; jsoup; JGit; Jetty (role TBD — likely local preview serving, unverified); Playwright (UI tests); lunr + lunr-languages.

## Distribution

- Fat jar.
- Docker image `ghcr.io/avisi-cloud/structurizr-site-generatr`, cosign-verifiable.

## Rendering pipeline (inferred, not verified)

Build time: DSL → workspace (Structurizr Java parser) → C4-PlantUML → static SVGs per view; docs/ADRs read from the filesystem and rendered to HTML. Client side: Mermaid and KaTeX render in the browser; lunr provides search.

Related: [structurizr-ecosystem.md](structurizr-ecosystem.md) · drives the parity checklist in [../plans/rewrite.md](../plans/rewrite.md).

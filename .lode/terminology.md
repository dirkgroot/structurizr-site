# Terminology

Repository of short (term - meaning) lines describing the domain language.

## C4 / Structurizr

- C4 model - abstraction levels for describing software architecture: Context, Container, Component, Code.
- Structurizr - tooling ecosystem (DSL, JSON format, cloud/on-premises server, CLI) built around the C4 model.
- Structurizr DSL - text language for defining a workspace (`workspace.dsl`).
- Workspace - the unit of Structurizr content: model + views + documentation + decisions + configuration.
- Workspace JSON - JSON serialization of a workspace. Carries element/view layout coordinates when produced by Structurizr tooling; DSL-only sources have no layout.
- View - a diagram definition inside the workspace (SystemContext, Container, Component, Deployment, Dynamic, Filtered, Image views), addressed by key.
- `!docs` - DSL directive that reads documentation files and inlines them into the workspace.
- `!adrs` - DSL directive that reads architecture decision records and inlines them into the workspace.
- Theme - named element/relationship styling; in the original tool surfaced via C4-PlantUML tags.

## Original tool

- Structurizr Site Generatr - the original avisi-cloud tool being rewritten (see [background/original-tool.md](background/original-tool.md)).
- Branch - a git branch of the input repository; the original tool builds one site per branch with a default branch.

## New system

- SPA - the single-page application UI (locked decision; replaces generated static HTML).
- CLI - the Rust command-line tool, binary `structurizr-site` (locked decision).
- `generate` - the CLI subcommand: exports the workspace via the `structurizr` CLI, then copies the SPA into the output directory. Flags: `--workspace` (default `workspace.dsl`), `--output` (default `build`), `--router` (`hash`|`path`, default `hash`), `--base-path` (path-router hosting prefix, default `/`).
- Router mode - the generate-time choice of how page URLs are formed: `hash` (`index.html#/…`, any static host, no configuration) or `path` (clean URLs, needs SPA-fallback hosting). Decided per `generate` run, not per SPA build; the SPA bundle is shared.
- Base path - the path below the domain root that a path-router site is hosted under (e.g. `/docs/`); the CLI rebases asset URLs onto it and injects it into the page. Rejected with `--router hash`.
- `window.site` - inline `<script>` global the CLI injects into `index.html` for path-router sites (`{"router":"path","basePath":…}`); absent in hash mode, where the SPA defaults to hash routing.
- Page routes - the SPA's client-side routes: `/` (workspace home), `/software-systems/:id` (software system), `*` (not found).
- Output directory - where `generate` writes the site; default `build`. Not cleaned between runs.
- `workspace.json` - the exported workspace JSON placed next to `index.html`; the SPA fetches it as `./workspace.json`. The `structurizr` CLI names exports after the input file, so `generate` renames them.
- `web/` - the Vite + React + TypeScript SPA project; built into `web/dist` and embedded into the binary via rust-embed.
- `cli/` - the standalone Rust CLI crate (own `Cargo.toml`/`Cargo.lock`; the repo root has no cargo files).
- Site bundle - the contents of the output directory (SPA assets + workspace.json). Realized by `generate`; the earlier tentative name for the CLI output.

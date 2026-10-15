# Structurizr Ecosystem

Official and community tooling relevant to the rewrite. Researched 2026-10-15.

## Official: structurizr-cli static-site export

`structurizr-cli export -format static-site` generates a static site (diagrams only, no docs/ADRs) whose client-side viewer reads workspace JSON at runtime — an existence proof for our SPA-reads-JSON architecture.

- Accepts both DSL and JSON workspaces and processes them the same way.
- `export -f json -o <dir>` writes `<input basename>.json` into the output dir (verified locally, structurizr 2026.09.19); consumers must normalize the file name.
- Embedding via iframe + `structurizr-embed.js`; `postMessage()` used for iframe height.
- Introduction modal suppressed via a `structurizr.introduction` workspace property.

## Layout in workspace JSON

Per official docs: the JSON form of a workspace has layout information, the DSL form does not. Workspaces with manual layout (made in Structurizr local/server) require the JSON form; with automatic layout, either works. Any component rendering DSL-derived content must handle layout-less views.

## DSL parser: browser vs local feature matrix

Per official docs (docs.structurizr.com/dsl/parser):

| Feature | Local CLI | Browser context |
| --- | --- | --- |
| Diagrams | Yes | Yes |
| `!docs` | Yes | No |
| `!adrs` | Yes | No |
| Image views | Yes | HTTP(S) URLs + data URIs only |
| Element style icons | Yes | HTTP(S) URLs + data URIs only |
| Workspace `extends` | Yes | HTTP(S) URLs only |
| DSL includes | Yes | HTTP(S) URLs only |
| Plugins / scripts | Yes | No |

Implication for the new system: anything requiring filesystem access (`!docs`, `!adrs`, local includes) must happen in a build-time step, not in the SPA. See [../architecture/open-questions.md](../architecture/open-questions.md).

## Playground

Free, open source, browser-based DSL playground (playground.structurizr.com): parses DSL and renders diagrams client-side, including auto-layout. Candidate source for reusable client-side parse/render code. License to be verified before vendoring.

## structurizr-embed.js

Official client-side embed script, served from static.structurizr.com and included in static-site export output.

## Community ports / parsers (surveyed, not evaluated)

- `structurizr-typescript` (ChristianEder) — port of Structurizr for .NET to TypeScript; partial: model entities, views, styles/themes, docs sections + decisions, auto-layout, PlantUML export.
- `structurizr-parser` — TypeScript utility for parsing DSL files.
- Go DSL parser library (parse/validate/generate).
- `spacerizr` (MIT, 2026) — TS `parseDSL`/`parseJSON` + embeddable 2D/3D viewer API; small adoption; watch-list only.

Related: [original-tool.md](original-tool.md) · [../architecture/open-questions.md](../architecture/open-questions.md)

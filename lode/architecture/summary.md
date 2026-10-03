# Architecture

> **Status: top-level shape defined; component details still open.** The owner has fixed the build/runtime split (see
> Decisions). Split into focused files (e.g. `pipeline.md`, `renderer.md`, `spa.md`, `cli.md`) as the design grows.

## Shape

The generator is a CLI that produces a **deployable static directory**. There is no server and no per-element
generated HTML. Instead:

- The CLI exports the workspace as **Structurizr JSON**.
- The CLI renders each view to a static **diagram asset**.
- The CLI assembles a prebuilt **SPA** into the output directory.
- The SPA runs in the browser, fetches the JSON and diagrams, and renders the whole site client-side.

The output directory is self-contained and deployable to any static host (NGINX, GitHub Pages, object storage).

```mermaid
flowchart LR
    DSL[workspace.dsl] --> CLI[Generator CLI]
    CLI -->|renders| DIAG[Diagram assets]
    CLI -->|exports| JSON[workspace.json]
    CLI -->|copies| SPA[SPA bundle]
    DIAG --> OUT[Output directory]
    JSON --> OUT
    SPA --> OUT
    OUT -->|deploy| HOST[Static host]
    HOST -->|fetch JSON + assets| BROWSER[Browser SPA]
```

## Decisions

- **D1 — Client-rendered site.** The site is an SPA, not generated HTML. The workspace is consumed as exported
  Structurizr JSON at runtime, not baked into pages at build time.
- **D2 — CLI produces a deployable directory.** `generate-site` renders diagrams, exports JSON, and assembles the SPA
  plus diagrams plus JSON into one directory ready for a static host.
- **D3 — Hosting is static and external.** NGINX / GitHub Pages / similar. No application server.
- **D4 — Hash-based routes.** Drill-down links and SPA navigation use hash routes (`#/...`), so SVG anchors work
  without static-host fallback or click interception. See [diagrams.md](diagrams.md).
- **D5 — Vendored Structurizr artifact.** The Structurizr DSL/export jars ship with the tool and are invoked via `java`,
  pinning diagram output instead of depending on the deprecated `structurizr-cli` formula. See
  [distribution.md](distribution.md).
- **D6 — Node is a dependency, not bundled.** The tool already needs Java and Graphviz, so bundling Node would not make
  it self-contained; Homebrew manages the runtime. See [distribution.md](distribution.md).

## Known constraints

- Consumes a Structurizr DSL workspace (optionally a Git repository with multiple branches).
- Must support `generate-site` and `serve` (watch + live rebuild) modes.
- Behavior matches the reference tool unless the owner decides otherwise. The reference tool's output behavior
  (navigation, documentation, ADRs) is now the SPA's responsibility. See [../terminology.md](../terminology.md).

## Open questions (awaiting owner)

1. Language/runtime for the CLI and the SPA framework.
2. Diagram asset format and renderer (reuse the PlantUML exporter? SVG? PNG?). **Partially resolved:** SVG rendered via
   PlantUML, with clickable drill-down links driven through the workspace JSON. See [diagrams.md](diagrams.md). The
   exact CLI runtime is still open.
3. How documentation and ADRs are represented (markdown rendered by the SPA? pre-rendered?).
4. Whether anything is pre-rendered for SEO / no-JS.
5. CLI distribution and where the prebuilt SPA bundle lives. **Resolved:** vendored Structurizr jars, Node as a
   dependency, SPA shipped in the package. See [distribution.md](distribution.md).
6. How `generatr.*` properties map into the new design.

## Decisions log

- **D1–D3** — captured 2026-10-03 from owner direction: SPA reads Structurizr JSON from a static host; CLI emits a
  deployable directory (diagrams + JSON + SPA).
- **D4** — captured 2026-10-03: hash-based routes for SPA navigation and SVG drill-down links.
- **D5–D6** — captured 2026-10-03: vendor a version-pinned Structurizr artifact; Node is a dependency, not bundled. See
  [distribution.md](distribution.md).
- Diagram link mechanism and TS pipeline verified 2026-10-03; see [diagrams.md](diagrams.md).

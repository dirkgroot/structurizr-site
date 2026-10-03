# Architecture

> **Status: undefined.** The owner will describe the new architecture. Do not invent it. Capture decisions here
> as they are made, then split into focused files (e.g. `pipeline.md`, `renderer.md`, `cli.md`) as the design grows.

## Known constraints

- The tool consumes a Structurizr DSL workspace (and optionally a Git repository with multiple branches) and emits a
  static site with rendered diagrams, documentation, and ADRs.
- It must support a `generate-site` mode and a `serve` development mode (watch + live rebuild).
- Behavior must match the reference tool unless the owner decides otherwise. See [../terminology.md](../terminology.md).

## Open questions (awaiting owner)

1. Language and runtime for the rebuild.
2. Diagram rendering strategy (reuse PlantUML exporter vs. alternative).
3. Module/component boundaries and their contracts.
4. Distribution (single binary, container, library).
5. How site customization (`generatr.*` properties) maps into the new design.

## Decisions

_None recorded yet._

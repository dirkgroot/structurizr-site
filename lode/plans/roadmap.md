# Roadmap

Current state and next steps. Update in place; this is not a changelog.

## State

- Git repository initialized on branch `main`. Contains the Lode only; no source code or build tooling yet.
- Architecture top-level shape defined: CLI emits a deployable directory (rendered diagrams + exported Structurizr
  JSON + SPA bundle); the SPA renders the site client-side from the JSON. See
  [../architecture/summary.md](../architecture/summary.md).
- Diagram pipeline and clickable SVG links designed and verified end-to-end (official Structurizr CLI + PlantUML,
  link injection via the workspace JSON, hash routes). See [../architecture/diagrams.md](../architecture/diagrams.md).
- Distribution decided: Structurizr as an external runtime dependency (not vendored), Node as a dependency, SPA shipped
  in the package, Homebrew tap. See [../architecture/distribution.md](../architecture/distribution.md).

## Next

1. Confirm the CLI runtime (the TS-orchestrator approach is validated; see the roadmap's Open items).
2. Scaffold the first vertical slice: DSL → `workspace.json` → linked `.puml` → `.svg` → SPA renders one diagram with
   working hash links.
3. Record build/run/verify as a skill.

## Open

- CLI runtime: TS orchestrator shelling out to the Structurizr vNext backend and PlantUML is validated; not yet
  confirmed by the owner.
- SPA framework (React + Vite proposed).
- Backend resolution details (community Homebrew build vs user-provided war/Docker) and minimum supported version.
- Documentation and ADR representation in the SPA.
- Target platform.

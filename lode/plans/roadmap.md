# Roadmap

Current state and next steps. Update in place; this is not a changelog.

## State

- Git repository initialized on branch `main`. Contains the Lode plus build-tool config: `mise.toml` pins Node to the
  LTS version `24.21.0` (Krypton). No source code yet.
- Architecture top-level shape defined: CLI emits a deployable directory (rendered diagrams + exported Structurizr
  JSON + SPA bundle); the SPA renders the site client-side from the JSON. See
  [../architecture/summary.md](../architecture/summary.md).
- Diagram pipeline and clickable SVG links designed and verified end-to-end (official Structurizr CLI + PlantUML,
  link injection via the workspace JSON, hash routes). See [../architecture/diagrams.md](../architecture/diagrams.md).
- Distribution decided: Structurizr as an external runtime dependency (not vendored), Node as a dependency, SPA shipped
  in the package, Homebrew tap. See [../architecture/distribution.md](../architecture/distribution.md).
- Repository layout decided: one published npm package with `src/{cli,spa,shared}`. See
  [../architecture/repository-layout.md](../architecture/repository-layout.md).
- SPA routing decided: hash routes, static patterns, a model-derived index, react-router v7. See
  [../architecture/routing.md](../architecture/routing.md).

## Next

1. Scaffold the first vertical slice: DSL → `workspace.json` → linked `.puml` → `.svg` → SPA renders one diagram with
   working hash links.
2. Record build/run/verify as a skill.

## Open

- Backend resolution details (community Homebrew build vs user-provided war/Docker) and minimum supported version.
- Documentation and ADR representation in the SPA.
- `generatr.*` property mapping into the new design.
- Whether to pre-render anything for SEO / no-JS.
- Target platform.

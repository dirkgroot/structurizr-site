# Roadmap

Current state and next steps. Update in place; this is not a changelog.

## State

- Git repository initialized on branch `main`. Build tooling is pinned with `mise.toml` (Node LTS `24.21.0`, Krypton).
- Minimal scaffold in place: a TypeScript CLI (`src/cli`) emits a `build/` directory by copying the prebuilt
  React + Vite SPA (`src/spa`); `src/shared` holds runtime-agnostic values used by both. The CLI exposes
  `generate-site` and `serve` (generate + static HTTP preview on port 8080). No Structurizr functionality
  yet. See [../architecture/repository-layout.md](../architecture/repository-layout.md).
- Architecture top-level shape defined: CLI emits a deployable directory (rendered diagrams + exported Structurizr
  JSON + SPA bundle); the SPA renders the site client-side from the JSON. See
  [../architecture/summary.md](../architecture/summary.md).
- Diagram pipeline and clickable SVG links designed and verified end-to-end (official Structurizr CLI + PlantUML,
  link injection via the workspace JSON, hash routes). See [../architecture/diagrams.md](../architecture/diagrams.md).
- Distribution implemented: each `v*` tag produces a GitHub release carrying the packed npm tarball (the artifact
  Homebrew installs); `.github/workflows/` holds CI and the tag-triggered release; `packaging/homebrew/` holds the
  Homebrew formula template and updater. Structurizr stays an external runtime dependency (not vendored), Node is a
  dependency, and the SPA ships in the package. See
  [../architecture/distribution.md](../architecture/distribution.md).
- Repository layout decided: one published npm package with `src/{cli,spa,shared}`. See
  [../architecture/repository-layout.md](../architecture/repository-layout.md).
- SPA routing decided: hash routes, static patterns, a model-derived index, react-router v7. See
  [../architecture/routing.md](../architecture/routing.md).
- Unit testing in place: Vitest with a Node project (CLI/shared) and a jsdom project (React), React Testing Library,
  colocated tests, 100% coverage, and `npm test` gating CI and release. See
  [../architecture/testing.md](../architecture/testing.md).

## Next

1. Extend `generate-site` to export `workspace.json` into the output directory alongside the SPA.
2. Scaffold the first vertical slice: DSL → `workspace.json` → linked `.puml` → `.svg` → SPA renders one diagram with
   working hash links.
3. Record build/run/verify as a skill.
4. Create the `homebrew-structurizr-site` tap and publish the first npm release.

## Open

- Backend resolution details (community Homebrew build vs user-provided war/Docker) and minimum supported version.
- Documentation and ADR representation in the SPA.
- `generatr.*` property mapping into the new design.
- Whether to pre-render anything for SEO / no-JS.
- Target platform.

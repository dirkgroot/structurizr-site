# Roadmap

Current state and next steps. Update in place; this is not a changelog.

## State

- Git repository initialized on branch `main`. Build tooling is pinned with `mise.toml` (Node LTS `24.21.0`, Krypton).
- Minimal scaffold in place: a TypeScript CLI (`src/cli`) emits a `build/` directory by copying the prebuilt
  React + Vite web app (`src/web`); `src/shared` holds runtime-agnostic values used by both. The CLI exposes
  `generate-site` and `serve` (generate + static HTTP preview on port 8080), each accepting `-w/--workspace-file`.
  See [../architecture/repository-layout.md](../architecture/repository-layout.md).
- Architecture top-level shape defined: CLI emits a deployable directory (rendered diagrams + exported Structurizr
  JSON + web app bundle); the web app renders the site client-side from the JSON. See
  [../architecture/summary.md](../architecture/summary.md).
- Diagram pipeline and clickable SVG links designed and verified end-to-end (official Structurizr CLI + PlantUML,
  link injection via the workspace JSON, hash routes). See [../architecture/diagrams.md](../architecture/diagrams.md).
- Distribution implemented: each `v*` tag compiles self-contained Bun binaries for `darwin-arm64`, `darwin-x64`,
  `linux-x64`, and `linux-arm64` (the web app is embedded), attaches them plus `SHA256SUMS` to a GitHub release, and the
  public tap `dirkgroot/homebrew-structurizr-site` installs the matching binary. macOS binaries are ad-hoc signed, not
  notarized. `.github/workflows/` holds CI and the tag-triggered release; `packaging/binary/` builds the binaries and
  `packaging/homebrew/` holds the formula template and updater. Structurizr stays an external runtime dependency (not
  vendored). See [../architecture/distribution.md](../architecture/distribution.md).
- Versioning: Semantic Versioning with a `-pre-alpha.N` pre-release identifier; pre-release tags publish as GitHub
  pre-releases, never "Latest". See [../architecture/distribution.md](../architecture/distribution.md).
- Repository layout decided: one package with `src/{cli,web,shared}`. See
  [../architecture/repository-layout.md](../architecture/repository-layout.md).
- Web app routing decided: hash routes, static patterns, a model-derived index, react-router v7. See
  [../architecture/routing.md](../architecture/routing.md).
- Unit testing in place: Vitest with a Node project (CLI/shared) and a jsdom project (React), React Testing Library,
  colocated tests, no coverage threshold, and `npm test` gating CI and release. See
  [../architecture/testing.md](../architecture/testing.md).
- Web app shell in place: shadcn/ui on Base UI with Tailwind v4, using the `sidebar-01` block (sidebar nav + inset
  content). The site name comes from the loaded workspace; navigation is placeholder until the model-derived route index
  lands. See [../architecture/ui.md](../architecture/ui.md).
- Structurizr workspace JSON types generated from the vendored OpenAPI spec (`openapi-typescript`), gated in CI. See
  [../architecture/workspace-types.md](../architecture/workspace-types.md).
- First vertical slice in place: `generate-site -w <workspace.dsl>` exports `workspace.json` via the Structurizr backend,
  and the web app derives the site name from the workspace name (placeholder fallback). Backend defaults to `structurizr`
  on `PATH`; `--structurizr` overrides it. See
  [../architecture/workspace-loading.md](../architecture/workspace-loading.md).

## Next

1. Extend `generate-site` to render diagram assets and inject drill-down links (the rest of the pipeline in
   [../architecture/diagrams.md](../architecture/diagrams.md)).
2. Wire react-router v7 into the App shell and drive the sidebar navigation from the model-derived route index.
3. Record build/run/verify as a skill.

## Open

- Backend resolution details (community Homebrew build vs user-provided war/Docker) and minimum supported version.
- Documentation and ADR representation in the web app.
- `generatr.*` property mapping into the new design.
- Whether to pre-render anything for SEO / no-JS.
- Target platform.
- Whether generate-site should default the workspace file (e.g. `workspace.dsl` in the cwd) instead of requiring `-w`.

# structurizr-site

Static site generator for [Structurizr](https://structurizr.com/) workspaces. See `lode/summary.md` for the project
overview.

**Status:** minimal scaffold. The CLI emits a deployable directory containing the prebuilt SPA. Structurizr export,
diagram rendering, and link injection are not implemented yet.

## Install

```sh
npm install -g structurizr-site
```

A Homebrew formula is maintained in `packaging/homebrew/`. Once the tap is published:

```sh
brew install dirkgroot/structurizr-site/structurizr-site
```

## Requirements

Build tools are pinned with [`mise`](https://mise.jdx.dev/) (Node LTS). With mise active, `node` and `npm` come from
`mise.toml`.

## Develop

```sh
npm install
npm run build        # tsc -> dist/cli, vite -> dist/spa
npm run typecheck
npm test             # vitest (node + jsdom projects)
npm run test:watch
npm run test:coverage
```

Unit tests use Vitest; React components are tested with React Testing Library. Tests are colocated with the source as
`*.test.ts(x)`. See `lode/architecture/testing.md`.

## Generate a site

```sh
npm run generate-site            # writes ./build
node dist/cli/bin.js generate-site --output path/to/out
```

`build/` contains the prebuilt SPA and is deployable to any static host. It is git-ignored.

## Release

Releases publish to npm from a version tag.

1. Bump `version` in `package.json` and commit.
2. Tag and push: `git tag v0.1.0 && git push origin v0.1.0`.
3. The `Release` workflow verifies the tag matches `package.json`, runs the checks, and publishes with provenance. It
   needs an `NPM_TOKEN` repository secret.
4. Refresh the Homebrew formula against the published tarball, then copy it into the tap:

   ```sh
   node packaging/homebrew/update-formula.mjs
   ```

`prepack` rebuilds `dist/` before packing, so the published tarball always contains a fresh CLI and SPA.

## Layout

- `src/cli/` — the generator CLI.
- `src/spa/` — the React + Vite single-page app.
- `src/shared/` — runtime-agnostic code imported by both.
- `.github/workflows/` — CI and release automation.
- `packaging/homebrew/` — the Homebrew formula and its updater.

See `lode/architecture/repository-layout.md` for the full layout.

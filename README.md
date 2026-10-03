# structurizr-site

Static site generator for [Structurizr](https://structurizr.com/) workspaces. See `lode/summary.md` for the project
overview.

**Status:** minimal scaffold. The CLI emits a deployable directory containing the prebuilt SPA. Structurizr export,
diagram rendering, and link injection are not implemented yet.

## Requirements

Build tools are pinned with [`mise`](https://mise.jdx.dev/) (Node LTS). With mise active, `node` and `npm` come from
`mise.toml`.

## Develop

```sh
npm install
npm run build      # tsc -> dist/cli, vite -> dist/spa
npm run typecheck
```

## Generate a site

```sh
npm run generate-site            # writes ./build
node dist/cli/bin.js generate-site --output path/to/out
```

`build/` contains the prebuilt SPA and is deployable to any static host. It is git-ignored.

## Layout

- `src/cli/` — the generator CLI.
- `src/spa/` — the React + Vite single-page app.
- `src/shared/` — runtime-agnostic code imported by both.

See `lode/architecture/repository-layout.md` for the full layout.

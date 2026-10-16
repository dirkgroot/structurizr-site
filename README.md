# structurizr-site

Rewrite of [structurizr-site-generatr](https://github.com/avisi-cloud/structurizr-site-generatr): a Rust CLI that bundles a single-page application with a Structurizr workspace, so any static web server can host the result.

## Install

Homebrew (macOS and Linux):

```sh
brew install dirkgroot/tap/structurizr-site
```

Or download a binary directly from [Releases](https://github.com/dirkgroot/structurizr-site/releases) (macOS arm64/x86_64, Linux x86_64, Windows x64).

## Generating a site

`generate` shells out to the [structurizr CLI](https://docs.structurizr.com/cli) to export the workspace, so `structurizr` must be on your `PATH` (which in turn needs [Java](https://adoptium.net)):

```sh
structurizr-site generate --workspace example/workspace.dsl
python3 -m http.server -d build                       # then open http://localhost:8000
```

- `--workspace` — DSL or JSON workspace file (default: `workspace.dsl`)
- `--output` — output directory (default: `build`)
- `--router` — `hash` (default) or `path`; how page URLs are formed (see below)
- `--base-path` — path the site is hosted under; `--router path` only (default: `/`)

### Router modes

- `--router hash` (default) serves every page from one URL (`index.html#/software-systems/…`) and works on any static web server without configuration.
- `--router path` uses clean URLs (`/software-systems/…`) and requires the host to serve `index.html` for unknown paths. The generated `404.html` provides that fallback on GitHub Pages project sites; other hosts need an equivalent rewrite rule.
- Use `--base-path` when a path-URL site is not hosted at the domain root (e.g. `--base-path /docs/`).

## Development

[mise](https://mise.jdx.dev) sets up the pinned Rust toolchain and pnpm/Node.js 24 from `mise.toml` (`mise install`).

- Build the SPA: `pnpm --dir web build` (into `web/dist`, embedded by `cargo build`)
- Run from source: `cargo run -- generate --workspace example/workspace.dsl`
- SPA dev server: `pnpm --dir web dev` (generates workspace JSON from `example/workspace.dsl` on request; requires `structurizr` on your PATH)
- SPA lint: `pnpm --dir web lint`
- Rust: `cargo fmt` and `cargo clippy`

## Releasing

1. Update the changelog: `git cliff --unreleased --prepend CHANGELOG.md`
2. Bump the version in `Cargo.toml`
3. Commit (`chore(release): vX.Y.Z`), tag `vX.Y.Z`, and `git push --follow-tags`

The release workflow builds binaries for macOS (arm64 and x86_64), Linux (x86_64 musl), and Windows (x64), publishes a GitHub release with notes from the changelog, and updates the Homebrew formula in [dirkgroot/homebrew-tap](https://github.com/dirkgroot/homebrew-tap) (requires the `HOMEBREW_TAP_TOKEN` secret: a fine-grained PAT with `contents:write` on the tap repo).

## Commit messages

Conventional commits, enforced by CI on pull requests. The changelog is generated from them with [git-cliff](https://git-cliff.org).

# structurizr-site

Rewrite of [structurizr-site-generatr](https://github.com/avisi-cloud/structurizr-site-generatr): a Rust CLI that bundles a single-page application with a Structurizr workspace, so any static web server can host the result.

## Prerequisites

- [Rust](https://rustup.rs)
- [Node.js](https://nodejs.org) with [pnpm](https://pnpm.io)
- [Java](https://adoptium.net) and the [structurizr CLI](https://docs.structurizr.com/cli), with `structurizr` on your `PATH`

## Generating a site

```sh
pnpm --dir web build                                  # build the SPA into web/dist
cargo run -- generate --workspace example/workspace.dsl
python3 -m http.server -d build                       # then open http://localhost:8000
```

- `--workspace` — DSL or JSON workspace file (default: `workspace.dsl`)
- `--output` — output directory (default: `build`)

The structurizr CLI does the workspace export, which is why Java is needed.

## Development

- SPA dev server: `pnpm --dir web dev` (drop a `workspace.json` into `web/public/` so the fetch resolves)
- SPA lint: `pnpm --dir web lint`
- Rust: `cargo fmt` and `cargo clippy`

## Releasing

1. Update the changelog: `git cliff --unreleased --prepend CHANGELOG.md`
2. Bump the version in `Cargo.toml`
3. Commit (`chore(release): vX.Y.Z`), tag `vX.Y.Z`, and `git push --follow-tags`

The release workflow builds binaries for macOS (arm64), Linux (x86_64 musl), and Windows (x64) and publishes a GitHub release with notes from the changelog.

## Commit messages

Conventional commits, enforced by CI on pull requests. The changelog is generated from them with [git-cliff](https://git-cliff.org).

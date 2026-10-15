# Practices

Patterns and practices relevant to this project.

- Chat-mode first - architecture is discussed and settled in chat before code is written (Lode Coding workflow).
- Locked-decisions only - only choices the user states explicitly are treated as decided. Everything else is an open fork recorded in [architecture/open-questions.md](architecture/open-questions.md); analysis may list options and trade-offs but never silently promotes one to a decision.
- Immediate capture - when the user locks a decision, the corresponding architecture lode file is updated before moving on.
- Facts vs inference - lode entries separate observed facts (source: repo, docs, release notes) from inference; inferences are marked. When lode content contradicts code, code wins.
- Parity source of truth - for feature questions, the original tool's repo/docs are the reference: [background/original-tool.md](background/original-tool.md).
- Simplest-possible code - no pre-emptive architecture, no future-proofing; implement exactly what was asked.
- Toolchain - Rust and pnpm versions are pinned in `mise.toml`; CI installs them with `jdx/mise-action`. Run `mise install` after cloning (mise bootstraps rustup for the Rust toolchain).
- Dev loop - `pnpm --dir web dev` for SPA work (a dev-only middleware in `web/vite.config.ts` serves `../build/workspace.json` at `/workspace.json`; run `cargo run -- generate --workspace example/workspace.dsl --output build` once if it is missing). To verify the real static output: `pnpm --dir web build`, then `cargo run -- generate --workspace example/workspace.dsl --output build`, then serve `build/` with any static server.
- Lint - Rust: `cargo fmt --check` and `cargo clippy -- -D warnings`. SPA: `pnpm --dir web lint` (oxlint, ships with the Vite template). Commits: conventional commits, enforced by commitlint in CI on pull requests.
- Changelog - keepachangelog 1.0.0, generated from conventional commits by git-cliff (`cliff.toml`). Release flow: `git cliff --unreleased --prepend CHANGELOG.md`, bump `Cargo.toml`, tag `vX.Y.Z`, push with tags; the release workflow builds binaries (macOS arm64, Linux musl, Windows x64) and publishes a GitHub release.
- shadcn components are vendored in `web/src/components/ui/` and drift from upstream; treat local edits there as the source of truth. The vendored `separator.tsx` uses `data-vertical:h-full` (not upstream's `data-vertical:self-stretch`): `self-stretch` overrides `items-center` and pins fixed-height separators (`data-[orientation=vertical]:h-4`) to the top of flex rows.

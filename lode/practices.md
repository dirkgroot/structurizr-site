# Practices

Patterns and practices for working on this project. Split into focused files if this grows past ~250 lines.

## Lode Coding

- All persistent project memory lives in `lode/`. It is the AI's memory; summarize it, don't dump it.
- Lode is **descriptive** (what the system is). Repeatable procedures are **skills**, not lode files.
- A lode file covers exactly one topic, stays under 250 lines, and links related lodes by relative path.
- Lode describes **current state**, not a changelog. Update in place; never append "added X on date Y".
- Diagrams are **Mermaid only**.
- Session scraps and handovers go in `lode/tmp/` (git-ignored). Only durable learnings enter the main lode.
- If lode contradicts code, code wins: summarize the disparity and ask the owner to confirm the lode fix.
- Workflow: chat-mode design first, implement only after a decision, then immediately update the lode.

## Project skills

- Interactive skills under `.opencode/skills/` capture repeatable procedures (see the Lode-vs-skill rule above).
- `release` (`.opencode/skills/release/SKILL.md`) cuts a release end to end: proposes a version for approval, bumps
  `package.json`, regenerates `CHANGELOG.md`, runs the gates, commits, tags, pushes, watches the Release workflow, and
  updates the Homebrew tap. It owns the version-suggestion rule (increment the `-pre-alpha.N` counter, not
  `git cliff --bumped-version`). Release detail stays in [architecture/distribution.md](architecture/distribution.md).

## Working with the project owner

- The owner makes final decisions and owns the code. The AI is memory + fast executor.
- Lead with the conclusion; cut hedges; frameworks over examples; plain verbs over figurative ones.
- No emotional preamble, no emojis, no "would you like me to" — just do it.
- One follow-up question maximum.

## Rebuild discipline

- The reference tool is a **behavioral spec**, not an implementation blueprint. Match behavior, not structure.
- Record each architecture decision as it is made; do not invent architecture ahead of the owner's direction.
- Prefer capturing a design in `lode/architecture/` before writing code for it.

## Testing

- Behavior is unit tested. **Vitest** runs the suite; **React Testing Library** drives React DOM assertions.
- Tests are colocated as `<module>.test.ts(x)` and split by runtime: a Node project for `src/cli` + `src/shared`, a
  jsdom project for `src/spa`. `npm test` is part of the merge and release gate.
- Coverage has no threshold; the goal is testing important behavior, not 100%. Vendored shadcn/ui code is excluded.
- Query by role/text, not implementation. Mock module boundaries with `vi.mock`; inject IO seams (e.g.
  `assemble(outputDir, sourceDir)`) instead of mocking `node:fs`; do not test constants tautologically.
- Full detail: [architecture/testing.md](architecture/testing.md).

## Linting and formatting

- `oxlint` lints. Config: `.oxlintrc.json`, Vite's default React preset: plugins `react`, `typescript`, `oxc`;
  `react/rules-of-hooks` at **error**, `react/only-export-components` at **warn**. ESLint core rules still run;
  `unicorn`, `import`, `promise`, `node`, `jsx-a11y`, `react-perf` are not enabled.
- `npm run lint` runs `oxlint --deny-warnings`, so warnings and errors both fail the gate. `npm run lint:fix`
  applies safe fixes.
- `oxfmt` formats (0.71.0, beta). Config: `.oxfmtrc.json`; `sortPackageJson` is disabled so `package.json` key order
  stays stable (Prettier does not sort keys either). `npm run format` writes; `npm run format:check` verifies.
- Vendored shadcn/ui code (`src/spa/components/ui/**`, `src/spa/hooks/**`) gets an `.oxlintrc.json` `overrides` entry
  that disables `react/only-export-components` and `react/set-state-in-effect`; those files export variants/hooks and
  use browser-only effects. See [architecture/ui.md](architecture/ui.md).
- Both tools respect `.gitignore`, so `dist/`, `build/`, and `node_modules/` are skipped without explicit patterns.
- `.editorconfig` is the shared baseline: UTF-8, LF, 2-space indent, final newline, trimmed trailing whitespace
  (Markdown keeps trailing whitespace). oxfmt's `printWidth` is 100 and overrides `.editorconfig.max_line_length`.

## Commits and changelog

- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`,
  `chore:` …). `git-cliff` (config `cliff.toml`) groups them into `CHANGELOG.md`; non-conforming messages fall under
  `Other` instead of being dropped.
- Version-bump, merge, and Homebrew-formula-update commits are skipped by parser rules. `npm run changelog` regenerates the
  file with an `Unreleased` section; `npm run changelog:release` labels it with the `package.json` version at release
  time.
- Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html); while pre-alpha, releases carry an explicit
  `-pre-alpha.N` pre-release identifier. The current version lives in `package.json` (the tag mirrors it); the Lode does
  not track it.
- Release detail: [architecture/distribution.md](architecture/distribution.md).

# Executable specs

Executable Spec Driven Development (ESDD): every `*.spec.mts` here is both a specification of
end-user-visible behaviour and the test that verifies it. The suite is the contract between the
spec author and coding agents: an agent implements until the specs pass, and uses them to check
that what it built meets expectations.

## Who writes what

- `cli/` and `web/` — executable specs. **Authored and maintained by the spec author.** Agents may
  propose spec changes, but never edit specs unilaterally: a spec change is a requirements change.
  New spec files can go in any directory here (the runner picks up `**/*.spec.mts`).
- `workspaces/` — shared workspace files (DSL) used as spec input.
- In `../specs-verifier/`: `fixtures/` — the glue between specs and the system under test. Agents
  maintain these freely whenever specs need a new way to drive the app or observe behaviour.
  Fixtures drive and observe; they never assert expectations — assertions live in specs.

Verification machinery lives in `specs-verifier/` at the repo root — a sibling, not a subdirectory —
so this directory contains nothing but specs. It is the runner's pnpm package: `package.json`
(scripts, dependencies), lockfile, `node_modules`, `playwright.config.ts`, the fixtures and the
workspace loader, plus caches and reports. Two consequences of the split:

- Spec files are named `*.spec.mts`. With no `package.json` above `specs/`, the `.mts` extension is
  what tells Node and Playwright "ESM" — no marker file needed.
- The `@/fixtures` and `@/workspaces` aliases are defined in the repo-root `tsconfig.json`, because
  TypeScript finds a tsconfig by walking up from each file and `specs/` must stay clean.

`specs/workspaces/` holds the shared DSL workspace files — spec input, authored with the specs —
while the loader that reads them lives in `specs-verifier/workspaces/`.

## The fixture DSL

```ts
import { test, expect } from '@/fixtures'
import { acme } from '@/workspaces'

// CLI: run the real binary in a per-test sandbox directory.
test('generate produces a self-contained site', async ({ cli }) => {
  const run = await cli.generate({ workspace: acme })

  expect(run).toSucceed()
  expect(run.file('build/index.html')).toContain('./assets/')
  expect(run.json('build/workspace.json')).toMatchObject({ name: 'ACME Corporation' })
})

// Web: generate with the real CLI and serve the result like a static host would.
test('the home page introduces the workspace', async ({ site, page }) => {
  await site.serve(acme, { router: 'path', basePath: '/docs' })

  await page.goto(site.url('/docs')) // hash routes: site.url('/#/software-systems/acme-core')

  await expect(page.getByRole('main')).toBeVisible()
})
```

- `cli.generate({ workspace, router?, basePath?, output?, structurizr? })` runs
  `structurizr-site generate` in a per-test sandbox. `workspace` is content (DSL or JSON); the
  fixture writes the file. Omitted options keep the CLI's own defaults, so specs exercise them.
  The `structurizr` option injects a shell-script shim onto the child's PATH for failure paths
  (`failingStructurizr()` in `fixtures/structurizr.ts`, unix only).
- `site.serve(workspace, { router?, basePath? })` generates a site with the real CLI and serves
  it from a static server that mirrors GitHub Pages semantics: files are served directly, path
  mode serves `404.html` (with 404 status) at unknown paths, and `basePath` mounts the site under
  a URL prefix. `site.url(path)` builds absolute URLs; `#` fragments pass through.
- `run` (a `CliResult`) exposes `ok`, `exitCode`, `stdout`, `stderr`, `file()`, `json()`, and
  `exists()`, all relative to the sandbox directory. `expect(run).toSucceed()` fails with the
  run's stdout/stderr attached for diagnosis.
- Playwright's `page` is available unchanged; query by role and accessible name, never by class.

## Running

Prerequisites: [mise](https://mise.jdx.dev) toolchains (`mise install`), plus the
[structurizr CLI](https://docs.structurizr.com/cli) and Java on your `PATH` (same as the dev loop).

```sh
pnpm --dir specs-verifier install                        # once
pnpm --dir specs-verifier exec playwright install chromium   # once
pnpm --dir specs-verifier test                           # builds the SPA + CLI, then runs all specs
```

- Iterate on a single spec (after one `pnpm --dir specs-verifier build`):
  `pnpm --dir specs-verifier exec playwright test web/home-page.spec.mts`
- UI mode: `pnpm --dir specs-verifier exec playwright test --ui`
- Lint: `pnpm --dir specs-verifier lint` (oxlint)
- Typecheck only: `pnpm --dir specs-verifier check`
- Test another build (e.g. a release binary):
  `STRUCTURIZR_SITE_BIN=/path/to/structurizr-site pnpm --dir specs-verifier exec playwright test`

## How it works

- Generated sites are cached in `.cache/sites/`, keyed by workspace content, generate arguments,
  the SPA bundle under `web/dist`, and the CLI binary — so a rebuild invalidates the cache and a
  repeated spec run pays one JVM boot per unique workspace, not per spec.
- The binary under test is `cli/target/debug/structurizr-site` (debug builds read `web/dist` from
  disk at runtime, so the served SPA is always the current `web/` source after a build).
- Directory entry modules are imported through tsconfig path aliases (`@/fixtures`, `@/workspaces`,
  defined in `tsconfig.json` `paths` and resolved by both tsc and Playwright). All other relative
  imports use explicit `.ts` extensions: Playwright's ESM loader does not resolve extensionless or
  directory imports.

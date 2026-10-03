# Repository Layout

How the source tree and the published package are organized. Related: [summary.md](summary.md),
[distribution.md](distribution.md), [routing.md](routing.md).

## Decision

One published npm package. The CLI, the SPA, and the shared code are **source trees inside it**, not separate
packages. There is one version and one build; the SPA bundle ships inside the same artifact as the CLI.

Separate packages were rejected: the SPA has no independent consumer and no independent release cycle. Splitting it
out would force a lockstep version pin and an extra publish step for no benefit.

## Tree

```
structurizr-site/
├── AGENTS.md
├── README.md
├── mise.toml                    # pinned build tools (Node LTS)
├── package.json                 # single package; bin, files: ["dist"]
├── tsconfig.json                # solution file; references the projects below
├── tsconfig.base.json
├── tsconfig.cli.json            # Node libs
├── tsconfig.spa.json            # DOM libs
├── tsconfig.node.json           # vite.config.ts
├── vite.config.ts               # src/spa -> dist/spa
├── lode/                        # AI memory
├── .claude/skills/              # procedural skills (run/verify)
├── src/
│   ├── shared/                  # contracts imported by cli + spa
│   │   ├── workspace/           # Structurizr JSON types
│   │   ├── routes/              # normalize(), drill-down rules
│   │   └── config/              # generatr.* keys + defaults
│   ├── cli/
│   │   ├── bin.ts               # -> dist/cli/bin.js
│   │   ├── commands/            # generate-site, serve
│   │   ├── backend/             # Structurizr resolution + spawn
│   │   ├── pipeline/            # exportJson, injectLinks, exportPuml,
│   │   │                        #   renderSvg, stripOrigin
│   │   ├── assembly/            # output dir; copy dist/spa + assets
│   │   ├── config/              # CLI args, generatr.* mapping
│   │   └── serve/               # watch + live rebuild
│   └── spa/
│       ├── index.html
│       ├── main.tsx
│       ├── app/                 # hash router, layout, nav
│       ├── pages/               # context/container/component/code, docs, ADR
│       ├── diagram/             # SVG embed, pan/zoom, click-vs-drag
│       ├── data/                # workspace.json loader + selectors
│       └── styles/
├── test/
│   ├── fixtures/                # sample .dsl workspaces + expected JSON
│   └── e2e/                     # DSL -> JSON -> puml -> svg -> anchor assertions
├── dist/                        # git-ignored; shipped
│   ├── cli/                     # tsc output
│   └── spa/                     # vite output
└── packaging/
    └── homebrew/structurizr-site.rb
```

## Rationale

- **`src/shared/`** holds the contracts both sides import: Structurizr JSON types, `normalize()` and the drill-down
  route rules, and the `generatr.*` keys/defaults. It stays **runtime-agnostic** — pure functions and types only, no
  `fs`, no `window` — so it compiles into both the Node CLI and the browser bundle.
- **`src/cli/`** is the generator. `pipeline/` mirrors the six pipeline steps one-to-one (see [diagrams.md](diagrams.md));
  `backend/` isolates the Structurizr resolution order (see [distribution.md](distribution.md)).
- **`src/spa/`** is the React + Vite app. `app/` owns the router and layout, `diagram/` owns SVG embedding and the
  pan/zoom click-vs-drag model, `data/` owns the workspace JSON loader and selectors. Routing is defined in
  [routing.md](routing.md).
- **`test/fixtures/`** holds sample `.dsl` workspaces; **`test/e2e/`** runs the full pipeline and encodes the manually
  verified behavior from [diagrams.md](diagrams.md).

## Build and packaging

- Build tools are managed by `mise` (`mise.toml`). Node is pinned to the current LTS, `24.21.0` (Krypton).
- `tsc -p tsconfig.cli.json` → `dist/cli/` (plus `dist/shared/`); `vite build` → `dist/spa/`. `dist/` is git-ignored
  and shipped.
- `package.json`: `bin` → `dist/cli/bin.js`; `files: ["dist"]`.
- `assembly/` copies `dist/spa/` into the output directory at generate time. The path is relative to the CLI module,
  so there is no cross-package resolution.
- Three project tsconfigs: `tsconfig.cli.json` (Node libs) and `tsconfig.spa.json` (DOM libs) — both including
  `src/shared` — plus `tsconfig.node.json` for `vite.config.ts`. A root `tsconfig.json` with `"files": []` references
  them (the Vite "solution file" pattern) so the IDE's TypeScript language server discovers each project; the language
  server only auto-discovers files literally named `tsconfig.json`.

## Invariants

- `src/shared/` imports nothing from `src/cli/` or `src/spa/`, and nothing runtime-specific.
- The published artifact contains exactly one version of CLI and SPA; version skew is impossible.
- The prebuilt SPA is committed to the package at release; nothing builds or fetches at install time (see
  [distribution.md](distribution.md)).

# UI

How the SPA's visual layer is built. Related: [summary.md](summary.md), [repository-layout.md](repository-layout.md),
[routing.md](routing.md), [testing.md](testing.md).

## Decision

- **D10 — shadcn/ui components on Base UI, styled with Tailwind CSS v4.** The UI is assembled from vendored
  shadcn/ui components under `src/spa/components/ui/`, built on `@base-ui/react` primitives with Tailwind utility
  classes. shadcn is not a runtime dependency: component source is copied into the repo and owned here.
- **D11 — Vendored UI is exempt from the lint and coverage gates.** Generated components export non-component values
  (`buttonVariants`, `useSidebar`) and use browser-only hooks (`useIsMobile`), so they are excluded from
  `react/only-export-components` / `react/set-state-in-effect` and from coverage. Our own layout code is not exempt.

## Stack

| Concern    | Choice                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| Styling    | Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`), CSS-first config |
| Components | shadcn/ui, `base-nova` preset (`components.json`)                      |
| Primitives | Base UI (`@base-ui/react`)                                             |
| Class util | `cn` package, re-exported from `src/spa/lib/utils.ts`                  |
| Icons      | `lucide-react`                                                         |
| Font       | Geist Variable (`@fontsource-variable/geist`)                          |
| Animation  | `tw-animate-css`                                                       |

All of these are build-time only (`devDependencies`); the emitted SPA bundle is self-contained.

## Alias and layout

`components.json` maps shadcn's aliases onto the SPA tree through the `@` alias, which resolves to `src/spa`
(Vite/Vitest `resolve.alias`, plus `paths` in `tsconfig.spa.json`, `tsconfig.test.json`, and the root solution
`tsconfig.json`):

```json
{
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks",
    "utils": "@/lib/utils"
  }
}
```

```
src/spa/
├── app/                 # App shell: SidebarProvider + SidebarInset
├── components/
│   ├── app-sidebar.tsx  # site navigation (sidebar-01 shell)
│   └── ui/              # vendored shadcn primitives (gate-exempt)
├── hooks/               # use-mobile.ts (gate-exempt)
├── lib/utils.ts         # cn re-export
└── styles/global.css    # Tailwind entry + shadcn theme tokens
```

## Shell

The `sidebar-01` block supplies the app shell: a collapsible sidebar (brand header, grouped navigation, rail) and an
inset content area (trigger, separator, breadcrumb). `App.tsx` composes it; `app-sidebar.tsx` holds the navigation,
currently placeholder links that the model-derived route index will replace (see [routing.md](routing.md)).

```mermaid
flowchart TD
    APP[App.tsx] --> SP[SidebarProvider]
    SP --> AS[AppSidebar]
    AS --> BR[brand header]
    AS --> NAV[nav groups]
    SP --> SI[SidebarInset]
    SI --> HDR[SidebarTrigger + Breadcrumb]
    SI --> MAIN[page content]
```

## Theming

Theme tokens live in `src/spa/styles/global.css` (`:root` and `.dark`, oklch values) and are exposed to Tailwind via
`@theme inline`. Dark mode is class-based (`@custom-variant dark (&:is(.dark *))`); nothing toggles `.dark` yet.

## Gates

- **Lint** (`.oxlintrc.json`): an `overrides` entry turns off `react/only-export-components` and
  `react/set-state-in-effect` for `src/spa/components/ui/**` and `src/spa/hooks/**`.
- **Coverage** (`vitest.config.ts`): the same two paths are excluded; layout components (`app/`,
  `components/app-sidebar.tsx`) stay covered by `App.test.tsx`.

## Invariants

- `src/shared/` stays runtime-agnostic; UI code lives under `src/spa`.
- `src/spa/components/ui/` is vendored and edited in place; re-add or refresh with `npx shadcn@latest add <name>`.
- Adding a shadcn component must not reintroduce a runtime `dependencies` entry; all UI packages are build-time.

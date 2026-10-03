# Lode Map

Hierarchical index of all lode files. Read this first; it is the entry point to project knowledge.

## Root

- [summary.md](summary.md) - one-paragraph living snapshot of the project.
- [terminology.md](terminology.md) - domain and project vocabulary.
- [practices.md](practices.md) - working patterns, Lode Coding rules, rebuild discipline.

## architecture/

- [architecture/summary.md](architecture/summary.md) - top-level shape (CLI + web app + Structurizr JSON) and decisions; component details still open.
- [architecture/diagrams.md](architecture/diagrams.md) - diagram rendering pipeline and clickable SVG links (drill-down rules, hash routes).
- [architecture/distribution.md](architecture/distribution.md) - self-contained Bun binaries, CI/release workflows, and the Homebrew formula; Structurizr as an external dependency.
- [architecture/repository-layout.md](architecture/repository-layout.md) - single-package source tree and build/packaging layout.
- [architecture/routing.md](architecture/routing.md) - web app hash routes: static patterns plus a model-derived index.
- [architecture/ui.md](architecture/ui.md) - web app visual layer: shadcn/ui on Base UI, Tailwind v4, sidebar shell, gate exemptions.
- [architecture/testing.md](architecture/testing.md) - Vitest projects (node + jsdom), React Testing Library, test layout, coverage, CI gate.

## plans/

- [plans/roadmap.md](plans/roadmap.md) - current state and next steps.

## tmp/

- Git-ignored session scraps and handovers. Not part of durable knowledge.

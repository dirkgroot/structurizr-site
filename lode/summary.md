# Summary

**structurizr-site** is a rebuild of
[avisi-cloud/structurizr-site-generatr](https://github.com/avisi-cloud/structurizr-site-generatr):
a static site generator that turns a [Structurizr DSL](https://docs.structurizr.com/dsl) workspace (a C4
architecture model) into a browsable website containing rendered diagrams, documentation, and ADRs.

The rebuild uses a **new architecture**, chosen by the project owner. The reference tool defines desired
_behavior_ and is not a blueprint for the new implementation.

**Status:** pre-alpha. Architecture top-level shape defined (CLI + web app + Structurizr JSON; see
[architecture/summary.md](architecture/summary.md)). Diagram pipeline and clickable SVG links designed and verified
(see [architecture/diagrams.md](architecture/diagrams.md)); distribution implemented (self-contained Bun binaries, CI/release
workflows, Homebrew formula; see [architecture/distribution.md](architecture/distribution.md)); repository layout and
web app routing decided (see [architecture/repository-layout.md](architecture/repository-layout.md) and
[architecture/routing.md](architecture/routing.md)); the web app shell uses shadcn/ui on Base UI with Tailwind v4
(see [architecture/ui.md](architecture/ui.md)). A minimal scaffold exists: the CLI emits a `build/` directory
containing the prebuilt web app. Structurizr functionality is not implemented yet — component details and scope are still
open. See [plans/roadmap.md](plans/roadmap.md). Structurizr workspace JSON types are generated from the vendored
OpenAPI spec (see [architecture/workspace-types.md](architecture/workspace-types.md)).

**Source of truth:** code once it exists; until then, the project owner's stated decisions.

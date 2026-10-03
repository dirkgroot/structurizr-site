# Summary

**structurizr-site** is a rebuild of
[avisi-cloud/structurizr-site-generatr](https://github.com/avisi-cloud/structurizr-site-generatr):
a static site generator that turns a [Structurizr DSL](https://docs.structurizr.com/dsl) workspace (a C4
architecture model) into a browsable website containing rendered diagrams, documentation, and ADRs.

The rebuild uses a **new architecture**, chosen by the project owner. The reference tool defines desired
_behavior_ and is not a blueprint for the new implementation.

**Status:** Architecture top-level shape defined (CLI + SPA + Structurizr JSON; see
[architecture/summary.md](architecture/summary.md)). Diagram pipeline and clickable SVG links designed and verified
(see [architecture/diagrams.md](architecture/diagrams.md)); distribution implemented (npm publish, CI/release
workflows, Homebrew formula; see [architecture/distribution.md](architecture/distribution.md)); repository layout and
SPA routing decided (see [architecture/repository-layout.md](architecture/repository-layout.md) and
[architecture/routing.md](architecture/routing.md)). A minimal scaffold exists: the CLI emits a `build/` directory
containing the prebuilt SPA. Structurizr functionality is not implemented yet — component details and scope are still
open. See [plans/roadmap.md](plans/roadmap.md).

**Source of truth:** code once it exists; until then, the project owner's stated decisions.

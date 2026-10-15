# Open Questions

Forks to resolve while building the architecture incrementally. None are decided; each records the question, known constraints (facts), and candidate options with one-line trade-offs. Roughly ordered by how soon they bite.

## 1. Input contract

**Question:** What does the Rust CLI accept, and who turns it into the workspace JSON the SPA reads? In particular: who inlines `!docs`/`!adrs` content — browser-side code cannot read the user's filesystem.

**Constraints (facts):**
- The original tool's input is Structurizr DSL (+ assets dir), from a local path or a git repository with branches.
- The browser DSL context cannot process `!docs`, `!adrs`, `!plugin`, `!script` (see [../background/structurizr-ecosystem.md](../background/structurizr-ecosystem.md)) — those need a build-time step with filesystem access.
- A faithful Rust port of the Java DSL parser is months of work; scripts/plugins cannot be ported.

**Options:**
- CLI accepts JSON only — simplest; pushes DSL work to the user or to `structurizr-cli`.
- CLI shells out to `structurizr-cli` (JVM) for DSL → JSON — full DSL parity; JVM dependency at build time.
- CLI ports the DSL parser to Rust — single tool, no JVM; large effort, plugin/script parity impossible.

**Status:** open.

## 2. Diagram layout

**Question:** Where do diagram coordinates come from — client-side auto-layout at view time, or layout persisted in the served JSON?

**Constraints (facts):**
- Workspace JSON from Structurizr tooling carries layout; JSON exported from DSL does not.
- Manual layouts require the JSON form; automatic layout works from either (official docs).
- Client-side auto-layout exists in open source (Structurizr playground).

**Options:**
- Auto-layout in the SPA at view time — no layout state to manage; rendering cost per view; manual layouts still need the JSON path.
- Compute/persist layout at build time (CLI) — stable diagrams across visits; extra CLI complexity.
- Require pre-laid workspace JSON — punts layout to Structurizr tooling; poor experience for DSL-only users.

**Status:** open.

## 3. Serving model

**Question:** Pure static hosting only, or does the Rust CLI also act as a dev/preview server? And how does the SPA get JSON during SPA development?

**Constraints (facts):**
- The original tool has a Jetty dependency (role not yet inventoried).
- The SPA needs workspace JSON over HTTP while under development, independent of the production hosting story.

**Options:** static-host only with a separate dev-server story; CLI `serve` subcommand doubling as dev server; third-party dev server for SPA work only.

**Status:** open.

## 4. SPA stack

**Question:** Framework or hand-rolled, and which one? (Rust-side stack is likewise open.)

**Constraints (facts):**
- The work is mostly rendering content (diagrams, docs, ADRs, search) — heavy on libraries, light on app logic.
- Docs rendering alone implies Markdown + AsciiDoc + KaTeX support in the browser; search implies a client-side index library.

**Status:** open.

## 5. Parity order

**Question:** In what order do we rebuild the original feature set? Checklist in [../plans/rewrite.md](../plans/rewrite.md).

**Status:** open.

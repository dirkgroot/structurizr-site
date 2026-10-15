# Rewrite Plan

Goal: reach feature parity with the original tool on the new architecture (SPA + workspace JSON over HTTP + Rust CLI). Sequencing is an open fork ([../architecture/open-questions.md](../architecture/open-questions.md) #5) — the order below is a proposal, not an agreement.

## Parity checklist

- [ ] Diagrams from workspace views
- [ ] Documentation (Markdown, AsciiDoc, KaTeX)
- [ ] ADRs
- [ ] Images / assets directory
- [ ] Multi-branch sites with default branch
- [ ] Themes
- [ ] Client-side search

## Verify before building (may not exist in the original)

- [ ] Diagram key
- [ ] Tag filtering UI

## Proposed build order (agreed as of the walking skeleton)

1. Walking skeleton: CLI emits SPA + one workspace JSON; SPA fetches and renders one diagram. — **done 2026-10-15, minus diagram rendering**: `generate` emits SPA + `workspace.json`; the SPA shows workspace name/description. Diagram rendering is the next step.
2. Input contract resolution (fork #1) — DSL support lands here. — **resolved early**: the CLI shells out to the `structurizr` CLI from day one.
3. Docs + ADRs.
4. Branches.
5. Search, themes, images, remaining polish.

## Excluded from parity (until raised)

- None identified yet.

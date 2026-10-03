# Roadmap

Current state and next steps. Update in place; this is not a changelog.

## State

- Git repository initialized on branch `main`. Contains the Lode only; no source code or build tooling yet.
- Architecture top-level shape defined: CLI emits a deployable directory (rendered diagrams + exported Structurizr
  JSON + SPA bundle); the SPA renders the site client-side from the JSON. See
  [../architecture/summary.md](../architecture/summary.md).

## Next

1. Owner answers the remaining architecture questions (language/runtime, SPA framework, diagram format, docs/ADRs).
2. Agree on initial scope (CLI? first end-to-end slice?).
3. Scaffold the project and record build/run/verify as a skill.

## Open

- Is this a from-scratch rewrite or does it reuse parts of the reference tool?
- What is the target platform/distribution?

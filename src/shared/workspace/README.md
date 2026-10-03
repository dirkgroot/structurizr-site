# Workspace JSON types

TypeScript types for the Structurizr workspace JSON, derived from the official OpenAPI spec.

- `structurizr.yaml` — vendored copy of `structurizr-json/structurizr.yaml` from
  [`structurizr/structurizr`](https://github.com/structurizr/structurizr) tag `v2026.09.19` (`info.version: 6.1.0`).
  Keep it byte-identical to upstream so re-vendoring produces a clean diff.
- `schema.d.ts` — generated from the spec by `npm run generate:workspace-types`. Do not edit by hand.
- `index.ts` — hand-written aliases over `schema.d.ts`; the import surface for the rest of the codebase.

The spec is not attached to Structurizr releases; it lives in the source repo and is addressable by git tag. The
`info.version` field is the JSON schema version, not the tool version, and lags it. Re-vendor the spec and regenerate
when the supported Structurizr backend changes (see `lode/architecture/distribution.md`).

`openapi-typescript` is invoked through `npx` rather than a devDependency: its published versions peer-require
`typescript@^5.x`, while this repo is on TypeScript 7. The generated output is checked in, so the tool only runs when
the spec is updated.

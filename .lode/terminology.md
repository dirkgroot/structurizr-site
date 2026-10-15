# Terminology

Repository of short (term - meaning) lines describing the domain language.

## C4 / Structurizr

- C4 model - abstraction levels for describing software architecture: Context, Container, Component, Code.
- Structurizr - tooling ecosystem (DSL, JSON format, cloud/on-premises server, CLI) built around the C4 model.
- Structurizr DSL - text language for defining a workspace (`workspace.dsl`).
- Workspace - the unit of Structurizr content: model + views + documentation + decisions + configuration.
- Workspace JSON - JSON serialization of a workspace. Carries element/view layout coordinates when produced by Structurizr tooling; DSL-only sources have no layout.
- View - a diagram definition inside the workspace (SystemContext, Container, Component, Deployment, Dynamic, Filtered, Image views), addressed by key.
- `!docs` - DSL directive that reads documentation files and inlines them into the workspace.
- `!adrs` - DSL directive that reads architecture decision records and inlines them into the workspace.
- Theme - named element/relationship styling; in the original tool surfaced via C4-PlantUML tags.

## Original tool

- Structurizr Site Generatr - the original avisi-cloud tool being rewritten (see [background/original-tool.md](background/original-tool.md)).
- Branch - a git branch of the input repository; the original tool builds one site per branch with a default branch.

## New system

- SPA - the single-page application UI (locked decision; replaces generated static HTML).
- CLI - the Rust command-line tool (locked decision).
- Site bundle - tentative name for what the CLI emits (SPA assets + workspace JSON per branch + manifest). Naming not yet agreed.

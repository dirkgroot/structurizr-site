# Terminology

Short `term - meaning` lines describing this project's domain language. Keep additions terse.

## Domain (C4 / Structurizr)

- **C4 model** - a hierarchical way to describe software architecture at four levels: context, container, component, code.
- **Structurizr** - tooling ecosystem for building C4 models as code, notably the Structurizr DSL and Java library.
- **Structurizr DSL** - a text language (`workspace.dsl`) that defines a C4 model: people, software systems, containers, components, and relationships.
- **Workspace** - the root of a Structurizr model. Contains the model and one or more views.
- **Model** - the elements (people, software systems, containers, components) and their relationships.
- **Element** - any named node in the model (person, software system, container, component).
- **Relationship** - a directed, described connection between two elements.
- **View** - a diagram definition projecting part of the model (system context, container, component, deployment, dynamic, filtered).
- **Enterprise boundary** - a deprecated Structurizr grouping; software systems outside it were treated as external.
- **External element** - an element excluded from navigation; determined by the enterprise boundary or a configurable tag.
- **ADR** - Architecture Decision Record, markdown/AsciiDoc files included in the generated site at workspace and software-system scope.
- **C4PlantUMLExporter** - the default Structurizr exporter used to render diagrams as PlantUML/SVG/PNG.
- **StructurizrPlantUMLExporter** - an alternative exporter selected via the `structurizr` setting.

## Generated site

- **Workspace file** - the input `.dsl` file (`--workspace-file` / `-w`).
- **Assets directory** - directory of static assets (logos, favicon, custom CSS, ADR/doc images) (`--assets-dir` / `-a`).
- **Build output** - the deployable directory emitted by the CLI, containing the SPA bundle, rendered diagram assets,
  and the exported workspace JSON. `./build` by default.
- **SPA** - the client-side single-page app that fetches the workspace JSON and renders the site in the browser.
- **Workspace JSON** - the Structurizr JSON export of the workspace; the SPA's runtime data source.
- **Diagram asset** - a pre-rendered diagram file emitted by the CLI and referenced by the SPA.
- **Generatr property** - a view/model property prefixed `generatr.` that customizes site output (style, search, exporter, theme, etc.).

## Project / process

- **Lode** - the AI-owned markdown memory repository at `lode/`; describes what the system *is*.
- **Skill** - a procedural, invokable how-to (e.g. run/verify the app); lives outside the Lode.
- **Reference tool** - the Avisi `structurizr-site-generatr`, used as the behavioral spec for the rebuild.

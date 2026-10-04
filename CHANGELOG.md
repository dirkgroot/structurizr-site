# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0-pre-alpha.5] - 2026-10-04

### Features

- Render the system landscape diagram
- Add @shared alias for src/shared imports

### Refactoring

- [**breaking**] Rename generate-site command to generate
- Make the diagram component generic
- Require viewKey on Diagram
- Reduce sidebar nav to a single home link

### Miscellaneous Tasks

- Hand off Homebrew verification to the user in the release skill
- Update the Homebrew tap from a clone in lode/tmp
- Bundle the CLI with bun instead of emitting with tsc
- Replace npm with bun
- Publish an example site to GitHub Pages

## [0.2.0-pre-alpha.4] - 2026-10-04

### Refactoring

- Copy embedded web app straight to the output directory

### Miscellaneous Tasks

- Stop tracking rendered Homebrew formula

## [0.2.0-pre-alpha.3] - 2026-10-03

### Features

- Generate workspace JSON types from the Structurizr OpenAPI spec
- Export the workspace JSON via the Structurizr backend
- Derive the site name from the loaded workspace
- Serve the workspace JSON from the Vite dev server
- Reload the dev page when the workspace file changes

### Refactoring

- Rename the spa component to web

### Documentation

- Stop tracking the current version in the lode
- Document the workspace name slice and refresh the lode

### Miscellaneous Tasks

- Add watch script for the web dev server

## [0.2.0-pre-alpha.2] - 2026-10-03

### Features

- Add shadcn/ui sidebar app shell

### Miscellaneous Tasks

- Regenerate changelog after removing v0.1.0/v0.1.1 tags
- Skip Homebrew formula updates in the changelog
- Add release skill for cutting releases end to end

## [0.2.0-pre-alpha.1] - 2026-10-03

### Miscellaneous Tasks

- Generate changelog and release notes with git-cliff
- Indicate the pre-alpha stage in the version number

### Other

- Initial commit
- Define architecture: CLI emits deployable SPA + JSON site
- Document diagram pipeline and clickable SVG link design
- Decide distribution: vendored Structurizr jars, Node as dependency
- Use maintained Structurizr vNext as external dependency, not vendored legacy CLI
- Prebuilt Structurizr war is not redistributable (EULA)
- Confirm backend stays an external dependency; close vendoring question
- Decide repository layout and SPA routing: single package, static route patterns
- Pin build tooling with mise; Node LTS 24.21.0
- Scaffold CLI and SPA: CLI emits build/ with the prebuilt SPA
- Add EditorConfig and Oxc tooling: oxlint linter, oxfmt formatter
- Set up distribution: npm publish, CI/release workflows, Homebrew formula
- Add Vitest unit tests with React Testing Library
- Add serve command: generate the site and serve it on port 8080
- Publish releases as GitHub release assets instead of npm
- Record the Homebrew tap and first release in docs
- Distribute self-contained Bun binaries instead of an npm tarball

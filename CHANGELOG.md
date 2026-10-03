# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Other

- Render Homebrew formula for v0.1.1 binaries

## [0.1.1] - 2026-10-03

### Other

- Fill Homebrew formula for the v0.1.0 release
- Record the Homebrew tap and first release in docs
- Distribute self-contained Bun binaries instead of an npm tarball

## [0.1.0] - 2026-10-03

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

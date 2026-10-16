# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add shadcn with sidebar-01 layout to the web SPA
- Serve workspace json from the vite dev server
- Generate workspace json in the vite dev server
- Add client-side routing with workspace and software system pages
- Add --router and --base-path flags for hash or path page urls
- Address software systems by name slug instead of id

### Changed

- Record dev loop and separator notes in lode
- Document router modes
- Split main.rs into focused modules
- Record the cli module layout in the lode
- Add unit and shim-based integration tests for the cli
- Record cli testing in the lode
- Derive routes and breadcrumbs from a shared route table
- Add vitest and react testing library suite for the spa
- Record spa testing in the lode
- Add Intel macOS build and Homebrew tap automation
- Document Homebrew install and tap automation
- Record distribution in the lode

### Fixed

- Center vertical separators in flex rows
- Pin the vitest project root to web/

### Removed

- Remove unused shadcn components and exports

## [0.0.1-pre-alpha1] - 2026-10-15

### Added

- `structurizr-site generate` command: exports a workspace to JSON with the structurizr CLI and copies the SPA into the output directory.
- SPA that displays the workspace name and description.

[unreleased]: https://github.com/dirkgroot/structurizr-site/compare/v0.0.1-pre-alpha1..HEAD
[0.0.1-pre-alpha1]: https://github.com/dirkgroot/structurizr-site/tree/v0.0.1-pre-alpha1

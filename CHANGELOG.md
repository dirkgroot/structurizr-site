# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Client-side routing: the Home menu item links to a page with the workspace description, and each software system links to a page with its description.
- `generate --router` (`hash`|`path`) chooses between hash and path page URLs; `--base-path` supports hosting path-URL sites below the domain root.

## [0.0.1-pre-alpha1] - 2026-10-15

### Added

- `structurizr-site generate` command: exports a workspace to JSON with the structurizr CLI and copies the SPA into the output directory.
- SPA that displays the workspace name and description.

[unreleased]: https://github.com/dirkgroot/structurizr-site/compare/v0.0.1-pre-alpha1..HEAD
[0.0.1-pre-alpha1]: https://github.com/dirkgroot/structurizr-site/tree/v0.0.1-pre-alpha1

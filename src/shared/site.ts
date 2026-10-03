// Runtime-agnostic values shared by the CLI and the SPA. This module must not
// import Node or browser APIs (see lode/architecture/repository-layout.md).

/** Display name of the generated site. */
export const SITE_NAME = "Structurizr Site";

/** Directory the CLI writes the deployable site into, relative to the cwd. */
export const DEFAULT_OUTPUT_DIR = "build";

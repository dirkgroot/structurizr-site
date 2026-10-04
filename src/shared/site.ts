// Runtime-agnostic values shared by the CLI and the web app. This module must not
// import Node or browser APIs (see lode/architecture/repository-layout.md).
import type { Workspace } from "./workspace";

/** Display name of the site before a workspace has been loaded (or if loading fails). */
export const SITE_NAME = "Structurizr Site";

/** Directory the CLI writes the deployable site into, relative to the cwd. */
export const DEFAULT_OUTPUT_DIR = "build";

/**
 * The site name derived from a loaded workspace: its name, falling back to
 * `SITE_NAME` when the workspace has none.
 */
export function siteName(workspace: Pick<Workspace, "name"> | undefined): string {
  return workspace?.name?.trim() || SITE_NAME;
}

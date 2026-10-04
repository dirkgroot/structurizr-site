// Runtime-agnostic diagram contract shared by the CLI and the web app. This
// module must not import Node or browser APIs
// (see lode/architecture/repository-layout.md).
import type { Workspace } from "./workspace/index.js";

/** Directory (relative to the site root) the CLI writes rendered diagrams into. */
export const DIAGRAMS_DIR = "diagrams";

/** File name of a rendered diagram for a Structurizr view key. */
export function diagramFileName(viewKey: string): string {
  return `${viewKey}.svg`;
}

/** Site-relative path of a rendered diagram for a Structurizr view key. */
export function diagramPath(viewKey: string): string {
  return `${DIAGRAMS_DIR}/${diagramFileName(viewKey)}`;
}

/**
 * View key of the workspace's system landscape view, or `undefined` when the
 * workspace has none. Structurizr keeps the landscape view separate from the
 * named context/container/component view lists.
 */
export function systemLandscapeViewKey(workspace: Workspace | undefined): string | undefined {
  return workspace?.views?.systemLandscapeViews?.[0]?.key;
}

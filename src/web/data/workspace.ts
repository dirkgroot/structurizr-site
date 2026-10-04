import type { Workspace } from "@shared/workspace";

/** Deployment-relative path the CLI writes the exported workspace to. */
export const WORKSPACE_FILE = "workspace.json";

/**
 * Load the exported workspace JSON. Returns `undefined` when it is absent or
 * unreadable, so the app can fall back to a placeholder site. The path is
 * relative, so the site works under any static-host base path.
 */
export async function loadWorkspace(fetchFn: typeof fetch = fetch): Promise<Workspace | undefined> {
  try {
    const response = await fetchFn(WORKSPACE_FILE, { headers: { accept: "application/json" } });
    if (!response.ok) {
      return undefined;
    }
    return (await response.json()) as Workspace;
  } catch {
    return undefined;
  }
}

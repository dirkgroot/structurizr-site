/**
 * Resolve the Structurizr backend command. For now: an explicit `--structurizr`
 * override, otherwise `structurizr` on `PATH`. The full resolution order
 * (war/Docker/environment) is deferred; see lode/architecture/distribution.md.
 */
export const DEFAULT_STRUCTURIZR_COMMAND = "structurizr";

export function resolveStructurizr(override?: string): string {
  return override?.trim() || DEFAULT_STRUCTURIZR_COMMAND;
}

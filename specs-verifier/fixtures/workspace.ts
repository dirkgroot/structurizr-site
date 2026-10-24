/** A workspace file a spec hands to the CLI or the site fixture. */
export interface Workspace {
  /** File name the workspace is written as, e.g. `acme.dsl`. */
  file: string
  /** File content: Structurizr DSL or workspace JSON. */
  content: string
}

export function workspace(file: string, content: string): Workspace {
  return { file, content }
}

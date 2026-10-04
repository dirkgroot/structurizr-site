// Friendly aliases over the generated Structurizr JSON schema
// (src/shared/workspace/schema.d.ts). Add aliases as consumers need them.
import type { components } from "./schema";

/** The root of a Structurizr workspace, as exported to `workspace.json`. */
export type Workspace = components["schemas"]["Workspace"];

import { readFileSync } from "node:fs";
import path from "node:path";

import { workspace, type Workspace } from "../fixtures/workspace.ts";

// DSL sources live next to the specs that use them (specs/workspaces).
const read = (file: string): string =>
  readFileSync(path.join(import.meta.dirname, "../../specs/workspaces", file), "utf8");

/** Two software systems; the workhorse for navigation and rendering specs. */
export const acme: Workspace = workspace("acme.dsl", read("acme.dsl"));

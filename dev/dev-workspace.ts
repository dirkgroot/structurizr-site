import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { Plugin } from "vite";
import { exportJson } from "../src/cli/pipeline/export-json.js";
import { WORKSPACE_FILE } from "../src/web/data/workspace.ts";

/** Env var holding the workspace file the dev server serves. */
export const WORKSPACE_FILE_ENV = "VITE_WORKSPACE_FILE";

/** Env var holding the Structurizr backend command override. */
export const STRUCTURIZR_ENV = "VITE_STRUCTURIZR";

/** Workspace file the dev server serves when `VITE_WORKSPACE_FILE` is unset. */
export const DEFAULT_WORKSPACE_FILE = "test/fixtures/workspace.dsl";

const ROUTE = `/${WORKSPACE_FILE}`;

export interface DevWorkspaceOptions {
  /** Workspace file to export; defaults to `VITE_WORKSPACE_FILE` or the fixture. */
  workspaceFile?: string;
  /** Structurizr backend override; defaults to `VITE_STRUCTURIZR`. */
  structurizr?: string;
  /** Runs the export and returns the exported JSON. Injectable for tests. */
  runExport?: (options: {
    workspaceFile: string;
    outputDir: string;
    structurizr?: string;
  }) => Promise<string>;
}

/**
 * Run the export pipeline and read back the exported JSON from disk.
 */
async function exportAndRead(options: {
  workspaceFile: string;
  outputDir: string;
  structurizr?: string;
}): Promise<string> {
  await exportJson(options);
  return readFile(join(options.outputDir, WORKSPACE_FILE), "utf8");
}

/**
 * Dev-server plugin that serves the exported workspace JSON at `/workspace.json`,
 * so `npm run watch` runs the web app against a real workspace under HMR. The
 * export is cached and re-run when the workspace file changes.
 *
 * The export happens lazily, on the first request: Vite has already started by
 * the time the browser asks for it, and a backend failure becomes a clear dev
 * error instead of a failed server start.
 */
export function devWorkspace(options: DevWorkspaceOptions = {}): Plugin {
  const workspaceFile =
    options.workspaceFile ?? process.env[WORKSPACE_FILE_ENV] ?? DEFAULT_WORKSPACE_FILE;
  const structurizr = options.structurizr ?? process.env[STRUCTURIZR_ENV];
  const runExport = options.runExport ?? exportAndRead;

  let cached: string | undefined;
  let outputDir: Promise<string> | undefined;

  async function exportToDisk(): Promise<string> {
    const dir = await (outputDir ??= mkdtemp(join(tmpdir(), "structurizr-site-watch-")));
    return runExport({ workspaceFile, outputDir: dir, structurizr });
  }

  return {
    name: "structurizr-site:dev-workspace",
    apply: "serve",

    configureServer(server) {
      const invalidate = (): void => {
        cached = undefined;
      };
      server.watcher.add(resolve(workspaceFile));
      server.watcher.on("change", (path) => {
        if (resolve(path) === resolve(workspaceFile)) {
          invalidate();
          // The workspace is fetched by main.tsx, not imported as a module, so
          // HMR cannot replace it in place: reload the page to re-fetch.
          server.ws.send({ type: "full-reload" });
        }
      });

      server.httpServer?.once("close", () => {
        if (outputDir) {
          void outputDir.then((dir) => rm(dir, { recursive: true, force: true }));
        }
      });

      server.middlewares.use(async (request, response, next) => {
        if (!request.url || request.url.split("?")[0] !== ROUTE) {
          next();
          return;
        }

        try {
          cached ??= await exportToDisk();
          response.setHeader("content-type", "application/json; charset=utf-8");
          response.end(cached);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          response.statusCode = 500;
          response.setHeader("content-type", "text/plain; charset=utf-8");
          response.end(`Failed to export ${workspaceFile}:\n${message}`);
          server.config.logger.error(`[dev-workspace] ${message}`);
        }
      });
    },
  };
}

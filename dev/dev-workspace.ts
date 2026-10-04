import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { Plugin } from "vite";
import { DIAGRAMS_DIR } from "../src/shared/diagrams";
import { exportJson } from "../src/cli/pipeline/export-json";
import { renderLandscape } from "../src/cli/pipeline/render-landscape";
import { WORKSPACE_FILE } from "../src/web/data/workspace";

/** Env var holding the workspace file the dev server serves. */
export const WORKSPACE_FILE_ENV = "VITE_WORKSPACE_FILE";

/** Env var holding the Structurizr backend command override. */
export const STRUCTURIZR_ENV = "VITE_STRUCTURIZR";

/** Env var holding the PlantUML command override. */
export const PLANTUML_ENV = "VITE_PLANTUML";

/** Workspace file the dev server serves when `VITE_WORKSPACE_FILE` is unset. */
export const DEFAULT_WORKSPACE_FILE = "test/fixtures/workspace.dsl";

const ROUTE = `/${WORKSPACE_FILE}`;
const DIAGRAMS_PREFIX = `/${DIAGRAMS_DIR}/`;

export interface DevWorkspaceOptions {
  /** Workspace file to export; defaults to `VITE_WORKSPACE_FILE` or the fixture. */
  workspaceFile?: string;
  /** Structurizr backend override; defaults to `VITE_STRUCTURIZR`. */
  structurizr?: string;
  /** PlantUML backend override; defaults to `VITE_PLANTUML`. */
  plantuml?: string;
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
 * Dev-server plugin that serves the exported workspace JSON at `/workspace.json`
 * and the rendered system landscape SVG under `/diagrams/`, so `npm run watch`
 * runs the web app against a real workspace under HMR. Assets are rendered on
 * demand and cached; a change to the workspace file invalidates the cache.
 *
 * The export happens lazily, on the first request: Vite has already started by
 * the time the browser asks for it, and a backend failure becomes a clear dev
 * error instead of a failed server start.
 */
export function devWorkspace(options: DevWorkspaceOptions = {}): Plugin {
  const workspaceFile =
    options.workspaceFile ?? process.env[WORKSPACE_FILE_ENV] ?? DEFAULT_WORKSPACE_FILE;
  const structurizr = options.structurizr ?? process.env[STRUCTURIZR_ENV];
  const plantuml = options.plantuml ?? process.env[PLANTUML_ENV];
  const runExport = options.runExport ?? exportAndRead;

  let cached: string | undefined;
  let rendered: Promise<void> | undefined;
  let outputDir: Promise<string> | undefined;

  async function dir(): Promise<string> {
    return (outputDir ??= mkdtemp(join(tmpdir(), "structurizr-site-watch-")));
  }

  async function exportToDisk(): Promise<string> {
    return runExport({ workspaceFile, outputDir: await dir(), structurizr });
  }

  /** Render diagrams once per cache generation; reuse thereafter. */
  function renderOnce(): Promise<void> {
    return (rendered ??= (async () => {
      await renderLandscape({ workspaceFile, outputDir: await dir(), structurizr, plantuml });
    })());
  }

  return {
    name: "structurizr-site:dev-workspace",
    apply: "serve",

    configureServer(server) {
      const invalidate = (): void => {
        cached = undefined;
        rendered = undefined;
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
          void outputDir.then((d) => rm(d, { recursive: true, force: true }));
        }
      });

      server.middlewares.use(async (request, response, next) => {
        const path = request.url?.split("?")[0];
        const isWorkspace = path === ROUTE;
        const isDiagram = path?.startsWith(DIAGRAMS_PREFIX) ?? false;
        if (!isWorkspace && !isDiagram) {
          next();
          return;
        }

        try {
          if (isWorkspace) {
            cached ??= await exportToDisk();
            response.setHeader("content-type", "application/json; charset=utf-8");
            response.end(cached);
            return;
          }

          cached ??= await exportToDisk();
          await renderOnce();
          const body = await readFile(join(await dir(), path!));
          response.setHeader("content-type", "image/svg+xml; charset=utf-8");
          response.end(body);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          response.statusCode = 500;
          response.setHeader("content-type", "text/plain; charset=utf-8");
          response.end(`Failed to render ${workspaceFile}:\n${message}`);
          server.config.logger.error(`[dev-workspace] ${message}`);
        }
      });
    },
  };
}

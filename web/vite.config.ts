import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const execFileAsync = promisify(execFile);

// Generates workspace JSON ad-hoc from the example DSL, so the SPA's
// fetch('./workspace.json') works during dev without a prior
// `cargo run -- generate`. Exports are cached in Vite's cache dir and
// reused until the DSL file changes.
function workspaceJson(): Plugin {
  const dsl = path.resolve(import.meta.dirname, "../example/workspace.dsl");
  const stem = path.basename(dsl, path.extname(dsl));
  let cache: { key: string; data: Buffer } | null = null;
  let pending: Promise<Buffer> | null = null;

  function exportWorkspace(cacheDir: string): Promise<Buffer> {
    if (!pending) {
      pending = runExport(cacheDir).finally(() => {
        pending = null;
      });
    }
    return pending;
  }

  async function runExport(cacheDir: string): Promise<Buffer> {
    const stat = await fs.promises.stat(dsl);
    const key = `${stat.mtimeMs}:${stat.size}`;
    if (cache?.key === key) return cache.data;

    const dir = path.join(cacheDir, "workspace");
    await fs.promises.mkdir(dir, { recursive: true });
    try {
      await execFileAsync("structurizr", ["export", "-w", dsl, "-f", "json", "-o", dir]);
    } catch (err) {
      const e = err as NodeJS.ErrnoException & { stderr?: string };
      if (e.code === "ENOENT") {
        throw new Error(
          "failed to run `structurizr`; is it on your PATH? \
Install it from https://docs.structurizr.com/cli (requires Java)",
        );
      }
      throw new Error(`structurizr export failed:\n${e.stderr ?? e.message}`);
    }

    const data = await fs.promises.readFile(path.join(dir, `${stem}.json`));
    cache = { key, data };
    return data;
  }

  return {
    name: "serve-workspace-json",
    apply: "serve",
    configureServer(server) {
      server.watcher.add(dsl);
      server.watcher.on("change", (file) => {
        if (file !== dsl) return;
        cache = null;
        server.ws.send({ type: "full-reload" });
      });
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split("?")[0] !== "/workspace.json") return next();
        try {
          res.setHeader("Content-Type", "application/json");
          res.end(await exportWorkspace(server.config.cacheDir));
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          server.config.logger.error(message, { error: err as Error });
          res.statusCode = 500;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(message);
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [workspaceJson(), react(), tailwindcss()],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});

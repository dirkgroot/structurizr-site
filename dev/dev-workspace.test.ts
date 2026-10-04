import { EventEmitter } from "node:events";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { devWorkspace, type DevWorkspaceOptions } from "./dev-workspace.js";

const { renderLandscape } = vi.hoisted(() => ({ renderLandscape: vi.fn() }));
vi.mock("../src/cli/pipeline/render-landscape.js", () => ({ renderLandscape }));

interface FakeServer {
  watcher: EventEmitter & { add: (path: string) => void };
  middlewares: { use: (fn: Middleware) => void };
  config: { logger: { error: (msg: string) => void } };
  ws: { send: (payload: { type: string }) => void };
}

type Middleware = (request: { url?: string }, response: FakeResponse, next: () => void) => void;

interface FakeResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string | Buffer;
  ended: boolean;
  setHeader(name: string, value: string): void;
  end(chunk?: string | Buffer): void;
}

function fakeResponse(): FakeResponse {
  return {
    statusCode: 200,
    headers: {},
    body: "",
    ended: false,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    end(chunk) {
      this.body = chunk ?? "";
      this.ended = true;
    },
  };
}

function setup(plugin: ReturnType<typeof devWorkspace>) {
  const watcher = new EventEmitter() as FakeServer["watcher"];
  const added: string[] = [];
  watcher.add = (path) => added.push(path);

  let middleware: Middleware | undefined;
  const errors: string[] = [];
  const sent: { type: string }[] = [];
  const server: FakeServer = {
    watcher,
    middlewares: { use: (fn) => (middleware = fn) },
    config: { logger: { error: (msg) => errors.push(msg) } },
    ws: { send: (payload) => sent.push(payload) },
  };

  (plugin.configureServer as unknown as (s: FakeServer) => void)(server);

  if (!middleware) {
    throw new Error("plugin did not register middleware");
  }
  return { middleware, watcher, added, errors, sent };
}

describe("devWorkspace", () => {
  let runExport: Mock<NonNullable<DevWorkspaceOptions["runExport"]>>;

  beforeEach(() => {
    runExport = vi.fn().mockResolvedValue('{"name":"My Architecture"}');
    renderLandscape.mockReset();
    renderLandscape.mockResolvedValue(undefined);
  });
  it("passes non-workspace requests through", () => {
    const { middleware } = setup(devWorkspace({ workspaceFile: "w.dsl", runExport }));
    const response = fakeResponse();
    const next = vi.fn();

    middleware({ url: "/index.html" }, response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(runExport).not.toHaveBeenCalled();
  });

  it("exports the workspace and serves it as JSON", async () => {
    const { middleware } = setup(
      devWorkspace({ workspaceFile: "w.dsl", structurizr: "my-structurizr", runExport }),
    );
    const response = fakeResponse();
    const next = vi.fn();

    middleware({ url: "/workspace.json" }, response, next);
    await vi.waitFor(() => expect(response.ended).toBe(true));

    expect(runExport).toHaveBeenCalledOnce();
    expect(runExport.mock.calls[0][0]).toMatchObject({
      workspaceFile: "w.dsl",
      structurizr: "my-structurizr",
    });
    expect(response.headers["content-type"]).toBe("application/json; charset=utf-8");
    expect(response.body).toBe('{"name":"My Architecture"}');
    expect(next).not.toHaveBeenCalled();
  });

  it("caches the export across requests", async () => {
    const { middleware } = setup(devWorkspace({ workspaceFile: "w.dsl", runExport }));

    middleware({ url: "/workspace.json" }, fakeResponse(), vi.fn());
    await vi.waitFor(() => expect(runExport).toHaveBeenCalledOnce());
    middleware({ url: "/workspace.json" }, fakeResponse(), vi.fn());

    expect(runExport).toHaveBeenCalledOnce();
  });

  it("renders and serves diagram SVGs, rendering only once", async () => {
    renderLandscape.mockImplementation(async ({ outputDir }: { outputDir: string }) => {
      await mkdir(join(outputDir, "diagrams"), { recursive: true });
      await writeFile(join(outputDir, "diagrams", "SystemLandscape-001.svg"), "<svg/>");
    });
    const { middleware } = setup(devWorkspace({ workspaceFile: "w.dsl", runExport }));

    const first = fakeResponse();
    middleware({ url: "/diagrams/SystemLandscape-001.svg" }, first, vi.fn());
    await vi.waitFor(() => expect(first.ended).toBe(true));

    expect(first.headers["content-type"]).toBe("image/svg+xml; charset=utf-8");
    expect(first.body.toString()).toBe("<svg/>");
    expect(renderLandscape).toHaveBeenCalledOnce();

    middleware({ url: "/diagrams/SystemLandscape-001.svg" }, fakeResponse(), vi.fn());
    await vi.waitFor(() => expect(renderLandscape).toHaveBeenCalledOnce());
  });

  it("re-exports after the workspace file changes", async () => {
    const { middleware, watcher } = setup(devWorkspace({ workspaceFile: "w.dsl", runExport }));

    const first = fakeResponse();
    middleware({ url: "/workspace.json" }, first, vi.fn());
    await vi.waitFor(() => expect(first.ended).toBe(true));

    watcher.emit("change", resolveFromCwd("w.dsl"));

    const second = fakeResponse();
    middleware({ url: "/workspace.json" }, second, vi.fn());
    await vi.waitFor(() => expect(second.ended).toBe(true));

    expect(runExport).toHaveBeenCalledTimes(2);
  });

  it("triggers a full reload when the workspace file changes", () => {
    const { watcher, sent } = setup(devWorkspace({ workspaceFile: "w.dsl", runExport }));

    watcher.emit("change", resolveFromCwd("w.dsl"));

    expect(sent).toEqual([{ type: "full-reload" }]);
  });

  it("does not reload for unrelated file changes", () => {
    const { watcher, sent } = setup(devWorkspace({ workspaceFile: "w.dsl", runExport }));

    watcher.emit("change", resolveFromCwd("src/web/main.tsx"));

    expect(sent).toEqual([]);
  });

  it("returns 500 with the failure message when the export fails", async () => {
    runExport.mockRejectedValue(new Error("backend missing"));
    const { middleware, errors } = setup(devWorkspace({ workspaceFile: "w.dsl", runExport }));
    const response = fakeResponse();

    middleware({ url: "/workspace.json" }, response, vi.fn());
    await vi.waitFor(() => expect(response.ended).toBe(true));

    expect(response.statusCode).toBe(500);
    expect(response.body).toContain("backend missing");
    expect(errors.some((e) => e.includes("backend missing"))).toBe(true);
  });

  it("watches the workspace file", () => {
    const { added } = setup(devWorkspace({ workspaceFile: "arch/workspace.dsl", runExport }));
    expect(added.some((p) => p.endsWith("arch/workspace.dsl"))).toBe(true);
  });
});

function resolveFromCwd(path: string): string {
  return new URL(`file://${process.cwd()}/${path}`).pathname;
}

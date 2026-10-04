import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { serve, type RunningServer } from "./serve";

describe("serve", () => {
  let base: string;
  let root: string;
  let running: RunningServer | undefined;

  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), "structurizr-site-serve-"));
    root = join(base, "public");
    await mkdir(root);
    await writeFile(join(root, "index.html"), "<!doctype html><title>Site</title>");
    await mkdir(join(root, "assets"));
    await writeFile(join(root, "assets", "app.js"), "console.log('hi')");
  });

  afterEach(async () => {
    await running?.close();
    running = undefined;
    await rm(base, { recursive: true, force: true });
  });

  it("serves index.html at the root", async () => {
    running = await serve(root, { port: 0 });

    const response = await fetch(`http://localhost:${running.port}/`);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(await response.text()).toContain("Site");
  });

  it("serves nested files with a matching content type", async () => {
    running = await serve(root, { port: 0 });

    const response = await fetch(`http://localhost:${running.port}/assets/app.js`);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/javascript; charset=utf-8");
    expect(await response.text()).toBe("console.log('hi')");
  });

  it("falls back to index.html for unknown extensionless routes", async () => {
    running = await serve(root, { port: 0 });

    const response = await fetch(`http://localhost:${running.port}/some/web/route`);

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Site");
  });

  it("returns 404 for a missing file", async () => {
    running = await serve(root, { port: 0 });

    const response = await fetch(`http://localhost:${running.port}/missing.png`);

    expect(response.status).toBe(404);
  });

  it("rejects non-GET and non-HEAD requests", async () => {
    running = await serve(root, { port: 0 });

    const response = await fetch(`http://localhost:${running.port}/`, { method: "POST" });

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET, HEAD");
  });

  it("answers HEAD without a body", async () => {
    running = await serve(root, { port: 0 });

    const response = await fetch(`http://localhost:${running.port}/`, { method: "HEAD" });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("");
  });

  it("does not serve files outside the root", async () => {
    await writeFile(join(base, "secret.txt"), "secret");
    running = await serve(root, { port: 0 });

    const response = await fetch(`http://localhost:${running.port}/..%2fsecret.txt`);

    expect(response.status).toBe(404);
    expect(await response.text()).not.toContain("secret");
  });

  it("throws when the requested port is already in use", async () => {
    running = await serve(root, { port: 0 });
    const conflicting = serve(root, { port: running.port });

    await expect(conflicting).rejects.toThrow();
  });
});

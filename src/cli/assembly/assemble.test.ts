import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { assemble, setWebBundleAssets } from "./assemble";

describe("assemble", () => {
  let workDir: string;

  beforeEach(async () => {
    workDir = await mkdtemp(join(tmpdir(), "structurizr-site-assemble-"));
  });

  afterEach(async () => {
    setWebBundleAssets(undefined);
    await rm(workDir, { recursive: true, force: true });
  });

  it("copies the source bundle into the output directory", async () => {
    const source = join(workDir, "web");
    await mkdir(join(source, "assets"), { recursive: true });
    await writeFile(join(source, "index.html"), "<html></html>");
    await writeFile(join(source, "assets", "app.js"), "console.log(1)");

    const output = join(workDir, "out");
    await assemble(output, source);

    expect(await readFile(join(output, "index.html"), "utf8")).toBe("<html></html>");
    expect(await readFile(join(output, "assets", "app.js"), "utf8")).toBe("console.log(1)");
  });

  it("replaces any previous output contents", async () => {
    const source = join(workDir, "web");
    await mkdir(source, { recursive: true });
    await writeFile(join(source, "fresh.txt"), "fresh");

    const output = join(workDir, "out");
    await mkdir(output, { recursive: true });
    await writeFile(join(output, "stale.txt"), "stale");

    await assemble(output, source);

    await expect(readFile(join(output, "stale.txt"))).rejects.toThrow();
    expect(await readFile(join(output, "fresh.txt"), "utf8")).toBe("fresh");
  });

  it("fails when the source bundle is missing", async () => {
    const missing = join(workDir, "missing");
    await expect(assemble(join(workDir, "out"), missing)).rejects.toThrow(
      `prebuilt web app not found at ${missing}`,
    );
  });

  it("copies the embedded bundle straight into the output directory", async () => {
    const embedded = join(workDir, "embedded");
    await mkdir(join(embedded, "nested"), { recursive: true });
    await writeFile(join(embedded, "index.html"), "<html></html>");
    await writeFile(join(embedded, "nested", "app.js"), "console.log(1)");
    setWebBundleAssets({
      "index.html": join(embedded, "index.html"),
      "assets/app.js": join(embedded, "nested", "app.js"),
    });

    const output = join(workDir, "out");
    await mkdir(output, { recursive: true });
    await writeFile(join(output, "stale.txt"), "stale");

    await assemble(output);

    expect(await readFile(join(output, "index.html"), "utf8")).toBe("<html></html>");
    expect(await readFile(join(output, "assets", "app.js"), "utf8")).toBe("console.log(1)");
    await expect(readFile(join(output, "stale.txt"))).rejects.toThrow();
  });
});

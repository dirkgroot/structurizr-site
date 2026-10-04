import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { serveSite } from "./serve-site";

const { generateSite } = vi.hoisted(() => ({ generateSite: vi.fn() }));
const { serve } = vi.hoisted(() => ({ serve: vi.fn() }));

vi.mock("./generate-site.js", () => ({ generateSite }));
vi.mock("../serve/serve.js", () => ({ serve, DEFAULT_PORT: 8080 }));

describe("serveSite", () => {
  beforeEach(() => {
    generateSite.mockReset();
    generateSite.mockResolvedValue(undefined);
    serve.mockReset();
    serve.mockResolvedValue({ port: 8080, close: vi.fn() });
    vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates the site into the default directory and serves it on port 8080", async () => {
    await serveSite({});

    expect(generateSite).toHaveBeenCalledWith({
      output: resolve("build"),
      workspaceFile: undefined,
      structurizr: undefined,
    });
    expect(serve).toHaveBeenCalledWith(resolve("build"), { port: 8080 });
    expect(process.stdout.write).toHaveBeenCalledWith(
      `Serving ${resolve("build")} at http://localhost:8080\n`,
    );
  });

  it("resolves the output directory and forwards an explicit port", async () => {
    await serveSite({ output: "out/site", port: 9000 });

    expect(generateSite).toHaveBeenCalledWith({
      output: resolve("out/site"),
      workspaceFile: undefined,
      structurizr: undefined,
    });
    expect(serve).toHaveBeenCalledWith(resolve("out/site"), { port: 9000 });
  });

  it("forwards the workspace file and backend override to generate", async () => {
    await serveSite({ workspaceFile: "workspace.dsl", structurizr: "my-structurizr" });

    expect(generateSite).toHaveBeenCalledWith({
      output: resolve("build"),
      workspaceFile: "workspace.dsl",
      structurizr: "my-structurizr",
    });
  });
});

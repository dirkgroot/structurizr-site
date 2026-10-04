import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { run } from "./main.js";

const { generateSite } = vi.hoisted(() => ({ generateSite: vi.fn() }));
const { serveSite } = vi.hoisted(() => ({ serveSite: vi.fn() }));

vi.mock("./commands/generate-site.js", () => ({ generateSite }));
vi.mock("./commands/serve-site.js", () => ({ serveSite }));

describe("run", () => {
  beforeEach(() => {
    generateSite.mockReset();
    generateSite.mockResolvedValue(undefined);
    serveSite.mockReset();
    serveSite.mockResolvedValue(undefined);
    vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates a site with the default output when no command is given", async () => {
    await run([]);
    expect(generateSite).toHaveBeenCalledWith({
      output: undefined,
      workspaceFile: undefined,
      structurizr: undefined,
    });
  });

  it("passes an explicit output directory", async () => {
    await run(["generate", "-o", "out"]);
    expect(generateSite).toHaveBeenCalledWith({
      output: "out",
      workspaceFile: undefined,
      structurizr: undefined,
    });
  });

  it("supports the --output=<dir> form", async () => {
    await run(["generate", "--output=out"]);
    expect(generateSite).toHaveBeenCalledWith({
      output: "out",
      workspaceFile: undefined,
      structurizr: undefined,
    });
  });

  it("passes a workspace file", async () => {
    await run(["generate", "-w", "architecture/workspace.dsl"]);
    expect(generateSite).toHaveBeenCalledWith({
      output: undefined,
      workspaceFile: "architecture/workspace.dsl",
      structurizr: undefined,
    });
  });

  it("supports the --workspace-file=<path> form", async () => {
    await run(["generate", "--workspace-file=workspace.json"]);
    expect(generateSite).toHaveBeenCalledWith({
      output: undefined,
      workspaceFile: "workspace.json",
      structurizr: undefined,
    });
  });

  it("passes a structurizr backend override", async () => {
    await run(["generate", "--structurizr", "my-structurizr"]);
    expect(generateSite).toHaveBeenCalledWith({
      output: undefined,
      workspaceFile: undefined,
      structurizr: "my-structurizr",
    });
  });

  it("supports the --structurizr=<command> form", async () => {
    await run(["generate", "--structurizr=my-structurizr"]);
    expect(generateSite).toHaveBeenCalledWith({
      output: undefined,
      workspaceFile: undefined,
      structurizr: "my-structurizr",
    });
  });

  it("rejects a missing workspace file value", async () => {
    await expect(run(["generate", "-w"])).rejects.toThrow("missing value for -w");
  });

  it("rejects a missing option value", async () => {
    await expect(run(["generate", "-o"])).rejects.toThrow("missing value for -o");
  });

  it("rejects an unknown option", async () => {
    await expect(run(["generate", "--nope"])).rejects.toThrow('unknown option "--nope"');
  });

  it("rejects a serve-only option for generate", async () => {
    await expect(run(["generate", "--port", "9000"])).rejects.toThrow('unknown option "--port"');
  });

  it("serves the site with default options", async () => {
    await run(["serve"]);
    expect(serveSite).toHaveBeenCalledWith({
      output: undefined,
      port: undefined,
      workspaceFile: undefined,
      structurizr: undefined,
    });
  });

  it("passes output and port to serve", async () => {
    await run(["serve", "-o", "out", "-p", "9000"]);
    expect(serveSite).toHaveBeenCalledWith({
      output: "out",
      port: 9000,
      workspaceFile: undefined,
      structurizr: undefined,
    });
  });

  it("supports the --port=<port> form", async () => {
    await run(["serve", "--port=9000"]);
    expect(serveSite).toHaveBeenCalledWith({
      output: undefined,
      port: 9000,
      workspaceFile: undefined,
      structurizr: undefined,
    });
  });

  it("rejects a missing port value", async () => {
    await expect(run(["serve", "--port"])).rejects.toThrow("missing value for --port");
  });

  it("rejects a non-numeric port", async () => {
    await expect(run(["serve", "--port", "abc"])).rejects.toThrow('invalid port "abc"');
  });

  it("rejects a port outside the valid range", async () => {
    await expect(run(["serve", "--port", "70000"])).rejects.toThrow('invalid port "70000"');
  });

  it.each(["-h", "--help"])("prints usage for %s", async (flag) => {
    await run([flag]);
    expect(process.stdout.write).toHaveBeenCalledWith(
      expect.stringContaining("Usage: structurizr-site"),
    );
    expect(generateSite).not.toHaveBeenCalled();
  });

  it.each(["-v", "--version"])("prints the package version for %s", async (flag) => {
    await run([flag]);
    // X.Y.Z with an optional semver pre-release suffix, e.g. 0.2.0-pre-alpha.1.
    expect(process.stdout.write).toHaveBeenCalledWith(
      expect.stringMatching(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?\n$/),
    );
  });

  it("rejects an unknown command", async () => {
    await expect(run(["bogus"])).rejects.toThrow('unknown command "bogus"');
  });
});

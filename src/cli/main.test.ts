import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { run } from "./main.js";

const { generateSite } = vi.hoisted(() => ({ generateSite: vi.fn() }));

vi.mock("./commands/generate-site.js", () => ({ generateSite }));

describe("run", () => {
  beforeEach(() => {
    generateSite.mockReset();
    generateSite.mockResolvedValue(undefined);
    vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates a site with the default output when no command is given", async () => {
    await run([]);
    expect(generateSite).toHaveBeenCalledWith({ output: undefined });
  });

  it("passes an explicit output directory", async () => {
    await run(["generate-site", "-o", "out"]);
    expect(generateSite).toHaveBeenCalledWith({ output: "out" });
  });

  it("supports the --output=<dir> form", async () => {
    await run(["generate-site", "--output=out"]);
    expect(generateSite).toHaveBeenCalledWith({ output: "out" });
  });

  it("rejects a missing option value", async () => {
    await expect(run(["generate-site", "-o"])).rejects.toThrow("missing value for -o");
  });

  it("rejects an unknown option", async () => {
    await expect(run(["generate-site", "--nope"])).rejects.toThrow('unknown option "--nope"');
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
    expect(process.stdout.write).toHaveBeenCalledWith(expect.stringMatching(/^\d+\.\d+\.\d+\n$/));
  });

  it("rejects an unknown command", async () => {
    await expect(run(["bogus"])).rejects.toThrow('unknown command "bogus"');
  });
});

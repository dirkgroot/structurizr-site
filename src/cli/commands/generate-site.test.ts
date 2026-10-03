import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateSite } from "./generate-site.js";

const { assemble } = vi.hoisted(() => ({ assemble: vi.fn() }));

vi.mock("../assembly/assemble.js", () => ({ assemble }));

describe("generateSite", () => {
  beforeEach(() => {
    assemble.mockReset();
    assemble.mockResolvedValue(undefined);
    vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("assembles into the default build directory", async () => {
    await generateSite({});
    expect(assemble).toHaveBeenCalledWith(resolve("build"));
    expect(process.stdout.write).toHaveBeenCalledWith(`Site written to ${resolve("build")}\n`);
  });

  it("resolves a relative output directory against the cwd", async () => {
    await generateSite({ output: "out/site" });
    expect(assemble).toHaveBeenCalledWith(resolve("out/site"));
  });

  it("keeps an absolute output directory", async () => {
    const output = resolve("somewhere/absolute");
    await generateSite({ output });
    expect(assemble).toHaveBeenCalledWith(output);
  });
});

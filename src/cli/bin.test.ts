import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { run } = vi.hoisted(() => ({ run: vi.fn() }));

vi.mock("./main.js", () => ({ run }));

/** Let the rejection handler attached to run() settle. */
function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("bin", () => {
  beforeEach(() => {
    run.mockReset();
    vi.resetModules();
    process.exitCode = undefined;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });

  it("runs the CLI with the process arguments", async () => {
    run.mockResolvedValue(undefined);

    await import("./bin.js");
    await flush();

    expect(run).toHaveBeenCalledWith(process.argv.slice(2));
    expect(console.error).not.toHaveBeenCalled();
  });

  it("reports an Error rejection and sets a failing exit code", async () => {
    run.mockRejectedValue(new Error("boom"));

    await import("./bin.js");
    await flush();

    expect(console.error).toHaveBeenCalledWith("structurizr-site: boom");
    expect(process.exitCode).toBe(1);
  });

  it("stringifies a non-Error rejection", async () => {
    run.mockRejectedValue("boom");

    await import("./bin.js");
    await flush();

    expect(console.error).toHaveBeenCalledWith("structurizr-site: boom");
    expect(process.exitCode).toBe(1);
  });
});

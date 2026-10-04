import { describe, expect, it } from "vitest";
import { defaultSpawn } from "./run";

describe("defaultSpawn", () => {
  it("captures stdout and resolves on exit code 0", async () => {
    const result = await defaultSpawn("node", ["-e", "process.stdout.write('ok')"]);
    expect(result.stdout).toBe("ok");
  });

  it("rejects with the stderr when the command exits non-zero", async () => {
    await expect(
      defaultSpawn("node", ["-e", "process.stderr.write('boom'); process.exit(2)"]),
    ).rejects.toThrow("exited with code 2: boom");
  });

  it("rejects with an actionable message when the command is missing", async () => {
    await expect(defaultSpawn("structurizr-does-not-exist", [])).rejects.toThrow(
      "not found; install it, or pass --structurizr <command>",
    );
  });
});

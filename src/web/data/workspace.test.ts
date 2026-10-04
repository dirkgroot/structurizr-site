import { describe, expect, it, vi } from "vitest";
import { loadWorkspace, WORKSPACE_FILE } from "@/data/workspace";

function jsonResponse(body: unknown, init: { ok?: boolean } = {}): Response {
  return {
    ok: init.ok ?? true,
    json: async () => body,
  } as Response;
}

describe("loadWorkspace", () => {
  it("fetches workspace.json relative to the deployment", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ name: "My Architecture" }));

    await loadWorkspace(fetchFn as unknown as typeof fetch);

    expect(fetchFn).toHaveBeenCalledWith(WORKSPACE_FILE, expect.anything());
  });

  it("returns the parsed workspace", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ name: "My Architecture" }));

    await expect(loadWorkspace(fetchFn as unknown as typeof fetch)).resolves.toEqual({
      name: "My Architecture",
    });
  });

  it("returns undefined when the workspace file is missing", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({}, { ok: false }));

    await expect(loadWorkspace(fetchFn as unknown as typeof fetch)).resolves.toBeUndefined();
  });

  it("returns undefined when the fetch throws", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error("network down"));

    await expect(loadWorkspace(fetchFn as unknown as typeof fetch)).resolves.toBeUndefined();
  });
});

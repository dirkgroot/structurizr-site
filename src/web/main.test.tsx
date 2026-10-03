import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const render = vi.fn();
  const createRoot = vi.fn(() => ({ render }));
  const loadWorkspace = vi.fn();
  return { createRoot, render, loadWorkspace };
});

vi.mock("react-dom/client", () => ({ createRoot: mocks.createRoot }));
vi.mock("./data/workspace.js", () => ({ loadWorkspace: mocks.loadWorkspace }));

describe("main", () => {
  beforeEach(() => {
    mocks.createRoot.mockClear();
    mocks.render.mockClear();
    mocks.loadWorkspace.mockReset();
    mocks.loadWorkspace.mockResolvedValue(undefined);
    vi.resetModules();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    document.title = "";
  });

  it("mounts the app into #root", async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await import("./main");

    expect(mocks.createRoot).toHaveBeenCalledWith(document.getElementById("root"));
    expect(mocks.render).toHaveBeenCalledTimes(1);
  });

  it("uses the workspace name as the document title", async () => {
    document.body.innerHTML = '<div id="root"></div>';
    mocks.loadWorkspace.mockResolvedValue({ name: "My Architecture" });

    await import("./main");

    expect(document.title).toBe("My Architecture");
  });

  it("falls back to the placeholder title when no workspace is loaded", async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await import("./main");

    expect(document.title).toBe("Structurizr Site");
  });

  it("throws when #root is missing", async () => {
    document.body.innerHTML = "";

    await expect(import("./main")).rejects.toThrow("missing #root element");
  });
});

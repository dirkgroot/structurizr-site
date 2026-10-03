import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const render = vi.fn();
  const createRoot = vi.fn(() => ({ render }));
  return { createRoot, render };
});

vi.mock("react-dom/client", () => ({ createRoot: mocks.createRoot }));

describe("main", () => {
  beforeEach(() => {
    mocks.createRoot.mockClear();
    mocks.render.mockClear();
    vi.resetModules();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("mounts the app into #root", async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await import("./main");

    expect(mocks.createRoot).toHaveBeenCalledWith(document.getElementById("root"));
    expect(mocks.render).toHaveBeenCalledTimes(1);
  });

  it("throws when #root is missing", async () => {
    document.body.innerHTML = "";

    await expect(import("./main")).rejects.toThrow("missing #root element");
  });
});

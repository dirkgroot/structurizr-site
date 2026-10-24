import { afterEach, describe, expect, it, vi } from "vitest";

import { getSiteConfig, workspaceUrl } from "./site";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getSiteConfig", () => {
  it("defaults to hash routing when window.site is absent", () => {
    expect(getSiteConfig()).toEqual({ router: "hash", basePath: "/" });
  });

  it("defaults to hash routing for any router other than path", () => {
    vi.stubGlobal("site", { router: "hash" });
    expect(getSiteConfig()).toEqual({ router: "hash", basePath: "/" });
  });

  it("uses path routing with a normalized base path", () => {
    vi.stubGlobal("site", { router: "path", basePath: "/docs" });
    expect(getSiteConfig()).toEqual({ router: "path", basePath: "/docs/" });
  });

  it("keeps an existing trailing slash on the base path", () => {
    vi.stubGlobal("site", { router: "path", basePath: "/docs/" });
    expect(getSiteConfig()).toEqual({ router: "path", basePath: "/docs/" });
  });

  it("falls back to the root base path when basePath is invalid", () => {
    vi.stubGlobal("site", { router: "path", basePath: "docs" });
    expect(getSiteConfig()).toEqual({ router: "path", basePath: "/" });
  });
});

describe("workspaceUrl", () => {
  it("uses a relative URL in hash mode", () => {
    expect(workspaceUrl({ router: "hash", basePath: "/" })).toBe("./workspace.json");
  });

  it("prefixes the base path in path mode", () => {
    expect(workspaceUrl({ router: "path", basePath: "/docs/" })).toBe("/docs/workspace.json");
  });
});

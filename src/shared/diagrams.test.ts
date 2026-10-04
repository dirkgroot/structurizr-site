import { describe, expect, it } from "vitest";
import { DIAGRAMS_DIR, diagramFileName, diagramPath, systemLandscapeViewKey } from "./diagrams";
import type { Workspace } from "./workspace";

describe("diagram contract", () => {
  it("names a diagram file after the view key", () => {
    expect(diagramFileName("SystemLandscape-001")).toBe("SystemLandscape-001.svg");
  });

  it("places diagrams under the diagrams directory", () => {
    expect(diagramPath("SystemLandscape-001")).toBe(`${DIAGRAMS_DIR}/SystemLandscape-001.svg`);
  });

  it("reads the first system landscape view key", () => {
    const workspace: Workspace = {
      views: { systemLandscapeViews: [{ key: "SystemLandscape-001" }] },
    };
    expect(systemLandscapeViewKey(workspace)).toBe("SystemLandscape-001");
  });

  it("returns undefined when there is no system landscape view", () => {
    expect(systemLandscapeViewKey({})).toBeUndefined();
    expect(systemLandscapeViewKey(undefined)).toBeUndefined();
    expect(systemLandscapeViewKey({ views: { systemLandscapeViews: [] } })).toBeUndefined();
  });
});

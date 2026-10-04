import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Workspace } from "../../shared/workspace/index.js";
import { LandscapeDiagram } from "./LandscapeDiagram";

describe("LandscapeDiagram", () => {
  it("renders the system landscape SVG by view key", () => {
    const workspace: Workspace = {
      views: { systemLandscapeViews: [{ key: "SystemLandscape-001" }] },
    };
    render(<LandscapeDiagram workspace={workspace} />);

    expect(screen.getByRole("img", { name: /system landscape/i })).toHaveAttribute(
      "src",
      "diagrams/SystemLandscape-001.svg",
    );
  });

  it("shows a notice when the workspace has no landscape view", () => {
    render(<LandscapeDiagram workspace={{}} />);
    expect(screen.getByText(/no system landscape view/i)).toBeInTheDocument();
  });

  it("shows a notice when no workspace is loaded", () => {
    render(<LandscapeDiagram />);
    expect(screen.getByText(/no system landscape view/i)).toBeInTheDocument();
  });
});

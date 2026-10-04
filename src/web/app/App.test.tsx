import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Workspace } from "../../shared/workspace/index.js";
import { App } from "./App";

describe("App", () => {
  it("renders the placeholder site name when no workspace is loaded", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Structurizr Site");
  });

  it("renders the workspace name as the site name", () => {
    const workspace: Workspace = { name: "My Architecture" };
    render(<App workspace={workspace} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("My Architecture");
    expect(screen.getAllByRole("link", { name: /My Architecture/ }).length).toBeGreaterThan(0);
  });

  it("falls back to the placeholder name when the workspace has no name", () => {
    render(<App workspace={{}} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Structurizr Site");
  });

  it("renders the system landscape diagram when the workspace defines one", () => {
    const workspace: Workspace = {
      views: { systemLandscapeViews: [{ key: "SystemLandscape-001" }] },
    };
    render(<App workspace={workspace} />);

    expect(screen.getByRole("img", { name: /system landscape/i })).toHaveAttribute(
      "src",
      "diagrams/SystemLandscape-001.svg",
    );
  });

  it("renders the sidebar navigation groups", () => {
    render(<App />);
    expect(screen.getByText("Views")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "System Context" })).toHaveAttribute("href", "#/");
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Diagram } from "./Diagram";

describe("Diagram", () => {
  it("renders the SVG for the given view key", () => {
    render(<Diagram viewKey="SystemLandscape-001" alt="System landscape diagram" />);

    const image = screen.getByRole("img", { name: "System landscape diagram" });
    expect(image).toHaveAttribute("src", "diagrams/SystemLandscape-001.svg");
  });

  it("shows a notice when no view key is given", () => {
    render(<Diagram alt="System landscape diagram" />);
    expect(screen.getByText(/no diagram is defined/i)).toBeInTheDocument();
  });
});

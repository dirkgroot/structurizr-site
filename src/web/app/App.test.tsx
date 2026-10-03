import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders the site name as the top-level heading", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Structurizr Site");
  });

  it("renders the placeholder notice", () => {
    render(<App />);
    expect(screen.getByText(/workspace rendering is not implemented yet/i)).toBeInTheDocument();
  });

  it("renders the sidebar navigation groups", () => {
    render(<App />);
    expect(screen.getByText("Views")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "System Context" })).toHaveAttribute("href", "#/");
  });
});

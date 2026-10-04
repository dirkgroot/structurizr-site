import { diagramPath } from "../../shared/diagrams.js";

export interface DiagramProps {
  /** Structurizr view key of the diagram to render. */
  viewKey?: string;
  /** Accessible alt text. */
  alt: string;
}

/**
 * Renders a C4 diagram from the SVG the CLI emits at `<diagrams>/<viewKey>.svg`.
 * Every C4 diagram (landscape, context, container, component, code) renders the
 * same way, addressed by view key. Plain rendering: no clickable elements. See
 * lode/architecture/diagrams.md.
 */
export function Diagram({ viewKey, alt }: DiagramProps) {
  if (!viewKey) {
    return <p className="text-muted-foreground">No diagram is defined.</p>;
  }

  return (
    <img src={diagramPath(viewKey)} alt={alt} className="max-w-full h-auto w-auto self-start" />
  );
}

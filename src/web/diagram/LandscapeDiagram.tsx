import { diagramPath, systemLandscapeViewKey } from "../../shared/diagrams.js";
import type { Workspace } from "../../shared/workspace/index.js";

export interface LandscapeDiagramProps {
  workspace?: Workspace;
}

/**
 * The workspace's system landscape diagram, rendered from the SVG the CLI emits
 * at `<diagrams>/<viewKey>.svg`. Plain rendering: no clickable elements. See
 * lode/architecture/diagrams.md.
 */
export function LandscapeDiagram({ workspace }: LandscapeDiagramProps) {
  const viewKey = systemLandscapeViewKey(workspace);

  if (!viewKey) {
    return <p className="text-muted-foreground">No system landscape view is defined.</p>;
  }

  return (
    <img
      src={diagramPath(viewKey)}
      alt="System landscape diagram"
      className="max-w-full h-auto w-auto self-start"
    />
  );
}

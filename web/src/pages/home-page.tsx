import type { PageProps } from "@/lib/routes";

export function HomePage({ workspace, error }: PageProps) {
  return (
    <>
      {error && <p>Failed to load workspace: {error}</p>}
      {workspace?.description && <p>{workspace.description}</p>}
    </>
  );
}

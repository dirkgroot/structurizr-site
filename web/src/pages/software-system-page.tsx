import { useParams } from 'react-router'

import type { PageProps } from '@/lib/routes'

export function SoftwareSystemPage({ workspace, error }: PageProps) {
  const { id } = useParams()

  if (error) return <p>Failed to load workspace: {error}</p>
  if (workspace === null) return null // still loading; the header shows that
  const system = workspace.model?.softwareSystems?.find((s) => s.id === id)
  if (!system) return <p>Software system not found: {id}</p>
  if (!system.description) return <p className="text-muted-foreground">No description.</p>
  return <p>{system.description}</p>
}

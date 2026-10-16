import type { Workspace } from '@/components/app-sidebar'

interface HomePageProps {
  workspace: Workspace | null
  error: string | null
}

export function HomePage({ workspace, error }: HomePageProps) {
  return (
    <>
      {error && <p>Failed to load workspace: {error}</p>}
      {workspace?.description && <p>{workspace.description}</p>}
    </>
  )
}

import { useEffect, useState } from 'react'

interface Workspace {
  name: string
  description?: string
}

function App() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('./workspace.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Workspace>
      })
      .then(setWorkspace)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : String(err)),
      )
  }, [])

  if (error) return <p>Failed to load workspace: {error}</p>
  if (!workspace) return <p>Loading workspace…</p>

  return (
    <main>
      <h1>{workspace.name}</h1>
      {workspace.description && <p>{workspace.description}</p>}
    </main>
  )
}

export default App

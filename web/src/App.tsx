import { useEffect, useState } from 'react'
import { AppSidebar, type Workspace } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

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

  return (
    <SidebarProvider>
      <AppSidebar workspace={workspace} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {error ? 'Error' : (workspace?.name ?? 'Loading workspace…')}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4">
          {error && <p>Failed to load workspace: {error}</p>}
          {workspace?.description && <p>{workspace.description}</p>}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App

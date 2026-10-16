import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, HashRouter, Route, Routes, Link, matchPath, useLocation } from 'react-router'

import { AppSidebar, type Workspace } from '@/components/app-sidebar'
import { getSiteConfig, type SiteConfig, workspaceUrl } from '@/lib/site'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { HomePage } from '@/pages/home-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { SoftwareSystemPage } from '@/pages/software-system-page'

interface WorkspaceState {
  workspace: Workspace | null
  error: string | null
}

function App() {
  const site = useMemo(() => getSiteConfig(), [])
  const workspace = useWorkspace(site)

  return site.router === 'path' ? (
    <BrowserRouter basename={site.basePath}>
      <SiteLayout workspace={workspace} />
    </BrowserRouter>
  ) : (
    <HashRouter>
      <SiteLayout workspace={workspace} />
    </HashRouter>
  )
}

function useWorkspace(site: SiteConfig): WorkspaceState {
  const [state, setState] = useState<WorkspaceState>({
    workspace: null,
    error: null,
  })

  useEffect(() => {
    fetch(workspaceUrl(site))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Workspace>
      })
      .then((workspace) => setState({ workspace, error: null }))
      .catch((err: unknown) =>
        setState({
          workspace: null,
          error: err instanceof Error ? err.message : String(err),
        }),
      )
  }, [site])

  return state
}

function SiteLayout({ workspace: state }: { workspace: WorkspaceState }) {
  const location = useLocation()
  const systemMatch = matchPath('/software-systems/:id', location.pathname)
  const system = systemMatch
    ? state.workspace?.model?.softwareSystems?.find((s) => s.id === systemMatch.params.id)
    : undefined

  return (
    <SidebarProvider>
      <AppSidebar workspace={state.workspace} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {state.error ? (
                <BreadcrumbItem>
                  <BreadcrumbPage>Error</BreadcrumbPage>
                </BreadcrumbItem>
              ) : state.workspace === null ? (
                <BreadcrumbItem>
                  <BreadcrumbPage>Loading workspace…</BreadcrumbPage>
                </BreadcrumbItem>
              ) : systemMatch && system ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/">{state.workspace.name}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{system.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ) : systemMatch ? (
                <BreadcrumbItem>
                  <BreadcrumbPage>Software system not found</BreadcrumbPage>
                </BreadcrumbItem>
              ) : location.pathname === '/' ? (
                <BreadcrumbItem>
                  <BreadcrumbPage>{state.workspace.name}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage>Page not found</BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4">
          <Routes>
            <Route
              path="/"
              element={<HomePage workspace={state.workspace} error={state.error} />}
            />
            <Route
              path="/software-systems/:id"
              element={
                <SoftwareSystemPage workspace={state.workspace} error={state.error} />
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App

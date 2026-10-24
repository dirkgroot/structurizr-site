import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, HashRouter, Routes, useLocation } from "react-router";
import { AppSidebar, type Workspace } from "@/components/app-sidebar";
import { BreadcrumbTrail } from "@/components/breadcrumb-trail";
import { resolveBreadcrumbs, renderRoutes, type PageProps } from "@/lib/routes";
import { getSiteConfig, type SiteConfig, workspaceUrl } from "@/lib/site";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

function App() {
  const site = useMemo(() => getSiteConfig(), []);
  const workspace = useWorkspace(site);

  return site.router === "path" ? (
    <BrowserRouter basename={site.basePath}>
      <SiteLayout workspace={workspace} />
    </BrowserRouter>
  ) : (
    <HashRouter>
      <SiteLayout workspace={workspace} />
    </HashRouter>
  );
}

function useWorkspace(site: SiteConfig): PageProps {
  const [state, setState] = useState<PageProps>({
    workspace: null,
    error: null,
  });

  useEffect(() => {
    fetch(workspaceUrl(site))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Workspace>;
      })
      .then((workspace) => setState({ workspace, error: null }))
      .catch((err: unknown) =>
        setState({
          workspace: null,
          error: err instanceof Error ? err.message : String(err),
        }),
      );
  }, [site]);

  return state;
}

function SiteLayout({ workspace: state }: { workspace: PageProps }) {
  const location = useLocation();
  const crumbs = resolveBreadcrumbs(location.pathname, state.workspace, state.error);

  return (
    <SidebarProvider>
      <AppSidebar workspace={state.workspace} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <BreadcrumbTrail crumbs={crumbs} />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Routes>{renderRoutes(state)}</Routes>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;

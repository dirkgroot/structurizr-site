import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteName } from "../../shared/site";
import { systemLandscapeViewKey } from "../../shared/diagrams.js";
import type { Workspace } from "../../shared/workspace/index.js";
import { Diagram } from "../diagram/Diagram";

export interface AppProps {
  workspace?: Workspace;
}

export function App({ workspace }: AppProps) {
  const name = siteName(workspace);
  const landscapeViewKey = systemLandscapeViewKey(workspace);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar name={name} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4 data-vertical:self-center" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4">
            <h1 className="text-2xl font-semibold">{name}</h1>
            {landscapeViewKey ? (
              <Diagram viewKey={landscapeViewKey} alt="System landscape diagram" />
            ) : (
              <p className="text-muted-foreground">No system landscape view is defined.</p>
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

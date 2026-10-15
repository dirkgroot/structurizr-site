import * as React from "react"
import { BoxesIcon } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export interface Workspace {
  name: string
  description?: string
}

// Placeholder navigation; views will be wired from the workspace export later.
const navItems = [{ title: "Overview", url: "#", isActive: true }]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  workspace: Workspace | null
}

export function AppSidebar({ workspace, ...props }: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <BoxesIcon className="size-4" />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5 leading-none">
                <span className="truncate font-medium">
                  {workspace?.name ?? "Structurizr"}
                </span>
                {workspace?.description && (
                  <span className="truncate text-sidebar-foreground/70">
                    {workspace.description}
                  </span>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Views</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive}>
                    <a href={item.url}>{item.title}</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

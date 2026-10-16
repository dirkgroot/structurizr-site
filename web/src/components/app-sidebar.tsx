import * as React from "react"
import { BoxesIcon } from "lucide-react"
import { NavLink, useLocation } from "react-router"

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

export interface SoftwareSystem {
  id: string
  name: string
  description?: string
}

export interface Workspace {
  name: string
  description?: string
  model?: {
    softwareSystems?: SoftwareSystem[]
  }
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  workspace: Workspace | null
}

export function AppSidebar({ workspace, ...props }: AppSidebarProps) {
  const softwareSystems = workspace?.model?.softwareSystems ?? []
  const { pathname } = useLocation()

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
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <NavLink to="/" end>
                    Home
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {softwareSystems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Software Systems</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {softwareSystems.map((system) => (
                  <SidebarMenuItem key={system.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/software-systems/${system.id}`}
                    >
                      <NavLink to={`/software-systems/${system.id}`}>
                        {system.name}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

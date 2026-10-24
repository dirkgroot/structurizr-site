import type { ReactNode } from "react";
import { matchPath, Route, type Params } from "react-router";

import type { Workspace } from "@/components/app-sidebar";
import { kebabCase } from "@/lib/slug";
import { HomePage } from "@/pages/home-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { SoftwareSystemPage } from "@/pages/software-system-page";

/** One breadcrumb: a link when `to` is set, otherwise the current page. */
export interface Crumb {
  label: string;
  to?: string;
}

export interface PageProps {
  workspace: Workspace | null;
  error: string | null;
}

interface AppRoute {
  path: string;
  Component: (props: PageProps) => ReactNode;
  crumbs: (params: Params<string>, workspace: Workspace) => Crumb[];
}

const routes: AppRoute[] = [
  {
    path: "/",
    Component: HomePage,
    crumbs: (_params, workspace) => [{ label: workspace.name }],
  },
  {
    path: "/software-systems/:slug",
    Component: SoftwareSystemPage,
    crumbs: (params, workspace) => {
      const system = workspace.model?.softwareSystems?.find((s) => kebabCase(s.name) === params.slug);
      return [{ label: workspace.name, to: "/" }, { label: system?.name ?? "Software system not found" }];
    },
  },
  {
    path: "*",
    Component: NotFoundPage,
    crumbs: () => [{ label: "Page not found" }],
  },
];

export function resolveBreadcrumbs(pathname: string, workspace: Workspace | null, error: string | null): Crumb[] {
  if (error) return [{ label: "Error" }];
  if (workspace === null) return [{ label: "Loading workspace…" }];

  for (const route of routes) {
    const match = matchPath(route.path, pathname);
    if (match) return route.crumbs(match.params, workspace);
  }
  return [{ label: "Page not found" }];
}

export function renderRoutes(props: PageProps): ReactNode {
  return routes.map((route) => <Route key={route.path} path={route.path} element={<route.Component {...props} />} />);
}

export interface SiteConfig {
  router: 'hash' | 'path'
  basePath: string
}

export const defaultSiteConfig: SiteConfig = { router: 'hash', basePath: '/' }

declare global {
  interface Window {
    // Written by `structurizr-site generate --router path`; absent otherwise.
    site?: { router?: string; basePath?: string }
  }
}

export function getSiteConfig(): SiteConfig {
  const injected = window.site
  if (injected?.router !== 'path') return defaultSiteConfig
  const basePath =
    typeof injected.basePath === 'string' && injected.basePath.startsWith('/')
      ? injected.basePath
      : defaultSiteConfig.basePath
  return { router: 'path', basePath: basePath.endsWith('/') ? basePath : `${basePath}/` }
}

export function workspaceUrl(site: SiteConfig): string {
  // Hash-mode documents always live at the index URL, so a relative path works
  // on any mount point; path-mode documents live at nested URLs and need the
  // configured base.
  return site.router === 'hash' ? './workspace.json' : `${site.basePath}workspace.json`
}

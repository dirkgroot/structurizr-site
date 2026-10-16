use anyhow::{Result, bail};
use clap::ValueEnum;
use serde::Serialize;

#[derive(Clone, Copy, PartialEq, Eq, ValueEnum)]
pub(crate) enum Router {
    Hash,
    Path,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SiteConfig<'a> {
    router: &'a str,
    base_path: &'a str,
}

/// Hash routing is mount-point agnostic, so a base path would be ignored;
/// reject the combination instead of silently dropping it.
pub(crate) fn normalize_base_path(router: Router, base_path: &str) -> Result<String> {
    if router == Router::Hash {
        if base_path != "/" {
            bail!("--base-path requires --router path");
        }
        return Ok(base_path.to_owned());
    }
    if !base_path.starts_with('/') {
        bail!("--base-path must start with '/': {}", base_path);
    }
    if base_path.contains('<') {
        bail!("--base-path must not contain '<': {}", base_path);
    }
    Ok(format!("{}/", base_path.trim_end_matches('/')))
}

/// Under path URLs the document is served at nested paths, so the SPA
/// bundle's relative asset URLs must be rebased onto the configured base,
/// and the SPA needs to know the routing mode (module scripts run after
/// document parsing, so an inline script in <head> always wins the race).
pub(crate) fn rewrite_for_path_router(html: &str, base_path: &str) -> Result<String> {
    if !html.contains("./assets/") {
        bail!("no relative asset URLs found in index.html; the SPA bundle format may have changed");
    }
    let rewritten = html.replace("./assets/", &format!("{base_path}assets/"));

    let config = serde_json::to_string(&SiteConfig {
        router: "path",
        base_path,
    })?;
    let script = format!("<script>window.site={config}</script>");
    if !rewritten.contains("</head>") {
        bail!("no </head> in index.html; the SPA bundle format may have changed");
    }
    Ok(rewritten.replacen("</head>", &format!("{script}</head>"), 1))
}

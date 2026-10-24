use anyhow::{Result, bail};
use clap::ValueEnum;
use serde::Serialize;

#[derive(Clone, Copy, Debug, PartialEq, Eq, ValueEnum)]
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hash_mode_accepts_root_base_path() {
        assert_eq!(normalize_base_path(Router::Hash, "/").unwrap(), "/");
    }

    #[test]
    fn hash_mode_rejects_any_other_base_path() {
        let err = normalize_base_path(Router::Hash, "/site").expect_err("should fail");
        assert_eq!(err.to_string(), "--base-path requires --router path");
    }

    #[test]
    fn path_mode_trims_to_one_trailing_slash() {
        for base_path in ["/site", "/site/", "/site///"] {
            assert_eq!(
                normalize_base_path(Router::Path, base_path).unwrap(),
                "/site/",
                "input: {base_path}"
            );
        }
    }

    #[test]
    fn path_mode_requires_leading_slash() {
        let err = normalize_base_path(Router::Path, "site").expect_err("should fail");
        assert_eq!(err.to_string(), "--base-path must start with '/': site");
    }

    #[test]
    fn path_mode_rejects_angle_brackets() {
        let err = normalize_base_path(Router::Path, "/<script>").expect_err("should fail");
        assert_eq!(
            err.to_string(),
            "--base-path must not contain '<': /<script>"
        );
    }

    const HTML: &str =
        r#"<html><head><script src="./assets/app.js"></script></head><body></body></html>"#;

    #[test]
    fn rewrite_rebases_assets_and_injects_config() {
        let rewritten = rewrite_for_path_router(HTML, "/site/").unwrap();
        assert!(rewritten.contains(r#"src="/site/assets/app.js""#));
        assert!(rewritten.contains(
            r#"<script>window.site={"router":"path","basePath":"/site/"}</script></head>"#
        ));
        assert_eq!(rewritten.matches("</head>").count(), 1);
    }

    #[test]
    fn rewrite_fails_without_relative_assets() {
        let err = rewrite_for_path_router("<html><head></head></html>", "/site/")
            .expect_err("should fail");
        assert!(err.to_string().contains("no relative asset URLs"));
    }

    #[test]
    fn rewrite_fails_without_head_close() {
        let html = r#"<html><body><script src="./assets/app.js"></script></body></html>"#;
        let err = rewrite_for_path_router(html, "/site/").expect_err("should fail");
        assert!(err.to_string().contains("no </head>"));
    }
}

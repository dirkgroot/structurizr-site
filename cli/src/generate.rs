use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result, bail};

use crate::router::{Router, normalize_base_path, rewrite_for_path_router};
use crate::spa;

pub(crate) fn generate(
    workspace: &Path,
    output: &Path,
    router: Router,
    base_path: &str,
) -> Result<()> {
    let base_path = normalize_base_path(router, base_path)?;
    let exported = export_workspace(workspace, output)?;
    assemble_site(&exported, output, router, &base_path)?;
    println!("Site generated in {}", output.display());
    Ok(())
}

/// Runs the `structurizr export` shell-out and returns the path of the
/// exported `<stem>.json` file.
fn export_workspace(workspace: &Path, output: &Path) -> Result<PathBuf> {
    if !workspace.is_file() {
        bail!("workspace file not found: {}", workspace.display());
    }
    fs::create_dir_all(output)?;

    let export = Command::new("structurizr")
        .args(["export", "-w"])
        .arg(workspace)
        .args(["-f", "json", "-o"])
        .arg(output)
        .output()
        .context(
            "failed to run `structurizr`; is it on your PATH? \
             Install it from https://docs.structurizr.com/cli (requires Java)",
        )?;
    if !export.status.success() {
        bail!(
            "structurizr export failed:\n{}",
            String::from_utf8_lossy(&export.stderr)
        );
    }

    // The structurizr CLI names the export after the input file; the SPA
    // expects workspace.json, which assemble_site renames it to.
    Ok(output
        .join(
            workspace
                .file_stem()
                .context("workspace path has no file name")?,
        )
        .with_extension("json"))
}

/// Renames the export to workspace.json, writes the embedded SPA assets,
/// and writes index.html (plus 404.html in path mode) per router mode.
fn assemble_site(exported: &Path, output: &Path, router: Router, base_path: &str) -> Result<()> {
    let target = output.join("workspace.json");
    if exported != target {
        fs::rename(exported, &target)
            .with_context(|| format!("failed to rename {}", exported.display()))?;
    }

    let index_html = spa::write_assets(output)?;

    match router {
        Router::Hash => spa::write_asset(output, "index.html", index_html.as_bytes())?,
        Router::Path => {
            let rewritten = rewrite_for_path_router(&index_html, base_path)?;
            spa::write_asset(output, "index.html", rewritten.as_bytes())?;
            // GitHub Pages serves 404.html at missing paths with the URL
            // preserved, which gives path-URL sites a deep-link fallback.
            spa::write_asset(output, "404.html", rewritten.as_bytes())?;
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    const FIXTURE_JSON: &str = r#"{"model":{},"views":{}}"#;

    fn temp_dir() -> tempfile::TempDir {
        tempfile::tempdir().expect("create temp dir")
    }

    /// Pre-places a fake `<stem>.json` export in a temp dir; returns the dir
    /// and the export path.
    fn temp_export(stem: &str) -> (tempfile::TempDir, PathBuf) {
        let dir = temp_dir();
        let exported = dir.path().join(format!("{stem}.json"));
        fs::write(&exported, FIXTURE_JSON).expect("write fixture export");
        (dir, exported)
    }

    #[test]
    fn export_workspace_rejects_missing_file() {
        let dir = temp_dir();
        let err =
            export_workspace(&dir.path().join("nope.dsl"), dir.path()).expect_err("should fail");
        assert!(err.to_string().contains("workspace file not found"));
    }

    #[test]
    fn assemble_renames_export_to_workspace_json() {
        let (dir, exported) = temp_export("myws");
        assemble_site(&exported, dir.path(), Router::Hash, "/").unwrap();

        let target = dir.path().join("workspace.json");
        assert_eq!(fs::read_to_string(&target).unwrap(), FIXTURE_JSON);
        assert!(!exported.exists());
    }

    #[test]
    fn assemble_keeps_workspace_json_in_place() {
        let (dir, exported) = temp_export("workspace");
        assemble_site(&exported, dir.path(), Router::Hash, "/").unwrap();

        assert_eq!(fs::read_to_string(&exported).unwrap(), FIXTURE_JSON);
    }

    #[test]
    fn assemble_writes_hash_site() {
        let (dir, exported) = temp_export("myws");
        assemble_site(&exported, dir.path(), Router::Hash, "/").unwrap();

        let index = fs::read_to_string(dir.path().join("index.html")).unwrap();
        assert!(index.contains("./assets/"));
        assert!(!index.contains("window.site"));
        assert!(!dir.path().join("404.html").exists());
        assert!(dir.path().join("assets").is_dir());
    }

    #[test]
    fn assemble_writes_path_site() {
        let (dir, exported) = temp_export("myws");
        assemble_site(&exported, dir.path(), Router::Path, "/site/").unwrap();

        let index = fs::read_to_string(dir.path().join("index.html")).unwrap();
        assert!(index.contains("/site/assets/"));
        assert!(!index.contains("./assets/"));
        assert!(
            index.contains(r#"<script>window.site={"router":"path","basePath":"/site/"}</script>"#)
        );
        let not_found = fs::read_to_string(dir.path().join("404.html")).unwrap();
        assert_eq!(not_found, index);
        assert_eq!(
            fs::read_to_string(dir.path().join("workspace.json")).unwrap(),
            FIXTURE_JSON
        );
    }
}

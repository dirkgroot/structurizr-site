use std::fs;
use std::path::Path;
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
    // expects workspace.json.
    let exported = output
        .join(
            workspace
                .file_stem()
                .context("workspace path has no file name")?,
        )
        .with_extension("json");
    let target = output.join("workspace.json");
    if exported != target {
        fs::rename(&exported, &target)
            .with_context(|| format!("failed to rename {}", exported.display()))?;
    }

    let index_html = spa::write_assets(output)?;

    match router {
        Router::Hash => spa::write_asset(output, "index.html", index_html.as_bytes())?,
        Router::Path => {
            let rewritten = rewrite_for_path_router(&index_html, &base_path)?;
            spa::write_asset(output, "index.html", rewritten.as_bytes())?;
            // GitHub Pages serves 404.html at missing paths with the URL
            // preserved, which gives path-URL sites a deep-link fallback.
            spa::write_asset(output, "404.html", rewritten.as_bytes())?;
        }
    }

    println!("Site generated in {}", output.display());
    Ok(())
}

use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result, bail};
use clap::{Parser, Subcommand, ValueEnum};
use rust_embed::RustEmbed;
use serde::Serialize;

/// Generates a static site from a Structurizr workspace.
#[derive(Parser)]
#[command(version)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Generate a static site from a workspace.
    Generate {
        /// Path to the workspace DSL or JSON file.
        #[arg(long, default_value = "workspace.dsl")]
        workspace: PathBuf,
        /// Output directory.
        #[arg(long, default_value = "build")]
        output: PathBuf,
        /// How page URLs are formed: `hash` serves every page from the same
        /// URL (`#/...`) and works on any static host; `path` uses clean URLs
        /// and requires the host to serve index.html for unknown paths.
        #[arg(long, value_enum, default_value = "hash")]
        router: Router,
        /// Path the site is hosted under; requires `--router path`.
        #[arg(long, default_value = "/")]
        base_path: String,
    },
}

#[derive(Clone, Copy, PartialEq, Eq, ValueEnum)]
enum Router {
    Hash,
    Path,
}

#[derive(RustEmbed)]
#[folder = "web/dist"]
struct Spa;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SiteConfig<'a> {
    router: &'a str,
    base_path: &'a str,
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Generate {
            workspace,
            output,
            router,
            base_path,
        } => generate(&workspace, &output, router, &base_path),
    }
}

fn generate(workspace: &Path, output: &Path, router: Router, base_path: &str) -> Result<()> {
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

    let mut index_html: Option<String> = None;
    for path in Spa::iter() {
        let file = Spa::get(path.as_ref()).with_context(|| format!("missing asset {path}"))?;
        if path.as_ref() == "index.html" {
            // Written below, possibly rewritten for path URLs.
            index_html = Some(
                String::from_utf8(file.data.to_vec())
                    .context("embedded index.html is not valid UTF-8")?,
            );
            continue;
        }
        write_asset(output, path.as_ref(), &file.data)?;
    }
    let index_html = index_html.context("SPA bundle is missing index.html")?;

    match router {
        Router::Hash => write_asset(output, "index.html", index_html.as_bytes())?,
        Router::Path => {
            let rewritten = rewrite_for_path_router(&index_html, &base_path)?;
            write_asset(output, "index.html", rewritten.as_bytes())?;
            // GitHub Pages serves 404.html at missing paths with the URL
            // preserved, which gives path-URL sites a deep-link fallback.
            write_asset(output, "404.html", rewritten.as_bytes())?;
        }
    }

    println!("Site generated in {}", output.display());
    Ok(())
}

fn write_asset(output: &Path, relative: &str, data: &[u8]) -> Result<()> {
    let dest = output.join(relative);
    if let Some(parent) = dest.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(&dest, data)?;
    Ok(())
}

/// Hash routing is mount-point agnostic, so a base path would be ignored;
/// reject the combination instead of silently dropping it.
fn normalize_base_path(router: Router, base_path: &str) -> Result<String> {
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
fn rewrite_for_path_router(html: &str, base_path: &str) -> Result<String> {
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

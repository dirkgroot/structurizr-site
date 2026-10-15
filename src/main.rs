use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result, bail};
use clap::{Parser, Subcommand};
use rust_embed::RustEmbed;

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
    },
}

#[derive(RustEmbed)]
#[folder = "web/dist"]
struct Spa;

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Generate { workspace, output } => generate(&workspace, &output),
    }
}

fn generate(workspace: &Path, output: &Path) -> Result<()> {
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

    for path in Spa::iter() {
        let dest = output.join(path.as_ref());
        if let Some(parent) = dest.parent() {
            fs::create_dir_all(parent)?;
        }
        let file = Spa::get(path.as_ref()).with_context(|| format!("missing asset {path}"))?;
        fs::write(&dest, file.data)?;
    }

    println!("Site generated in {}", output.display());
    Ok(())
}

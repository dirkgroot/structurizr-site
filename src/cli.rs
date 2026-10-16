use std::path::PathBuf;

use clap::{Parser, Subcommand};

use crate::router::Router;

/// Generates a static site from a Structurizr workspace.
#[derive(Parser)]
#[command(version)]
pub(crate) struct Cli {
    #[command(subcommand)]
    pub(crate) command: Commands,
}

#[derive(Subcommand)]
pub(crate) enum Commands {
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

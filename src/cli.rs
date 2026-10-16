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

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use super::*;

    /// Destructures the single-variant `Commands` into its generate args.
    fn generate_args(cli: Cli) -> (PathBuf, PathBuf, Router, String) {
        let Commands::Generate {
            workspace,
            output,
            router,
            base_path,
        } = cli.command;
        (workspace, output, router, base_path)
    }

    #[test]
    fn generate_defaults() {
        let (workspace, output, router, base_path) =
            generate_args(Cli::try_parse_from(["structurizr-site", "generate"]).unwrap());
        assert_eq!(workspace, PathBuf::from("workspace.dsl"));
        assert_eq!(output, PathBuf::from("build"));
        assert_eq!(router, Router::Hash);
        assert_eq!(base_path, "/");
    }

    #[test]
    fn generate_accepts_all_flags() {
        let (workspace, output, router, base_path) = generate_args(
            Cli::try_parse_from([
                "structurizr-site",
                "generate",
                "--workspace",
                "w.json",
                "--output",
                "out",
                "--router",
                "path",
                "--base-path",
                "/site",
            ])
            .unwrap(),
        );
        assert_eq!(workspace, PathBuf::from("w.json"));
        assert_eq!(output, PathBuf::from("out"));
        assert_eq!(router, Router::Path);
        assert_eq!(base_path, "/site");
    }

    #[test]
    fn rejects_unknown_router_value() {
        let err = Cli::try_parse_from(["structurizr-site", "generate", "--router", "bogus"])
            .err()
            .expect("should fail");
        assert!(err.to_string().contains("invalid value 'bogus'"));
    }
}

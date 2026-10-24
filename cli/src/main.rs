use anyhow::Result;
use clap::Parser;

mod cli;
mod generate;
mod router;
mod spa;

use crate::cli::{Cli, Commands};

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Generate {
            workspace,
            output,
            router,
            base_path,
        } => generate::generate(&workspace, &output, router, &base_path),
    }
}

use std::fs;
use std::path::Path;

use anyhow::{Context, Result};
use rust_embed::RustEmbed;

#[derive(RustEmbed)]
#[folder = "web/dist"]
struct Spa;

/// Writes every embedded SPA asset except index.html into `output` and
/// returns the index.html content; the caller decides how (and where) to
/// write it based on the router mode.
pub(crate) fn write_assets(output: &Path) -> Result<String> {
    let mut index_html: Option<String> = None;
    for path in Spa::iter() {
        let file = Spa::get(path.as_ref()).with_context(|| format!("missing asset {path}"))?;
        if path.as_ref() == "index.html" {
            // Written by the caller after router-mode processing.
            index_html = Some(
                String::from_utf8(file.data.to_vec())
                    .context("embedded index.html is not valid UTF-8")?,
            );
            continue;
        }
        write_asset(output, path.as_ref(), &file.data)?;
    }
    index_html.context("SPA bundle is missing index.html")
}

pub(crate) fn write_asset(output: &Path, relative: &str, data: &[u8]) -> Result<()> {
    let dest = output.join(relative);
    if let Some(parent) = dest.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(&dest, data)?;
    Ok(())
}

use std::fs;
use std::path::Path;

use anyhow::{Context, Result};
use rust_embed::RustEmbed;

#[derive(RustEmbed)]
#[folder = "../web/dist"]
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn write_assets_writes_non_index_assets_and_returns_index() {
        let dir = tempfile::tempdir().unwrap();
        let index = write_assets(dir.path()).unwrap();

        // index.html is returned, not written; the caller writes it per router mode.
        assert!(index.contains("./assets/"));
        assert!(!dir.path().join("index.html").exists());
        for path in Spa::iter() {
            if path.as_ref() == "index.html" {
                continue;
            }
            assert!(
                dir.path().join(path.as_ref()).is_file(),
                "missing asset {}",
                path.as_ref()
            );
        }
    }

    #[test]
    fn write_asset_creates_parent_dirs() {
        let dir = tempfile::tempdir().unwrap();
        write_asset(dir.path(), "nested/dir/file.txt", b"hi").unwrap();
        assert_eq!(
            fs::read(dir.path().join("nested/dir/file.txt")).unwrap(),
            b"hi"
        );
    }
}

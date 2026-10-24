//! Binary-level tests. The `structurizr` shell-out is emulated with a shell
//! script shim on the child's PATH, so these run without the real CLI
//! (which needs Java). Unix only — the shim is a POSIX shell script.
#![cfg(unix)]

use std::fs;
use std::os::unix::fs::PermissionsExt;
use std::process::Command;

const BIN: &str = env!("CARGO_BIN_EXE_structurizr-site");
const FIXTURE_JSON: &str = r#"{"model":{},"views":{}}"#;

/// Emulates `structurizr export -f json -o <out>`: writes the fixture JSON
/// as `<out>/<workspace stem>.json`, like the real CLI.
const EXPORT_SHIM: &str = r#"#!/bin/sh
out=""; workspace=""
while [ $# -gt 0 ]; do
  case "$1" in
    -w) workspace="$2"; shift 2 ;;
    -o) out="$2"; shift 2 ;;
    *) shift ;;
  esac
done
stem=$(basename "$workspace")
printf '{"model":{},"views":{}}' > "$out/${stem%.*}.json"
"#;

/// Installs `script` as an executable `structurizr` shim in a fresh dir
/// under `tmp` and returns a PATH value that finds it.
fn install_shim(tmp: &std::path::Path, name: &str, script: &str) -> String {
    let dir = tmp.join(name);
    fs::create_dir(&dir).unwrap();
    let bin = dir.join("structurizr");
    fs::write(&bin, script).unwrap();
    fs::set_permissions(&bin, fs::Permissions::from_mode(0o755)).unwrap();
    format!(
        "{}:{}",
        dir.display(),
        std::env::var("PATH").unwrap_or_default()
    )
}

fn write_workspace(tmp: &std::path::Path) -> std::path::PathBuf {
    let workspace = tmp.join("acme.dsl");
    fs::write(&workspace, "workspace acme { }").unwrap();
    workspace
}

#[test]
fn generates_path_router_site() {
    let tmp = tempfile::tempdir().unwrap();
    let workspace = write_workspace(tmp.path());
    let output = tmp.path().join("out");
    let path_env = install_shim(tmp.path(), "shim", EXPORT_SHIM);

    let status = Command::new(BIN)
        .args(["generate", "--workspace"])
        .arg(&workspace)
        .args(["--output"])
        .arg(&output)
        .args(["--router", "path", "--base-path", "/site"])
        .env("PATH", &path_env)
        .status()
        .unwrap();
    assert!(status.success());

    assert_eq!(
        fs::read_to_string(output.join("workspace.json")).unwrap(),
        FIXTURE_JSON
    );
    let index = fs::read_to_string(output.join("index.html")).unwrap();
    assert!(index.contains("/site/assets/"), "assets not rebased");
    assert!(
        index.contains(r#"<script>window.site={"router":"path","basePath":"/site/"}</script>"#)
    );
    assert!(output.join("404.html").is_file());
    assert!(output.join("assets").is_dir());
}

#[test]
fn generates_hash_router_site() {
    let tmp = tempfile::tempdir().unwrap();
    let workspace = write_workspace(tmp.path());
    let output = tmp.path().join("out");
    let path_env = install_shim(tmp.path(), "shim", EXPORT_SHIM);

    let status = Command::new(BIN)
        .args(["generate", "--workspace"])
        .arg(&workspace)
        .args(["--output"])
        .arg(&output)
        .args(["--router", "hash"])
        .env("PATH", &path_env)
        .status()
        .unwrap();
    assert!(status.success());

    assert_eq!(
        fs::read_to_string(output.join("workspace.json")).unwrap(),
        FIXTURE_JSON
    );
    let index = fs::read_to_string(output.join("index.html")).unwrap();
    assert!(index.contains("./assets/"));
    assert!(!index.contains("window.site"));
    assert!(!output.join("404.html").exists());
}

#[test]
fn fails_when_workspace_is_missing() {
    let tmp = tempfile::tempdir().unwrap();
    let missing = tmp.path().join("missing.dsl");

    let output = Command::new(BIN)
        .args(["generate", "--workspace"])
        .arg(&missing)
        .args(["--output"])
        .arg(tmp.path().join("out"))
        .output()
        .unwrap();
    assert!(!output.status.success());
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("workspace file not found"),
        "stderr: {stderr}"
    );
}

#[test]
fn fails_when_structurizr_fails() {
    const FAILING_SHIM: &str = "#!/bin/sh\necho 'boom' >&2\nexit 1\n";
    let tmp = tempfile::tempdir().unwrap();
    let workspace = write_workspace(tmp.path());
    let path_env = install_shim(tmp.path(), "shim", FAILING_SHIM);

    let output = Command::new(BIN)
        .args(["generate", "--workspace"])
        .arg(&workspace)
        .args(["--output"])
        .arg(tmp.path().join("out"))
        .env("PATH", &path_env)
        .output()
        .unwrap();
    assert!(!output.status.success());
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("structurizr export failed"),
        "stderr: {stderr}"
    );
    assert!(stderr.contains("boom"), "stderr: {stderr}");
}

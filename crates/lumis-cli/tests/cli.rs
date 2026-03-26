use assert_cmd::cargo::cargo_bin_cmd;
use predicates::prelude::*;
use std::ffi::OsString;
use std::fs;
use std::path::Path;
use std::path::PathBuf;

fn cmd() -> assert_cmd::Command {
    cargo_bin_cmd!("lumis")
}

fn fixtures_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("tests")
        .join("fixtures")
}

fn write_file(path: &Path, content: &str) {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).unwrap();
    }
    fs::write(path, content).unwrap();
}

#[cfg(unix)]
fn install_fake_nvim(bin_dir: &Path) {
    let script = r##"#!/usr/bin/env bash
set -euo pipefail

capture_dir="${LUMIS_FAKE_NVIM_CAPTURE_DIR:?missing capture dir}"
appearance="${LUMIS_FAKE_NVIM_APPEARANCE:-dark}"
colorscheme="${@: -1}"

cp init.lua "$capture_dir/init.lua"
cp themes.lua "$capture_dir/themes.lua"
cp extract_theme.lua "$capture_dir/extract_theme.lua"
printf '%s\n' "$@" > "$capture_dir/argv.txt"

cat > "$colorscheme.json" <<EOF
{"name":"$colorscheme","appearance":"$appearance","revision":"fake-revision","highlights":{"normal":{"fg":"#ffffff","bg":"#000000"}}}
EOF
"##;

    let path = bin_dir.join("nvim");
    write_file(&path, script);

    #[allow(clippy::useless_conversion)]
    {
        use std::os::unix::fs::PermissionsExt;

        let mut perms = fs::metadata(&path).unwrap().permissions();
        perms.set_mode(0o755);
        fs::set_permissions(&path, perms).unwrap();
    }
}

#[cfg(windows)]
fn install_fake_nvim(bin_dir: &Path) {
    let source = r##"
use std::env;
use std::fs;
use std::path::PathBuf;

fn main() {
    let capture_dir = PathBuf::from(env::var("LUMIS_FAKE_NVIM_CAPTURE_DIR").expect("missing capture dir"));
    let appearance = env::var("LUMIS_FAKE_NVIM_APPEARANCE").unwrap_or_else(|_| "dark".to_string());
    let args: Vec<String> = env::args().skip(1).collect();
    let colorscheme = args.last().expect("missing colorscheme arg");

    fs::copy("init.lua", capture_dir.join("init.lua")).unwrap();
    fs::copy("themes.lua", capture_dir.join("themes.lua")).unwrap();
    fs::copy("extract_theme.lua", capture_dir.join("extract_theme.lua")).unwrap();
    fs::write(capture_dir.join("argv.txt"), args.join("\n") + "\n").unwrap();

    let json = format!(
        "{{\"name\":\"{}\",\"appearance\":\"{}\",\"revision\":\"fake-revision\",\"highlights\":{{\"normal\":{{\"fg\":\"#ffffff\",\"bg\":\"#000000\"}}}}}}",
        colorscheme, appearance
    );
    fs::write(format!("{}.json", colorscheme), json).unwrap();
}
"##;

    let source_path = bin_dir.join("fake_nvim.rs");
    let exe_path = bin_dir.join("nvim.exe");

    write_file(&source_path, source);

    let status = std::process::Command::new("rustc")
        .arg(&source_path)
        .arg("-O")
        .arg("-o")
        .arg(&exe_path)
        .status()
        .unwrap();

    assert!(status.success(), "failed to build fake nvim.exe");
}

fn fake_nvim_path(bin_dir: &Path) -> OsString {
    let current_path = std::env::var_os("PATH").unwrap_or_default();
    let mut paths = vec![bin_dir.to_path_buf()];
    paths.extend(std::env::split_paths(&current_path));
    std::env::join_paths(paths).unwrap()
}

#[test]
fn version_flag() {
    cmd()
        .arg("--version")
        .assert()
        .success()
        .stdout(predicate::str::contains(env!("CARGO_PKG_VERSION")));
}

#[test]
fn help_flag() {
    cmd()
        .arg("--help")
        .assert()
        .success()
        .stdout(predicate::str::contains("highlight"));
}

#[test]
fn list_languages() {
    cmd()
        .args(["languages", "list"])
        .assert()
        .success()
        .stdout(predicate::str::contains("rust"))
        .stdout(predicate::str::contains("javascript"))
        .stdout(predicate::str::contains("elixir"));
}

#[test]
fn list_themes() {
    cmd()
        .args(["themes", "list"])
        .assert()
        .success()
        .stdout(predicate::str::contains("dracula"));
}

#[test]
fn list_themes_uses_data_dir_from_env() {
    let tmp = tempfile::tempdir().unwrap();
    write_file(
        &tmp.path().join("themes/custom.json"),
        r#"{"name":"custom","appearance":"dark","revision":"test","highlights":{}}"#,
    );

    cmd()
        .env("LUMIS_DATA_DIR", tmp.path())
        .args(["themes", "list"])
        .assert()
        .success()
        .stdout(predicate::str::contains("custom (file)"));
}

#[test]
fn highlight_nonexistent_file() {
    cmd()
        .args(["highlight", "nonexistent.rs"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("No such file"));
}

const DIFF_SNIPPET: &str = "\
--- a/foo.txt
+++ b/foo.txt
@@ -1,3 +1,3 @@
 context
-old line
+new line
 context
";

#[test]
fn highlight_source_diff_terminal() {
    cmd()
        .arg("--data-dir")
        .arg(fixtures_dir())
        .args(["highlight", "-l", "diff"])
        .write_stdin(DIFF_SNIPPET)
        .assert()
        .success()
        .stdout(predicate::str::is_empty().not());
}

#[test]
fn highlight_source_diff_html_inline() {
    cmd()
        .arg("--data-dir")
        .arg(fixtures_dir())
        .args([
            "highlight",
            "-l",
            "diff",
            "-f",
            "html-inline",
            "-t",
            "dracula",
        ])
        .write_stdin(DIFF_SNIPPET)
        .assert()
        .success()
        .stdout(predicate::str::contains("<pre"));
}

#[test]
fn highlight_source_diff_html_linked() {
    cmd()
        .arg("--data-dir")
        .arg(fixtures_dir())
        .args(["highlight", "-l", "diff", "-f", "html-linked"])
        .write_stdin(DIFF_SNIPPET)
        .assert()
        .success()
        .stdout(predicate::str::contains("<pre"));
}

#[test]
fn highlight_source_diff_bbcode() {
    cmd()
        .arg("--data-dir")
        .arg(fixtures_dir())
        .args(["highlight", "-l", "diff", "-f", "bbcode"])
        .write_stdin(DIFF_SNIPPET)
        .assert()
        .success()
        .stdout(predicate::str::is_empty().not());
}

#[test]
fn highlight_file_path_autodetects_language() {
    let tmp = tempfile::tempdir().unwrap();
    let source = tmp.path().join("sample.json");
    write_file(&source, r#"{"key": true}"#);

    cmd()
        .arg("--data-dir")
        .arg(fixtures_dir())
        .args(["highlight", source.to_str().unwrap()])
        .assert()
        .success()
        .stdout(predicate::str::is_empty().not());
}

#[test]
fn highlight_source_diff_html_multi_themes_with_all_options() {
    cmd()
        .arg("--data-dir")
        .arg(fixtures_dir())
        .args([
            "highlight",
            "-l",
            "diff",
            "-f",
            "html-multi-themes",
            "--themes",
            "main:dracula",
            "--themes",
            "alt:github_dark",
            "--default-theme",
            "main",
            "--css-variable-prefix=--demo",
            "-h",
            "2",
        ])
        .write_stdin(DIFF_SNIPPET)
        .assert()
        .success()
        .stdout(predicate::str::contains("class=\"lumis lumis-themes"))
        .stdout(predicate::str::contains("--demo-alt"))
        .stdout(predicate::str::contains("data-line=\"2\""));
}

#[test]
fn highlight_requires_themes_for_html_multi_themes() {
    cmd()
        .arg("--data-dir")
        .arg(fixtures_dir())
        .args(["highlight", "-l", "diff", "-f", "html-multi-themes"])
        .write_stdin(DIFF_SNIPPET)
        .assert()
        .failure()
        .stderr(predicate::str::contains(
            "--formatter html-multi-themes requires --themes",
        ));
}

#[test]
fn highlight_rejects_invalid_highlight_line_ranges() {
    cmd()
        .arg("--data-dir")
        .arg(fixtures_dir())
        .args(["highlight", "-l", "diff", "-h", "3-1"])
        .write_stdin(DIFF_SNIPPET)
        .assert()
        .failure()
        .stderr(predicate::str::contains(
            "Start line (3) must be less than or equal to end line (1)",
        ));
}

#[test]
fn themes_generate_prints_json_to_stdout() {
    let tmp = tempfile::tempdir().unwrap();
    let bin_dir = tmp.path().join("bin");
    let capture_dir = tmp.path().join("capture");

    fs::create_dir_all(&bin_dir).unwrap();
    fs::create_dir_all(&capture_dir).unwrap();
    install_fake_nvim(&bin_dir);

    cmd()
        .env("PATH", fake_nvim_path(&bin_dir))
        .env("LUMIS_FAKE_NVIM_CAPTURE_DIR", &capture_dir)
        .args([
            "themes",
            "generate",
            "-u",
            "https://github.com/folke/tokyonight.nvim",
            "-c",
            "tokyonight-night",
        ])
        .assert()
        .success()
        .stdout(predicate::str::contains(r#""name":"tokyonight-night""#));

    assert!(capture_dir.join("extract_theme.lua").exists());
    assert!(capture_dir.join("init.lua").exists());
    assert!(capture_dir.join("themes.lua").exists());

    let themes_lua = fs::read_to_string(capture_dir.join("themes.lua")).unwrap();
    assert!(themes_lua.contains("https://github.com/folke/tokyonight.nvim"));
    assert!(themes_lua.contains("vim.o.background = \"dark\""));
    assert!(!themes_lua.contains("vim.g.test_setup = true"));
}

#[test]
fn themes_generate_supports_output_setup_and_appearance_options() {
    let tmp = tempfile::tempdir().unwrap();
    let bin_dir = tmp.path().join("bin");
    let capture_dir = tmp.path().join("capture");
    let output_path = tmp.path().join("tokyonight.json");

    fs::create_dir_all(&bin_dir).unwrap();
    fs::create_dir_all(&capture_dir).unwrap();
    install_fake_nvim(&bin_dir);

    cmd()
        .env("PATH", fake_nvim_path(&bin_dir))
        .env("LUMIS_FAKE_NVIM_CAPTURE_DIR", &capture_dir)
        .env("LUMIS_FAKE_NVIM_APPEARANCE", "light")
        .args([
            "themes",
            "generate",
            "-u",
            "https://github.com/folke/tokyonight.nvim",
            "-c",
            "tokyonight-day",
            "-s",
            "vim.g.test_setup = true",
            "-o",
            output_path.to_str().unwrap(),
            "-a",
            "light",
        ])
        .assert()
        .success()
        .stderr(predicate::str::contains("Theme saved to"));

    let generated = fs::read_to_string(&output_path).unwrap();
    assert!(generated.contains(r#""appearance":"light""#));

    let themes_lua = fs::read_to_string(capture_dir.join("themes.lua")).unwrap();
    assert!(themes_lua.contains("vim.o.background = \"light\""));
    assert!(themes_lua.contains("vim.g.test_setup = true"));
}

// -- fetch-parsers / update-parsers --

#[test]
fn fetch_parsers_no_args_fails() {
    cmd()
        .args(["parsers", "fetch"])
        .assert()
        .failure()
        .stderr(predicate::str::contains(
            "specify language names or use --all",
        ));
}

#[test]
fn update_parsers_no_args_fails() {
    cmd()
        .args(["parsers", "update"])
        .assert()
        .failure()
        .stderr(predicate::str::contains(
            "specify language names or use --all",
        ));
}

#[test]
fn fetch_parsers_already_cached() {
    // The fixtures dir already has diff.wasm cached — silent without -v
    cmd()
        .arg("--data-dir")
        .arg(fixtures_dir())
        .args(["parsers", "fetch", "diff"])
        .assert()
        .success();
}

#[test]
fn fetch_parsers_already_cached_verbose() {
    // With -v it shows the cached path
    cmd()
        .arg("--data-dir")
        .arg(fixtures_dir())
        .arg("-v")
        .args(["parsers", "fetch", "diff"])
        .assert()
        .success()
        .stderr(predicate::str::contains("tree-sitter-diff.wasm"));
}

#[test]
fn update_parsers_all_empty_data_dir() {
    let tmp = tempfile::tempdir().unwrap();
    cmd()
        .arg("--data-dir")
        .arg(tmp.path())
        .args(["parsers", "update", "--all"])
        .assert()
        .success();
}

#[test]
fn fetch_parsers_to_temp_dir() {
    let tmp = tempfile::tempdir().unwrap();
    cmd()
        .arg("--data-dir")
        .arg(tmp.path())
        .args(["parsers", "fetch", "json"])
        .assert()
        .success();

    // Verify the WASM file was cached
    assert!(tmp.path().join("parsers/tree-sitter-json.wasm").exists());
}

#[test]
fn fetch_parsers_to_temp_dir_verbose() {
    let tmp = tempfile::tempdir().unwrap();
    cmd()
        .arg("--data-dir")
        .arg(tmp.path())
        .arg("-v")
        .args(["parsers", "fetch", "json"])
        .assert()
        .success()
        .stderr(predicate::str::contains("tree-sitter-json.wasm"));

    assert!(tmp.path().join("parsers/tree-sitter-json.wasm").exists());
}

#[test]
fn fetch_parsers_then_update() {
    let tmp = tempfile::tempdir().unwrap();

    // First fetch
    cmd()
        .arg("--data-dir")
        .arg(tmp.path())
        .args(["parsers", "fetch", "json"])
        .assert()
        .success();

    // Then update (verbose to verify path output)
    cmd()
        .arg("--data-dir")
        .arg(tmp.path())
        .arg("-v")
        .args(["parsers", "update", "json"])
        .assert()
        .success()
        .stderr(predicate::str::contains("tree-sitter-json.wasm"));
}

#[test]
fn fetch_parsers_then_highlight() {
    let tmp = tempfile::tempdir().unwrap();

    // Fetch the parser first
    cmd()
        .arg("--data-dir")
        .arg(tmp.path())
        .args(["parsers", "fetch", "json"])
        .assert()
        .success();

    // Now highlight with it
    cmd()
        .arg("--data-dir")
        .arg(tmp.path())
        .args(["highlight", "-l", "json"])
        .write_stdin(r#"{"key": "value"}"#)
        .assert()
        .success()
        .stdout(predicate::str::is_empty().not());
}

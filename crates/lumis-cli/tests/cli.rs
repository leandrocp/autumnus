use assert_cmd::cargo::cargo_bin_cmd;
use predicates::prelude::*;
use std::path::PathBuf;

fn cmd() -> assert_cmd::Command {
    cargo_bin_cmd!("lumis")
}

fn fixtures_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("tests")
        .join("fixtures")
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
        .arg("list-languages")
        .assert()
        .success()
        .stdout(predicate::str::contains("rust"))
        .stdout(predicate::str::contains("javascript"))
        .stdout(predicate::str::contains("elixir"));
}

#[test]
fn list_themes() {
    cmd()
        .arg("list-themes")
        .assert()
        .success()
        .stdout(predicate::str::contains("dracula"));
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
        .args(["highlight-source", "-l", "diff", "--", DIFF_SNIPPET])
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
            "highlight-source",
            "-l",
            "diff",
            "-f",
            "html-inline",
            "-t",
            "dracula",
            "--",
            DIFF_SNIPPET,
        ])
        .assert()
        .success()
        .stdout(predicate::str::contains("<pre"));
}

#[test]
fn highlight_source_diff_html_linked() {
    cmd()
        .arg("--data-dir")
        .arg(fixtures_dir())
        .args([
            "highlight-source",
            "-l",
            "diff",
            "-f",
            "html-linked",
            "--",
            DIFF_SNIPPET,
        ])
        .assert()
        .success()
        .stdout(predicate::str::contains("<pre"));
}

// -- fetch-parsers / update-parsers --

#[test]
fn fetch_parsers_no_args_fails() {
    cmd()
        .args(["fetch-parsers"])
        .assert()
        .failure()
        .stderr(predicate::str::contains(
            "specify language names or use --all",
        ));
}

#[test]
fn update_parsers_no_args_fails() {
    cmd()
        .args(["update-parsers"])
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
        .args(["fetch-parsers", "diff"])
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
        .args(["fetch-parsers", "diff"])
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
        .args(["update-parsers", "--all"])
        .assert()
        .success();
}

#[test]
fn fetch_parsers_to_temp_dir() {
    let tmp = tempfile::tempdir().unwrap();
    cmd()
        .arg("--data-dir")
        .arg(tmp.path())
        .args(["fetch-parsers", "json"])
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
        .args(["fetch-parsers", "json"])
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
        .args(["fetch-parsers", "json"])
        .assert()
        .success();

    // Then update (verbose to verify path output)
    cmd()
        .arg("--data-dir")
        .arg(tmp.path())
        .arg("-v")
        .args(["update-parsers", "json"])
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
        .args(["fetch-parsers", "json"])
        .assert()
        .success();

    // Now highlight with it
    cmd()
        .arg("--data-dir")
        .arg(tmp.path())
        .args([
            "highlight-source",
            "-l",
            "json",
            "--",
            r#"{"key": "value"}"#,
        ])
        .assert()
        .success()
        .stdout(predicate::str::is_empty().not());
}

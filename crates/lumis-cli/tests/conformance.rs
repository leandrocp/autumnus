use assert_cmd::cargo::cargo_bin_cmd;
use serde::Deserialize;
use std::fs;
use std::path::PathBuf;

fn cmd() -> assert_cmd::Command {
    cargo_bin_cmd!("lumis")
}

fn fixtures_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("tests")
        .join("fixtures")
}

fn conformance_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .join("fixtures")
        .join("conformance")
}

#[derive(Debug, Deserialize)]
struct FixtureMetadata {
    language: String,
    theme: String,
}

struct Fixture {
    metadata: FixtureMetadata,
    source: String,
    html_inline: String,
    html_linked: String,
    html_multi_themes: String,
    terminal: String,
}

fn load_fixture(name: &str) -> Fixture {
    let dir = conformance_dir().join(name);
    let metadata = serde_json::from_str::<FixtureMetadata>(
        &fs::read_to_string(dir.join("fixture.json")).expect("failed to read fixture metadata"),
    )
    .expect("failed to parse fixture metadata");

    Fixture {
        metadata,
        source: fs::read_to_string(dir.join("source.txt")).expect("failed to read source"),
        html_inline: fs::read_to_string(dir.join("html-inline.html"))
            .expect("failed to read html-inline"),
        html_linked: fs::read_to_string(dir.join("html-linked.html"))
            .expect("failed to read html-linked"),
        html_multi_themes: fs::read_to_string(dir.join("html-multi-themes.html"))
            .expect("failed to read html-multi-themes"),
        terminal: fs::read_to_string(dir.join("terminal.txt")).expect("failed to read terminal"),
    }
}

fn run_highlight_source(fixture: &Fixture, formatter: &str, extra_args: &[&str]) -> String {
    let output = cmd()
        .arg("--data-dir")
        .arg(fixtures_dir())
        .arg("highlight-source")
        .arg("-l")
        .arg(&fixture.metadata.language)
        .arg("-f")
        .arg(formatter)
        .args(extra_args)
        .arg("--")
        .arg(&fixture.source)
        .output()
        .unwrap();

    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    String::from_utf8(output.stdout).unwrap()
}

fn check_html_inline(fixture: &Fixture) {
    let output = run_highlight_source(fixture, "html-inline", &["-t", &fixture.metadata.theme]);
    assert_eq!(output, fixture.html_inline);
}

fn check_html_linked(fixture: &Fixture) {
    let output = run_highlight_source(fixture, "html-linked", &[]);
    assert_eq!(output, fixture.html_linked);
}

fn check_html_multi_themes(fixture: &Fixture) {
    let output = run_highlight_source(
        fixture,
        "html-multi-themes",
        &[
            "--themes",
            &format!("main:{}", fixture.metadata.theme),
            "--default-theme",
            "main",
        ],
    );
    assert_eq!(output, fixture.html_multi_themes);
}

fn check_terminal(fixture: &Fixture) {
    let output = run_highlight_source(fixture, "terminal", &["-t", &fixture.metadata.theme]);
    assert_eq!(output, fixture.terminal);
}

include!(concat!(env!("OUT_DIR"), "/conformance_tests.rs"));

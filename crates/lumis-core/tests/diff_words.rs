//! Rust's half of the changed-word parity check.
//!
//! `fixtures/diff-words.json` holds the words each diff marks. This asserts
//! Rust marks them; `packages/javascript/lumis/test/diff-words.test.ts` asserts
//! the browser port does too.

use lumis_core::decorations::DiffWordKind;
use lumis_core::diff_words::{diff_word_ranges, DiffLine};
use serde::Deserialize;
use std::path::PathBuf;

#[derive(Deserialize)]
struct Fixture {
    ranges: Vec<RangeCase>,
}

#[derive(Deserialize)]
struct RangeCase {
    name: String,
    diff: String,
    marked: Vec<(String, usize, String)>,
}

fn fixture() -> Fixture {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../fixtures/diff-words.json");
    serde_json::from_str(&std::fs::read_to_string(path).expect("read diff-words.json"))
        .expect("parse diff-words.json")
}

/// The removed and added lines of a diff body, each starting with its marker.
fn lines(diff: &str) -> Vec<DiffLine> {
    let mut offset = 0;
    let mut found = Vec::new();
    for (row, line) in diff.split('\n').enumerate() {
        let kind = match line.as_bytes().first() {
            Some(b'-') => Some(DiffWordKind::Removed),
            Some(b'+') => Some(DiffWordKind::Added),
            _ => None,
        };
        if let Some(kind) = kind {
            found.push(DiffLine {
                kind,
                row,
                content: offset + 1..offset + line.len(),
            });
        }
        offset += line.len() + 1;
    }
    found
}

#[test]
fn rust_marks_the_expected_words() {
    let fixture = fixture();
    assert!(
        fixture.ranges.len() >= 16,
        "corpus shrank to {}",
        fixture.ranges.len()
    );

    for case in fixture.ranges {
        let marked: Vec<(String, usize, String)> =
            diff_word_ranges(&case.diff, &lines(&case.diff), || false)
                .expect("never stopped")
                .into_iter()
                .map(|range| {
                    let side = match range.kind {
                        DiffWordKind::Removed => "-",
                        DiffWordKind::Added => "+",
                    };
                    (
                        side.to_string(),
                        range.start,
                        case.diff[range.start..range.end].to_string(),
                    )
                })
                .collect();
        assert_eq!(marked, case.marked, "{}", case.name);
    }
}

/// The pairing grows with the product of a run's sides, so the caller's
/// budget has to reach inside a run, not only between runs.
#[test]
fn stop_is_consulted_inside_a_run() {
    let diff = "-a b c\n+a b d";
    let mut calls = 0;
    let ranges = diff_word_ranges(diff, &lines(diff), || {
        calls += 1;
        calls > 1
    });
    assert_eq!(ranges, None);
}

/// Blank lines skip the comparison, and with it the budget check inside it,
/// so a run of them must not reach the pairing table at all.
#[test]
fn blank_lines_stay_out_of_the_pairing() {
    let diff = format!("{}-a b c\n{}+a b d", "-\n".repeat(5000), "+\n".repeat(5000));
    let mut calls = 0;
    let ranges = diff_word_ranges(&diff, &lines(&diff), || {
        calls += 1;
        calls > 100
    })
    .expect("a blank run costs no budget");
    let marked: Vec<&str> = ranges.iter().map(|r| &diff[r.start..r.end]).collect();
    assert_eq!(marked, ["c", "d"]);
}

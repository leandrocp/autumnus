#![cfg(feature = "lang-diff")]
//! Changed words in a parsed diff.
//!
//! `fixtures/diff-words.json` holds the words each diff marks; lumis-core's
//! own test feeds it lines directly, and this one parses each case as a hunk,
//! so it also checks which lines the grammar hands over.

use lumis::decorations::{Decoration, DiffWordKind};
use lumis::events::HighlightEvent;
use lumis::highlight::highlight_events_with_options;
use lumis::languages::Language;
use lumis::HighlightOptions;
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

/// A hunk header with no `diff --git` block around it, as `diff -u` writes.
const HEADER: &str = "@@ -1,9 +1,9 @@\n";

fn marked(source: &str, options: HighlightOptions<'_, '_>) -> Vec<(String, usize, String)> {
    let events = highlight_events_with_options(source, Language::Diff, options).unwrap();
    let mut marked = Vec::new();
    let mut open: Option<(DiffWordKind, Option<usize>, usize)> = None;
    for event in &events {
        match event {
            HighlightEvent::DecorationStart {
                decoration: Decoration::DiffWord { kind },
            } => open = Some((*kind, None, 0)),
            HighlightEvent::Source { start, end } => {
                if let Some((_, first, last)) = &mut open {
                    first.get_or_insert(*start);
                    *last = *end;
                }
            }
            HighlightEvent::DecorationEnd => {
                if let Some((kind, Some(start), end)) = open.take() {
                    let side = if kind == DiffWordKind::Removed {
                        "-"
                    } else {
                        "+"
                    };
                    marked.push((side.to_string(), start, source[start..end].to_string()));
                }
            }
            _ => {}
        }
    }
    marked
}

#[test]
fn a_parsed_hunk_marks_the_fixture_words() {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../fixtures/diff-words.json");
    let fixture: Fixture = serde_json::from_str(&std::fs::read_to_string(path).unwrap()).unwrap();
    let mut checked = 0;

    for case in fixture.ranges {
        let source = format!("{HEADER}{}", case.diff);
        let expected: Vec<_> = case
            .marked
            .into_iter()
            .map(|(side, start, text)| (side, start + HEADER.len(), text))
            .collect();
        assert_eq!(
            marked(&source, HighlightOptions::new().word_diff(true)),
            expected,
            "{}",
            case.name
        );
        checked += expected.len();
    }
    assert!(checked > 20, "only {checked} words checked");
}

#[test]
fn words_are_marked_only_when_asked() {
    let source = format!("{HEADER}-x = foo(1)\n+x = foo(2)\n");
    assert_eq!(marked(&source, HighlightOptions::new()), Vec::new());
    assert_eq!(
        marked(&source, HighlightOptions::new().word_diff(true)).len(),
        2
    );
}

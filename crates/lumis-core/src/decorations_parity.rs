//! Rust's half of the line-decoration composition parity check.
//!
//! `fixtures/decoration-composition.json` holds one expected event stream per
//! case. This asserts Rust produces it;
//! `packages/javascript/lumis/test/decoration-composition.test.ts` asserts the
//! TypeScript port produces the same. Rust is the reference, so a difference is
//! a bug in the port rather than something to record.
//!
//! Each case runs the pipeline a formatter sees: caller annotations composed
//! first, then the line decorations over the top.

use super::{
    compose_diff_word_decorations, compose_line_decorations, compose_rainbow_decorations,
    Decoration, DiffWordKind, LineSelection, RainbowRange,
};
use crate::annotations::{compose_annotations, Annotation};
use crate::diff_words::DiffWordRange;
use crate::events::HighlightEvent;
use crate::highlights::HIGHLIGHT_NAMES;
use serde::Deserialize;
use std::fs;
use std::ops::RangeInclusive;
use std::path::PathBuf;

#[derive(Debug, Deserialize)]
struct Manifest {
    cases: Vec<Case>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Case {
    name: String,
    source: String,
    events: Vec<SyntaxEvent>,
    #[serde(default)]
    annotations: Vec<CaseAnnotation>,
    #[serde(default)]
    rainbow_ranges: Vec<CaseRainbowRange>,
    #[serde(default)]
    diff_word_ranges: Vec<CaseDiffWordRange>,
    highlight_lines: Vec<LineSpec>,
    expected: String,
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
enum SyntaxEvent {
    Start { scope: String, language: String },
    Source { start: usize, end: usize },
    End,
}

#[derive(Debug, Deserialize)]
struct CaseAnnotation {
    start: usize,
    end: usize,
    data: String,
}

#[derive(Debug, Deserialize)]
struct CaseRainbowRange {
    start: usize,
    end: usize,
    depth: usize,
}

#[derive(Debug, Deserialize)]
struct CaseDiffWordRange {
    start: usize,
    end: usize,
    kind: String,
}

/// A 1-based line, or an inclusive range of them, the way every runtime's
/// `highlight_lines` option accepts them.
#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum LineSpec {
    Single(usize),
    Range([usize; 2]),
}

fn manifest() -> Manifest {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../../fixtures/decoration-composition.json");
    serde_json::from_str(&fs::read_to_string(&path).expect("read decoration-composition.json"))
        .expect("parse decoration-composition.json")
}

fn scope_index(name: &str) -> usize {
    HIGHLIGHT_NAMES
        .iter()
        .position(|candidate| *candidate == name)
        .unwrap_or_else(|| panic!("`{name}` is not a highlight scope"))
}

fn selection(lines: &[LineSpec]) -> LineSelection {
    let ranges: Vec<RangeInclusive<usize>> = lines
        .iter()
        .map(|line| match line {
            LineSpec::Single(line) => *line..=*line,
            LineSpec::Range([start, end]) => *start..=*end,
        })
        .collect();

    LineSelection::new(&ranges, &[])
}

fn syntax_events(case: &Case) -> Vec<HighlightEvent<'static, ()>> {
    case.events
        .iter()
        .map(|event| match event {
            SyntaxEvent::Start { scope, language } => HighlightEvent::Start {
                scope_index: scope_index(scope),
                language: language.clone(),
            },
            SyntaxEvent::Source { start, end } => HighlightEvent::Source {
                start: *start,
                end: *end,
            },
            SyntaxEvent::End => HighlightEvent::End,
        })
        .collect()
}

fn annotations(case: &Case) -> Vec<Annotation<String>> {
    case.annotations
        .iter()
        .map(|annotation| {
            Annotation::new(annotation.start..annotation.end, annotation.data.clone())
                .expect("fixture annotations are well-formed")
        })
        .collect()
}

fn compose<'a>(
    case: &'a Case,
    annotations: &'a [Annotation<String>],
) -> Vec<HighlightEvent<'a, String>> {
    let ranges = case
        .rainbow_ranges
        .iter()
        .map(|range| RainbowRange {
            start: range.start,
            end: range.end,
            depth: range.depth,
        })
        .collect::<Vec<_>>();
    let diff_words = case
        .diff_word_ranges
        .iter()
        .map(|range| DiffWordRange {
            start: range.start,
            end: range.end,
            kind: match range.kind.as_str() {
                "removed" => DiffWordKind::Removed,
                "added" => DiffWordKind::Added,
                other => panic!("unknown diff word kind {other:?}"),
            },
        })
        .collect::<Vec<_>>();
    let events = compose_diff_word_decorations(&case.source, &syntax_events(case), &diff_words);
    let events = compose_rainbow_decorations(&case.source, &events, &ranges);
    let events = compose_annotations(&case.source, &events, annotations)
        .expect("fixture annotations resolve");

    compose_line_decorations(&case.source, &events, &selection(&case.highlight_lines))
}

/// One line per case, so a failure diff points at the event that moved.
fn notation<T: std::fmt::Display>(events: &[HighlightEvent<'_, T>]) -> String {
    let mut decorations = Vec::new();

    events
        .iter()
        .map(|event| match event {
            HighlightEvent::Start { scope_index, .. } => {
                format!("S:{}", HIGHLIGHT_NAMES[*scope_index])
            }
            HighlightEvent::Source { start, end } => format!("T:{start}-{end}"),
            HighlightEvent::End => "E".to_string(),
            HighlightEvent::AnnotationStart { range, data } => {
                format!("A+{}@{}-{}", data, range.start, range.end)
            }
            HighlightEvent::AnnotationEnd => "A-".to_string(),
            HighlightEvent::DecorationStart { decoration } => {
                decorations.push(*decoration);
                match decoration {
                    Decoration::Line {
                        number,
                        highlighted,
                    } => format!("L+{number}{}", if *highlighted { "*" } else { "" }),
                    Decoration::RainbowBracket { depth } => format!("R+{depth}"),
                    Decoration::DiffWord { kind } => format!("W+{}", kind.as_str()),
                }
            }
            HighlightEvent::DecorationEnd => match decorations.pop() {
                Some(Decoration::Line { .. }) => "L-".to_string(),
                Some(Decoration::RainbowBracket { .. }) => "R-".to_string(),
                Some(Decoration::DiffWord { .. }) => "W-".to_string(),
                None => "D-".to_string(),
            },
        })
        .collect::<Vec<_>>()
        .join(" ")
}

#[test]
fn the_corpus_covers_the_shapes_composition_has_to_get_right() {
    let manifest = manifest();

    // A discovery bug that found nothing would otherwise pass silently.
    assert!(
        manifest.cases.len() >= 36,
        "corpus shrank to {} cases",
        manifest.cases.len()
    );

    for required in [
        "empty/no-events",
        "lines/trailing-newline-opens-one-more",
        "lines/blank-line-in-the-middle",
        "scope/closed-and-reopened-across-a-newline",
        "scope/ends-at-newline",
        "scope/continues-in-next-source-event",
        "scope/inner-ends-at-newline-outer-continues",
        "scope/ends-at-final-newline",
        "scope/unbalanced-start-at-final-newline",
        "scope/reopens-before-explicit-empty-scope",
        "scope/ends-at-crlf-before-blank-line",
        "annotation/ends-at-newline",
        "annotation/point-after-range-ending-at-newline",
        "rainbow/ends-at-newline",
        "layers/all-end-at-newline",
        "scope/unbalanced-start-closes-before-the-last-line-ends",
        "annotation/closed-and-reopened-across-a-newline",
        "rainbow/crosses-source-and-syntax-boundaries",
        "rainbow/composes-with-annotations-and-lines",
        "diffword/crosses-source-and-syntax-boundaries",
        "diffword/composes-with-rainbow-annotations-and-lines",
        "utf8/multibyte-lines",
        "highlight/overlapping-ranges-merge",
        "highlight/range-beyond-the-document",
        "highlight/blank-line",
    ] {
        assert!(
            manifest.cases.iter().any(|case| case.name == required),
            "the corpus lost its `{required}` case"
        );
    }
}

#[test]
fn rust_produces_the_expected_stream() {
    for case in &manifest().cases {
        let annotations = annotations(case);
        let composed = compose(case, &annotations);
        let rendered = notation(&composed);

        assert_eq!(
            rendered, case.expected,
            "{}: composition changed",
            case.name
        );

        let recomposed =
            compose_line_decorations(&case.source, &composed, &selection(&case.highlight_lines));
        assert_eq!(notation(&recomposed), rendered, "{}: recomposed", case.name);
    }
}

/// The `Source` events of a composed stream still reproduce the source, which is
/// what lets a formatter write the stream straight out.
#[test]
fn composition_preserves_the_source() {
    for case in &manifest().cases {
        let annotations = annotations(case);
        let rendered: String = compose(case, &annotations)
            .iter()
            .filter_map(|event| match event {
                HighlightEvent::Source { start, end } => Some(&case.source[*start..*end]),
                _ => None,
            })
            .collect();

        let covered: String = case
            .events
            .iter()
            .filter_map(|event| match event {
                SyntaxEvent::Source { start, end } => Some(&case.source[*start..*end]),
                _ => None,
            })
            .collect();

        assert_eq!(rendered, covered, "{}: source changed", case.name);
    }
}

/// Every line decoration opens and closes, and nothing nests outside one.
#[test]
fn every_line_is_balanced() {
    for case in &manifest().cases {
        let annotations = annotations(case);
        let mut depth = 0usize;
        let mut lines = 0usize;
        let mut decorations = Vec::new();

        for event in compose(case, &annotations) {
            match event {
                HighlightEvent::DecorationStart { decoration } => {
                    decorations.push(decoration);
                    match decoration {
                        Decoration::Line { .. } => {
                            assert_eq!(depth, 0, "{}: a line opened inside a scope", case.name);
                            lines += 1;
                        }
                        Decoration::RainbowBracket { .. } | Decoration::DiffWord { .. } => {
                            depth += 1;
                        }
                    }
                }
                HighlightEvent::DecorationEnd => match decorations.pop() {
                    Some(Decoration::Line { .. }) => {
                        assert_eq!(depth, 0, "{}: a line closed inside a scope", case.name);
                    }
                    Some(Decoration::RainbowBracket { .. } | Decoration::DiffWord { .. }) => {
                        depth = depth.checked_sub(1).expect("unbalanced span decoration");
                    }
                    None => panic!("{}: unmatched decoration end", case.name),
                },
                HighlightEvent::Start { .. } | HighlightEvent::AnnotationStart { .. } => depth += 1,
                HighlightEvent::End | HighlightEvent::AnnotationEnd => {
                    depth = depth.checked_sub(1).expect("unbalanced closing event");
                }
                HighlightEvent::Source { .. } => {}
            }
        }

        assert!(lines >= 1, "{}: produced no lines", case.name);
    }
}

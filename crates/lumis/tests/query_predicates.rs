//! Rust's half of the Tree-sitter predicate parity check.
//!
//! `fixtures/query-predicates.json` records, per case, the match count each
//! engine produces. This asserts the `rust` column and re-derives the supported
//! operator set from the data, so the checked-in list cannot drift from what the
//! engines actually do. `packages/javascript/lumis/test/query-predicates.test.ts`
//! does the same for `web-tree-sitter`.
//!
//! Gated on `lang-rust` because the corpus is Rust source. The predicate
//! semantics under test do not vary per grammar, so one language is enough.
#![cfg(feature = "lang-rust")]

use serde::Deserialize;
use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::path::PathBuf;
use streaming_iterator::StreamingIterator;
use tree_sitter::{Parser, Query, QueryCursor};

#[derive(Debug, Deserialize)]
struct Manifest {
    supported: Vec<String>,
    cases: Vec<Case>,
}

#[derive(Debug, Deserialize)]
struct Case {
    name: String,
    operator: String,
    source: String,
    query: String,
    rust: Outcome,
    browser: Outcome,
}

/// A match count, or `"error"` when the engine rejects the query outright.
#[derive(Debug, Deserialize, PartialEq, Eq)]
#[serde(untagged)]
enum Outcome {
    Matches(u32),
    Error(String),
}

fn manifest() -> Manifest {
    let path =
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../fixtures/query-predicates.json");
    serde_json::from_str(&fs::read_to_string(&path).expect("read query-predicates.json"))
        .expect("parse query-predicates.json")
}

fn run(parser: &mut Parser, language: &tree_sitter::Language, case: &Case) -> Outcome {
    let tree = parser.parse(&case.source, None).expect("source parses");
    let Ok(query) = Query::new(language, &case.query) else {
        return Outcome::Error("error".to_string());
    };

    let mut cursor = QueryCursor::new();
    let mut matches = cursor.matches(&query, tree.root_node(), case.source.as_bytes());
    let mut count = 0;
    while matches.next().is_some() {
        count += 1;
    }
    Outcome::Matches(count)
}

#[test]
fn the_corpus_covers_every_text_predicate() {
    let manifest = manifest();

    // A discovery bug that found nothing would otherwise pass silently.
    assert!(
        manifest.cases.len() >= 70,
        "corpus shrank to {} cases",
        manifest.cases.len()
    );

    let covered: BTreeSet<&str> = manifest
        .cases
        .iter()
        .map(|case| case.operator.as_str())
        .collect();
    let expected: BTreeSet<&str> = [
        "eq?",
        "not-eq?",
        "any-eq?",
        "any-not-eq?",
        "any-of?",
        "not-any-of?",
        "match?",
        "not-match?",
        "any-match?",
        "any-not-match?",
    ]
    .into();

    assert_eq!(
        covered, expected,
        "every text predicate tree-sitter evaluates needs a verdict"
    );
}

#[test]
fn recorded_rust_results_still_hold() {
    let manifest = manifest();
    let language: tree_sitter::Language = tree_sitter_rust::LANGUAGE.into();
    let mut parser = Parser::new();
    parser.set_language(&language).expect("rust grammar loads");

    for case in &manifest.cases {
        let observed = run(&mut parser, &language, case);
        assert_eq!(
            observed, case.rust,
            "{}: the Rust engine changed. Re-record the fixture.",
            case.name
        );
    }
}

/// The supported list is a conclusion, not a decision: an operator is supported
/// when no case makes the two engines disagree.
#[test]
fn supported_operators_match_the_measurements() {
    let manifest = manifest();

    let mut diverging: BTreeMap<&str, Vec<&str>> = BTreeMap::new();
    for case in &manifest.cases {
        if case.rust != case.browser {
            diverging
                .entry(case.operator.as_str())
                .or_default()
                .push(case.name.as_str());
        }
    }

    let derived: BTreeSet<&str> = manifest
        .cases
        .iter()
        .map(|case| case.operator.as_str())
        .filter(|operator| !diverging.contains_key(operator))
        .collect();
    let declared: BTreeSet<&str> = manifest.supported.iter().map(String::as_str).collect();

    assert_eq!(
        derived, declared,
        "`supported` disagrees with the recorded results; diverging cases: {diverging:?}"
    );
}

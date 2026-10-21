//! Rust's half of the cross-runtime highlight option check, and the behaviour
//! of `on_unresolved`.
//!
//! `fixtures/highlight-options.json` lists the per-call options every runtime
//! must accept. As with the formatter options, Rust cannot reflect on builder
//! methods, so `every_manifest_option_has_a_setter` calls each one by name and
//! `manifest_matches_the_setters` parses `highlight.rs` for the public methods
//! of `HighlightOptions`, which catches a setter added without a manifest entry.
#![cfg(all(
    feature = "lang-markdown",
    feature = "lang-markdown-inline",
    feature = "lang-python",
    feature = "lang-html",
    feature = "lang-javascript"
))]

use lumis::highlight::{highlight_events_with_languages, Budget, HighlightOptions};
use lumis::languages::Language;
use lumis::Annotation;
use serde::Deserialize;
use std::cell::RefCell;
use std::collections::{BTreeMap, BTreeSet, HashSet};
use std::fs;
use std::path::PathBuf;
use std::sync::atomic::AtomicUsize;
use syn::{ImplItem, Item, Type};

#[derive(Debug, Deserialize)]
struct Manifest {
    options: Vec<OptionEntry>,
    runtime_only: BTreeMap<String, serde_json::Value>,
    waived: BTreeMap<String, serde_json::Value>,
}

#[derive(Debug, Deserialize)]
struct OptionEntry {
    name: String,
}

fn manifest() -> Manifest {
    let path =
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../fixtures/highlight-options.json");
    serde_json::from_str(&fs::read_to_string(path).expect("read highlight-options.json"))
        .expect("parse highlight-options.json")
}

fn names_under(section: &BTreeMap<String, serde_json::Value>) -> BTreeSet<String> {
    section
        .get("rust")
        .and_then(serde_json::Value::as_object)
        .map(|names| names.keys().cloned().collect())
        .unwrap_or_default()
}

/// Every option, set once. An option added here without a Rust setter fails to
/// compile; the manifest disagreeing with this list fails the next test.
fn exercised_options() -> BTreeSet<&'static str> {
    let annotations = [Annotation::new(0..1, ()).expect("valid range")];
    let flag = AtomicUsize::new(0);
    let report = |_: &str| {};
    let _ = HighlightOptions::new()
        .annotations(&annotations)
        .rainbow_brackets(true)
        .budget(Budget::new())
        .cancellation(&flag)
        .on_unresolved(&report);

    [
        "annotations",
        "rainbow_brackets",
        "budget",
        "cancellation",
        "on_unresolved",
    ]
    .into()
}

/// The public methods of `HighlightOptions` other than its constructor.
fn public_setters() -> BTreeSet<String> {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("src/highlight.rs");
    let syntax = syn::parse_file(&fs::read_to_string(path).expect("read highlight.rs"))
        .expect("parse highlight.rs");

    let setters: BTreeSet<String> = syntax
        .items
        .iter()
        .filter_map(|item| match item {
            Item::Impl(item) if item.trait_.is_none() => Some(item),
            _ => None,
        })
        .filter(|item| {
            matches!(&*item.self_ty, Type::Path(path)
                if path.path.segments.last().is_some_and(|s| s.ident == "HighlightOptions"))
        })
        .flat_map(|item| &item.items)
        .filter_map(|item| match item {
            ImplItem::Fn(method) if matches!(method.vis, syn::Visibility::Public(_)) => {
                Some(method.sig.ident.to_string())
            }
            _ => None,
        })
        .filter(|name| name != "new")
        .collect();

    assert!(setters.len() > 3, "found almost no setters: {setters:?}");
    setters
}

#[test]
fn every_manifest_option_has_a_setter() {
    let manifest = manifest();
    let required: BTreeSet<String> = manifest
        .options
        .iter()
        .map(|option| option.name.clone())
        .chain(names_under(&manifest.runtime_only))
        .collect();
    let exercised: BTreeSet<String> = exercised_options()
        .into_iter()
        .map(str::to_string)
        .collect();

    assert_eq!(required, exercised);
}

#[test]
fn manifest_matches_the_setters() {
    let manifest = manifest();
    let declared: BTreeSet<String> = manifest
        .options
        .iter()
        .map(|option| option.name.clone())
        .chain(names_under(&manifest.runtime_only))
        .collect();

    assert_eq!(
        public_setters(),
        declared,
        "HighlightOptions and fixtures/highlight-options.json disagree"
    );
}

#[test]
fn no_waiver_outlives_its_reason() {
    let manifest = manifest();
    let waived: Vec<&String> = manifest
        .waived
        .keys()
        .filter(|key| !key.starts_with('$'))
        .collect();

    assert!(waived.is_empty(), "drop these waivers: {waived:?}");
}

fn unresolved(source: &str, root: Language, loaded: &[Language]) -> Vec<String> {
    let reported = RefCell::new(Vec::new());
    let report = |language: &str| reported.borrow_mut().push(language.to_string());
    let languages: HashSet<Language> = loaded.iter().copied().collect();

    highlight_events_with_languages(
        source,
        root,
        HighlightOptions::new().on_unresolved(&report),
        &languages,
    )
    .expect("highlights");

    reported.into_inner()
}

#[test]
fn reports_each_language_it_could_not_load_once_by_catalog_id() {
    let source = "```py\nx = 1\n```\n\n```python\ny = 2\n```\n";

    assert_eq!(
        unresolved(
            source,
            Language::Markdown,
            &[Language::Markdown, Language::MarkdownInline]
        ),
        ["python"]
    );
}

#[test]
fn reports_nothing_when_every_injected_language_loads() {
    let source = "```python\nx = 1\n```\n";

    assert_eq!(
        unresolved(
            source,
            Language::Markdown,
            &[
                Language::Markdown,
                Language::MarkdownInline,
                Language::Python
            ]
        ),
        Vec::<String>::new()
    );
}

#[test]
fn a_captured_name_that_is_not_a_language_is_not_reported() {
    // html injects the raw `type` value, "module", before injecting javascript.
    let source = "<script type=\"module\">let x = 1;</script>\n";

    assert_eq!(
        unresolved(
            source,
            Language::HTML,
            &[Language::HTML, Language::JavaScript]
        ),
        Vec::<String>::new()
    );
}

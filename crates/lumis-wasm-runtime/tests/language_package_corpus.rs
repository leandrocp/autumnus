//! Rust half of the shared language-package validation corpus.
//!
//! The JavaScript half is `packages/javascript/lumis/test/language-package-corpus.test.ts`.
//! Both read `fixtures/language-packages/` and must agree on every file, so a validator
//! that drifts in either runtime fails here.

use lumis_wasm_runtime::LanguagePackage;
use std::path::{Path, PathBuf};

/// Lower bounds, not exact counts, so adding a fixture does not force a test edit.
/// They exist to catch a discovery bug that silently finds nothing.
const MIN_VALID: usize = 9;
const MIN_INVALID: usize = 34;

fn corpus_dir(kind: &str) -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .join("fixtures/language-packages")
        .join(kind)
}

fn fixtures(kind: &str) -> Vec<(String, String)> {
    let dir = corpus_dir(kind);
    let mut found: Vec<_> = std::fs::read_dir(&dir)
        .unwrap_or_else(|error| panic!("cannot read {}: {error}", dir.display()))
        .map(|entry| entry.expect("readable dir entry").path())
        .filter(|path| {
            path.extension()
                .is_some_and(|extension| extension == "json")
        })
        .map(|path| {
            let name = path
                .file_stem()
                .expect("fixture has a file stem")
                .to_string_lossy()
                .into_owned();
            let json = std::fs::read_to_string(&path)
                .unwrap_or_else(|error| panic!("cannot read {}: {error}", path.display()));
            (name, json)
        })
        .collect();
    found.sort();
    found
}

#[test]
fn every_valid_fixture_is_accepted() {
    let fixtures = fixtures("valid");
    assert!(
        fixtures.len() >= MIN_VALID,
        "found {} valid fixtures, expected at least {MIN_VALID}",
        fixtures.len()
    );

    for (name, json) in fixtures {
        LanguagePackage::from_json(&json)
            .unwrap_or_else(|error| panic!("valid/{name}.json should parse, got: {error}"));
    }
}

#[test]
fn every_invalid_fixture_is_rejected() {
    let fixtures = fixtures("invalid");
    assert!(
        fixtures.len() >= MIN_INVALID,
        "found {} invalid fixtures, expected at least {MIN_INVALID}",
        fixtures.len()
    );

    for (name, json) in fixtures {
        assert!(
            LanguagePackage::from_json(&json).is_err(),
            "invalid/{name}.json should have been rejected, but it parsed"
        );
    }
}

/// The two documents that Rust accepted and JavaScript rejected before the corpus existed.
/// Pinned by name so a future `#[serde(default)]` cannot quietly reintroduce the divergence.
#[test]
fn the_documents_that_used_to_diverge_are_rejected() {
    for name in ["language-missing-aliases", "parser-size-zero"] {
        let json = std::fs::read_to_string(corpus_dir("invalid").join(format!("{name}.json")))
            .expect("divergence fixture exists");
        assert!(
            LanguagePackage::from_json(&json).is_err(),
            "{name} must be rejected in Rust, as it already is in JavaScript"
        );
    }
}

#[test]
fn parser_size_and_languages_have_one_serialized_contract() {
    for name in ["parser-size-integral-float", "parser-size-max-safe-integer"] {
        let json = std::fs::read_to_string(corpus_dir("valid").join(format!("{name}.json")))
            .expect("numeric boundary fixture exists");
        LanguagePackage::from_json(&json)
            .unwrap_or_else(|error| panic!("valid/{name}.json should parse, got: {error}"));
    }

    for name in [
        "languages-array",
        "parser-size-fractional",
        "parser-size-unsafe-integer",
    ] {
        let json = std::fs::read_to_string(corpus_dir("invalid").join(format!("{name}.json")))
            .expect("shared-contract fixture exists");
        assert!(
            LanguagePackage::from_json(&json).is_err(),
            "invalid/{name}.json should be rejected"
        );
    }
}

#[test]
fn ambiguous_ascii_case_insensitive_language_names_are_rejected() {
    for name in [
        "language-id-case-collision",
        "language-alias-collision",
        "language-alias-id-collision",
    ] {
        let json = std::fs::read_to_string(corpus_dir("invalid").join(format!("{name}.json")))
            .expect("language-name collision fixture exists");
        assert!(
            LanguagePackage::from_json(&json).is_err(),
            "invalid/{name}.json should be rejected"
        );
    }
}

#[test]
fn strings_must_contain_unicode_scalar_values() {
    for name in ["unpaired-surrogate", "unpaired-surrogate-unknown-field"] {
        let json = std::fs::read_to_string(corpus_dir("invalid").join(format!("{name}.json")))
            .expect("unpaired-surrogate fixture exists");
        assert!(
            LanguagePackage::from_json(&json).is_err(),
            "{name} must fail"
        );
    }
}

#[test]
fn raw_json_tokens_and_nesting_have_one_contract() {
    for name in ["duplicate-members-last-wins", "maximum-nesting-depth"] {
        let json = std::fs::read_to_string(corpus_dir("valid").join(format!("{name}.json")))
            .expect("raw-profile fixture exists");
        LanguagePackage::from_json(&json)
            .unwrap_or_else(|error| panic!("valid/{name}.json should parse, got: {error}"));
    }

    for name in [
        "duplicate-member-overwritten-surrogate",
        "nesting-depth-exceeded",
        "unknown-number-out-of-range",
    ] {
        let json = std::fs::read_to_string(corpus_dir("invalid").join(format!("{name}.json")))
            .expect("raw-profile fixture exists");
        assert!(
            LanguagePackage::from_json(&json).is_err(),
            "invalid/{name}.json should be rejected"
        );
    }
}

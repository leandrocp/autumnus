//! `@injection.filename` resolution, pinned against the browser port.
//!
//! Runs from `lumis-wasm-runtime`, which depends on `lumis-core` with no
//! `lang-*` feature, so it also proves the glob table is not gated: the dynamic
//! runtimes resolve names for languages they download rather than compile.

use lumis_core::languages::language_id_for_filename;

#[derive(serde::Deserialize)]
struct Case {
    path: String,
    language: Option<String>,
}

#[derive(serde::Deserialize)]
struct Fixture {
    cases: Vec<Case>,
}

/// `packages/javascript/lumis/test/injection-filename.test.ts` reads the same
/// file, so the browser port cannot drift from the runtime.
#[test]
fn filename_resolution_matches_the_shared_fixture() {
    let raw = include_str!("../../../fixtures/injection-filename.json");
    let fixture: Fixture = serde_json::from_str(raw).expect("fixture is valid JSON");
    assert!(
        fixture.cases.len() >= 18,
        "the fixture must not silently shrink: {} cases",
        fixture.cases.len()
    );

    for case in &fixture.cases {
        assert_eq!(
            language_id_for_filename(&case.path),
            case.language.as_deref(),
            "resolving {:?}",
            case.path
        );
    }
}

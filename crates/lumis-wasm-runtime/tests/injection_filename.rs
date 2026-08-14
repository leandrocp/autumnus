//! `@injection.filename` resolution, pinned against the browser port.
//!
//! Lives outside `src/catalog.rs` because `mise run langs-gen-catalog` rewrites
//! that file whole.

use lumis_wasm_runtime::catalog;

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
        let resolved = catalog::find_by_filename(&case.path).map(|entry| entry.id);
        assert_eq!(
            resolved,
            case.language.as_deref(),
            "resolving {:?}",
            case.path
        );
    }
}

#[test]
fn every_catalog_entry_carries_its_globs() {
    let with_globs = catalog::LANGUAGES
        .iter()
        .filter(|entry| !entry.globs.is_empty())
        .count();
    assert!(
        with_globs > 100,
        "languages.toml globs did not reach the catalog: {with_globs} of {}",
        catalog::LANGUAGES.len()
    );
}

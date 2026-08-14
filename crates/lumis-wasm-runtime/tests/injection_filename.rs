//! Runs from `lumis-wasm-runtime`, which takes `lumis-core` with no `lang-*`
//! feature, so it also fails if the glob table ever becomes gated.

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
        fixture.cases.len() >= 15,
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

#![cfg(feature = "all-languages")]

use lumis::languages;
use lumis::languages::Language;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct DetectionCase {
    name: String,
    hint: Option<String>,
    source: String,
    expected: String,
}

#[derive(Debug, Deserialize)]
struct LookupCase {
    input: String,
    expected: Option<String>,
}

#[test]
fn shared_language_lookup_cases() {
    let cases: Vec<LookupCase> =
        serde_json::from_str(include_str!("../../../fixtures/language-lookup.json"))
            .expect("language lookup fixture parses");
    assert!(cases.len() >= 24, "language lookup fixture looks truncated");

    for case in cases {
        let actual = languages::get(&case.input).map(|language| language.id);
        assert_eq!(actual, case.expected.as_deref(), "{:?}", case.input);
    }
}

#[test]
fn shared_language_detection_cases() {
    let cases: Vec<DetectionCase> =
        serde_json::from_str(include_str!("../../../fixtures/language-detection.json"))
            .expect("language detection fixture parses");
    assert!(
        cases.len() >= 20,
        "language detection fixture looks truncated: {} cases",
        cases.len()
    );

    for case in cases {
        let actual = Language::guess(case.hint.as_deref(), &case.source).id_name();
        assert_eq!(actual, case.expected, "{}", case.name);
    }
}

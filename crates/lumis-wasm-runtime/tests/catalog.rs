use lumis_wasm_runtime::catalog::{find, LANGUAGES, LANGUAGE_PACKAGE_VERSION_RANGE};

#[test]
fn catalog_resolves_ids_and_aliases() {
    assert_eq!(find("javascript").unwrap().id, "javascript");
    assert_eq!(find("JS").unwrap().id, "javascript");
    assert!(find("not-a-language").is_none());
}

#[test]
fn catalog_contains_only_stable_package_mapping() {
    let javascript = find("javascript").unwrap();
    assert_eq!(javascript.package_name, "@lumis-sh/wasm-javascript");
    assert!(LANGUAGES.len() > 100);
    assert_eq!(LANGUAGE_PACKAGE_VERSION_RANGE, "0.26");
}

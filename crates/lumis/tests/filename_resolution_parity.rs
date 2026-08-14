//! `catalog::find_by_filename` against `Language::from_str`, over every glob.
//!
//! Two resolvers read the same globs out of `languages.toml`: `lumis-core`
//! generates a `BTreeMap` for the static enum, and the catalog generates a list
//! for the dynamic runtimes, which cannot depend on `lumis-core` because its
//! language data is feature-gated. Nothing but this test makes them agree.
//!
//! They already disagreed once. Taking the catalog's own order picked `objc` for
//! `*.m` while `Language::from_str` picked `matlab`, so `lumis highlight app.m`
//! and a diff of `app.m` highlighted as different languages.

use lumis::languages::Language;
use lumis_wasm_runtime::catalog;
use std::str::FromStr;

#[test]
fn every_catalog_glob_resolves_the_same_in_both() {
    let mut checked = 0usize;
    let mut ambiguous = 0usize;

    for entry in catalog::LANGUAGES {
        for glob in entry.globs {
            // `*.rs` stands in for a file named `x.rs`; a literal glob such as
            // `Dockerfile` is already a file name.
            let path = glob.replace('*', "x");

            let catalog_id = catalog::find_by_filename(&path).map(|found| found.id);
            let core_id = Language::from_str(&path).ok().map(|found| found.id_name());

            assert_eq!(
                catalog_id, core_id,
                "{path:?} (declared by {}) resolves differently in the catalog and lumis-core",
                entry.id
            );

            if catalog_id != Some(entry.id) {
                ambiguous += 1;
            }
            checked += 1;
        }
    }

    assert!(
        checked > 200,
        "the glob corpus did not load: {checked} globs"
    );
    // Extensions more than one language claims are the whole reason this test
    // exists, so a corpus without any of them proves nothing.
    assert!(
        ambiguous > 0,
        "no contested glob in {checked}: the corpus can no longer catch a precedence change"
    );
}

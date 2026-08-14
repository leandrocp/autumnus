//! `language_id_for_filename` against `Language::from_str`, over every glob.
//!
//! One table in `lumis-core` answers both, but `Language::from_str` filters it
//! by the `lang-*` features compiled in. With every language on, the filter must
//! be invisible: the id the dynamic runtimes resolve has to be the language the
//! static crate resolves, or `lumis highlight app.m` and a diff of `app.m`
//! highlight as different languages.
//!
//! That is not hypothetical. A second glob table in the catalog, ordered by
//! `languages.toml` rather than by id, answered `*.m` with objc while this one
//! answered matlab.

use lumis::languages::{language_id_for_filename, Language};
use std::str::FromStr;

#[test]
fn every_glob_resolves_the_same_through_both_views() {
    let mut checked = 0usize;
    let mut contested = 0usize;

    for language in Language::iter() {
        for glob in language.globs() {
            // `*.rs` stands in for a file named `x.rs`; a literal glob such as
            // `Dockerfile` is already a file name.
            let path = glob.replace('*', "x");

            let resolved = language_id_for_filename(&path);
            let parsed = Language::from_str(&path).ok().map(|found| found.id_name());

            assert_eq!(
                resolved,
                parsed,
                "{path:?} (declared by {}) resolves differently through the two views",
                language.id_name()
            );

            if resolved != Some(language.id_name()) {
                contested += 1;
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
        contested > 0,
        "no contested glob in {checked}: the corpus can no longer catch a precedence change"
    );
}

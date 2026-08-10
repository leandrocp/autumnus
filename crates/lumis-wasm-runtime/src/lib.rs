//! Tree-sitter highlighting shared by Lumis runtimes.

macro_rules! define_catalog {
    (
        package_version_range: $package_version_range:literal,
        languages: {
            $(
                $id:literal => {
                    aliases: [$($alias:literal),* $(,)?],
                    package_name: $package_name:literal
                }
            ),* $(,)?
        },
        bundles: {
            $($bundle:literal => [$($member:literal),* $(,)?]),* $(,)?
        } $(,)?
    ) => {
        #[derive(Clone, Copy, Debug, Eq, PartialEq)]
        pub struct LanguagePackageRef {
            pub id: &'static str,
            pub aliases: &'static [&'static str],
            pub package_name: &'static str,
        }

        /// npm range accepted by this runtime's Tree-sitter ABI.
        pub const LANGUAGE_PACKAGE_VERSION_RANGE: &str = $package_version_range;

        pub static LANGUAGES: &[LanguagePackageRef] = &[
            $(
                LanguagePackageRef {
                    id: $id,
                    aliases: &[$($alias),*],
                    package_name: $package_name,
                },
            )*
        ];

        /// The language sets the `@lumis-sh/wasm-bundle-*` packages publish, so
        /// every runtime can name the same group instead of listing members.
        pub static BUNDLES: &[(&str, &[&str])] = &[
            $(($bundle, &[$($member),*]),)*
        ];

        pub fn find(name: &str) -> Option<&'static LanguagePackageRef> {
            LANGUAGES.iter().find(|entry| {
                entry.id.eq_ignore_ascii_case(name)
                    || entry
                        .aliases
                        .iter()
                        .any(|alias| alias.eq_ignore_ascii_case(name))
            })
        }
    };
}

#[cfg(feature = "wasm")]
pub mod brackets;
pub mod catalog;
pub mod package;
pub mod store;
pub mod tree_sitter_highlight;

#[cfg(feature = "wasm")]
mod runtime;

#[cfg(feature = "wasm")]
pub use brackets::{
    bracket_pairs, capture_indices, colorize_bracket_pairs, BracketPair, RainbowRange,
    RAINBOW_BRACKET_SCOPES, RAINBOW_SCOPE_INDICES,
};
pub use package::{
    grammar_name, sha256_hex, LanguagePackage, LanguagePackageError, PackagedLanguage,
    ParserMetadata,
};
#[cfg(feature = "wasm")]
pub use runtime::{
    set_compile_cache_dir, HighlightOptions, HighlightOutput, InjectionResolution, LanguageSpec,
    Runtime, RuntimeError,
};
#[cfg(feature = "wasm")]
pub use store::HttpFetcher;
pub use store::{
    package_suffix, parser_filename, write_atomic, Fetcher, LanguageStore, NoNetwork, StoreConfig,
    StoreError,
};

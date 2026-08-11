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

        /// Members of `bundle-<name>`, accepting `-` or `_` between words so
        /// Elixir's `:bundle_web_extra` and the CLI's `bundle-web-extra` reach
        /// the same entry.
        pub fn bundle_members(name: &str) -> Option<&'static [&'static str]> {
            fn separator_insensitive_eq(a: u8, b: u8) -> bool {
                let normalize =
                    |byte: u8| if byte == b'_' { b'-' } else { byte.to_ascii_lowercase() };
                normalize(a) == normalize(b)
            }

            let suffix = name
                .strip_prefix("bundle-")
                .or_else(|| name.strip_prefix("bundle_"))?;

            BUNDLES.iter().find_map(|(bundle, members)| {
                let matches = bundle.len() == suffix.len()
                    && bundle
                        .bytes()
                        .zip(suffix.bytes())
                        .all(|(a, b)| separator_insensitive_eq(a, b));
                matches.then_some(*members)
            })
        }

        /// Expand every `bundle-<name>` token into its members, leaving other
        /// names alone. Returns the first name that looks like a bundle but is
        /// not one.
        pub fn expand_bundles<'a>(
            names: impl IntoIterator<Item = &'a str>,
        ) -> Result<Vec<String>, String> {
            let mut expanded = Vec::new();

            for name in names {
                match bundle_members(name) {
                    Some(members) => expanded.extend(members.iter().map(|m| (*m).to_string())),
                    None if name.starts_with("bundle-") || name.starts_with("bundle_") => {
                        return Err(name.to_string())
                    }
                    None => expanded.push(name.to_string()),
                }
            }

            expanded.dedup();
            Ok(expanded)
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
    lowest_compatible_package_version, package_suffix, parser_filename, write_atomic, Fetcher,
    LanguageStore, NoNetwork, StoreConfig, StoreError,
};

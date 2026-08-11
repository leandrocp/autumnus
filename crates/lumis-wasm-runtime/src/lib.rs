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

        /// `-` and `_` are interchangeable and case is ignored, so Elixir's
        /// `:bundle_web_extra` and the CLI's `bundle-web-extra` are one name.
        fn normalize_bundle(name: &str) -> String {
            name.to_ascii_lowercase().replace('_', "-")
        }

        /// The `bundle-` prefix, however the caller spelled it.
        fn strip_bundle_prefix(name: &str) -> Option<&str> {
            let (prefix, suffix) = name.split_at_checked("bundle-".len())?;
            matches!(normalize_bundle(prefix).as_str(), "bundle-").then_some(suffix)
        }

        /// Members of `bundle-<name>`, or `None` when the name is not a bundle.
        ///
        /// ```
        /// use lumis_wasm_runtime::catalog;
        ///
        /// assert!(catalog::bundle_members("bundle-web").is_some());
        /// assert!(catalog::bundle_members("bundle_web").is_some());
        /// assert!(catalog::bundle_members("rust").is_none());
        /// ```
        pub fn bundle_members(name: &str) -> Option<&'static [&'static str]> {
            let wanted = normalize_bundle(strip_bundle_prefix(name)?);

            BUNDLES
                .iter()
                .find_map(|(bundle, members)| (normalize_bundle(bundle) == wanted).then_some(*members))
        }

        /// Expand every `bundle-<name>` token into its members, leaving other
        /// names alone and dropping repeats.
        ///
        /// ```
        /// use lumis_wasm_runtime::catalog;
        ///
        /// let expanded = catalog::expand_bundles(["bundle-web", "css"]).unwrap();
        /// assert!(expanded.contains(&"css".to_string()));
        /// assert_eq!(expanded.iter().filter(|name| *name == "css").count(), 1);
        ///
        /// assert!(catalog::expand_bundles(["bundle-nope"]).is_err());
        /// ```
        pub fn expand_bundles<'a>(
            names: impl IntoIterator<Item = &'a str>,
        ) -> Result<Vec<String>, crate::UnknownBundle> {
            let mut expanded = Vec::new();
            let mut seen = std::collections::HashSet::new();

            for name in names {
                match bundle_members(name) {
                    Some(members) => expanded.extend(members.iter().map(|m| (*m).to_string())),
                    None if strip_bundle_prefix(name).is_some() => {
                        return Err(crate::UnknownBundle(name.to_string()))
                    }
                    None => expanded.push(name.to_string()),
                }
            }

            // `Vec::dedup` only collapses adjacent equals, so a bundle followed
            // by one of its own members would cache that member twice.
            expanded.retain(|name| seen.insert(name.clone()));
            Ok(expanded)
        }
    };
}

/// A name spelled like `bundle-<name>` that names no bundle.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct UnknownBundle(String);

impl UnknownBundle {
    /// The name as the caller spelled it.
    pub fn name(&self) -> &str {
        &self.0
    }
}

impl std::fmt::Display for UnknownBundle {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "unknown bundle '{}'", self.0)
    }
}

impl std::error::Error for UnknownBundle {}

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

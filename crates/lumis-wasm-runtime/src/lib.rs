//! Tree-sitter highlighting shared by Lumis runtimes.

macro_rules! define_catalog {
    (
        $(
            $id:literal => {
                aliases: [$($alias:literal),* $(,)?],
                package_name: $package_name:literal
            }
        ),* $(,)?
    ) => {
        #[derive(Clone, Copy, Debug, Eq, PartialEq)]
        pub struct LanguagePackageRef {
            pub id: &'static str,
            pub aliases: &'static [&'static str],
            pub package_name: &'static str,
        }

        pub static LANGUAGES: &[LanguagePackageRef] = &[
            $(
                LanguagePackageRef {
                    id: $id,
                    aliases: &[$($alias),*],
                    package_name: $package_name,
                },
            )*
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

pub mod catalog;
pub mod package;
pub mod tree_sitter_highlight;

#[cfg(feature = "wasm")]
mod runtime;

pub use package::{
    sha256_hex, LanguagePackage, LanguagePackageError, PackagedLanguage, ParserMetadata,
    LANGUAGE_PACKAGE_FORMAT_VERSION,
};
#[cfg(feature = "wasm")]
pub use runtime::{LanguageSpec, Runtime, RuntimeError};

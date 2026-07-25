//! Tree-sitter highlighting shared by Lumis runtimes.

pub mod catalog;
pub mod package;
pub mod tree_sitter_highlight;

#[cfg(feature = "wasm")]
mod runtime;

pub use package::{
    LanguagePackage, LanguagePackageError, PackagedLanguage, ParserMetadata,
    LANGUAGE_PACKAGE_FORMAT_VERSION,
};
#[cfg(feature = "wasm")]
pub use runtime::{LanguageSpec, Runtime, RuntimeError};

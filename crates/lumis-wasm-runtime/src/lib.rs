//! Tree-sitter highlighting shared by Lumis runtimes.

pub mod tree_sitter_highlight;

#[cfg(feature = "wasm")]
mod runtime;

#[cfg(feature = "wasm")]
pub use runtime::{LanguageSpec, Runtime, RuntimeError};

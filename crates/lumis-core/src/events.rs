//! Highlight event types for the rendering pipeline.
//!
//! These events represent the output of syntax highlighting (from tree-sitter or any other source)
//! in a format that is independent of tree-sitter's C FFI types. Formatters in lumis-core consume
//! these events to produce HTML, terminal output, etc.

/// A single step in rendering a syntax-highlighted document.
///
/// This enum mirrors tree-sitter's `HighlightEvent` but uses plain Rust types,
/// making it usable without any tree-sitter dependency.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum HighlightEvent {
    /// A highlight scope begins.
    ///
    /// `scope_index` is an index into the `HIGHLIGHT_NAMES` array.
    /// `language` is the language name this highlight belongs to (e.g., "rust", "markdown").
    Start {
        scope_index: usize,
        language: String,
    },
    /// A range of the source text that should be included in the output.
    ///
    /// `start` and `end` are byte offsets into the source string.
    Source { start: usize, end: usize },
    /// A highlight scope ends.
    End,
}

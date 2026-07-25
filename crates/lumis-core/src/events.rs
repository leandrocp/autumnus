//! Highlight event types for the rendering pipeline.
//!
//! These events represent the output of syntax highlighting (from tree-sitter or any other source)
//! in a format that is independent of tree-sitter's C FFI types. Formatters in lumis-core consume
//! these events to produce HTML, terminal output, etc.

use crate::annotations::ResolvedAnnotation;

/// A single step in rendering syntax-highlighted source.
///
/// This enum mirrors tree-sitter's `HighlightEvent` but uses plain Rust types,
/// making it usable without any tree-sitter dependency. Lumis can enrich the
/// stream with caller-provided events before a formatter consumes it.
#[derive(Debug, PartialEq, Eq)]
pub enum HighlightEvent<'a, T = ()> {
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
    /// A caller-provided annotation begins.
    AnnotationStart {
        /// The annotation resolved to the offset range consumed by formatters.
        annotation: ResolvedAnnotation<'a, T>,
    },
    /// The current caller-provided annotation ends.
    AnnotationEnd,
}

impl<T> Clone for HighlightEvent<'_, T> {
    fn clone(&self) -> Self {
        match self {
            Self::Start {
                scope_index,
                language,
            } => Self::Start {
                scope_index: *scope_index,
                language: language.clone(),
            },
            Self::Source { start, end } => Self::Source {
                start: *start,
                end: *end,
            },
            Self::End => Self::End,
            Self::AnnotationStart { annotation } => Self::AnnotationStart {
                annotation: annotation.clone(),
            },
            Self::AnnotationEnd => Self::AnnotationEnd,
        }
    }
}

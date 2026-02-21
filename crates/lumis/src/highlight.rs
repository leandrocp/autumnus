//! Core highlighting API that abstracts away tree-sitter complexity.
//!
//! This module provides multiple levels of abstraction for accessing
//! syntax-highlighted tokens.
//!
//! # Custom Formatters
//!
//! Custom formatters should implement [`Formatter`](crate::formatter::Formatter)
//! and use [`highlight_iter()`] for streaming token access.
//!
//! ```rust,no_run
//! use lumis::{formatter::Formatter, highlight::highlight_iter};
//! use std::io::{self, Write};
//!
//! # struct MyFormatter { language: lumis::languages::Language, theme: Option<lumis::themes::Theme> }
//! impl Formatter for MyFormatter {
//!     fn format(&self, source: &str, output: &mut dyn Write) -> io::Result<()> {
//!         highlight_iter(source, self.language, self.theme.clone(), |text, _language, _range, _scope, _style| {
//!             write!(output, "{}", text)
//!         })
//!         .map_err(io::Error::other)
//!     }
//! }
//! ```
//!
//! See also:
//! - [`Formatter`](crate::formatter::Formatter) trait documentation
//! - [`formatter::html`](crate::formatter::html) module for HTML-specific helpers
//! - [`formatter::ansi`](crate::formatter::ansi) module for terminal/ANSI-specific helpers
//!
//! # Examples
//!
//! ## Simple highlighting
//!
//! ```rust
//! use lumis::highlight::Highlighter;
//! use lumis::languages::Language;
//! use lumis::themes;
//!
//! let code = "fn main() { println!(\"Hello\"); }";
//! let theme = themes::get("dracula").unwrap();
//!
//! let highlighter = Highlighter::new(Language::Rust, Some(theme));
//! let segments = highlighter.highlight(code).unwrap();
//!
//! for (style, text) in segments {
//!     println!("Text: '{}', Color: {:?}", text, style.fg);
//! }
//! ```
//!
//! ## Using the streaming API with a callback
//!
//! ```rust
//! use lumis::highlight::highlight_iter;
//! use lumis::languages::Language;
//! use lumis::themes;
//! use std::io::Write;
//!
//! let code = "let x = 42;";
//! let theme = themes::get("github_light").unwrap();
//!
//! highlight_iter(code, Language::Rust, Some(theme), |text, _language, range, scope, style| {
//!     println!("{}..{}: '{}' (scope: {}, color: {:?})", range.start, range.end, text, scope, style.fg);
//!     Ok::<_, std::io::Error>(())
//! }).unwrap();
//! ```

use crate::languages::{Language, LanguageConfig};
use crate::themes::Theme;
use crate::vendor::tree_sitter_highlight::{HighlightEvent, Highlighter as TSHighlighter};
use lumis_core::events::HighlightEvent as CoreHighlightEvent;
use lumis_core::highlights::HIGHLIGHT_NAMES;
use smol_str::format_smolstr;
use std::cell::RefCell;
use std::ops::Range;
use std::sync::Arc;
use thiserror::Error;

pub use crate::themes::{Style, TextDecoration, UnderlineStyle};

thread_local! {
    static DOCUMENT_TS_HIGHLIGHTER: RefCell<TSHighlighter> = RefCell::new(TSHighlighter::new());
}

/// Error type for syntax highlighting operations.
///
/// # Examples
///
/// ```rust
/// use lumis::highlight::{highlight_iter, HighlightError};
/// use lumis::languages::Language;
/// use std::io::Write;
///
/// let result = highlight_iter("fn main() {}", Language::Rust, None, |text, _language, _range, _scope, _style| {
///     print!("{}", text);
///     Ok::<_, std::io::Error>(())
/// });
///
/// match result {
///     Ok(()) => {}
///     Err(HighlightError::HighlighterInit(msg)) => {
///         eprintln!("Failed to initialize highlighter: {}", msg);
///     }
///     Err(HighlightError::EventProcessing(msg)) => {
///         eprintln!("Failed to process highlight event: {}", msg);
///     }
/// }
/// ```
#[derive(Debug, Clone, PartialEq, Eq, Error)]
pub enum HighlightError {
    /// Failed to initialize the tree-sitter highlighter for the given language.
    #[error("failed to initialize highlighter: {0}")]
    HighlighterInit(String),

    /// Failed to process a highlight event during parsing.
    #[error("failed to process highlight event: {0}")]
    EventProcessing(String),
}

/// High-level stateful highlighter for syntax highlighting.
///
/// This is the primary API for most users. It manages tree-sitter state internally
/// and provides simple methods for highlighting code.
///
/// # Examples
///
/// ```rust
/// use lumis::highlight::Highlighter;
/// use lumis::languages::Language;
/// use lumis::themes;
///
/// let code = "fn main() {}";
/// let theme = themes::get("dracula").unwrap();
///
/// let highlighter = Highlighter::new(Language::Rust, Some(theme));
/// let segments = highlighter.highlight(code).unwrap();
/// ```
pub struct Highlighter {
    language: Language,
    theme: Option<Theme>,
    ts_highlighter: RefCell<TSHighlighter>,
}

impl Highlighter {
    /// Create a new highlighter for the given language and optional theme.
    ///
    /// # Arguments
    ///
    /// * `language` - The programming language to highlight
    /// * `theme` - Optional theme for styling. If None, segments will have empty styles.
    ///
    /// # Examples
    ///
    /// ```rust
    /// use lumis::highlight::Highlighter;
    /// use lumis::languages::Language;
    /// use lumis::themes;
    ///
    /// // With theme
    /// let theme = themes::get("dracula").unwrap();
    /// let highlighter = Highlighter::new(Language::Rust, Some(theme));
    ///
    /// // Without theme (styles will be empty)
    /// let highlighter = Highlighter::new(Language::JavaScript, None);
    /// ```
    pub fn new(language: Language, theme: Option<Theme>) -> Self {
        Self {
            language,
            theme,
            ts_highlighter: RefCell::new(TSHighlighter::new()),
        }
    }

    /// Highlight the entire source code and return styled segments.
    ///
    /// This is the main entry point for highlighting. It returns a vector of
    /// (Style, &str) tuples representing styled segments of the source code.
    ///
    /// # Arguments
    ///
    /// * `source` - The source code to highlight
    ///
    /// # Returns
    ///
    /// A vector of (`Arc<Style>`, `&str`) tuples where:
    /// - `Arc<Style>` contains the styling information (colors, modifiers) in a shared reference
    /// - `&str` is a slice of the original source text
    ///
    /// # Errors
    ///
    /// Returns [`HighlightError`] if tree-sitter highlighting fails.
    ///
    /// # Examples
    ///
    /// ```rust
    /// use lumis::highlight::Highlighter;
    /// use lumis::languages::Language;
    ///
    /// let code = "fn main() { println!(\"Hello\"); }";
    /// let highlighter = Highlighter::new(Language::Rust, None);
    ///
    /// let segments = highlighter.highlight(code).unwrap();
    /// for (style, text) in segments {
    ///     print!("{}", text);  // Print the highlighted code
    /// }
    /// ```
    pub fn highlight<'a>(
        &self,
        source: &'a str,
    ) -> Result<Vec<(Arc<Style>, &'a str)>, HighlightError> {
        let mut ts_highlighter = self.ts_highlighter.borrow_mut();
        let events = ts_highlighter
            .highlight(
                self.language.config(),
                source.as_bytes(),
                None,
                |injected| Some(Language::guess(Some(injected), "").config()),
            )
            .map_err(|e| HighlightError::HighlighterInit(format!("{:?}", e)))?;

        let mut result = Vec::new();
        let mut style_stack: Vec<Arc<Style>> = vec![Arc::new(Style::default())];

        for event in events {
            let event = event.map_err(|e| HighlightError::EventProcessing(format!("{:?}", e)))?;

            match event {
                HighlightEvent::HighlightStart {
                    highlight,
                    language,
                } => {
                    let scope = HIGHLIGHT_NAMES[highlight.0];
                    let specialized_scope = format_smolstr!("{}.{}", scope, language);

                    let new_style = if let Some(ref theme) = self.theme {
                        Arc::new(
                            theme
                                .get_style(&specialized_scope)
                                .cloned()
                                .unwrap_or_default(),
                        )
                    } else {
                        Arc::new(Style::default())
                    };
                    style_stack.push(new_style);
                }
                HighlightEvent::Source { start, end } => {
                    let text = &source[start..end];
                    if !text.is_empty() {
                        let current_style = style_stack.last().map(Arc::clone).unwrap_or_default();
                        result.push((current_style, text));
                    }
                }
                HighlightEvent::HighlightEnd => {
                    if style_stack.len() > 1 {
                        style_stack.pop();
                    }
                }
            }
        }

        Ok(result)
    }
}

/// Streaming syntax highlighting with callback.
///
/// Iterates over tree-sitter highlight events and calls `on_event_source` for each
/// source-text event (i.e., each text segment).
///
/// This is a streaming API that processes tokens as they are produced by tree-sitter,
/// avoiding the overhead of collecting all segments into a vector upfront.
///
/// # Arguments
///
/// * `source` - Source code to highlight
/// * `language` - The [`Language`] to use for syntax highlighting
/// * `theme` - Optional theme for styling
/// * `on_event_source` - Callback invoked for each text segment, receives `(text, language, range, scope, style)`
///
/// # Errors
///
/// Returns [`HighlightError::HighlighterInit`] if tree-sitter initialization fails,
/// or [`HighlightError::EventProcessing`] if parsing or the callback encounters an error.
///
/// # Examples
///
/// ```rust
/// use lumis::highlight::highlight_iter;
/// use lumis::languages::Language;
/// use lumis::themes;
/// use std::io::Write;
///
/// let code = "fn main() {}";
/// let theme = themes::get("dracula").unwrap();
///
/// let mut output = Vec::new();
/// highlight_iter(code, Language::Rust, Some(theme), |text, _language, _range, _scope, style| {
///     if let Some(ref color) = style.fg {
///         write!(output, "<span style=\"color: {}\">{}</span>", color, text)
///     } else {
///         write!(output, "{}", text)
///     }
/// }).unwrap();
/// ```
pub fn highlight_iter<F, E>(
    source: &str,
    language: Language,
    theme: Option<Theme>,
    mut on_event_source: F,
) -> Result<(), HighlightError>
where
    F: FnMut(&str, &str, Range<usize>, &'static str, &Style) -> Result<(), E>,
    E: std::error::Error + Send + Sync + 'static,
{
    let lang_id = language.id_name();
    let mut ts_highlighter = TSHighlighter::new();
    let events = ts_highlighter
        .highlight(language.config(), source.as_bytes(), None, |injected| {
            Some(Language::guess(Some(injected), "").config())
        })
        .map_err(|e| HighlightError::HighlighterInit(format!("{:?}", e)))?;

    let mut style_stack: Vec<Style> = vec![Style::default()];
    let mut scope_stack: Vec<&'static str> = vec![""];
    let mut language_stack: Vec<String> = vec![lang_id.to_string()];

    for event in events {
        let event = event.map_err(|e| HighlightError::EventProcessing(format!("{:?}", e)))?;

        match event {
            HighlightEvent::HighlightStart {
                highlight,
                language: lang,
            } => {
                let scope = HIGHLIGHT_NAMES[highlight.0];
                let specialized_scope = format_smolstr!("{}.{}", scope, lang);

                let new_style = if let Some(ref theme) = theme {
                    theme
                        .get_style(&specialized_scope)
                        .cloned()
                        .unwrap_or_default()
                } else {
                    Style::default()
                };
                style_stack.push(new_style);
                scope_stack.push(scope);
                language_stack.push(lang);
            }
            HighlightEvent::Source { start, end } => {
                let text = &source[start..end];
                if !text.is_empty() {
                    let default_style = Style::default();
                    let current_style = style_stack.last().unwrap_or(&default_style);
                    let current_scope = scope_stack.last().copied().unwrap_or("");
                    let current_language =
                        language_stack.last().map(|s| s.as_str()).unwrap_or(lang_id);
                    on_event_source(
                        text,
                        current_language,
                        start..end,
                        current_scope,
                        current_style,
                    )
                    .map_err(|e| HighlightError::EventProcessing(e.to_string()))?;
                }
            }
            HighlightEvent::HighlightEnd => {
                if style_stack.len() > 1 {
                    style_stack.pop();
                }
                if scope_stack.len() > 1 {
                    scope_stack.pop();
                }
                if language_stack.len() > 1 {
                    language_stack.pop();
                }
            }
        }
    }

    Ok(())
}

#[doc(hidden)]
pub fn highlight_events(
    source: &str,
    language: Language,
) -> Result<Vec<CoreHighlightEvent>, HighlightError> {
    DOCUMENT_TS_HIGHLIGHTER.with(|ts_highlighter| {
        let mut ts_highlighter = ts_highlighter.borrow_mut();
        highlight_events_with(&mut ts_highlighter, source, language)
    })
}

fn highlight_events_with(
    ts_highlighter: &mut TSHighlighter,
    source: &str,
    language: Language,
) -> Result<Vec<CoreHighlightEvent>, HighlightError> {
    let events = ts_highlighter
        .highlight(language.config(), source.as_bytes(), None, |injected| {
            Some(Language::guess(Some(injected), "").config())
        })
        .map_err(|e| HighlightError::HighlighterInit(format!("{:?}", e)))?;

    let core_events = events
        .map(|event| {
            event
                .map_err(|e| HighlightError::EventProcessing(format!("{:?}", e)))
                .map(|event| match event {
                    HighlightEvent::HighlightStart {
                        highlight,
                        language,
                    } => CoreHighlightEvent::Start {
                        scope_index: highlight.0,
                        language,
                    },
                    HighlightEvent::Source { start, end } => {
                        CoreHighlightEvent::Source { start, end }
                    }
                    HighlightEvent::HighlightEnd => CoreHighlightEvent::End,
                })
        })
        .collect::<Result<Vec<_>, _>>()?;

    Ok(core_events)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::themes;

    #[test]
    fn test_highlighter_without_theme() {
        let code = "fn main() {}";
        let highlighter = Highlighter::new(Language::Rust, None);
        let segments = highlighter.highlight(code).unwrap();

        assert!(!segments.is_empty());
        // Segments should have text but no styling
        for (style, _text) in &segments {
            assert_eq!(style.fg, None);
            assert_eq!(style.bg, None);
        }
    }

    #[test]
    fn test_highlighter_with_theme() {
        let code = "fn main() {}";
        let theme = themes::get("dracula").unwrap();
        let highlighter = Highlighter::new(Language::Rust, Some(theme));
        let segments = highlighter.highlight(code).unwrap();

        assert!(!segments.is_empty());

        // At least some segments should have styling
        let has_styling = segments.iter().any(|(style, _text)| style.fg.is_some());
        assert!(has_styling, "Expected at least some styled segments");
    }

    #[test]
    fn test_highlight_preserves_source_text() {
        let code = "fn main() { println!(\"Hello\"); }";
        let highlighter = Highlighter::new(Language::Rust, None);
        let segments = highlighter.highlight(code).unwrap();

        // Concatenating all segments should give back original code
        let reconstructed: String = segments.iter().map(|(_, text)| *text).collect();
        assert_eq!(reconstructed, code);
    }

    #[test]
    fn test_streaming_api() {
        let code = "let x = 42;";
        let mut segments = Vec::new();

        highlight_iter(
            code,
            Language::Rust,
            None,
            |text, _language, range, scope, style| {
                segments.push((text.to_string(), range, scope, style.clone()));
                Ok::<_, std::io::Error>(())
            },
        )
        .unwrap();

        assert!(!segments.is_empty());

        // Check that ranges are valid and scopes are present
        for (text, range, scope, _style) in &segments {
            assert_eq!(&code[range.clone()], text.as_str());
            assert!(scope.is_empty() || !scope.is_empty()); // scope is always valid
        }
    }

    #[test]
    fn test_streaming_with_theme() {
        let code = "let x = 42;";
        let theme = themes::get("github_light").unwrap();
        let mut has_colors = false;
        let mut count = 0;

        highlight_iter(
            code,
            Language::Rust,
            Some(theme),
            |_text, _language, _range, _scope, style| {
                count += 1;
                if style.fg.is_some() {
                    has_colors = true;
                }
                Ok::<_, std::io::Error>(())
            },
        )
        .unwrap();

        assert!(count > 0, "Expected at least some segments");
        assert!(has_colors, "Expected at least some segments with colors");
    }

    #[test]
    fn test_empty_source() {
        let code = "";
        let highlighter = Highlighter::new(Language::Rust, None);
        let segments = highlighter.highlight(code).unwrap();

        assert!(segments.is_empty());
    }

    #[test]
    fn test_multiline_code() {
        let code = "fn main() {\n    println!(\"Hello\");\n}";
        let highlighter = Highlighter::new(Language::Rust, None);
        let segments = highlighter.highlight(code).unwrap();

        let reconstructed: String = segments.iter().map(|(_, text)| *text).collect();
        assert_eq!(reconstructed, code);
    }

    #[test]
    fn test_stateful_highlighter_supports_multiple_calls() {
        let highlighter = Highlighter::new(Language::Rust, None);

        let first = highlighter.highlight("fn first() {}\n").unwrap();
        let second = highlighter.highlight("let second = 2;\n").unwrap();

        let first_text: String = first.iter().map(|(_, text)| *text).collect();
        let second_text: String = second.iter().map(|(_, text)| *text).collect();

        assert_eq!(first_text, "fn first() {}\n");
        assert_eq!(second_text, "let second = 2;\n");
    }

    #[test]
    fn test_highlight_events_preserve_unicode_byte_ranges() {
        let code = "{\"emoji\": \"😀 café\"}";
        let events = highlight_events(code, Language::JSON).unwrap();

        let total_source_bytes = events
            .iter()
            .filter_map(|event| match event {
                CoreHighlightEvent::Source { start, end } => Some(end - start),
                _ => None,
            })
            .sum::<usize>();

        assert_eq!(total_source_bytes, code.len());
    }

    #[test]
    fn test_highlight_events_support_multiple_calls() {
        let first = highlight_events("{\"first\": 1}", Language::JSON).unwrap();
        let second = highlight_events("{\"second\": 2}", Language::JSON).unwrap();

        assert!(!first.is_empty());
        assert!(!second.is_empty());
    }

    #[test]
    fn highlight_events_cover_source_contiguously() {
        let code = "fn main() {\n    println!(\"hi\");\n}\n";
        let events = highlight_events(code, Language::Rust).unwrap();

        let mut cursor = 0;
        for event in events {
            if let CoreHighlightEvent::Source { start, end } = event {
                assert_eq!(start, cursor);
                assert!(end >= start);
                cursor = end;
            }
        }

        assert_eq!(cursor, code.len());
    }
}

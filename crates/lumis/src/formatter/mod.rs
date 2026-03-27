//! Formatter implementations for generating syntax highlighted output.
//!
//! This module provides four different formatters for rendering syntax highlighted code:
//! - [`html_inline`] - HTML output with inline CSS styles (single theme)
//! - [`html_multi_themes`] - HTML output with inline CSS styles (multiple themes)
//! - [`html_linked`] - HTML output with CSS classes (requires external CSS)
//! - [`terminal`] - ANSI color codes for terminal output
//! - [`bbcode`] - BBCode scoped output using highlight scope names as tags
//!
//! # Builder Pattern
//!
//! Each formatter has a dedicated builder that provides a type-safe, ergonomic API:
//! - [`HtmlInlineBuilder`] - Create HTML formatters with inline CSS styles
//! - [`HtmlMultiThemesBuilder`] - Create HTML formatters with multiple theme support
//! - [`HtmlLinkedBuilder`] - Create HTML formatters with CSS classes
//! - [`TerminalBuilder`] - Create terminal formatters with ANSI colors
//! - [`BBCodeScopedBuilder`] - Create BBCode scoped formatters using highlight scope names as tags
//!
//! Builders are exported at the crate root for convenient access:
//! ```rust
//! use lumis::{HtmlInlineBuilder, HtmlMultiThemesBuilder, HtmlLinkedBuilder, TerminalBuilder, BBCodeScopedBuilder};
//! ```
//!
//! # Examples
//!
//! ## Using HtmlInlineBuilder
//!
//! ```rust
//! use lumis::{HtmlInlineBuilder, languages::Language, themes, formatter::Formatter};
//! use std::io::Write;
//!
//! let code = "fn main() { println!(\"Hello\"); }";
//! let theme = themes::get("dracula").unwrap();
//!
//! // HTML with inline styles
//! let formatter = HtmlInlineBuilder::new()
//!     .lang(Language::Rust)
//!     .theme(Some(theme))
//!     .pre_class(Some("code-block".to_string()))
//!     .italic(false)
//!     .include_highlights(false)
//!     .build()
//!     .unwrap();
//!
//! let mut output = Vec::new();
//! formatter.format(code, &mut output).unwrap();
//! let html = String::from_utf8(output).unwrap();
//! ```
//!
//! ## Using HtmlMultiThemesBuilder
//!
//! ```rust
//! use lumis::{HtmlMultiThemesBuilder, languages::Language, themes, formatter::Formatter};
//! use std::collections::HashMap;
//!
//! let code = "fn main() { println!(\"Hello\"); }";
//!
//! let mut themes_map = HashMap::new();
//! themes_map.insert("light".to_string(), themes::get("github_light").unwrap());
//! themes_map.insert("dark".to_string(), themes::get("github_dark").unwrap());
//!
//! // HTML with multiple theme support using CSS variables
//! let formatter = HtmlMultiThemesBuilder::new()
//!     .lang(Language::Rust)
//!     .themes(themes_map)
//!     .default_theme("light")
//!     .build()
//!     .unwrap();
//!
//! let mut output = Vec::new();
//! formatter.format(code, &mut output).unwrap();
//! let html = String::from_utf8(output).unwrap();
//! ```
//!
//! ## Using HtmlLinkedBuilder
//!
//! ```rust
//! use lumis::{HtmlLinkedBuilder, languages::Language, formatter::Formatter};
//! use std::io::Write;
//!
//! let code = "<div>Hello World</div>";
//!
//! let formatter = HtmlLinkedBuilder::new()
//!     .lang(Language::HTML)
//!     .pre_class(Some("my-code".to_string()))
//!     .build()
//!     .unwrap();
//!
//! let mut output = Vec::new();
//! formatter.format(code, &mut output).unwrap();
//! let html = String::from_utf8(output).unwrap();
//! ```
//!
//! ## Using TerminalBuilder
//!
//! ```rust
//! use lumis::{TerminalBuilder, languages::Language, themes, formatter::Formatter};
//! use std::io::Write;
//!
//! let code = "puts 'Hello from Ruby!'";
//! let theme = themes::get("github_light").unwrap();
//!
//! let formatter = TerminalBuilder::new()
//!     .lang(Language::Ruby)
//!     .theme(Some(theme))
//!     .build()
//!     .unwrap();
//!
//! let mut output = Vec::new();
//! formatter.format(code, &mut output).unwrap();
//! let ansi_output = String::from_utf8(output).unwrap();
//! ```
//!
//! ## Line highlighting with HTML formatters
//!
//! ```rust
//! use lumis::{HtmlInlineBuilder, languages::Language, themes, formatter::Formatter};
//! use lumis::formatter::html_inline::{HighlightLines, HighlightLinesStyle};
//! use std::io::Write;
//!
//! let code = "line 1\nline 2\nline 3\nline 4";
//! let theme = themes::get("catppuccin_mocha").unwrap();
//!
//! let highlight_lines = HighlightLines {
//!     lines: vec![1..=1, 3..=4],  // Highlight lines 1, 3, and 4
//!     style: Some(HighlightLinesStyle::Theme),  // Use theme's highlighted style
//!     class: None,
//! };
//!
//! let formatter = HtmlInlineBuilder::new()
//!     .lang(Language::PlainText)
//!     .theme(Some(theme))
//!     .include_highlights(false)
//!     .highlight_lines(Some(highlight_lines))
//!     .build()
//!     .unwrap();
//! ```
//!
//! # Custom Formatters
//!
//! Implement the [`Formatter`] trait to create custom output formats.
//! Use [`highlight_iter()`](crate::highlight::highlight_iter) for streaming token access
//! and the [`html`] / [`ansi`] helper modules to build output consistently with the
//! built-in formatters.
//!
//! See the [examples directory](https://github.com/leandrocp/lumis/tree/main/examples)
//! for custom formatter implementations.

// Originally based on https://github.com/Colonial-Dev/inkjet/tree/da289fa8b68f11dffad176e4b8fabae8d6ac376d/src/formatter

use std::io::{self, Write};

pub mod ansi;
pub mod html;

pub mod html_inline;
pub use html_inline::{HtmlInline, HtmlInlineBuilder};

pub mod html_multi_themes;
pub use html_multi_themes::{HtmlMultiThemes, HtmlMultiThemesBuilder};

pub mod html_linked;
pub use html_linked::{HtmlLinked, HtmlLinkedBuilder};

pub mod terminal;
pub use terminal::{Terminal, TerminalBuilder};

pub mod bbcode;
pub use bbcode::{BBCodeScoped, BBCodeScopedBuilder};

pub use lumis_core::formatter::HtmlElement;

/// Trait for implementing custom syntax highlighting formatters.
///
/// The `Formatter` trait allows you to create custom output formats for syntax highlighted code.
/// It bundles parsing and rendering into a single `format()` call.
///
/// For HTML formatters, see the [`html`] module for helper functions
/// that handle HTML generation, escaping, and styling.
///
/// For terminal/ANSI formatters, see the [`ansi`] module for helper functions
/// that handle ANSI escape sequences and color conversion.
///
/// # Creating Custom Formatters
///
/// Minimal HTML formatter that wraps each token in a colored `<span>`:
///
/// ```rust
/// use lumis::{
///     formatter::Formatter,
///     formatter::html::{open_pre_tag, open_code_tag, closing_tags, span_inline},
///     highlight::highlight_iter,
///     languages::Language,
///     themes,
/// };
/// use std::io::{self, Write};
///
/// struct MinimalHtmlFormatter {
///     language: Language,
///     theme: Option<themes::Theme>,
/// }
///
/// impl Formatter for MinimalHtmlFormatter {
///     fn format(&self, source: &str, output: &mut dyn Write) -> io::Result<()> {
///         open_pre_tag(output, None, self.theme.as_ref())?;
///         open_code_tag(output, &self.language)?;
///         highlight_iter(source, self.language, self.theme.clone(), |text, _language, _range, scope, _style| {
///             write!(output, "{}", span_inline(text, Some(self.language), scope, self.theme.as_ref(), false, false))
///         })
///         .map_err(io::Error::other)?;
///         closing_tags(output)?;
///         Ok(())
///     }
/// }
/// ```
///
/// # See Also
///
/// - [`highlight`](mod@crate::highlight) module - High-level API for accessing styled tokens
/// - [`highlight_iter()`](crate::highlight::highlight_iter) - Streaming callback API
/// - [Examples directory](https://github.com/leandrocp/lumis/tree/main/examples) - Custom formatter implementations
pub trait Formatter: Send + Sync {
    /// Format source code with syntax highlighting.
    ///
    /// This is the main method for generating formatted output. Write the highlighted
    /// code to the provided `output` writer.
    ///
    /// # Arguments
    ///
    /// * `source` - The source code to highlight
    /// * `output` - Writer to send formatted output to
    ///
    /// # Example
    ///
    /// ```rust
    /// use lumis::{formatter::Formatter, HtmlInlineBuilder, languages::Language};
    ///
    /// let formatter = HtmlInlineBuilder::new()
    ///     .lang(Language::Rust)
    ///     .build()
    ///     .unwrap();
    ///
    /// let mut output = Vec::new();
    /// formatter.format("fn main() {}", &mut output).unwrap();
    /// ```
    fn format(&self, source: &str, output: &mut dyn Write) -> io::Result<()>;
}

impl Formatter for Box<dyn Formatter> {
    fn format(&self, source: &str, output: &mut dyn Write) -> io::Result<()> {
        (**self).format(source, output)
    }
}

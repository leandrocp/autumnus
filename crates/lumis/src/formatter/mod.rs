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
//! use lumis::{HtmlInlineBuilder, languages::Language, themes, formatters::Formatter};
//! use std::io::Write;
//!
//! let code = "fn main() { println!(\"Hello\"); }";
//! let theme = themes::get("dracula").unwrap();
//!
//! // HTML with inline styles
//! let formatter = HtmlInlineBuilder::new()
//!     .language(Language::Rust)
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
//! use lumis::{HtmlMultiThemesBuilder, languages::Language, themes, formatters::Formatter};
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
//!     .language(Language::Rust)
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
//! use lumis::{HtmlLinkedBuilder, languages::Language, formatters::Formatter};
//! use std::io::Write;
//!
//! let code = "<div>Hello World</div>";
//!
//! let formatter = HtmlLinkedBuilder::new()
//!     .language(Language::HTML)
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
//! use lumis::{TerminalBuilder, languages::Language, themes, formatters::Formatter};
//! use std::io::Write;
//!
//! let code = "puts 'Hello from Ruby!'";
//! let theme = themes::get("github_light").unwrap();
//!
//! let formatter = TerminalBuilder::new()
//!     .language(Language::Ruby)
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
//! use lumis::{HtmlInlineBuilder, languages::Language, themes, formatters::Formatter};
//! use lumis::formatters::html_inline::{HighlightLines, HighlightLinesStyle};
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
//!     .language(Language::PlainText)
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
//! See the [crate examples](https://github.com/leandrocp/lumis/tree/main/crates/lumis/examples)
//! for custom formatter implementations.

// Originally based on https://github.com/Colonial-Dev/inkjet/tree/da289fa8b68f11dffad176e4b8fabae8d6ac376d/src/formatter

use crate::highlight::{LineView, LineViewBuilder};
use crate::languages::Language;
use std::io::{self, Write};

pub mod ansi;
pub mod html;
pub(crate) mod line_view;

pub mod html_inline;
pub use html_inline::{HtmlInline, HtmlInlineBuilder};

pub mod html_multi_themes;
pub use html_multi_themes::{HtmlMultiThemes, HtmlMultiThemesBuilder};

pub mod html_linked;
pub use html_linked::{HtmlLinked, HtmlLinkedBuilder};

pub mod terminal;
pub use terminal::Background as TerminalBackground;
pub use terminal::{Terminal, TerminalBuilder};

pub mod bbcode;
pub use bbcode::{BBCodeScoped, BBCodeScopedBuilder};

#[deprecated(note = "use `formatters::html::HtmlElement` instead")]
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
///     formatters::Formatter,
///     formatters::html::{closing_tags, open_code_tag, open_pre_tag},
///     highlight::LineView,
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
///     fn language(&self) -> Language {
///         self.language
///     }
///
///     fn render(&self, view: &LineView, output: &mut dyn Write) -> io::Result<()> {
///         open_pre_tag(output, None, self.theme.as_ref())?;
///         open_code_tag(output, &self.language)?;
///         for line in &view.lines {
///             for span in &line.spans {
///                 write!(output, "{}", span.text)?;
///             }
///         }
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
/// - [Crate examples](https://github.com/leandrocp/lumis/tree/main/crates/lumis/examples) - Custom formatter implementations
pub trait Formatter: Send + Sync {
    /// Language used when building a [`LineView`] for this formatter.
    fn language(&self) -> Language;

    /// Apply formatter-owned defaults before the view is built.
    fn prepare_line_view<'a>(&self, _source: &'a str, _builder: &mut LineViewBuilder<'a>) {}

    /// Render a structured highlighted view.
    fn render(&self, view: &LineView, output: &mut dyn Write) -> io::Result<()>;

    /// Build a `LineView` with this formatter's language/defaults, then render it.
    fn format(&self, source: &str, output: &mut dyn Write) -> io::Result<()> {
        let mut builder = LineViewBuilder::new();
        builder.source(source).language(self.language());
        self.prepare_line_view(source, &mut builder);
        let view = builder.build().map_err(io::Error::other)?;
        self.render(&view, output)
    }
}

impl Formatter for Box<dyn Formatter> {
    fn language(&self) -> Language {
        (**self).language()
    }

    fn prepare_line_view<'a>(&self, source: &'a str, builder: &mut LineViewBuilder<'a>) {
        (**self).prepare_line_view(source, builder)
    }

    fn render(&self, view: &LineView, output: &mut dyn Write) -> io::Result<()> {
        (**self).render(view, output)
    }

    fn format(&self, source: &str, output: &mut dyn Write) -> io::Result<()> {
        (**self).format(source, output)
    }
}

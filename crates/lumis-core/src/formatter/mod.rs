//! Formatter implementations for generating syntax highlighted output.
//!
//! This module provides formatters for rendering syntax highlighted code from
//! pre-computed highlight events. The formatters are independent of tree-sitter
//! and work with [`HighlightEvent`] streams.
//!
//! Available formatters:
//! - [`html_inline`] - HTML with inline CSS styles
//! - [`html_multi_themes`] - HTML with multiple theme support
//! - [`html_linked`] - HTML with CSS classes
//! - [`terminal`] - ANSI color codes for terminal output
//! - [`bbcode`] - BBCode scoped output using highlight scope names as tags

use crate::events::HighlightEvent;
use crate::themes::Style;
use std::io::{self, Write};

pub mod ansi;
pub mod html;

pub mod html_inline;
pub use html_inline::{HtmlInline, HtmlInlineBuilder};

pub mod html_multi_themes;
pub use html_multi_themes::{HtmlMultiThemes, HtmlMultiThemesBuilder};

pub mod html_linked;
pub use html_linked::{HtmlLinked, HtmlLinkedBuilder};

pub mod rainbow_brackets;
pub use rainbow_brackets::RainbowBrackets;

pub mod terminal;
pub use terminal::{Background as TerminalBackground, Terminal, TerminalBuilder};

pub mod bbcode;
pub use bbcode::{BBCodeScoped, BBCodeScopedBuilder};

/// Configuration for wrapping the formatted output with custom HTML elements.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct HtmlElement {
    /// The opening HTML tag that will be placed before the formatted code.
    pub open_tag: String,
    /// The closing HTML tag that will be placed after the formatted code.
    pub close_tag: String,
}

/// Trait for overriding the style of tokens during formatting.
///
/// Implementations receive the resolved theme style for each token and can
/// return a modified style. This enables features like rainbow brackets without
/// changing the formatter itself.
///
/// The `state` parameter is a `usize` that the override can use to track
/// information across tokens (e.g., bracket nesting depth). It starts at `0`
/// and is passed mutably to each call.
///
/// # Example
///
/// ```rust
/// use lumis_core::formatter::StyleOverride;
/// use lumis_core::themes::Style;
///
/// struct RainbowBrackets;
///
/// impl StyleOverride for RainbowBrackets {
///     fn override_style(&self, text: &str, scope: &str, base: &Style, state: &mut usize) -> Style {
///         if scope.starts_with("punctuation.bracket") {
///             // ... apply rainbow color based on *state ...
///             Style { fg: Some("#e06c75".to_string()), ..base.clone() }
///         } else {
///             base.clone()
///         }
///     }
/// }
/// ```
pub trait StyleOverride: Send + Sync + std::fmt::Debug {
    /// Return the style to use for this token.
    ///
    /// # Arguments
    ///
    /// * `text` - The source text of the token
    /// * `scope` - The highlight scope name (e.g., `"punctuation.bracket"`)
    /// * `base` - The style resolved from the theme
    /// * `state` - Mutable state that persists across tokens within a single `render` call
    fn override_style(&self, text: &str, scope: &str, base: &Style, state: &mut usize) -> Style;
}

/// Trait for implementing custom syntax highlighting formatters.
///
/// Formatters in lumis-core work with pre-computed highlight events,
/// making them independent of tree-sitter.
pub trait Formatter: Send + Sync {
    /// Format source code using pre-computed highlight events.
    ///
    /// # Arguments
    ///
    /// * `source` - The source code to format
    /// * `events` - Pre-computed highlight events from tree-sitter or any other source
    /// * `output` - Writer to send formatted output to
    fn render(
        &self,
        source: &str,
        events: &[HighlightEvent],
        output: &mut dyn Write,
    ) -> io::Result<()>;
}

impl Formatter for Box<dyn Formatter> {
    fn render(
        &self,
        source: &str,
        events: &[HighlightEvent],
        output: &mut dyn Write,
    ) -> io::Result<()> {
        (**self).render(source, events, output)
    }
}

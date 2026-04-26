//! Terminal formatter with ANSI color codes.
//!
//! This module provides the [`Terminal`] formatter that generates terminal output with
//! ANSI color codes for syntax highlighting. Supports themes and automatic color
//! mapping from theme definitions to terminal colors.
//!
//! # Example Output
//!
//! For the Rust code `fn main() { println!("Hello"); }` with a theme applied,
//! the formatter generates ANSI-colored terminal output like:
//!
//! ```text
//! [0m[38;2;139;233;253mfn[0m [0m[38;2;80;250;123mmain[0m[0m[38;2;248;248;242m([0m[0m[38;2;248;248;242m)[0m [0m[38;2;248;248;242m{[0m [0m[38;2;189;147;249mprintln[0m[0m[38;2;80;250;123m![0m[0m[38;2;248;248;242m([0m[0m[38;2;241;250;140m"Hello"[0m[0m[38;2;248;248;242m)[0m[0m[38;2;248;248;242m;[0m [0m[38;2;248;248;242m}[0m
//! ```
//!
//! See the [formatter](crate::formatter) module for more information and examples.

use super::Formatter;
use crate::highlight;
use crate::languages::Language;
use crate::themes::Theme;
use derive_builder::Builder;
pub use lumis_core::formatter::terminal::Background;
use lumis_core::formatter::Formatter as _;
pub use lumis_core::formatter::StyleOverride;
use std::io::{self, Write};
use std::sync::Arc;

/// Terminal formatter for syntax highlighting with ANSI color codes.
///
/// Generates terminal output with ANSI escape sequences. Use [`TerminalBuilder`] to create instances.
///
/// # Example
///
/// ```rust
/// use lumis::{TerminalBuilder, languages::Language, themes, formatters::Formatter};
/// use std::io::Write;
///
/// let code = "fn main() { println!(\"Hello\"); }";
/// let theme = themes::get("dracula").unwrap();
///
/// let formatter = TerminalBuilder::new()
///     .language(Language::Rust)
///     .theme(Some(theme))
///     .build()
///     .unwrap();
///
/// let mut output = Vec::new();
/// formatter.format(code, &mut output).unwrap();
/// println!("{}", String::from_utf8(output).unwrap());
/// ```
#[derive(Builder, Clone, Debug)]
#[builder(default)]
pub struct Terminal {
    #[builder(setter(custom))]
    language: Language,
    theme: Option<Theme>,
    background: Background,
    width: Option<usize>,
    style_override: Option<Arc<dyn StyleOverride>>,
}

impl TerminalBuilder {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn language(&mut self, language: Language) -> &mut Self {
        self.language = Some(language);
        self
    }

    #[deprecated(note = "use `.language(...)` instead")]
    pub fn lang(&mut self, language: Language) -> &mut Self {
        self.language(language)
    }
}

impl Terminal {
    pub fn new(
        language: Language,
        theme: Option<Theme>,
        background: Background,
        width: Option<usize>,
    ) -> Self {
        Self {
            language,
            theme,
            background,
            width,
            style_override: None,
        }
    }

    pub fn with_style_override(
        mut self,
        style_override: Arc<dyn lumis_core::formatter::StyleOverride>,
    ) -> Self {
        self.style_override = Some(style_override);
        self
    }
}

impl Default for Terminal {
    fn default() -> Self {
        Self {
            language: Language::PlainText,
            theme: None,
            background: Background::Inherit,
            width: None,
            style_override: None,
        }
    }
}

impl Formatter for Terminal {
    fn format(&self, source: &str, output: &mut dyn Write) -> io::Result<()> {
        let events =
            highlight::highlight_events(source, self.language).map_err(io::Error::other)?;

        let mut core_formatter = lumis_core::formatter::terminal::Terminal::new(
            self.language,
            self.theme.clone(),
            self.background.clone(),
            self.width,
        );

        if let Some(style_override) = &self.style_override {
            core_formatter = core_formatter.with_style_override(Arc::clone(style_override));
        }

        core_formatter.render(source, &events, output)
    }
}

#[cfg(test)]
mod tests {
    use super::super::RainbowBrackets;
    use super::*;
    use crate::themes;

    #[test]
    fn test_no_attrs() {
        let code = "@lang :rust";
        let formatter = Terminal::new(Language::Elixir, None, Background::Inherit, None);
        let mut buffer = Vec::new();
        formatter.format(code, &mut buffer).unwrap();
        let result = String::from_utf8_lossy(&buffer);

        assert!(result.contains("@"));
        assert!(result.contains("lang"));
        assert!(result.contains(":rust"));
    }

    #[test]
    fn test_rainbow_brackets() {
        let code = "{:ok, [1, 2]}";
        let formatter = TerminalBuilder::new()
            .language(Language::Elixir)
            .theme(themes::get("onedark").ok())
            .style_override(Some(Arc::new(RainbowBrackets::new(vec![
                "#e06c75".to_string(),
                "#61afef".to_string(),
                "#98c379".to_string(),
                "#e5c07b".to_string(),
                "#c678dd".to_string(),
                "#56b6c2".to_string(),
            ]))))
            .build()
            .unwrap();

        let mut buffer = Vec::new();
        formatter.format(code, &mut buffer).unwrap();
        let result = String::from_utf8_lossy(&buffer);

        // { at depth 0 -> red
        assert!(result.contains("\u{1b}[38;2;224;108;117m{"));
        // [ at depth 1 -> blue
        assert!(result.contains("\u{1b}[38;2;97;175;239m["));
        // ] at depth 1 -> blue (closing)
        assert!(result.contains("\u{1b}[38;2;97;175;239m]"));
        // } at depth 0 -> red (closing)
        assert!(result.contains("\u{1b}[38;2;224;108;117m}"));
    }

    #[test]
    fn test_rainbow_brackets_custom_colors() {
        let code = "(a)";
        let formatter = TerminalBuilder::new()
            .language(Language::Rust)
            .theme(themes::get("onedark").ok())
            .style_override(Some(Arc::new(RainbowBrackets::new(vec![
                "#ff0000".to_string()
            ]))))
            .build()
            .unwrap();

        let mut buffer = Vec::new();
        formatter.format(code, &mut buffer).unwrap();
        let result = String::from_utf8_lossy(&buffer);

        assert!(result.contains("\u{1b}[38;2;255;0;0m("));
        assert!(result.contains("\u{1b}[38;2;255;0;0m)"));
    }

    #[test]
    fn test_no_override_by_default() {
        let code = "{:ok}";
        let formatter = TerminalBuilder::new()
            .language(Language::Elixir)
            .build()
            .unwrap();

        let mut buffer = Vec::new();
        formatter.format(code, &mut buffer).unwrap();
        let result = String::from_utf8_lossy(&buffer);

        // No rainbow colors without style_override set
        assert!(!result.contains("\u{1b}[38;2;224;108;117m{"));
    }

    #[test]
    fn test_rainbow_brackets_without_theme() {
        let code = "{:ok}";
        let formatter = TerminalBuilder::new()
            .language(Language::Elixir)
            .style_override(Some(Arc::new(RainbowBrackets::new(vec![
                "#ff0000".to_string()
            ]))))
            .build()
            .unwrap();

        let mut buffer = Vec::new();
        formatter.format(code, &mut buffer).unwrap();
        let result = String::from_utf8_lossy(&buffer);

        // Rainbow colors apply even without a theme
        assert!(result.contains("\u{1b}[38;2;255;0;0m{"));
    }
}

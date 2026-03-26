//! BBCode formatter for syntax highlighting.
//!
//! This module provides the [`BBCode`] formatter that generates BBCode output with
//! scope-based tags (e.g., `[keyword-function]text[/keyword-function]`) matching the
//! format produced by converting HTML-linked output to BBCode.
//!
//! # Example Output
//!
//! For the Rust code `fn main() {}`, the formatter generates:
//!
//! ```text
//! [keyword-function]fn[/keyword-function] [function]main[/function][punctuation-bracket]([/punctuation-bracket][punctuation-bracket])[/punctuation-bracket] [punctuation-bracket]{[/punctuation-bracket][punctuation-bracket]}[/punctuation-bracket]
//! ```
//!
//! See the [formatter](crate::formatter) module for more information and examples.

use super::Formatter;
use crate::highlight;
use crate::languages::Language;
use derive_builder::Builder;
use lumis_core::formatter::Formatter as _;
use std::io::{self, Write};

/// BBCode formatter for syntax highlighting with scope-based tags.
///
/// Generates BBCode output using scope-based tags derived from tree-sitter scope names.
/// Dots in scope names are converted to hyphens (e.g., `keyword.function` becomes
/// `[keyword-function]...[/keyword-function]`).
///
/// Use [`BBCodeBuilder`] to create instances.
///
/// # Example
///
/// ```rust
/// use lumis::{BBCodeBuilder, languages::Language, formatter::Formatter};
/// use std::io::Write;
///
/// let code = "fn main() { println!(\"Hello\"); }";
///
/// let formatter = BBCodeBuilder::new()
///     .lang(Language::Rust)
///     .build()
///     .unwrap();
///
/// let mut output = Vec::new();
/// formatter.format(code, &mut output).unwrap();
/// let bbcode = String::from_utf8(output).unwrap();
/// ```
#[derive(Builder, Clone, Debug)]
#[builder(default)]
pub struct BBCode {
    lang: Language,
}

impl BBCodeBuilder {
    pub fn new() -> Self {
        Self::default()
    }
}

impl BBCode {
    pub fn new(lang: Language) -> Self {
        Self { lang }
    }
}

impl Default for BBCode {
    fn default() -> Self {
        Self {
            lang: Language::PlainText,
        }
    }
}

impl Formatter for BBCode {
    fn format(&self, source: &str, output: &mut dyn Write) -> io::Result<()> {
        let events = highlight::highlight_events(source, self.lang).map_err(io::Error::other)?;

        let core_formatter = lumis_core::formatter::bbcode::BBCode::new(self.lang);
        core_formatter.render(source, &events, output)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_no_attrs() {
        let code = "@lang :rust";
        let formatter = BBCode::new(Language::Elixir);
        let mut buffer = Vec::new();
        formatter.format(code, &mut buffer).unwrap();
        let result = String::from_utf8(buffer).unwrap();

        assert!(result.contains("@"));
        assert!(result.contains("lang"));
        assert!(result.contains(":rust"));
    }

    #[test]
    fn test_plain_text() {
        let code = "hello world";
        let formatter = BBCode::new(Language::PlainText);
        let mut buffer = Vec::new();
        formatter.format(code, &mut buffer).unwrap();
        let result = String::from_utf8(buffer).unwrap();

        assert_eq!(result, "hello world");
    }

    #[test]
    fn test_builder_pattern() {
        let formatter = BBCodeBuilder::new()
            .lang(Language::Rust)
            .build()
            .unwrap();

        let code = "fn main() {}";
        let mut buffer = Vec::new();
        formatter.format(code, &mut buffer).unwrap();
        let result = String::from_utf8(buffer).unwrap();

        assert!(result.contains("fn"));
        assert!(result.contains("main"));
    }
}

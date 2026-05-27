//! BBCode formatter for syntax highlighting.
//!
//! This module provides the [`BBCodeScoped`] formatter that generates BBCode output with
//! highlight scope names as tags (e.g., `[keyword-function]text[/keyword-function]`).
//!
//! It does not emit standard forum-style BBCode such as `[b]`, `[color]`, or `[code]`.
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
use crate::languages::Language;
use derive_builder::Builder;
use lumis_core::highlight::LineView;
use std::io::{self, Write};

/// BBCode formatter for syntax highlighting using highlight scope names as tags.
///
/// Generates BBCode output using scope-based tags derived from tree-sitter scope names.
/// Dots in scope names are converted to hyphens (e.g., `keyword.function` becomes
/// `[keyword-function]...[/keyword-function]`).
/// It does not emit standard forum-style BBCode tags.
///
/// Use [`BBCodeScopedBuilder`] to create instances.
///
/// # Example
///
/// ```rust,ignore
/// use lumis::{BBCodeScopedBuilder, languages::Language, formatters::Formatter};
///
/// let code = "fn main() { println!(\"Hello\"); }";
///
/// let formatter = BBCodeScopedBuilder::new()
///     .language(Language::Rust)
///     .build()
///     .unwrap();
///
/// let mut output = Vec::new();
/// formatter.format(code, &mut output).unwrap();
/// let bbcode = String::from_utf8(output).unwrap();
/// ```
#[derive(Builder, Clone, Debug)]
#[builder(default)]
pub struct BBCodeScoped {
    #[builder(setter(custom))]
    language: Language,
}

impl BBCodeScopedBuilder {
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

impl BBCodeScoped {
    pub fn new(language: Language) -> Self {
        Self { language }
    }
}

impl Default for BBCodeScoped {
    fn default() -> Self {
        Self {
            language: Language::PlainText,
        }
    }
}

impl Formatter for BBCodeScoped {
    fn language(&self) -> Language {
        self.language
    }

    fn render(&self, view: &LineView, output: &mut dyn Write) -> io::Result<()> {
        self.render_line_view(view, output)
    }
}

impl BBCodeScoped {
    fn render_line_view(&self, view: &LineView, output: &mut dyn Write) -> io::Result<()> {
        for (index, line) in view.lines.iter().enumerate() {
            for highlight in &line.line_highlights {
                if let Some(kind) = &highlight.kind {
                    write!(output, "[{}]", bbcode_tag(kind))?;
                }
            }
            for gutter in &line.gutter_text {
                write!(output, "[gutter]{}[/gutter] ", escape_bbcode(&gutter.text))?;
            }
            for sign in &line.signs {
                write!(output, "[sign]{}[/sign] ", escape_bbcode(&sign.text))?;
            }

            let mut column = 0usize;
            for span in &line.spans {
                self.write_span(output, span, line, &mut column)?;
            }
            for virtual_text in &line.virtual_text {
                if virtual_text.column >= column {
                    write!(
                        output,
                        "[virtual]{}[/virtual]",
                        escape_bbcode(&virtual_text.text)
                    )?;
                }
            }

            for highlight in line.line_highlights.iter().rev() {
                if let Some(kind) = &highlight.kind {
                    write!(output, "[/{}]", bbcode_tag(kind))?;
                }
            }
            if index + 1 < view.lines.len() || view.trailing_newline {
                writeln!(output)?;
            }
        }
        Ok(())
    }

    fn write_span(
        &self,
        output: &mut dyn Write,
        span: &lumis_core::highlight::Span,
        line: &lumis_core::highlight::Line,
        column: &mut usize,
    ) -> io::Result<()> {
        for kind in &span.decoration_kinds {
            write!(output, "[{}]", bbcode_tag(kind))?;
        }
        if span.style.is_some() {
            write!(output, "[decoration]")?;
        }
        if let Some(scope) = span.scopes.last() {
            let scope_name = lumis_core::highlights::HIGHLIGHT_NAMES
                .get(scope.scope_index)
                .copied()
                .unwrap_or("");
            let language = scope.language.unwrap_or(self.language);
            write!(
                output,
                "[{}]",
                bbcode_tag(&format!("{scope_name}.{language}"))
            )?;
        }

        for ch in span.text.chars() {
            if let Some(virtual_text) = super::line_view::virtual_text_at_column(line, *column) {
                write!(
                    output,
                    "[virtual]{}[/virtual]",
                    escape_bbcode(&virtual_text.text)
                )?;
            }
            write!(output, "{}", escape_bbcode(&ch.to_string()))?;
            *column += super::line_view::char_display_width(ch);
        }

        if let Some(scope) = span.scopes.last() {
            let scope_name = lumis_core::highlights::HIGHLIGHT_NAMES
                .get(scope.scope_index)
                .copied()
                .unwrap_or("");
            let language = scope.language.unwrap_or(self.language);
            write!(
                output,
                "[/{}]",
                bbcode_tag(&format!("{scope_name}.{language}"))
            )?;
        }
        if span.style.is_some() {
            write!(output, "[/decoration]")?;
        }
        for kind in span.decoration_kinds.iter().rev() {
            write!(output, "[/{}]", bbcode_tag(kind))?;
        }
        Ok(())
    }
}

fn bbcode_tag(value: &str) -> String {
    value.replace(['.', '_', ' '], "-")
}

fn escape_bbcode(text: &str) -> String {
    text.replace('[', "&#91;").replace(']', "&#93;")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_no_attrs() {
        let code = "@lang :rust";
        let formatter = BBCodeScoped::new(Language::Elixir);
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
        let formatter = BBCodeScoped::new(Language::PlainText);
        let mut buffer = Vec::new();
        formatter.format(code, &mut buffer).unwrap();
        let result = String::from_utf8(buffer).unwrap();

        assert_eq!(result, "hello world");
    }

    #[test]
    fn test_builder_pattern() {
        let formatter = BBCodeScopedBuilder::new()
            .language(Language::Rust)
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

//! BBCode formatter for syntax highlighting.
//!
//! This module provides the [`BBCodeScoped`] formatter that generates BBCode output with
//! highlight scope names as tags (e.g., `[keyword-function]text[/keyword-function]`).
//!
//! It does not emit standard forum-style BBCode such as `[b]`, `[color]`, or `[code]`.
//!
//! Works with pre-computed highlight events from any source.

use super::Formatter;
use crate::events::HighlightEvent;
use crate::languages::Language;
use derive_builder::Builder;
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
/// # Example Output
///
/// For the Rust code `fn main() {}`, the formatter generates:
///
/// ```text
/// [keyword-function]fn[/keyword-function] [function]main[/function][punctuation-bracket]([/punctuation-bracket][punctuation-bracket])[/punctuation-bracket] [punctuation-bracket]{[/punctuation-bracket][punctuation-bracket]}[/punctuation-bracket]
/// ```
#[derive(Builder, Clone, Debug)]
#[builder(default)]
pub struct BBCodeScoped {
    lang: Language,
}

impl BBCodeScopedBuilder {
    pub fn new() -> Self {
        Self::default()
    }
}

impl BBCodeScoped {
    pub fn new(lang: Language) -> Self {
        Self { lang }
    }
}

impl Default for BBCodeScoped {
    fn default() -> Self {
        Self {
            lang: Language::PlainText,
        }
    }
}

/// Convert scope name to BBCode tag name.
///
/// Converts tree-sitter scope names (dot-separated) to BBCode tag names
/// (hyphen-separated).
fn scope_to_tag_name(scope: &str) -> String {
    scope.replace('.', "-")
}

fn write_escaped_text(output: &mut dyn Write, text: &str) -> io::Result<()> {
    for ch in text.chars() {
        match ch {
            '[' => output.write_all(b"&#91;")?,
            ']' => output.write_all(b"&#93;")?,
            _ => write!(output, "{ch}")?,
        }
    }

    Ok(())
}

fn tag_name(scope_index: usize, language: &str) -> String {
    let scope = crate::highlights::HIGHLIGHT_NAMES
        .get(scope_index)
        .copied()
        .unwrap_or("");
    let specialized = format!("{}.{}", scope, language);
    scope_to_tag_name(&specialized)
}

impl Formatter for BBCodeScoped {
    fn render(
        &self,
        source: &str,
        events: &[HighlightEvent],
        output: &mut dyn Write,
    ) -> io::Result<()> {
        let source_bytes = source.as_bytes();
        let mut scope_stack: Vec<String> = Vec::new();

        for event in events {
            match event {
                HighlightEvent::Source { start, end } => {
                    if *start > *end || *end > source_bytes.len() {
                        return Err(io::Error::new(
                            io::ErrorKind::InvalidData,
                            format!(
                                "invalid source range: {}..{} (len={})",
                                start,
                                end,
                                source_bytes.len()
                            ),
                        ));
                    }
                    let text = std::str::from_utf8(&source_bytes[*start..*end])
                        .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;

                    write_escaped_text(output, text)?;
                }
                HighlightEvent::Start {
                    scope_index,
                    language,
                } => {
                    let tag_name = tag_name(*scope_index, language);
                    write!(output, "[{tag_name}]")?;
                    scope_stack.push(tag_name);
                }
                HighlightEvent::End => {
                    if let Some(tag_name) = scope_stack.pop() {
                        write!(output, "[/{tag_name}]")?;
                    }
                }
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn scope_index(scope: &str) -> usize {
        crate::highlights::HIGHLIGHT_NAMES
            .iter()
            .position(|candidate| *candidate == scope)
            .unwrap()
    }

    #[test]
    fn escapes_bbcode_delimiters_in_source_text() {
        let formatter = BBCodeScoped::default();
        let mut output = Vec::new();

        formatter
            .render(
                "[url=x]",
                &[HighlightEvent::Source { start: 0, end: 7 }],
                &mut output,
            )
            .unwrap();

        assert_eq!(String::from_utf8(output).unwrap(), "&#91;url=x&#93;");
    }

    #[test]
    fn preserves_nested_scopes() {
        let formatter = BBCodeScoped::default();
        let mut output = Vec::new();
        let string_scope = scope_index("string");
        let tag_scope = scope_index("tag");

        formatter
            .render(
                "`<a>`",
                &[
                    HighlightEvent::Start {
                        scope_index: string_scope,
                        language: "javascript".to_string(),
                    },
                    HighlightEvent::Source { start: 0, end: 1 },
                    HighlightEvent::Start {
                        scope_index: tag_scope,
                        language: "html".to_string(),
                    },
                    HighlightEvent::Source { start: 1, end: 4 },
                    HighlightEvent::End,
                    HighlightEvent::Source { start: 4, end: 5 },
                    HighlightEvent::End,
                ],
                &mut output,
            )
            .unwrap();

        assert_eq!(
            String::from_utf8(output).unwrap(),
            "[string-javascript]`[tag-html]<a>[/tag-html]`[/string-javascript]"
        );
    }
}

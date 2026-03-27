//! BBCode formatter for syntax highlighting.
//!
//! This module provides the [`BBCode`] formatter that generates BBCode output with
//! scope-based tags (e.g., `[keyword-function]text[/keyword-function]`).
//!
//! Works with pre-computed highlight events from any source.

use super::Formatter;
use crate::events::HighlightEvent;
use crate::languages::Language;
use derive_builder::Builder;
use std::io::{self, Write};

/// BBCode formatter for syntax highlighting with scope-based tags.
///
/// Generates BBCode output using scope-based tags derived from tree-sitter scope names.
/// Dots in scope names are converted to hyphens (e.g., `keyword.function` becomes
/// `[keyword-function]...[/keyword-function]`).
///
/// Use [`BBCodeBuilder`] to create instances.
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

/// Convert scope name to BBCode tag name.
///
/// Converts tree-sitter scope names (dot-separated) to BBCode tag names
/// (hyphen-separated).
fn scope_to_tag_name(scope: &str) -> String {
    scope.replace('.', "-")
}

impl Formatter for BBCode {
    fn render(
        &self,
        source: &str,
        events: &[HighlightEvent],
        output: &mut dyn Write,
    ) -> io::Result<()> {
        let source_bytes = source.as_bytes();
        let mut scope_stack: Vec<(usize, String)> = Vec::new();

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

                    if let Some((scope_index, language)) = scope_stack.last() {
                        let scope = crate::highlights::HIGHLIGHT_NAMES
                            .get(*scope_index)
                            .copied()
                            .unwrap_or("");
                        let specialized = format!("{}.{}", scope, language);
                        let tag_name = scope_to_tag_name(&specialized);
                        write!(output, "[{}]{}[/{}]", tag_name, text, tag_name)?;
                    } else {
                        write!(output, "{}", text)?;
                    }
                }
                HighlightEvent::Start {
                    scope_index,
                    language,
                } => scope_stack.push((*scope_index, language.clone())),
                HighlightEvent::End => {
                    scope_stack.pop();
                }
            }
        }

        Ok(())
    }
}

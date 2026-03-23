//! Terminal formatter with ANSI color codes.
//!
//! Works with pre-computed highlight events from any source.

use super::{ansi, Formatter};
use crate::events::HighlightEvent;
use crate::languages::Language;
use crate::themes::Theme;
use derive_builder::Builder;
use std::io::{self, Write};

/// Terminal formatter for syntax highlighting with ANSI color codes.
#[derive(Builder, Clone, Debug)]
#[builder(default)]
pub struct Terminal {
    lang: Language,
    theme: Option<Theme>,
}

impl TerminalBuilder {
    pub fn new() -> Self {
        Self::default()
    }
}

impl Terminal {
    pub fn new(lang: Language, theme: Option<Theme>) -> Self {
        Self { lang, theme }
    }
}

impl Default for Terminal {
    fn default() -> Self {
        Self {
            lang: Language::PlainText,
            theme: None,
        }
    }
}

impl Formatter for Terminal {
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
                    let styled = scope_stack.last().and_then(|(scope_index, language)| {
                        let theme = self.theme.as_ref()?;
                        let scope = crate::highlights::HIGHLIGHT_NAMES
                            .get(*scope_index)
                            .copied()
                            .unwrap_or("");
                        let specialized = format!("{}.{}", scope, language);
                        theme
                            .get_style(&specialized)
                            .or_else(|| theme.get_style(scope))
                    });

                    if let Some(style) = styled {
                        write!(output, "{}", ansi::wrap_with_ansi(text, style))?;
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

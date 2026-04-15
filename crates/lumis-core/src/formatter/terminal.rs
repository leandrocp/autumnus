//! Terminal formatter with ANSI color codes.
//!
//! Works with pre-computed highlight events from any source.

use super::{ansi, Formatter};
use crate::events::HighlightEvent;
use crate::languages::Language;
use crate::themes::{Style, Theme};
use derive_builder::Builder;
use std::io::{self, Write};

/// Terminal formatter for syntax highlighting with ANSI color codes.
#[derive(Builder, Clone, Debug)]
#[builder(default)]
pub struct Terminal {
    #[builder(setter(custom))]
    language: Language,
    theme: Option<Theme>,
    default_bg: Option<String>,
    width: Option<usize>,
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
        default_bg: Option<String>,
        width: Option<usize>,
    ) -> Self {
        Self {
            language,
            theme,
            default_bg,
            width,
        }
    }
}

impl Default for Terminal {
    fn default() -> Self {
        Self {
            language: Language::PlainText,
            theme: None,
            default_bg: None,
            width: None,
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
        let mut line_width = 0usize;

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

                    for segment in text.split_inclusive('\n') {
                        let has_newline = segment.ends_with('\n');
                        let content = if has_newline {
                            &segment[..segment.len() - 1]
                        } else {
                            segment
                        };

                        if !content.is_empty() {
                            write!(
                                output,
                                "{}",
                                paint_with_default_bg(content, styled, self.default_bg.as_deref())
                            )?;
                            line_width += display_width(content);
                        }

                        if has_newline {
                            write_line_padding(
                                output,
                                self.default_bg.as_deref(),
                                self.width,
                                line_width,
                            )?;
                            writeln!(output)?;
                            line_width = 0;
                        }
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

        if !source.ends_with('\n') {
            write_line_padding(output, self.default_bg.as_deref(), self.width, line_width)?;
        }

        Ok(())
    }
}

fn paint_with_default_bg(text: &str, style: Option<&Style>, default_bg: Option<&str>) -> String {
    match (style, default_bg) {
        (Some(style), Some(default_bg)) if style.bg.is_none() => {
            let mut style = style.clone();
            style.bg = Some(default_bg.to_string());
            ansi::paint(text, &style)
        }
        (Some(style), _) => ansi::paint(text, style),
        (None, Some(default_bg)) => ansi::paint(
            text,
            &Style {
                bg: Some(default_bg.to_string()),
                ..Default::default()
            },
        ),
        (None, None) => text.to_string(),
    }
}

fn write_line_padding(
    output: &mut dyn Write,
    default_bg: Option<&str>,
    width: Option<usize>,
    line_width: usize,
) -> io::Result<()> {
    let Some(default_bg) = default_bg else {
        return Ok(());
    };
    let Some(width) = width else {
        return Ok(());
    };

    if line_width >= width {
        return Ok(());
    }

    let padding = " ".repeat(width - line_width);
    write!(
        output,
        "{}",
        paint_with_default_bg(&padding, None, Some(default_bg))
    )
}

fn display_width(text: &str) -> usize {
    text.chars()
        .map(|ch| match ch {
            '\t' => 4,
            _ => 1,
        })
        .sum()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn paint_with_default_bg_applies_background_to_unstyled_text() {
        let painted = paint_with_default_bg("abc", None, Some("#282a36"));

        assert_eq!(painted, "\u{1b}[0m\u{1b}[48;2;40;42;54mabc\u{1b}[0m");
    }

    #[test]
    fn paint_with_default_bg_uses_fallback_when_style_has_no_background() {
        let style = Style {
            fg: Some("#8be9fd".to_string()),
            bold: true,
            ..Default::default()
        };

        let painted = paint_with_default_bg("fn", Some(&style), Some("#282a36"));

        assert!(painted.contains("\u{1b}[38;2;139;233;253m"));
        assert!(painted.contains("\u{1b}[48;2;40;42;54m"));
        assert!(painted.contains("\u{1b}[1m"));
    }

    #[test]
    fn paint_with_default_bg_preserves_explicit_style_background() {
        let style = Style {
            fg: Some("#8be9fd".to_string()),
            bg: Some("#ff0000".to_string()),
            ..Default::default()
        };

        let painted = paint_with_default_bg("fn", Some(&style), Some("#282a36"));

        assert!(painted.contains("\u{1b}[48;2;255;0;0m"));
        assert!(!painted.contains("\u{1b}[48;2;40;42;54m"));
    }

    #[test]
    fn paint_with_default_bg_resets_around_newlines() {
        let style = Style {
            fg: Some("#8be9fd".to_string()),
            ..Default::default()
        };

        let painted = paint_with_default_bg("a\nb", Some(&style), Some("#282a36"));

        assert_eq!(
            painted,
            "\u{1b}[0m\u{1b}[38;2;139;233;253m\u{1b}[48;2;40;42;54ma\u{1b}[0m\n\u{1b}[38;2;139;233;253m\u{1b}[48;2;40;42;54mb\u{1b}[0m"
        );
    }

    #[test]
    fn render_pads_lines_to_width_with_default_background() {
        let formatter = Terminal::new(
            Language::PlainText,
            None,
            Some("#282a36".to_string()),
            Some(5),
        );
        let events = [HighlightEvent::Source { start: 0, end: 2 }];
        let mut output = Vec::new();

        formatter.render("hi", &events, &mut output).unwrap();

        assert_eq!(
            String::from_utf8(output).unwrap(),
            "\u{1b}[0m\u{1b}[48;2;40;42;54mhi\u{1b}[0m\u{1b}[0m\u{1b}[48;2;40;42;54m   \u{1b}[0m"
        );
    }

    #[test]
    fn render_pads_each_line_before_newline() {
        let formatter = Terminal::new(
            Language::PlainText,
            None,
            Some("#282a36".to_string()),
            Some(4),
        );
        let events = [HighlightEvent::Source { start: 0, end: 3 }];
        let mut output = Vec::new();

        formatter.render("a\nb", &events, &mut output).unwrap();

        assert_eq!(
            String::from_utf8(output).unwrap(),
            "\u{1b}[0m\u{1b}[48;2;40;42;54ma\u{1b}[0m\u{1b}[0m\u{1b}[48;2;40;42;54m   \u{1b}[0m\n\u{1b}[0m\u{1b}[48;2;40;42;54mb\u{1b}[0m\u{1b}[0m\u{1b}[48;2;40;42;54m   \u{1b}[0m"
        );
    }
}

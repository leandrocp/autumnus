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
use crate::languages::Language;
use crate::themes::{Style, Theme};
use derive_builder::Builder;
pub use lumis_core::formatter::terminal::Background;
use lumis_core::highlight::LineView;
use std::io::{self, Write};

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
        }
    }
}

impl Default for Terminal {
    fn default() -> Self {
        Self {
            language: Language::PlainText,
            theme: None,
            background: Background::Inherit,
            width: None,
        }
    }
}

impl Formatter for Terminal {
    fn language(&self) -> Language {
        self.language
    }

    fn render(&self, view: &LineView, output: &mut dyn Write) -> io::Result<()> {
        self.render_line_view(view, output)
    }
}

impl Terminal {
    fn render_line_view(&self, view: &LineView, output: &mut dyn Write) -> io::Result<()> {
        let fallback_bg = self.fallback_background();
        for (index, line) in view.lines.iter().enumerate() {
            let line_style = super::line_view::merged_line_style(line);
            let mut line_width = 0usize;
            let mut column = 0usize;

            let gutter = self.render_gutter(line, &line_style);
            line_width += display_width_without_ansi(&gutter);
            write!(output, "{gutter}")?;

            for span in &line.spans {
                let mut style = self.span_theme_style(span);
                if let Some(line_style) = &line_style {
                    super::line_view::apply_style_patch(&mut style, line_style);
                }
                if let Some(patch) = &span.style {
                    super::line_view::apply_style_patch(&mut style, patch);
                }
                if style.bg.is_none() {
                    if let Some(bg) = fallback_bg.as_deref() {
                        style.bg = Some(bg.to_string());
                    }
                }

                let rendered = render_text_with_virtuals(&span.text, line, &mut column, &style);
                line_width += super::line_view::display_width(&span.text);
                write!(output, "{rendered}")?;
            }

            let remaining_virtuals = render_remaining_virtuals(line, &mut column);
            line_width += display_width_without_ansi(&remaining_virtuals);
            write!(output, "{remaining_virtuals}")?;

            if let (Some(bg), Some(width)) = (fallback_bg.as_deref(), self.width) {
                if line_width < width {
                    write!(
                        output,
                        "{}",
                        lumis_core::formatter::ansi::paint(
                            &" ".repeat(width - line_width),
                            &Style {
                                bg: Some(bg.to_string()),
                                ..Style::default()
                            },
                        ),
                    )?;
                }
            }

            if index + 1 < view.lines.len() || view.trailing_newline {
                writeln!(output)?;
            }
        }
        Ok(())
    }

    fn fallback_background(&self) -> Option<String> {
        match &self.background {
            Background::Inherit => None,
            Background::Theme => self
                .theme
                .as_ref()
                .and_then(Theme::bg)
                .map(ToString::to_string),
            Background::Color(color) => Some(color.clone()),
        }
    }

    fn render_gutter(
        &self,
        line: &lumis_core::highlight::Line,
        line_style: &Option<lumis_core::highlight::StylePatch>,
    ) -> String {
        if line.gutter_text.is_empty() && line.signs.is_empty() {
            return String::new();
        }

        let mut output = String::new();
        for item in &line.gutter_text {
            output.push_str(&paint_terminal(&item.text, &style_from_patch(&item.style)));
            output.push(' ');
        }
        for item in &line.signs {
            let mut style = line_style
                .as_ref()
                .map(style_from_patch)
                .unwrap_or_default();
            super::line_view::apply_style_patch(&mut style, &item.style);
            output.push_str(&paint_terminal(&item.text, &style));
            output.push(' ');
        }
        output.push_str("│ ");
        output
    }

    fn span_theme_style(&self, span: &lumis_core::highlight::Span) -> Style {
        let Some(theme) = self.theme.as_ref() else {
            return Style::default();
        };
        for scope in span.scopes.iter().rev() {
            let scope_name = lumis_core::highlights::HIGHLIGHT_NAMES
                .get(scope.scope_index)
                .copied()
                .unwrap_or("");
            let language = scope.language.unwrap_or(self.language);
            let specialized = format!("{}.{}", scope_name, language.id_name());
            if let Some(style) = theme
                .get_style(&specialized)
                .or_else(|| theme.get_style(scope_name))
            {
                return style.clone();
            }
        }
        Style::default()
    }
}

fn render_text_with_virtuals(
    text: &str,
    line: &lumis_core::highlight::Line,
    column: &mut usize,
    style: &Style,
) -> String {
    let mut output = String::new();
    let mut chunk = String::new();
    for ch in text.chars() {
        if let Some(virtual_text) = super::line_view::virtual_text_at_column(line, *column) {
            output.push_str(&paint_terminal(&chunk, style));
            chunk.clear();
            let mut virtual_style = style.clone();
            super::line_view::apply_style_patch(&mut virtual_style, &virtual_text.style);
            output.push_str(&paint_terminal(&virtual_text.text, &virtual_style));
        }
        chunk.push(ch);
        *column += super::line_view::char_display_width(ch);
    }
    output.push_str(&paint_terminal(&chunk, style));
    output
}

fn render_remaining_virtuals(line: &lumis_core::highlight::Line, column: &mut usize) -> String {
    let mut output = String::new();
    for virtual_text in &line.virtual_text {
        if virtual_text.column < *column {
            continue;
        }
        while *column < virtual_text.column {
            output.push(' ');
            *column += 1;
        }
        output.push_str(&paint_terminal(
            &virtual_text.text,
            &style_from_patch(&virtual_text.style),
        ));
        *column += super::line_view::display_width(&virtual_text.text);
    }
    output
}

fn style_from_patch(patch: &lumis_core::highlight::StylePatch) -> Style {
    let mut style = Style::default();
    super::line_view::apply_style_patch(&mut style, patch);
    style
}

fn paint_terminal(text: &str, style: &Style) -> String {
    if style == &Style::default() {
        text.to_string()
    } else {
        lumis_core::formatter::ansi::paint(text, style)
    }
}

fn display_width_without_ansi(text: &str) -> usize {
    let mut width = 0;
    let mut chars = text.chars().peekable();
    while let Some(ch) = chars.next() {
        if ch == '\x1b' && chars.peek() == Some(&'[') {
            for next in chars.by_ref() {
                if next == 'm' {
                    break;
                }
            }
            continue;
        }
        width += super::line_view::char_display_width(ch);
    }
    width
}

#[cfg(test)]
mod tests {
    use super::*;

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
        // Without a theme, some tokens may not have styling, so just check the text is there
    }
}

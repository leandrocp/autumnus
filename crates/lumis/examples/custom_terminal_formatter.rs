//! Custom terminal formatter using public helper functions.
//!
//! This example demonstrates how to create a custom terminal formatter using only
//! the public APIs from the `ansi` module, without needing to interact with
//! tree-sitter or termcolor internals directly.

use lumis::{
    ansi, formatters::Formatter, highlight::LineView, languages::Language, themes, write_highlight,
};
use std::io::{self, Write};

const HORIZONTAL_LINE: char = '─';

/// A custom terminal formatter that creates bat-style output with file header and line numbers
struct LineNumberedTerminal {
    language: Language,
    theme: Option<lumis::themes::Theme>,
    filename: Option<String>,
    term_width: usize,
}

impl LineNumberedTerminal {
    fn new(
        language: Language,
        theme: Option<lumis::themes::Theme>,
        filename: Option<String>,
    ) -> Self {
        Self {
            language,
            theme,
            filename,
            term_width: 80, // Default terminal width
        }
    }

    /// Print a horizontal line across the terminal width
    fn print_horizontal_line(&self, output: &mut dyn Write) -> io::Result<()> {
        let gray_fg = ansi::rgb_to_ansi(128, 128, 128, false);
        writeln!(
            output,
            "{}{}{}",
            gray_fg,
            HORIZONTAL_LINE.to_string().repeat(self.term_width),
            ansi::ANSI_RESET
        )
    }

    /// Print the file header with horizontal lines (bat-style)
    fn print_header(&self, output: &mut dyn Write) -> io::Result<()> {
        if let Some(ref filename) = self.filename {
            let gray_fg = ansi::rgb_to_ansi(128, 128, 128, false);

            // Top horizontal line
            self.print_horizontal_line(output)?;

            // File label
            writeln!(output, "{}File: {}{}", gray_fg, filename, ansi::ANSI_RESET)?;

            // Bottom horizontal line
            self.print_horizontal_line(output)?;
        }
        Ok(())
    }
}

impl Formatter for LineNumberedTerminal {
    fn language(&self) -> Language {
        self.language
    }

    fn render(&self, view: &LineView, output: &mut dyn Write) -> io::Result<()> {
        // Print bat-style header with filename
        self.print_header(output)?;

        let gray_fg = ansi::rgb_to_ansi(128, 128, 128, false);
        for line in &view.lines {
            write!(
                output,
                "{}{:3} │ {}",
                gray_fg,
                line.line_number,
                ansi::ANSI_RESET
            )?;
            for span in &line.spans {
                let scope = span.scopes.last();
                let scope_name = scope
                    .and_then(|scope| lumis::highlight::HIGHLIGHT_NAMES.get(scope.scope_index))
                    .copied()
                    .unwrap_or("text");
                let language = scope
                    .and_then(|scope| scope.language)
                    .unwrap_or(self.language);
                let style = self
                    .theme
                    .as_ref()
                    .and_then(|theme| {
                        theme
                            .get_style(&format!("{}.{}", scope_name, language.id_name()))
                            .or_else(|| theme.get_style(scope_name))
                    })
                    .cloned()
                    .unwrap_or_default();
                let ansi_text = ansi::paint(&span.text, &style);
                write!(output, "{}", ansi_text)?;
            }
            writeln!(output)?;
        }

        Ok(())
    }
}

fn main() {
    let code = r#"const greeting = "Hello, World!";
console.log(greeting);"#;

    let theme = themes::get("dracula").ok();
    let lang = Language::guess(Some("javascript"), code);

    let formatter = LineNumberedTerminal::new(lang, theme, Some("src/index.html".to_string()));

    write_highlight(&mut io::stdout(), code, formatter).expect("Failed to write output");
}

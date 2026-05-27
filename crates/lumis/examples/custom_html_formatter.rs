//! Custom HTML formatter using public helper functions.
//!
//! This example demonstrates how to build a custom HTML formatter using
//! the public APIs from the `html` module:

use lumis::{
    formatters::Formatter, highlight::LineView, html, languages::Language, themes, write_highlight,
};
use std::io::{self, Write};

/// A custom HTML formatter built using only public helper functions
struct CustomHtmlFormatter {
    language: Language,
    theme: Option<lumis::themes::Theme>,
}

impl CustomHtmlFormatter {
    fn new(language: Language, theme: Option<lumis::themes::Theme>) -> Self {
        Self { language, theme }
    }
}

impl Formatter for CustomHtmlFormatter {
    fn language(&self) -> Language {
        self.language
    }

    fn render(&self, view: &LineView, output: &mut dyn Write) -> io::Result<()> {
        html::open_pre_tag(output, None, self.theme.as_ref())?;
        html::open_code_tag(output, &self.language)?;

        for line in &view.lines {
            for span in &line.spans {
                let Some(scope) = span.scopes.last() else {
                    write!(output, "{}", html::escape(&span.text))?;
                    continue;
                };
                let scope_name = lumis::highlight::HIGHLIGHT_NAMES
                    .get(scope.scope_index)
                    .copied()
                    .unwrap_or("text");
                write!(
                    output,
                    "{}",
                    html::span_inline(
                        &span.text,
                        scope.language.or(Some(self.language)),
                        scope_name,
                        self.theme.as_ref(),
                        false,
                        true,
                    )
                )?;
            }
            writeln!(output)?;
        }

        html::closing_tags(output)?;
        Ok(())
    }
}

fn main() {
    let code = r#"const greeting = "Hello, World!";
console.log(greeting);"#;

    let theme = themes::get("dracula").ok();
    let lang = Language::guess(Some("javascript"), code);

    let formatter = CustomHtmlFormatter::new(lang, theme);

    write_highlight(&mut io::stdout(), code, formatter).expect("Failed to write output");
}

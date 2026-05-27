//! Creating a custom formatter
//!
//! This example demonstrates how to implement a custom formatter by implementing
//! the Formatter trait. Here we create a token metadata formatter that explicitly
//! shows what data is available from `highlight_iter()`.

use lumis::{
    formatters::Formatter, highlight::LineView, languages::Language, themes, write_highlight,
};
use std::io::{self, Write};

/// A custom formatter that outputs token metadata to show available data
struct TokenMetadataFormatter {
    language: Language,
    theme: Option<lumis::themes::Theme>,
}

impl TokenMetadataFormatter {
    fn new(language: Language, theme: Option<lumis::themes::Theme>) -> Self {
        Self { language, theme }
    }
}

impl Formatter for TokenMetadataFormatter {
    fn language(&self) -> Language {
        self.language
    }

    fn render(&self, view: &LineView, output: &mut dyn Write) -> io::Result<()> {
        for line in &view.lines {
            for span in &line.spans {
                let scope = span.scopes.last();
                let scope_name = scope
                    .and_then(|scope| lumis::highlight::HIGHLIGHT_NAMES.get(scope.scope_index))
                    .copied()
                    .unwrap_or("text");
                let language = scope
                    .and_then(|scope| scope.language)
                    .unwrap_or(self.language);
                let style = self.theme.as_ref().and_then(|theme| {
                    theme
                        .get_style(&format!("{}.{}", scope_name, language.id_name()))
                        .or_else(|| theme.get_style(scope_name))
                });
                writeln!(
                    output,
                    "{} (lang:{} pos:{}..{} scope:{} fg:{} bg:{})",
                    span.text.escape_debug(),
                    language.id_name(),
                    span.range.start,
                    span.range.end,
                    scope_name,
                    style
                        .and_then(|style| style.fg.as_deref())
                        .unwrap_or("none"),
                    style
                        .and_then(|style| style.bg.as_deref())
                        .unwrap_or("none"),
                )?;
            }
        }
        Ok(())
    }
}

fn main() {
    let code = r#"const greeting = "Hello, World!";
console.log(greeting);"#;

    let theme = themes::get("dracula").ok();
    let lang = Language::guess(Some("javascript"), code);

    let formatter = TokenMetadataFormatter::new(lang, theme);

    write_highlight(&mut io::stdout(), code, formatter).expect("Failed to write output");
}

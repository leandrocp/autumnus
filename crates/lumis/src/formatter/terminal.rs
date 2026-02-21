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
use crate::highlight;
use crate::languages::Language;
use crate::themes::Theme;
use derive_builder::Builder;
use lumis_core::formatter::Formatter as _;
use std::io::{self, Write};

/// Terminal formatter for syntax highlighting with ANSI color codes.
///
/// Generates terminal output with ANSI escape sequences. Use [`TerminalBuilder`] to create instances.
///
/// # Example
///
/// ```rust
/// use lumis::{TerminalBuilder, languages::Language, themes, formatter::Formatter};
/// use std::io::Write;
///
/// let code = "fn main() { println!(\"Hello\"); }";
/// let theme = themes::get("dracula").unwrap();
///
/// let formatter = TerminalBuilder::new()
///     .lang(Language::Rust)
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
    fn format(&self, source: &str, output: &mut dyn Write) -> io::Result<()> {
        let events = highlight::highlight_events(source, self.lang).map_err(io::Error::other)?;

        let core_formatter =
            lumis_core::formatter::terminal::Terminal::new(self.lang, self.theme.clone());
        core_formatter.render(source, &events, output)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_no_attrs() {
        let code = "@lang :rust";
        let formatter = Terminal::new(Language::Elixir, None);
        let mut buffer = Vec::new();
        formatter.format(code, &mut buffer).unwrap();
        let result = String::from_utf8_lossy(&buffer);

        assert!(result.contains("@"));
        assert!(result.contains("lang"));
        assert!(result.contains(":rust"));
        // Without a theme, some tokens may not have styling, so just check the text is there
    }
}

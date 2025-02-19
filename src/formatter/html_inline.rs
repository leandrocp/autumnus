#![allow(unused_must_use)]

use super::Formatter;
use crate::constants::HIGHLIGHT_NAMES;
use crate::languages::Language;
use crate::themes::Theme;
use tree_sitter_highlight::{Error, HighlightEvent};

pub(crate) struct HtmlInline {
    lang: Language,
    theme: Theme,
    pre_class: Option<String>,
    debug: bool,
}

impl HtmlInline {
    pub fn new(lang: Language, theme: Theme, pre_class: Option<String>, debug: bool) -> Self {
        Self {
            lang,
            theme,
            pre_class,
            debug,
        }
    }
}

impl Formatter for HtmlInline {
    fn start<W>(&self, writer: &mut W, _: &str)
    where
        W: std::fmt::Write,
    {
        write!(writer, "<pre class=\"athl");

        if let Some(pre_clas) = &self.pre_class {
            write!(writer, " {}", pre_clas);
        }

        write!(writer, "\" style=\"{}\">", self.theme.pre_style());
        write!(
            writer,
            "<code class=\"language-{}\" translate=\"no\" tabindex=\"0\">",
            self.lang.id_name()
        );
    }

    fn write<W>(
        &self,
        writer: &mut W,
        source: &str,
        events: impl Iterator<Item = Result<HighlightEvent, Error>>,
    ) where
        W: std::fmt::Write,
    {
        let mut renderer = tree_sitter_highlight::HtmlRenderer::new();

        renderer
            .render(events, source.as_bytes(), &move |highlight, output| {
                let scope = HIGHLIGHT_NAMES[highlight.0];

                if self.debug {
                    output.extend(b"data-athl-hl=\"");
                    output.extend(scope.as_bytes());
                    output.extend(b"\"");
                }

                if let Some(style) = self.theme.get_style(scope) {
                    if self.debug {
                        output.extend(b" ");
                    }

                    output.extend(b"style=\"");
                    output.extend(style.css().as_bytes());
                    output.extend(b"\"");
                }
            })
            .expect("TODO");

        // TODO: escape { }
        //             let span = v_htmlescape::escape(span)
        //                 .to_string()
        //                 .replace('{', "&lbrace;")
        //                 .replace('}', "&rbrace;");
        for (i, line) in renderer.lines().enumerate() {
            write!(
                writer,
                "<span class=\"line\" data-athl-no=\"{}\">{}</span>",
                i + 1,
                line
            );
        }
    }

    fn finish<W>(&self, writer: &mut W, _: &str)
    where
        W: std::fmt::Write,
    {
        writer.write_str("</code></pre>");
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    #[test]
    fn test_include_pre_class() {
        let path = Path::new("themes/catppuccin_frappe.json");
        let theme = Theme::from_file(path).unwrap();

        let formatter = HtmlInline::new(
            Language::PlainText,
            theme,
            Some("test-pre-class".to_string()),
            false,
        );
        let mut buffer = String::new();
        formatter.start(&mut buffer, "");

        assert_eq!(buffer, "<pre class=\"athl test-pre-class\" style=\"color: #c6d0f5;background-color: #303446;\"><code class=\"language-plaintext\" translate=\"no\" tabindex=\"0\">");
    }
}

#![allow(unused_must_use)]

use super::Formatter;
use crate::languages::Language;
use crate::{constants::HIGHLIGHT_NAMES, Options};
use tree_sitter_highlight::{Error, HighlightEvent};

pub(crate) struct HtmlInline {
    lang: Language,
    options: Options,
}

impl HtmlInline {
    pub fn new(lang: Language, options: Options) -> Self {
        Self { lang, options }
    }
}

impl Formatter for HtmlInline {
    fn start<W>(&self, writer: &mut W, _: &str)
    where
        W: std::fmt::Write,
    {
        write!(writer, "<pre class=\"athl");

        if let Some(pre_clas) = &self.options.pre_class {
            write!(writer, " {}", pre_clas);
        }

        if let Some(pre_style) = &self.options.theme.pre_style(" ") {
            write!(writer, "\" style=\"{}\">", pre_style);
        } else {
            write!(writer, "\">");
        }

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

                if self.options.include_highlight {
                    output.extend(b"data-highlight=\"");
                    output.extend(scope.as_bytes());
                    output.extend(b"\"");
                }

                if let Some(style) = self.options.theme.get_style(scope) {
                    if self.options.include_highlight {
                        output.extend(b" ");
                    }

                    output.extend(b"style=\"");
                    output.extend(style.css(self.options.italic, " ").as_bytes());
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
                "<span class=\"line\" data-line=\"{}\">{}</span>",
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

    #[test]
    fn test_do_not_append_pre_style_if_missing_theme_style() {
        let formatter = HtmlInline::new(Language::PlainText, Options::default());
        let mut buffer = String::new();
        formatter.start(&mut buffer, "");

        assert!(buffer.as_str().contains("<pre class=\"athl\">"));
    }

    #[test]
    fn test_include_pre_class() {
        let formatter = HtmlInline::new(
            Language::PlainText,
            Options {
                pre_class: Some("test-pre-class".to_string()),
                ..Default::default()
            },
        );
        let mut buffer = String::new();
        formatter.start(&mut buffer, "");

        assert!(buffer
            .as_str()
            .contains("<pre class=\"athl test-pre-class\">"));
    }
}

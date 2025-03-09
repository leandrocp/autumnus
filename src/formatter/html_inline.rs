#![allow(unused_must_use)]

use super::Formatter;
use crate::languages::Language;
use crate::{constants::HIGHLIGHT_NAMES, FormatterOption, Options};
use tree_sitter_highlight::{Error, HighlightEvent};

pub(crate) struct HtmlInline<'a> {
    lang: Language,
    options: Options<'a>,
}

impl<'a> HtmlInline<'a> {
    pub fn new(lang: Language, options: Options<'a>) -> Self {
        Self { lang, options }
    }
}

impl Formatter for HtmlInline<'_> {
    fn start<W>(&self, writer: &mut W, _: &str)
    where
        W: std::fmt::Write,
    {
        let class = if let FormatterOption::HtmlInline {
            pre_class: Some(pre_clas),
            italic: _,
            include_highlight: _,
        } = &self.options.formatter
        {
            format!("athl {}", pre_clas)
        } else {
            "athl".to_string()
        };

        write!(
            writer,
            "<pre class=\"{}\"{}><code class=\"language-{}\" translate=\"no\" tabindex=\"0\">",
            class,
            if let Some(pre_style) = self.options.theme.pre_style(" ") {
                format!(" style=\"{}\"", pre_style)
            } else {
                String::new()
            },
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

        let (highlight_attr, include_highlight) = if let FormatterOption::HtmlInline {
            include_highlight,
            ..
        } = &self.options.formatter
        {
            if *include_highlight {
                (" data-highlight=\"", true)
            } else {
                ("", false)
            }
        } else {
            ("", false)
        };

        let italic = if let FormatterOption::HtmlInline { italic, .. } = &self.options.formatter {
            *italic
        } else {
            false
        };

        renderer
            .render(events, source.as_bytes(), &move |highlight, output| {
                let scope = HIGHLIGHT_NAMES[highlight.0];

                if include_highlight {
                    output.extend(highlight_attr.as_bytes());
                    output.extend(scope.as_bytes());
                    output.extend(b"\"");
                }

                if let Some(style) = self.options.theme.get_style(scope) {
                    if include_highlight {
                        output.extend(b" ");
                    }

                    output.extend(b"style=\"");
                    output.extend(style.css(italic, " ").as_bytes());
                    output.extend(b"\"");
                }
            })
            .expect("failed to render highlight events");

        for (i, line) in renderer.lines().enumerate() {
            write!(
                writer,
                "<span class=\"line\" data-line=\"{}\">{}</span>",
                i + 1,
                line.replace('{', "&lbrace;").replace('}', "&rbrace;")
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

impl Default for HtmlInline<'_> {
    fn default() -> Self {
        Self {
            lang: Language::PlainText,
            options: Options::default(),
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::themes;

    use super::*;

    #[test]
    fn test_do_not_append_pre_style_if_missing_theme_style() {
        let formatter = HtmlInline::default();
        let mut buffer = String::new();
        formatter.start(&mut buffer, "");

        assert!(buffer.as_str().contains("<pre class=\"athl\">"));
    }

    #[test]
    fn test_include_pre_class() {
        let mut formatter = HtmlInline::default();
        formatter.options.formatter = FormatterOption::HtmlInline {
            pre_class: Some("test-pre-class".to_string()),
            italic: false,
            include_highlight: false,
        };
        let mut buffer = String::new();
        formatter.start(&mut buffer, "");

        assert!(buffer
            .as_str()
            .contains("<pre class=\"athl test-pre-class\">"));
    }

    #[test]
    fn test_include_pre_class_with_theme() {
        let mut formatter = HtmlInline::default();
        formatter.options.formatter = FormatterOption::HtmlInline {
            pre_class: Some("test-pre-class".to_string()),
            italic: false,
            include_highlight: false,
        };
        formatter.options.theme = themes::get("github_light").expect("Theme not found");
        let mut buffer = String::new();
        formatter.start(&mut buffer, "");

        assert!(buffer
            .as_str()
            .contains("<pre class=\"athl test-pre-class\" style=\"color: #1f2328; background-color: #ffffff;\">"));
    }
}

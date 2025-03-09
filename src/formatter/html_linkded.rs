#![allow(unused_must_use)]

use super::Formatter;
use crate::languages::Language;
use crate::{constants::CLASSES, constants::HIGHLIGHT_NAMES, FormatterOption, Options};
use tree_sitter_highlight::{Error, HighlightEvent};

pub(crate) struct HtmlLinked<'a> {
    lang: Language,
    options: Options<'a>,
}

impl<'a> HtmlLinked<'a> {
    pub fn new(lang: Language, options: Options<'a>) -> Self {
        Self { lang, options }
    }
}

impl Formatter for HtmlLinked<'_> {
    fn start<W>(&self, writer: &mut W, _: &str)
    where
        W: std::fmt::Write,
    {
        let class = if let FormatterOption::HtmlLinked {
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
            "<pre class=\"{}\"><code class=\"language-{}\" translate=\"no\" tabindex=\"0\">",
            class,
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

        let (highlight_attr, include_highlight) = if let FormatterOption::HtmlLinked {
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

        // FIXME: implement italic
        let _italic = if let FormatterOption::HtmlLinked { italic, .. } = &self.options.formatter {
            *italic
        } else {
            false
        };

        renderer
            .render(events, source.as_bytes(), &move |highlight, output| {
                let scope = HIGHLIGHT_NAMES[highlight.0];
                let class = CLASSES[highlight.0];

                if include_highlight {
                    output.extend(b" data-highlight=\"");
                    output.extend(highlight_attr.as_bytes());
                    output.extend(scope.as_bytes());
                    output.extend(b"\"");
                }

                output.extend(b"class=\"");
                output.extend(class.as_bytes());
                output.extend(b"\"");
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

impl Default for HtmlLinked<'_> {
    fn default() -> Self {
        Self {
            lang: Language::PlainText,
            options: Options {
                formatter: FormatterOption::HtmlLinked {
                    pre_class: None,
                    italic: false,
                    include_highlight: false,
                },
                ..Options::default()
            },
        }
    }
}

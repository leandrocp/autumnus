#![allow(unused_must_use)]

use super::Formatter;
use crate::languages::Language;
use crate::{constants::CLASSES, constants::HIGHLIGHT_NAMES, Options};
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
        let class = if let Some(pre_clas) = self.options.pre_class {
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

        let highlight_attr = if self.options.include_highlight {
            " data-highlight=\""
        } else {
            ""
        };

        renderer
            .render(events, source.as_bytes(), &move |highlight, output| {
                let scope = HIGHLIGHT_NAMES[highlight.0];
                let class = CLASSES[highlight.0];

                if self.options.include_highlight {
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

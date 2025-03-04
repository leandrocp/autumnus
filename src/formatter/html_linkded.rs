#![allow(unused_must_use)]

use super::Formatter;
use crate::languages::Language;
use crate::{constants::CLASSES, constants::HIGHLIGHT_NAMES, Options};
use tree_sitter_highlight::{Error, HighlightEvent};

pub(crate) struct HtmlLinked {
    lang: Language,
    options: Options,
}

impl HtmlLinked {
    pub fn new(lang: Language, options: Options) -> Self {
        Self { lang, options }
    }
}

impl Formatter for HtmlLinked {
    fn start<W>(&self, writer: &mut W, _: &str)
    where
        W: std::fmt::Write,
    {
        write!(writer, "<pre class=\"athl");

        if let Some(pre_clas) = &self.options.pre_class {
            write!(writer, " {}", pre_clas);
        }

        write!(
            writer,
            "\"><code class=\"language-{}\" translate=\"no\" tabindex=\"0\">",
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
                let class = CLASSES[highlight.0];

                if self.options.include_highlight {
                    output.extend(b"data-highlight=\"");
                    output.extend(scope.as_bytes());
                    output.extend(b"\"");
                }

                output.extend(b"class=\"");
                output.extend(class.as_bytes());
                output.extend(b"\"");
            })
            .expect("TODO");

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

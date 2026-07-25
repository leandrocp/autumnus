use lumis::events::HighlightEvent;
use lumis::highlight::{highlight_events_with_languages, HighlightOptions};
use lumis::languages::Language;
use lumis_core::formatter::bbcode::BBCodeScoped;
use lumis_core::formatter::html_inline::{
    HighlightLines as InlineHighlightLines, HighlightLinesStyle as InlineHighlightLinesStyle,
    HtmlInline,
};
use lumis_core::formatter::html_linked::{HighlightLines as LinkedHighlightLines, HtmlLinked};
use lumis_core::formatter::terminal::{Background as TerminalBackground, Terminal};
use lumis_core::formatter::{Formatter as _, HtmlElement};
use lumis_core::themes::{Appearance, Style, Theme};
use napi::bindgen_prelude::{AsyncTask, Buffer};
use napi::{Env, Error, Result, Status, Task};
use napi_derive::napi;
use serde::Deserialize;
use std::collections::{BTreeMap, HashSet};
use std::ops::RangeInclusive;
use std::sync::{Arc, RwLock};

fn native_error(error: impl std::fmt::Display) -> Error {
    Error::new(Status::GenericFailure, error.to_string())
}

#[derive(Deserialize)]
#[serde(untagged)]
enum LineSpec {
    Single(usize),
    Range([usize; 2]),
}

impl LineSpec {
    fn into_range(self) -> RangeInclusive<usize> {
        match self {
            Self::Single(line) => line..=line,
            Self::Range([start, end]) => start..=end,
        }
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct JsHighlightLines {
    lines: Vec<LineSpec>,
    style: Option<String>,
    class: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct JsHtmlElement {
    open_tag: String,
    close_tag: String,
}

impl From<JsHtmlElement> for HtmlElement {
    fn from(value: JsHtmlElement) -> Self {
        Self {
            open_tag: value.open_tag,
            close_tag: value.close_tag,
        }
    }
}

#[derive(Deserialize)]
struct JsTheme {
    name: String,
    appearance: Appearance,
    #[serde(default)]
    revision: String,
    highlights: BTreeMap<String, Style>,
}

impl From<JsTheme> for Theme {
    fn from(value: JsTheme) -> Self {
        Self {
            name: value.name,
            appearance: value.appearance,
            revision: value.revision,
            highlights: value.highlights,
        }
    }
}

#[derive(Default, Deserialize)]
#[serde(default, rename_all = "camelCase")]
struct HtmlInlineOptions {
    theme: Option<JsTheme>,
    pre_class: Option<String>,
    italic: bool,
    include_highlights: bool,
    highlight_lines: Option<JsHighlightLines>,
    header: Option<JsHtmlElement>,
}

#[derive(Default, Deserialize)]
#[serde(default, rename_all = "camelCase")]
struct HtmlLinkedOptions {
    pre_class: Option<String>,
    highlight_lines: Option<JsHighlightLines>,
    header: Option<JsHtmlElement>,
}

#[derive(Default, Deserialize)]
#[serde(default)]
struct TerminalOptions {
    theme: Option<JsTheme>,
}

#[napi(object)]
pub struct NativeFormatter {
    pub rainbow_brackets: Option<bool>,
    pub kind: String,
    pub options: serde_json::Value,
}

struct FormatRequest {
    source: String,
    language: String,
    formatter: NativeFormatter,
}

type LoadedLanguages = Arc<RwLock<HashSet<Language>>>;
const SOURCE_EVENT: u8 = 0;
const START_EVENT: u8 = 1;
const END_EVENT: u8 = 2;

fn inline_highlight_lines(value: JsHighlightLines) -> InlineHighlightLines {
    InlineHighlightLines {
        lines: value.lines.into_iter().map(LineSpec::into_range).collect(),
        style: Some(match value.style.as_deref() {
            None | Some("theme") => InlineHighlightLinesStyle::Theme,
            Some(style) => InlineHighlightLinesStyle::Style(style.to_string()),
        }),
        class: value.class,
    }
}

fn render_formatter(
    loaded_languages: &RwLock<HashSet<Language>>,
    request: FormatRequest,
) -> std::result::Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let FormatRequest {
        source,
        language: language_name,
        formatter,
    } = request;
    let language = if language_name == "plaintext" {
        Language::PlainText
    } else {
        language_name.parse()?
    };
    let languages = loaded_languages
        .read()
        .map_err(|_| std::io::Error::other("native language lock poisoned"))?;
    let events = highlight_events_with_languages(
        &source,
        language,
        HighlightOptions::new().rainbow_brackets(formatter.rainbow_brackets.unwrap_or(false)),
        &languages,
    )?;
    let mut output = Vec::new();

    match formatter.kind.as_str() {
        "html-inline" => {
            let options: HtmlInlineOptions = serde_json::from_value(formatter.options)?;
            HtmlInline::new(
                language,
                options.theme.map(Theme::from),
                options.pre_class,
                options.italic,
                options.include_highlights,
                options.highlight_lines.map(inline_highlight_lines),
                options.header.map(HtmlElement::from),
            )
            .render(&source, &events, &mut output)?;
        }
        "html-linked" => {
            let options: HtmlLinkedOptions = serde_json::from_value(formatter.options)?;
            HtmlLinked::new(
                language,
                options.pre_class,
                options.highlight_lines.map(|lines| LinkedHighlightLines {
                    lines: lines.lines.into_iter().map(LineSpec::into_range).collect(),
                    class: lines.class.unwrap_or_else(|| "l-highlighted".to_string()),
                }),
                options.header.map(HtmlElement::from),
            )
            .render(&source, &events, &mut output)?;
        }
        "bbcode-scoped" => {
            BBCodeScoped::new(language).render(&source, &events, &mut output)?;
        }
        "terminal" => {
            let options: TerminalOptions = serde_json::from_value(formatter.options)?;
            Terminal::new(
                language,
                options.theme.map(Theme::from),
                TerminalBackground::Inherit,
                None,
            )
            .render(&source, &events, &mut output)?;
        }
        _ => {
            return Err(format!("unsupported native formatter '{}'", formatter.kind).into());
        }
    }

    Ok(String::from_utf8(output)?)
}

/// Encode the event protocol documented and decoded in
/// `src/core/native-event-codec.ts`.
fn encode_events(events: &[HighlightEvent]) -> Result<Buffer> {
    let mut output = Vec::with_capacity(events.len() * 9);
    for event in events {
        match event {
            HighlightEvent::Source { start, end } => {
                let start = u32::try_from(*start).map_err(native_error)?;
                let end = u32::try_from(*end).map_err(native_error)?;
                output.push(SOURCE_EVENT);
                output.extend_from_slice(&start.to_le_bytes());
                output.extend_from_slice(&end.to_le_bytes());
            }
            HighlightEvent::Start {
                scope_index,
                language,
            } => {
                let scope_index = u16::try_from(*scope_index).map_err(native_error)?;
                let language_len = u16::try_from(language.len()).map_err(native_error)?;
                output.push(START_EVENT);
                output.extend_from_slice(&scope_index.to_le_bytes());
                output.extend_from_slice(&language_len.to_le_bytes());
                output.extend_from_slice(language.as_bytes());
            }
            HighlightEvent::End => output.push(END_EVENT),
            HighlightEvent::AnnotationStart { .. } | HighlightEvent::AnnotationEnd => {
                return Err(native_error(
                    "the native event protocol only supports syntax events",
                ));
            }
        }
    }
    Ok(output.into())
}

pub struct FormatTask {
    loaded_languages: LoadedLanguages,
    request: Option<FormatRequest>,
}

impl Task for FormatTask {
    type Output = String;
    type JsValue = String;

    fn compute(&mut self) -> Result<Self::Output> {
        render_formatter(
            &self.loaded_languages,
            self.request.take().expect("format task already consumed"),
        )
        .map_err(native_error)
    }

    fn resolve(&mut self, _env: Env, output: Self::Output) -> Result<Self::JsValue> {
        Ok(output)
    }
}

/// A per-highlighter native runtime backed by Lumis's compiled Rust parsers and queries.
#[derive(Default)]
#[napi]
pub struct NativeRuntime {
    loaded_languages: LoadedLanguages,
}

#[napi]
impl NativeRuntime {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self::default()
    }

    #[napi(js_name = "loadLanguage")]
    pub fn load_language(&self, id: String) -> Result<()> {
        let language = id.parse().map_err(native_error)?;
        self.loaded_languages
            .write()
            .map_err(|_| native_error("native language lock poisoned"))?
            .insert(language);
        Ok(())
    }

    /// Return the complete nested event stream as one compact binary value.
    #[napi(js_name = "highlightEvents")]
    pub fn highlight_events(
        &self,
        source: String,
        language: String,
        rainbow_brackets: Option<bool>,
    ) -> Result<Buffer> {
        let language = language.parse().map_err(native_error)?;
        let languages = self
            .loaded_languages
            .read()
            .map_err(|_| native_error("native language lock poisoned"))?;
        let events = highlight_events_with_languages(
            &source,
            language,
            HighlightOptions::new().rainbow_brackets(rainbow_brackets.unwrap_or(false)),
            &languages,
        )
        .map_err(native_error)?;
        encode_events(&events)
    }

    /// Parse and render built-in formatters entirely in Rust, returning one string.
    #[napi]
    pub fn format(
        &self,
        source: String,
        language: String,
        formatter: NativeFormatter,
    ) -> Result<String> {
        render_formatter(
            &self.loaded_languages,
            FormatRequest {
                source,
                language,
                formatter,
            },
        )
        .map_err(native_error)
    }

    /// Run async API formatting on Node's worker pool.
    #[napi(js_name = "formatAsync")]
    pub fn format_async(
        &self,
        source: String,
        language: String,
        formatter: NativeFormatter,
    ) -> AsyncTask<FormatTask> {
        AsyncTask::new(FormatTask {
            loaded_languages: Arc::clone(&self.loaded_languages),
            request: Some(FormatRequest {
                source,
                language,
                formatter,
            }),
        })
    }
}

#[napi]
pub fn runtime_kind() -> &'static str {
    "native"
}

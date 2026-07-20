use lumis_core::formatter::bbcode::BBCodeScoped;
use lumis_core::formatter::html_inline::{
    HighlightLines as InlineHighlightLines, HighlightLinesStyle as InlineHighlightLinesStyle,
    HtmlInline,
};
use lumis_core::formatter::html_linked::{HighlightLines as LinkedHighlightLines, HtmlLinked};
use lumis_core::formatter::terminal::{Background as TerminalBackground, Terminal};
use lumis_core::formatter::{Formatter as _, HtmlElement};
use lumis_core::languages::Language;
use lumis_core::themes::{Appearance, Style, Theme};
use lumis_wasm_runtime::{LanguageSpec, Runtime};
use napi::bindgen_prelude::{AsyncTask, Buffer};
use napi::{Env, Error, Result, Status, Task};
use napi_derive::napi;
use serde::Deserialize;
use std::collections::BTreeMap;
use std::ops::RangeInclusive;
use std::sync::Arc;

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
    runtime: &Runtime,
    source: &str,
    language_name: &str,
    rainbow_brackets: bool,
    kind: &str,
    options_json: &str,
) -> std::result::Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let language = if language_name == "plaintext" {
        Language::PlainText
    } else {
        language_name.parse()?
    };
    let events = runtime.highlight(source, language_name, rainbow_brackets)?;
    let mut output = Vec::new();

    match kind {
        "html-inline" => {
            let options: HtmlInlineOptions = serde_json::from_str(options_json)?;
            HtmlInline::new(
                language,
                options.theme.map(Theme::from),
                options.pre_class,
                options.italic,
                options.include_highlights,
                options.highlight_lines.map(inline_highlight_lines),
                options.header.map(HtmlElement::from),
            )
            .render(source, &events, &mut output)?;
        }
        "html-linked" => {
            let options: HtmlLinkedOptions = serde_json::from_str(options_json)?;
            HtmlLinked::new(
                language,
                options.pre_class,
                options.highlight_lines.map(|lines| LinkedHighlightLines {
                    lines: lines.lines.into_iter().map(LineSpec::into_range).collect(),
                    class: lines.class.unwrap_or_else(|| "l-highlighted".to_string()),
                }),
                options.header.map(HtmlElement::from),
            )
            .render(source, &events, &mut output)?;
        }
        "bbcode-scoped" => {
            BBCodeScoped::new(language).render(source, &events, &mut output)?;
        }
        "terminal" => {
            let options: TerminalOptions = serde_json::from_str(options_json)?;
            Terminal::new(
                language,
                options.theme.map(Theme::from),
                TerminalBackground::Inherit,
                None,
            )
            .render(source, &events, &mut output)?;
        }
        _ => return Err(format!("unsupported native formatter '{kind}'").into()),
    }

    Ok(String::from_utf8(output)?)
}

pub struct LoadLanguageTask {
    runtime: Arc<Runtime>,
    spec: Option<LanguageSpec>,
}

impl Task for LoadLanguageTask {
    type Output = ();
    type JsValue = ();

    fn compute(&mut self) -> Result<Self::Output> {
        self.runtime
            .load_language(self.spec.take().expect("language task already consumed"))
            .map_err(native_error)
    }

    fn resolve(&mut self, _env: Env, output: Self::Output) -> Result<Self::JsValue> {
        Ok(output)
    }
}

pub struct ConfigureLanguageTask {
    runtime: Arc<Runtime>,
    language: String,
    highlights: String,
    injections: String,
    locals: String,
}

impl Task for ConfigureLanguageTask {
    type Output = ();
    type JsValue = ();

    fn compute(&mut self) -> Result<Self::Output> {
        self.runtime
            .configure_language(
                &self.language,
                &self.highlights,
                &self.injections,
                &self.locals,
            )
            .map_err(native_error)
    }

    fn resolve(&mut self, _env: Env, output: Self::Output) -> Result<Self::JsValue> {
        Ok(output)
    }
}

pub struct FormatTask {
    runtime: Arc<Runtime>,
    source: String,
    language: String,
    rainbow_brackets: bool,
    kind: String,
    options_json: String,
}

impl Task for FormatTask {
    type Output = String;
    type JsValue = String;

    fn compute(&mut self) -> Result<Self::Output> {
        render_formatter(
            &self.runtime,
            &self.source,
            &self.language,
            self.rainbow_brackets,
            &self.kind,
            &self.options_json,
        )
        .map_err(native_error)
    }

    fn resolve(&mut self, _env: Env, output: Self::Output) -> Result<Self::JsValue> {
        Ok(output)
    }
}

/// A per-highlighter native runtime. The JavaScript layer owns parser asset
/// resolution and passes the exact same language definitions used by browsers.
#[napi]
pub struct NativeRuntime {
    inner: Arc<Runtime>,
}

#[napi]
impl NativeRuntime {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        Ok(Self {
            inner: Arc::new(Runtime::new().map_err(native_error)?),
        })
    }

    #[napi(js_name = "loadLanguage")]
    #[allow(clippy::too_many_arguments)]
    pub fn load_language(
        &self,
        id: String,
        aliases: Vec<String>,
        grammar_name: String,
        wasm: Buffer,
        highlights: String,
        injections: Option<String>,
        locals: Option<String>,
        brackets: Option<String>,
    ) -> Result<()> {
        self.inner
            .load_language(LanguageSpec {
                id,
                aliases,
                grammar_name,
                wasm: wasm.to_vec(),
                highlights,
                injections: injections.unwrap_or_default(),
                locals: locals.unwrap_or_default(),
                brackets: brackets.unwrap_or_default(),
            })
            .map_err(native_error)
    }

    #[napi(js_name = "loadLanguageAsync")]
    #[allow(clippy::too_many_arguments)]
    pub fn load_language_async(
        &self,
        id: String,
        aliases: Vec<String>,
        grammar_name: String,
        wasm: Buffer,
        highlights: String,
        injections: Option<String>,
        locals: Option<String>,
        brackets: Option<String>,
    ) -> AsyncTask<LoadLanguageTask> {
        AsyncTask::new(LoadLanguageTask {
            runtime: Arc::clone(&self.inner),
            spec: Some(LanguageSpec {
                id,
                aliases,
                grammar_name,
                wasm: wasm.to_vec(),
                highlights,
                injections: injections.unwrap_or_default(),
                locals: locals.unwrap_or_default(),
                brackets: brackets.unwrap_or_default(),
            }),
        })
    }

    #[napi(js_name = "hasLanguage")]
    pub fn has_language(&self, name_or_alias: String) -> bool {
        self.inner.has_language(&name_or_alias)
    }

    #[napi(js_name = "configureLanguageAsync")]
    pub fn configure_language_async(
        &self,
        language: String,
        highlights: String,
        injections: String,
        locals: String,
    ) -> AsyncTask<ConfigureLanguageTask> {
        AsyncTask::new(ConfigureLanguageTask {
            runtime: Arc::clone(&self.inner),
            language,
            highlights,
            injections,
            locals,
        })
    }

    /// Return the complete nested event stream as one compact binary value.
    #[napi(js_name = "highlightEvents")]
    pub fn highlight_events(
        &self,
        source: String,
        language: String,
        rainbow_brackets: Option<bool>,
    ) -> Result<Buffer> {
        self.inner
            .highlight_encoded(&source, &language, rainbow_brackets.unwrap_or(false))
            .map(Buffer::from)
            .map_err(native_error)
    }

    /// Parse and render built-in formatters entirely in Rust, returning one string.
    #[napi]
    pub fn format(
        &self,
        source: String,
        language: String,
        rainbow_brackets: bool,
        kind: String,
        options_json: String,
    ) -> Result<String> {
        render_formatter(
            &self.inner,
            &source,
            &language,
            rainbow_brackets,
            &kind,
            &options_json,
        )
        .map_err(native_error)
    }

    /// Run async API formatting on Node's worker pool.
    #[napi(js_name = "formatAsync")]
    pub fn format_async(
        &self,
        source: String,
        language: String,
        rainbow_brackets: bool,
        kind: String,
        options_json: String,
    ) -> AsyncTask<FormatTask> {
        AsyncTask::new(FormatTask {
            runtime: Arc::clone(&self.inner),
            source,
            language,
            rainbow_brackets,
            kind,
            options_json,
        })
    }
}

#[napi]
pub fn runtime_kind() -> &'static str {
    "native"
}

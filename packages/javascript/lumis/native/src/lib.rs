use lumis_core::events::HighlightEvent;
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
use lumis_wasm_runtime::{catalog, store, HighlightOptions, Runtime};
use napi::bindgen_prelude::{AsyncTask, Buffer};
use napi::{Env, Error, Result, Status, Task};
use napi_derive::napi;
use serde::Deserialize;
use std::collections::BTreeMap;
use std::ops::RangeInclusive;
use std::path::PathBuf;
use std::sync::LazyLock;

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

/// One runtime per process, so a parser is downloaded, verified and compiled
/// once however many highlighters the caller creates.
static RUNTIME: LazyLock<std::result::Result<Runtime, String>> = LazyLock::new(build_runtime);

fn build_runtime() -> std::result::Result<Runtime, String> {
    let workers = std::thread::available_parallelism()
        .map(usize::from)
        .unwrap_or(1);
    let runtime = Runtime::with_worker_limit(workers)
        .map_err(|error| error.to_string())?
        .with_store(language_store(None));
    for language in catalog::LANGUAGES {
        runtime.declare_language(language.id, language.aliases);
    }
    Ok(runtime)
}

fn runtime() -> Result<&'static Runtime> {
    RUNTIME.as_ref().map_err(native_error)
}

/// The same resolve, verify and cache path the CLI and the Elixir NIF use.
fn language_store(cache_dir: Option<PathBuf>) -> store::LanguageStore {
    let cache_dir = cache_dir
        .or_else(|| std::env::var_os("LUMIS_DATA_DIR").map(PathBuf::from))
        .unwrap_or_else(default_data_dir);

    store::LanguageStore::new(
        store::StoreConfig {
            cache_dir,
            source_dir: store::LanguageStore::source_dir_from_env(),
        },
        Box::new(store::HttpFetcher),
    )
}

fn default_data_dir() -> PathBuf {
    use etcetera::BaseStrategy;

    etcetera::choose_base_strategy()
        .map(|strategy| strategy.data_dir().join("lumis"))
        .unwrap_or_else(|_| PathBuf::from(".lumis"))
}

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
    let events = highlight_events(
        &source,
        &language_name,
        formatter.rainbow_brackets.unwrap_or(false),
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
        }
    }
    Ok(output.into())
}

pub struct FormatTask {
    request: Option<FormatRequest>,
}

impl Task for FormatTask {
    type Output = String;
    type JsValue = String;

    fn compute(&mut self) -> Result<Self::Output> {
        render_formatter(self.request.take().expect("format task already consumed"))
            .map_err(native_error)
    }

    fn resolve(&mut self, _env: Env, output: Self::Output) -> Result<Self::JsValue> {
        Ok(output)
    }
}

/// Resolve, download, verify and load `language`, then highlight in one pass.
///
/// Languages injected inside the document are loaded during the same walk, so
/// this is the whole of what highlighting needs.
fn highlight_events(
    source: &str,
    language: &str,
    rainbow_brackets: bool,
) -> std::result::Result<Vec<HighlightEvent>, Box<dyn std::error::Error + Send + Sync>> {
    if language == "plaintext" {
        return Ok(vec![HighlightEvent::Source {
            start: 0,
            end: source.len(),
        }]);
    }

    let runtime = RUNTIME.as_ref().map_err(|error| error.clone())?;
    Ok(runtime
        .highlight_with(
            source,
            language,
            &HighlightOptions {
                rainbow_brackets,
                ..HighlightOptions::default()
            },
        )?
        .events)
}

/// Highlighting over Lumis's shared Wasmtime runtime, which every Lumis runtime
/// resolves, verifies, caches and loads parsers through.
#[derive(Default)]
#[napi]
pub struct NativeRuntime;

#[napi]
impl NativeRuntime {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self
    }

    /// Download, verify and load `id` ahead of a highlight that would do it
    /// anyway, so the cost does not land on a request.
    #[napi(js_name = "loadLanguage")]
    pub fn load_language(&self, id: String) -> Result<()> {
        runtime()?.load_named_language(&id).map_err(native_error)
    }

    #[napi(js_name = "hasLanguage")]
    pub fn has_language(&self, id: String) -> Result<bool> {
        Ok(runtime()?.has_language(&id))
    }

    /// Download and cache `id` without loading it, for build-time prefetching.
    /// Returns the path its parser was written to.
    #[napi(js_name = "cacheLanguage")]
    pub fn cache_language(
        &self,
        id: String,
        directory: Option<String>,
        force: Option<bool>,
    ) -> Result<String> {
        let owned;
        let store = match directory {
            Some(directory) => {
                owned = language_store(Some(PathBuf::from(directory)));
                &owned
            }
            None => runtime()?
                .store()
                .ok_or_else(|| native_error("this runtime has no language store"))?,
        };
        store
            .cache_language(&id, force.unwrap_or(false))
            .map(|path| path.display().to_string())
            .map_err(native_error)
    }

    /// Return the complete nested event stream as one compact binary value.
    #[napi(js_name = "highlightEvents")]
    pub fn highlight_events(
        &self,
        source: String,
        language: String,
        rainbow_brackets: Option<bool>,
    ) -> Result<Buffer> {
        let events = highlight_events(&source, &language, rainbow_brackets.unwrap_or(false))
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
        render_formatter(FormatRequest {
            source,
            language,
            formatter,
        })
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

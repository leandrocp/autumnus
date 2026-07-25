use std::collections::HashMap;
use std::io::{self, Write};

mod elixir;

use elixir::{ExCssOptions, ExFormatterOption, ExTheme};
use lumis::annotations::{AnnotationRange, Position};
use lumis::events::HighlightEvent;
use lumis::formatters::Formatter;
use lumis::languages::Language;
use lumis::{languages, themes, Annotation, HighlightOptions};
use once_cell::sync::Lazy;
use parking_lot::{Mutex, RwLock};
use rustler::{Decoder, Encoder, Env, Error, NifMap, NifResult, NifStruct, Term};

/// Lazy per-theme cache to eliminate repeated allocations.
/// Themes are converted and cached on first access, amortizing the cost.
static THEME_CACHE: Lazy<RwLock<HashMap<String, ExTheme>>> =
    Lazy::new(|| RwLock::new(HashMap::new()));

/// Cached list of theme names to avoid repeated allocations.
/// Built once on first call to available_themes().
static THEME_NAMES: Lazy<Vec<String>> = Lazy::new(|| {
    themes::available_themes()
        .map(|theme| theme.name.to_owned())
        .collect()
});

rustler::atoms! {
    ok,
    error,
    event_start = "start",
    event_source = "source",
    event_end = "end",
    annotation_start,
    annotation_end,
}

rustler::init!("Elixir.Lumis.Native");

#[derive(Debug, NifMap)]
pub struct ExOptions<'a> {
    pub language: Option<&'a str>,
    pub formatter: ExFormatterOption,
    pub annotations: Vec<ExAnnotation<'a>>,
    pub rainbow_brackets: bool,
}

#[derive(Clone, Copy, Debug, NifStruct)]
#[module = "Lumis.Position"]
pub struct ExPosition {
    pub line: usize,
    pub column: usize,
}

impl From<ExPosition> for Position {
    fn from(position: ExPosition) -> Self {
        Self::new(position.line, position.column)
    }
}

#[derive(Clone, Copy, Debug, NifStruct)]
#[module = "Lumis.Range.Offset"]
pub struct ExOffsetRange {
    pub start: usize,
    pub end: usize,
}

#[derive(Clone, Debug, NifStruct)]
#[module = "Lumis.Range.Position"]
pub struct ExPositionRange {
    pub start: ExPosition,
    pub end: ExPosition,
}

#[derive(Clone, Debug)]
pub enum ExAnnotationRange {
    Offset(ExOffsetRange),
    Position(ExPositionRange),
}

impl<'a> Decoder<'a> for ExAnnotationRange {
    fn decode(term: Term<'a>) -> NifResult<Self> {
        if let Ok(range) = term.decode::<ExOffsetRange>() {
            return Ok(Self::Offset(range));
        }
        if let Ok(range) = term.decode::<ExPositionRange>() {
            return Ok(Self::Position(range));
        }

        Err(Error::BadArg)
    }
}

impl Encoder for ExAnnotationRange {
    fn encode<'a>(&self, env: Env<'a>) -> Term<'a> {
        match self {
            Self::Offset(range) => range.encode(env),
            Self::Position(range) => range.encode(env),
        }
    }
}

#[derive(Clone, Debug, NifStruct)]
#[module = "Lumis.Annotation"]
pub struct ExAnnotation<'a> {
    pub range: ExAnnotationRange,
    pub properties: Term<'a>,
}

#[derive(Clone, Debug, NifStruct)]
#[module = "Lumis.Annotation"]
pub struct ExResolvedAnnotation<'a> {
    pub range: ExOffsetRange,
    pub properties: Term<'a>,
}

#[derive(Debug, NifMap)]
pub struct ExEventOptions<'a> {
    pub language: Option<&'a str>,
    pub annotations: Vec<ExAnnotation<'a>>,
    pub rainbow_brackets: bool,
}

#[derive(Debug, NifMap)]
struct ExStartEvent {
    scope: String,
    language: String,
}

#[derive(Debug, NifMap)]
struct ExSourceEvent {
    start: usize,
    end: usize,
}

enum CollectedEvent<'a> {
    Start { scope: String, language: String },
    Source { start: usize, end: usize },
    End,
    AnnotationStart(ExResolvedAnnotation<'a>),
    AnnotationEnd,
}

impl<'a> CollectedEvent<'a> {
    fn encode(self, env: Env<'a>) -> Term<'a> {
        match self {
            Self::Start { scope, language } => {
                (event_start(), ExStartEvent { scope, language }).encode(env)
            }
            Self::Source { start, end } => {
                (event_source(), ExSourceEvent { start, end }).encode(env)
            }
            Self::End => event_end().encode(env),
            Self::AnnotationStart(annotation) => (annotation_start(), annotation).encode(env),
            Self::AnnotationEnd => annotation_end().encode(env),
        }
    }
}

struct EventFormatter<'a> {
    language: Language,
    events: Mutex<Vec<CollectedEvent<'a>>>,
}

impl<'a> EventFormatter<'a> {
    fn new(language: Language) -> Self {
        Self {
            language,
            events: Mutex::new(Vec::new()),
        }
    }

    fn into_events(self) -> Vec<CollectedEvent<'a>> {
        self.events.into_inner()
    }
}

impl<'a> Formatter<Term<'a>> for EventFormatter<'a> {
    fn language(&self) -> Language {
        self.language
    }

    fn render(
        &self,
        _source: &str,
        events: &[HighlightEvent<'_, Term<'a>>],
        _output: &mut dyn Write,
    ) -> io::Result<()> {
        let mut output = self.events.lock();

        for event in events {
            let event = match event {
                HighlightEvent::Start {
                    scope_index,
                    language,
                } => CollectedEvent::Start {
                    scope: lumis::highlights::HIGHLIGHT_NAMES[*scope_index].to_owned(),
                    language: language.clone(),
                },
                HighlightEvent::Source { start, end } => CollectedEvent::Source {
                    start: *start,
                    end: *end,
                },
                HighlightEvent::End => CollectedEvent::End,
                HighlightEvent::AnnotationStart { annotation } => {
                    CollectedEvent::AnnotationStart(ExResolvedAnnotation {
                        range: ExOffsetRange {
                            start: annotation.range().start,
                            end: annotation.range().end,
                        },
                        properties: *annotation.properties(),
                    })
                }
                HighlightEvent::AnnotationEnd => CollectedEvent::AnnotationEnd,
            };
            output.push(event);
        }

        Ok(())
    }
}

#[rustler::nif(schedule = "DirtyCpu")]
pub fn highlight<'a>(env: Env<'a>, source: &'a str, options: ExOptions) -> NifResult<Term<'a>> {
    let language = lumis::languages::Language::guess(options.language, source);
    let annotations = decode_annotations(options.annotations)?;
    let formatter = options
        .formatter
        .into_formatter(language)
        .map_err(|e| Error::Term(Box::new(e)))?;

    let highlight_options = HighlightOptions::new()
        .annotations(&annotations)
        .rainbow_brackets(options.rainbow_brackets);
    let output = lumis::highlight_with_options(source, formatter, highlight_options);

    Ok((ok(), output).encode(env))
}

#[rustler::nif(schedule = "DirtyCpu")]
pub fn highlight_events<'a>(
    env: Env<'a>,
    source: &'a str,
    options: ExEventOptions<'a>,
) -> NifResult<Term<'a>> {
    let language = Language::guess(options.language, source);
    let annotations = decode_annotations(options.annotations)?;
    let formatter = EventFormatter::new(language);
    let highlight_options = HighlightOptions::new()
        .annotations(&annotations)
        .rainbow_brackets(options.rainbow_brackets);

    lumis::write_highlight_with_options(&mut io::sink(), source, &formatter, highlight_options)
        .map_err(|error| Error::Term(Box::new(error.to_string())))?;

    let events = formatter
        .into_events()
        .into_iter()
        .map(|event| event.encode(env))
        .collect::<Vec<_>>();

    Ok((ok(), events).encode(env))
}

fn decode_annotations<'a>(
    annotations: Vec<ExAnnotation<'a>>,
) -> NifResult<Vec<Annotation<Term<'a>>>> {
    annotations
        .into_iter()
        .map(|annotation| {
            let range = match annotation.range {
                ExAnnotationRange::Offset(range) => AnnotationRange::Offset(range.start..range.end),
                ExAnnotationRange::Position(range) => {
                    AnnotationRange::Position(range.start.into()..range.end.into())
                }
            };

            Annotation::new(range, annotation.properties)
        })
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| Error::Term(Box::new(error.to_string())))
}

#[rustler::nif]
fn available_languages() -> HashMap<String, (String, Vec<String>)> {
    languages::available_languages()
}

#[rustler::nif]
fn available_themes() -> Vec<String> {
    // Return a clone of the cached theme names list
    // This is cheaper than rebuilding the list every time
    THEME_NAMES.clone()
}

#[rustler::nif]
fn get_theme(name: &str) -> NifResult<ExTheme> {
    // Fast path: check if theme is already cached (read lock)
    {
        let cache = THEME_CACHE.read();
        if let Some(cached_theme) = cache.get(name) {
            return Ok(cached_theme.clone());
        }
    }

    // Slow path: load theme, convert, and cache it (write lock)
    let theme = themes::get(name).map_err(|_e| Error::Atom("error"))?;
    let ex_theme = ExTheme::from(&theme);

    // Cache the converted theme for future calls
    {
        let mut cache = THEME_CACHE.write();
        cache.insert(name.to_string(), ex_theme.clone());
    }

    Ok(ex_theme)
}

#[rustler::nif]
fn build_theme_from_file(path: &str) -> NifResult<ExTheme> {
    themes::from_file(path)
        .map(|theme| ExTheme::from(&theme))
        .map_err(|_e| Error::Atom("error"))
}

#[rustler::nif]
fn build_theme_from_json_string(json_string: &str) -> NifResult<ExTheme> {
    themes::from_json(json_string)
        .map(|theme| ExTheme::from(&theme))
        .map_err(|_e| Error::Atom("error"))
}

#[rustler::nif]
fn theme_css_from_name(name: &str, options: ExCssOptions) -> NifResult<String> {
    let theme = themes::get(name).map_err(|_e| Error::Atom("error"))?;
    Ok(build_theme_css(&theme, options))
}

#[rustler::nif]
fn theme_css_from_theme(theme: ExTheme, options: ExCssOptions) -> String {
    build_theme_css(&theme.into(), options)
}

fn build_theme_css(theme: &themes::Theme, options: ExCssOptions) -> String {
    let mut builder = themes::CssBuilder::new(theme);

    builder
        .enable_italic(options.enable_italic)
        .scope(options.scope)
        .container_selector(options.container_selector);

    builder.container_style(options.container_style);

    builder.build()
}

#[cfg(test)]
mod tests {
    use lumis::{languages::Language, HtmlInlineBuilder};

    #[test]
    fn test_highlight_works() {
        let source = "@test :test";
        let lang = Language::guess(Some("elixir"), source);
        let formatter = HtmlInlineBuilder::new().language(lang).build().unwrap();

        let result = lumis::highlight(source, formatter);

        assert!(!result.is_empty(), "Output should not be empty");

        assert!(
            result.contains("<pre"),
            "Output should contain opening <pre> tag"
        );

        assert!(result.contains("<code"), "Output should contain <code> tag");

        assert!(
            result.contains("test"),
            "Output should contain 'test' keyword"
        );
    }
}

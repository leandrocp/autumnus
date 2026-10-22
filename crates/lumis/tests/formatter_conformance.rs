use lumis::{
    formatters::html::HtmlStructure, highlight, highlight::highlight_events_with_options,
    highlight::HighlightOptions, languages::Language, themes, BBCodeScopedBuilder, Budget,
    HtmlInlineBuilder, HtmlLinkedBuilder, HtmlMultiThemesBuilder, TerminalBuilder,
};
use serde::Deserialize;
use std::{
    collections::{BTreeMap, HashMap},
    fs,
    path::PathBuf,
    time::{Duration, Instant},
};

#[test]
fn nested_style_inheritance() {
    use lumis::formatters::{ansi, Formatter};
    use lumis::highlight::{highlight_events, highlight_iter, Highlighter};
    use lumis::themes::{Style, Theme};

    #[derive(Deserialize)]
    struct Case {
        name: String,
        highlights: BTreeMap<String, Style>,
        expected: Style,
    }
    #[derive(Deserialize)]
    struct Fixture {
        source: String,
        language: String,
        cases: Vec<Case>,
    }
    let fixture: Fixture =
        serde_json::from_str(include_str!("../../../fixtures/style-inheritance.json")).unwrap();
    assert_eq!(fixture.cases.len(), 5);
    let language = Language::guess(Some(&fixture.language), "");
    for case in fixture.cases {
        let theme = Theme {
            highlights: case.highlights,
            ..Default::default()
        };
        let mut tokens = Vec::new();
        highlight_iter(
            &fixture.source,
            language,
            Some(theme.clone()),
            |text, lang, range, scope, style| {
                assert_eq!(&fixture.source[range], text);
                assert_eq!(lang, language);
                tokens.push((text.to_owned(), scope, style.clone()));
                Ok::<_, std::io::Error>(())
            },
        )
        .unwrap();
        let inner = tokens.iter().find(|token| token.0 == "x").unwrap();
        assert_eq!(inner.1, "variable");
        assert_eq!(inner.2, case.expected, "{}", case.name);
        let outer = theme.get_style("string").unwrap();
        assert_eq!(
            &tokens.iter().find(|token| token.0 == "\"").unwrap().2,
            outer
        );
        let outside = theme
            .get_style("variable.python")
            .cloned()
            .unwrap_or_default();
        assert_eq!(
            tokens.last().unwrap().2,
            outside,
            "style leaked out of string"
        );
        assert_eq!(
            tokens
                .iter()
                .map(|token| token.0.as_str())
                .collect::<String>(),
            fixture.source
        );

        let highlighter = Highlighter::new(language, Some(theme.clone()));
        let segments = highlighter.highlight(&fixture.source).unwrap();
        assert_eq!(
            segments
                .iter()
                .find(|(_, text)| *text == "x")
                .unwrap()
                .0
                .as_ref(),
            &case.expected
        );

        let formatter = TerminalBuilder::new()
            .language(language)
            .theme(Some(theme))
            .build()
            .unwrap();
        let mut output = Vec::new();
        formatter
            .render(
                &fixture.source,
                &highlight_events(&fixture.source, language).unwrap(),
                &mut output,
            )
            .unwrap();
        assert!(
            String::from_utf8(output)
                .unwrap()
                .contains(&ansi::paint("x", &case.expected)),
            "{}",
            case.name
        );
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FixtureMetadata {
    #[allow(dead_code)]
    name: String,
    language: String,
    theme: String,
    #[serde(default)]
    rainbow_brackets: bool,
    #[serde(default)]
    word_diff: bool,
    #[serde(default)]
    annotations: Vec<FixtureAnnotation>,
    #[serde(default)]
    structure: FixtureStructure,
    #[serde(default)]
    html_multi_themes: Option<HtmlMultiThemesFixture>,
    #[serde(default)]
    budget: FixtureBudget,
    /// The milliseconds any one render may take once the language is loaded.
    returns_within: Option<u64>,
    events: Vec<SerializableHighlightEvent>,
}

/// The limits a fixture renders under. An absent limit keeps its default.
#[derive(Debug, Default, Deserialize, Clone, Copy)]
#[serde(rename_all = "camelCase")]
struct FixtureBudget {
    time_limit: Option<u64>,
    match_limit: Option<u32>,
}

impl From<FixtureBudget> for Budget {
    fn from(fixture: FixtureBudget) -> Self {
        let mut budget = Self::new();
        if let Some(time_limit) = fixture.time_limit {
            budget = budget.time_limit(Some(time_limit));
        }
        if let Some(match_limit) = fixture.match_limit {
            budget = budget.match_limit(match_limit);
        }
        budget
    }
}

/// What the three HTML outputs write around the tokens. Absent means a block.
#[derive(Debug, Default, Deserialize, Clone, Copy)]
#[serde(rename_all = "lowercase")]
enum FixtureStructure {
    #[default]
    Block,
    Inline,
}

impl From<FixtureStructure> for HtmlStructure {
    fn from(structure: FixtureStructure) -> Self {
        match structure {
            FixtureStructure::Block => Self::Block,
            FixtureStructure::Inline => Self::Inline,
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct HtmlMultiThemesFixture {
    themes: BTreeMap<String, String>,
    #[serde(default)]
    default_theme: Option<String>,
    #[serde(default)]
    highlight_lines: Vec<usize>,
}

#[derive(Debug, Deserialize, PartialEq, Eq)]
#[serde(tag = "type", rename_all = "camelCase")]
enum SerializableHighlightEvent {
    Start {
        scope: String,
        language: String,
    },
    Source {
        start: usize,
        end: usize,
    },
    End,
    DecorationStart {
        decoration: SerializableDecoration,
    },
    DecorationEnd,
    AnnotationStart {
        range: std::ops::Range<usize>,
        data: serde_json::Value,
    },
    AnnotationEnd,
}

#[derive(Debug, Deserialize)]
struct FixtureAnnotation {
    range: std::ops::Range<usize>,
    data: serde_json::Value,
}

#[derive(Debug, Deserialize, PartialEq, Eq)]
#[serde(tag = "type", rename_all = "camelCase")]
enum SerializableDecoration {
    RainbowBracket { depth: usize },
    DiffWord { kind: String },
}

struct Fixture {
    metadata: FixtureMetadata,
    source: String,
    html_inline: String,
    html_linked: String,
    html_multi_themes: String,
    terminal: String,
    bbcode: String,
}

fn conformance_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../fixtures/conformance")
}

fn fixture_theme(name: &str) -> lumis::themes::Theme {
    let path = conformance_dir()
        .join("../conformance-themes")
        .join(format!("{name}.json"));
    if path.is_file() {
        return themes::from_file(path).unwrap();
    }
    themes::get(name).unwrap()
}

fn load_fixture(name: &str) -> Fixture {
    let dir = conformance_dir().join(name);
    let metadata = serde_json::from_str::<FixtureMetadata>(
        &fs::read_to_string(dir.join("fixture.json")).expect("failed to read fixture metadata"),
    )
    .expect("failed to parse fixture metadata");

    Fixture {
        source: fs::read_to_string(dir.join("source.txt")).expect("failed to read source"),
        html_inline: fs::read_to_string(dir.join("html-inline.html"))
            .expect("failed to read html-inline"),
        html_linked: fs::read_to_string(dir.join("html-linked.html"))
            .expect("failed to read html-linked"),
        html_multi_themes: fs::read_to_string(dir.join("html-multi-themes.html"))
            .expect("failed to read html-multi-themes"),
        terminal: fs::read_to_string(dir.join("terminal.txt")).expect("failed to read terminal"),
        bbcode: fs::read_to_string(dir.join("bbcode.txt")).expect("failed to read bbcode"),
        metadata,
    }
}

fn check_events(fixture: &Fixture) {
    let lang: Language = fixture.metadata.language.parse().expect("invalid language");
    let annotations: Vec<_> = fixture
        .metadata
        .annotations
        .iter()
        .map(|annotation| {
            lumis::annotations::Annotation::new(annotation.range.clone(), annotation.data.clone())
                .unwrap()
        })
        .collect();
    let events = render_within(fixture, || {
        highlight_events_with_options(
            &fixture.source,
            lang,
            HighlightOptions::new()
                .annotations(&annotations)
                .rainbow_brackets(fixture.metadata.rainbow_brackets)
                .word_diff(fixture.metadata.word_diff)
                .budget(fixture.metadata.budget.into()),
        )
    })
    .expect("events should build");
    let serialized = events
        .into_iter()
        .map(|event| match event {
            lumis_core::events::HighlightEvent::Start {
                scope_index,
                language,
            } => SerializableHighlightEvent::Start {
                scope: lumis_core::highlights::HIGHLIGHT_NAMES[scope_index].to_string(),
                language,
            },
            lumis_core::events::HighlightEvent::Source { start, end } => {
                SerializableHighlightEvent::Source { start, end }
            }
            lumis_core::events::HighlightEvent::End => SerializableHighlightEvent::End,
            lumis_core::events::HighlightEvent::DecorationStart {
                decoration: lumis_core::events::Decoration::RainbowBracket { depth },
            } => SerializableHighlightEvent::DecorationStart {
                decoration: SerializableDecoration::RainbowBracket { depth },
            },
            lumis_core::events::HighlightEvent::DecorationStart {
                decoration: lumis_core::events::Decoration::DiffWord { kind },
            } => SerializableHighlightEvent::DecorationStart {
                decoration: SerializableDecoration::DiffWord {
                    kind: kind.as_str().to_string(),
                },
            },
            lumis_core::events::HighlightEvent::DecorationEnd => {
                SerializableHighlightEvent::DecorationEnd
            }
            lumis_core::events::HighlightEvent::AnnotationStart { range, data } => {
                SerializableHighlightEvent::AnnotationStart {
                    range,
                    data: serde_json::to_value(data).unwrap(),
                }
            }
            lumis_core::events::HighlightEvent::AnnotationEnd => {
                SerializableHighlightEvent::AnnotationEnd
            }
            _ => unreachable!("unsupported conformance event"),
        })
        .collect::<Vec<_>>();
    assert_eq!(serialized, fixture.metadata.events);
}

fn check_html_inline(fixture: &Fixture) {
    let lang: Language = fixture.metadata.language.parse().unwrap();
    let theme = fixture_theme(&fixture.metadata.theme);
    let fmt = HtmlInlineBuilder::new()
        .language(lang)
        .structure(fixture.metadata.structure.into())
        .theme(Some(theme))
        .build()
        .unwrap();
    let html = render_within(fixture, || {
        lumis::highlight_with_options(&fixture.source, fmt, render_options(fixture))
    });
    assert_eq!(
        normalize_newlines(&html),
        normalize_newlines(&fixture.html_inline)
    );
}

fn check_html_linked(fixture: &Fixture) {
    let lang: Language = fixture.metadata.language.parse().unwrap();
    let fmt = HtmlLinkedBuilder::new()
        .language(lang)
        .structure(fixture.metadata.structure.into())
        .build()
        .unwrap();
    let mut out = Vec::new();
    render_within(fixture, || {
        lumis::write_highlight_with_options(&mut out, &fixture.source, fmt, render_options(fixture))
    })
    .unwrap();
    assert_eq!(
        normalize_newlines(&String::from_utf8(out).unwrap()),
        normalize_newlines(&fixture.html_linked)
    );
}

fn check_html_multi_themes(fixture: &Fixture) {
    let lang: Language = fixture.metadata.language.parse().unwrap();
    let mut map = HashMap::new();
    let mut builder = HtmlMultiThemesBuilder::new();

    if let Some(config) = &fixture.metadata.html_multi_themes {
        for (name, theme) in &config.themes {
            map.insert(name.clone(), fixture_theme(theme));
        }
        if let Some(default_theme) = &config.default_theme {
            builder.default_theme(default_theme.clone());
        }

        if !config.highlight_lines.is_empty() {
            builder.highlight_lines(Some(lumis::formatters::html_inline::HighlightLines {
                lines: config
                    .highlight_lines
                    .iter()
                    .map(|line| *line..=*line)
                    .collect(),
                style: Some(lumis::formatters::html_inline::HighlightLinesStyle::Theme),
                class: None,
            }));
        }
    } else {
        map.insert("main".to_string(), fixture_theme(&fixture.metadata.theme));
        builder.default_theme("main");
    }

    let fmt = builder
        .language(lang)
        .structure(fixture.metadata.structure.into())
        .themes(map)
        .build()
        .unwrap();
    let mut out = Vec::new();
    render_within(fixture, || {
        lumis::write_highlight_with_options(&mut out, &fixture.source, fmt, render_options(fixture))
    })
    .unwrap();
    assert_eq!(
        normalize_newlines(&String::from_utf8(out).unwrap()),
        normalize_newlines(&fixture.html_multi_themes)
    );
}

fn check_terminal(fixture: &Fixture) {
    let lang: Language = fixture.metadata.language.parse().unwrap();
    let theme = fixture_theme(&fixture.metadata.theme);
    let fmt = TerminalBuilder::new()
        .language(lang)
        .theme(Some(theme))
        .build()
        .unwrap();
    let mut out = Vec::new();
    render_within(fixture, || {
        lumis::write_highlight_with_options(&mut out, &fixture.source, fmt, render_options(fixture))
    })
    .unwrap();
    assert_eq!(
        normalize_newlines(&String::from_utf8(out).unwrap()),
        normalize_newlines(&fixture.terminal)
    );
}

fn check_bbcode(fixture: &Fixture) {
    let lang: Language = fixture.metadata.language.parse().unwrap();
    let fmt = BBCodeScopedBuilder::new().language(lang).build().unwrap();
    let mut out = Vec::new();
    render_within(fixture, || {
        lumis::write_highlight_with_options(&mut out, &fixture.source, fmt, render_options(fixture))
    })
    .unwrap();
    assert_eq!(
        normalize_newlines(&String::from_utf8(out).unwrap()),
        normalize_newlines(&fixture.bbcode)
    );
}

fn render_options(fixture: &Fixture) -> HighlightOptions<'static, 'static, ()> {
    HighlightOptions::new()
        .rainbow_brackets(fixture.metadata.rainbow_brackets)
        .word_diff(fixture.metadata.word_diff)
        .budget(fixture.metadata.budget.into())
}

/// Runs one render of the fixture, held to its `returnsWithin` when it has one.
/// The language is loaded first, because loading is not part of a render.
fn render_within<T>(fixture: &Fixture, render: impl FnOnce() -> T) -> T {
    let Some(limit) = fixture.metadata.returns_within else {
        return render();
    };
    let lang: Language = fixture.metadata.language.parse().unwrap();
    highlight_events_with_options("", lang, HighlightOptions::new()).unwrap();

    let started = Instant::now();
    let output = render();
    let elapsed = started.elapsed();
    assert!(
        elapsed <= Duration::from_millis(limit),
        "render returned after {elapsed:?}, past its {limit} ms bound"
    );
    output
}

fn normalize_newlines(value: &str) -> String {
    value.replace("\r\n", "\n")
}

#[test]
#[allow(deprecated)]
fn deprecated_lang_builder_alias_still_works() {
    let formatter = HtmlInlineBuilder::new()
        .lang(Language::Rust)
        .build()
        .unwrap();

    let html = highlight("fn main() {}", formatter);

    assert!(html.contains("language-rust"));
}

// Generate one test module per fixture directory found at build time.
include!(concat!(env!("OUT_DIR"), "/conformance_tests.rs"));

use lumis::formatter::Formatter as _;
use lumis::{
    highlight, highlight::highlight_events, languages::Language, themes, BBCodeScopedBuilder,
    HtmlInlineBuilder, HtmlLinkedBuilder, HtmlMultiThemesBuilder, TerminalBuilder,
};
use serde::Deserialize;
use std::{collections::HashMap, fs, path::PathBuf};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FixtureMetadata {
    #[allow(dead_code)]
    name: String,
    language: String,
    theme: String,
    events: Vec<SerializableHighlightEvent>,
}

#[derive(Debug, Deserialize, PartialEq, Eq)]
#[serde(tag = "type", rename_all = "camelCase")]
enum SerializableHighlightEvent {
    Start { scope: String, language: String },
    Source { start: usize, end: usize },
    End,
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
    let events = highlight_events(&fixture.source, lang).expect("events should build");
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
        })
        .collect::<Vec<_>>();
    assert_eq!(serialized, fixture.metadata.events);
}

fn check_html_inline(fixture: &Fixture) {
    let lang: Language = fixture.metadata.language.parse().unwrap();
    let theme = themes::get(&fixture.metadata.theme).unwrap();
    let fmt = HtmlInlineBuilder::new()
        .lang(lang)
        .theme(Some(theme))
        .build()
        .unwrap();
    assert_eq!(
        normalize_newlines(&highlight(&fixture.source, fmt)),
        normalize_newlines(&fixture.html_inline)
    );
}

fn check_html_linked(fixture: &Fixture) {
    let lang: Language = fixture.metadata.language.parse().unwrap();
    let fmt = HtmlLinkedBuilder::new().lang(lang).build().unwrap();
    let mut out = Vec::new();
    fmt.format(&fixture.source, &mut out).unwrap();
    assert_eq!(
        normalize_newlines(&String::from_utf8(out).unwrap()),
        normalize_newlines(&fixture.html_linked)
    );
}

fn check_html_multi_themes(fixture: &Fixture) {
    let lang: Language = fixture.metadata.language.parse().unwrap();
    let theme = themes::get(&fixture.metadata.theme).unwrap();
    let mut map = HashMap::new();
    map.insert("main".to_string(), theme);
    let fmt = HtmlMultiThemesBuilder::new()
        .lang(lang)
        .themes(map)
        .default_theme("main")
        .build()
        .unwrap();
    let mut out = Vec::new();
    fmt.format(&fixture.source, &mut out).unwrap();
    assert_eq!(
        normalize_newlines(&String::from_utf8(out).unwrap()),
        normalize_newlines(&fixture.html_multi_themes)
    );
}

fn check_terminal(fixture: &Fixture) {
    let lang: Language = fixture.metadata.language.parse().unwrap();
    let theme = themes::get(&fixture.metadata.theme).unwrap();
    let fmt = TerminalBuilder::new()
        .lang(lang)
        .theme(Some(theme))
        .build()
        .unwrap();
    let mut out = Vec::new();
    fmt.format(&fixture.source, &mut out).unwrap();
    assert_eq!(
        normalize_newlines(&String::from_utf8(out).unwrap()),
        normalize_newlines(&fixture.terminal)
    );
}

fn check_bbcode(fixture: &Fixture) {
    let lang: Language = fixture.metadata.language.parse().unwrap();
    let fmt = BBCodeScopedBuilder::new().lang(lang).build().unwrap();
    let mut out = Vec::new();
    fmt.format(&fixture.source, &mut out).unwrap();
    assert_eq!(
        normalize_newlines(&String::from_utf8(out).unwrap()),
        normalize_newlines(&fixture.bbcode)
    );
}

fn normalize_newlines(value: &str) -> String {
    value.replace("\r\n", "\n")
}

// Generate one test module per fixture directory found at build time.
include!(concat!(env!("OUT_DIR"), "/conformance_tests.rs"));

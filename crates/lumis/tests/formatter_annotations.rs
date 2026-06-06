use lumis::formatters::Formatter;
use lumis::highlight::{
    GutterText, HighlightDecoration, HighlightEvent, LineHighlight, LineView, LineViewOptions,
    LineViewOptionsBuilder, SignText, StylePatch, VirtualText,
};
use lumis::{
    languages::Language, themes, BBCodeScopedBuilder, HtmlInlineBuilder, HtmlLinkedBuilder,
    HtmlMultiThemesBuilder, TerminalBuilder,
};
use std::collections::HashMap;

fn annotation_options() -> LineViewOptions {
    LineViewOptionsBuilder::new()
        .highlight_decorations(vec![HighlightDecoration {
            range: 0..3,
            kind: Some("review.note".to_string()),
            style: StylePatch {
                fg: Some("#ff0000".to_string()),
                ..StylePatch::default()
            },
        }])
        .line_highlights(vec![LineHighlight {
            line: 1,
            kind: Some("review.line".to_string()),
            class: Some("review-line".to_string()),
            style: StylePatch {
                bg: Some("#fff7cc".to_string()),
                ..StylePatch::default()
            },
        }])
        .signs(vec![SignText {
            line: 1,
            kind: Some("review.sign".to_string()),
            text: "!".to_string(),
            style: StylePatch {
                fg: Some("#cc0000".to_string()),
                ..StylePatch::default()
            },
        }])
        .gutter_text(vec![GutterText {
            line: 1,
            kind: Some("line.number".to_string()),
            text: "1".to_string(),
            style: StylePatch::default(),
        }])
        .virtual_text(vec![VirtualText {
            line: 1,
            column: 3,
            kind: Some("inline.note".to_string()),
            text: " <- note".to_string(),
            style: StylePatch {
                fg: Some("#666666".to_string()),
                ..StylePatch::default()
            },
        }])
        .build()
        .unwrap()
}

fn annotated_view() -> LineView {
    let source = "let x = 1;";
    let events = vec![HighlightEvent::Source {
        start: 0,
        end: source.len(),
    }];
    LineView::from_events(source, &events, &annotation_options())
}

fn render(formatter: impl Formatter) -> String {
    let mut output = Vec::new();
    formatter.render(&annotated_view(), &mut output).unwrap();
    String::from_utf8(output).unwrap()
}

#[test]
fn html_inline_renders_formatter_neutral_annotations() {
    let html = render(
        HtmlInlineBuilder::new()
            .language(Language::JavaScript)
            .theme(Some(themes::get("github_light").unwrap()))
            .build()
            .unwrap(),
    );

    assert!(html.contains("review-line"));
    assert!(html.contains("data-gutter=\"line.number\""));
    assert!(html.contains("data-sign=\"review.sign\""));
    assert!(html.contains("data-virtual=\"inline.note\""));
    assert!(html.contains("data-decoration=\"review.note\""));
}

#[test]
fn html_linked_renders_formatter_neutral_annotations() {
    let html = render(
        HtmlLinkedBuilder::new()
            .language(Language::JavaScript)
            .build()
            .unwrap(),
    );

    assert!(html.contains("review-line"));
    assert!(html.contains("data-gutter=\"line.number\""));
    assert!(html.contains("data-sign=\"review.sign\""));
    assert!(html.contains("data-virtual=\"inline.note\""));
    assert!(html.contains("data-decoration=\"review.note\""));
}

#[test]
fn html_multi_themes_renders_formatter_neutral_annotations() {
    let mut theme_map = HashMap::new();
    theme_map.insert("main".to_string(), themes::get("github_light").unwrap());

    let html = render(
        HtmlMultiThemesBuilder::new()
            .language(Language::JavaScript)
            .themes(theme_map)
            .default_theme("main")
            .build()
            .unwrap(),
    );

    assert!(html.contains("review-line"));
    assert!(html.contains("data-gutter=\"line.number\""));
    assert!(html.contains("data-sign=\"review.sign\""));
    assert!(html.contains("data-virtual=\"inline.note\""));
    assert!(html.contains("data-decoration=\"review.note\""));
}

#[test]
fn terminal_renders_formatter_neutral_annotations() {
    let text = render(
        TerminalBuilder::new()
            .language(Language::JavaScript)
            .build()
            .unwrap(),
    );

    assert!(text.contains('1'));
    assert!(text.contains('!'));
    assert!(text.contains('│'));
    assert!(text.contains("<- note"));
}

#[test]
fn bbcode_renders_formatter_neutral_annotations() {
    let text = render(
        BBCodeScopedBuilder::new()
            .language(Language::JavaScript)
            .build()
            .unwrap(),
    );

    assert!(text.contains("[review-line]"));
    assert!(text.contains("[gutter]1[/gutter]"));
    assert!(text.contains("[sign]![/sign]"));
    assert!(text.contains("[virtual] <- note[/virtual]"));
    assert!(text.contains("[review-note]"));
}

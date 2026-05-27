//! AST-like line view for syntax highlighting and formatter-neutral decorations.
//!
//! [`HighlightEvent`] is the stream produced by the highlighter. [`LineView`] is
//! built from that stream when callers need a structured view of highlighted
//! source before rendering: lines, spans, line highlights, gutter signs, virtual
//! text, and decoration output.

use crate::events::HighlightEvent;
use crate::languages::Language;
use crate::themes::UnderlineStyle;
use derive_builder::Builder;
use std::ops::Range;

pub use crate::decorators::{
    DecorationOutput, DecoratorContext, LineViewDecorator, QueryCapture, QueryFamily,
    RainbowBrackets, RainbowBracketsOptions,
};

/// A highlight scope active over a span.
#[non_exhaustive]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Scope {
    /// Index into `HIGHLIGHT_NAMES`.
    pub scope_index: usize,
    /// Parsed language that produced the scope, when it is known to Lumis.
    pub language: Option<Language>,
}

/// Style fields to override on a span, line, sign, or virtual text.
///
/// `None` means "leave the existing value alone". For example, a patch with
/// only `bg` set changes the background without touching the foreground color
/// chosen by the syntax theme.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct StylePatch {
    /// Foreground color, usually a CSS-compatible color string.
    pub fg: Option<String>,
    /// Background color, usually a CSS-compatible color string.
    pub bg: Option<String>,
    /// Override bold styling when present.
    pub bold: Option<bool>,
    /// Override italic styling when present.
    pub italic: Option<bool>,
    /// Override text decoration fields when present.
    pub text_decoration: TextDecorationPatch,
}

/// Text decoration fields to override.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct TextDecorationPatch {
    /// Override underline styling when present.
    pub underline: Option<UnderlineStyle>,
    /// Override strikethrough styling when present.
    pub strikethrough: Option<bool>,
}

impl StylePatch {
    /// Merge another patch into this one.
    ///
    /// Fields set on `other` replace the matching fields on `self`; fields left
    /// as `None` do not change the current value.
    pub fn merge(&mut self, other: &Self) {
        if other.fg.is_some() {
            self.fg.clone_from(&other.fg);
        }
        if other.bg.is_some() {
            self.bg.clone_from(&other.bg);
        }
        if other.bold.is_some() {
            self.bold = other.bold;
        }
        if other.italic.is_some() {
            self.italic = other.italic;
        }
        if other.text_decoration.underline.is_some() {
            self.text_decoration.underline = other.text_decoration.underline;
        }
        if other.text_decoration.strikethrough.is_some() {
            self.text_decoration.strikethrough = other.text_decoration.strikethrough;
        }
    }

    /// Returns `true` when the patch does not override any style field.
    pub fn is_empty(&self) -> bool {
        self == &Self::default()
    }
}

impl TextDecorationPatch {
    /// Returns `true` when the patch does not override any decoration field.
    pub fn is_empty(&self) -> bool {
        self == &Self::default()
    }
}

/// A range-based decoration applied before projecting source into lines.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct HighlightDecoration {
    /// Byte range in the original source.
    pub range: Range<usize>,
    /// Stable kind label, such as `diff.addition` or `rainbow.bracket.1`.
    ///
    /// Built-in decorator labels are documented in
    /// [`crate::decorators::annotation_kinds`]. Custom decorators may define
    /// their own labels.
    pub kind: Option<String>,
    /// Formatter-neutral style patch for this range.
    pub style: StylePatch,
}

/// A whole-line highlight attached after byte ranges are projected into lines.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct LineHighlight {
    /// One-based line number.
    pub line: usize,
    /// Stable kind label, such as `line.highlight` or `diff.removal`.
    ///
    /// Built-in decorator labels are documented in
    /// [`crate::decorators::annotation_kinds`]. Custom decorators may define
    /// their own labels.
    pub kind: Option<String>,
    /// Optional class-like label for renderers that expose class names.
    pub class: Option<String>,
    /// Formatter-neutral style patch for this line.
    pub style: StylePatch,
}

/// Sign text attached to a source line.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SignText {
    /// One-based line number.
    pub line: usize,
    /// Stable kind label, such as `diff.addition`.
    ///
    /// Built-in decorator labels are documented in
    /// [`crate::decorators::annotation_kinds`]. Custom decorators may define
    /// their own labels.
    pub kind: Option<String>,
    /// Short sign text rendered by supporting formatters.
    pub text: String,
    /// Formatter-neutral style patch for this sign.
    pub style: StylePatch,
}

/// Gutter text attached to a source line.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct GutterText {
    /// One-based line number.
    pub line: usize,
    /// Stable kind label, such as `line.number`.
    ///
    /// Built-in decorator labels are documented in
    /// [`crate::decorators::annotation_kinds`]. Custom decorators may define
    /// their own labels.
    pub kind: Option<String>,
    /// Text rendered by supporting formatters.
    pub text: String,
    /// Formatter-neutral style patch for the gutter text.
    pub style: StylePatch,
}

/// Virtual text attached to a source line at a display column.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct VirtualText {
    /// One-based line number.
    pub line: usize,
    /// Zero-based display column on the source line.
    pub column: usize,
    /// Stable kind label, such as `indent.guide`.
    ///
    /// Built-in decorator labels are documented in
    /// [`crate::decorators::annotation_kinds`]. Custom decorators may define
    /// their own labels.
    pub kind: Option<String>,
    /// Text rendered by supporting formatters.
    pub text: String,
    /// Formatter-neutral style patch for the virtual text.
    pub style: StylePatch,
}

/// Options for projecting highlight events and decorations into a [`LineView`].
#[non_exhaustive]
#[derive(Builder, Clone, Debug, Default, PartialEq, Eq)]
#[builder(default)]
pub struct LineViewOptions {
    /// Range decorations applied to spans.
    pub highlight_decorations: Vec<HighlightDecoration>,
    /// Whole-line highlights applied to projected lines.
    pub line_highlights: Vec<LineHighlight>,
    /// Sign text applied to projected lines.
    pub signs: Vec<SignText>,
    /// Gutter text applied to projected lines.
    pub gutter_text: Vec<GutterText>,
    /// Virtual text overlays applied to projected lines.
    pub virtual_text: Vec<VirtualText>,
}

impl LineViewOptionsBuilder {
    /// Create a new builder for line-view projection options.
    pub fn new() -> Self {
        Self::default()
    }
}

/// Internal builder for a line-oriented view of highlighted source.
#[derive(Clone, Debug)]
#[cfg(test)]
pub(crate) struct LineViewBuilder<'a> {
    source: &'a str,
    events: &'a [HighlightEvent],
    options: LineViewOptions,
}

#[cfg(test)]
#[allow(dead_code)]
impl<'a> LineViewBuilder<'a> {
    /// Create a builder from source text and highlight events.
    pub(crate) fn new(source: &'a str, events: &'a [HighlightEvent]) -> Self {
        Self {
            source,
            events,
            options: LineViewOptions::default(),
        }
    }

    /// Replace range decorations applied to spans.
    pub fn highlight_decorations(
        &mut self,
        highlight_decorations: Vec<HighlightDecoration>,
    ) -> &mut Self {
        self.options.highlight_decorations = highlight_decorations;
        self
    }

    /// Color matching brackets by nesting depth.
    pub fn rainbow_brackets(&mut self, options: RainbowBracketsOptions) -> &mut Self {
        self.apply_decorator(&RainbowBrackets::new(options))
    }

    /// Apply a built-in or custom line-view decorator.
    pub fn apply_decorator(&mut self, decorator: &impl LineViewDecorator) -> &mut Self {
        let mut output = DecorationOutput::default();
        decorator.run(DecoratorContext::new(self.source), &mut output);
        self.decoration_output(output)
    }

    /// Merge formatter-neutral decoration output into the projection options.
    pub fn decoration_output(&mut self, output: DecorationOutput) -> &mut Self {
        self.options
            .highlight_decorations
            .extend(output.highlight_decorations);
        self.options.line_highlights.extend(output.line_highlights);
        self.options.signs.extend(output.signs);
        self.options.gutter_text.extend(output.gutter_text);
        self.options.virtual_text.extend(output.virtual_text);
        self
    }

    /// Replace gutter text applied to projected lines.
    pub fn gutter_text(&mut self, gutter_text: Vec<GutterText>) -> &mut Self {
        self.options.gutter_text = gutter_text;
        self
    }

    /// Replace virtual text overlays applied to projected lines.
    pub fn virtual_text(&mut self, virtual_text: Vec<VirtualText>) -> &mut Self {
        self.options.virtual_text = virtual_text;
        self
    }

    /// Build the line-oriented view.
    pub fn build(&self) -> LineView {
        LineView::from_events(self.source, self.events, &self.options)
    }
}

/// Line-oriented view of highlighted source.
///
/// `LineView` is the structured document model that built-in and custom
/// formatters render. It is derived from source text, highlight events, and
/// formatter-neutral decorations. Use it when code needs a stable read-only
/// shape instead of consuming the streaming [`HighlightEvent`] model directly.
///
/// # What it contains
///
/// A `LineView` groups source into [`Line`] values. Each line contains syntax
/// [`Span`] values, whole-line highlights, gutter text, signs, and virtual text.
/// Spans keep their source byte range, active syntax scopes, and inline
/// decorations. This gives renderers one place to read both syntax highlighting
/// and decoration output.
///
/// # Not a parser AST
///
/// `LineView` is AST-like because it is structured and traversable, but it is
/// not a parser AST. It does not expose tree-sitter nodes, parse state, parent
/// syntax nodes, or query captures. Those remain lower-level facts. `LineView`
/// projects them into the line/span shape renderers need.
///
/// # Rendering model
///
/// The intended flow is:
///
/// ```text
/// source + language + decorators -> LineView -> Formatter -> output
/// ```
///
/// Decorators should emit formatter-neutral primitives such as
/// [`LineHighlight`], [`SignText`], [`GutterText`], [`VirtualText`], and
/// [`HighlightDecoration`]. Formatters decide how those primitives become HTML,
/// ANSI, BBCode, or another output format.
///
/// A simplified `LineView` has this shape:
///
/// ```text
/// LineView {
///     trailing_newline: false,
///     lines: [
///         Line {
///             line_number: 1,
///             range: 0..11,
///             gutter_text: [GutterText { kind: Some("line.number"), text: "1", ... }],
///             spans: [
///                 Span { range: 0..2, text: "fn", scopes: ["keyword.function"], ... },
///                 Span { range: 3..7, text: "main", scopes: ["function"], ... },
///             ],
///             ..
///         },
///         Line {
///             line_number: 2,
///             range: 12..31,
///             line_highlights: [
///                 LineHighlight { kind: Some("line.highlight"), class: Some("highlighted"), ... },
///             ],
///             spans: [
///                 Span { range: 16..23, text: "println", scopes: ["keyword.exception"], ... },
///                 Span { range: 25..29, text: "\"hi\"", scopes: ["string"], ... },
///             ],
///             ..
///         },
///     ],
/// }
/// ```
#[non_exhaustive]
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct LineView {
    /// Projected source lines.
    pub lines: Vec<Line>,
    /// Whether the source ended with a line break.
    pub trailing_newline: bool,
}

/// A structured text span with syntax scopes and formatter-neutral decorations.
#[non_exhaustive]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Span {
    /// Text content for this span, without line breaks.
    pub text: String,
    /// Byte range in the original source.
    pub range: Range<usize>,
    /// Syntax highlight scopes active over this span, ordered outermost to innermost.
    pub scopes: Vec<Scope>,
    /// Merged style from range decorations.
    pub style: Option<StylePatch>,
    /// Decoration kinds active over this span.
    pub decoration_kinds: Vec<String>,
}

/// A structured source line with syntax spans and formatter-neutral decorations.
#[non_exhaustive]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Line {
    /// One-based line number.
    pub line_number: usize,
    /// Byte range in the original source, excluding the line break.
    pub range: Range<usize>,
    /// Syntax and decoration spans on this line.
    pub spans: Vec<Span>,
    /// Whole-line highlights attached to this line.
    pub line_highlights: Vec<LineHighlight>,
    /// Sign text attached to this line.
    pub signs: Vec<SignText>,
    /// Gutter text attached to this line.
    pub gutter_text: Vec<GutterText>,
    /// Virtual text overlays attached to this line.
    pub virtual_text: Vec<VirtualText>,
}

impl LineView {
    /// Create a builder for a line-oriented view.
    #[cfg(test)]
    pub(crate) fn builder<'a>(
        source: &'a str,
        events: &'a [HighlightEvent],
    ) -> LineViewBuilder<'a> {
        LineViewBuilder::new(source, events)
    }

    /// Project syntax highlight events and decorations into a line-oriented view.
    ///
    /// This does not run the highlighter. Callers provide the event stream so
    /// `LineView` stays a derived representation rather than a competing source
    /// of highlight data.
    pub fn from_events(source: &str, events: &[HighlightEvent], options: &LineViewOptions) -> Self {
        let mut lines = vec![Line {
            line_number: 1,
            range: 0..0,
            spans: Vec::new(),
            line_highlights: Vec::new(),
            signs: Vec::new(),
            gutter_text: Vec::new(),
            virtual_text: Vec::new(),
        }];
        let mut scopes = Vec::new();

        for event in events {
            match event {
                HighlightEvent::Start {
                    scope_index,
                    language,
                } => scopes.push(Scope {
                    scope_index: *scope_index,
                    language: language.parse().ok(),
                }),
                HighlightEvent::End => {
                    scopes.pop();
                }
                HighlightEvent::Source { start, end } => {
                    let start = clamp_to_char_boundary(source, *start);
                    let end = clamp_to_char_boundary(source, *end).max(start);
                    push_source_range(source, start..end, &scopes, options, &mut lines);
                }
            }
        }

        for line in &mut lines {
            line.line_highlights = options
                .line_highlights
                .iter()
                .filter(|highlight| highlight.line == line.line_number)
                .cloned()
                .collect();
            line.signs = options
                .signs
                .iter()
                .filter(|sign| sign.line == line.line_number)
                .cloned()
                .collect();
            line.gutter_text = options
                .gutter_text
                .iter()
                .filter(|gutter_text| gutter_text.line == line.line_number)
                .cloned()
                .collect();
            line.virtual_text = options
                .virtual_text
                .iter()
                .filter(|virtual_text| virtual_text.line == line.line_number)
                .cloned()
                .collect();
        }

        Self {
            lines,
            trailing_newline: source.ends_with('\n'),
        }
    }
}

fn push_source_range(
    source: &str,
    range: Range<usize>,
    scopes: &[Scope],
    options: &LineViewOptions,
    lines: &mut Vec<Line>,
) {
    let mut boundaries = vec![range.start, range.end];
    for decoration in &options.highlight_decorations {
        let decoration_start = clamp_to_char_boundary(source, decoration.range.start);
        let decoration_end = clamp_to_char_boundary(source, decoration.range.end);
        if decoration_start > range.start && decoration_start < range.end {
            boundaries.push(decoration_start);
        }
        if decoration_end > range.start && decoration_end < range.end {
            boundaries.push(decoration_end);
        }
    }
    boundaries.sort_unstable();
    boundaries.dedup();

    for window in boundaries.windows(2) {
        let start = window[0];
        let end = window[1];
        if start == end {
            continue;
        }
        push_chunk(source, start..end, scopes, options, lines);
    }
}

fn push_chunk(
    source: &str,
    range: Range<usize>,
    scopes: &[Scope],
    options: &LineViewOptions,
    lines: &mut Vec<Line>,
) {
    let mut start = range.start;

    let Some(text) = source.get(range.clone()) else {
        return;
    };

    for (offset, byte) in text.bytes().enumerate() {
        if byte == b'\n' {
            let newline = range.start + offset;
            push_span(source, start..newline, scopes, options, lines);
            start_new_line(lines, newline + 1);
            start = newline + 1;
        }
    }

    push_span(source, start..range.end, scopes, options, lines);
}

fn push_span(
    source: &str,
    range: Range<usize>,
    scopes: &[Scope],
    options: &LineViewOptions,
    lines: &mut [Line],
) {
    let Some(line) = lines.last_mut() else {
        return;
    };

    line.range.end = range.end;

    if range.start == range.end {
        return;
    }

    let active_decorations: Vec<&HighlightDecoration> = options
        .highlight_decorations
        .iter()
        .filter(|decoration| {
            decoration.range.start < range.end && decoration.range.end > range.start
        })
        .collect();

    let mut style = StylePatch::default();
    let mut decoration_kinds = Vec::new();
    for decoration in active_decorations {
        style.merge(&decoration.style);
        if let Some(kind) = &decoration.kind {
            decoration_kinds.push(kind.clone());
        }
    }

    line.spans.push(Span {
        text: source.get(range.clone()).unwrap_or_default().to_string(),
        range,
        scopes: scopes.to_vec(),
        style: (!style.is_empty()).then_some(style),
        decoration_kinds,
    });
}

fn clamp_to_char_boundary(source: &str, offset: usize) -> usize {
    let mut offset = offset.min(source.len());
    while offset > 0 && !source.is_char_boundary(offset) {
        offset -= 1;
    }
    offset
}

fn start_new_line(lines: &mut Vec<Line>, start: usize) {
    let line_number = lines.len() + 1;
    lines.push(Line {
        line_number,
        range: start..start,
        spans: Vec::new(),
        line_highlights: Vec::new(),
        signs: Vec::new(),
        gutter_text: Vec::new(),
        virtual_text: Vec::new(),
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn style_patch_reports_empty_and_merges_overrides() {
        let mut style = StylePatch::default();
        assert!(style.is_empty());
        assert!(style.text_decoration.is_empty());

        style.merge(&StylePatch {
            fg: Some("#ff0000".to_string()),
            text_decoration: TextDecorationPatch {
                underline: Some(UnderlineStyle::Solid),
                ..TextDecorationPatch::default()
            },
            ..StylePatch::default()
        });

        assert!(!style.is_empty());
        assert!(!style.text_decoration.is_empty());
        assert_eq!(style.fg.as_deref(), Some("#ff0000"));
        assert_eq!(style.text_decoration.underline, Some(UnderlineStyle::Solid));
    }

    #[test]
    fn projects_events_to_structured_lines() {
        let source = "let x = 1\nlet y = 2";
        let events = vec![
            HighlightEvent::Start {
                scope_index: 1,
                language: "rust".to_string(),
            },
            HighlightEvent::Source { start: 0, end: 3 },
            HighlightEvent::End,
            HighlightEvent::Source {
                start: 3,
                end: source.len(),
            },
        ];

        let document = LineView::from_events(source, &events, &LineViewOptions::default());
        let lines = &document.lines;

        assert_eq!(lines.len(), 2);
        assert_eq!(lines[0].line_number, 1);
        assert_eq!(lines[0].range, 0..9);
        assert_eq!(lines[0].spans[0].text, "let");
        assert_eq!(lines[0].spans[0].scopes[0].scope_index, 1);
        assert_eq!(lines[1].line_number, 2);
        assert_eq!(lines[1].range, 10..19);
        assert_eq!(lines[1].spans[0].text, "let y = 2");
    }

    #[test]
    fn splits_spans_at_decoration_boundaries() {
        let source = "abcdef";
        let events = vec![HighlightEvent::Source { start: 0, end: 6 }];
        let options = LineViewOptions {
            highlight_decorations: vec![HighlightDecoration {
                range: 2..4,
                kind: Some("search.match".to_string()),
                style: StylePatch {
                    bg: Some("#ffff00".to_string()),
                    ..StylePatch::default()
                },
            }],
            line_highlights: Vec::new(),
            signs: Vec::new(),
            gutter_text: Vec::new(),
            virtual_text: Vec::new(),
        };

        let document = LineView::from_events(source, &events, &options);
        let lines = &document.lines;

        assert_eq!(lines[0].spans.len(), 3);
        assert_eq!(lines[0].spans[0].text, "ab");
        assert_eq!(lines[0].spans[1].text, "cd");
        assert_eq!(lines[0].spans[1].range, 2..4);
        assert_eq!(
            lines[0].spans[1].decoration_kinds,
            vec!["search.match".to_string()]
        );
        assert_eq!(
            lines[0].spans[1].style.as_ref().unwrap().bg,
            Some("#ffff00".to_string())
        );
        assert_eq!(lines[0].spans[2].text, "ef");
    }

    #[test]
    fn attaches_line_highlights_and_signs() {
        let source = "one\ntwo";
        let events = vec![HighlightEvent::Source {
            start: 0,
            end: source.len(),
        }];
        let options = LineViewOptions {
            highlight_decorations: Vec::new(),
            line_highlights: vec![LineHighlight {
                line: 2,
                kind: Some("diagnostic.error".to_string()),
                class: Some("is-error".to_string()),
                style: StylePatch {
                    bg: Some("#330000".to_string()),
                    ..StylePatch::default()
                },
            }],
            signs: vec![SignText {
                line: 2,
                kind: Some("diagnostic.error".to_string()),
                text: "E".to_string(),
                style: StylePatch::default(),
            }],
            gutter_text: Vec::new(),
            virtual_text: Vec::new(),
        };

        let document = LineView::from_events(source, &events, &options);
        let lines = &document.lines;

        assert!(lines[0].line_highlights.is_empty());
        assert_eq!(lines[1].line_highlights.len(), 1);
        assert_eq!(
            lines[1].line_highlights[0].kind,
            Some("diagnostic.error".to_string())
        );
        assert_eq!(lines[1].signs[0].text, "E");
    }

    #[test]
    fn rainbow_brackets_mark_brackets_by_depth() {
        let source = "call([x])";
        let events = vec![HighlightEvent::Source {
            start: 0,
            end: source.len(),
        }];
        let document = LineView::builder(source, &events)
            .rainbow_brackets(RainbowBracketsOptions::default())
            .build();
        let lines = &document.lines;
        let decorated_spans: Vec<&Span> = lines[0]
            .spans
            .iter()
            .filter(|span| !span.decoration_kinds.is_empty())
            .collect();

        assert_eq!(decorated_spans.len(), 4);
        assert_eq!(decorated_spans[0].text, "(");
        assert_eq!(
            decorated_spans[0].decoration_kinds,
            vec!["rainbow.bracket.1"]
        );
        assert_eq!(decorated_spans[1].text, "[");
        assert_eq!(
            decorated_spans[1].decoration_kinds,
            vec!["rainbow.bracket.2"]
        );
        assert_eq!(decorated_spans[2].text, "]");
        assert_eq!(
            decorated_spans[2].decoration_kinds,
            vec!["rainbow.bracket.2"]
        );
        assert_eq!(decorated_spans[3].text, ")");
        assert_eq!(
            decorated_spans[3].decoration_kinds,
            vec!["rainbow.bracket.1"]
        );
    }
}

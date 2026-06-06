//! Built-in decorators for [`LineView`](crate::highlight::LineView).
//!
//! Decorators emit formatter-neutral data.

use crate::highlight::{HighlightDecoration, StylePatch};
use std::ops::Range;

/// Stable `kind` labels emitted by built-in line-view decorators.
pub mod annotation_kinds {
    /// Prefix for rainbow bracket depth labels.
    pub const RAINBOW_BRACKET_PREFIX: &str = "rainbow.bracket";

    /// Build a one-based rainbow bracket depth label.
    pub fn rainbow_bracket(depth: usize) -> String {
        format!("{RAINBOW_BRACKET_PREFIX}.{depth}")
    }
}

/// Query family that can provide source facts to decorators.
#[non_exhaustive]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum QueryFamily {
    /// Simple open/close bracket-pair captures.
    Brackets,
}

/// Source-range fact produced by a tree-sitter query family.
#[non_exhaustive]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct QueryCapture {
    /// Query family that produced this capture.
    pub family: QueryFamily,
    /// Capture name.
    pub name: String,
    /// Source byte range for the captured node/token.
    pub range: Range<usize>,
}

/// Source context passed to line-view decorators.
#[derive(Clone, Copy, Debug)]
pub struct DecoratorContext<'a> {
    source: &'a str,
}

impl<'a> DecoratorContext<'a> {
    /// Create a context for source text.
    pub fn new(source: &'a str) -> Self {
        Self { source }
    }

    /// Original source text.
    pub fn source(&self) -> &'a str {
        self.source
    }
}

/// Formatter-neutral output emitted by a decorator.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct DecorationOutput {
    /// Range decorations applied to projected spans.
    pub highlight_decorations: Vec<HighlightDecoration>,
}

/// Runtime that emits formatter-neutral line-view output.
pub trait LineViewDecorator {
    /// Run the decorator and append output.
    fn run(&self, context: DecoratorContext<'_>, output: &mut DecorationOutput);
}

impl<T> LineViewDecorator for &T
where
    T: LineViewDecorator + ?Sized,
{
    fn run(&self, context: DecoratorContext<'_>, output: &mut DecorationOutput) {
        (**self).run(context, output);
    }
}

/// Options for the rainbow-brackets built-in decorator.
#[non_exhaustive]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct RainbowBracketsOptions {
    /// Styles cycled by nesting depth.
    pub styles: Vec<StylePatch>,
}

impl Default for RainbowBracketsOptions {
    fn default() -> Self {
        Self {
            styles: vec![
                StylePatch {
                    fg: Some("#e06c75".to_string()),
                    ..StylePatch::default()
                },
                StylePatch {
                    fg: Some("#e5c07b".to_string()),
                    ..StylePatch::default()
                },
                StylePatch {
                    fg: Some("#61afef".to_string()),
                    ..StylePatch::default()
                },
                StylePatch {
                    fg: Some("#c678dd".to_string()),
                    ..StylePatch::default()
                },
            ],
        }
    }
}

/// Build rainbow-bracket span decorations from parser/query-captured bracket pairs.
pub fn rainbow_brackets_decorations_from_pairs(
    mut pairs: Vec<(Range<usize>, Range<usize>)>,
    options: &RainbowBracketsOptions,
) -> Vec<HighlightDecoration> {
    if options.styles.is_empty() {
        return Vec::new();
    }

    pairs.sort_by_key(|(open, close)| (open.start, close.end));
    let mut stack: Vec<Range<usize>> = Vec::new();
    let mut decorations = Vec::new();

    for (open, close) in pairs {
        while stack.last().is_some_and(|last| last.end <= open.start) {
            stack.pop();
        }

        let color_index = stack.len() % options.styles.len();
        let kind = Some(annotation_kinds::rainbow_bracket(color_index + 1));
        let style = options.styles[color_index].clone();

        decorations.push(HighlightDecoration {
            range: open.clone(),
            kind: kind.clone(),
            style: style.clone(),
        });
        decorations.push(HighlightDecoration {
            range: close.clone(),
            kind,
            style,
        });

        stack.push(close);
    }

    decorations
}

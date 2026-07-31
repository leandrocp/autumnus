//! Rainbow-bracket resolution shared by the Rust runtimes.
//!
//! The CLI and the pooled WASM `Runtime` both turn a bracket query into coloured
//! ranges. They previously carried byte-identical copies of this logic, which is
//! exactly the drift `AGENTS.md` warns about, so it lives here once.
//!
//! Callers still own their own `Query`, because how a compiled query is cached
//! differs: the `Runtime` keeps one per loaded language, while the CLI compiles it
//! per invocation.

use std::ops::Range;
use std::sync::LazyLock;

use lumis_core::highlights::HIGHLIGHT_NAMES;
use streaming_iterator::StreamingIterator;
use tree_sitter::{Node, Query, QueryCursor};

/// Scope names cycled through by nesting depth.
pub const RAINBOW_BRACKET_SCOPES: [&str; 6] = [
    "punctuation.bracket.rainbow.1",
    "punctuation.bracket.rainbow.2",
    "punctuation.bracket.rainbow.3",
    "punctuation.bracket.rainbow.4",
    "punctuation.bracket.rainbow.5",
    "punctuation.bracket.rainbow.6",
];

/// `RAINBOW_BRACKET_SCOPES` resolved to highlight indices once, falling back to
/// `punctuation.bracket` for themes that do not define the rainbow scopes.
pub static RAINBOW_SCOPE_INDICES: LazyLock<[usize; RAINBOW_BRACKET_SCOPES.len()]> =
    LazyLock::new(|| {
        let fallback = HIGHLIGHT_NAMES
            .iter()
            .position(|candidate| *candidate == "punctuation.bracket")
            .unwrap_or(0);
        std::array::from_fn(|index| {
            HIGHLIGHT_NAMES
                .iter()
                .position(|candidate| *candidate == RAINBOW_BRACKET_SCOPES[index])
                .unwrap_or(fallback)
        })
    });

/// A bracket and the highlight index its nesting depth earned it.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RainbowRange {
    pub start: usize,
    pub end: usize,
    pub scope_index: usize,
}

/// A matched open/close bracket pair.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BracketPair {
    pub open: Range<usize>,
    pub close: Range<usize>,
}

/// The `@open` and `@close` capture indices, when the query defines both.
#[must_use]
pub fn capture_indices(query: &Query) -> Option<(u32, u32)> {
    let index = |wanted: &str| {
        query
            .capture_names()
            .iter()
            .position(|name| *name == wanted)
            .map(|position| position as u32)
    };
    Some((index("open")?, index("close")?))
}

/// Collect bracket pairs from an already-parsed tree.
///
/// Patterns carrying `(#set! rainbow.exclude)` are skipped, matching Neovim's
/// rainbow-delimiter behaviour.
#[must_use]
pub fn bracket_pairs(query: &Query, root: Node<'_>, source: &[u8]) -> Vec<BracketPair> {
    let Some((open_capture, close_capture)) = capture_indices(query) else {
        return Vec::new();
    };

    let mut cursor = QueryCursor::new();
    let mut matches = cursor.matches(query, root, source);
    let mut pairs = Vec::new();

    while let Some(query_match) = matches.next() {
        if query
            .property_settings(query_match.pattern_index)
            .iter()
            .any(|property| property.key.as_ref() == "rainbow.exclude")
        {
            continue;
        }

        let mut opens = Vec::new();
        let mut closes = Vec::new();
        for capture in query_match.captures {
            if capture.index == open_capture {
                opens.push(capture.node.byte_range());
            } else if capture.index == close_capture {
                closes.push(capture.node.byte_range());
            }
        }

        for (open, close) in opens.into_iter().zip(closes) {
            if open.start < close.end && (open.len() == 1 || close.len() == 1) {
                pairs.push(BracketPair { open, close });
            }
        }
    }

    pairs
}

/// Assign a depth-derived scope to each pair, walking them in closing order.
#[must_use]
pub fn colorize_bracket_pairs(pairs: Vec<BracketPair>) -> Vec<RainbowRange> {
    let mut opens: Vec<_> = pairs.iter().map(|pair| pair.open.clone()).collect();
    opens.sort_by_key(|range| (range.start, range.end));
    opens.dedup_by(|left, right| left.start == right.start && left.end == right.end);

    let mut color_pairs = pairs;
    color_pairs.sort_by_key(|pair| pair.close.end);
    let mut open_stack: Vec<Range<usize>> = Vec::new();
    let mut open_index = 0usize;
    let mut ranges = Vec::new();

    for pair in color_pairs {
        while open_index < opens.len() && opens[open_index].start < pair.close.start {
            open_stack.push(opens[open_index].clone());
            open_index += 1;
        }

        if open_stack.last() == Some(&pair.open) {
            let scope_index =
                RAINBOW_SCOPE_INDICES[(open_stack.len() - 1) % RAINBOW_SCOPE_INDICES.len()];
            ranges.push(RainbowRange {
                start: pair.open.start,
                end: pair.open.end,
                scope_index,
            });
            ranges.push(RainbowRange {
                start: pair.close.start,
                end: pair.close.end,
                scope_index,
            });
            open_stack.pop();
        }
    }

    ranges.sort_by_key(|range| (range.start, range.end));
    ranges
}

#[cfg(test)]
mod tests {
    use super::*;

    fn pair(open: Range<usize>, close: Range<usize>) -> BracketPair {
        BracketPair { open, close }
    }

    #[test]
    fn nesting_depth_selects_the_scope() {
        // ( [ ] )  -> outer depth 0, inner depth 1
        let ranges = colorize_bracket_pairs(vec![pair(0..1, 5..6), pair(2..3, 3..4)]);
        assert_eq!(ranges.len(), 4);
        assert_eq!(ranges[0].scope_index, RAINBOW_SCOPE_INDICES[0]);
        assert_eq!(ranges[1].scope_index, RAINBOW_SCOPE_INDICES[1]);
        assert_eq!(ranges[3].scope_index, RAINBOW_SCOPE_INDICES[0]);
    }

    #[test]
    fn depth_wraps_around_the_scope_list() {
        // Seven nested pairs: the outermost and the seventh share a scope.
        let pairs: Vec<_> = (0..7).map(|i| pair(i..i + 1, 20 - i..21 - i)).collect();
        let ranges = colorize_bracket_pairs(pairs);
        let opens: Vec<_> = ranges.iter().filter(|r| r.start < 7).collect();
        assert_eq!(opens[0].scope_index, opens[6].scope_index);
    }

    #[test]
    fn unmatched_pairs_are_dropped() {
        assert!(colorize_bracket_pairs(Vec::new()).is_empty());
    }
}

//! The words that changed between a diff's removed lines and the added lines
//! that replace them.
//!
//! The diff grammar says which lines were removed and added; this module
//! decides which parts of them differ. A run is a block of consecutive removed
//! lines followed by the added lines right after it. Lines are split into word,
//! whitespace and punctuation tokens, each removed line is paired with the
//! added line it shares the most tokens with, and each pair is compared token
//! by token.
//!
//! The comparison is the classic LCS table walk from `similar`, without its
//! heuristics, because the browser port has to reproduce its tie-breaking.

use crate::decorations::DiffWordKind;
use similar::algorithms::{lcs, Capture};
use similar::DiffOp;
use std::ops::Range;

/// Runs larger than this on either side, in bytes of line content, are left
/// unmarked. The comparison table grows with the product of both sides.
#[doc(hidden)]
pub const MAX_RUN_SIDE_BYTES: usize = 1000;

/// One removed or added line, as the diff grammar marks it.
#[doc(hidden)]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DiffLine {
    pub kind: DiffWordKind,
    /// The zero-based row the line is on, which decides what counts as
    /// consecutive.
    pub row: usize,
    /// The line's text after its `-` or `+` marker, as source byte offsets.
    pub content: Range<usize>,
}

/// A changed range before it is composed into the event stream.
#[doc(hidden)]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DiffWordRange {
    pub start: usize,
    pub end: usize,
    pub kind: DiffWordKind,
}

/// The changed ranges of every run in `lines`, in source order.
///
/// `lines` must be in source order.
#[doc(hidden)]
#[must_use]
pub fn diff_word_ranges(source: &str, lines: &[DiffLine]) -> Vec<DiffWordRange> {
    let mut ranges = Vec::new();
    let mut start = 0;
    while start < lines.len() {
        let end = run_end(lines, start);
        let split = start
            + lines[start..end]
                .iter()
                .take_while(|line| line.kind == DiffWordKind::Removed)
                .count();
        diff_run(
            source,
            &lines[start..split],
            &lines[split..end],
            &mut ranges,
        );
        start = end;
    }
    ranges
}

fn run_end(lines: &[DiffLine], start: usize) -> usize {
    let mut end = start + 1;
    while end < lines.len() {
        let (previous, line) = (&lines[end - 1], &lines[end]);
        let starts_new_run =
            previous.kind == DiffWordKind::Added && line.kind == DiffWordKind::Removed;
        if line.row != previous.row + 1 || starts_new_run {
            break;
        }
        end += 1;
    }
    end
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum TokenClass {
    Word,
    Space,
    Other,
}

struct Token {
    range: Range<usize>,
    class: TokenClass,
}

/// Which tokens of a removed and an added line the other one lacks.
struct Comparison {
    old_changed: Vec<bool>,
    new_changed: Vec<bool>,
    /// Non-whitespace tokens both lines share.
    kept: usize,
}

fn diff_run(source: &str, removed: &[DiffLine], added: &[DiffLine], out: &mut Vec<DiffWordRange>) {
    let side_bytes =
        |lines: &[DiffLine]| -> usize { lines.iter().map(|line| line.content.len()).sum() };
    if removed.is_empty()
        || added.is_empty()
        || side_bytes(removed) > MAX_RUN_SIDE_BYTES
        || side_bytes(added) > MAX_RUN_SIDE_BYTES
    {
        return;
    }

    let tokenize_all = |lines: &[DiffLine]| -> Vec<Vec<Token>> {
        lines
            .iter()
            .map(|line| tokenize(source, line.content.clone()))
            .collect()
    };
    let old = tokenize_all(removed);
    let new = tokenize_all(added);

    let mut removed_ranges = Vec::new();
    let mut added_ranges = Vec::new();
    for (i, j, comparison) in pair_lines(source, &old, &new) {
        mark_line(
            &old[i],
            &comparison.old_changed,
            DiffWordKind::Removed,
            &mut removed_ranges,
        );
        mark_line(
            &new[j],
            &comparison.new_changed,
            DiffWordKind::Added,
            &mut added_ranges,
        );
    }
    out.append(&mut removed_ranges);
    out.append(&mut added_ranges);
}

/// Pair removed lines with added lines, in order, sharing the most tokens.
///
/// A pair qualifies only when each line keeps at least a third of its
/// non-whitespace tokens; emphasis covering a rewritten line says no more
/// than the line marker does. Lines left unpaired were wholly removed or
/// added, and mark nothing.
///
/// Ties prefer pairing, then skipping a removed line, so the browser port can
/// reproduce the choice.
fn pair_lines(
    source: &str,
    old: &[Vec<Token>],
    new: &[Vec<Token>],
) -> Vec<(usize, usize, Comparison)> {
    let (rows, columns) = (old.len(), new.len());
    let mut comparisons: Vec<Option<Comparison>> = old
        .iter()
        .flat_map(|old_line| {
            new.iter().map(move |new_line| {
                let comparison = compare(source, old_line, new_line);
                let qualifies = comparison.kept * 3 >= non_space(old_line)
                    && comparison.kept * 3 >= non_space(new_line)
                    && comparison.kept > 0;
                qualifies.then_some(comparison)
            })
        })
        .collect();

    // `best[i][j]` is the most tokens the first `i` removed lines and the
    // first `j` added lines can share.
    let mut best = vec![vec![0usize; columns + 1]; rows + 1];
    for i in 1..=rows {
        for j in 1..=columns {
            let paired = comparisons[(i - 1) * columns + j - 1]
                .as_ref()
                .map_or(0, |comparison| best[i - 1][j - 1] + comparison.kept);
            best[i][j] = paired.max(best[i - 1][j]).max(best[i][j - 1]);
        }
    }

    let mut pairs = Vec::new();
    let (mut i, mut j) = (rows, columns);
    while i > 0 && j > 0 {
        let index = (i - 1) * columns + j - 1;
        let paired = comparisons[index]
            .as_ref()
            .is_some_and(|comparison| best[i][j] == best[i - 1][j - 1] + comparison.kept);
        if paired {
            let comparison = comparisons[index].take().expect("checked above");
            pairs.push((i - 1, j - 1, comparison));
            i -= 1;
            j -= 1;
        } else if best[i][j] == best[i - 1][j] {
            i -= 1;
        } else {
            j -= 1;
        }
    }
    pairs.reverse();
    pairs
}

fn non_space(tokens: &[Token]) -> usize {
    tokens
        .iter()
        .filter(|token| token.class != TokenClass::Space)
        .count()
}

fn compare(source: &str, old: &[Token], new: &[Token]) -> Comparison {
    let text = |tokens: &[Token]| -> Vec<&str> {
        tokens
            .iter()
            .map(|token| &source[token.range.clone()])
            .collect()
    };
    let (old_text, new_text) = (text(old), text(new));

    let mut capture = Capture::new();
    let Ok(()) = lcs::diff_deadline_raw(
        &mut capture,
        &old_text,
        0..old_text.len(),
        &new_text,
        0..new_text.len(),
        None,
    );

    let mut old_changed = vec![false; old.len()];
    let mut new_changed = vec![false; new.len()];
    for op in capture.ops() {
        match *op {
            DiffOp::Equal { .. } => {}
            DiffOp::Delete {
                old_index, old_len, ..
            } => old_changed[old_index..old_index + old_len].fill(true),
            DiffOp::Insert {
                new_index, new_len, ..
            } => new_changed[new_index..new_index + new_len].fill(true),
            DiffOp::Replace {
                old_index,
                old_len,
                new_index,
                new_len,
            } => {
                old_changed[old_index..old_index + old_len].fill(true);
                new_changed[new_index..new_index + new_len].fill(true);
            }
        }
    }

    let kept = old
        .iter()
        .zip(&old_changed)
        .filter(|(token, changed)| !**changed && token.class != TokenClass::Space)
        .count();
    Comparison {
        old_changed,
        new_changed,
        kept,
    }
}

/// Word runs, whitespace runs, and every other character on its own.
fn tokenize(source: &str, content: Range<usize>) -> Vec<Token> {
    let class_of = |c: char| {
        if c.is_alphanumeric() || c == '_' {
            TokenClass::Word
        } else if c.is_whitespace() {
            TokenClass::Space
        } else {
            TokenClass::Other
        }
    };

    let mut tokens: Vec<Token> = Vec::new();
    for (offset, c) in source[content.clone()].char_indices() {
        let start = content.start + offset;
        let end = start + c.len_utf8();
        let class = class_of(c);
        match tokens.last_mut() {
            Some(last) if class != TokenClass::Other && last.class == class => {
                last.range.end = end;
            }
            _ => tokens.push(Token {
                range: start..end,
                class,
            }),
        }
    }
    tokens
}

/// Emit the changed ranges of one line.
fn mark_line(tokens: &[Token], changed: &[bool], kind: DiffWordKind, out: &mut Vec<DiffWordRange>) {
    let mut segments: Vec<(usize, usize)> = Vec::new();
    for (index, _) in changed.iter().enumerate().filter(|(_, &c)| c) {
        match segments.last_mut() {
            Some((_, last)) if *last + 1 == index => *last = index,
            // A single unchanged space between two changes reads as part of
            // one edit, and splitting there leaves a gap in the emphasis.
            Some((_, last))
                if *last + 2 == index && tokens[*last + 1].class == TokenClass::Space =>
            {
                *last = index;
            }
            _ => segments.push((index, index)),
        }
    }

    out.extend(segments.into_iter().map(|(first, last)| DiffWordRange {
        start: tokens[first].range.start,
        end: tokens[last].range.end,
        kind,
    }));
}

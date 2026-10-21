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

/// The changed ranges of every run in `lines`, in source order, or `None`
/// when `stop` asked to give up.
///
/// `lines` must be in source order. Pairing a run compares every removed line
/// with every added one, so its cost grows with the product of both sides;
/// `stop` is consulted throughout and is what bounds it.
#[doc(hidden)]
#[must_use]
pub fn diff_word_ranges(
    source: &str,
    lines: &[DiffLine],
    mut stop: impl FnMut() -> bool,
) -> Option<Vec<DiffWordRange>> {
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
            &mut stop,
            &mut ranges,
        )?;
        start = end;
    }
    Some(ranges)
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

fn diff_run(
    source: &str,
    removed: &[DiffLine],
    added: &[DiffLine],
    stop: &mut impl FnMut() -> bool,
    out: &mut Vec<DiffWordRange>,
) -> Option<()> {
    if stop() {
        return None;
    }
    if removed.is_empty() || added.is_empty() {
        return Some(());
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
    for (i, j, comparison) in pair_lines(source, &old, &new, stop)? {
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
    Some(())
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
    stop: &mut impl FnMut() -> bool,
) -> Option<Vec<(usize, usize, Comparison)>> {
    let (rows, columns) = (old.len(), new.len());
    let old_words: Vec<usize> = old.iter().map(|line| non_space(line)).collect();
    let new_words: Vec<usize> = new.iter().map(|line| non_space(line)).collect();

    // `kept[i][j]` is the tokens removed line `i` and added line `j` share
    // when they qualify as a pair, else 0. `best[i][j]` is the most tokens the
    // first `i` removed lines and the first `j` added lines can share. Both are
    // built a row at a time so `stop` bounds how large they get.
    let mut kept = Vec::with_capacity(rows * columns);
    let mut best = vec![0usize; columns + 1];
    for (i, old_line) in old.iter().enumerate() {
        if stop() {
            return None;
        }
        let row = (i + 1) * (columns + 1);
        best.push(0);
        for (j, new_line) in new.iter().enumerate() {
            // A line with no words shares none, so it never qualifies.
            let shared = if old_words[i] == 0 || new_words[j] == 0 {
                0
            } else {
                if stop() {
                    return None;
                }
                compare(source, old_line, new_line).kept
            };
            let qualifies = shared > 0 && shared * 3 >= old_words[i] && shared * 3 >= new_words[j];
            let shared = if qualifies { shared } else { 0 };
            kept.push(shared);
            let paired = if qualifies {
                best[row - columns - 1 + j] + shared
            } else {
                0
            };
            let value = paired
                .max(best[row - columns - 1 + j + 1])
                .max(best[row + j]);
            best.push(value);
        }
    }

    let at = |i: usize, j: usize| best[i * (columns + 1) + j];
    let mut pairs = Vec::new();
    let (mut i, mut j) = (rows, columns);
    while i > 0 && j > 0 {
        let shared = kept[(i - 1) * columns + j - 1];
        if shared > 0 && at(i, j) == at(i - 1, j - 1) + shared {
            pairs.push((i - 1, j - 1, compare(source, &old[i - 1], &new[j - 1])));
            i -= 1;
            j -= 1;
        } else if at(i, j) == at(i - 1, j) {
            i -= 1;
        } else {
            j -= 1;
        }
    }
    pairs.reverse();
    Some(pairs)
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

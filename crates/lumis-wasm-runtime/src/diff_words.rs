//! Changed-word ranges of a parsed diff, shared by the CLI and the pooled WASM
//! `Runtime`.
//!
//! The diff grammar decides which lines were removed and added; `lumis-core`
//! decides which of their words differ.

pub use lumis_core::decorations::DiffWordKind;
pub use lumis_core::diff_words::{diff_word_ranges, DiffLine, DiffWordRange};
use tree_sitter::Node;

/// The grammar whose trees carry changed-word ranges.
pub const DIFF_GRAMMAR: &str = "diff";

/// The changed-word ranges in a tree parsed by the diff grammar, or `None`
/// when `stop` asked to give up.
#[must_use]
pub fn diff_word_ranges_in(
    root: Node<'_>,
    source: &str,
    stop: impl FnMut() -> bool,
) -> Option<Vec<DiffWordRange>> {
    diff_word_ranges(source, &changed_lines(root), stop)
}

/// Every removed and added line, in source order.
///
/// A hunk is only a `changes` node inside a whole `diff --git` block; a
/// `diff -u` hunk, or the bare `-` and `+` lines a document quotes, parse as
/// top-level lines instead, so the lines are taken wherever they are. File
/// headers are `old_file` and `new_file`, never these.
///
/// A `\ No newline at end of file` marker is a `special` line between the
/// lines it annotates, so rows skip it: a removed last line and the added
/// line replacing it stay consecutive.
fn changed_lines(root: Node<'_>) -> Vec<DiffLine> {
    let mut lines = Vec::new();
    let mut markers = 0;
    let mut cursor = root.walk();
    loop {
        let node = cursor.node();
        if node.kind() == "special" {
            markers += 1;
        } else if let Some(mut line) = diff_line(node) {
            line.row -= markers;
            lines.push(line);
        } else if cursor.goto_first_child() {
            continue;
        }
        while !cursor.goto_next_sibling() {
            if !cursor.goto_parent() {
                return lines;
            }
        }
    }
}

fn diff_line(node: Node<'_>) -> Option<DiffLine> {
    let kind = match node.kind() {
        "deletion" => DiffWordKind::Removed,
        "addition" => DiffWordKind::Added,
        _ => return None,
    };
    // The marker is one ASCII byte: `-`, `+`, `<` or `>`.
    Some(DiffLine {
        kind,
        row: node.start_position().row,
        content: node.start_byte() + 1..node.end_byte(),
    })
}

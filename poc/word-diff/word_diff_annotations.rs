//! Reads `git diff --word-diff=porcelain` and renders it through annotations.
//!
//! Copy this and `fixtures/word-diff-porcelain.diff` into `crates/lumis/examples/`
//! on the `lp-decoration-events` branch (#1100), then run
//! `cargo run --example word_diff_annotations`. It does not build against `main`,
//! which has no annotation API.
//!
//! The point it exists to make: git already computed the diff, and porcelain is
//! the format it documents as "intended for script consumption". Turning that
//! into `(clean source, ranges)` is bookkeeping, not diffing, and what falls out
//! is exactly the pair `Annotation::new` already takes. Lumis then highlights
//! real Elixir rather than a document with `[-` and `{+` embedded in it.

use lumis::events::HighlightEvent;
use lumis::formatters::Formatter;
use lumis::html;
use lumis::languages::Language;
use lumis::{Annotation, HighlightOptions};
use std::io::{self, Write};
use std::ops::Range;

#[derive(Clone, Copy, Debug)]
enum Change {
    Added,
    Removed,
}

/// One side of a word diff: source that parses, plus where it changed.
struct Side {
    source: String,
    ranges: Vec<(Range<usize>, Change)>,
}

/// Splits porcelain word-diff output into its before and after sides.
///
/// Porcelain is line-based: ` ` common, `-` removed, `+` added, `~` newline.
/// Each run belongs to one side, both sides, or neither, so accumulating them
/// separately reconstructs both documents byte for byte.
fn split(porcelain: &str) -> (Side, Side) {
    let mut before = Side {
        source: String::new(),
        ranges: Vec::new(),
    };
    let mut after = Side {
        source: String::new(),
        ranges: Vec::new(),
    };

    let body = porcelain
        .lines()
        .skip_while(|line| !line.starts_with("@@"))
        .skip(1);

    for line in body {
        let Some((marker, text)) = line.split_at_checked(1) else {
            continue;
        };

        match marker {
            "~" => {
                before.source.push('\n');
                after.source.push('\n');
            }
            " " => {
                before.source.push_str(text);
                after.source.push_str(text);
            }
            "-" => {
                let start = before.source.len();
                before.source.push_str(text);
                before
                    .ranges
                    .push((start..before.source.len(), Change::Removed));
            }
            "+" => {
                let start = after.source.len();
                after.source.push_str(text);
                after.ranges.push((start..after.source.len(), Change::Added));
            }
            _ => {}
        }
    }

    (before, after)
}

struct WordDiffFormatter {
    language: Language,
}

impl Formatter<Change> for WordDiffFormatter {
    fn language(&self) -> Language {
        self.language
    }

    fn render(
        &self,
        source: &str,
        events: &[HighlightEvent<'_, Change>],
        output: &mut dyn Write,
    ) -> io::Result<()> {
        html::open_pre_tag(output, Some("word-diff"), None)?;
        html::open_code_tag(output, &self.language)?;
        let mut open = Vec::new();

        for event in events {
            match event {
                HighlightEvent::Start { scope_index, .. } => {
                    let scope = lumis::highlights::HIGHLIGHT_NAMES[*scope_index];
                    write!(output, "<span {}>", html::span_linked_attrs(scope))?;
                }
                HighlightEvent::End => output.write_all(b"</span>")?,
                HighlightEvent::AnnotationStart { annotation } => {
                    let tag = match annotation.properties() {
                        Change::Added => "ins",
                        Change::Removed => "del",
                    };
                    write!(output, "<{tag}>")?;
                    open.push(tag);
                }
                HighlightEvent::AnnotationEnd => {
                    let tag = open.pop().expect("unmatched annotation end");
                    write!(output, "</{tag}>")?;
                }
                HighlightEvent::Source { start, end } => {
                    write!(output, "{}", html::escape(&source[*start..*end]))?;
                }
            }
        }

        html::closing_tags(output)
    }
}

fn render(side: &Side) -> Result<String, Box<dyn std::error::Error>> {
    let annotations = side
        .ranges
        .iter()
        .map(|(range, change)| Annotation::new(range.clone(), *change))
        .collect::<Result<Vec<_>, _>>()?;

    let formatter = WordDiffFormatter {
        language: Language::Elixir,
    };

    Ok(lumis::highlight_with_options(
        &side.source,
        formatter,
        HighlightOptions::new().annotations(&annotations),
    ))
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let porcelain = include_str!("word-diff-porcelain.diff");
    let (before, after) = split(porcelain);

    println!("=== before ===\n{}", render(&before)?);
    println!("\n=== after ===\n{}", render(&after)?);

    Ok(())
}

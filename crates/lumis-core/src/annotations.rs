//! Range annotations composed into the highlight event stream.

use crate::events::HighlightEvent;
use std::collections::{BTreeMap, BTreeSet};
use std::error::Error;
use std::fmt;
use std::ops::Range;

/// A zero-based source position with a UTF-8 byte column.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct Position {
    line: usize,
    column: usize,
}

impl Position {
    /// Creates a zero-based source position.
    pub const fn new(line: usize, column: usize) -> Self {
        Self { line, column }
    }

    /// Returns the zero-based line.
    pub const fn line(self) -> usize {
        self.line
    }

    /// Returns the zero-based UTF-8 byte column.
    pub const fn column(self) -> usize {
        self.column
    }
}

/// A half-open annotation range expressed as offsets or source positions.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
#[non_exhaustive]
pub enum AnnotationRange {
    /// Absolute offsets into the source, measured in UTF-8 bytes.
    Offset(Range<usize>),
    /// Zero-based lines and UTF-8 byte columns.
    Position(Range<Position>),
}

impl From<Range<usize>> for AnnotationRange {
    fn from(range: Range<usize>) -> Self {
        Self::Offset(range)
    }
}

impl From<Range<Position>> for AnnotationRange {
    fn from(range: Range<Position>) -> Self {
        Self::Position(range)
    }
}

/// A caller-provided semantic range with arbitrary typed properties.
///
/// This annotation marks only `price` in a one-line source:
///
/// ```rust
/// use lumis_core::annotations::Annotation;
///
/// let source = "let total = price;";
/// let annotation = Annotation::new(12..17, "search-match")?;
///
/// assert_eq!(&source[12..17], "price");
/// # let _ = annotation;
/// # Ok::<(), lumis_core::annotations::AnnotationError>(())
/// ```
///
/// When passed in highlighting options, a custom formatter receives
/// [`AnnotationStart`](crate::events::HighlightEvent::AnnotationStart) before
/// `price` and [`AnnotationEnd`](crate::events::HighlightEvent::AnnotationEnd)
/// after it.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct Annotation<T = ()> {
    /// Half-open source range.
    range: AnnotationRange,
    /// Caller-owned properties interpreted by formatters.
    properties: T,
}

impl<T> Annotation<T> {
    /// Creates an annotation for a non-empty offset or position range.
    ///
    /// Source bounds, position bounds, and UTF-8 character boundaries are
    /// checked when the annotation is used to format a specific source.
    pub fn new(range: impl Into<AnnotationRange>, properties: T) -> Result<Self, AnnotationError> {
        let range = range.into();
        let is_empty_or_reversed = match &range {
            AnnotationRange::Offset(range) => range.start >= range.end,
            AnnotationRange::Position(range) => range.start >= range.end,
        };

        if is_empty_or_reversed {
            return Err(AnnotationError::InvalidRange { range });
        }

        Ok(Self { range, properties })
    }

    /// Returns the caller-provided source range.
    pub fn range(&self) -> &AnnotationRange {
        &self.range
    }

    /// Returns the caller-owned properties.
    pub fn properties(&self) -> &T {
        &self.properties
    }

    /// Consumes the annotation and returns its caller-owned properties.
    pub fn into_properties(self) -> T {
        self.properties
    }
}

/// An annotation materialized to the offset range consumed by formatters.
#[derive(Debug, PartialEq, Eq, Hash)]
pub struct ResolvedAnnotation<'a, T = ()> {
    range: Range<usize>,
    properties: &'a T,
}

impl<T> Clone for ResolvedAnnotation<'_, T> {
    fn clone(&self) -> Self {
        Self {
            range: self.range.clone(),
            properties: self.properties,
        }
    }
}

impl<'a, T> ResolvedAnnotation<'a, T> {
    /// Returns the resolved half-open offset range, measured in UTF-8 bytes.
    pub fn range(&self) -> &Range<usize> {
        &self.range
    }

    /// Returns the caller-owned properties.
    pub const fn properties(&self) -> &'a T {
        self.properties
    }
}

/// An annotation range is invalid for construction or for a specific source.
#[derive(Clone, Debug, PartialEq, Eq)]
#[non_exhaustive]
pub enum AnnotationError {
    InvalidRange {
        range: AnnotationRange,
    },
    OutOfBounds {
        index: usize,
        end: usize,
        source_len: usize,
    },
    NotCharBoundary {
        index: usize,
        offset: usize,
    },
    LineOutOfBounds {
        index: usize,
        line: usize,
        line_count: usize,
    },
    ColumnOutOfBounds {
        index: usize,
        position: Position,
        line_len: usize,
    },
}

impl fmt::Display for AnnotationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidRange { range } => {
                write!(
                    f,
                    "annotation range start must be before its end: {range:?}"
                )
            }
            Self::OutOfBounds {
                index,
                end,
                source_len,
            } => write!(
                f,
                "annotation {index} ends at byte {end}, beyond source length {source_len}"
            ),
            Self::NotCharBoundary { index, offset } => write!(
                f,
                "annotation {index} offset {offset} is not a UTF-8 character boundary"
            ),
            Self::LineOutOfBounds {
                index,
                line,
                line_count,
            } => write!(
                f,
                "annotation {index} line {line} is outside the source's {line_count} lines"
            ),
            Self::ColumnOutOfBounds {
                index,
                position,
                line_len,
            } => write!(
                f,
                "annotation {index} column {} is beyond line {} byte length {line_len}",
                position.column, position.line
            ),
        }
    }
}

impl Error for AnnotationError {}

#[derive(Clone, Copy, PartialEq, Eq)]
struct SyntaxLayer<'a> {
    id: usize,
    scope_index: usize,
    language: &'a str,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum ActiveLayer<'s> {
    Syntax(SyntaxLayer<'s>),
    Annotation { index: usize },
}

#[derive(Default)]
struct AnnotationBoundary {
    starts: Vec<usize>,
    ends: Vec<usize>,
}

/// Compose caller-provided annotation intervals into syntax highlight events.
///
/// Annotations are outer layers and syntax scopes are inner layers. When an
/// annotation begins or ends inside an existing syntax scope, the syntax scope
/// is closed and reopened so every formatter receives a properly nested stream.
#[doc(hidden)]
pub fn compose_annotations<'a, T>(
    source: &str,
    events: &[HighlightEvent<'_, ()>],
    annotations: &'a [Annotation<T>],
) -> Result<Vec<HighlightEvent<'a, T>>, AnnotationError> {
    if annotations.is_empty() {
        return Ok(copy_syntax_events(events));
    }

    let annotations = resolve_annotations(source, annotations)?;

    let boundaries = annotation_boundaries(&annotations);
    let mut boundary_positions = boundaries.keys().peekable();
    let mut active_annotations = BTreeSet::new();
    let mut syntax_layers = Vec::new();
    let mut next_syntax_id = 0usize;
    let mut active_layers = Vec::new();
    let mut desired_layers = Vec::new();
    let mut output = Vec::new();

    for event in events {
        match event {
            HighlightEvent::Start {
                scope_index,
                language,
            } => {
                syntax_layers.push(SyntaxLayer {
                    id: next_syntax_id,
                    scope_index: *scope_index,
                    language,
                });
                next_syntax_id += 1;
            }
            HighlightEvent::End => {
                syntax_layers.pop();
            }
            HighlightEvent::Source { start, end } => {
                while boundary_positions
                    .peek()
                    .is_some_and(|&&position| position <= *start)
                {
                    let &position = boundary_positions
                        .next()
                        .expect("peeked annotation boundary exists");
                    apply_boundary(&boundaries[&position], &mut active_annotations);
                }

                let mut cursor = *start;
                while cursor < *end {
                    let next = boundary_positions
                        .peek()
                        .map(|&&position| position)
                        .filter(|position| *position < *end)
                        .unwrap_or(*end);

                    set_desired_layers(&active_annotations, &syntax_layers, &mut desired_layers);
                    transition_layers(
                        &mut output,
                        &mut active_layers,
                        &mut desired_layers,
                        &annotations,
                    );

                    if cursor < next {
                        output.push(HighlightEvent::Source {
                            start: cursor,
                            end: next,
                        });
                    }
                    cursor = next;

                    while boundary_positions
                        .peek()
                        .is_some_and(|&&position| position == cursor)
                    {
                        let &position = boundary_positions
                            .next()
                            .expect("peeked annotation boundary exists");
                        apply_boundary(&boundaries[&position], &mut active_annotations);
                    }
                }
            }
            HighlightEvent::AnnotationStart { .. } | HighlightEvent::AnnotationEnd => {}
        }
    }

    desired_layers.clear();
    transition_layers(
        &mut output,
        &mut active_layers,
        &mut desired_layers,
        &annotations,
    );
    Ok(output)
}

fn copy_syntax_events<'a, T>(events: &[HighlightEvent<'_, ()>]) -> Vec<HighlightEvent<'a, T>> {
    let mut output = Vec::with_capacity(events.len());

    for event in events {
        output.push(match event {
            HighlightEvent::Start {
                scope_index,
                language,
            } => HighlightEvent::Start {
                scope_index: *scope_index,
                language: language.clone(),
            },
            HighlightEvent::Source { start, end } => HighlightEvent::Source {
                start: *start,
                end: *end,
            },
            HighlightEvent::End => HighlightEvent::End,
            HighlightEvent::AnnotationStart { .. } | HighlightEvent::AnnotationEnd => continue,
        });
    }

    output
}

fn resolve_annotations<'a, T>(
    source: &str,
    annotations: &'a [Annotation<T>],
) -> Result<Vec<ResolvedAnnotation<'a, T>>, AnnotationError> {
    let line_starts = annotations
        .iter()
        .any(|annotation| matches!(annotation.range, AnnotationRange::Position(_)))
        .then(|| source_line_starts(source));
    let mut resolved = Vec::with_capacity(annotations.len());

    for (index, annotation) in annotations.iter().enumerate() {
        let range = match &annotation.range {
            AnnotationRange::Offset(range) => range.clone(),
            AnnotationRange::Position(range) => {
                let line_starts = line_starts
                    .as_deref()
                    .expect("line starts exist when position ranges are present");
                resolve_position(source, line_starts, index, range.start)?
                    ..resolve_position(source, line_starts, index, range.end)?
            }
        };

        if range.end > source.len() {
            return Err(AnnotationError::OutOfBounds {
                index,
                end: range.end,
                source_len: source.len(),
            });
        }
        for offset in [range.start, range.end] {
            if !source.is_char_boundary(offset) {
                return Err(AnnotationError::NotCharBoundary { index, offset });
            }
        }

        resolved.push(ResolvedAnnotation {
            range,
            properties: &annotation.properties,
        });
    }

    Ok(resolved)
}

fn source_line_starts(source: &str) -> Vec<usize> {
    let mut starts = vec![0];
    starts.extend(
        source
            .bytes()
            .enumerate()
            .filter_map(|(index, byte)| (byte == b'\n').then_some(index + 1)),
    );
    starts
}

fn resolve_position(
    source: &str,
    line_starts: &[usize],
    index: usize,
    position: Position,
) -> Result<usize, AnnotationError> {
    let Some(&line_start) = line_starts.get(position.line) else {
        return Err(AnnotationError::LineOutOfBounds {
            index,
            line: position.line,
            line_count: line_starts.len(),
        });
    };
    let line_end = line_starts
        .get(position.line + 1)
        .map_or(source.len(), |next_start| next_start - 1);
    let line_len = line_end - line_start;

    if position.column > line_len {
        return Err(AnnotationError::ColumnOutOfBounds {
            index,
            position,
            line_len,
        });
    }

    Ok(line_start + position.column)
}

fn annotation_boundaries<T>(
    annotations: &[ResolvedAnnotation<'_, T>],
) -> BTreeMap<usize, AnnotationBoundary> {
    let mut boundaries = BTreeMap::<usize, AnnotationBoundary>::new();
    for (index, annotation) in annotations.iter().enumerate() {
        boundaries
            .entry(annotation.range.start)
            .or_default()
            .starts
            .push(index);
        boundaries
            .entry(annotation.range.end)
            .or_default()
            .ends
            .push(index);
    }
    boundaries
}

fn apply_boundary(boundary: &AnnotationBoundary, active: &mut BTreeSet<usize>) {
    for index in &boundary.ends {
        active.remove(index);
    }
    for index in &boundary.starts {
        active.insert(*index);
    }
}

fn set_desired_layers<'s>(
    active_annotations: &BTreeSet<usize>,
    syntax_layers: &[SyntaxLayer<'s>],
    layers: &mut Vec<ActiveLayer<'s>>,
) {
    layers.clear();
    layers.reserve(active_annotations.len() + syntax_layers.len());

    for index in active_annotations {
        layers.push(ActiveLayer::Annotation { index: *index });
    }
    for layer in syntax_layers {
        layers.push(ActiveLayer::Syntax(*layer));
    }
}

fn transition_layers<'s, 'a, T>(
    output: &mut Vec<HighlightEvent<'a, T>>,
    current: &mut Vec<ActiveLayer<'s>>,
    desired: &mut Vec<ActiveLayer<'s>>,
    annotations: &[ResolvedAnnotation<'a, T>],
) {
    let common = current
        .iter()
        .zip(desired.iter())
        .take_while(|(left, right)| left == right)
        .count();

    for layer in current[common..].iter().rev() {
        output.push(match layer {
            ActiveLayer::Syntax(_) => HighlightEvent::End,
            ActiveLayer::Annotation { .. } => HighlightEvent::AnnotationEnd,
        });
    }

    for layer in &desired[common..] {
        output.push(match layer {
            ActiveLayer::Syntax(layer) => HighlightEvent::Start {
                scope_index: layer.scope_index,
                language: layer.language.to_string(),
            },
            ActiveLayer::Annotation { index } => HighlightEvent::AnnotationStart {
                annotation: annotations[*index].clone(),
            },
        });
    }

    std::mem::swap(current, desired);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_empty_ranges_at_construction() {
        assert_eq!(
            Annotation::new(2..2, ()).unwrap_err(),
            AnnotationError::InvalidRange {
                range: AnnotationRange::Offset(2..2),
            }
        );
    }

    #[test]
    fn composition_without_annotations_preserves_syntax_events() {
        let source = "ab";
        let syntax = vec![
            HighlightEvent::Start {
                scope_index: 1,
                language: "rust".to_string(),
            },
            HighlightEvent::Source { start: 0, end: 1 },
            HighlightEvent::End,
            HighlightEvent::Start {
                scope_index: 1,
                language: "rust".to_string(),
            },
            HighlightEvent::Source { start: 1, end: 2 },
            HighlightEvent::End,
        ];
        let annotations: [Annotation; 0] = [];

        let events = compose_annotations(source, &syntax, &annotations).unwrap();

        assert_eq!(events, syntax);
    }

    #[test]
    fn composition_keeps_distinct_adjacent_syntax_layers() {
        let source = "ab";
        let syntax = vec![
            HighlightEvent::Start {
                scope_index: 1,
                language: "rust".to_string(),
            },
            HighlightEvent::Source { start: 0, end: 1 },
            HighlightEvent::End,
            HighlightEvent::Start {
                scope_index: 1,
                language: "rust".to_string(),
            },
            HighlightEvent::Source { start: 1, end: 2 },
            HighlightEvent::End,
        ];
        let annotations = [Annotation::new(0..2, ()).unwrap()];

        let events = compose_annotations(source, &syntax, &annotations).unwrap();
        let syntax_starts = events
            .iter()
            .filter(|event| matches!(event, HighlightEvent::Start { .. }))
            .count();

        assert_eq!(syntax_starts, 2);
    }

    #[test]
    fn composition_preserves_source_and_balances_flat_events() {
        let source = "let value";
        let syntax = vec![
            HighlightEvent::Start {
                scope_index: 1,
                language: "rust".to_string(),
            },
            HighlightEvent::Source { start: 0, end: 3 },
            HighlightEvent::End,
            HighlightEvent::Source { start: 3, end: 4 },
            HighlightEvent::Start {
                scope_index: 2,
                language: "rust".to_string(),
            },
            HighlightEvent::Source { start: 4, end: 9 },
            HighlightEvent::End,
        ];
        let annotations = [
            Annotation::new(1..7, ()).unwrap(),
            Annotation::new(4..9, ()).unwrap(),
        ];

        let events = compose_annotations(source, &syntax, &annotations).unwrap();
        let mut rendered = String::new();
        let mut depth = 0usize;

        for event in events {
            match event {
                HighlightEvent::Start { .. } | HighlightEvent::AnnotationStart { .. } => {
                    depth += 1;
                }
                HighlightEvent::End | HighlightEvent::AnnotationEnd => {
                    depth = depth.checked_sub(1).expect("unbalanced closing event");
                }
                HighlightEvent::Source { start, end } => rendered.push_str(&source[start..end]),
            }
        }

        assert_eq!(rendered, source);
        assert_eq!(depth, 0);
    }

    #[test]
    fn rejects_non_utf8_boundaries() {
        let source = "aéz";
        let syntax = vec![HighlightEvent::Source {
            start: 0,
            end: source.len(),
        }];
        let annotations = [Annotation::new(1..2, ()).unwrap()];

        assert_eq!(
            compose_annotations(source, &syntax, &annotations).unwrap_err(),
            AnnotationError::NotCharBoundary {
                index: 0,
                offset: 2,
            }
        );
    }

    #[test]
    fn position_ranges_resolve_to_utf8_byte_ranges() {
        let source = "π\r\ncafé";
        let syntax = vec![HighlightEvent::Source {
            start: 0,
            end: source.len(),
        }];
        let annotations = [Annotation::new(Position::new(1, 0)..Position::new(1, 5), 7).unwrap()];

        let events = compose_annotations(source, &syntax, &annotations).unwrap();
        let resolved = events
            .iter()
            .find_map(|event| match event {
                HighlightEvent::AnnotationStart { annotation } => Some(annotation),
                _ => None,
            })
            .unwrap();

        assert_eq!(resolved.range(), &(4..9));
        assert_eq!(*resolved.properties(), 7);
    }

    #[test]
    fn position_columns_must_be_utf8_boundaries() {
        let source = "π\ncafé";
        let syntax = vec![HighlightEvent::Source {
            start: 0,
            end: source.len(),
        }];
        let annotations = [Annotation::new(Position::new(1, 0)..Position::new(1, 4), ()).unwrap()];

        assert_eq!(
            compose_annotations(source, &syntax, &annotations).unwrap_err(),
            AnnotationError::NotCharBoundary {
                index: 0,
                offset: 7,
            }
        );
    }
}

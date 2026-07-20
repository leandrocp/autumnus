//! Shared Wasmtime-backed Tree-sitter highlighting runtime.

pub mod tree_sitter_highlight;

use lumis_core::events::HighlightEvent;
use lumis_core::highlights::HIGHLIGHT_NAMES;
use std::collections::HashMap;
use std::sync::{Mutex, OnceLock};
use streaming_iterator::StreamingIterator;
use thiserror::Error;
use tree_sitter::{Parser, Query, QueryCursor, WasmStore};
use wasmtime::{Cache, Config, Engine};

use tree_sitter_highlight::{HighlightConfiguration, Highlighter};

const RAINBOW_BRACKET_SCOPES: [&str; 6] = [
    "punctuation.bracket.rainbow.1",
    "punctuation.bracket.rainbow.2",
    "punctuation.bracket.rainbow.3",
    "punctuation.bracket.rainbow.4",
    "punctuation.bracket.rainbow.5",
    "punctuation.bracket.rainbow.6",
];

/// Everything needed to register a parser and its highlighting queries.
pub struct LanguageSpec {
    pub id: String,
    pub aliases: Vec<String>,
    pub grammar_name: String,
    pub wasm: Vec<u8>,
    pub highlights: String,
    pub injections: String,
    pub locals: String,
    pub brackets: String,
}

struct LoadedLanguage {
    highlight: HighlightConfiguration,
    brackets_source: String,
    brackets: OnceLock<Option<Query>>,
}

struct RuntimeState {
    wasm_store: WasmStore,
    highlighter: Highlighter,
    languages: HashMap<String, LoadedLanguage>,
    aliases: HashMap<String, String>,
}

/// A reusable runtime. Calls on one instance are serialized because a Tree-sitter
/// WASM store cannot be used concurrently; separate instances remain isolated.
pub struct Runtime {
    engine: Engine,
    state: Mutex<RuntimeState>,
}

#[derive(Debug, Error)]
pub enum RuntimeError {
    #[error("failed to initialize Wasmtime: {0}")]
    Wasmtime(#[from] wasmtime::Error),
    #[error("failed to initialize Tree-sitter WASM: {0}")]
    TreeSitter(String),
    #[error("failed to load parser for language '{language}': {message}")]
    Parser { language: String, message: String },
    #[error("failed to compile queries for language '{language}': {message}")]
    Query { language: String, message: String },
    #[error("language '{0}' is not loaded")]
    LanguageNotLoaded(String),
    #[error("highlighting failed: {0}")]
    Highlight(String),
    #[error("source or event offset exceeds the native event format limit")]
    EventTooLarge,
}

impl Runtime {
    pub fn new() -> Result<Self, RuntimeError> {
        static ENGINE: OnceLock<Engine> = OnceLock::new();

        if let Some(engine) = ENGINE.get() {
            return Self::with_engine(engine.clone());
        }

        let mut config = Config::new();
        if let Ok(cache) = Cache::from_file(None::<&std::path::Path>) {
            config.cache(Some(cache));
        }

        let engine = Engine::new(&config)?;
        let _ = ENGINE.set(engine.clone());
        Self::with_engine(ENGINE.get().cloned().unwrap_or(engine))
    }

    fn with_engine(engine: Engine) -> Result<Self, RuntimeError> {
        let wasm_store =
            WasmStore::new(&engine).map_err(|error| RuntimeError::TreeSitter(error.to_string()))?;
        let mut highlighter = Highlighter::new();
        highlighter
            .parser()
            .set_wasm_store(
                WasmStore::new(&engine)
                    .map_err(|error| RuntimeError::TreeSitter(error.to_string()))?,
            )
            .map_err(|error| RuntimeError::TreeSitter(error.to_string()))?;
        Ok(Self {
            engine,
            state: Mutex::new(RuntimeState {
                wasm_store,
                highlighter,
                languages: HashMap::new(),
                aliases: HashMap::new(),
            }),
        })
    }

    pub fn load_language(&self, spec: LanguageSpec) -> Result<(), RuntimeError> {
        let mut state = self.state.lock().expect("runtime lock poisoned");
        if state.languages.contains_key(&spec.id) {
            return Ok(());
        }

        let language = state
            .wasm_store
            .load_language(&spec.grammar_name, &spec.wasm)
            .map_err(|error| RuntimeError::Parser {
                language: spec.id.clone(),
                message: error.to_string(),
            })?;
        let mut highlight = HighlightConfiguration::new(
            language.clone(),
            spec.id.clone(),
            &spec.highlights,
            &spec.injections,
            &spec.locals,
        )
        .map_err(|error| RuntimeError::Query {
            language: spec.id.clone(),
            message: error.to_string(),
        })?;
        highlight.configure(&HIGHLIGHT_NAMES);

        for alias in &spec.aliases {
            state.aliases.insert(alias.clone(), spec.id.clone());
        }
        state.languages.insert(
            spec.id,
            LoadedLanguage {
                highlight,
                brackets_source: spec.brackets,
                brackets: OnceLock::new(),
            },
        );
        Ok(())
    }

    pub fn has_language(&self, name_or_alias: &str) -> bool {
        let state = self.state.lock().expect("runtime lock poisoned");
        let id = state
            .aliases
            .get(name_or_alias)
            .map(String::as_str)
            .unwrap_or(name_or_alias);
        state.languages.contains_key(id)
    }

    pub fn configure_language(
        &self,
        name_or_alias: &str,
        highlights: &str,
        injections: &str,
        locals: &str,
    ) -> Result<(), RuntimeError> {
        let mut state = self.state.lock().expect("runtime lock poisoned");
        let id = state
            .aliases
            .get(name_or_alias)
            .cloned()
            .unwrap_or_else(|| name_or_alias.to_string());
        let language = state
            .languages
            .get(&id)
            .ok_or_else(|| RuntimeError::LanguageNotLoaded(name_or_alias.to_string()))?
            .highlight
            .language
            .clone();
        let mut highlight =
            HighlightConfiguration::new(language, id.clone(), highlights, injections, locals)
                .map_err(|error| RuntimeError::Query {
                    language: id.clone(),
                    message: error.to_string(),
                })?;
        highlight.configure(&HIGHLIGHT_NAMES);
        state
            .languages
            .get_mut(&id)
            .expect("loaded language disappeared while locked")
            .highlight = highlight;
        Ok(())
    }

    pub fn highlight(
        &self,
        source: &str,
        name_or_alias: &str,
        rainbow_brackets: bool,
    ) -> Result<Vec<HighlightEvent>, RuntimeError> {
        let mut state = self.state.lock().expect("runtime lock poisoned");
        let root_id = state
            .aliases
            .get(name_or_alias)
            .cloned()
            .unwrap_or_else(|| name_or_alias.to_string());
        let RuntimeState {
            highlighter,
            languages,
            aliases,
            ..
        } = &mut *state;
        let root = languages
            .get(&root_id)
            .ok_or_else(|| RuntimeError::LanguageNotLoaded(name_or_alias.to_string()))?;

        let events = highlighter
            .highlight(&root.highlight, source.as_bytes(), None, |injected| {
                let id = aliases
                    .get(injected)
                    .map(String::as_str)
                    .unwrap_or(injected);
                languages.get(id).map(|loaded| &loaded.highlight)
            })
            .map_err(|error| RuntimeError::Highlight(error.to_string()))?;

        let mut output = Vec::new();
        for event in events {
            match event.map_err(|error| RuntimeError::Highlight(error.to_string()))? {
                tree_sitter_highlight::HighlightEvent::Source { start, end } => {
                    output.push(HighlightEvent::Source { start, end });
                }
                tree_sitter_highlight::HighlightEvent::HighlightStart {
                    highlight,
                    language,
                } => output.push(HighlightEvent::Start {
                    scope_index: highlight.0,
                    language,
                }),
                tree_sitter_highlight::HighlightEvent::HighlightEnd => {
                    output.push(HighlightEvent::End);
                }
            }
        }

        if rainbow_brackets {
            let ranges = rainbow_ranges(&self.engine, root, source)?;
            output = apply_rainbow_brackets(output, ranges, &root_id);
        }

        Ok(output)
    }

    /// Encode events into one compact buffer for a single native boundary crossing.
    pub fn highlight_encoded(
        &self,
        source: &str,
        name_or_alias: &str,
        rainbow_brackets: bool,
    ) -> Result<Vec<u8>, RuntimeError> {
        encode_events(&self.highlight(source, name_or_alias, rainbow_brackets)?)
    }
}

#[derive(Clone, Debug)]
struct RainbowRange {
    start: usize,
    end: usize,
    scope_index: usize,
}

#[derive(Clone, Debug)]
struct BracketPair {
    open: std::ops::Range<usize>,
    close: std::ops::Range<usize>,
}

fn rainbow_ranges(
    engine: &Engine,
    language: &LoadedLanguage,
    source: &str,
) -> Result<Vec<RainbowRange>, RuntimeError> {
    let query = language.brackets.get_or_init(|| {
        if language.brackets_source.trim().is_empty() {
            None
        } else {
            // The default bracket query intentionally includes tokens absent
            // from some grammars, so a compilation failure means "no rainbow
            // brackets" for that language.
            Query::new(&language.highlight.language, &language.brackets_source).ok()
        }
    });
    let Some(query) = query else {
        return Ok(Vec::new());
    };
    let open_capture = query
        .capture_names()
        .iter()
        .position(|name| *name == "open")
        .map(|index| index as u32);
    let close_capture = query
        .capture_names()
        .iter()
        .position(|name| *name == "close")
        .map(|index| index as u32);
    let (Some(open_capture), Some(close_capture)) = (open_capture, close_capture) else {
        return Ok(Vec::new());
    };

    let mut parser = Parser::new();
    parser
        .set_wasm_store(
            WasmStore::new(engine).map_err(|error| RuntimeError::TreeSitter(error.to_string()))?,
        )
        .map_err(|error| RuntimeError::TreeSitter(error.to_string()))?;
    parser
        .set_language(&language.highlight.language)
        .map_err(|error| RuntimeError::TreeSitter(error.to_string()))?;
    let Some(tree) = parser.parse(source.as_bytes(), None) else {
        return Ok(Vec::new());
    };

    let mut cursor = QueryCursor::new();
    let mut matches = cursor.matches(query, tree.root_node(), source.as_bytes());
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

    Ok(colorize_bracket_pairs(pairs))
}

fn colorize_bracket_pairs(pairs: Vec<BracketPair>) -> Vec<RainbowRange> {
    let mut opens: Vec<_> = pairs.iter().map(|pair| pair.open.clone()).collect();
    opens.sort_by_key(|range| (range.start, range.end));
    opens.dedup_by(|a, b| a.start == b.start && a.end == b.end);

    let mut color_pairs = pairs;
    color_pairs.sort_by_key(|pair| pair.close.end);
    let mut open_stack = Vec::new();
    let mut open_index = 0usize;
    let mut ranges = Vec::new();

    for pair in color_pairs {
        while open_index < opens.len() && opens[open_index].start < pair.close.start {
            open_stack.push(opens[open_index].clone());
            open_index += 1;
        }

        if open_stack.last() == Some(&pair.open) {
            let scope =
                RAINBOW_BRACKET_SCOPES[(open_stack.len() - 1) % RAINBOW_BRACKET_SCOPES.len()];
            let scope_index = HIGHLIGHT_NAMES
                .iter()
                .position(|candidate| *candidate == scope)
                .unwrap_or(0);
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

fn apply_rainbow_brackets(
    events: Vec<HighlightEvent>,
    ranges: Vec<RainbowRange>,
    language: &str,
) -> Vec<HighlightEvent> {
    if ranges.is_empty() {
        return events;
    }

    let mut output = Vec::new();
    let mut range_index = 0usize;
    for event in events {
        let HighlightEvent::Source { start, end } = event else {
            output.push(event);
            continue;
        };

        let mut source_cursor = start;
        while range_index < ranges.len() && ranges[range_index].end <= start {
            range_index += 1;
        }

        let mut next_index = range_index;
        while let Some(range) = ranges.get(next_index) {
            if range.start >= end {
                break;
            }
            if range.start < start || range.end > end {
                next_index += 1;
                continue;
            }

            if source_cursor < range.start {
                output.push(HighlightEvent::Source {
                    start: source_cursor,
                    end: range.start,
                });
            }
            output.push(HighlightEvent::Start {
                scope_index: range.scope_index,
                language: language.to_string(),
            });
            output.push(HighlightEvent::Source {
                start: range.start,
                end: range.end,
            });
            output.push(HighlightEvent::End);
            source_cursor = range.end;
            next_index += 1;
        }

        if source_cursor < end {
            output.push(HighlightEvent::Source {
                start: source_cursor,
                end,
            });
        }
    }
    output
}

fn encode_events(events: &[HighlightEvent]) -> Result<Vec<u8>, RuntimeError> {
    let mut output = Vec::with_capacity(events.len() * 9);
    for event in events {
        match event {
            HighlightEvent::Source { start, end } => {
                let start = u32::try_from(*start).map_err(|_| RuntimeError::EventTooLarge)?;
                let end = u32::try_from(*end).map_err(|_| RuntimeError::EventTooLarge)?;
                output.push(0);
                output.extend_from_slice(&start.to_le_bytes());
                output.extend_from_slice(&end.to_le_bytes());
            }
            HighlightEvent::Start {
                scope_index,
                language,
            } => {
                let scope_index =
                    u16::try_from(*scope_index).map_err(|_| RuntimeError::EventTooLarge)?;
                let language_len =
                    u16::try_from(language.len()).map_err(|_| RuntimeError::EventTooLarge)?;
                output.push(1);
                output.extend_from_slice(&scope_index.to_le_bytes());
                output.extend_from_slice(&language_len.to_le_bytes());
                output.extend_from_slice(language.as_bytes());
            }
            HighlightEvent::End => output.push(2),
        }
    }
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encodes_event_stream() {
        let events = vec![
            HighlightEvent::Start {
                scope_index: 7,
                language: "rust".to_string(),
            },
            HighlightEvent::Source { start: 1, end: 4 },
            HighlightEvent::End,
        ];
        let encoded = encode_events(&events).unwrap();
        assert_eq!(encoded[0], 1);
        assert_eq!(encoded.last(), Some(&2));
    }
}

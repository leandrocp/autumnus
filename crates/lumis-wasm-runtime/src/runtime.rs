//! Wasmtime-backed Tree-sitter highlighting runtime.

use lumis_core::events::HighlightEvent;
use lumis_core::highlights::HIGHLIGHT_NAMES;
use std::collections::HashMap;
use std::sync::{Arc, Condvar, Mutex, OnceLock, RwLock};
use thiserror::Error;
use tree_sitter::{Parser, Query, WasmStore};
use wasmtime::{Cache, CacheConfig, Config, Engine};

use crate::brackets::{bracket_pairs, colorize_bracket_pairs, RainbowRange};
use crate::tree_sitter_highlight::{HighlightConfiguration, Highlighter};

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

#[derive(Default)]
struct Catalog {
    languages: Arc<HashMap<String, Arc<LoadedLanguage>>>,
    aliases: Arc<HashMap<String, String>>,
}

struct Worker {
    highlighter: Highlighter,
}

impl Worker {
    fn new(engine: &Engine) -> Result<Self, RuntimeError> {
        let mut highlighter = Highlighter::new();
        highlighter
            .parser()
            .set_wasm_store(
                WasmStore::new(engine)
                    .map_err(|error| RuntimeError::TreeSitter(error.to_string()))?,
            )
            .map_err(|error| RuntimeError::TreeSitter(error.to_string()))?;
        Ok(Self { highlighter })
    }
}

#[derive(Default)]
struct WorkerPoolState {
    idle: Vec<Worker>,
    total: usize,
}

struct WorkerPool {
    engine: Engine,
    limit: usize,
    state: Mutex<WorkerPoolState>,
    available: Condvar,
}

impl WorkerPool {
    fn new(engine: Engine, limit: usize) -> Self {
        Self {
            engine,
            limit: limit.max(1),
            state: Mutex::new(WorkerPoolState::default()),
            available: Condvar::new(),
        }
    }

    fn lease(&self) -> Result<WorkerLease<'_>, RuntimeError> {
        let mut state = self.state.lock().expect("worker pool lock poisoned");
        loop {
            if let Some(worker) = state.idle.pop() {
                return Ok(WorkerLease {
                    pool: self,
                    worker: Some(worker),
                });
            }

            if state.total < self.limit {
                state.total += 1;
                drop(state);
                match Worker::new(&self.engine) {
                    Ok(worker) => {
                        return Ok(WorkerLease {
                            pool: self,
                            worker: Some(worker),
                        });
                    }
                    Err(error) => {
                        let mut state = self.state.lock().expect("worker pool lock poisoned");
                        state.total -= 1;
                        self.available.notify_one();
                        return Err(error);
                    }
                }
            }

            state = self
                .available
                .wait(state)
                .expect("worker pool lock poisoned while waiting");
        }
    }
}

struct WorkerLease<'a> {
    pool: &'a WorkerPool,
    worker: Option<Worker>,
}

impl WorkerLease<'_> {
    fn worker(&mut self) -> &mut Worker {
        self.worker.as_mut().expect("worker lease is empty")
    }
}

impl Drop for WorkerLease<'_> {
    fn drop(&mut self) {
        if let Some(worker) = self.worker.take() {
            let mut state = self.pool.state.lock().expect("worker pool lock poisoned");
            state.idle.push(worker);
            self.pool.available.notify_one();
        }
    }
}

/// A reusable runtime with a shared Wasmtime engine, a lazy language catalog,
/// and a bounded pool of independent highlighter workers.
pub struct Runtime {
    loader: Mutex<WasmStore>,
    catalog: RwLock<Catalog>,
    workers: WorkerPool,
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
}

impl Runtime {
    /// Construct a runtime whose concurrent highlighting is bounded by
    /// `worker_limit`, which should match the number of threads that will call
    /// it. A worker costs roughly 110 KB of resident memory, against about
    /// 15 MB for each loaded language, so this is a cheap dial.
    ///
    /// Values below one are treated as one.
    pub fn with_worker_limit(worker_limit: usize) -> Result<Self, RuntimeError> {
        static ENGINE: OnceLock<Engine> = OnceLock::new();

        if let Some(engine) = ENGINE.get() {
            return Self::with_engine(engine.clone(), worker_limit);
        }

        let engine = cached_engine()?;
        let _ = ENGINE.set(engine.clone());
        Self::with_engine(ENGINE.get().cloned().unwrap_or(engine), worker_limit)
    }

    fn with_engine(engine: Engine, worker_limit: usize) -> Result<Self, RuntimeError> {
        let loader =
            WasmStore::new(&engine).map_err(|error| RuntimeError::TreeSitter(error.to_string()))?;
        Ok(Self {
            loader: Mutex::new(loader),
            catalog: RwLock::new(Catalog::default()),
            workers: WorkerPool::new(engine, worker_limit),
        })
    }

    pub fn load_language(&self, spec: LanguageSpec) -> Result<(), RuntimeError> {
        if self
            .catalog
            .read()
            .expect("language catalog lock poisoned")
            .languages
            .contains_key(&spec.id)
        {
            return Ok(());
        }

        // Loading is rare and WasmStore is not re-entrant. Keeping one loader
        // also makes concurrent requests for the same language idempotent.
        let mut loader = self.loader.lock().expect("language loader lock poisoned");
        if self
            .catalog
            .read()
            .expect("language catalog lock poisoned")
            .languages
            .contains_key(&spec.id)
        {
            return Ok(());
        }

        let language = loader
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

        let mut catalog = self
            .catalog
            .write()
            .expect("language catalog lock poisoned");
        for alias in &spec.aliases {
            Arc::make_mut(&mut catalog.aliases).insert(alias.clone(), spec.id.clone());
        }
        Arc::make_mut(&mut catalog.languages).insert(
            spec.id,
            Arc::new(LoadedLanguage {
                highlight,
                brackets_source: spec.brackets,
                brackets: OnceLock::new(),
            }),
        );
        Ok(())
    }

    /// Declare a supported language before its parser is loaded.
    ///
    /// Register a language's aliases so `#{lang}` in an injection query and a
    /// caller's name resolve to the same id. Declaring does not load anything.
    pub fn declare_language(&self, id: &str, aliases: &[&str]) {
        let id = id.to_string();
        let mut catalog = self
            .catalog
            .write()
            .expect("language catalog lock poisoned");
        for alias in aliases {
            Arc::make_mut(&mut catalog.aliases).insert((*alias).to_string(), id.clone());
        }
    }

    pub fn has_language(&self, name_or_alias: &str) -> bool {
        let catalog = self.catalog.read().expect("language catalog lock poisoned");
        let id = catalog
            .aliases
            .get(name_or_alias)
            .map(String::as_str)
            .unwrap_or(name_or_alias);
        catalog.languages.contains_key(id)
    }

    pub fn configure_language(
        &self,
        name_or_alias: &str,
        highlights: &str,
        injections: &str,
        locals: &str,
    ) -> Result<(), RuntimeError> {
        let (id, language, brackets_source) = {
            let catalog = self.catalog.read().expect("language catalog lock poisoned");
            let id = catalog
                .aliases
                .get(name_or_alias)
                .cloned()
                .unwrap_or_else(|| name_or_alias.to_string());
            let loaded = catalog
                .languages
                .get(&id)
                .ok_or_else(|| RuntimeError::LanguageNotLoaded(name_or_alias.to_string()))?;
            (
                id,
                loaded.highlight.language.clone(),
                loaded.brackets_source.clone(),
            )
        };
        let mut highlight =
            HighlightConfiguration::new(language, id.clone(), highlights, injections, locals)
                .map_err(|error| RuntimeError::Query {
                    language: id.clone(),
                    message: error.to_string(),
                })?;
        highlight.configure(&HIGHLIGHT_NAMES);

        let mut catalog = self
            .catalog
            .write()
            .expect("language catalog lock poisoned");
        Arc::make_mut(&mut catalog.languages).insert(
            id,
            Arc::new(LoadedLanguage {
                highlight,
                brackets_source,
                brackets: OnceLock::new(),
            }),
        );
        Ok(())
    }

    pub fn highlight(
        &self,
        source: &str,
        name_or_alias: &str,
        rainbow_brackets: bool,
    ) -> Result<Vec<HighlightEvent>, RuntimeError> {
        let (root_id, root, languages, aliases) = {
            let catalog = self.catalog.read().expect("language catalog lock poisoned");
            let root_id = catalog
                .aliases
                .get(name_or_alias)
                .cloned()
                .unwrap_or_else(|| name_or_alias.to_string());
            let root = catalog
                .languages
                .get(&root_id)
                .cloned()
                .ok_or_else(|| RuntimeError::LanguageNotLoaded(name_or_alias.to_string()))?;
            (
                root_id,
                root,
                Arc::clone(&catalog.languages),
                Arc::clone(&catalog.aliases),
            )
        };

        let mut lease = self.workers.lease()?;
        let worker = lease.worker();
        let events = worker
            .highlighter
            .highlight(&root.highlight, source.as_bytes(), None, |injected| {
                let id = aliases
                    .get(injected)
                    .map(String::as_str)
                    .unwrap_or(injected);
                // An injected language that is not loaded is left unhighlighted,
                // the same as the CLI and JavaScript. Nothing is loaded implicitly.
                languages.get(id).map(|loaded| &loaded.highlight)
            })
            .map_err(|error| RuntimeError::Highlight(error.to_string()))?;

        let mut output = Vec::new();
        for event in events {
            match event.map_err(|error| RuntimeError::Highlight(error.to_string()))? {
                crate::tree_sitter_highlight::HighlightEvent::Source { start, end } => {
                    output.push(HighlightEvent::Source { start, end });
                }
                crate::tree_sitter_highlight::HighlightEvent::HighlightStart {
                    highlight,
                    language,
                } => output.push(HighlightEvent::Start {
                    scope_index: highlight.0,
                    language,
                }),
                crate::tree_sitter_highlight::HighlightEvent::HighlightEnd => {
                    output.push(HighlightEvent::End);
                }
            }
        }

        if rainbow_brackets {
            let ranges = rainbow_ranges(worker.highlighter.parser(), &root, source)?;
            output = apply_rainbow_brackets(output, ranges, &root_id);
        }

        Ok(output)
    }
}

fn cached_engine() -> Result<Engine, wasmtime::Error> {
    let mut config = Config::new();
    let cache = std::env::var_os("LUMIS_DATA_DIR")
        .map(|root| {
            let mut cache_config = CacheConfig::new();
            cache_config.with_directory(std::path::PathBuf::from(root).join("compiled"));
            Cache::new(cache_config)
        })
        .unwrap_or_else(|| Cache::from_file(None::<&std::path::Path>));

    if let Ok(cache) = cache {
        config.cache(Some(cache));
    }

    Engine::new(&config)
}

fn rainbow_ranges(
    parser: &mut Parser,
    language: &LoadedLanguage,
    source: &str,
) -> Result<Vec<RainbowRange>, RuntimeError> {
    let query = language.brackets.get_or_init(|| {
        crate::brackets::compile(&language.highlight.language, &language.brackets_source)
    });
    let Some(query) = query else {
        return Ok(Vec::new());
    };

    parser
        .set_language(&language.highlight.language)
        .map_err(|error| RuntimeError::TreeSitter(error.to_string()))?;
    let Some(tree) = parser.parse(source.as_bytes(), None) else {
        return Ok(Vec::new());
    };

    let pairs = bracket_pairs(query, tree.root_node(), source.as_bytes());
    Ok(colorize_bracket_pairs(pairs))
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::mpsc;
    use std::thread;
    use std::time::Duration;

    fn install_json(runtime: &Runtime, injections: &str) {
        let language = tree_sitter::Language::new(tree_sitter_json::LANGUAGE);
        let mut highlight =
            HighlightConfiguration::new(language, "json", "(string) @string", injections, "")
                .unwrap();
        highlight.configure(&HIGHLIGHT_NAMES);
        Arc::make_mut(&mut runtime.catalog.write().unwrap().languages).insert(
            "json".into(),
            Arc::new(LoadedLanguage {
                highlight,
                brackets_source: String::new(),
                brackets: OnceLock::new(),
            }),
        );
    }

    #[test]
    fn worker_limit_allows_two_independent_leases() {
        let runtime = Arc::new(Runtime::with_worker_limit(2).unwrap());
        let (ready_tx, ready_rx) = mpsc::channel();
        let (release_tx, release_rx) = mpsc::channel();
        let release_rx = Arc::new(Mutex::new(release_rx));
        let mut threads = Vec::new();

        for _ in 0..2 {
            let runtime = Arc::clone(&runtime);
            let ready_tx = ready_tx.clone();
            let release_rx = Arc::clone(&release_rx);
            threads.push(thread::spawn(move || {
                let _lease = runtime.workers.lease().unwrap();
                ready_tx.send(()).unwrap();
                release_rx.lock().unwrap().recv().unwrap();
            }));
        }

        ready_rx.recv_timeout(Duration::from_secs(5)).unwrap();
        ready_rx.recv_timeout(Duration::from_secs(5)).unwrap();
        release_tx.send(()).unwrap();
        release_tx.send(()).unwrap();
        for thread in threads {
            thread.join().unwrap();
        }
    }

    #[test]
    fn highlights_safely_from_multiple_threads() {
        let runtime = Arc::new(Runtime::with_worker_limit(2).unwrap());
        install_json(&runtime, "");
        let mut threads = Vec::new();

        for _ in 0..8 {
            let runtime = Arc::clone(&runtime);
            threads.push(thread::spawn(move || {
                let events = runtime
                    .highlight(r#"{"language":"json","value":42}"#, "json", false)
                    .unwrap();
                assert!(!events.is_empty());
            }));
        }

        for thread in threads {
            thread.join().unwrap();
        }
    }

    /// Nothing is loaded implicitly, so an injected language that was never
    /// loaded leaves its content unhighlighted rather than failing the document.
    #[test]
    fn an_unloaded_injected_language_is_left_unhighlighted() {
        let runtime = Runtime::with_worker_limit(1).unwrap();
        runtime.declare_language("missing", &[]);
        install_json(
            &runtime,
            r#"((string) @injection.content
               (#set! injection.language "missing"))"#,
        );

        let events = runtime.highlight(r#""embedded""#, "json", false).unwrap();
        assert!(
            events
                .iter()
                .all(|event| !matches!(event, HighlightEvent::Start { language, .. } if language == "missing")),
            "the unloaded language must not appear: {events:?}"
        );
        assert!(
            !events.is_empty(),
            "the rest of the document still highlights"
        );
    }

    #[test]
    fn the_root_language_must_be_loaded() {
        let runtime = Runtime::with_worker_limit(1).unwrap();
        runtime.declare_language("json", &[]);
        let error = runtime.highlight("{}", "json", false).unwrap_err();
        assert!(matches!(
            error,
            RuntimeError::LanguageNotLoaded(language) if language == "json"
        ));
    }

    #[test]
    fn ignores_undeclared_query_specific_injections() {
        let runtime = Runtime::with_worker_limit(1).unwrap();
        install_json(
            &runtime,
            r#"((string) @injection.content
               (#set! injection.language "printf"))"#,
        );

        let events = runtime.highlight(r#""%s""#, "json", false).unwrap();
        assert!(!events.is_empty());
    }

    #[test]
    fn reuses_a_worker_for_wasm_highlighting() {
        let runtime = Runtime::with_worker_limit(1).unwrap();
        runtime
            .load_language(LanguageSpec {
                id: "diff".into(),
                aliases: Vec::new(),
                grammar_name: "diff".into(),
                wasm: include_bytes!(
                    "../../lumis-cli/tests/fixtures/parsers/tree-sitter-diff.wasm"
                )
                .to_vec(),
                highlights: "(addition) @diff.plus\n(deletion) @diff.minus".into(),
                injections: String::new(),
                locals: String::new(),
                brackets: String::new(),
            })
            .unwrap();

        for _ in 0..2 {
            let events = runtime
                .highlight("+ added\n- removed", "diff", false)
                .unwrap();
            assert!(!events.is_empty());
        }
    }

    #[test]
    fn reuses_elixir_wasm_highlighting() {
        let runtime = Runtime::with_worker_limit(1).unwrap();
        runtime
            .load_language(LanguageSpec {
                id: "elixir".into(),
                aliases: Vec::new(),
                grammar_name: "elixir".into(),
                wasm: include_bytes!(
                    "../../../packages/javascript/lumis/test/fixtures/wasm/tree-sitter-elixir.wasm"
                )
                .to_vec(),
                highlights: "(identifier) @variable\n(alias) @module".into(),
                injections: String::new(),
                locals: String::new(),
                brackets: String::new(),
            })
            .unwrap();

        for source in [
            "defmodule Test do\n  @lang :elixir\nend",
            "defmodule Test do\nend",
        ] {
            let events = runtime.highlight(source, "elixir", false).unwrap();
            assert!(!events.is_empty());
        }
    }
}

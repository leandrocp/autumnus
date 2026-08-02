//! Wasmtime-backed Tree-sitter highlighting runtime.

use lumis_core::events::HighlightEvent;
use lumis_core::highlights::HIGHLIGHT_NAMES;
use std::collections::HashMap;
use std::sync::{Arc, Condvar, Mutex, OnceLock, RwLock};
use thiserror::Error;
use tree_sitter::{Parser, Query, Tree, WasmStore};
use wasmtime::{Cache, CacheConfig, Config, Engine};

use crate::brackets::{bracket_pairs, colorize_bracket_pairs, RainbowRange};
use crate::store::LanguageStore;
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
    /// Resolves, verifies and caches language packages. Present so an injected
    /// language can be loaded during the walk that discovered it, which is what
    /// lets one pass highlight a document whatever it turns out to contain.
    store: Option<LanguageStore>,
    /// One gate per language, so ten requests that all mention `rust` produce
    /// one download rather than ten. Keyed by `&'static str` so the table is
    /// bounded by the catalog: a Markdown fence can name anything, and an
    /// owned key would let a caller grow this map without limit.
    loading: Mutex<HashMap<&'static str, Arc<Mutex<()>>>>,
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
            store: None,
            loading: Mutex::new(HashMap::new()),
        })
    }

    /// Attach the store this runtime downloads and caches through.
    #[must_use]
    pub fn with_store(mut self, store: LanguageStore) -> Self {
        self.store = Some(store);
        self
    }

    /// The store this runtime downloads and caches through, if any.
    #[must_use]
    pub fn store(&self) -> Option<&LanguageStore> {
        self.store.as_ref()
    }

    /// Resolve, download, verify and load `name` through the store.
    ///
    /// # Errors
    /// Fails when no store is attached, the name is unknown, or the package or
    /// parser cannot be obtained or verified.
    pub fn load_named_language(&self, name: &str) -> Result<(), String> {
        self.load_through_store(name)
            .map(|_| ())
            .map_err(|error| error.to_string())
    }

    /// Resolve, download and load `id` through the store, if one is attached.
    ///
    /// # Errors
    /// Fails when there is no store, the id is not a known language, or the
    /// package or parser cannot be obtained.
    fn load_through_store(&self, id: &str) -> Result<Arc<LoadedLanguage>, RuntimeError> {
        if let Some(loaded) = self.loaded(id) {
            return Ok(loaded);
        }

        let store = self
            .store
            .as_ref()
            .ok_or_else(|| RuntimeError::LanguageNotLoaded(id.into()))?;
        let location =
            crate::catalog::find(id).ok_or_else(|| RuntimeError::LanguageNotLoaded(id.into()))?;

        let gate = self.load_gate(location.id);
        let _guard = gate.lock().expect("language load gate poisoned");
        if let Some(loaded) = self.loaded(id) {
            return Ok(loaded);
        }

        let parser_error = |message: String| RuntimeError::Parser {
            language: id.to_string(),
            message,
        };
        let package = store
            .package(location.package_name)
            .map_err(|error| parser_error(error.to_string()))?;
        let (resolved_id, definition) = package
            .language(id)
            .ok_or_else(|| RuntimeError::LanguageNotLoaded(id.into()))?;
        let wasm = store
            .parser(&package)
            .map_err(|error| parser_error(error.to_string()))?;

        self.load_language(LanguageSpec {
            id: resolved_id.to_string(),
            aliases: definition.aliases.clone(),
            grammar_name: package.parser.grammar_name.clone(),
            wasm,
            highlights: definition.highlights.clone(),
            injections: definition.injections.clone(),
            locals: definition.locals.clone(),
            brackets: definition.brackets.clone(),
        })?;

        self.loaded(resolved_id)
            .ok_or_else(|| RuntimeError::LanguageNotLoaded(id.into()))
    }

    fn loaded(&self, name_or_alias: &str) -> Option<Arc<LoadedLanguage>> {
        let catalog = self.catalog.read().expect("language catalog lock poisoned");
        let id = catalog
            .aliases
            .get(name_or_alias)
            .map(String::as_str)
            .unwrap_or(name_or_alias);
        catalog.languages.get(id).cloned()
    }

    fn load_gate(&self, id: &'static str) -> Arc<Mutex<()>> {
        let mut loading = self.loading.lock().expect("language load table poisoned");
        Arc::clone(loading.entry(id).or_default())
    }

    #[cfg(test)]
    fn load_gate_count(&self) -> usize {
        self.loading
            .lock()
            .expect("language load table poisoned")
            .len()
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
        self.loaded(name_or_alias).is_some()
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
        self.highlight_with(
            source,
            name_or_alias,
            &HighlightOptions {
                rainbow_brackets,
                ..HighlightOptions::default()
            },
        )
        .map(|output| output.events)
    }

    /// Parse `source` without highlighting it, for tools that want the tree.
    ///
    /// # Errors
    /// Fails when the language cannot be loaded or the parser returns no tree.
    pub fn parse_tree(&self, source: &str, name_or_alias: &str) -> Result<Tree, RuntimeError> {
        let loaded = self.load_through_store(name_or_alias)?;
        let mut lease = self.workers.lease()?;
        let parser = lease.worker().highlighter.parser();
        parser
            .set_language(&loaded.highlight.language)
            .map_err(|error| RuntimeError::Parser {
                language: name_or_alias.to_string(),
                message: error.to_string(),
            })?;
        parser.parse(source.as_bytes(), None).ok_or_else(|| {
            RuntimeError::Highlight(format!("parser returned no tree for '{name_or_alias}'"))
        })
    }

    /// Highlight, with control over injections and the parsed layers.
    ///
    /// # Errors
    /// Fails when the root language cannot be loaded, or highlighting does.
    pub fn highlight_with(
        &self,
        source: &str,
        name_or_alias: &str,
        options: &HighlightOptions,
    ) -> Result<HighlightOutput, RuntimeError> {
        let root = self.load_through_store(name_or_alias)?;
        let (root_id, languages, aliases) = {
            let catalog = self.catalog.read().expect("language catalog lock poisoned");
            let root_id = catalog
                .aliases
                .get(name_or_alias)
                .cloned()
                .unwrap_or_else(|| name_or_alias.to_string());
            (
                root_id,
                Arc::clone(&catalog.languages),
                Arc::clone(&catalog.aliases),
            )
        };

        let mut lease = self.workers.lease()?;
        let worker = lease.worker();
        worker.highlighter.record_parsed_layers(options.layers);
        // Holds languages loaded during this walk. The callback has to hand back a
        // reference that outlives it, and an arena gives a stable address while
        // still allowing inserts, which a RefCell<Vec<_>> cannot.
        let loaded_here: typed_arena::Arena<Arc<LoadedLanguage>> = typed_arena::Arena::new();

        let events = worker
            .highlighter
            .highlight(&root.highlight, source.as_bytes(), None, |injected| {
                if !options.injections {
                    return None;
                }
                let id = aliases
                    .get(injected)
                    .map(String::as_str)
                    .unwrap_or(injected);

                if let Some(loaded) = languages.get(id) {
                    return Some(&loaded.highlight);
                }

                // Loading here is what makes one pass enough: the walk descends
                // into the language it just fetched and finds whatever that
                // contains, however deeply nested. A language that cannot be
                // fetched leaves its block unhighlighted rather than failing the
                // document around it.
                let loaded = self.load_through_store(id).ok()?;
                Some(&loaded_here.alloc(loaded).highlight)
            })
            .map_err(|error| RuntimeError::Highlight(error.to_string()))?;

        let mut collected = Vec::new();
        for event in events {
            match event.map_err(|error| RuntimeError::Highlight(error.to_string()))? {
                crate::tree_sitter_highlight::HighlightEvent::Source { start, end } => {
                    collected.push(HighlightEvent::Source { start, end });
                }
                crate::tree_sitter_highlight::HighlightEvent::HighlightStart {
                    highlight,
                    language,
                } => collected.push(HighlightEvent::Start {
                    scope_index: highlight.0,
                    language,
                }),
                crate::tree_sitter_highlight::HighlightEvent::HighlightEnd => {
                    collected.push(HighlightEvent::End);
                }
            }
        }

        if options.rainbow_brackets {
            let ranges = rainbow_ranges(worker.highlighter.parser(), &root, source)?;
            collected = apply_rainbow_brackets(collected, ranges, &root_id);
        }

        Ok(HighlightOutput {
            events: collected,
            layers: worker.highlighter.take_parsed_layers(),
        })
    }
}

/// What a highlight pass should do beyond producing events.
#[derive(Debug)]
pub struct HighlightOptions {
    /// Colourize matching bracket pairs in the root language.
    pub rainbow_brackets: bool,
    /// Descend into languages injected inside the document.
    pub injections: bool,
    /// Keep the tree parsed for each layer, for tools that inspect them.
    pub layers: bool,
}

impl Default for HighlightOptions {
    fn default() -> Self {
        Self {
            rainbow_brackets: false,
            injections: true,
            layers: false,
        }
    }
}

/// The result of a highlight pass. `layers` is empty unless
/// [`HighlightOptions::layers`] asked for them.
pub struct HighlightOutput {
    pub events: Vec<HighlightEvent>,
    pub layers: Vec<crate::tree_sitter_highlight::ParsedLayer>,
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
    use crate::store::StoreConfig;
    use std::sync::mpsc;
    use std::thread;
    use std::time::Duration;

    const JSON_WASM: &[u8] =
        include_bytes!("../../lumis-cli/tests/fixtures/parsers/tree-sitter-json.wasm");

    fn json_package(wasm: &[u8]) -> crate::LanguagePackage {
        crate::LanguagePackage {
            package_name: "@lumis-sh/wasm-json".into(),
            version: "1.0.0".into(),
            definition_hash: "test".into(),
            parser: crate::ParserMetadata {
                name: "tree-sitter-json".into(),
                grammar_name: "json".into(),
                upstream_version: None,
                revision: None,
                sha256: crate::sha256_hex(wasm),
                size: wasm.len(),
            },
            languages: std::collections::BTreeMap::from([(
                "json".into(),
                crate::PackagedLanguage {
                    highlights: "(string) @string".into(),
                    ..crate::PackagedLanguage::default()
                },
            )]),
        }
    }

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

    /// The walk loads what it finds, so one call is enough however deep the
    /// injections go, and a language it cannot fetch costs that block its
    /// highlighting rather than failing the whole document.
    #[test]
    fn an_injected_language_is_loaded_during_the_walk() {
        let dir = tempfile::tempdir().unwrap();
        let parsers = dir.path().join("parsers");
        std::fs::create_dir_all(&parsers).unwrap();

        let store = LanguageStore::new(
            StoreConfig {
                cache_dir: dir.path().to_path_buf(),
                source_dir: None,
            },
            Box::new(crate::store::NoNetwork),
        );
        let runtime = Runtime::with_worker_limit(1).unwrap().with_store(store);
        runtime.declare_language("missing", &[]);
        install_json(
            &runtime,
            r#"((string) @injection.content
               (#set! injection.language "missing"))"#,
        );

        // Nothing is fetchable, so this must still succeed rather than fail the
        // document; the injected block simply stays unhighlighted.
        let events = runtime.highlight(r#""embedded""#, "json", false).unwrap();
        assert!(!events.is_empty());
    }

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

    /// A Markdown fence names its own language, so the injected name is
    /// attacker-controlled. Failing to load one must not leave anything behind.
    #[test]
    fn unknown_injected_languages_leave_no_load_gate() {
        let dir = tempfile::tempdir().unwrap();
        let store = LanguageStore::new(
            StoreConfig {
                cache_dir: dir.path().to_path_buf(),
                source_dir: None,
            },
            Box::new(crate::store::NoNetwork),
        );
        let runtime = Runtime::with_worker_limit(1).unwrap().with_store(store);
        install_json(
            &runtime,
            r#"(pair
                 key: (string (string_content) @injection.language)
                 value: (string (string_content) @injection.content))"#,
        );

        let document = (0..200)
            .map(|index| format!(r#""no-such-language-{index}":"body""#))
            .collect::<Vec<_>>()
            .join(",");
        let events = runtime
            .highlight(&format!("{{{document}}}"), "json", false)
            .unwrap();
        assert!(!events.is_empty(), "the document still highlights");
        assert_eq!(
            runtime.load_gate_count(),
            0,
            "200 unknown injected names must not allocate 200 gates"
        );

        for index in 0..200 {
            assert!(runtime
                .load_named_language(&format!("no-such-language-{index}"))
                .is_err());
        }
        assert_eq!(runtime.load_gate_count(), 0, "the public path leaks too");

        // The other direction: a catalog language still takes a gate, so this
        // test fails if the deduplication it protects is removed outright.
        assert!(runtime.load_named_language("rust").is_err());
        assert_eq!(runtime.load_gate_count(), 1);
        assert!(runtime.load_named_language("rs").is_err());
        assert_eq!(
            runtime.load_gate_count(),
            1,
            "an alias shares the canonical id's gate"
        );
    }

    /// Ten requests naming the same uncached language must not become ten
    /// downloads of it.
    #[test]
    fn concurrent_loads_of_one_language_fetch_it_once() {
        struct CountingFetcher {
            wasm: Vec<u8>,
            parser_requests: Arc<Mutex<usize>>,
        }

        impl crate::store::Fetcher for CountingFetcher {
            fn get(&self, url: &str) -> Result<Vec<u8>, String> {
                if url.ends_with(".wasm") {
                    *self.parser_requests.lock().unwrap() += 1;
                    // Wide enough that an ungated peer would start its own.
                    thread::sleep(Duration::from_millis(50));
                    return Ok(self.wasm.clone());
                }
                Ok(serde_json::to_vec(&json_package(&self.wasm)).unwrap())
            }
        }

        let dir = tempfile::tempdir().unwrap();
        let parser_requests = Arc::new(Mutex::new(0));
        let store = LanguageStore::new(
            StoreConfig {
                cache_dir: dir.path().to_path_buf(),
                source_dir: None,
            },
            Box::new(CountingFetcher {
                wasm: JSON_WASM.to_vec(),
                parser_requests: Arc::clone(&parser_requests),
            }),
        );
        let runtime = Arc::new(Runtime::with_worker_limit(4).unwrap().with_store(store));

        let threads: Vec<_> = (0..8)
            .map(|_| {
                let runtime = Arc::clone(&runtime);
                thread::spawn(move || runtime.load_named_language("json").unwrap())
            })
            .collect();
        for thread in threads {
            thread.join().unwrap();
        }

        assert_eq!(*parser_requests.lock().unwrap(), 1);
    }

    /// Without a store there is nowhere to load from, so the caller is told
    /// rather than handed an unhighlighted document.
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

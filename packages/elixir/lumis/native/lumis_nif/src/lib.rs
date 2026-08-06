use std::collections::HashMap;
use std::sync::{mpsc, Arc, Mutex};
use std::thread;

mod elixir;

use elixir::{ExCssOptions, ExFormatterOption, ExTheme};
use lumis_core::events::HighlightEvent;
use lumis_core::{languages, themes};
use lumis_wasm_runtime::{catalog, store, Runtime, RuntimeError};
use once_cell::sync::Lazy;
use parking_lot::RwLock;
use rustler::{Encoder, Env, Error, NifMap, NifResult, Term};

/// Lazy per-theme cache to eliminate repeated allocations.
/// Themes are converted and cached on first access, amortizing the cost.
static THEME_CACHE: Lazy<RwLock<HashMap<String, ExTheme>>> =
    Lazy::new(|| RwLock::new(HashMap::new()));

/// Cached list of theme names to avoid repeated allocations.
/// Built once on first call to available_themes().
static THEME_NAMES: Lazy<Vec<String>> = Lazy::new(|| {
    themes::available_themes()
        .map(|theme| theme.name.to_owned())
        .collect()
});

static EXECUTOR: Lazy<Result<WasmExecutor, String>> = Lazy::new(WasmExecutor::new);

enum WasmJob {
    LoadNamed {
        name: String,
        reply: mpsc::SyncSender<Result<(), String>>,
    },
    CacheNamed {
        name: String,
        force: bool,
        reply: mpsc::SyncSender<Result<String, String>>,
    },
    Highlight {
        source: String,
        language: String,
        rainbow_brackets: bool,
        reply: mpsc::SyncSender<Result<Vec<HighlightEvent>, RuntimeError>>,
    },
}

/// Directories the store reads and writes, as `Lumis.Application` configured
/// them. Elixir cannot set an OS environment variable the emulator's NIFs can
/// see, so `config :lumis` arrives here instead.
#[derive(Default)]
struct StorePaths {
    data_dir: Option<std::path::PathBuf>,
}

static STORE_PATHS: Lazy<RwLock<StorePaths>> = Lazy::new(|| RwLock::new(StorePaths::default()));

/// The same resolve, verify and cache path the CLI uses, pointed at the
/// directories Lumis persists under.
fn language_store(cache_dir: Option<std::path::PathBuf>) -> store::LanguageStore {
    let paths = STORE_PATHS.read();
    let cache_dir = cache_dir
        .or_else(|| paths.data_dir.clone())
        .or_else(|| std::env::var_os("LUMIS_DATA_DIR").map(std::path::PathBuf::from))
        .unwrap_or_else(default_data_dir);
    store::LanguageStore::new(
        store::StoreConfig { cache_dir },
        Box::new(store::HttpFetcher),
    )
}

fn default_data_dir() -> std::path::PathBuf {
    use etcetera::BaseStrategy;

    etcetera::choose_base_strategy()
        .map(|strategy| strategy.data_dir().join("lumis"))
        .unwrap_or_else(|_| std::path::PathBuf::from(".lumis"))
}

struct WasmExecutor {
    runtime: Arc<Runtime>,
    sender: mpsc::SyncSender<WasmJob>,
}

impl WasmExecutor {
    fn new() -> Result<Self, String> {
        // Sized to the machine, not capped. These threads exist for their 8 MiB
        // stacks: nested injections recurse per layer and overflow the BEAM
        // dirty-scheduler default, which crashes the VM rather than erroring.
        let workers = thread::available_parallelism()
            .map(usize::from)
            .unwrap_or(1);
        let runtime = thread::Builder::new()
            .name("lumis-wasm-init".into())
            .stack_size(8 * 1024 * 1024)
            .spawn(move || -> Result<Runtime, RuntimeError> {
                let runtime = Runtime::with_worker_limit(workers)?.with_store(language_store(None));
                for language in catalog::LANGUAGES {
                    runtime.declare_language(language.id, language.aliases);
                }
                Ok(runtime)
            })
            .map_err(|error| error.to_string())?
            .join()
            .map_err(|_| "Lumis WASM runtime initialization panicked".to_string())?
            .map_err(|error| error.to_string())?;
        let runtime = Arc::new(runtime);
        let (sender, receiver) = mpsc::sync_channel::<WasmJob>(workers * 2);
        let receiver = Arc::new(Mutex::new(receiver));

        for index in 0..workers {
            let runtime = Arc::clone(&runtime);
            let receiver = Arc::clone(&receiver);
            thread::Builder::new()
                .name(format!("lumis-wasm-{index}"))
                .stack_size(8 * 1024 * 1024)
                .spawn(move || loop {
                    let job = match receiver.lock().expect("executor lock poisoned").recv() {
                        Ok(job) => job,
                        Err(_) => return,
                    };
                    match job {
                        WasmJob::LoadNamed { name, reply } => {
                            let _ = reply.send(runtime.load_named_language(&name));
                        }
                        WasmJob::CacheNamed { name, force, reply } => {
                            let _ =
                                reply.send(cache_named_language(runtime.as_ref(), &name, force));
                        }
                        WasmJob::Highlight {
                            source,
                            language,
                            rainbow_brackets,
                            reply,
                        } => {
                            let _ =
                                reply.send(runtime.highlight(&source, &language, rainbow_brackets));
                        }
                    }
                })
                .map_err(|error| error.to_string())?;
        }

        Ok(Self { runtime, sender })
    }

    /// Resolving a language does a TLS handshake, which needs far more stack
    /// than a BEAM dirty scheduler has; run it on the executor's own threads.
    fn load_named_language(&self, name: &str) -> Result<(), String> {
        let (reply, result) = mpsc::sync_channel(1);
        self.sender
            .send(WasmJob::LoadNamed {
                name: name.to_string(),
                reply,
            })
            .map_err(|_| "WASM executor is unavailable".to_string())?;
        result
            .recv()
            .map_err(|_| "WASM executor stopped while loading the language".to_string())?
    }

    fn cache_named_language(&self, name: &str, force: bool) -> Result<String, String> {
        let (reply, result) = mpsc::sync_channel(1);
        self.sender
            .send(WasmJob::CacheNamed {
                name: name.to_string(),
                force,
                reply,
            })
            .map_err(|_| "WASM executor is unavailable".to_string())?;
        result
            .recv()
            .map_err(|_| "WASM executor stopped while caching the language".to_string())?
    }

    fn highlight(
        &self,
        source: &str,
        language: &str,
        rainbow_brackets: bool,
    ) -> Result<Vec<HighlightEvent>, RuntimeError> {
        let (reply, result) = mpsc::sync_channel(1);
        self.sender
            .send(WasmJob::Highlight {
                source: source.to_string(),
                language: language.to_string(),
                rainbow_brackets,
                reply,
            })
            .map_err(|_| RuntimeError::Highlight("WASM executor is unavailable".into()))?;
        result.recv().map_err(|_| {
            RuntimeError::Highlight("WASM executor stopped before highlighting".into())
        })?
    }
}

rustler::atoms! {
    ok,
    error,
    language_not_loaded,
}

rustler::init!("Elixir.Lumis.Native");

#[derive(Debug, NifMap)]
pub struct ExOptions<'a> {
    pub language: Option<&'a str>,
    pub formatter: ExFormatterOption,
}

#[derive(Clone, Debug, NifMap)]
pub struct ExLanguagePackageRef<'a> {
    pub id: &'a str,
    pub aliases: Vec<&'a str>,
    pub package_name: &'a str,
}

impl From<&catalog::LanguagePackageRef> for ExLanguagePackageRef<'static> {
    fn from(language: &catalog::LanguagePackageRef) -> Self {
        Self {
            id: language.id,
            aliases: language.aliases.to_vec(),
            package_name: language.package_name,
        }
    }
}

#[rustler::nif(schedule = "DirtyCpu")]
pub fn highlight<'a>(env: Env<'a>, source: &'a str, options: ExOptions) -> NifResult<Term<'a>> {
    let language = languages::Language::guess(options.language, source);
    let (formatter, rainbow_brackets) = match options.formatter.into_formatter(language) {
        Ok(formatter) => formatter,
        Err(message) => return Ok((error(), message).encode(env)),
    };

    let events = if language == languages::Language::PlainText {
        vec![HighlightEvent::Source {
            start: 0,
            end: source.len(),
        }]
    } else {
        let executor = match executor() {
            Ok(executor) => executor,
            Err(message) => return Ok((error(), message).encode(env)),
        };
        match executor.highlight(source, language.id_name(), rainbow_brackets) {
            Ok(events) => events,
            Err(RuntimeError::LanguageNotLoaded(language)) => {
                return Ok((error(), (language_not_loaded(), language)).encode(env));
            }
            Err(runtime_error) => {
                return Ok((error(), runtime_error.to_string()).encode(env));
            }
        }
    };

    let mut output = Vec::new();
    if let Err(render_error) = formatter.render(source, &events, &mut output) {
        return Ok((error(), render_error.to_string()).encode(env));
    }
    let output = String::from_utf8(output)
        .map_err(|error| Error::Term(Box::new(format!("invalid formatter output: {error}"))))?;
    Ok((ok(), output).encode(env))
}

fn executor() -> Result<&'static WasmExecutor, String> {
    EXECUTOR.as_ref().map_err(Clone::clone)
}

/// Point the store at `data_dir`, overriding `LUMIS_DATA_DIR`.
///
/// Returns false once the store exists, since the paths are read when it is
/// built. `Lumis.Application` calls this before anything can use it.
#[rustler::nif]
fn configure_store(data_dir: Option<String>) -> bool {
    if Lazy::get(&EXECUTOR).is_some() {
        return false;
    }
    let mut paths = STORE_PATHS.write();
    paths.data_dir = data_dir.map(std::path::PathBuf::from);

    let compile_cache = paths
        .data_dir
        .clone()
        .or_else(|| std::env::var_os("LUMIS_DATA_DIR").map(std::path::PathBuf::from))
        .unwrap_or_else(default_data_dir);
    lumis_wasm_runtime::set_compile_cache_dir(compile_cache);
    true
}

/// Resolve, download, verify and load `name` through the shared store.
///
/// Elixir no longer fetches anything: this is the same path the CLI takes, so
/// both cache the same bytes in the same place under the same names.
#[rustler::nif(schedule = "DirtyCpu")]
fn load_language_by_name<'a>(env: Env<'a>, name: &str) -> Term<'a> {
    let runtime = match executor() {
        Ok(runtime) => runtime,
        Err(message) => return (error(), message).encode(env),
    };
    match runtime.load_named_language(name) {
        Ok(()) => ok().encode(env),
        Err(message) => (error(), message).encode(env),
    }
}

/// Download and cache without loading, for `mix lumis.languages.cache`.
///
/// Returns the path the parser was written to.
#[rustler::nif(schedule = "DirtyIo")]
fn cache_language_by_name<'a>(env: Env<'a>, name: &str, force: bool) -> Term<'a> {
    let executor = match executor() {
        Ok(executor) => executor,
        Err(message) => return (error(), message).encode(env),
    };
    match executor.cache_named_language(name, force) {
        Ok(path) => (ok(), path).encode(env),
        Err(message) => (error(), message).encode(env),
    }
}

/// Caching needs no Wasmtime runtime, but it does do a TLS handshake, so it
/// still runs on an executor thread rather than a dirty scheduler.
fn cache_named_language(runtime: &Runtime, name: &str, force: bool) -> Result<String, String> {
    runtime
        .store()
        .ok_or_else(|| "this runtime has no language store".to_string())?
        .cache_language(name, force)
        .map(|path| path.display().to_string())
        .map_err(|error| error.to_string())
}

#[rustler::nif]
fn has_language(name: &str) -> bool {
    executor()
        .map(|executor| executor.runtime.has_language(name))
        .unwrap_or(false)
}

#[rustler::nif]
fn language_package_refs() -> Vec<ExLanguagePackageRef<'static>> {
    catalog::LANGUAGES
        .iter()
        .map(ExLanguagePackageRef::from)
        .collect()
}

#[rustler::nif]
fn language_bundles() -> HashMap<&'static str, Vec<&'static str>> {
    catalog::BUNDLES
        .iter()
        .map(|(name, members)| (*name, members.to_vec()))
        .collect()
}

#[rustler::nif]
fn available_languages() -> HashMap<String, (String, Vec<String>)> {
    languages::available_languages()
}

#[rustler::nif]
fn available_themes() -> Vec<String> {
    // Return a clone of the cached theme names list
    // This is cheaper than rebuilding the list every time
    THEME_NAMES.clone()
}

#[rustler::nif]
fn get_theme(name: &str) -> NifResult<ExTheme> {
    // Fast path: check if theme is already cached (read lock)
    {
        let cache = THEME_CACHE.read();
        if let Some(cached_theme) = cache.get(name) {
            return Ok(cached_theme.clone());
        }
    }

    // Slow path: load theme, convert, and cache it (write lock)
    let theme = themes::get(name).map_err(|_e| Error::Atom("error"))?;
    let ex_theme = ExTheme::from(&theme);

    // Cache the converted theme for future calls
    {
        let mut cache = THEME_CACHE.write();
        cache.insert(name.to_string(), ex_theme.clone());
    }

    Ok(ex_theme)
}

#[rustler::nif]
fn build_theme_from_file(path: &str) -> NifResult<ExTheme> {
    themes::from_file(path)
        .map(|theme| ExTheme::from(&theme))
        .map_err(|_e| Error::Atom("error"))
}

#[rustler::nif]
fn build_theme_from_json_string(json_string: &str) -> NifResult<ExTheme> {
    themes::from_json(json_string)
        .map(|theme| ExTheme::from(&theme))
        .map_err(|_e| Error::Atom("error"))
}

#[rustler::nif]
fn theme_css_from_name(name: &str, options: ExCssOptions) -> NifResult<String> {
    let theme = themes::get(name).map_err(|_e| Error::Atom("error"))?;
    Ok(build_theme_css(&theme, options))
}

#[rustler::nif]
fn theme_css_from_theme(theme: ExTheme, options: ExCssOptions) -> String {
    build_theme_css(&theme.into(), options)
}

fn build_theme_css(theme: &themes::Theme, options: ExCssOptions) -> String {
    let mut builder = themes::CssBuilder::new(theme);

    builder
        .enable_italic(options.enable_italic)
        .scope(options.scope)
        .container_selector(options.container_selector);

    builder.container_style(options.container_style);

    builder.build()
}

#[cfg(test)]
mod tests {
    use super::HighlightEvent;
    use lumis_core::formatter::{Formatter, HtmlInlineBuilder};
    use lumis_core::languages::Language;
    use lumis_wasm_runtime::{
        sha256_hex, LanguagePackage, PackagedLanguage, ParserMetadata, Runtime,
    };
    use std::collections::BTreeMap;

    #[test]
    fn test_formatter_works_with_precomputed_events() {
        let source = "@test :test";
        let lang = Language::guess(Some("elixir"), source);
        let formatter = HtmlInlineBuilder::new().language(lang).build().unwrap();
        let events = [HighlightEvent::Source {
            start: 0,
            end: source.len(),
        }];
        let mut output = Vec::new();
        formatter.render(source, &events, &mut output).unwrap();
        let result = String::from_utf8(output).unwrap();

        assert!(!result.is_empty(), "Output should not be empty");

        assert!(
            result.contains("<pre"),
            "Output should contain opening <pre> tag"
        );

        assert!(result.contains("<code"), "Output should contain <code> tag");

        assert!(
            result.contains("test"),
            "Output should contain 'test' keyword"
        );
    }

    #[test]
    fn test_elixir_wasm_with_generated_queries() {
        let wasm = include_bytes!(
            "../../../../../javascript/lumis/test/fixtures/wasm/tree-sitter-elixir.wasm"
        )
        .to_vec();
        let package = LanguagePackage {
            package_name: "@lumis-sh/wasm-elixir".into(),
            version: "test".into(),
            definition_hash: "test".into(),
            parser: ParserMetadata {
                name: "tree-sitter-elixir".into(),
                grammar_name: "elixir".into(),
                upstream_version: None,
                revision: None,
                sha256: sha256_hex(&wasm),
                size: u64::try_from(wasm.len()).expect("parser size fits in u64"),
            },
            languages: BTreeMap::from([(
                "elixir".into(),
                PackagedLanguage {
                    aliases: Vec::new(),
                    highlights: include_str!(
                        "../../../../../../queries/processed/elixir/highlights.scm"
                    )
                    .into(),
                    injections: include_str!(
                        "../../../../../../queries/processed/elixir/injections.scm"
                    )
                    .into(),
                    locals: String::new(),
                    brackets: include_str!(
                        "../../../../../../queries/processed/default/brackets.scm"
                    )
                    .into(),
                },
            )]),
        };
        let runtime = Runtime::with_worker_limit(1).unwrap();
        runtime
            .load_language(package.language_spec("elixir", wasm).unwrap())
            .unwrap();

        let events = runtime
            .highlight("defmodule Test do\nend", "elixir", false)
            .unwrap();
        assert!(!events.is_empty());
    }
}

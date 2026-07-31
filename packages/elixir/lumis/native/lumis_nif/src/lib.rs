use std::collections::HashMap;
use std::sync::{mpsc, Arc, Mutex};
use std::thread;

mod elixir;

use elixir::{ExCssOptions, ExFormatterOption, ExTheme};
use lumis_core::events::HighlightEvent;
use lumis_core::{languages, themes};
use lumis_wasm_runtime::{catalog, store, LanguagePackage, LanguageSpec, Runtime, RuntimeError};
use once_cell::sync::Lazy;
use parking_lot::RwLock;
use rustler::{Binary, Encoder, Env, Error, NifMap, NifResult, Term};

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
    Load {
        spec: LanguageSpec,
        reply: mpsc::SyncSender<Result<(), RuntimeError>>,
    },
    Highlight {
        source: String,
        language: String,
        rainbow_brackets: bool,
        reply: mpsc::SyncSender<Result<Vec<HighlightEvent>, RuntimeError>>,
    },
}

struct WasmExecutor {
    runtime: Arc<Runtime>,
    sender: mpsc::SyncSender<WasmJob>,
}

impl WasmExecutor {
    fn new() -> Result<Self, String> {
        let workers = thread::available_parallelism()
            .map(usize::from)
            .unwrap_or(1)
            .min(4);
        let runtime = thread::Builder::new()
            .name("lumis-wasm-init".into())
            .stack_size(8 * 1024 * 1024)
            .spawn(move || -> Result<Runtime, RuntimeError> {
                let runtime = Runtime::with_worker_limit(workers)?;
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
                        WasmJob::Load { spec, reply } => {
                            let _ = reply.send(runtime.load_language(spec));
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

    fn load_language(&self, spec: LanguageSpec) -> Result<(), RuntimeError> {
        let language = spec.id.clone();
        let (reply, result) = mpsc::sync_channel(1);
        self.sender
            .send(WasmJob::Load { spec, reply })
            .map_err(|_| RuntimeError::Parser {
                language,
                message: "WASM executor is unavailable".into(),
            })?;
        result.recv().map_err(|_| {
            RuntimeError::Highlight("WASM executor stopped before loading the language".into())
        })?
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
    miss,
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

#[derive(Clone, Debug, NifMap)]
pub struct ExResolvedLanguagePackage {
    pub id: String,
    pub aliases: Vec<String>,
    pub package_name: String,
    pub version: String,
    pub definition_hash: String,
    pub wasm_name: String,
    pub sha256: String,
    pub size: usize,
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

#[rustler::nif(schedule = "DirtyCpu")]
fn load_language<'a>(env: Env<'a>, name: &str, package_json: &str, wasm: Binary<'a>) -> Term<'a> {
    let (language, package) = match parse_language_package(name, package_json) {
        Ok(result) => result,
        Err(message) => return (error(), message).encode(env),
    };
    let executor = match executor() {
        Ok(executor) => executor,
        Err(message) => return (error(), message).encode(env),
    };
    let spec = match package.language_spec(language.id, wasm.as_slice().to_vec()) {
        Ok(spec) => spec,
        Err(package_error) => return (error(), package_error.to_string()).encode(env),
    };
    match executor.load_language(spec) {
        Ok(()) => ok().encode(env),
        Err(runtime_error) => (error(), runtime_error.to_string()).encode(env),
    }
}

#[rustler::nif]
fn has_language(name: &str) -> bool {
    executor()
        .map(|executor| executor.runtime.has_language(name))
        .unwrap_or(false)
}

#[rustler::nif]
fn language_package_ref(name: &str) -> Option<ExLanguagePackageRef<'static>> {
    catalog::find(name).map(ExLanguagePackageRef::from)
}

#[rustler::nif]
fn language_package_refs() -> Vec<ExLanguagePackageRef<'static>> {
    catalog::LANGUAGES
        .iter()
        .map(ExLanguagePackageRef::from)
        .collect()
}

/// Cache mechanics shared with the CLI, exposed so the Elixir loader does not
/// reimplement verification, atomic writes and locking in another language.
/// Deliberately layout-independent -- Elixir passes explicit paths -- because the
/// Elixir release layout is not the CLI's. Elixir keeps what is genuinely its own:
/// the configurable `:wasm_resolver` and `:language_package_resolver` hooks, the
/// download, and the search order across `priv/wasm` and the user cache.
/// Check parser bytes against the declared size and digest. Takes the two fields
/// directly rather than the package, because Elixir carries a resolved entry.
#[rustler::nif(schedule = "DirtyCpu")]
fn cache_verify(sha256: &str, size: usize, wasm: Binary) -> Result<(), String> {
    let bytes = wasm.as_slice();
    if bytes.len() != size {
        return Err(format!(
            "invalid parser WASM size: expected {size}, got {}",
            bytes.len()
        ));
    }
    let actual = lumis_wasm_runtime::sha256_hex(bytes);
    if actual != sha256 {
        return Err(format!(
            "invalid parser WASM integrity: expected sha256-{sha256}, got sha256-{actual}"
        ));
    }
    Ok(())
}

/// Write through a temporary file and rename, so a reader never sees a partial file.
#[rustler::nif(schedule = "DirtyIo")]
fn cache_write(path: &str, contents: Binary) -> Result<(), String> {
    store::write_atomic(std::path::Path::new(path), contents.as_slice())
        .map_err(|error| error.to_string())
}

#[rustler::nif]
fn resolve_language_package<'a>(env: Env<'a>, name: &str, package_json: &str) -> Term<'a> {
    match parse_language_package(name, package_json) {
        Ok((language, package)) => {
            let packaged = package
                .languages
                .get(language.id)
                .expect("validated language package entry");
            (
                ok(),
                ExResolvedLanguagePackage {
                    id: language.id.to_string(),
                    aliases: packaged.aliases.clone(),
                    package_name: package.package_name,
                    version: package.version,
                    definition_hash: package.definition_hash,
                    wasm_name: package.parser.name,
                    sha256: package.parser.sha256,
                    size: package.parser.size,
                },
            )
                .encode(env)
        }
        Err(message) => (error(), message).encode(env),
    }
}

fn parse_language_package(
    name: &str,
    package_json: &str,
) -> Result<(&'static catalog::LanguagePackageRef, LanguagePackage), String> {
    let language = catalog::find(name).ok_or_else(|| format!("unknown language '{name}'"))?;
    let package = LanguagePackage::from_json(package_json).map_err(|error| error.to_string())?;
    if package.package_name != language.package_name {
        return Err(format!(
            "language package mismatch for '{}': expected {}, got {}",
            language.id, language.package_name, package.package_name
        ));
    }
    package.languages.get(language.id).ok_or_else(|| {
        format!(
            "language '{}' is not provided by {}",
            language.id, package.package_name
        )
    })?;
    Ok((language, package))
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
                size: wasm.len(),
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

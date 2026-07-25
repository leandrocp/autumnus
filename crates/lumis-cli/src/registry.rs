use anyhow::{bail, Context, Result};
use lumis_core::highlights::HIGHLIGHT_NAMES;
use lumis_wasm_runtime::catalog;
use lumis_wasm_runtime::tree_sitter_highlight::HighlightConfiguration;
use lumis_wasm_runtime::LanguagePackage;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime};
use streaming_iterator::StreamingIterator;
use tree_sitter::{Parser, Query, QueryCursor, Tree, WasmStore};
use wasmtime::{Cache, Config, Engine};

const PACKAGE_CACHE_TTL: Duration = Duration::from_secs(60 * 60);

/// Manages dynamic loading and persistent caching of self-contained language packages.
pub struct Registry {
    data_dir: PathBuf,
    engine: Engine,
    wasm_store: Mutex<WasmStore>,
    packages: Mutex<HashMap<&'static str, Arc<LanguagePackage>>>,
}

#[derive(Clone, Debug)]
pub struct RainbowRange {
    pub start: usize,
    pub end: usize,
    pub scope_index: usize,
}

#[derive(Clone, Debug)]
struct BracketPair {
    open: std::ops::Range<usize>,
    close: std::ops::Range<usize>,
}

const RAINBOW_BRACKET_SCOPES: [&str; 6] = [
    "punctuation.bracket.rainbow.1",
    "punctuation.bracket.rainbow.2",
    "punctuation.bracket.rainbow.3",
    "punctuation.bracket.rainbow.4",
    "punctuation.bracket.rainbow.5",
    "punctuation.bracket.rainbow.6",
];

impl Registry {
    pub fn new(data_dir: PathBuf) -> Result<Self> {
        let mut config = Config::new();
        if let Ok(cache) = Cache::from_file(None::<&Path>) {
            config.cache(Some(cache));
        }
        let engine = Engine::new(&config).unwrap_or_else(|error| {
            eprintln!("warning: wasmtime cache config failed ({error}), using defaults");
            Engine::default()
        });
        let wasm_store = Mutex::new(WasmStore::new(&engine)?);

        std::fs::create_dir_all(data_dir.join("parsers"))?;
        std::fs::create_dir_all(data_dir.join("themes"))?;
        Ok(Self {
            data_dir,
            engine,
            wasm_store,
            packages: Mutex::new(HashMap::new()),
        })
    }

    pub fn new_wasm_store(&self) -> Result<WasmStore> {
        Ok(WasmStore::new(&self.engine)?)
    }

    pub fn parse_tree(&self, language: &str, source: &str) -> Result<Tree> {
        let package = self.ensure_package(language)?;
        let wasm = self.ensure_parser(&package)?;
        let grammar = self.load_wasm_language(&package, &wasm)?;

        let mut parser = Parser::new();
        parser.set_wasm_store(self.new_wasm_store()?)?;
        parser.set_language(&grammar)?;
        parser
            .parse(source.as_bytes(), None)
            .ok_or_else(|| anyhow::anyhow!("parser returned no syntax tree for '{language}'"))
    }

    pub fn load_config(&self, language: &str) -> Result<Option<HighlightConfiguration>> {
        self.load_config_inner(language, false)
    }

    pub fn load_cached_config(&self, language: &str) -> Result<Option<HighlightConfiguration>> {
        self.load_config_inner(language, true)
    }

    pub fn rainbow_ranges(&self, language: &str, source: &str) -> Result<Vec<RainbowRange>> {
        let package = self.ensure_package(language)?;
        let (_, definition) = package.require_language(language)?;
        if definition.brackets.trim().is_empty() {
            return Ok(Vec::new());
        }

        let wasm = self.ensure_parser(&package)?;
        let grammar = self.load_wasm_language(&package, &wasm)?;
        let Ok(query) = Query::new(&grammar, &definition.brackets) else {
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
        parser.set_wasm_store(self.new_wasm_store()?)?;
        parser.set_language(&grammar)?;
        let Some(tree) = parser.parse(source.as_bytes(), None) else {
            return Ok(Vec::new());
        };

        let mut cursor = QueryCursor::new();
        let mut matches = cursor.matches(&query, tree.root_node(), source.as_bytes());
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

    pub fn download_parser(&self, language: &str) -> Result<Vec<u8>> {
        let package = self.ensure_package(language)?;
        let path = self.parser_path_for(&package);
        with_cache_lock(&path, || self.fetch_and_cache_parser(&package, &path))
    }

    pub fn is_cached(&self, language: &str) -> bool {
        self.cached_package(language)
            .ok()
            .flatten()
            .is_some_and(|package| self.read_cached_parser(&package).is_some())
    }

    pub fn parser_path(&self, language: &str) -> Result<PathBuf> {
        let package = self.ensure_package(language)?;
        Ok(self.parser_path_for(&package))
    }

    pub fn parser_download_url(&self, language: &str) -> Result<String> {
        let package = self.ensure_package(language)?;
        Ok(parser_download_url(&package))
    }

    pub fn data_dir(&self) -> &Path {
        &self.data_dir
    }

    fn load_config_inner(
        &self,
        language: &str,
        cached_only: bool,
    ) -> Result<Option<HighlightConfiguration>> {
        let package = if cached_only {
            let Some(package) = self.cached_package(language)? else {
                return Ok(None);
            };
            package
        } else {
            self.ensure_package(language)?
        };
        let (id, definition) = package.require_language(language)?;
        if definition.highlights.is_empty()
            && definition.injections.is_empty()
            && definition.locals.is_empty()
        {
            return Ok(None);
        }

        let wasm = if cached_only {
            let Some(bytes) = self.read_cached_parser(&package) else {
                return Ok(None);
            };
            bytes
        } else {
            self.ensure_parser(&package)?
        };
        let grammar = self.load_wasm_language(&package, &wasm)?;
        let mut config = HighlightConfiguration::new(
            grammar,
            id,
            &definition.highlights,
            &definition.injections,
            &definition.locals,
        )
        .with_context(|| format!("failed to create highlight config for {id}"))?;
        config.configure(&HIGHLIGHT_NAMES);
        Ok(Some(config))
    }

    fn load_wasm_language(
        &self,
        package: &LanguagePackage,
        wasm: &[u8],
    ) -> Result<tree_sitter::Language> {
        let mut store = self
            .wasm_store
            .lock()
            .map_err(|_| anyhow::anyhow!("Tree-sitter WASM store lock was poisoned"))?;
        Ok(store.load_language(&package.parser.grammar_name, wasm)?)
    }

    fn ensure_parser(&self, package: &LanguagePackage) -> Result<Vec<u8>> {
        if let Some(bytes) = self.read_cached_parser(package) {
            return Ok(bytes);
        }
        let path = self.parser_path_for(package);
        with_cache_lock(&path, || {
            if let Some(bytes) = self.read_cached_parser(package) {
                return Ok(bytes);
            }
            self.fetch_and_cache_parser(package, &path)
        })
    }

    fn read_cached_parser(&self, package: &LanguagePackage) -> Option<Vec<u8>> {
        let path = self.parser_path_for(package);
        if let Ok(bytes) = std::fs::read(&path) {
            if package.verify_wasm(&bytes).is_ok() {
                return Some(bytes);
            }
            let _ = std::fs::remove_file(path);
        }

        let legacy = self
            .data_dir
            .join("parsers")
            .join(format!("{}.wasm", package.parser.name));
        let bytes = std::fs::read(legacy).ok()?;
        package.verify_wasm(&bytes).ok().map(|()| bytes)
    }

    fn fetch_and_cache_parser(&self, package: &LanguagePackage, path: &Path) -> Result<Vec<u8>> {
        let bytes = if let Some(source) = source_asset(&parser_filename(package)) {
            std::fs::read(&source)
                .with_context(|| format!("could not read parser source {}", source.display()))?
        } else if offline() {
            bail!(
                "parser WASM for '{}' is not cached and offline mode is enabled",
                package.parser.name
            );
        } else {
            fetch_bytes(&parser_download_url(package))
                .with_context(|| format!("could not fetch parser '{}'", package.parser.name))?
        };
        package.verify_wasm(&bytes)?;
        write_atomic(path, &bytes)?;
        Ok(bytes)
    }

    fn parser_path_for(&self, package: &LanguagePackage) -> PathBuf {
        self.data_dir.join("parsers").join(parser_filename(package))
    }

    fn ensure_package(&self, language: &str) -> Result<Arc<LanguagePackage>> {
        let location =
            catalog::find(language).with_context(|| format!("unknown language '{language}'"))?;
        if let Some(package) = self.packages.lock().unwrap().get(location.package_name) {
            return Ok(Arc::clone(package));
        }

        let path = self.package_path(location.package_name);
        let package = with_cache_lock(&path, || {
            let cached = self.read_package_file(&path, location.package_name);
            let fresh = package_cache_is_fresh(&path);
            if fresh || offline() {
                if let Some(package) = cached.as_ref() {
                    return Ok(package.clone());
                }
            }
            if offline() && language_source_dir().is_none() {
                bail!(
                    "language package '{}' is not cached and offline mode is enabled",
                    location.package_name
                );
            }

            match self.fetch_package(location.package_name, &path) {
                Ok(package) => Ok(package),
                Err(error) => cached.ok_or(error),
            }
        })?;
        let package = Arc::new(package);
        self.packages
            .lock()
            .unwrap()
            .insert(location.package_name, Arc::clone(&package));
        Ok(package)
    }

    fn cached_package(&self, language: &str) -> Result<Option<Arc<LanguagePackage>>> {
        let Some(location) = catalog::find(language) else {
            return Ok(None);
        };
        if let Some(package) = self.packages.lock().unwrap().get(location.package_name) {
            return Ok(Some(Arc::clone(package)));
        }
        let package = self
            .read_package_file(
                &self.package_path(location.package_name),
                location.package_name,
            )
            .map(Arc::new);
        if let Some(package) = &package {
            self.packages
                .lock()
                .unwrap()
                .insert(location.package_name, Arc::clone(package));
        }
        Ok(package)
    }

    fn fetch_package(&self, package_name: &str, path: &Path) -> Result<LanguagePackage> {
        let bytes = if let Some(source) =
            source_asset(&format!("{}.language.json", package_suffix(package_name)))
        {
            std::fs::read(&source)
                .with_context(|| format!("could not read language package {}", source.display()))?
        } else if offline() {
            bail!("language package '{package_name}' is not available in the local source");
        } else {
            let url = format!("https://cdn.jsdelivr.net/npm/{package_name}@latest/language.json");
            fetch_bytes(&url)
                .with_context(|| format!("could not fetch language package '{package_name}'"))?
        };
        let json = std::str::from_utf8(&bytes).context("language package is not UTF-8 JSON")?;
        let package = LanguagePackage::from_json(json)?;
        if package.package_name != package_name {
            bail!(
                "language package name mismatch: expected '{package_name}', got '{}'",
                package.package_name
            );
        }
        write_atomic(path, &bytes)?;
        Ok(package)
    }

    fn read_package_file(&self, path: &Path, package_name: &str) -> Option<LanguagePackage> {
        let json = std::fs::read_to_string(path).ok()?;
        let package = LanguagePackage::from_json(&json).ok()?;
        (package.package_name == package_name).then_some(package)
    }

    fn package_path(&self, package_name: &str) -> PathBuf {
        self.data_dir
            .join("parsers")
            .join(format!("{}.language.json", package_suffix(package_name)))
    }

    #[cfg(test)]
    pub fn cache_test_language(
        &self,
        id: &str,
        grammar_name: &str,
        wasm: &[u8],
        highlights: &str,
        injections: &str,
        locals: &str,
    ) {
        use lumis_wasm_runtime::{
            PackagedLanguage, ParserMetadata, LANGUAGE_PACKAGE_FORMAT_VERSION,
        };
        use sha2::{Digest, Sha256};

        let location = catalog::find(id).unwrap();
        let parser_name = format!("tree-sitter-{grammar_name}");
        let package = LanguagePackage {
            format_version: LANGUAGE_PACKAGE_FORMAT_VERSION,
            package_name: location.package_name.into(),
            version: "test".into(),
            definition_hash: "test".into(),
            parser: ParserMetadata {
                name: parser_name,
                grammar_name: grammar_name.into(),
                sha256: format!("{:x}", Sha256::digest(wasm)),
                size: wasm.len(),
            },
            languages: std::collections::BTreeMap::from([(
                id.into(),
                PackagedLanguage {
                    highlights: highlights.into(),
                    injections: injections.into(),
                    locals: locals.into(),
                    ..PackagedLanguage::default()
                },
            )]),
        };
        write_atomic(
            &self.package_path(location.package_name),
            serde_json::to_string(&package).unwrap().as_bytes(),
        )
        .unwrap();
        write_atomic(&self.parser_path_for(&package), wasm).unwrap();
    }
}

pub fn all_language_ids() -> impl Iterator<Item = &'static str> {
    catalog::LANGUAGES.iter().map(|language| language.id)
}

fn parser_download_url(package: &LanguagePackage) -> String {
    format!(
        "https://cdn.jsdelivr.net/npm/{}@{}/{}.wasm",
        package.package_name, package.version, package.parser.name
    )
}

fn parser_filename(package: &LanguagePackage) -> String {
    format!(
        "{}-{}-{}.wasm",
        package.parser.name, package.version, package.parser.sha256
    )
}

fn package_suffix(package_name: &str) -> &str {
    package_name
        .strip_prefix("@lumis-sh/wasm-")
        .unwrap_or(package_name)
}

fn language_source_dir() -> Option<PathBuf> {
    std::env::var_os("LUMIS_WASM_SOURCE_DIR").map(PathBuf::from)
}

fn source_asset(filename: &str) -> Option<PathBuf> {
    let path = language_source_dir()?.join("parsers").join(filename);
    path.is_file().then_some(path)
}

fn package_cache_is_fresh(path: &Path) -> bool {
    std::fs::metadata(path)
        .and_then(|metadata| metadata.modified())
        .and_then(|modified| modified.elapsed().map_err(std::io::Error::other))
        .is_ok_and(|elapsed| elapsed < PACKAGE_CACHE_TTL)
}

fn offline() -> bool {
    std::env::var("LUMIS_WASM_OFFLINE")
        .is_ok_and(|value| matches!(value.to_ascii_lowercase().as_str(), "1" | "true"))
}

fn colorize_bracket_pairs(pairs: Vec<BracketPair>) -> Vec<RainbowRange> {
    let mut opens: Vec<_> = pairs.iter().map(|pair| pair.open.clone()).collect();
    opens.sort_by_key(|range| (range.start, range.end));
    opens.dedup_by(|left, right| left.start == right.start && left.end == right.end);

    let mut color_pairs = pairs;
    color_pairs.sort_by_key(|pair| pair.close.end);
    let mut open_stack: Vec<std::ops::Range<usize>> = Vec::new();
    let mut open_index = 0;
    let mut ranges = Vec::new();
    for pair in color_pairs {
        while open_index < opens.len() && opens[open_index].start < pair.close.start {
            open_stack.push(opens[open_index].clone());
            open_index += 1;
        }
        if open_stack.last() == Some(&pair.open) {
            let scope_index = rainbow_scope_index(open_stack.len() - 1);
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

fn rainbow_scope_index(depth: usize) -> usize {
    let scope = RAINBOW_BRACKET_SCOPES[depth % RAINBOW_BRACKET_SCOPES.len()];
    HIGHLIGHT_NAMES
        .iter()
        .position(|candidate| *candidate == scope)
        .or_else(|| {
            HIGHLIGHT_NAMES
                .iter()
                .position(|candidate| *candidate == "punctuation.bracket")
        })
        .unwrap_or(0)
}

fn write_atomic(path: &Path, bytes: &[u8]) -> Result<()> {
    let parent = path
        .parent()
        .with_context(|| format!("cache path has no parent: {}", path.display()))?;
    std::fs::create_dir_all(parent)?;
    let temporary = parent.join(format!(
        ".{}.{}.tmp",
        path.file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("asset"),
        std::process::id()
    ));
    let result: Result<()> = (|| {
        std::fs::write(&temporary, bytes)?;
        if let Err(error) = std::fs::rename(&temporary, path) {
            if matches!(
                error.kind(),
                std::io::ErrorKind::AlreadyExists | std::io::ErrorKind::PermissionDenied
            ) {
                std::fs::remove_file(path)?;
                std::fs::rename(&temporary, path)?;
            } else {
                return Err(error.into());
            }
        }
        Ok(())
    })();
    let _ = std::fs::remove_file(temporary);
    result.with_context(|| format!("failed to cache asset at {}", path.display()))
}

fn with_cache_lock<T>(path: &Path, operation: impl FnOnce() -> Result<T>) -> Result<T> {
    let lock_path = path.with_extension("lock");
    let deadline = SystemTime::now() + Duration::from_secs(120);
    loop {
        match std::fs::OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&lock_path)
        {
            Ok(lock) => {
                let result = operation();
                drop(lock);
                let _ = std::fs::remove_file(lock_path);
                return result;
            }
            Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => {
                let stale = std::fs::metadata(&lock_path)
                    .and_then(|metadata| metadata.modified())
                    .and_then(|modified| modified.elapsed().map_err(std::io::Error::other))
                    .is_ok_and(|elapsed| elapsed > Duration::from_secs(300));
                if stale {
                    let _ = std::fs::remove_file(&lock_path);
                    continue;
                }
                if SystemTime::now() >= deadline {
                    bail!("timed out waiting for cache lock: {}", lock_path.display());
                }
                std::thread::sleep(Duration::from_millis(25));
            }
            Err(error) => return Err(error).context("failed to lock cache"),
        }
    }
}

fn fetch_bytes(url: &str) -> Result<Vec<u8>> {
    Ok(ureq::get(url).call()?.into_body().read_to_vec()?)
}

#[cfg(test)]
mod tests {
    use super::*;
    use lumis_wasm_runtime::{PackagedLanguage, ParserMetadata, LANGUAGE_PACKAGE_FORMAT_VERSION};
    use sha2::{Digest, Sha256};
    use tempfile::tempdir;

    const RUST_WASM: &[u8] = include_bytes!(
        "../../../packages/javascript/lumis/test/fixtures/wasm/tree-sitter-rust.wasm"
    );

    fn cached_rust_registry() -> (tempfile::TempDir, Registry) {
        let dir = tempdir().unwrap();
        let registry = Registry::new(dir.path().to_path_buf()).unwrap();
        let package = LanguagePackage {
            format_version: LANGUAGE_PACKAGE_FORMAT_VERSION,
            package_name: "@lumis-sh/wasm-rust".into(),
            version: "test".into(),
            definition_hash: "test".into(),
            parser: ParserMetadata {
                name: "tree-sitter-rust".into(),
                grammar_name: "rust".into(),
                sha256: format!("{:x}", Sha256::digest(RUST_WASM)),
                size: RUST_WASM.len(),
            },
            languages: std::collections::BTreeMap::from([(
                "rust".into(),
                PackagedLanguage {
                    highlights: "(function_item \"fn\" @keyword.function)".into(),
                    brackets: "(\"(\" @open \")\" @close)".into(),
                    ..PackagedLanguage::default()
                },
            )]),
        };
        let package_path = registry.package_path(&package.package_name);
        write_atomic(
            &package_path,
            serde_json::to_string(&package).unwrap().as_bytes(),
        )
        .unwrap();
        write_atomic(&registry.parser_path_for(&package), RUST_WASM).unwrap();
        (dir, registry)
    }

    #[test]
    fn cached_package_parses_and_highlights() {
        let (_dir, registry) = cached_rust_registry();
        let tree = registry.parse_tree("rust", "fn main() {}").unwrap();
        assert_eq!(tree.root_node().kind(), "source_file");
        assert!(registry.load_config("rust").unwrap().is_some());
    }

    #[test]
    fn parser_cache_is_content_addressed_and_verified() {
        let (_dir, registry) = cached_rust_registry();
        let path = registry.parser_path("rust").unwrap();
        assert!(path.to_string_lossy().contains("tree-sitter-rust-test-"));
        std::fs::write(&path, b"corrupt").unwrap();
        assert!(!registry.is_cached("rust"));
        assert!(!path.exists());
    }

    #[test]
    fn package_url_is_exact_after_resolution() {
        let (_dir, registry) = cached_rust_registry();
        let url = registry.parser_download_url("rust").unwrap();
        assert!(url.contains("@lumis-sh/wasm-rust@test/"));
        assert!(!url.contains("@latest"));
    }
}

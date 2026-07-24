use anyhow::{bail, Context, Result};
use lumis_core::highlights::HIGHLIGHT_NAMES;
use lumis_core::languages::Language;
use lumis_wasm_runtime::manifest::{self, WasmMetadata};
use lumis_wasm_runtime::tree_sitter_highlight::HighlightConfiguration;
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::{Duration, SystemTime};
use streaming_iterator::StreamingIterator;
use tree_sitter::{Parser, Query, QueryCursor, Tree, WasmStore};
use wasmtime::{Cache, Config, Engine};

include!(concat!(env!("OUT_DIR"), "/queries_constants.rs"));

/// Manages dynamic loading of tree-sitter WASM parsers and their highlight configurations.
pub struct Registry {
    data_dir: PathBuf,
    engine: Engine,
    wasm_store: Mutex<WasmStore>,
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
        if let Ok(cache) = Cache::from_file(None::<&std::path::Path>) {
            config.cache(Some(cache));
        }

        let engine = Engine::new(&config).unwrap_or_else(|e| {
            eprintln!("warning: wasmtime cache config failed ({e}), using defaults");
            Engine::default()
        });
        let wasm_store = WasmStore::new(&engine)?;

        std::fs::create_dir_all(data_dir.join("parsers"))?;
        std::fs::create_dir_all(data_dir.join("themes"))?;

        Ok(Self {
            data_dir,
            engine,
            wasm_store: Mutex::new(wasm_store),
        })
    }

    /// Create a new WasmStore from the same engine, for use with a Parser.
    pub fn new_wasm_store(&self) -> Result<WasmStore> {
        Ok(WasmStore::new(&self.engine)?)
    }

    /// Parse source with a language's Tree-sitter WASM parser.
    pub fn parse_tree(&self, lang_name: &str, source: &str) -> Result<Tree> {
        let wasm_bytes = self
            .ensure_parser(lang_name)
            .with_context(|| format!("failed to load parser for '{lang_name}'"))?;
        let mut store = self
            .wasm_store
            .lock()
            .map_err(|_| anyhow::anyhow!("Tree-sitter WASM store lock was poisoned"))?;
        let language = store.load_language(grammar_symbol_name(lang_name), &wasm_bytes)?;
        drop(store);

        let mut parser = Parser::new();
        parser.set_wasm_store(self.new_wasm_store()?)?;
        parser.set_language(&language)?;
        parser
            .parse(source.as_bytes(), None)
            .ok_or_else(|| anyhow::anyhow!("parser returned no syntax tree for '{lang_name}'"))
    }

    pub fn load_config(&self, lang_name: &str) -> Result<Option<HighlightConfiguration>> {
        self.load_config_inner(lang_name, false)
    }

    pub fn load_cached_config(&self, lang_name: &str) -> Result<Option<HighlightConfiguration>> {
        self.load_config_inner(lang_name, true)
    }

    pub fn rainbow_ranges(&self, lang_name: &str, source: &str) -> Result<Vec<RainbowRange>> {
        let (_highlights, _injections, _locals, brackets) = get_queries(lang_name);
        if brackets.trim().is_empty() {
            return Ok(Vec::new());
        }

        let wasm_bytes = self
            .ensure_parser(lang_name)
            .with_context(|| format!("failed to load parser for '{lang_name}'"))?;
        let mut store = self.wasm_store.lock().unwrap();
        let language = store.load_language(grammar_symbol_name(lang_name), &wasm_bytes)?;
        // A bracket query can reference anonymous nodes a grammar does not have
        // (for example HTML has no "(" token). Treat a query that fails to compile
        // as "no rainbow brackets for this language", matching the core library.
        let Ok(query) = Query::new(&language, brackets) else {
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
        parser.set_wasm_store(WasmStore::new(&self.engine)?)?;
        parser.set_language(&language)?;
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

    /// Read a parser WASM from the local cache, if present.
    fn read_cached_parser(&self, lang_name: &str) -> Option<Vec<u8>> {
        let metadata = parser_metadata(lang_name)?;
        let path = self.parser_path(lang_name);
        if let Ok(bytes) = std::fs::read(&path) {
            if verify_parser(&bytes, metadata).is_ok() {
                return Some(bytes);
            }
            let _ = std::fs::remove_file(&path);
        }

        let legacy_path = self.legacy_parser_path(lang_name);
        let bytes = std::fs::read(&legacy_path).ok()?;
        verify_parser(&bytes, metadata).ok().map(|()| bytes)
    }

    /// Ensure the parser WASM file is available.
    /// Checks data dir cache first, then downloads from CDN.
    fn ensure_parser(&self, lang_name: &str) -> Result<Vec<u8>> {
        if let Some(bytes) = self.read_cached_parser(lang_name) {
            return Ok(bytes);
        }

        self.download_parser(lang_name)
    }

    /// Download a parser WASM from CDN and cache it locally.
    /// Returns the WASM bytes.
    pub fn download_parser(&self, lang_name: &str) -> Result<Vec<u8>> {
        let metadata = parser_metadata(lang_name)
            .with_context(|| format!("missing WASM metadata for '{lang_name}'"))?;
        let cache_path = self.parser_path(lang_name);
        let url = self.parser_download_url(lang_name);

        let bytes = match fetch_bytes(&url) {
            Ok(bytes) => bytes,
            Err(_) => bail!("could not fetch parser for '{}'", lang_name),
        };

        verify_parser(&bytes, metadata)?;
        with_cache_lock(&cache_path, || write_atomic(&cache_path, &bytes))?;

        Ok(bytes)
    }

    /// Check if a parser WASM is already cached locally.
    pub fn is_cached(&self, lang_name: &str) -> bool {
        self.read_cached_parser(lang_name).is_some()
    }

    /// Re-download a parser WASM from CDN, replacing the cached version.
    pub fn update_parser(&self, lang_name: &str) -> Result<()> {
        self.download_parser(lang_name)?;
        Ok(())
    }

    /// Return the cached path for a parser WASM.
    pub fn parser_path(&self, lang_name: &str) -> PathBuf {
        let metadata =
            parser_metadata(lang_name).expect("every generated language has WASM metadata");
        let filename = format!(
            "{}-{}-{}.wasm",
            metadata.name, metadata.version, metadata.sha256
        );
        self.data_dir.join("parsers").join(filename)
    }

    pub fn parser_download_url(&self, lang_name: &str) -> String {
        let metadata =
            parser_metadata(lang_name).expect("every generated language has WASM metadata");
        format!(
            "https://cdn.jsdelivr.net/npm/{}@{}/{}.wasm",
            metadata.package_name, metadata.version, metadata.name
        )
    }

    fn legacy_parser_path(&self, lang_name: &str) -> PathBuf {
        let wasm_name = wasm_file_name(lang_name);
        self.data_dir
            .join("parsers")
            .join(format!("tree-sitter-{wasm_name}.wasm"))
    }

    pub fn data_dir(&self) -> &Path {
        &self.data_dir
    }

    fn load_config_inner(
        &self,
        lang_name: &str,
        cached_only: bool,
    ) -> Result<Option<HighlightConfiguration>> {
        let (highlights, injections, locals, _brackets) = get_queries(lang_name);
        if highlights.is_empty() && injections.is_empty() && locals.is_empty() {
            return Ok(None);
        }

        let wasm_bytes = if cached_only {
            match self.read_cached_parser(lang_name) {
                Some(bytes) => bytes,
                None => return Ok(None),
            }
        } else {
            self.ensure_parser(lang_name)
                .with_context(|| format!("failed to load parser for '{lang_name}'"))?
        };

        let mut store = self.wasm_store.lock().unwrap();
        let config = Self::build_highlight_config(
            lang_name, &mut store, highlights, injections, locals, wasm_bytes,
        )?;

        Ok(Some(config))
    }

    fn build_highlight_config(
        lang_name: &str,
        store: &mut WasmStore,
        highlights: &str,
        injections: &str,
        locals: &str,
        wasm_bytes: Vec<u8>,
    ) -> Result<HighlightConfiguration> {
        let language = store.load_language(grammar_symbol_name(lang_name), &wasm_bytes)?;
        let mut config =
            HighlightConfiguration::new(language, lang_name, highlights, injections, locals)
                .with_context(|| format!("failed to create highlight config for {}", lang_name))?;
        config.configure(&HIGHLIGHT_NAMES);

        Ok(config)
    }
}

/// The `tree_sitter_<name>` symbol exported by a language's WASM module.
/// Usually the query name, but a language that reuses another language's
/// parser (mdx -> markdown) diverges.
fn grammar_symbol_name(lang_name: &str) -> &str {
    match lang_name {
        "mdx" => "markdown",
        other => other,
    }
}

fn colorize_bracket_pairs(pairs: Vec<BracketPair>) -> Vec<RainbowRange> {
    let mut opens: Vec<_> = pairs.iter().map(|pair| pair.open.clone()).collect();
    opens.sort_by_key(|range| (range.start, range.end));
    opens.dedup_by(|a, b| a.start == b.start && a.end == b.end);

    let mut color_pairs: Vec<_> = pairs.into_iter().collect();
    color_pairs.sort_by_key(|pair| pair.close.end);

    let mut open_stack: Vec<std::ops::Range<usize>> = Vec::new();
    let mut open_index = 0usize;
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
        .unwrap_or_else(|| {
            HIGHLIGHT_NAMES
                .iter()
                .position(|candidate| *candidate == "punctuation.bracket")
                .unwrap_or(0)
        })
}

fn parser_metadata(lang_name: &str) -> Option<&'static WasmMetadata> {
    manifest::find(&format!("tree-sitter-{}", wasm_file_name(lang_name)))
}

fn verify_parser(bytes: &[u8], metadata: &WasmMetadata) -> Result<()> {
    if bytes.len() != metadata.size {
        bail!(
            "invalid parser WASM size for '{}': expected {}, got {}",
            metadata.name,
            metadata.size,
            bytes.len()
        );
    }

    let actual = format!("{:x}", Sha256::digest(bytes));
    if actual != metadata.sha256 {
        bail!(
            "invalid parser WASM integrity for '{}': expected sha256-{}, got sha256-{}",
            metadata.name,
            metadata.sha256,
            actual
        );
    }
    Ok(())
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
            .unwrap_or("parser"),
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
    result.with_context(|| format!("failed to cache parser at {}", path.display()))
}

fn with_cache_lock<T>(cache_path: &Path, operation: impl FnOnce() -> Result<T>) -> Result<T> {
    let lock_path = cache_path.with_extension("wasm.lock");
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
                    bail!(
                        "timed out waiting for parser WASM cache lock: {}",
                        lock_path.display()
                    );
                }
                std::thread::sleep(Duration::from_millis(25));
            }
            Err(error) => return Err(error).context("failed to lock parser WASM cache"),
        }
    }
}

/// Fetch bytes from a URL using ureq.
fn fetch_bytes(url: &str) -> Result<Vec<u8>> {
    let response = ureq::get(url).call()?;
    let bytes = response.into_body().read_to_vec()?;
    Ok(bytes)
}

#[cfg(test)]
mod tests {
    use super::*;
    use lumis_wasm_runtime::tree_sitter_highlight::Highlighter;
    use tempfile::tempdir;
    use tree_sitter::Parser;

    const RUST_WASM: &[u8] = include_bytes!(
        "../../../packages/javascript/lumis/test/fixtures/wasm/tree-sitter-rust.wasm"
    );

    fn cached_rust_registry() -> (tempfile::TempDir, Registry) {
        let dir = tempdir().unwrap();
        let reg = Registry::new(dir.path().to_path_buf()).unwrap();
        std::fs::write(reg.parser_path("rust"), RUST_WASM).unwrap();
        (dir, reg)
    }

    #[test]
    fn wasm_parser_can_parse_rust() {
        let (_dir, reg) = cached_rust_registry();
        let wasm = reg.ensure_parser("rust").unwrap();

        let mut store = reg.new_wasm_store().unwrap();
        let language = store.load_language("rust", &wasm).unwrap();

        let mut parser = Parser::new();
        parser.set_wasm_store(store).unwrap();
        parser.set_language(&language).unwrap();

        let tree = parser.parse("fn main() {}\n", None).unwrap();
        assert_eq!(tree.root_node().kind(), "source_file");
    }

    #[test]
    fn wasm_highlighter_can_highlight_rust() {
        let (_dir, reg) = cached_rust_registry();
        let config = reg.load_config("rust").unwrap().unwrap();

        let mut highlighter = Highlighter::new();
        let store = reg.new_wasm_store().unwrap();
        highlighter.parser().set_wasm_store(store).unwrap();

        let iter = highlighter
            .highlight(&config, b"fn main() {}\n", None, |_injected| None)
            .unwrap();

        let events = iter.collect::<Result<Vec<_>, _>>().unwrap();
        assert!(!events.is_empty());
    }

    #[test]
    fn loads_cached_config_without_downloading() {
        let dir = tempdir().unwrap();
        let reg = Registry::new(dir.path().to_path_buf()).unwrap();

        assert!(reg.load_cached_config("heex").unwrap().is_none());
    }

    #[test]
    fn parser_cache_is_content_addressed_and_integrity_checked() {
        let dir = tempdir().unwrap();
        let reg = Registry::new(dir.path().to_path_buf()).unwrap();
        let path = reg.parser_path("rust");

        assert!(path
            .file_name()
            .unwrap()
            .to_string_lossy()
            .starts_with("tree-sitter-rust-0.26."));
        std::fs::write(&path, b"corrupt").unwrap();
        assert!(!reg.is_cached("rust"));
        assert!(!path.exists());

        std::fs::write(&path, RUST_WASM).unwrap();
        assert!(reg.is_cached("rust"));
        assert_eq!(reg.ensure_parser("rust").unwrap(), RUST_WASM);
    }

    #[test]
    fn reads_a_valid_legacy_parser_without_downloading_or_mutating_it() {
        let dir = tempdir().unwrap();
        let reg = Registry::new(dir.path().to_path_buf()).unwrap();
        let legacy = reg.legacy_parser_path("rust");
        std::fs::write(&legacy, RUST_WASM).unwrap();

        assert_eq!(reg.ensure_parser("rust").unwrap(), RUST_WASM);
        assert!(!reg.parser_path("rust").exists());
        assert!(legacy.exists());
    }

    #[test]
    fn parser_url_uses_the_exact_manifest_version() {
        let metadata = parser_metadata("rust").unwrap();
        let url = Registry::new(tempdir().unwrap().path().to_path_buf())
            .unwrap()
            .parser_download_url("rust");

        assert!(url.contains(metadata.package_name));
        assert!(url.contains(&format!("@{}/", metadata.version)));
        assert!(!url.contains("@latest"));
    }
}

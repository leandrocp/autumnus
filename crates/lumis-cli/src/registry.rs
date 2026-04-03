use crate::vendor::tree_sitter_highlight::HighlightConfiguration;
use anyhow::{bail, Context, Result};
use lumis_core::highlights::HIGHLIGHT_NAMES;
use lumis_core::languages::Language;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tree_sitter::WasmStore;
use wasmtime::{Cache, Config, Engine};

include!(concat!(env!("OUT_DIR"), "/queries_constants.rs"));

/// Manages dynamic loading of tree-sitter WASM parsers and their highlight configurations.
pub struct Registry {
    data_dir: PathBuf,
    engine: Engine,
    wasm_store: Mutex<WasmStore>,
}

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

    pub fn load_config(&self, lang_name: &str) -> Result<Option<HighlightConfiguration>> {
        self.load_config_inner(lang_name, false)
    }

    pub fn load_cached_config(&self, lang_name: &str) -> Result<Option<HighlightConfiguration>> {
        self.load_config_inner(lang_name, true)
    }

    /// Read a parser WASM from the local cache, if present.
    fn read_cached_parser(&self, lang_name: &str) -> Option<Vec<u8>> {
        let path = self.parser_path(lang_name);
        std::fs::read(&path).ok()
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
        let wasm_name = wasm_file_name(lang_name);
        let filename = format!("tree-sitter-{}.wasm", wasm_name);
        let cache_path = self.data_dir.join("parsers").join(&filename);

        let url = self.parser_download_url(lang_name);

        let bytes = match fetch_bytes(&url) {
            Ok(bytes) => bytes,
            Err(_) => bail!("could not fetch parser for '{}'", lang_name),
        };

        std::fs::write(&cache_path, &bytes)
            .with_context(|| format!("failed to cache parser at {}", cache_path.display()))?;

        Ok(bytes)
    }

    /// Check if a parser WASM is already cached locally.
    pub fn is_cached(&self, lang_name: &str) -> bool {
        let wasm_name = wasm_file_name(lang_name);
        let filename = format!("tree-sitter-{}.wasm", wasm_name);
        self.data_dir.join("parsers").join(filename).exists()
    }

    /// Re-download a parser WASM from CDN, replacing the cached version.
    pub fn update_parser(&self, lang_name: &str) -> Result<()> {
        self.download_parser(lang_name)?;
        Ok(())
    }

    /// Return the cached path for a parser WASM.
    pub fn parser_path(&self, lang_name: &str) -> PathBuf {
        let wasm_name = wasm_file_name(lang_name);
        let filename = format!("tree-sitter-{}.wasm", wasm_name);
        self.data_dir.join("parsers").join(filename)
    }

    pub fn parser_download_url(&self, lang_name: &str) -> String {
        let wasm_name = wasm_file_name(lang_name);
        format!(
            "https://unpkg.com/@lumis-sh/wasm-{}@latest/tree-sitter-{}.wasm",
            wasm_name, wasm_name
        )
    }

    pub fn data_dir(&self) -> &Path {
        &self.data_dir
    }

    fn load_config_inner(
        &self,
        lang_name: &str,
        cached_only: bool,
    ) -> Result<Option<HighlightConfiguration>> {
        let (highlights, injections, locals) = get_queries(lang_name);
        if highlights.is_empty() && injections.is_empty() && locals.is_empty() {
            return Ok(None);
        }

        let wasm_bytes = if cached_only {
            match self.read_cached_parser(lang_name) {
                Some(bytes) => bytes,
                None => return Ok(None),
            }
        } else {
            match self.ensure_parser(lang_name) {
                Ok(bytes) => bytes,
                Err(_) => return Ok(None),
            }
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
        let language = store.load_language(lang_name, &wasm_bytes)?;
        let mut config =
            HighlightConfiguration::new(language, lang_name, highlights, injections, locals)
                .with_context(|| format!("failed to create highlight config for {}", lang_name))?;
        config.configure(&HIGHLIGHT_NAMES);

        Ok(config)
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
    use crate::vendor::tree_sitter_highlight::Highlighter;
    use tempfile::tempdir;
    use tree_sitter::Parser;

    #[test]
    fn wasm_parser_can_parse_rust() {
        let dir = tempdir().unwrap();
        let reg = Registry::new(dir.path().to_path_buf()).unwrap();
        let wasm = reg.download_parser("rust").unwrap();

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
        let dir = tempdir().unwrap();
        let reg = Registry::new(dir.path().to_path_buf()).unwrap();
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
}

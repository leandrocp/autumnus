use crate::highlight::HighlightConfiguration;
use anyhow::{bail, Context, Result};
use lumis_core::highlights::HIGHLIGHT_NAMES;
use lumis_core::languages::Language;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tree_sitter::WasmStore;

include!(concat!(env!("OUT_DIR"), "/queries_constants.rs"));

/// Manages dynamic loading of tree-sitter WASM parsers and their highlight configurations.
pub struct Registry {
    data_dir: PathBuf,
    engine: tree_sitter::wasmtime::Engine,
    configs: Mutex<HashMap<String, HighlightConfiguration>>,
    wasm_store: Mutex<WasmStore>,
}

impl Registry {
    pub fn new(data_dir: PathBuf) -> Result<Self> {
        let engine = tree_sitter::wasmtime::Engine::default();
        let wasm_store = WasmStore::new(&engine)?;

        std::fs::create_dir_all(data_dir.join("parsers"))?;
        std::fs::create_dir_all(data_dir.join("themes"))?;

        Ok(Self {
            data_dir,
            engine,
            configs: Mutex::new(HashMap::new()),
            wasm_store: Mutex::new(wasm_store),
        })
    }

    /// Create a new WasmStore from the same engine, for use with a Parser.
    pub fn new_wasm_store(&self) -> Result<WasmStore> {
        Ok(WasmStore::new(&self.engine)?)
    }

    /// Load a language config if not already loaded.
    /// Downloads the WASM parser if not cached locally.
    /// Silently skips if the language has no queries (unknown injection target).
    pub fn ensure_config(&self, lang_name: &str) -> Result<bool> {
        {
            let configs = self.configs.lock().unwrap();
            if configs.contains_key(lang_name) {
                return Ok(true);
            }
        }

        let (highlights, injections, locals) = get_queries(lang_name);
        if highlights.is_empty() && injections.is_empty() && locals.is_empty() {
            return Ok(false);
        }

        let wasm_bytes = match self.ensure_parser(lang_name) {
            Ok(bytes) => bytes,
            Err(_) => return Ok(false),
        };

        let language = {
            let mut store = self.wasm_store.lock().unwrap();
            store.load_language(lang_name, &wasm_bytes)?
        };

        let mut config =
            HighlightConfiguration::new(language, lang_name, highlights, injections, locals)
                .with_context(|| format!("failed to create highlight config for {}", lang_name))?;
        config.configure(&HIGHLIGHT_NAMES);

        let mut configs = self.configs.lock().unwrap();
        configs.insert(lang_name.to_string(), config);

        Ok(true)
    }

    /// Borrow the configs map.
    pub fn configs(&self) -> std::sync::MutexGuard<'_, HashMap<String, HighlightConfiguration>> {
        self.configs.lock().unwrap()
    }

    /// Ensure the parser WASM file is available.
    /// Checks data dir cache first, then downloads from CDN.
    fn ensure_parser(&self, lang_name: &str) -> Result<Vec<u8>> {
        let wasm_name = wasm_file_name(lang_name);
        let filename = format!("tree-sitter-{}.wasm", wasm_name);
        let cache_path = self.data_dir.join("parsers").join(&filename);

        if cache_path.exists() {
            return std::fs::read(&cache_path).with_context(|| {
                format!("failed to read cached parser at {}", cache_path.display())
            });
        }

        self.download_parser(lang_name)
    }

    /// Download a parser WASM from CDN and cache it locally.
    /// Returns the WASM bytes.
    pub fn download_parser(&self, lang_name: &str) -> Result<Vec<u8>> {
        let wasm_name = wasm_file_name(lang_name);
        let filename = format!("tree-sitter-{}.wasm", wasm_name);
        let cache_path = self.data_dir.join("parsers").join(&filename);

        let url = format!(
            "https://unpkg.com/@lumis-sh/wasm-{}@latest/tree-sitter-{}.wasm",
            wasm_name, wasm_name
        );

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

    /// Load configs for all parsers whose WASMs are already cached locally.
    /// This enables injection highlighting for any previously fetched languages.
    pub fn load_cached_parsers(&self) {
        for (query_name, _) in all_wasm_names() {
            if self.is_cached(query_name) {
                let _ = self.ensure_config(query_name);
            }
        }
    }

    pub fn data_dir(&self) -> &Path {
        &self.data_dir
    }
}

/// Fetch bytes from a URL using ureq.
fn fetch_bytes(url: &str) -> Result<Vec<u8>> {
    let response = ureq::get(url).call()?;
    let bytes = response.into_body().read_to_vec()?;
    Ok(bytes)
}

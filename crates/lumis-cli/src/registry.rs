use crate::vendor::tree_sitter_highlight::HighlightConfiguration;
use anyhow::{bail, Context, Result};
use lumis_core::highlights::HIGHLIGHT_NAMES;
use lumis_core::languages::Language;
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use tree_sitter::WasmStore;

include!(concat!(env!("OUT_DIR"), "/queries_constants.rs"));

/// Manages dynamic loading of tree-sitter WASM parsers and their highlight configurations.
pub struct Registry {
    data_dir: PathBuf,
    engine: tree_sitter::wasmtime::Engine,
}

impl Registry {
    pub fn new(data_dir: PathBuf) -> Result<Self> {
        let engine = tree_sitter::wasmtime::Engine::default();
        let _ = WasmStore::new(&engine)?;

        std::fs::create_dir_all(data_dir.join("parsers"))?;
        std::fs::create_dir_all(data_dir.join("themes"))?;

        Ok(Self { data_dir, engine })
    }

    /// Create a new WasmStore from the same engine, for use with a Parser.
    pub fn new_wasm_store(&self) -> Result<WasmStore> {
        Ok(WasmStore::new(&self.engine)?)
    }

    pub fn load_related_configs(
        &self,
        lang_name: &str,
        store: &mut WasmStore,
    ) -> Result<HashMap<String, HighlightConfiguration>> {
        let mut configs = HashMap::new();
        let mut visiting = HashSet::new();
        self.load_related_configs_inner(lang_name, store, &mut configs, &mut visiting)?;
        Ok(configs)
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

    fn load_related_configs_inner(
        &self,
        lang_name: &str,
        store: &mut WasmStore,
        configs: &mut HashMap<String, HighlightConfiguration>,
        visiting: &mut HashSet<String>,
    ) -> Result<()> {
        if configs.contains_key(lang_name) || !visiting.insert(lang_name.to_string()) {
            return Ok(());
        }

        let Some(config) = self.build_config_with_store(lang_name, store)? else {
            visiting.remove(lang_name);
            return Ok(());
        };
        configs.insert(lang_name.to_string(), config);

        for injected in static_injection_languages(lang_name) {
            self.load_related_configs_inner(&injected, store, configs, visiting)?;
        }

        visiting.remove(lang_name);
        Ok(())
    }

    fn build_config_with_store(
        &self,
        lang_name: &str,
        store: &mut WasmStore,
    ) -> Result<Option<HighlightConfiguration>> {
        let (highlights, injections, locals) = get_queries(lang_name);
        if highlights.is_empty() && injections.is_empty() && locals.is_empty() {
            return Ok(None);
        }

        let wasm_bytes = match self.ensure_parser(lang_name) {
            Ok(bytes) => bytes,
            Err(_) => return Ok(None),
        };

        let language = store.load_language(lang_name, &wasm_bytes)?;
        let mut config =
            HighlightConfiguration::new(language, lang_name, highlights, injections, locals)
                .with_context(|| format!("failed to create highlight config for {}", lang_name))?;
        config.configure(&HIGHLIGHT_NAMES);

        Ok(Some(config))
    }
}

/// Fetch bytes from a URL using ureq.
fn fetch_bytes(url: &str) -> Result<Vec<u8>> {
    let response = ureq::get(url).call()?;
    let bytes = response.into_body().read_to_vec()?;
    Ok(bytes)
}

fn static_injection_languages(lang_name: &str) -> Vec<String> {
    let (_, injections, _) = get_queries(lang_name);
    let marker = "(#set! injection.language \"";
    let mut languages = Vec::new();
    let mut seen = HashSet::new();
    let mut offset = 0;

    while let Some(start) = injections[offset..].find(marker) {
        let lang_start = offset + start + marker.len();
        let Some(end) = injections[lang_start..].find('"') else {
            break;
        };

        let injected = &injections[lang_start..lang_start + end];
        if seen.insert(injected) {
            languages.push(injected.to_string());
        }

        offset = lang_start + end + 1;
    }

    languages
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::vendor::tree_sitter_highlight::Highlighter;
    use std::fs;
    use std::path::PathBuf;
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
        let mut store = reg.new_wasm_store().unwrap();
        let configs = reg.load_related_configs("rust", &mut store).unwrap();
        let config = configs.get("rust").unwrap();

        let mut highlighter = Highlighter::new();
        highlighter.parser().set_wasm_store(store).unwrap();

        let iter = highlighter
            .highlight(config, b"fn main() {}\n", None, |_injected| None)
            .unwrap();

        let events = iter.collect::<Result<Vec<_>, _>>().unwrap();
        assert!(!events.is_empty());
    }

    #[test]
    fn loads_static_injection_configs_for_elixir() {
        let dir = tempdir().unwrap();
        let reg = Registry::new(dir.path().to_path_buf()).unwrap();
        let mut store = reg.new_wasm_store().unwrap();

        let configs = reg.load_related_configs("elixir", &mut store).unwrap();

        assert!(configs.contains_key("elixir"));
        assert!(configs.contains_key("heex"));
    }

    #[test]
    fn elixir_highlighter_emits_heex_injection_events() {
        let dir = tempdir().unwrap();
        let reg = Registry::new(dir.path().to_path_buf()).unwrap();
        let mut store = reg.new_wasm_store().unwrap();
        let configs = reg.load_related_configs("elixir", &mut store).unwrap();

        let sample = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("../..")
            .join("sample.ex");
        let source = fs::read_to_string(sample).unwrap();

        let config = configs.get("elixir").unwrap();
        let mut highlighter = Highlighter::new();
        highlighter.parser().set_wasm_store(store).unwrap();

        let events = highlighter
            .highlight(config, source.as_bytes(), None, |injected| {
                configs.get(injected)
            })
            .unwrap()
            .collect::<Result<Vec<_>, _>>()
            .unwrap();

        assert!(events.iter().any(|event| matches!(
            event,
            crate::vendor::tree_sitter_highlight::HighlightEvent::HighlightStart { language, .. } if language == "heex"
        )));
    }
}

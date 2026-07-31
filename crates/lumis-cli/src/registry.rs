use anyhow::{Context, Result};
use lumis_core::highlights::HIGHLIGHT_NAMES;
pub use lumis_wasm_runtime::brackets::RainbowRange;
use lumis_wasm_runtime::brackets::{bracket_pairs, colorize_bracket_pairs};
use lumis_wasm_runtime::catalog;
#[cfg(test)]
use lumis_wasm_runtime::sha256_hex;
use lumis_wasm_runtime::tree_sitter_highlight::HighlightConfiguration;
#[cfg(test)]
use lumis_wasm_runtime::write_atomic;
use lumis_wasm_runtime::{Fetcher, LanguagePackage, LanguageStore, StoreConfig};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tree_sitter::{Parser, Query, Tree, WasmStore};
use wasmtime::{Cache, Config, Engine};

/// The CLI's HTTP client. `LanguageStore` owns the caching; this only fetches.
struct UreqFetcher;

impl Fetcher for UreqFetcher {
    fn get(&self, url: &str) -> Result<Vec<u8>, String> {
        ureq::get(url)
            .call()
            .map_err(|error| error.to_string())?
            .into_body()
            .read_to_vec()
            .map_err(|error| error.to_string())
    }
}

/// Highlighting on top of [`LanguageStore`], which owns resolution and caching.
pub struct Registry {
    data_dir: PathBuf,
    store: LanguageStore,
    engine: Engine,
    wasm_store: Mutex<WasmStore>,
}

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
        let store = LanguageStore::new(
            StoreConfig {
                cache_dir: data_dir.clone(),
                source_dir: LanguageStore::source_dir_from_env(),
                offline: LanguageStore::offline_from_env(),
            },
            Box::new(UreqFetcher),
        );
        Ok(Self {
            data_dir,
            store,
            engine,
            wasm_store,
        })
    }

    pub fn new_wasm_store(&self) -> Result<WasmStore> {
        Ok(WasmStore::new(&self.engine)?)
    }

    pub fn parse_tree(&self, language: &str, source: &str) -> Result<Tree> {
        let package = self.package(language)?;
        let wasm = self.store.parser(&package)?;
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
        let package = self.package(language)?;
        let (_, definition) = package.require_language(language)?;
        if definition.brackets.trim().is_empty() {
            return Ok(Vec::new());
        }

        let wasm = self.store.parser(&package)?;
        let grammar = self.load_wasm_language(&package, &wasm)?;
        let Ok(query) = Query::new(&grammar, &definition.brackets) else {
            return Ok(Vec::new());
        };

        let mut parser = Parser::new();
        parser.set_wasm_store(self.new_wasm_store()?)?;
        parser.set_language(&grammar)?;
        let Some(tree) = parser.parse(source.as_bytes(), None) else {
            return Ok(Vec::new());
        };

        let pairs = bracket_pairs(&query, tree.root_node(), source.as_bytes());
        Ok(colorize_bracket_pairs(pairs))
    }

    pub fn download_parser(&self, language: &str) -> Result<Vec<u8>> {
        let package = self.package(language)?;
        Ok(self.store.refresh_parser(&package)?)
    }

    pub fn is_cached(&self, language: &str) -> bool {
        self.cached_package(language)
            .is_some_and(|package| self.store.cached_parser(&package).is_some())
    }

    pub fn parser_path(&self, language: &str) -> Result<PathBuf> {
        let package = self.package(language)?;
        Ok(self.store.parser_path(&package))
    }

    pub fn parser_download_url(&self, language: &str) -> Result<String> {
        let package = self.package(language)?;
        Ok(LanguageStore::parser_url(&package))
    }

    /// Resolve `language` to its package, fetching and caching as needed.
    fn package(&self, language: &str) -> Result<Arc<LanguagePackage>> {
        let location =
            catalog::find(language).with_context(|| format!("unknown language '{language}'"))?;
        Ok(self.store.package(location.package_name)?)
    }

    /// The package for `language` if it is already resolved or on disk.
    fn cached_package(&self, language: &str) -> Option<Arc<LanguagePackage>> {
        let location = catalog::find(language)?;
        self.store.cached_package(location.package_name)
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
            let Some(package) = self.cached_package(language) else {
                return Ok(None);
            };
            package
        } else {
            self.package(language)?
        };
        let (id, definition) = package.require_language(language)?;
        if definition.highlights.is_empty()
            && definition.injections.is_empty()
            && definition.locals.is_empty()
        {
            return Ok(None);
        }

        let wasm = if cached_only {
            let Some(bytes) = self.store.cached_parser(&package) else {
                return Ok(None);
            };
            bytes
        } else {
            self.store.parser(&package)?
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
        use lumis_wasm_runtime::{PackagedLanguage, ParserMetadata};

        let location = catalog::find(id).unwrap();
        let parser_name = format!("tree-sitter-{grammar_name}");
        let package = LanguagePackage {
            package_name: location.package_name.into(),
            version: "test".into(),
            definition_hash: "test".into(),
            parser: ParserMetadata {
                name: parser_name,
                grammar_name: grammar_name.into(),
                upstream_version: None,
                revision: None,
                sha256: sha256_hex(wasm),
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
            &self.store.package_path(location.package_name),
            serde_json::to_string(&package).unwrap().as_bytes(),
        )
        .unwrap();
        write_atomic(&self.store.parser_path(&package), wasm).unwrap();
    }
}

pub fn all_language_ids() -> impl Iterator<Item = &'static str> {
    catalog::LANGUAGES.iter().map(|language| language.id)
}

#[cfg(test)]
mod tests {
    use super::*;
    use lumis_wasm_runtime::{PackagedLanguage, ParserMetadata};
    use tempfile::tempdir;

    const RUST_WASM: &[u8] = include_bytes!(
        "../../../packages/javascript/lumis/test/fixtures/wasm/tree-sitter-rust.wasm"
    );

    fn cached_rust_registry() -> (tempfile::TempDir, Registry) {
        let dir = tempdir().unwrap();
        let registry = Registry::new(dir.path().to_path_buf()).unwrap();
        let package = LanguagePackage {
            package_name: "@lumis-sh/wasm-rust".into(),
            version: "test".into(),
            definition_hash: "test".into(),
            parser: ParserMetadata {
                name: "tree-sitter-rust".into(),
                grammar_name: "rust".into(),
                upstream_version: None,
                revision: None,
                sha256: sha256_hex(RUST_WASM),
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
        let package_path = registry.store.package_path(&package.package_name);
        write_atomic(
            &package_path,
            serde_json::to_string(&package).unwrap().as_bytes(),
        )
        .unwrap();
        write_atomic(&registry.store.parser_path(&package), RUST_WASM).unwrap();
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

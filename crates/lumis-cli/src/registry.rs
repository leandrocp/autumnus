use anyhow::{Context, Result};
use lumis_wasm_runtime::catalog;
use lumis_wasm_runtime::{
    HighlightOptions, HighlightOutput, HttpFetcher, LanguagePackage, LanguageStore, Runtime,
    StoreConfig,
};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tree_sitter::Tree;

/// The CLI's view of [`Runtime`]: the same one-pass highlighting Elixir and Node
/// use, plus the paths and cache reporting `lumis languages cache` prints.
pub struct Registry {
    data_dir: PathBuf,
    runtime: Runtime,
}

impl Registry {
    pub fn new(data_dir: PathBuf) -> Result<Self> {
        std::fs::create_dir_all(data_dir.join("parsers"))?;
        std::fs::create_dir_all(data_dir.join("themes"))?;
        let store = LanguageStore::new(
            StoreConfig {
                cache_dir: data_dir.clone(),
            },
            Box::new(HttpFetcher),
        );

        let runtime = Runtime::with_worker_limit(1)?.with_store(store);
        for language in catalog::LANGUAGES {
            runtime.declare_language(language.id, language.aliases);
        }

        Ok(Self { data_dir, runtime })
    }

    pub fn data_dir(&self) -> &Path {
        &self.data_dir
    }

    pub fn parse_tree(&self, language: &str, source: &str) -> Result<Tree> {
        Ok(self.runtime.parse_tree(source, language)?)
    }

    pub fn highlight(
        &self,
        source: &str,
        language: &str,
        options: &HighlightOptions,
    ) -> Result<HighlightOutput> {
        Ok(self.runtime.highlight_with(source, language, options)?)
    }

    /// Download and cache `language`, returning where its parser landed.
    pub fn cache_parser(&self, language: &str, force: bool) -> Result<PathBuf> {
        Ok(self.store().cache_language(language, force)?)
    }

    /// Load `language`, so Wasmtime writes its compiled form beside the parser.
    pub fn load_language(&self, language: &str) -> Result<()> {
        Ok(self.runtime.load_named_language(language)?)
    }

    pub fn is_cached(&self, language: &str) -> bool {
        self.local_package(language)
            .is_some_and(|package| self.store().cached_parser(&package).is_some())
    }

    #[cfg(test)]
    pub fn parser_path(&self, language: &str) -> Result<PathBuf> {
        Ok(self.store().parser_path(self.package(language)?.as_ref())?)
    }

    pub fn parser_download_url(&self, language: &str) -> Result<String> {
        Ok(LanguageStore::parser_url(self.package(language)?.as_ref())?)
    }

    fn store(&self) -> &LanguageStore {
        self.runtime.store().expect("the CLI always has a store")
    }

    fn package(&self, language: &str) -> Result<Arc<LanguagePackage>> {
        let location =
            catalog::find(language).with_context(|| format!("unknown language '{language}'"))?;
        Ok(self.store().package(location.package_name)?)
    }

    fn local_package(&self, language: &str) -> Option<Arc<LanguagePackage>> {
        let location = catalog::find(language)?;
        self.store().local_package(location.package_name)
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
        use lumis_wasm_runtime::{sha256_hex, write_atomic, PackagedLanguage, ParserMetadata};

        let location = catalog::find(id).unwrap();
        let package = LanguagePackage {
            package_name: location.package_name.into(),
            version: lumis_wasm_runtime::lowest_compatible_package_version(),
            definition_hash: "test".into(),
            parser: ParserMetadata {
                name: format!("tree-sitter-{grammar_name}"),
                grammar_name: grammar_name.into(),
                upstream_version: None,
                revision: None,
                sha256: sha256_hex(wasm),
                size: u64::try_from(wasm.len()).expect("parser size fits in u64"),
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
            &self.store().package_path(location.package_name).unwrap(),
            serde_json::to_string(&package).unwrap().as_bytes(),
        )
        .unwrap();
        write_atomic(&self.store().parser_path(&package).unwrap(), wasm).unwrap();
    }
}

pub fn all_language_ids() -> impl Iterator<Item = &'static str> {
    catalog::LANGUAGES.iter().map(|language| language.id)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    const RUST_WASM: &[u8] = include_bytes!(
        "../../../packages/javascript/lumis/test/fixtures/wasm/tree-sitter-rust.wasm"
    );

    fn cached_rust_registry() -> (tempfile::TempDir, Registry) {
        let dir = tempdir().unwrap();
        let registry = Registry::new(dir.path().to_path_buf()).unwrap();
        registry.cache_test_language(
            "rust",
            "rust",
            RUST_WASM,
            "(function_item \"fn\" @keyword.function)",
            "",
            "",
        );
        (dir, registry)
    }

    #[test]
    fn local_package_parses_and_highlights() {
        let (_dir, registry) = cached_rust_registry();
        let tree = registry.parse_tree("rust", "fn main() {}").unwrap();
        assert_eq!(tree.root_node().kind(), "source_file");

        let output = registry
            .highlight("fn main() {}", "rust", &HighlightOptions::default())
            .unwrap();
        assert!(!output.events.is_empty());
    }

    #[test]
    fn parser_cache_is_content_addressed_and_verified() {
        let (_dir, registry) = cached_rust_registry();
        let path = registry.parser_path("rust").unwrap();
        assert!(path.to_string_lossy().contains(&format!(
            "tree-sitter-rust-{}-",
            lumis_wasm_runtime::lowest_compatible_package_version()
        )));
        std::fs::write(&path, b"corrupt").unwrap();
        assert!(!registry.is_cached("rust"));
        assert!(!path.exists());
    }

    #[test]
    fn package_url_is_exact_after_resolution() {
        let (_dir, registry) = cached_rust_registry();
        let url = registry.parser_download_url("rust").unwrap();
        assert!(url.contains(&format!(
            "@lumis-sh/wasm-rust@{}/",
            lumis_wasm_runtime::lowest_compatible_package_version()
        )));
        assert!(!url.contains("@latest"));
    }
}

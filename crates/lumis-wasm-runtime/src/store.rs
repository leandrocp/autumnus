//! Resolve, verify and cache language packages and parser WASM on disk.
//!
//! Shared by the CLI and the Elixir NIF.
//!
//! There is deliberately no file lock. Writes rename a uniquely named temporary
//! into place and parser bytes are verified first, so concurrent writers converge
//! on identical content; a lock would only save a duplicate download.
//!
//! Networking is behind [`Fetcher`] so a host can supply its own HTTP client, or
//! none at all in tests.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use thiserror::Error;

use crate::package::{LanguagePackage, LanguagePackageError};

/// How long a cached `language.json` is trusted before it is refreshed.
pub const PACKAGE_CACHE_TTL: Duration = Duration::from_secs(60 * 60);

const REPLACE_ATTEMPTS: u32 = 20;
const REPLACE_RETRY_DELAY: Duration = Duration::from_millis(5);

/// Tried in order; both serve the same `<package>@<version>/<file>` layout.
const CDNS: [&str; 2] = ["https://cdn.jsdelivr.net/npm", "https://unpkg.com"];

#[derive(Debug, Error)]
pub enum StoreError {
    #[error("unknown language '{0}'")]
    UnknownLanguage(String),
    #[error("'{0}' is not a Lumis language package name")]
    InvalidPackageName(String),
    #[error("language package name mismatch: expected '{expected}', got '{actual}'")]
    PackageNameMismatch { expected: String, actual: String },
    #[error("language package is not UTF-8 JSON")]
    NotUtf8,
    #[error("{context}: {source}")]
    Io {
        context: String,
        #[source]
        source: std::io::Error,
    },
    #[error("could not download {description}: {message}")]
    Fetch {
        description: String,
        message: String,
    },
    #[error(transparent)]
    Package(#[from] LanguagePackageError),
}

impl StoreError {
    fn io(context: impl Into<String>, source: std::io::Error) -> Self {
        Self::Io {
            context: context.into(),
            source,
        }
    }
}

/// Fetches bytes over the network. Hosts supply their own client.
pub trait Fetcher: Send + Sync {
    /// # Errors
    /// Returns a message describing why the request failed.
    fn get(&self, url: &str) -> Result<Vec<u8>, String>;
}

/// The default [`Fetcher`]: an HTTP client.
///
/// Lives here rather than in each host so the CLI, the Elixir NIF and the Node
/// addon download, verify and cache through exactly the same code.
#[cfg(feature = "wasm")]
pub struct HttpFetcher;

#[cfg(feature = "wasm")]
impl Fetcher for HttpFetcher {
    fn get(&self, url: &str) -> Result<Vec<u8>, String> {
        ureq::get(url)
            .call()
            .map_err(|error| error.to_string())?
            .into_body()
            .read_to_vec()
            .map_err(|error| error.to_string())
    }
}

/// A [`Fetcher`] that refuses every request.
pub struct NoNetwork;

impl Fetcher for NoNetwork {
    fn get(&self, _url: &str) -> Result<Vec<u8>, String> {
        Err("network access is disabled".to_string())
    }
}

/// Where a store keeps and looks for assets.
pub struct StoreConfig {
    /// Directory holding cached `language.json` and parser files.
    pub cache_dir: PathBuf,
    /// Consulted before the cache and never written to, for parsers a caller
    /// builds or vendors. `LUMIS_WASM_PATH` sets it in every runtime.
    pub source_dir: Option<PathBuf>,
}

/// Resolves language packages and parser bytes, caching both on disk.
pub struct LanguageStore {
    config: StoreConfig,
    fetcher: Box<dyn Fetcher>,
    packages: Mutex<HashMap<String, Arc<LanguagePackage>>>,
}

impl LanguageStore {
    #[must_use]
    pub fn new(config: StoreConfig, fetcher: Box<dyn Fetcher>) -> Self {
        Self {
            config,
            fetcher,
            packages: Mutex::new(HashMap::new()),
        }
    }

    /// Read `LUMIS_WASM_PATH`, a directory of pre-staged language packages.
    #[must_use]
    pub fn source_dir_from_env() -> Option<PathBuf> {
        std::env::var_os("LUMIS_WASM_PATH").map(PathBuf::from)
    }

    #[must_use]
    pub fn cache_dir(&self) -> &Path {
        &self.config.cache_dir
    }

    /// The package for `package_name`, from memory, local source, cache, or the CDN.
    ///
    /// # Errors
    /// Fails when the package cannot be obtained from any source, or is invalid.
    pub fn package(&self, package_name: &str) -> Result<Arc<LanguagePackage>, StoreError> {
        if let Some(package) = self.memo(package_name) {
            return Ok(package);
        }

        let path = self.package_path(package_name)?;
        let package = (|| {
            if let Some(package) = self.read_source_package(package_name)? {
                return Ok(package);
            }

            let cached = read_package_file(&path, package_name);
            if cache_is_fresh(&path, PACKAGE_CACHE_TTL) {
                if let Some(package) = cached.as_ref() {
                    return Ok(package.clone());
                }
            }

            match self.fetch_package(package_name, &path) {
                Ok(package) => Ok(package),
                Err(error) => cached.ok_or(error),
            }
        })()?;

        Ok(self.remember(package_name, package))
    }

    /// The package from memory, a configured source directory, or the cache.
    ///
    /// Everything except the network, so a caller can tell what is available
    /// offline.
    #[must_use]
    pub fn local_package(&self, package_name: &str) -> Option<Arc<LanguagePackage>> {
        if let Some(package) = self.memo(package_name) {
            return Some(package);
        }
        let package = self
            .read_source_package(package_name)
            .ok()
            .flatten()
            .or_else(|| read_package_file(&self.package_path(package_name).ok()?, package_name))?;
        Some(self.remember(package_name, package))
    }

    /// Verified parser bytes for `package`, from local source, cache, or the CDN.
    ///
    /// # Errors
    /// Fails when the parser cannot be obtained, or its bytes do not match the
    /// size and digest the package declares.
    pub fn parser(&self, package: &LanguagePackage) -> Result<Vec<u8>, StoreError> {
        let path = self.parser_path(package)?;
        if let Some(bytes) = self.local_parser(package) {
            return Ok(bytes);
        }
        self.fetch_parser(package, &path)
    }

    /// Verified parser bytes from a configured source directory or the cache,
    /// never the network. A file that fails verification is deleted rather than
    /// returned.
    #[must_use]
    pub fn local_parser(&self, package: &LanguagePackage) -> Option<Vec<u8>> {
        self.source_parser(package)
            .or_else(|| self.cached_parser(package))
    }

    fn source_parser(&self, package: &LanguagePackage) -> Option<Vec<u8>> {
        package.validate().ok()?;
        let source = self.source_asset(&parser_filename(package))?;
        let bytes = std::fs::read(&source).ok()?;
        package.verify_wasm(&bytes).ok().map(|()| bytes)
    }

    /// Verified parser bytes from this store's own cache directory only.
    ///
    /// Caching copies *into* this directory, so it has to ask whether its own
    /// cache holds the parser, not whether one is reachable from anywhere.
    pub fn cached_parser(&self, package: &LanguagePackage) -> Option<Vec<u8>> {
        let path = self.parser_path(package).ok()?;
        if let Ok(bytes) = std::fs::read(&path) {
            if package.verify_wasm(&bytes).is_ok() {
                return Some(bytes);
            }
            let _ = std::fs::remove_file(&path);
        }

        // Parsers cached before filenames became content-addressed.
        let legacy = self
            .config
            .cache_dir
            .join("parsers")
            .join(format!("{}.wasm", package.parser.name));
        let bytes = std::fs::read(legacy).ok()?;
        package.verify_wasm(&bytes).ok().map(|()| bytes)
    }

    /// Download and cache the parser even when a verified copy already exists.
    ///
    /// # Errors
    /// Fails when the parser cannot be fetched or fails verification.
    pub fn refresh_parser(&self, package: &LanguagePackage) -> Result<Vec<u8>, StoreError> {
        let path = self.parser_path(package)?;
        self.fetch_parser(package, &path)
    }

    /// Download and cache `name` and its parser without loading either.
    ///
    /// Caching is pure I/O, so it needs no Wasmtime runtime: `lumis parsers
    /// cache` and `mix lumis.languages.cache` both land here.
    ///
    /// # Errors
    /// Fails when the name is unknown, or the package or parser cannot be
    /// obtained or verified.
    pub fn cache_language(&self, name: &str, force: bool) -> Result<PathBuf, StoreError> {
        let location =
            crate::catalog::find(name).ok_or_else(|| StoreError::UnknownLanguage(name.into()))?;
        let package = self.package(location.package_name)?;
        let path = self.parser_path(&package)?;

        if force {
            self.refresh_parser(&package)?;
        } else if self.cached_parser(&package).is_none() {
            match self.source_parser(&package) {
                Some(bytes) => write_atomic(&path, &bytes)?,
                None => {
                    self.fetch_parser(&package, &path)?;
                }
            }
        }

        self.cache_package(&package)?;
        Ok(path)
    }

    /// Write `package` into the cache, so a later run needs neither a source
    /// directory nor the network. A parser without its metadata is unusable.
    pub fn cache_package(&self, package: &LanguagePackage) -> Result<(), StoreError> {
        let bytes = serde_json::to_vec(package).map_err(|error| StoreError::Io {
            context: format!("could not serialize {}", package.package_name),
            source: std::io::Error::other(error),
        })?;
        package.validate()?;
        write_atomic(&self.package_path(&package.package_name)?, &bytes)
    }

    /// Path a verified parser is cached at. Content-addressed, so upgrading a
    /// package never overwrites an older verified asset.
    ///
    /// # Errors
    /// Fails when the package would not name a single file inside the cache.
    /// [`LanguagePackage`] has public fields, so a caller can build one that
    /// never went through [`LanguagePackage::validate`]; this is the boundary
    /// that refuses it rather than a precondition callers have to remember.
    pub fn parser_path(&self, package: &LanguagePackage) -> Result<PathBuf, StoreError> {
        package.validate()?;
        Ok(self
            .config
            .cache_dir
            .join("parsers")
            .join(parser_filename(package)))
    }

    /// Path this package's metadata is cached at.
    ///
    /// # Errors
    /// Fails when `package_name` is not a Lumis language package name.
    pub fn package_path(&self, package_name: &str) -> Result<PathBuf, StoreError> {
        let suffix = package_suffix(package_name)
            .ok_or_else(|| StoreError::InvalidPackageName(package_name.to_string()))?;
        Ok(self
            .config
            .cache_dir
            .join("parsers")
            .join(format!("{suffix}.language.json")))
    }

    /// Exact-version URL for this package's parser on the primary CDN.
    ///
    /// Reported to users; [`Self::parser`] additionally falls back to the mirrors.
    /// # Errors
    /// Fails when the package would not name a single file, as [`Self::parser_path`].
    pub fn parser_url(package: &LanguagePackage) -> Result<String, StoreError> {
        package.validate()?;
        Ok(format!("{}/{}", CDNS[0], parser_path(package)))
    }

    /// Fetch `path` from the first CDN that serves it.
    fn fetch_from_cdn(&self, path: &str, description: &str) -> Result<Vec<u8>, StoreError> {
        let mut failures = Vec::new();
        for base in CDNS {
            match self.fetcher.get(&format!("{base}/{path}")) {
                Ok(bytes) => return Ok(bytes),
                Err(message) => failures.push(message),
            }
        }
        failures.dedup();
        Err(StoreError::Fetch {
            description: description.to_string(),
            message: failures.join("; "),
        })
    }

    fn memo(&self, package_name: &str) -> Option<Arc<LanguagePackage>> {
        self.packages.lock().ok()?.get(package_name).map(Arc::clone)
    }

    fn remember(&self, package_name: &str, package: LanguagePackage) -> Arc<LanguagePackage> {
        let package = Arc::new(package);
        if let Ok(mut packages) = self.packages.lock() {
            packages.insert(package_name.to_string(), Arc::clone(&package));
        }
        package
    }

    fn source_asset(&self, filename: &str) -> Option<PathBuf> {
        let path = self
            .config
            .source_dir
            .as_ref()?
            .join("parsers")
            .join(filename);
        path.is_file().then_some(path)
    }

    fn read_source_package(
        &self,
        package_name: &str,
    ) -> Result<Option<LanguagePackage>, StoreError> {
        let suffix = package_suffix(package_name)
            .ok_or_else(|| StoreError::InvalidPackageName(package_name.to_string()))?;
        let Some(source) = self.source_asset(&format!("{suffix}.language.json")) else {
            return Ok(None);
        };
        let bytes = std::fs::read(&source).map_err(|error| {
            StoreError::io(format!("could not read {}", source.display()), error)
        })?;
        parse_package(&bytes, package_name).map(Some)
    }

    fn fetch_package(
        &self,
        package_name: &str,
        path: &Path,
    ) -> Result<LanguagePackage, StoreError> {
        let bytes = self.fetch_from_cdn(
            &format!("{package_name}@latest/language.json"),
            &format!("language package {package_name}"),
        )?;
        let package = parse_package(&bytes, package_name)?;
        write_atomic(path, &bytes)?;
        Ok(package)
    }

    fn fetch_parser(&self, package: &LanguagePackage, path: &Path) -> Result<Vec<u8>, StoreError> {
        let bytes = if let Some(source) = self.source_asset(&parser_filename(package)) {
            std::fs::read(&source).map_err(|error| {
                StoreError::io(format!("could not read {}", source.display()), error)
            })?
        } else {
            self.fetch_from_cdn(
                &parser_path(package),
                &format!("parser WASM {}@{}", package.package_name, package.version),
            )?
        };
        package.verify_wasm(&bytes)?;
        write_atomic(path, &bytes)?;
        Ok(bytes)
    }
}

/// `@lumis-sh/wasm-rust` becomes `rust`, so cache filenames stay readable.
///
/// `None` for anything that is not a valid npm package name, or whose suffix
/// would not be a single path component. The result names a file under the
/// cache and source directories, and [`LanguageStore`] takes the package name
/// from its caller, so `..` or a separator here would escape both.
#[must_use]
pub fn package_suffix(package_name: &str) -> Option<&str> {
    validate_package_name(package_name).ok()?;
    let suffix = package_name
        .strip_prefix("@lumis-sh/wasm-")
        .unwrap_or(package_name);
    (!suffix.contains('/')).then_some(suffix)
}

/// npm allows at most 214 characters, no leading `.` or `_`, no uppercase, and
/// only URL-unreserved characters, optionally under one `@scope/`.
fn validate_package_name(package_name: &str) -> Result<(), StoreError> {
    let invalid = || StoreError::InvalidPackageName(package_name.to_string());

    if package_name.is_empty() || package_name.len() > 214 {
        return Err(invalid());
    }

    let segments = match package_name.strip_prefix('@') {
        Some(scoped) => {
            let (scope, unscoped) = scoped.split_once('/').ok_or_else(invalid)?;
            [scope, unscoped]
        }
        None => [package_name, ""],
    };

    for segment in segments.into_iter().filter(|segment| !segment.is_empty()) {
        let starts_well =
            segment.starts_with(|first: char| first.is_ascii_lowercase() || first.is_ascii_digit());
        let body_is_safe = segment.bytes().all(|byte| {
            byte.is_ascii_lowercase() || byte.is_ascii_digit() || b"-._".contains(&byte)
        });
        if !starts_well || !body_is_safe {
            return Err(invalid());
        }
    }

    if segments[0].is_empty() || (package_name.starts_with('@') && segments[1].is_empty()) {
        return Err(invalid());
    }

    Ok(())
}

/// CDN-relative path to a package's parser, shared by every mirror.
fn parser_path(package: &LanguagePackage) -> String {
    format!(
        "{}@{}/{}.wasm",
        package.package_name, package.version, package.parser.name
    )
}

/// Content-addressed parser filename: name, version and digest.
#[must_use]
pub fn parser_filename(package: &LanguagePackage) -> String {
    format!(
        "{}-{}-{}.wasm",
        package.parser.name, package.version, package.parser.sha256
    )
}

fn parse_package(bytes: &[u8], package_name: &str) -> Result<LanguagePackage, StoreError> {
    let json = std::str::from_utf8(bytes).map_err(|_| StoreError::NotUtf8)?;
    let package = LanguagePackage::from_json(json)?;
    if package.package_name != package_name {
        return Err(StoreError::PackageNameMismatch {
            expected: package_name.to_string(),
            actual: package.package_name,
        });
    }
    Ok(package)
}

fn read_package_file(path: &Path, package_name: &str) -> Option<LanguagePackage> {
    let bytes = std::fs::read(path).ok()?;
    parse_package(&bytes, package_name).ok()
}

fn cache_is_fresh(path: &Path, ttl: Duration) -> bool {
    std::fs::metadata(path)
        .and_then(|metadata| metadata.modified())
        .and_then(|modified| modified.elapsed().map_err(std::io::Error::other))
        .is_ok_and(|elapsed| elapsed < ttl)
}

/// Replace `path` atomically, so a reader never sees a partial file.
///
/// # Errors
/// Fails when the parent cannot be created, or the file cannot be written or moved.
pub fn write_atomic(path: &Path, bytes: &[u8]) -> Result<(), StoreError> {
    use std::io::Write;

    let parent = path.parent().ok_or_else(|| {
        StoreError::io(
            format!("cache path has no parent: {}", path.display()),
            std::io::Error::other("no parent"),
        )
    })?;
    std::fs::create_dir_all(parent)
        .map_err(|error| StoreError::io(format!("could not create {}", parent.display()), error))?;

    let context = || format!("failed to cache asset at {}", path.display());
    let mut file = tempfile::NamedTempFile::new_in(parent)
        .map_err(|error| StoreError::io(context(), error))?;
    file.write_all(bytes)
        .map_err(|error| StoreError::io(context(), error))?;

    // Windows refuses to replace a file another handle still has open. Retrying
    // keeps this atomic; remove-then-rename would not.
    let mut pending = file;
    for attempt in 0..REPLACE_ATTEMPTS {
        match pending.persist(path) {
            Ok(_) => return Ok(()),
            Err(error)
                if attempt + 1 < REPLACE_ATTEMPTS
                    && matches!(
                        error.error.kind(),
                        std::io::ErrorKind::PermissionDenied | std::io::ErrorKind::AlreadyExists
                    ) =>
            {
                pending = error.file;
                std::thread::sleep(REPLACE_RETRY_DELAY);
            }
            Err(error) => return Err(StoreError::io(context(), error.error)),
        }
    }
    unreachable!("the loop returns on the final attempt")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::package::{sha256_hex, PackagedLanguage, ParserMetadata};
    use std::collections::BTreeMap;

    const WASM: &[u8] = b"parser-bytes";

    fn package() -> LanguagePackage {
        LanguagePackage {
            package_name: "@lumis-sh/wasm-json".into(),
            version: "1.2.3".into(),
            definition_hash: "hash".into(),
            parser: ParserMetadata {
                name: "tree-sitter-json".into(),
                grammar_name: "json".into(),
                upstream_version: None,
                revision: None,
                sha256: sha256_hex(WASM),
                size: WASM.len(),
            },
            languages: BTreeMap::from([(
                "json".into(),
                PackagedLanguage {
                    aliases: vec![],
                    highlights: "(string) @string".into(),
                    ..PackagedLanguage::default()
                },
            )]),
        }
    }

    struct Canned(Vec<u8>);
    impl Fetcher for Canned {
        fn get(&self, _url: &str) -> Result<Vec<u8>, String> {
            Ok(self.0.clone())
        }
    }

    /// Fails every request to the primary CDN, serves the rest.
    struct PrimaryDown {
        bytes: Vec<u8>,
        tried: Mutex<Vec<String>>,
    }

    impl Fetcher for PrimaryDown {
        fn get(&self, url: &str) -> Result<Vec<u8>, String> {
            self.tried.lock().unwrap().push(url.to_string());
            if url.starts_with(CDNS[0]) {
                return Err("503".to_string());
            }
            Ok(self.bytes.clone())
        }
    }

    fn make(dir: &Path, fetcher: Box<dyn Fetcher>) -> LanguageStore {
        LanguageStore::new(
            StoreConfig {
                cache_dir: dir.to_path_buf(),
                source_dir: None,
            },
            fetcher,
        )
    }

    #[test]
    fn a_parser_is_fetched_from_the_mirror_when_the_primary_is_down() {
        let dir = tempdir();
        let fetcher = Box::new(PrimaryDown {
            bytes: WASM.to_vec(),
            tried: Mutex::new(Vec::new()),
        });
        let store = make(dir.path(), fetcher);

        assert_eq!(store.parser(&package()).unwrap(), WASM);
    }

    #[test]
    fn every_cdn_failure_is_reported_together() {
        let dir = tempdir();
        let store = make(dir.path(), Box::new(NoNetwork));
        let error = store.parser(&package()).unwrap_err().to_string();
        assert!(
            error.contains("parser WASM @lumis-sh/wasm-json@1.2.3"),
            "the error must name what failed: {error}"
        );
        assert_eq!(
            error.matches("network access is disabled").count(),
            1,
            "one shared reason must be stated once: {error}"
        );
    }

    #[test]
    fn parser_filenames_are_content_addressed() {
        let name = parser_filename(&package());
        assert!(name.starts_with("tree-sitter-json-1.2.3-"));
        assert!(name.ends_with(".wasm"));
    }

    #[test]
    fn package_suffix_strips_the_scope() {
        assert_eq!(package_suffix("@lumis-sh/wasm-rust"), Some("rust"));
        assert_eq!(package_suffix("something-else"), Some("something-else"));
    }

    /// `LanguageStore::package` is public and takes the name from its caller,
    /// so a name that is not a package name must never become a path.
    #[test]
    fn package_names_cannot_escape_the_configured_directories() {
        let escapes = [
            "../../escape",
            "..",
            ".",
            "./relative",
            "/absolute",
            "@lumis-sh/wasm-../../escape",
            "@lumis-sh/../escape",
            "@../..",
            "sub/dir",
            "back\\slash",
            "..%2fencoded",
            "UPPERCASE",
            ".leading-dot",
            "_leading-underscore",
            "",
            "@lumis-sh/",
            "@/wasm-json",
            "@noslash",
        ];

        let dir = tempdir();
        let store = make(dir.path(), Box::new(NoNetwork));

        for name in escapes {
            assert_eq!(package_suffix(name), None, "{name} must have no cache name");
            assert!(
                matches!(
                    store.package_path(name),
                    Err(StoreError::InvalidPackageName(_))
                ),
                "{name} must not resolve to a path"
            );
            assert!(store.package(name).is_err(), "{name} must not be fetchable");
            assert!(
                store.local_package(name).is_none(),
                "{name} must not be readable"
            );
        }

        for name in ["@lumis-sh/wasm-json", "json", "tree-sitter-json", "c99"] {
            assert!(package_suffix(name).is_some(), "{name} is a usable name");
        }

        // Every catalog entry has to survive the same check.
        for entry in crate::catalog::LANGUAGES {
            assert!(
                package_suffix(entry.package_name).is_some(),
                "{} is rejected by its own validator",
                entry.package_name
            );
        }
    }

    /// `LanguagePackage` has public fields, so `validate` runs only on the JSON
    /// path. A caller that builds one directly reaches the store having skipped
    /// it, and every store method that derives a path has to refuse it itself.
    #[test]
    fn a_directly_constructed_package_cannot_escape_the_cache() {
        struct AnyBytes(Vec<u8>);
        impl Fetcher for AnyBytes {
            fn get(&self, _url: &str) -> Result<Vec<u8>, String> {
                Ok(self.0.clone())
            }
        }

        for field in ["parser.name", "version"] {
            let dir = tempdir();
            let store = make(dir.path(), Box::new(AnyBytes(WASM.to_vec())));

            // Never parsed from JSON, so `validate` has not run on it.
            let mut hostile = package();
            if field == "parser.name" {
                hostile.parser.name = "../../escaped".into();
            } else {
                hostile.version = "../../escaped".into();
            }
            assert!(hostile.validate().is_err(), "{field} is invalid");

            assert!(store.parser_path(&hostile).is_err(), "{field}: parser_path");
            assert!(store.parser(&hostile).is_err(), "{field}: parser");
            assert!(
                store.refresh_parser(&hostile).is_err(),
                "{field}: refresh_parser"
            );
            assert!(
                store.cache_package(&hostile).is_err(),
                "{field}: cache_package"
            );
            assert!(
                LanguageStore::parser_url(&hostile).is_err(),
                "{field}: parser_url"
            );
            assert!(
                store.local_parser(&hostile).is_none(),
                "{field}: local_parser"
            );
            assert!(
                store.cached_parser(&hostile).is_none(),
                "{field}: cached_parser"
            );

            // Nothing may appear outside the cache directory it was given.
            let escaped: Vec<_> = std::fs::read_dir(dir.path().parent().unwrap())
                .unwrap()
                .filter_map(|entry| entry.ok())
                .map(|entry| entry.file_name().to_string_lossy().into_owned())
                .filter(|name| name.contains("escaped"))
                .collect();
            assert!(
                escaped.is_empty(),
                "{field} wrote outside the cache: {escaped:?}"
            );
        }

        // The valid package still works, so this is not blanket rejection.
        let dir = tempdir();
        let store = make(dir.path(), Box::new(AnyBytes(WASM.to_vec())));
        assert!(store.parser_path(&package()).is_ok());
        assert!(store.parser(&package()).is_ok());
    }

    /// `parser_filename` and the CDN path are built from the fetched JSON, so a
    /// hostile package must not be able to choose where its bytes are written.
    #[test]
    fn package_fields_that_would_escape_are_rejected() {
        for value in ["../../../evil", "/etc/passwd", ".", "..", "a/b", ""] {
            let mut named = package();
            named.parser.name = value.into();
            let bytes = serde_json::to_vec(&named).unwrap();
            assert!(
                parse_package(&bytes, "@lumis-sh/wasm-json").is_err(),
                "parser name '{value}' must be rejected"
            );

            let mut versioned = package();
            versioned.version = value.into();
            let bytes = serde_json::to_vec(&versioned).unwrap();
            assert!(
                parse_package(&bytes, "@lumis-sh/wasm-json").is_err(),
                "version '{value}' must be rejected"
            );
        }

        let bytes = serde_json::to_vec(&package()).unwrap();
        assert!(parse_package(&bytes, "@lumis-sh/wasm-json").is_ok());
    }

    #[test]
    fn parser_url_pins_the_exact_version() {
        let url = LanguageStore::parser_url(&package()).unwrap();
        assert!(url.contains("@lumis-sh/wasm-json@1.2.3/"));
        assert!(!url.contains("@latest"));
    }

    #[test]
    fn a_corrupt_local_parser_is_deleted_rather_than_returned() {
        let dir = tempdir();
        let store = make(dir.path(), Box::new(NoNetwork));
        let package = package();
        let path = store.parser_path(&package).unwrap();
        write_atomic(&path, b"corrupt").unwrap();

        assert!(store.local_parser(&package).is_none());
        assert!(!path.exists(), "a failing parser must not be left behind");
    }

    #[test]
    fn a_verified_parser_round_trips() {
        let dir = tempdir();
        let store = make(dir.path(), Box::new(Canned(WASM.to_vec())));
        let package = package();

        assert_eq!(store.parser(&package).unwrap(), WASM);
        // Second call is served from disk, so it must succeed without the network.
        let from_disk = make(dir.path(), Box::new(NoNetwork));
        assert_eq!(from_disk.parser(&package).unwrap(), WASM);
    }

    #[test]
    fn fetched_parser_bytes_are_verified_before_use() {
        let dir = tempdir();
        let store = make(dir.path(), Box::new(Canned(b"wrong".to_vec())));
        assert!(matches!(
            store.parser(&package()),
            Err(StoreError::Package(_))
        ));
    }

    #[test]
    fn a_package_naming_someone_else_is_rejected() {
        let dir = tempdir();
        let json = serde_json::to_vec(&package()).unwrap();
        let store = make(dir.path(), Box::new(Canned(json)));
        assert!(matches!(
            store.package("@lumis-sh/wasm-rust"),
            Err(StoreError::PackageNameMismatch { .. })
        ));
    }

    /// Node prefers an installed `@lumis-sh/wasm-*` package over its cache and Elixir
    /// prefers release-local `priv/wasm`, so a configured source must outrank a fresh
    /// cache here too. Otherwise the same inputs resolve differently per runtime.
    #[test]
    fn a_configured_source_outranks_a_fresh_cache() {
        let dir = tempdir();
        let source = tempdir();
        let name = "@lumis-sh/wasm-json";

        let cached = package();
        let store_a = make(dir.path(), Box::new(NoNetwork));
        write_atomic(
            &store_a.package_path(name).unwrap(),
            &serde_json::to_vec(&cached).unwrap(),
        )
        .unwrap();
        assert_eq!(store_a.package(name).unwrap().version, "1.2.3");

        let mut from_source = package();
        from_source.version = "from-source".into();
        std::fs::create_dir_all(source.path().join("parsers")).unwrap();
        std::fs::write(
            source.path().join("parsers").join("json.language.json"),
            serde_json::to_vec(&from_source).unwrap(),
        )
        .unwrap();

        let store_b = LanguageStore::new(
            StoreConfig {
                cache_dir: dir.path().to_path_buf(),
                source_dir: Some(source.path().to_path_buf()),
            },
            Box::new(NoNetwork),
        );
        assert_eq!(
            store_b.package(name).unwrap().version,
            "from-source",
            "a configured local source must win over a fresh cache"
        );
    }

    /// The property that lets the file lock go: many processes writing the same
    /// cache path at once converge, because each writes a PID-suffixed temporary
    /// and renames it over, and parser bytes are verified before that rename.
    #[test]
    fn concurrent_writers_converge_without_a_lock() {
        let dir = tempdir();
        let target = dir.path().join("parsers").join("contended.wasm");
        let threads: Vec<_> = (0..16)
            .map(|_| {
                let target = target.clone();
                std::thread::spawn(move || write_atomic(&target, WASM))
            })
            .collect();

        for thread in threads {
            thread
                .join()
                .expect("writer panicked")
                .expect("write failed");
        }

        assert_eq!(std::fs::read(&target).unwrap(), WASM);
        // No temporary files left behind for a reader to trip over.
        let leftovers: Vec<_> = std::fs::read_dir(target.parent().unwrap())
            .unwrap()
            .filter_map(|entry| entry.ok())
            .map(|entry| entry.file_name().to_string_lossy().into_owned())
            .filter(|name| name.ends_with(".tmp"))
            .collect();
        assert!(leftovers.is_empty(), "temporary files left: {leftovers:?}");
    }

    /// A reader must never observe a partially written file.
    ///
    /// The reader yields between reads rather than holding a handle continuously:
    /// on Windows a permanently open handle blocks the replacing rename outright,
    /// which tests the retry budget rather than the atomicity this is about.
    #[test]
    fn a_reader_sees_either_the_old_or_the_new_bytes() {
        const OLD: &[u8] = b"old";
        const NEW: &[u8] = b"new-and-longer";

        let dir = tempdir();
        let target = dir.path().join("swap.bin");
        write_atomic(&target, OLD).unwrap();

        use std::sync::atomic::{AtomicBool, Ordering};

        let done = Arc::new(AtomicBool::new(false));
        let seen_old = Arc::new(AtomicBool::new(false));
        let seen_new = Arc::new(AtomicBool::new(false));
        let reader = {
            let target = target.clone();
            let done = Arc::clone(&done);
            let seen_old = Arc::clone(&seen_old);
            let seen_new = Arc::clone(&seen_new);
            std::thread::spawn(move || {
                while !done.load(Ordering::Relaxed) {
                    match std::fs::read(&target) {
                        Ok(bytes) if bytes == OLD => seen_old.store(true, Ordering::Relaxed),
                        Ok(bytes) if bytes == NEW => seen_new.store(true, Ordering::Relaxed),
                        // A miss is fine; a third value means a torn read.
                        Ok(bytes) => panic!("torn read: {bytes:?}"),
                        Err(_) => {}
                    }
                    std::thread::yield_now();
                }
            })
        };

        // Swap until the reader has caught both states rather than a fixed number of
        // times, which on a fast machine can finish before it is ever scheduled.
        let deadline = std::time::Instant::now() + Duration::from_secs(30);
        while !(seen_old.load(Ordering::Relaxed) && seen_new.load(Ordering::Relaxed)) {
            assert!(
                std::time::Instant::now() < deadline,
                "the reader never observed both states, so this proved nothing"
            );
            write_atomic(&target, NEW).unwrap();
            write_atomic(&target, OLD).unwrap();
        }
        done.store(true, Ordering::Relaxed);
        reader.join().unwrap();
    }

    /// A cache that holds a parser but not its metadata cannot be used offline,
    /// so `cache_language` writes both.
    #[test]
    fn caching_a_language_leaves_the_cache_self_sufficient() {
        let dir = tempdir();
        let package = package();
        let served = serde_json::to_vec(&package).unwrap();

        struct Serve {
            package: Vec<u8>,
        }
        impl Fetcher for Serve {
            fn get(&self, url: &str) -> Result<Vec<u8>, String> {
                if url.ends_with(".wasm") {
                    return Ok(WASM.to_vec());
                }
                Ok(self.package.clone())
            }
        }

        let store = make(dir.path(), Box::new(Serve { package: served }));
        let path = store.cache_language("json", false).unwrap();
        assert_eq!(std::fs::read(&path).unwrap(), WASM);

        let offline = make(dir.path(), Box::new(NoNetwork));
        assert_eq!(offline.parser(&package).unwrap(), WASM);
        assert_eq!(
            offline.package("@lumis-sh/wasm-json").unwrap().version,
            "1.2.3"
        );
    }

    /// A parser staged in a source directory belongs in the cache too; a release
    /// that runs `cache` must not still need that directory.
    #[test]
    fn caching_copies_a_staged_parser_into_the_cache() {
        let cache = tempdir();
        let source = tempdir();
        let package = package();
        std::fs::create_dir_all(source.path().join("parsers")).unwrap();
        std::fs::write(
            source.path().join("parsers").join("json.language.json"),
            serde_json::to_vec(&package).unwrap(),
        )
        .unwrap();
        std::fs::write(
            source
                .path()
                .join("parsers")
                .join(parser_filename(&package)),
            WASM,
        )
        .unwrap();

        let store = LanguageStore::new(
            StoreConfig {
                cache_dir: cache.path().to_path_buf(),
                source_dir: Some(source.path().to_path_buf()),
            },
            Box::new(NoNetwork),
        );
        store.cache_language("json", false).unwrap();

        let offline = make(cache.path(), Box::new(NoNetwork));
        assert_eq!(offline.parser(&package).unwrap(), WASM);
    }

    fn tempdir() -> tempfile::TempDir {
        tempfile::tempdir().unwrap()
    }
}

//! Resolve, verify and cache language packages and parser WASM on disk.
//!
//! Every native runtime needs the same state machine: consult a configured local
//! source, fall back to a persistent cache, fetch from the CDN as a last resort,
//! verify the bytes before use, and write atomically under a lock so concurrent
//! processes cannot tear each other's files. It lives here once so the CLI and the
//! Elixir NIF cannot drift apart.
//!
//! Networking is behind [`Fetcher`] so a host can supply its own HTTP client, or
//! none at all in tests.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime};

use thiserror::Error;

use crate::package::{LanguagePackage, LanguagePackageError};

/// How long a cached `language.json` is trusted before it is refreshed.
pub const PACKAGE_CACHE_TTL: Duration = Duration::from_secs(60 * 60);
/// How long to wait for another process to release a cache lock.
pub const LOCK_TIMEOUT: Duration = Duration::from_secs(120);
/// When a lock file is old enough that its owner is presumed dead.
///
/// Deliberately longer than [`LOCK_TIMEOUT`]: a process that dies holding the lock
/// makes its peers fail for the difference rather than wait forever.
pub const LOCK_STALE_AFTER: Duration = Duration::from_secs(300);

const CDN: &str = "https://cdn.jsdelivr.net/npm";

#[derive(Debug, Error)]
pub enum StoreError {
    #[error("unknown language '{0}'")]
    UnknownLanguage(String),
    #[error("language package '{0}' is not cached and offline mode is enabled")]
    OfflinePackage(String),
    #[error("parser WASM for '{0}' is not cached and offline mode is enabled")]
    OfflineParser(String),
    #[error("language package name mismatch: expected '{expected}', got '{actual}'")]
    PackageNameMismatch { expected: String, actual: String },
    #[error("language package is not UTF-8 JSON")]
    NotUtf8,
    #[error("timed out waiting for cache lock: {0}")]
    LockTimeout(String),
    #[error("{context}: {source}")]
    Io {
        context: String,
        #[source]
        source: std::io::Error,
    },
    #[error("could not fetch {url}: {message}")]
    Fetch { url: String, message: String },
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

/// A [`Fetcher`] that refuses every request, for offline hosts and tests.
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
    /// Optional pre-staged source, consulted **before** the cache.
    ///
    /// An explicitly configured local source outranks a cached copy in every
    /// runtime: Node resolves an installed `@lumis-sh/wasm-*` package first and
    /// Elixir reads release-local `priv/wasm` first. Consulting the cache first
    /// would let one runtime pick a different package than another for the same
    /// inputs, and so produce different output.
    pub source_dir: Option<PathBuf>,
    /// Refuse any network access.
    pub offline: bool,
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

    /// Read `LUMIS_WASM_OFFLINE`, the switch every runtime honours.
    #[must_use]
    pub fn offline_from_env() -> bool {
        std::env::var("LUMIS_WASM_OFFLINE")
            .is_ok_and(|value| matches!(value.to_ascii_lowercase().as_str(), "1" | "true"))
    }

    /// Read `LUMIS_WASM_SOURCE_DIR`, the pre-staged asset directory.
    #[must_use]
    pub fn source_dir_from_env() -> Option<PathBuf> {
        std::env::var_os("LUMIS_WASM_SOURCE_DIR").map(PathBuf::from)
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

        let path = self.package_path(package_name);
        let package = with_cache_lock(&path, || {
            if let Some(package) = self.read_source_package(package_name)? {
                return Ok(package);
            }

            let cached = read_package_file(&path, package_name);
            if cache_is_fresh(&path, PACKAGE_CACHE_TTL) || self.config.offline {
                if let Some(package) = cached.as_ref() {
                    return Ok(package.clone());
                }
            }
            if self.config.offline {
                return Err(StoreError::OfflinePackage(package_name.to_string()));
            }

            // A stale copy still beats no highlighting when the CDN is unreachable.
            match self.fetch_package(package_name, &path) {
                Ok(package) => Ok(package),
                Err(error) => cached.ok_or(error),
            }
        })?;

        Ok(self.remember(package_name, package))
    }

    /// The package for `package_name` if it is already in memory or on disk.
    ///
    /// Never touches the network, so callers can render from cache alone.
    #[must_use]
    pub fn cached_package(&self, package_name: &str) -> Option<Arc<LanguagePackage>> {
        if let Some(package) = self.memo(package_name) {
            return Some(package);
        }
        let package = read_package_file(&self.package_path(package_name), package_name)?;
        Some(self.remember(package_name, package))
    }

    /// Verified parser bytes for `package`, from local source, cache, or the CDN.
    ///
    /// # Errors
    /// Fails when the parser cannot be obtained, or its bytes do not match the
    /// size and digest the package declares.
    pub fn parser(&self, package: &LanguagePackage) -> Result<Vec<u8>, StoreError> {
        if let Some(bytes) = self.cached_parser(package) {
            return Ok(bytes);
        }
        let path = self.parser_path(package);
        with_cache_lock(&path, || {
            // Another process may have written it while we waited for the lock.
            if let Some(bytes) = self.cached_parser(package) {
                return Ok(bytes);
            }
            self.fetch_parser(package, &path)
        })
    }

    /// Verified parser bytes already on disk, if any.
    ///
    /// A file that fails verification is deleted rather than returned, so a corrupt
    /// cache repairs itself on the next call.
    #[must_use]
    pub fn cached_parser(&self, package: &LanguagePackage) -> Option<Vec<u8>> {
        let path = self.parser_path(package);
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
        let path = self.parser_path(package);
        with_cache_lock(&path, || self.fetch_parser(package, &path))
    }

    /// Path a verified parser is cached at. Content-addressed, so upgrading a
    /// package never overwrites an older verified asset.
    #[must_use]
    pub fn parser_path(&self, package: &LanguagePackage) -> PathBuf {
        self.config
            .cache_dir
            .join("parsers")
            .join(parser_filename(package))
    }

    #[must_use]
    pub fn package_path(&self, package_name: &str) -> PathBuf {
        self.config
            .cache_dir
            .join("parsers")
            .join(format!("{}.language.json", package_suffix(package_name)))
    }

    /// Exact-version CDN URL for this package's parser.
    #[must_use]
    pub fn parser_url(package: &LanguagePackage) -> String {
        format!(
            "{CDN}/{}@{}/{}.wasm",
            package.package_name, package.version, package.parser.name
        )
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

    /// Deliberately does not write to the cache: the local source is consulted
    /// first on every call, so a copy would only add something that can go stale.
    fn read_source_package(
        &self,
        package_name: &str,
    ) -> Result<Option<LanguagePackage>, StoreError> {
        let Some(source) =
            self.source_asset(&format!("{}.language.json", package_suffix(package_name)))
        else {
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
        let url = format!("{CDN}/{package_name}@latest/language.json");
        let bytes = self
            .fetcher
            .get(&url)
            .map_err(|message| StoreError::Fetch {
                url: url.clone(),
                message,
            })?;
        let package = parse_package(&bytes, package_name)?;
        write_atomic(path, &bytes)?;
        Ok(package)
    }

    fn fetch_parser(&self, package: &LanguagePackage, path: &Path) -> Result<Vec<u8>, StoreError> {
        let bytes = if let Some(source) = self.source_asset(&parser_filename(package)) {
            std::fs::read(&source).map_err(|error| {
                StoreError::io(format!("could not read {}", source.display()), error)
            })?
        } else if self.config.offline {
            return Err(StoreError::OfflineParser(package.parser.name.clone()));
        } else {
            let url = Self::parser_url(package);
            self.fetcher
                .get(&url)
                .map_err(|message| StoreError::Fetch {
                    url: url.clone(),
                    message,
                })?
        };
        package.verify_wasm(&bytes)?;
        write_atomic(path, &bytes)?;
        Ok(bytes)
    }
}

/// `@lumis-sh/wasm-rust` becomes `rust`, so cache filenames stay readable.
#[must_use]
pub fn package_suffix(package_name: &str) -> &str {
    package_name
        .strip_prefix("@lumis-sh/wasm-")
        .unwrap_or(package_name)
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
    let json = std::fs::read_to_string(path).ok()?;
    let package = LanguagePackage::from_json(&json).ok()?;
    (package.package_name == package_name).then_some(package)
}

fn cache_is_fresh(path: &Path, ttl: Duration) -> bool {
    std::fs::metadata(path)
        .and_then(|metadata| metadata.modified())
        .and_then(|modified| modified.elapsed().map_err(std::io::Error::other))
        .is_ok_and(|elapsed| elapsed < ttl)
}

/// Write via a temporary file and rename, so a reader never sees a partial file.
///
/// # Errors
/// Fails when the parent cannot be created or the rename cannot be completed.
pub fn write_atomic(path: &Path, bytes: &[u8]) -> Result<(), StoreError> {
    let parent = path.parent().ok_or_else(|| {
        StoreError::io(
            format!("cache path has no parent: {}", path.display()),
            std::io::Error::other("no parent"),
        )
    })?;
    std::fs::create_dir_all(parent)
        .map_err(|error| StoreError::io(format!("could not create {}", parent.display()), error))?;

    let temporary = parent.join(format!(
        ".{}.{}.tmp",
        path.file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("asset"),
        std::process::id()
    ));

    let result = (|| -> Result<(), std::io::Error> {
        std::fs::write(&temporary, bytes)?;
        if let Err(error) = std::fs::rename(&temporary, path) {
            // Windows refuses to rename onto an existing file.
            if matches!(
                error.kind(),
                std::io::ErrorKind::AlreadyExists | std::io::ErrorKind::PermissionDenied
            ) {
                std::fs::remove_file(path)?;
                std::fs::rename(&temporary, path)?;
            } else {
                return Err(error);
            }
        }
        Ok(())
    })();
    let _ = std::fs::remove_file(&temporary);
    result.map_err(|error| {
        StoreError::io(
            format!("failed to cache asset at {}", path.display()),
            error,
        )
    })
}

/// Run `operation` holding an exclusive lock beside `path`.
///
/// # Errors
/// Fails when the lock cannot be taken within [`LOCK_TIMEOUT`], or from `operation`.
pub fn with_cache_lock<T>(
    path: &Path,
    operation: impl FnOnce() -> Result<T, StoreError>,
) -> Result<T, StoreError> {
    lock_acquire(path)?;
    let result = operation();
    lock_release(path);
    result
}

/// Take the cache lock for `path`, blocking until it is free or stale.
///
/// Exposed separately for hosts that cannot pass a closure across their FFI
/// boundary, such as the Elixir NIF. Pair every call with [`lock_release`].
///
/// # Errors
/// Fails when the lock cannot be taken within [`LOCK_TIMEOUT`].
pub fn lock_acquire(path: &Path) -> Result<(), StoreError> {
    let lock_path = path.with_extension("lock");
    if let Some(parent) = lock_path.parent() {
        std::fs::create_dir_all(parent).map_err(|error| {
            StoreError::io(format!("could not create {}", parent.display()), error)
        })?;
    }
    let deadline = SystemTime::now() + LOCK_TIMEOUT;

    loop {
        match std::fs::OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&lock_path)
        {
            Ok(lock) => {
                drop(lock);
                return Ok(());
            }
            Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => {
                if cache_is_fresh(&lock_path, LOCK_STALE_AFTER) {
                    if SystemTime::now() >= deadline {
                        return Err(StoreError::LockTimeout(lock_path.display().to_string()));
                    }
                    std::thread::sleep(Duration::from_millis(25));
                } else {
                    // The owner is presumed dead; take the lock over.
                    let _ = std::fs::remove_file(&lock_path);
                }
            }
            Err(error) => return Err(StoreError::io("failed to lock cache", error)),
        }
    }
}

/// Release a lock taken with [`lock_acquire`]. Safe to call when it is already gone.
pub fn lock_release(path: &Path) {
    let _ = std::fs::remove_file(path.with_extension("lock"));
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

    fn make(dir: &Path, fetcher: Box<dyn Fetcher>, offline: bool) -> LanguageStore {
        LanguageStore::new(
            StoreConfig {
                cache_dir: dir.to_path_buf(),
                source_dir: None,
                offline,
            },
            fetcher,
        )
    }

    #[test]
    fn parser_filenames_are_content_addressed() {
        let name = parser_filename(&package());
        assert!(name.starts_with("tree-sitter-json-1.2.3-"));
        assert!(name.ends_with(".wasm"));
    }

    #[test]
    fn package_suffix_strips_the_scope() {
        assert_eq!(package_suffix("@lumis-sh/wasm-rust"), "rust");
        assert_eq!(package_suffix("something-else"), "something-else");
    }

    #[test]
    fn parser_url_pins_the_exact_version() {
        let url = LanguageStore::parser_url(&package());
        assert!(url.contains("@lumis-sh/wasm-json@1.2.3/"));
        assert!(!url.contains("@latest"));
    }

    #[test]
    fn a_corrupt_cached_parser_is_deleted_rather_than_returned() {
        let dir = tempdir();
        let store = make(dir.path(), Box::new(NoNetwork), true);
        let package = package();
        let path = store.parser_path(&package);
        write_atomic(&path, b"corrupt").unwrap();

        assert!(store.cached_parser(&package).is_none());
        assert!(!path.exists(), "a failing parser must not be left behind");
    }

    #[test]
    fn a_verified_parser_round_trips() {
        let dir = tempdir();
        let store = make(dir.path(), Box::new(Canned(WASM.to_vec())), false);
        let package = package();

        assert_eq!(store.parser(&package).unwrap(), WASM);
        // Second call is served from disk, so it must succeed without the network.
        let offline = make(dir.path(), Box::new(NoNetwork), true);
        assert_eq!(offline.parser(&package).unwrap(), WASM);
    }

    #[test]
    fn fetched_parser_bytes_are_verified_before_use() {
        let dir = tempdir();
        let store = make(dir.path(), Box::new(Canned(b"wrong".to_vec())), false);
        assert!(matches!(
            store.parser(&package()),
            Err(StoreError::Package(_))
        ));
    }

    #[test]
    fn offline_refuses_an_uncached_parser() {
        let dir = tempdir();
        let store = make(dir.path(), Box::new(NoNetwork), true);
        assert!(matches!(
            store.parser(&package()),
            Err(StoreError::OfflineParser(_))
        ));
    }

    #[test]
    fn a_package_naming_someone_else_is_rejected() {
        let dir = tempdir();
        let json = serde_json::to_vec(&package()).unwrap();
        let store = make(dir.path(), Box::new(Canned(json)), false);
        assert!(matches!(
            store.package("@lumis-sh/wasm-rust"),
            Err(StoreError::PackageNameMismatch { .. })
        ));
    }

    #[test]
    fn a_stale_lock_is_taken_over() {
        let dir = tempdir();
        let target = dir.path().join("asset.json");
        let lock = target.with_extension("lock");
        std::fs::write(&lock, b"").unwrap();
        // Backdate it well past the staleness threshold.
        let old = SystemTime::now() - LOCK_STALE_AFTER - Duration::from_secs(60);
        filetime::set_file_mtime(&lock, filetime::FileTime::from_system_time(old)).unwrap();

        let ran = with_cache_lock(&target, || Ok(42)).unwrap();
        assert_eq!(ran, 42);
        assert!(!lock.exists(), "the lock must be released");
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
        let store_a = make(dir.path(), Box::new(NoNetwork), true);
        write_atomic(
            &store_a.package_path(name),
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
                offline: true,
            },
            Box::new(NoNetwork),
        );
        assert_eq!(
            store_b.package(name).unwrap().version,
            "from-source",
            "a configured local source must win over a fresh cache"
        );
    }

    fn tempdir() -> tempfile::TempDir {
        tempfile::tempdir().unwrap()
    }
}

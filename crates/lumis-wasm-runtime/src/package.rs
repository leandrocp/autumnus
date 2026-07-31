//! Self-contained language package metadata shared by every native runtime.

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::BTreeMap;
use thiserror::Error;

/// A language package as published inside `@lumis-sh/wasm-*`.
///
/// There is deliberately **no `formatVersion` gate here**. Runtimes resolve this
/// document from a floating tag, so a hard version equality check would break every
/// already-deployed client the moment a new version was published, with no way to
/// negotiate. Compatibility is decided by the document's shape instead: neither
/// runtime rejects unknown fields, so additive changes are already safe, and a
/// change that removes or renames a required field fails `validate` with a message
/// naming the field.
///
/// That makes the format additive-only by contract. A change that alters the
/// *meaning* of an existing field without changing its shape cannot be detected
/// here and must be shipped as a new field instead.
///
/// The published npm `package.json` still carries `lumis.formatVersion`. That one is
/// release tooling (`dev wasm-needed`) deciding whether an artifact needs
/// republishing; no client reads it.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LanguagePackage {
    pub package_name: String,
    pub version: String,
    pub definition_hash: String,
    pub parser: ParserMetadata,
    pub languages: BTreeMap<String, PackagedLanguage>,
}

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ParserMetadata {
    pub name: String,
    pub grammar_name: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub upstream_version: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub revision: Option<String>,
    pub sha256: String,
    pub size: usize,
}

#[derive(Clone, Debug, Default, Deserialize, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PackagedLanguage {
    // Deliberately not `#[serde(default)]`: the JavaScript validator requires
    // `aliases`, so tolerating its absence would accept packages Node rejects.
    pub aliases: Vec<String>,
    pub highlights: String,
    #[serde(default, skip_serializing_if = "String::is_empty")]
    pub injections: String,
    #[serde(default, skip_serializing_if = "String::is_empty")]
    pub locals: String,
    #[serde(default, skip_serializing_if = "String::is_empty")]
    pub brackets: String,
}

#[derive(Debug, Error)]
pub enum LanguagePackageError {
    #[error("invalid language package JSON: {0}")]
    Json(#[from] serde_json::Error),
    #[error("language package is missing {0}")]
    Missing(&'static str),
    #[error("language package has invalid {0}")]
    Invalid(&'static str),
    #[error("language '{language}' is not provided by {package}")]
    LanguageNotFound { language: String, package: String },
    #[error("invalid parser WASM size for '{parser}': expected {expected}, got {actual}")]
    InvalidSize {
        parser: String,
        expected: usize,
        actual: usize,
    },
    #[error(
        "invalid parser WASM integrity for '{parser}': expected sha256-{expected}, got sha256-{actual}"
    )]
    InvalidIntegrity {
        parser: String,
        expected: String,
        actual: String,
    },
}

impl LanguagePackage {
    pub fn from_json(json: &str) -> Result<Self, LanguagePackageError> {
        let package: Self = serde_json::from_str(json)?;
        package.validate()?;
        Ok(package)
    }

    pub fn validate(&self) -> Result<(), LanguagePackageError> {
        for (value, field) in [
            (&self.package_name, "packageName"),
            (&self.version, "version"),
            (&self.definition_hash, "definitionHash"),
            (&self.parser.name, "parser.name"),
            (&self.parser.grammar_name, "parser.grammarName"),
            (&self.parser.sha256, "parser.sha256"),
        ] {
            if value.is_empty() {
                return Err(LanguagePackageError::Missing(field));
            }
        }
        if self.languages.is_empty() {
            return Err(LanguagePackageError::Missing("languages"));
        }
        if !is_safe_path_segment(&self.version) {
            return Err(LanguagePackageError::Invalid("version"));
        }
        if !is_safe_path_segment(&self.parser.name) {
            return Err(LanguagePackageError::Invalid("parser.name"));
        }
        if self.parser.sha256.len() != 64
            || !self
                .parser
                .sha256
                .bytes()
                .all(|byte| matches!(byte, b'0'..=b'9' | b'a'..=b'f'))
        {
            return Err(LanguagePackageError::Invalid("parser.sha256"));
        }
        // Otherwise this surfaces much later as a confusing `InvalidSize` from
        // `verify_wasm`, and only for runtimes that reach that point.
        if self.parser.size == 0 {
            return Err(LanguagePackageError::Invalid("parser.size"));
        }
        Ok(())
    }

    pub fn language(&self, name: &str) -> Option<(&str, &PackagedLanguage)> {
        self.languages
            .iter()
            .find(|(id, language)| {
                id.eq_ignore_ascii_case(name)
                    || language
                        .aliases
                        .iter()
                        .any(|alias| alias.eq_ignore_ascii_case(name))
            })
            .map(|(id, language)| (id.as_str(), language))
    }

    pub fn require_language(
        &self,
        name: &str,
    ) -> Result<(&str, &PackagedLanguage), LanguagePackageError> {
        self.language(name)
            .ok_or_else(|| LanguagePackageError::LanguageNotFound {
                language: name.to_string(),
                package: self.package_name.clone(),
            })
    }

    pub fn verify_wasm(&self, bytes: &[u8]) -> Result<(), LanguagePackageError> {
        if bytes.len() != self.parser.size {
            return Err(LanguagePackageError::InvalidSize {
                parser: self.parser.name.clone(),
                expected: self.parser.size,
                actual: bytes.len(),
            });
        }

        let actual = sha256_hex(bytes);
        if actual != self.parser.sha256 {
            return Err(LanguagePackageError::InvalidIntegrity {
                parser: self.parser.name.clone(),
                expected: self.parser.sha256.clone(),
                actual,
            });
        }
        Ok(())
    }

    #[cfg(feature = "wasm")]
    pub fn language_spec(
        &self,
        name: &str,
        wasm: Vec<u8>,
    ) -> Result<crate::LanguageSpec, LanguagePackageError> {
        self.verify_wasm(&wasm)?;
        let (id, language) = self.require_language(name)?;
        Ok(crate::LanguageSpec {
            id: id.to_string(),
            aliases: language.aliases.clone(),
            grammar_name: self.parser.grammar_name.clone(),
            wasm,
            highlights: language.highlights.clone(),
            injections: language.injections.clone(),
            locals: language.locals.clone(),
            brackets: language.brackets.clone(),
        })
    }
}

/// Returns the lowercase hexadecimal SHA-256 digest used by language packages.
pub fn sha256_hex(bytes: &[u8]) -> String {
    const HEX: &[u8; 16] = b"0123456789abcdef";

    let digest = Sha256::digest(bytes);
    let mut output = String::with_capacity(digest.len() * 2);
    for byte in digest {
        output.push(HEX[(byte >> 4) as usize] as char);
        output.push(HEX[(byte & 0x0f) as usize] as char);
    }
    output
}

fn is_safe_path_segment(value: &str) -> bool {
    !matches!(value, "" | "." | "..") && !value.contains(['/', '\\', '\0'])
}

#[cfg(test)]
mod tests {
    use super::*;

    fn package() -> LanguagePackage {
        LanguagePackage {
            package_name: "@lumis-sh/wasm-json".into(),
            version: "0.26.3".into(),
            definition_hash: "definition".into(),
            parser: ParserMetadata {
                name: "tree-sitter-json".into(),
                grammar_name: "json".into(),
                upstream_version: None,
                revision: None,
                sha256: sha256_hex(b"wasm"),
                size: 4,
            },
            languages: BTreeMap::from([(
                "json".into(),
                PackagedLanguage {
                    aliases: vec!["jsonc".into()],
                    highlights: "(string) @string".into(),
                    ..PackagedLanguage::default()
                },
            )]),
        }
    }

    #[test]
    fn resolves_ids_and_aliases() {
        let package = package();
        assert_eq!(package.require_language("json").unwrap().0, "json");
        assert_eq!(package.require_language("JSONC").unwrap().0, "json");
    }

    #[test]
    fn sha256_uses_lowercase_hex() {
        assert_eq!(
            sha256_hex(b"wasm"),
            "336154bf67f765f8f75d16a0accee61b5ee5f6a75b2a2905703df913bd550f3e"
        );
    }

    #[test]
    fn parser_provenance_is_optional_for_existing_packages() {
        let json = serde_json::to_string(&package()).unwrap();
        let parsed = LanguagePackage::from_json(&json).unwrap();

        assert_eq!(parsed.parser.upstream_version, None);
        assert_eq!(parsed.parser.revision, None);
    }

    #[test]
    fn rejects_wrong_parser_bytes() {
        let package = package();
        assert!(matches!(
            package.verify_wasm(b"bad"),
            Err(LanguagePackageError::InvalidSize { .. })
        ));
        assert!(package.verify_wasm(b"wasm").is_ok());
    }

    #[test]
    fn rejects_metadata_that_could_escape_the_cache_directory() {
        for (field, value) in [
            ("version", "../version"),
            ("parser.name", "../tree-sitter-json"),
        ] {
            let mut package = package();
            match field {
                "version" => package.version = value.into(),
                "parser.name" => package.parser.name = value.into(),
                _ => unreachable!(),
            }
            assert!(matches!(
                package.validate(),
                Err(LanguagePackageError::Invalid(actual)) if actual == field
            ));
        }
    }
}

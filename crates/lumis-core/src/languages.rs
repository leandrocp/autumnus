//! Language detection and metadata.
//!
//! This module provides the [`Language`] enum that represents all supported programming
//! languages. It includes automatic language detection based on file extensions,
//! file names, content analysis, and shebangs.
//!
//! This module is independent of tree-sitter. For tree-sitter configuration,
//! see the `lumis` crate's `languages` module.

// Guess Language copied from https://github.com/Wilfred/difftastic/blob/f34a9014760efbaed01b972caba8b73754da16c9/src/parse/guess_language.rs

use regex::Regex;
use std::collections::HashMap;
use std::path::Path;
use std::sync::LazyLock;

/// Declarative macro that generates the `Language` enum, iteration, `FromStr`,
/// `name()`, `id_name()`, `language_globs()`, `from_emacs_mode_header()`,
/// `from_shebang()`, and `available_languages()` — all with `#[cfg(feature)]`
/// gates on the gated variants.
macro_rules! define_languages {
    (
        always {
            $(
                $a_variant:ident {
                    id: $a_id:expr,
                    name: $a_name:expr,
                    from_str: [$($a_str:expr),* $(,)?],
                    globs: [$($a_glob:expr),* $(,)?],
                    emacs: [$($a_emacs:expr),* $(,)?],
                    shebang: [$($a_shebang:expr),* $(,)?]
                }
            ),* $(,)?
        }
        gated {
            $(
                [$g_feat:expr] $g_variant:ident {
                    id: $g_id:expr,
                    name: $g_name:expr,
                    from_str: [$($g_str:expr),* $(,)?],
                    globs: [$($g_glob:expr),* $(,)?],
                    emacs: [$($g_emacs:expr),* $(,)?],
                    shebang: [$($g_shebang:expr),* $(,)?]
                }
            ),* $(,)?
        }
    ) => {
        #[derive(Clone, Copy, Debug, Eq, Hash, PartialEq)]
        pub enum Language {
            $(
                $a_variant,
            )*
            $(
                #[cfg(feature = $g_feat)]
                $g_variant,
            )*
        }

        impl Default for Language {
            fn default() -> Self {
                Language::PlainText
            }
        }

        impl Language {
            /// Returns an iterator over all compiled-in language variants.
            pub fn iter() -> impl Iterator<Item = Language> {
                let always: &[Language] = &[
                    $(Language::$a_variant,)*
                ];
                let gated: &[Language] = &[
                    $(
                        #[cfg(feature = $g_feat)]
                        Language::$g_variant,
                    )*
                ];
                always.iter().copied().chain(gated.iter().copied())
            }

            pub fn language_globs(language: Language) -> Vec<glob::Pattern> {
                let glob_strs: &'static [&'static str] = match language {
                    $(
                        Language::$a_variant => &[$($a_glob),*],
                    )*
                    $(
                        #[cfg(feature = $g_feat)]
                        Language::$g_variant => &[$($g_glob),*],
                    )*
                };

                glob_strs
                    .iter()
                    .map(|name| glob::Pattern::new(name).expect("failed to guess language by path"))
                    .collect()
            }

            pub fn name(&self) -> &'static str {
                match self {
                    $(
                        Language::$a_variant => $a_name,
                    )*
                    $(
                        #[cfg(feature = $g_feat)]
                        Language::$g_variant => $g_name,
                    )*
                }
            }

            pub fn id_name(&self) -> &'static str {
                match self {
                    $(
                        Language::$a_variant => $a_id,
                    )*
                    $(
                        #[cfg(feature = $g_feat)]
                        Language::$g_variant => $g_id,
                    )*
                }
            }

            fn from_emacs_mode_header(src: &str) -> Option<Language> {
                static MODE_RE: LazyLock<Regex> =
                    LazyLock::new(|| Regex::new(r"-\*-.*mode:([^;]+?);.*-\*-").unwrap());
                static SHORTHAND_RE: LazyLock<Regex> =
                    LazyLock::new(|| Regex::new(r"-\*-(.+)-\*-").unwrap());

                for line in split_on_newlines(src).take(2) {
                    let mode_name: String = match (MODE_RE.captures(line), SHORTHAND_RE.captures(line)) {
                        (Some(cap), _) | (_, Some(cap)) => cap[1].into(),
                        _ => "".into(),
                    };
                    let lang = match mode_name.to_ascii_lowercase().trim() {
                        $(
                            $($a_emacs => Some(Language::$a_variant),)*
                        )*
                        $(
                            $(
                                #[cfg(feature = $g_feat)]
                                $g_emacs => Some(Language::$g_variant),
                            )*
                        )*
                        _ => None,
                    };
                    if lang.is_some() {
                        return lang;
                    }
                }

                None
            }

            fn from_shebang(src: &str) -> Option<Language> {
                static RE: LazyLock<Regex> =
                    LazyLock::new(|| Regex::new(r"#! *(?:/usr/bin/env )?([^ ]+)").unwrap());

                if let Some(first_line) = split_on_newlines(src).next() {
                    if let Some(cap) = RE.captures(first_line) {
                        let interpreter_path = Path::new(&cap[1]);
                        if let Some(name) = interpreter_path.file_name() {
                            match name.to_string_lossy().as_ref() {
                                $(
                                    $($a_shebang => return Some(Language::$a_variant),)*
                                )*
                                $(
                                    $(
                                        #[cfg(feature = $g_feat)]
                                        $g_shebang => return Some(Language::$g_variant),
                                    )*
                                )*
                                _ => {}
                            }
                        }
                    }
                }

                None
            }
        }

        impl std::str::FromStr for Language {
            type Err = LanguageParseError;

            fn from_str(s: &str) -> Result<Self, Self::Err> {
                if s.is_empty() {
                    return Ok(Language::PlainText);
                }

                let s_lower = s.to_ascii_lowercase();

                let exact = match s_lower.as_str() {
                    $(
                        $($a_str => Some(Language::$a_variant),)*
                    )*
                    $(
                        $(
                            #[cfg(feature = $g_feat)]
                            $g_str => Some(Language::$g_variant),
                        )*
                    )*
                    _ => None,
                };

                if let Some(lang) = exact {
                    return Ok(lang);
                }

                let path = Path::new(&s_lower);

                if let Some(lang) = Language::from_glob(path) {
                    return Ok(lang);
                }

                if let Some(lang) = Language::from_extension(&s_lower) {
                    return Ok(lang);
                }

                Err(LanguageParseError(s.to_string()))
            }
        }

        /// Returns a HashMap containing all supported languages with their details.
        pub fn available_languages() -> HashMap<String, (String, Vec<String>)> {
            let mut languages = HashMap::new();

            for language in Language::iter() {
                let id_name = language.id_name();
                let friendly_name = language.name().to_string();
                let extensions: Vec<String> = Language::language_globs(language)
                    .iter()
                    .map(|p| p.to_string())
                    .collect();

                languages.insert(id_name.to_string(), (friendly_name, extensions));
            }

            languages
        }
    };
}

include!(concat!(env!("OUT_DIR"), "/languages_data.rs"));

/// Error returned when a language cannot be determined from input.
///
/// This error occurs when using [`std::str::FromStr`] or the `.parse()` method
/// with an unrecognized language name, file extension, or file path.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LanguageParseError(String);

impl std::fmt::Display for LanguageParseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "unknown language or file type: {}", self.0)
    }
}

impl std::error::Error for LanguageParseError {}

impl Language {
    /// Guess the language based on an optional language hint and source content.
    ///
    /// # Arguments
    ///
    /// * `language` - Optional language hint. Can be:
    ///   - `None`: Try to auto-detect language from source content
    ///   - `Some(s)`: Language name, file extension, or file path
    /// * `src` - The source code content to analyze
    ///
    /// # Detection Strategy
    ///
    /// When `language` is `Some(...)`:
    /// 1. Try to parse as language name/extension/path via `FromStr`
    /// 2. If parsing succeeds, return that language
    /// 3. If parsing fails, fall through to content-based detection
    ///
    /// When `language` is `None` or parsing fails:
    /// 1. Check for Emacs mode header (`// -*- mode: rust -*-`)
    /// 2. Check for shebang (`#!/usr/bin/env python`)
    /// 3. Apply content heuristics (HTML doctype, XML declaration, etc.)
    /// 4. Default to `PlainText` if nothing matches
    pub fn guess(language: Option<&str>, src: &str) -> Self {
        if let Some(input) = language {
            if let Ok(lang) = input.parse() {
                return lang;
            }
        }

        if let Some(lang) = Self::from_emacs_mode_header(src) {
            return lang;
        }

        if let Some(lang) = Self::from_shebang(src) {
            return lang;
        }

        #[cfg(feature = "lang-html")]
        if Self::looks_like_html(src) {
            return Language::HTML;
        }

        #[cfg(feature = "lang-xml")]
        if Self::looks_like_xml(src) {
            return Language::XML;
        }

        #[cfg(feature = "lang-objc")]
        if Self::looks_like_objc(Path::new(""), src) {
            return Language::ObjC;
        }

        Language::PlainText
    }

    fn from_glob(path: &Path) -> Option<Self> {
        match path.file_name() {
            Some(name) => {
                let name = name.to_string_lossy().into_owned();
                for language in Language::iter() {
                    for glob in Language::language_globs(language) {
                        if glob.matches(&name) {
                            return Some(language);
                        }
                    }
                }

                None
            }
            None => None,
        }
    }

    fn from_extension(token: &str) -> Option<Self> {
        let token_pattern = format!("*.{token}");

        for language in Language::iter() {
            for glob in Language::language_globs(language) {
                if glob.matches(&token_pattern) {
                    return Some(language);
                }
            }
        }
        None
    }

    #[allow(dead_code)]
    fn looks_like_objc(path: &Path, src: &str) -> bool {
        if let Some(extension) = path.extension() {
            if extension == "h" {
                return split_on_newlines(src).take(100).any(|line| {
                    ["#import", "@interface", "@protocol"]
                        .iter()
                        .any(|keyword| line.starts_with(keyword))
                });
            }
        }

        false
    }

    #[allow(dead_code)]
    fn looks_like_xml(src: &str) -> bool {
        src.to_lowercase().starts_with("<?xml")
    }

    #[allow(dead_code)]
    fn looks_like_html(src: &str) -> bool {
        src.to_lowercase().starts_with("<!doctype html")
    }
}

impl std::fmt::Display for Language {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.id_name())
    }
}

fn split_on_newlines(s: &str) -> impl Iterator<Item = &str> {
    s.split('\n').map(|l| {
        if let Some(l) = l.strip_suffix('\r') {
            l
        } else {
            l
        }
    })
}

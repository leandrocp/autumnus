// Guess Language copied from https://github.com/Wilfred/difftastic/blob/f34a9014760efbaed01b972caba8b73754da16c9/src/parse/guess_language.rs

use crate::constants::HIGHLIGHT_NAMES;
use lazy_static::lazy_static;
use regex::Regex;
use std::borrow::Borrow;
use std::{path::Path, sync::LazyLock};
use strum::{EnumIter, IntoEnumIterator};
use tree_sitter_highlight::HighlightConfiguration;

#[derive(Debug, Clone, Copy, PartialEq, Eq, EnumIter)]
pub(crate) enum Language {
    PlainText,
    Diff,
    Elixir,
    Rust,
    Html,
}

impl Language {
    pub fn guess(lang_or_path: &str, source: &str) -> Self {
        let exact = match lang_or_path {
            "elixir" => Some(Language::Elixir),
            "rust" => Some(Language::Rust),
            "html" => Some(Language::Html),
            "diff" => Some(Language::Diff),
            _ => None,
        };

        match exact {
            Some(lang) => lang,
            None => {
                // TODO: guess by looks_like, xml, emacs header

                let path = Path::new(lang_or_path);

                if let Some(lang) = Language::from_glob(path) {
                    return lang;
                }

                if let Some(lang) = Language::from_shebang(source) {
                    return lang;
                }

                Language::PlainText
            }
        }
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

    fn language_globs(language: Language) -> Vec<glob::Pattern> {
        let glob_strs: &'static [&'static str] = match language {
            Language::PlainText => &[],
            Language::Diff => &["*.diff"],
            Language::Elixir => &["*.ex", "*.exs"],
            Language::Rust => &["*.rs"],
            Language::Html => &["*.html", "*.htm", "*.xhtml"],
        };

        glob_strs
            .iter()
            .map(|name| glob::Pattern::new(name).expect("failed to guess language by path"))
            .collect()
    }

    fn from_shebang(src: &str) -> Option<Language> {
        lazy_static! {
            static ref RE: Regex = Regex::new(r"#! *(?:/usr/bin/env )?([^ ]+)").unwrap();
        }
        if let Some(first_line) = Language::split_on_newlines(src).next() {
            if let Some(cap) = RE.captures(first_line) {
                let interpreter_path = Path::new(&cap[1]);
                if let Some(name) = interpreter_path.file_name() {
                    match name.to_string_lossy().borrow() {
                        "elixir" => return Some(Language::Elixir),
                        _ => {}
                    }
                }
            }
        }

        None
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

    pub fn name(&self) -> &'static str {
        match self {
            Language::PlainText => "Plain Text",
            Language::Diff => "Diff",
            Language::Elixir => "Elixir",
            Language::Rust => "Rust",
            Language::Html => "HTML",
        }
    }

    pub fn id_name(&self) -> String {
        self.name().to_ascii_lowercase().replace(" ", "")
    }

    pub fn config(&self) -> &'static HighlightConfiguration {
        match self {
            Language::Diff => &DIFF_CONFIG,
            Language::Elixir => &ELIXIR_CONFIG,
            Language::Rust => &RUST_CONFIG,
            Language::Html => &HTML_CONFIG,
            _ => &PLAIN_TEXT_CONFIG,
        }
    }
}

static PLAIN_TEXT_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_diff::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "plaintext",
        "",
        "",
        "",
    )
    .expect("failed to create plaintext highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static DIFF_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_diff::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "diff",
        tree_sitter_diff::HIGHLIGHTS_QUERY,
        "",
        "",
    )
    .expect("failed to create plaintext highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static ELIXIR_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_elixir::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "elixir",
        tree_sitter_elixir::HIGHLIGHTS_QUERY,
        tree_sitter_elixir::INJECTIONS_QUERY,
        "",
    )
    .expect("failed to create elixir highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static RUST_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_rust::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "rust",
        tree_sitter_rust::HIGHLIGHTS_QUERY,
        tree_sitter_rust::INJECTIONS_QUERY,
        "",
    )
    .expect("failed to create rust highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static HTML_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_html::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "html",
        tree_sitter_html::HIGHLIGHTS_QUERY,
        tree_sitter_html::INJECTIONS_QUERY,
        "",
    )
    .expect("failed to create html highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

#[cfg(test)]
mod tests {
    use super::*;
    use tree_sitter_highlight::Highlighter;

    #[test]
    fn test_match_exact_name() {
        let lang = Language::guess("elixir", "");
        assert_eq!(lang.name(), "Elixir");
    }

    #[test]
    fn test_no_match_fallbacks_to_plain_text() {
        let lang = Language::guess("none", "");
        assert_eq!(lang.name(), "Plain Text");
    }

    #[test]
    fn test_diff() {
        let lang = Language::guess("diff", "");
        let mut highlighter = Highlighter::new();

        let _ = highlighter
            .highlight(lang.config(), "".as_bytes(), None, |_| None)
            .unwrap();
    }

    #[test]
    fn test_elixir() {
        let lang = Language::guess("elixir", "");
        let mut highlighter = Highlighter::new();

        let _ = highlighter
            .highlight(lang.config(), "".as_bytes(), None, |_| None)
            .unwrap();
    }

    #[test]
    fn test_rust() {
        let lang = Language::guess("rust", "");
        let mut highlighter = Highlighter::new();

        let _ = highlighter
            .highlight(lang.config(), "".as_bytes(), None, |_| None)
            .unwrap();
    }

    #[test]
    fn test_html() {
        let lang = Language::guess("html", "");
        let mut highlighter = Highlighter::new();

        let _ = highlighter
            .highlight(lang.config(), "".as_bytes(), None, |_| None)
            .unwrap();
    }
}

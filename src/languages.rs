use crate::constants::HIGHLIGHT_NAMES;
use std::sync::LazyLock;
use tree_sitter_highlight::HighlightConfiguration;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum Language {
    PlainText,
    Diff,
    Elixir,
}

impl Language {
    pub fn guess(lang_or_path: &str, _source: &str) -> Self {
        let exact = match lang_or_path {
            "elixir" => Some(Language::Elixir),
            "diff" => Some(Language::Diff),
            _ => None,
        };

        match exact {
            Some(lang) => lang,
            // TODO: try to guess by path or source, otherwise fallback to PlainText
            None => Language::PlainText,
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            Language::PlainText => "Plain Text",
            Language::Diff => "Diff",
            Language::Elixir => "Elixir",
        }
    }

    pub fn id_name(&self) -> String {
        self.name().to_ascii_lowercase().replace(" ", "")
    }

    pub fn config(&self) -> &'static HighlightConfiguration {
        match self {
            Language::Diff => &*DIFF_CONFIG,
            Language::Elixir => &*ELIXIR_CONFIG,
            _ => &*PLAIN_TEXT_CONFIG,
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_diff() {
        let mut parser = tree_sitter::Parser::new();
        let lang = tree_sitter::Language::new(tree_sitter_diff::LANGUAGE);
        parser
            .set_language(&lang)
            .expect("failed to set language diff");
        parser.parse(b"test", None).expect("failed to parse diff");
    }

    #[test]
    fn test_elixir() {
        let mut parser = tree_sitter::Parser::new();
        let lang = tree_sitter::Language::new(tree_sitter_elixir::LANGUAGE);
        parser
            .set_language(&lang)
            .expect("failed to set language elixir");
        parser.parse(b"test", None).expect("failed to parse elixir");
    }

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
}

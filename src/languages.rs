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
    Lua,
    Bash,
    Ruby,
    Php,
    Swift,
    C,
    Cpp,
}

impl Language {
    pub fn guess(lang_or_path: &str, source: &str) -> Self {
        let exact = match lang_or_path {
            "elixir" => Some(Language::Elixir),
            "rust" => Some(Language::Rust),
            "html" => Some(Language::Html),
            "lua" => Some(Language::Lua),
            "bash" => Some(Language::Bash),
            "ruby" => Some(Language::Ruby),
            "php" => Some(Language::Php),
            "swift" => Some(Language::Swift),
            "c" => Some(Language::C),
            "cpp" => Some(Language::Cpp),
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
            Language::Lua => &["*.lua"],
            Language::Bash => &[
                "*.bash",
                "*.bats",
                "*.cgi",
                "*.command",
                "*.env",
                "*.fcgi",
                "*.ksh",
                "*.sh",
                "*.sh.in",
                "*.tmux",
                "*.tool",
                "*.zsh",
                ".bash_aliases",
                ".bash_history",
                ".bash_logout",
                ".bash_profile",
                ".bashrc",
                ".cshrc",
                ".env",
                ".env.example",
                ".flaskenv",
                ".kshrc",
                ".login",
                ".profile",
                ".zlogin",
                ".zlogout",
                ".zprofile",
                ".zshenv",
                ".zshrc",
                "9fs",
                "PKGBUILD",
                "bash_aliases",
                "bash_logout",
                "bash_profile",
                "bashrc",
                "cshrc",
                "gradlew",
                "kshrc",
                "login",
                "man",
                "profile",
                "zlogin",
                "zlogout",
                "zprofile",
                "zshenv",
                "zshrc",
            ],
            Language::Ruby => &[
                "*.rb",
                "*.builder",
                "*.spec",
                "*.rake",
                "Gemfile",
                "Rakefile",
            ],
            Language::Php => &[
                "*.php", "*.phtml", "*.php3", "*.php4", "*.php5", "*.php7", "*.phps",
            ],
            Language::Swift => &["*.swift"],
            Language::C => &["*.c"],
            Language::Cpp => &[
                "*.cc", "*.cpp", "*.h", "*.hh", "*.hpp", "*.ino", "*.cxx", "*.cu",
            ],
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
                        "ash" | "bash" | "dash" | "ksh" | "mksh" | "pdksh" | "rc" | "sh"
                        | "zsh" => return Some(Language::Bash),
                        "elixir" => return Some(Language::Elixir),
                        "ruby" | "macruby" | "rake" | "jruby" | "rbx" => {
                            return Some(Language::Ruby)
                        }
                        "swift" => return Some(Language::Swift),
                        "tcc" => return Some(Language::C),
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
            Language::Lua => "Lua",
            Language::Bash => "Bash",
            Language::Ruby => "Ruby",
            Language::Php => "PHP",
            Language::Swift => "Swift",
            Language::C => "C",
            Language::Cpp => "C++",
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
            Language::Lua => &LUA_CONFIG,
            Language::Bash => &BASH_CONFIG,
            Language::Ruby => &RUBY_CONFIG,
            Language::Php => &PHP_CONFIG,
            Language::Swift => &SWIFT_CONFIG,
            Language::C => &C_CONFIG,
            Language::Cpp => &CPP_CONFIG,
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

static LUA_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_lua::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "lua",
        tree_sitter_lua::HIGHLIGHTS_QUERY,
        tree_sitter_lua::INJECTIONS_QUERY,
        tree_sitter_lua::LOCALS_QUERY,
    )
    .expect("failed to create lua highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static BASH_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_bash::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "bash",
        tree_sitter_bash::HIGHLIGHT_QUERY,
        "",
        "",
    )
    .expect("failed to create bash highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static RUBY_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_ruby::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "ruby",
        tree_sitter_ruby::HIGHLIGHTS_QUERY,
        "",
        tree_sitter_ruby::LOCALS_QUERY,
    )
    .expect("failed to create ruby highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static PHP_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_php::LANGUAGE_PHP;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "php",
        tree_sitter_php::HIGHLIGHTS_QUERY,
        tree_sitter_php::INJECTIONS_QUERY,
        "",
    )
    .expect("failed to create php highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static SWIFT_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_swift::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "swift",
        tree_sitter_swift::HIGHLIGHTS_QUERY,
        tree_sitter_swift::INJECTIONS_QUERY,
        tree_sitter_swift::LOCALS_QUERY,
    )
    .expect("failed to create swift highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static C_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_c::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "c",
        tree_sitter_c::HIGHLIGHT_QUERY,
        "",
        "",
    )
    .expect("failed to create c highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static CPP_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_cpp::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "cpp",
        tree_sitter_cpp::HIGHLIGHT_QUERY,
        "",
        "",
    )
    .expect("failed to create cpp highlight configuration");
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

    #[test]
    fn test_lua() {
        let lang = Language::guess("lua", "");
        let mut highlighter = Highlighter::new();

        let _ = highlighter
            .highlight(lang.config(), "".as_bytes(), None, |_| None)
            .unwrap();
    }

    #[test]
    fn test_bash() {
        let lang = Language::guess("bash", "");
        let mut highlighter = Highlighter::new();

        let _ = highlighter
            .highlight(lang.config(), "".as_bytes(), None, |_| None)
            .unwrap();
    }

    #[test]
    fn test_ruby() {
        let lang = Language::guess("ruby", "");
        let mut highlighter = Highlighter::new();

        let _ = highlighter
            .highlight(lang.config(), "".as_bytes(), None, |_| None)
            .unwrap();
    }

    #[test]
    fn test_php() {
        let lang = Language::guess("php", "");
        let mut highlighter = Highlighter::new();

        let _ = highlighter
            .highlight(lang.config(), "".as_bytes(), None, |_| None)
            .unwrap();
    }

    #[test]
    fn test_swift() {
        let lang = Language::guess("swift", "");
        let mut highlighter = Highlighter::new();

        let _ = highlighter
            .highlight(lang.config(), "".as_bytes(), None, |_| None)
            .unwrap();
    }

    #[test]
    fn test_c() {
        let lang = Language::guess("c", "");
        let mut highlighter = Highlighter::new();

        let _ = highlighter
            .highlight(lang.config(), "".as_bytes(), None, |_| None)
            .unwrap();
    }

    #[test]
    fn test_cpp() {
        let lang = Language::guess("cpp", "");
        let mut highlighter = Highlighter::new();

        let _ = highlighter
            .highlight(lang.config(), "".as_bytes(), None, |_| None)
            .unwrap();
    }
}

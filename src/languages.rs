// Guess Language copied from https://github.com/Wilfred/difftastic/blob/f34a9014760efbaed01b972caba8b73754da16c9/src/parse/guess_language.rs

use crate::constants::HIGHLIGHT_NAMES;
use lazy_static::lazy_static;
use regex::Regex;
use std::borrow::Borrow;
use std::{path::Path, sync::LazyLock};
use strum::{EnumIter, IntoEnumIterator};
use tree_sitter_highlight::HighlightConfiguration;

extern "C" {
    fn tree_sitter_dockerfile() -> *const ();
}

mod generated {
    include!(concat!(env!("OUT_DIR"), "/queries_data.rs"));
}
pub use generated::*;

#[derive(Debug, Clone, Copy, PartialEq, Eq, EnumIter)]
pub enum Language {
    Bash,
    C,
    CSharp,
    Cpp,
    Css,
    Diff,
    Dockerfile,
    Elixir,
    Erlang,
    Heex,
    Html,
    Lua,
    Php,
    PlainText,
    Python,
    Ruby,
    Rust,
    Swift,
}

impl Language {
    pub fn guess(lang_or_path: &str, source: &str) -> Self {
        let exact = match lang_or_path {
            "bash" => Some(Language::Bash),
            "c" => Some(Language::C),
            "c#" => Some(Language::CSharp),
            "cpp" => Some(Language::Cpp),
            "csharp" => Some(Language::CSharp),
            "css" => Some(Language::Css),
            "diff" => Some(Language::Diff),
            "dockerfile" => Some(Language::Dockerfile),
            "docker" => Some(Language::Dockerfile),
            "elixir" => Some(Language::Elixir),
            "erlang" => Some(Language::Erlang),
            "heex" => Some(Language::Heex),
            "html" => Some(Language::Html),
            "lua" => Some(Language::Lua),
            "php" => Some(Language::Php),
            "python" => Some(Language::Python),
            "ruby" => Some(Language::Ruby),
            "rust" => Some(Language::Rust),
            "swift" => Some(Language::Swift),
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

    pub fn language_globs(language: Language) -> Vec<glob::Pattern> {
        let glob_strs: &'static [&'static str] = match language {
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
            Language::C => &["*.c"],
            Language::CSharp => &["*.cs"],
            Language::Cpp => &[
                "*.cc", "*.cpp", "*.h", "*.hh", "*.hpp", "*.ino", "*.cxx", "*.cu",
            ],
            Language::Css => &["*.css"],
            Language::Diff => &["*.diff"],
            Language::Dockerfile => &[
                "Dockerfile",
                "dockerfile",
                "docker",
                "Containerfile",
                "container",
                "*.dockerfile",
                "*.docker",
                "*.container",
            ],
            Language::Elixir => &["*.ex", "*.exs"],
            Language::Erlang => &[
                "*.erl",
                "*.app.src",
                "*.es",
                "*.escript",
                "*.hrl",
                "*.xrl",
                "*.yrl",
                "Emakefile",
            ],
            Language::Heex => &["*.heex", "*.neex"],
            Language::Html => &["*.html", "*.htm", "*.xhtml"],
            Language::Lua => &["*.lua"],
            Language::Php => &[
                "*.php", "*.phtml", "*.php3", "*.php4", "*.php5", "*.php7", "*.phps",
            ],
            Language::PlainText => &[],
            Language::Python => &["*.py", "*.py3", "*.pyi", "*.bzl", "TARGETS", "BUCK", "DEPS"],
            Language::Ruby => &[
                "*.rb",
                "*.builder",
                "*.spec",
                "*.rake",
                "Gemfile",
                "Rakefile",
            ],
            Language::Rust => &["*.rs"],
            Language::Swift => &["*.swift"],
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
                        "python" | "python2" | "python3" => return Some(Language::Python),
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
            Language::Bash => "Bash",
            Language::C => "C",
            Language::CSharp => "C#",
            Language::Cpp => "C++",
            Language::Css => "CSS",
            Language::Diff => "Diff",
            Language::Dockerfile => "Dockerfile",
            Language::Elixir => "Elixir",
            Language::Erlang => "Erlang",
            Language::Heex => "HEEx",
            Language::Html => "HTML",
            Language::Lua => "Lua",
            Language::Php => "PHP",
            Language::PlainText => "Plain Text",
            Language::Python => "Python",
            Language::Ruby => "Ruby",
            Language::Rust => "Rust",
            Language::Swift => "Swift",
        }
    }

    pub fn id_name(&self) -> String {
        self.name().to_ascii_lowercase().replace(" ", "")
    }

    pub fn config(&self) -> &'static HighlightConfiguration {
        match self {
            Language::Bash => &BASH_CONFIG,
            Language::C => &C_CONFIG,
            Language::CSharp => &CSHARP_CONFIG,
            Language::Cpp => &CPP_CONFIG,
            Language::Css => &CSS_CONFIG,
            Language::Diff => &DIFF_CONFIG,
            Language::Dockerfile => &DOCKERFILE_CONFIG,
            Language::Elixir => &ELIXIR_CONFIG,
            Language::Erlang => &ERLANG_CONFIG,
            Language::Heex => &HEEX_CONFIG,
            Language::Html => &HTML_CONFIG,
            Language::Lua => &LUA_CONFIG,
            Language::Php => &PHP_CONFIG,
            Language::Python => &PYTHON_CONFIG,
            Language::Ruby => &RUBY_CONFIG,
            Language::Rust => &RUST_CONFIG,
            Language::Swift => &SWIFT_CONFIG,
            _ => &PLAIN_TEXT_CONFIG,
        }
    }
}

static BASH_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_bash::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "bash",
        HIGHLIGHTS_BASH,
        include_str!("../queries/bash/injections.scm"),
        include_str!("../queries/bash/locals.scm"),
    )
    .expect("failed to create bash highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static C_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_c::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "c",
        HIGHLIGHTS_C,
        include_str!("../queries/c/injections.scm"),
        include_str!("../queries/c/locals.scm"),
    )
    .expect("failed to create c highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static CSHARP_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_c_sharp::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "csharp",
        HIGHLIGHTS_C_SHARP,
        include_str!("../queries/c_sharp/injections.scm"),
        include_str!("../queries/c_sharp/locals.scm"),
    )
    .expect("failed to create csharp highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static CPP_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_cpp::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "cpp",
        HIGHLIGHTS_CPP,
        include_str!("../queries/cpp/injections.scm"),
        format!(
            "{}\n{}",
            include_str!("../queries/c/locals.scm"),
            include_str!("../queries/cpp/locals.scm")
        )
        .as_str(),
    )
    .expect("failed to create cpp highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static CSS_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_css::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "css",
        HIGHLIGHTS_CSS,
        include_str!("../queries/css/injections.scm"),
        "",
    )
    .expect("failed to create css highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static DIFF_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_diff::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "diff",
        HIGHLIGHTS_DIFF,
        include_str!("../queries/diff/injections.scm"),
        "",
    )
    .expect("failed to create diff highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static DOCKERFILE_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = unsafe { tree_sitter_language::LanguageFn::from_raw(tree_sitter_dockerfile) };

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "dockerfile",
        HIGHLIGHTS_DOCKERFILE,
        include_str!("../queries/dockerfile/injections.scm"),
        "",
    )
    .expect("failed to create dockerfile highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static ELIXIR_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_elixir::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "elixir",
        HIGHLIGHTS_ELIXIR,
        include_str!("../queries/elixir/injections.scm"),
        include_str!("../queries/elixir/locals.scm"),
    )
    .expect("failed to create elixir highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static ERLANG_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_erlang::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "erlang",
        HIGHLIGHTS_ERLANG,
        include_str!("../queries/erlang/injections.scm"),
        "",
    )
    .expect("failed to create erlang highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static HEEX_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_heex::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "heex",
        HIGHLIGHTS_HEEX,
        include_str!("../queries/heex/injections.scm"),
        include_str!("../queries/heex/locals.scm"),
    )
    .expect("failed to create heex highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static HTML_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_html::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "html",
        HIGHLIGHTS_HTML,
        include_str!("../queries/html/injections.scm"),
        include_str!("../queries/html/locals.scm"),
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
        HIGHLIGHTS_LUA,
        include_str!("../queries/lua/injections.scm"),
        include_str!("../queries/lua/locals.scm"),
    )
    .expect("failed to create lua highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static PHP_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_php::LANGUAGE_PHP;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "php",
        HIGHLIGHTS_PHP,
        format!(
            "{}\n{}",
            include_str!("../queries/php_only/injections.scm"),
            include_str!("../queries/php/injections.scm")
        )
        .as_str(),
        format!(
            "{}\n{}",
            include_str!("../queries/php_only/locals.scm"),
            include_str!("../queries/php/locals.scm")
        )
        .as_str(),
    )
    .expect("failed to create php highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

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

static PYTHON_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_python::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "python",
        HIGHLIGHTS_PYTHON,
        include_str!("../queries/python/injections.scm"),
        include_str!("../queries/python/locals.scm"),
    )
    .expect("failed to create python highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static RUBY_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_ruby::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "ruby",
        HIGHLIGHTS_RUBY,
        include_str!("../queries/ruby/injections.scm"),
        include_str!("../queries/ruby/locals.scm"),
    )
    .expect("failed to create ruby highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static RUST_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_rust::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "rust",
        HIGHLIGHTS_RUST,
        include_str!("../queries/rust/injections.scm"),
        include_str!("../queries/rust/locals.scm"),
    )
    .expect("failed to create rust highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static SWIFT_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = tree_sitter_swift::LANGUAGE;

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "swift",
        HIGHLIGHTS_SWIFT,
        include_str!("../queries/swift/injections.scm"),
        include_str!("../queries/swift/locals.scm"),
    )
    .expect("failed to create swift highlight configuration");
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
    fn test_highlight_all_languages() {
        for language in Language::iter() {
            let name = Language::id_name(&language);
            let lang = Language::guess(&name, "");
            let mut highlighter = Highlighter::new();

            let _ = highlighter
                .highlight(lang.config(), "".as_bytes(), None, |_| None)
                .unwrap();
        }
    }
}

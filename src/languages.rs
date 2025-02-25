// Guess Language copied from https://github.com/Wilfred/difftastic/blob/f34a9014760efbaed01b972caba8b73754da16c9/src/parse/guess_language.rs

use crate::constants::HIGHLIGHT_NAMES;
use lazy_static::lazy_static;
use regex::Regex;
use std::borrow::Borrow;
use std::{path::Path, sync::LazyLock};
use strum::{EnumIter, IntoEnumIterator};
use tree_sitter_highlight::HighlightConfiguration;

extern "C" {
    fn tree_sitter_clojure() -> *const ();
    fn tree_sitter_dockerfile() -> *const ();
    fn tree_sitter_eex() -> *const ();
    fn tree_sitter_elm() -> *const ();
}

mod generated {
    include!(concat!(env!("OUT_DIR"), "/queries_data.rs"));
}
pub use generated::*;

#[derive(Debug, Clone, Copy, PartialEq, Eq, EnumIter)]
pub enum Language {
    Bash,
    C,
    Clojure,
    CSharp,
    Cpp,
    Css,
    Diff,
    Dockerfile,
    Eex,
    Elixir,
    Elm,
    Erlang,
    Gleam,
    Go,
    Haskell,
    Heex,
    Html,
    Java,
    Lua,
    Php,
    PlainText,
    Python,
    Ruby,
    Rust,
    Swift,
    Yaml,
    Zig,
}

impl Language {
    pub fn guess(lang_or_path: &str, source: &str) -> Self {
        let exact = match lang_or_path {
            "bash" => Some(Language::Bash),
            "c" => Some(Language::C),
            "clojure" => Some(Language::Clojure),
            "c#" => Some(Language::CSharp),
            "cpp" => Some(Language::Cpp),
            "csharp" => Some(Language::CSharp),
            "css" => Some(Language::Css),
            "diff" => Some(Language::Diff),
            "dockerfile" => Some(Language::Dockerfile),
            "docker" => Some(Language::Dockerfile),
            "eex" => Some(Language::Eex),
            "elixir" => Some(Language::Elixir),
            "elm" => Some(Language::Elm),
            "erlang" => Some(Language::Erlang),
            "gleam" => Some(Language::Gleam),
            "go" => Some(Language::Go),
            "haskell" => Some(Language::Haskell),
            "heex" => Some(Language::Heex),
            "html" => Some(Language::Html),
            "java" => Some(Language::Java),
            "lua" => Some(Language::Lua),
            "php" => Some(Language::Php),
            "python" => Some(Language::Python),
            "ruby" => Some(Language::Ruby),
            "rust" => Some(Language::Rust),
            "swift" => Some(Language::Swift),
            "yaml" => Some(Language::Yaml),
            "zig" => Some(Language::Zig),
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
            Language::Clojure => &[
                "*.bb", "*.boot", "*.clj", "*.cljc", "*.clje", "*.cljs", "*.cljx", "*.edn",
                "*.joke", "*.joker",
            ],
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
            Language::Eex => &["*.eex"],
            Language::Elixir => &["*.ex", "*.exs"],
            Language::Elm => &["*.elm"],
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
            Language::Gleam => &["*.gleam"],
            Language::Go => &["*.go"],
            Language::Haskell => &["*.hs"],
            Language::Heex => &["*.heex", "*.neex"],
            Language::Html => &["*.html", "*.htm", "*.xhtml"],
            Language::Java => &["*.java"],
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
            Language::Yaml => &["*.yaml", "*.yml"],
            Language::Zig => &["*.zig"],
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
                        "runghc" | "runhaskell" | "runhugs" => return Some(Language::Haskell),
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
            Language::Clojure => "Clojure",
            Language::CSharp => "C#",
            Language::Cpp => "C++",
            Language::Css => "CSS",
            Language::Diff => "Diff",
            Language::Dockerfile => "Dockerfile",
            Language::Eex => "Eex",
            Language::Elixir => "Elixir",
            Language::Elm => "Elm",
            Language::Erlang => "Erlang",
            Language::Gleam => "Gleam",
            Language::Go => "Go",
            Language::Haskell => "Haskell",
            Language::Heex => "HEEx",
            Language::Html => "HTML",
            Language::Java => "Java",
            Language::Lua => "Lua",
            Language::Php => "PHP",
            Language::PlainText => "Plain Text",
            Language::Python => "Python",
            Language::Ruby => "Ruby",
            Language::Rust => "Rust",
            Language::Swift => "Swift",
            Language::Yaml => "YAML",
            Language::Zig => "Zig",
        }
    }

    pub fn id_name(&self) -> String {
        self.name().to_ascii_lowercase().replace(" ", "")
    }

    pub fn config(&self) -> &'static HighlightConfiguration {
        match self {
            Language::Bash => &BASH_CONFIG,
            Language::C => &C_CONFIG,
            Language::Clojure => &CLOJURE_CONFIG,
            Language::CSharp => &CSHARP_CONFIG,
            Language::Cpp => &CPP_CONFIG,
            Language::Css => &CSS_CONFIG,
            Language::Diff => &DIFF_CONFIG,
            Language::Dockerfile => &DOCKERFILE_CONFIG,
            Language::Eex => &EEX_CONFIG,
            Language::Elixir => &ELIXIR_CONFIG,
            Language::Elm => &ELM_CONFIG,
            Language::Erlang => &ERLANG_CONFIG,
            Language::Gleam => &GLEAM_CONFIG,
            Language::Go => &GO_CONFIG,
            Language::Haskell => &HASKELL_CONFIG,
            Language::Heex => &HEEX_CONFIG,
            Language::Html => &HTML_CONFIG,
            Language::Java => &JAVA_CONFIG,
            Language::Lua => &LUA_CONFIG,
            Language::Php => &PHP_CONFIG,
            Language::Python => &PYTHON_CONFIG,
            Language::Ruby => &RUBY_CONFIG,
            Language::Rust => &RUST_CONFIG,
            Language::Swift => &SWIFT_CONFIG,
            Language::Yaml => &YAML_CONFIG,
            Language::Zig => &ZIG_CONFIG,
            _ => &PLAIN_TEXT_CONFIG,
        }
    }
}

static BASH_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_bash::LANGUAGE),
        "bash",
        BASH_HIGHLIGHTS,
        BASH_INJECTIONS,
        BASH_LOCALS,
    )
    .expect("failed to create bash highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static C_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_c::LANGUAGE),
        "c",
        C_HIGHLIGHTS,
        C_INJECTIONS,
        C_LOCALS,
    )
    .expect("failed to create c highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static CLOJURE_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = unsafe { tree_sitter_language::LanguageFn::from_raw(tree_sitter_clojure) };

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "clojure",
        CLOJURE_HIGHLIGHTS,
        CLOJURE_INJECTIONS,
        CLOJURE_LOCALS,
    )
    .expect("failed to create clojure highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static CSHARP_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_c_sharp::LANGUAGE),
        "csharp",
        C_SHARP_HIGHLIGHTS,
        C_SHARP_INJECTIONS,
        C_SHARP_LOCALS,
    )
    .expect("failed to create csharp highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static CPP_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_cpp::LANGUAGE),
        "cpp",
        CPP_HIGHLIGHTS,
        CPP_INJECTIONS,
        CPP_LOCALS,
    )
    .expect("failed to create cpp highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static CSS_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_css::LANGUAGE),
        "css",
        CSS_HIGHLIGHTS,
        CSS_INJECTIONS,
        CSS_LOCALS,
    )
    .expect("failed to create css highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static DIFF_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_diff::LANGUAGE),
        "diff",
        DIFF_HIGHLIGHTS,
        DIFF_INJECTIONS,
        DIFF_LOCALS,
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
        DOCKERFILE_HIGHLIGHTS,
        DOCKERFILE_INJECTIONS,
        DOCKERFILE_LOCALS,
    )
    .expect("failed to create dockerfile highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static EEX_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = unsafe { tree_sitter_language::LanguageFn::from_raw(tree_sitter_eex) };

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "eex",
        EEX_HIGHLIGHTS,
        EEX_INJECTIONS,
        EEX_LOCALS,
    )
    .expect("failed to create eex highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static ELIXIR_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_elixir::LANGUAGE),
        "elixir",
        ELIXIR_HIGHLIGHTS,
        ELIXIR_INJECTIONS,
        ELIXIR_LOCALS,
    )
    .expect("failed to create elixir highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static ELM_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let language_fn = unsafe { tree_sitter_language::LanguageFn::from_raw(tree_sitter_elm) };

    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(language_fn),
        "elm",
        ELM_HIGHLIGHTS,
        ELM_INJECTIONS,
        ELM_LOCALS,
    )
    .expect("failed to create elm highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static ERLANG_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_erlang::LANGUAGE),
        "erlang",
        ERLANG_HIGHLIGHTS,
        ERLANG_INJECTIONS,
        ERLANG_LOCALS,
    )
    .expect("failed to create erlang highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static GLEAM_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_gleam::LANGUAGE),
        "gleam",
        GLEAM_HIGHLIGHTS,
        GLEAM_INJECTIONS,
        GLEAM_LOCALS,
    )
    .expect("failed to create gleam highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static GO_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_go::LANGUAGE),
        "go",
        GO_HIGHLIGHTS,
        GO_INJECTIONS,
        GO_LOCALS,
    )
    .expect("failed to create go highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static HASKELL_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_haskell::LANGUAGE),
        "haskell",
        HASKELL_HIGHLIGHTS,
        HASKELL_INJECTIONS,
        HASKELL_LOCALS,
    )
    .expect("failed to create haskell highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static HEEX_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_heex::LANGUAGE),
        "heex",
        HEEX_HIGHLIGHTS,
        HEEX_INJECTIONS,
        HEEX_LOCALS,
    )
    .expect("failed to create heex highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static HTML_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_html::LANGUAGE),
        "html",
        HTML_HIGHLIGHTS,
        HTML_INJECTIONS,
        HTML_LOCALS,
    )
    .expect("failed to create html highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static JAVA_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_java::LANGUAGE),
        "java",
        JAVA_HIGHLIGHTS,
        JAVA_INJECTIONS,
        JAVA_LOCALS,
    )
    .expect("failed to create java highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static LUA_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_lua::LANGUAGE),
        "lua",
        LUA_HIGHLIGHTS,
        LUA_INJECTIONS,
        LUA_LOCALS,
    )
    .expect("failed to create lua highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static PHP_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_php::LANGUAGE_PHP),
        "php",
        PHP_HIGHLIGHTS,
        PHP_INJECTIONS,
        PHP_LOCALS,
    )
    .expect("failed to create php highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static PLAIN_TEXT_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_diff::LANGUAGE),
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
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_python::LANGUAGE),
        "python",
        PYTHON_HIGHLIGHTS,
        PYTHON_INJECTIONS,
        PYTHON_LOCALS,
    )
    .expect("failed to create python highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static RUBY_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_ruby::LANGUAGE),
        "ruby",
        RUBY_HIGHLIGHTS,
        RUBY_INJECTIONS,
        RUBY_LOCALS,
    )
    .expect("failed to create ruby highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static RUST_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_rust::LANGUAGE),
        "rust",
        RUST_HIGHLIGHTS,
        RUST_INJECTIONS,
        RUST_LOCALS,
    )
    .expect("failed to create rust highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static SWIFT_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_swift::LANGUAGE),
        "swift",
        SWIFT_HIGHLIGHTS,
        SWIFT_INJECTIONS,
        SWIFT_LOCALS,
    )
    .expect("failed to create swift highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static YAML_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_yaml::LANGUAGE),
        "yaml",
        YAML_HIGHLIGHTS,
        YAML_INJECTIONS,
        YAML_LOCALS,
    )
    .expect("failed to create yaml highlight configuration");
    config.configure(&HIGHLIGHT_NAMES);
    config
});

static ZIG_CONFIG: LazyLock<HighlightConfiguration> = LazyLock::new(|| {
    let mut config = HighlightConfiguration::new(
        tree_sitter::Language::new(tree_sitter_zig::LANGUAGE),
        "zig",
        ZIG_HIGHLIGHTS,
        ZIG_INJECTIONS,
        ZIG_LOCALS,
    )
    .expect("failed to create zig highlight configuration");
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

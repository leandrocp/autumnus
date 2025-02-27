//! Syntax highlighter powered by tree-sitter and Neovim themes.
//!
//! ## Languages available
//!
//! | Name | Extensions |
//! | ---- | ---------- |
//! | Angular | *.angular, component.html |
//! | Astro | *.astro |
//! | Bash | *.bash, *.bats, *.cgi, *.command, *.env, *.fcgi, *.ksh, *.sh, *.sh.in, *.tmux, *.tool, *.zsh, .bash_aliases, .bash_history, .bash_logout, .bash_profile, .bashrc, .cshrc, .env, .env.example, .flaskenv, .kshrc, .login, .profile, .zlogin, .zlogout, .zprofile, .zshenv, .zshrc, 9fs, PKGBUILD, bash_aliases, bash_logout, bash_profile, bashrc, cshrc, gradlew, kshrc, login, man, profile, zlogin, zlogout, zprofile, zshenv, zshrc |
//! | C | *.c |
//! | CMake | *.cmake, *.cmake.in, CMakeLists.txt |
//! | C# | *.cs |
//! | CSV | *.csv |
//! | Clojure | *.bb, *.boot, *.clj, *.cljc, *.clje, *.cljs, *.cljx, *.edn, *.joke, *.joker |
//! | Common Lisp | *.lisp, *.lsp, *.asd |
//! | C++ | *.cc, *.cpp, *.h, *.hh, *.hpp, *.ino, *.cxx, *.cu |
//! | CSS | *.css |
//! | Diff | *.diff |
//! | Dockerfile | Dockerfile, dockerfile, docker, Containerfile, container, *.dockerfile, *.docker, *.container |
//! | EEx | *.eex |
//! | Elixir | *.ex, *.exs |
//! | Elm | *.elm |
//! | Erlang | *.erl, *.app.src, *.es, *.escript, *.hrl, *.xrl, *.yrl, Emakefile |
//! | F# | *.fs, *.fsx, *.fsi |
//! | Gleam | *.gleam |
//! | Glimmer | *.hbs, *.handlebars, *.html.handlebars, *.glimmer |
//! | Go | *.go |
//! | GraphQL | |
//! | Haskell | *.hs |
//! | HEEx | *.heex, *.neex |
//! | HTML | *.html, *.htm, *.xhtml |
//! | IEx | *.iex |
//! | Java | *.java |
//! | JavaScript | *.cjs, *.js, *.mjs, *.snap |
//! | JSON | *.json, *.avsc, *.geojson, *.gltf, *.har, *.ice, *.JSON-tmLanguage, *.jsonl, *.mcmeta, *.tfstate, *.tfstate.backup, *.topojson, *.webapp, *.webmanifest, .arcconfig, .auto-changelog, .c8rc, .htmlhintrc, .imgbotconfig, .nycrc, .tern-config, .tern-project, .watchmanconfig, Pipfile.lock, composer.lock, mcmod.info, flake.lock |
//! | Kotlin | *.kt, *.ktm, *.kts |
//! | LaTeX | *.aux, *.cls, *.sty, *.tex |
//! | Liquid | *liquid |
//! | LLVM | *.llvm, *.ll |
//! | Lua | *.lua |
//! | Make | *.mak, *.d, *.make, *.makefile, *.mk, *.mkfile, BSDmakefile, GNUmakefile, Kbuild, Makefile, Makefile.am, Makefile.boot, Makefile.frag, Makefile*.in, Makefile.inc, Makefile.wat, makefile, makefile.sco, mkfile |
//! | Markdown | *.md, README |
//! | Objective-C | *.m |
//! | OCaml | *.ml |
//! | OCaml Interface | *.mli |
//! | Perl | *.pm, *.pl |
//! | PHP | *.php, *.phtml, *.php3, *.php4, *.php5, *.php7, *.phps |
//! | PowerShell | *.ps1, *.psm1 |
//! | Protocol Buffer | *.proto, *.protobuf, *.proto2, *.proto3 |
//! | Python | *.py, *.py3, *.pyi, *.bzl, TARGETS, BUCK, DEPS |
//! | R | *.R, *.r, *.rd, *.rsx, .Rprofile, expr-dist |
//! | Ruby | *.rb, *.builder, *.spec, *.rake, Gemfile, Rakefile |
//! | Rust | *.rs |
//! | Scala | *.scala, *.sbt, *.sc |
//! | SCSS | *.scss |
//! | SQL | *.sql, *.pgsql |
//! | Surface | *.surface, *.sface |
//! | Svelte | *.svelte |
//! | Swift | *.swift |
//! | TOML | *.toml, Cargo.lock, Gopkg.lock, Pipfile, pdm.lock, poetry.lock, uv.lock |
//! | TypeScript | *.ts |
//! | TSX | *.tsx |
//! | Vim | *.vim, *.viml |
//! | XML | *.ant, *.csproj, *.mjml, *.plist, *.resx, *.svg, *.ui, *.vbproj, *.xaml, *.xml, *.xsd, *.xsl, *.xslt, *.zcml, App.config, nuget.config, packages.config, .classpath, .cproject, .project |
//! | YAML | *.yaml, *.yml |
//! | Zig | *.zig |
//!
//! ## Themes available
//!
//! | Theme Name |
//! | ---------- |
//! | catppuccin_frappe |
//! | catppuccin_latte |
//! | catppuccin_macchiato |
//! | catppuccin_mocha |
//! | dracula |
//! | dracula_soft |
//! | github_dark |
//! | github_dark_colorblind |
//! | github_dark_default |
//! | github_dark_dimmed |
//! | github_dark_high_contrast |
//! | github_dark_tritanopia |
//! | github_light |
//! | github_light_colorblind |
//! | github_light_default |
//! | github_light_tritanopia |
//! | gruvbox_dark |
//! | gruvbox_light |
//! | kanagawa_dragon |
//! | kanagawa_lotus |
//! | kanagawa_wave |
//! | material_darker |
//! | material_deep_ocean |
//! | material_lighter |
//! | material_oceanic |
//! | material_palenight |
//! | nord |
//! | onedark_cool |
//! | onedark_dark |
//! | onedark_darker |
//! | onedark_deep |
//! | onedark_pro |
//! | onedark_pro_dark |
//! | onedark_pro_vivid |
//! | onedark_warm |
//! | onedark_warmer |
//! | onelight |
//! | solarized_dark |
//! | solarized_light |
//! | tokyonight_day |
//! | tokyonight_moon |
//! | tokyonight_night |
//! | tokyonight_storm |
//! | vscode_dark |
//! | vscode_light |

pub mod constants;
pub mod formatter;
pub mod languages;
pub mod themes;

use crate::formatter::Formatter;
use crate::formatter::HtmlInline;
use crate::formatter::HtmlLinked;
use crate::languages::Language;
use formatter::Terminal;
use themes::Theme;
use tree_sitter_highlight::Highlighter;

/// Options for the highlighter.
#[derive(Debug, Default)]
pub struct Options {
    /// Theme to use for highlighting.
    pub theme: Theme,
    /// Class to add to the `<pre>` tag.
    pub pre_class: Option<String>,
    /// Whether to use italics for highlighting.
    pub italic: bool,
    /// Whether to print debug information.
    pub debug: bool,
}

/// Highlights source code and returns it as an HTML string with inline styles.
///
/// This function takes the language or file path, source code, and options as input,
/// and returns an HTML string with the source code highlighted using inline styles.
///
/// # Arguments
///
/// * `lang_or_path` - A string slice that represents the language or file path of the source code.
///   If a file path is provided, the language will be guessed based on the file extension.
/// * `source` - A string slice that represents the source code to be highlighted.
/// * `options` - An `Options` struct that contains the configuration options for the highlighter.
///
/// # Examples
///
/// Basic usage with explicit language specification:
///
/// ```
/// use autumnus::highlight_html_inline;
/// use autumnus:::Options;
///
/// let code = r#"
/// fn main() {
///     println!("Hello, world!");
/// }
/// "#;
///
/// let html = highlight_html_inline(
///     "rust",
///     code,
///     Options::default()
/// );
/// ```
///
/// Or with a custom theme:
///
///
///
pub fn highlight_html_inline(lang_or_path: &str, source: &str, options: Options) -> String {
    let lang = Language::guess(lang_or_path, source);
    let formatter = HtmlInline::new(lang, options);
    format(&formatter, lang, source)
}

/// Highlights source code and returns it as an HTML string with linked styles.
///
/// This function takes the language or file path, source code, and options as input,
/// and returns an HTML string with the source code highlighted using linked styles.
///
/// # Arguments
///
/// * `lang_or_path` - A string slice that represents the language or file path of the source code.
///   If a file path is provided, the language will be guessed based on the file extension.
/// * `source` - A string slice that represents the source code to be highlighted.
/// * `options` - An `Options` struct that contains the configuration options for the highlighter.
///
pub fn highlight_html_linked(lang_or_path: &str, source: &str, options: Options) -> String {
    let lang = Language::guess(lang_or_path, source);
    let formatter = HtmlLinked::new(lang, options);
    format(&formatter, lang, source)
}

/// Highlights source code and returns it as a string with terminal colors.
///
/// This function takes the language or file path, source code, and options as input,
/// and returns a string with the source code highlighted using terminal colors.
///
/// # Arguments
///
/// * `lang_or_path` - A string slice that represents the language or file path of the source code.
///   If a file path is provided, the language will be guessed based on the file extension.
/// * `source` - A string slice that represents the source code to be highlighted.
/// * `options` - An `Options` struct that contains the configuration options for the highlighter.
///
pub fn highlight_terminal(lang_or_path: &str, source: &str, options: Options) -> String {
    let lang = Language::guess(lang_or_path, source);
    let formatter = Terminal::new(options);
    format(&formatter, lang, source)
}

fn format<F>(formatter: &F, lang: Language, source: &str) -> String
where
    F: Formatter,
{
    let mut buffer = String::new();
    let mut highlighter = Highlighter::new();

    let events = highlighter
        .highlight(lang.config(), source.as_bytes(), None, |injected| {
            Some(Language::guess(injected, "").config())
        })
        .expect("failed to generate highlight events");

    formatter.start(&mut buffer, source);
    formatter.write(&mut buffer, source, events);
    formatter.finish(&mut buffer, source);

    buffer
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_highlight_html_inline() {
        let code = r#"defmodule Foo do
  @moduledoc """
  Test Module
  """

  @projects ["Phoenix", "MDEx"]

  def projects, do: @projects
end
"#;

        let expected = r#"<pre class="athl" style="color: #c6d0f5; background-color: #303446;"><code class="language-elixir" translate="no" tabindex="0"><span class="athl-line" data-athl-line="1"><span style="color: #ca9ee6;">defmodule</span> <span style="color: #babbf1;">Foo</span> <span style="color: #ca9ee6;">do</span>
</span><span class="athl-line" data-athl-line="2">  <span style="color: #99d1db;"><span style="color: #949cbb;">@<span style="color: #949cbb;">moduledoc</span> <span style="color: #a6d189;">&quot;&quot;&quot;</span></span></span>
</span><span class="athl-line" data-athl-line="3"><span style="color: #99d1db;"><span style="color: #949cbb;"><span style="color: #a6d189;">  Test Module</span></span></span>
</span><span class="athl-line" data-athl-line="4"><span style="color: #99d1db;"><span style="color: #949cbb;"><span style="color: #a6d189;">  &quot;&quot;&quot;</span></span></span>
</span><span class="athl-line" data-athl-line="5">
</span><span class="athl-line" data-athl-line="6">  <span style="color: #99d1db;"><span style="color: #ef9f76;">@<span style="color: #8caaee;"><span style="color: #ef9f76;">projects <span style="color: #949cbb;">[</span><span style="color: #a6d189;">&quot;Phoenix&quot;</span><span style="color: #949cbb;">,</span> <span style="color: #a6d189;">&quot;MDEx&quot;</span><span style="color: #949cbb;">]</span></span></span></span></span>
</span><span class="athl-line" data-athl-line="7">
</span><span class="athl-line" data-athl-line="8">  <span style="color: #ca9ee6;">def</span> <span style="color: #8caaee;">projects</span><span style="color: #949cbb;">,</span> <span style="color: #eebebe;">do: </span><span style="color: #99d1db;"><span style="color: #ef9f76;">@<span style="color: #ef9f76;">projects</span></span></span>
</span><span class="athl-line" data-athl-line="9"><span style="color: #ca9ee6;">end</span>
</span></code></pre>"#;

        let result = highlight_html_inline(
            "elixir",
            code,
            Options {
                theme: themes::CATPPUCCIN_FRAPPE.clone(),
                ..Options::default()
            },
        );

        // println!("{}", result);
        // std::fs::write("result.html", result).unwrap();

        assert_eq!(result, expected);
    }

    #[test]
    fn test_highlight_html_linked() {
        let code = r#"defmodule Foo do
  @moduledoc """
  Test Module
  """

  @projects ["Phoenix", "MDEx"]

  def projects, do: @projects
end
"#;

        let expected = r#"<pre class="athl"><code class="language-elixir" translate="no" tabindex="0"><span class="athl-line" data-athl-line="1"><span class="keyword-function">defmodule</span> <span class="module">Foo</span> <span class="keyword">do</span>
</span><span class="athl-line" data-athl-line="2">  <span class="operator"><span class="comment-documentation">@<span class="comment-documentation">moduledoc</span> <span class="string">&quot;&quot;&quot;</span></span></span>
</span><span class="athl-line" data-athl-line="3"><span class="operator"><span class="comment-documentation"><span class="string">  Test Module</span></span></span>
</span><span class="athl-line" data-athl-line="4"><span class="operator"><span class="comment-documentation"><span class="string">  &quot;&quot;&quot;</span></span></span>
</span><span class="athl-line" data-athl-line="5">
</span><span class="athl-line" data-athl-line="6">  <span class="operator"><span class="constant">@<span class="function-call"><span class="constant">projects <span class="punctuation-bracket">[</span><span class="string">&quot;Phoenix&quot;</span><span class="punctuation-delimiter">,</span> <span class="string">&quot;MDEx&quot;</span><span class="punctuation-bracket">]</span></span></span></span></span>
</span><span class="athl-line" data-athl-line="7">
</span><span class="athl-line" data-athl-line="8">  <span class="keyword-function">def</span> <span class="function">projects</span><span class="punctuation-delimiter">,</span> <span class="string-special-symbol">do: </span><span class="operator"><span class="constant">@<span class="constant">projects</span></span></span>
</span><span class="athl-line" data-athl-line="9"><span class="keyword">end</span>
</span></code></pre>"#;

        let result = highlight_html_linked(
            "elixir",
            code,
            Options {
                theme: themes::CATPPUCCIN_FRAPPE.clone(),
                ..Options::default()
            },
        );

        // println!("{}", result);
        // std::fs::write("result.html", result).unwrap();

        assert_eq!(result, expected);
    }

    #[test]
    fn test_guess_language_by_file_name() {
        let result = highlight_html_inline("app.ex", "foo = 1", Options::default());
        assert!(result.as_str().contains("language-elixir"))
    }

    #[test]
    fn test_guess_language_by_shebang() {
        let result = highlight_html_inline("test", "#!/usr/bin/env elixir", Options::default());
        assert!(result.as_str().contains("language-elixir"))
    }

    #[test]
    fn test_fallback_to_plain_text() {
        let result = highlight_html_inline("none", "source code", Options::default());
        assert!(result.as_str().contains("language-plaintext"))
    }
}

//! Syntax highlighter powered by tree-sitter and Neovim themes.
//!
//! ## Examples
//!
//! Basic usage with default options (HTML inline styles):
//!
//! ```rust
//! use autumnus::{highlight, Options};
//!
//! let code = r#"
//!     function greet(name) {
//!         console.log(`Hello ${name}!`);
//!     }
//! "#;
//!
//! let html = highlight("javascript", code, Options::default());
//! ```
//!
//! Using a specific theme:
//!
//! ```rust
//! use autumnus::{highlight, Options, themes};
//!
//! let code = "SELECT * FROM users WHERE active = true;";
//! let html = highlight(
//!     "sql",
//!     code,
//!     Options {
//!         theme: themes::get("dracula").expect("Theme not found"),
//!         ..Options::default()
//!     }
//! );
//! ```
//!
//! Highlighting with file path detection:
//!
//! ```rust
//! use autumnus::{highlight, Options};
//!
//! let code = r#"
//!     defmodule MyApp do
//!       def hello, do: :world
//!     end
//! "#;
//! // Language will be automatically detected as Elixir from the .ex extension
//! let html = highlight("app.ex", code, Options::default());
//! ```
//!
//! Terminal output with ANSI colors:
//!
//! ```rust
//! use autumnus::{highlight, Options, FormatterOption};
//!
//! let code = "puts 'Hello from Ruby!'";
//! let ansi = highlight(
//!     "ruby",
//!     code,
//!     Options {
//!         formatter: FormatterOption::Terminal,
//!         ..Options::default()
//!     }
//! );
//! ```
//!
//! ## Languages available
//!
//! | Name | Extensions |
//! | ---- | ---------- |
//! | Angular | *.angular, component.html |
//! | Astro | *.astro |
//! | Bash | *.bash, *.bats, *.cgi, *.command, *.env, *.fcgi, *.ksh, *.sh, *.sh.in, *.tmux, *.tool, *.zsh, .bash_aliases, .bash_history, .bash_logout, .bash_profile, .bashrc, .cshrc, .env, .env.example, .flaskenv, .kshrc, .login, .profile, .zlogin, .zlogout, .zprofile, .zshenv, .zshrc, 9fs, PKGBUILD, bash_aliases, bash_logout, bash_profile, bashrc, cshrc, ebuild, eclass, gradlew, kshrc, login, man, profile, zlogin, zlogout, zprofile, zshenv, zshrc |
//! | C | *.c |
//! | CMake | *.cmake, *.cmake.in, CMakeLists.txt |
//! | C# | *.cs |
//! | CSV | *.csv |
//! | Clojure | *.bb, *.boot, *.clj, *.cljc, *.clje, *.cljs, *.cljx, *.edn, *.joke, *.joker |
//! | Comment | |
//! | Common Lisp | *.lisp, *.lsp, *.asd |
//! | C++ | *.cc, *.cpp, *.h, *.hh, *.hpp, *.ino, *.cxx, *.cu, *.hxx |
//! | CSS | *.css |
//! | Diff | *.diff |
//! | Dockerfile | Dockerfile, dockerfile, docker, Containerfile, container, *.dockerfile, *.docker, *.container |
//! | EEx | *.eex |
//! | Elixir | *.ex, *.exs |
//! | Elm | *.elm |
//! | Erlang | *.erl, *.app, *.app.src, *.es, *.escript, *.hrl, *.xrl, *.yrl, Emakefile, rebar.config |
//! | F# | *.fs, *.fsx, *.fsi |
//! | Gleam | *.gleam |
//! | Glimmer | *.hbs, *.handlebars, *.html.handlebars, *.glimmer |
//! | Go | *.go |
//! | GraphQL | |
//! | Haskell | *.hs, *.hs-boot |
//! | HEEx | *.heex, *.neex |
//! | HTML | *.html, *.htm, *.xhtml |
//! | IEx | *.iex |
//! | Java | *.java |
//! | JavaScript | *.cjs, *.js, *.mjs, *.snap, *.jsx |
//! | JSON | *.json, *.avsc, *.geojson, *.gltf, *.har, *.ice, *.JSON-tmLanguage, *.jsonl, *.mcmeta, *.tfstate, *.tfstate.backup, *.topojson, *.webapp, *.webmanifest, .arcconfig, .auto-changelog, .c8rc, .htmlhintrc, .imgbotconfig, .nycrc, .tern-config, .tern-project, .watchmanconfig, Pipfile.lock, composer.lock, mcmod.info, flake.lock |
//! | Kotlin | *.kt, *.ktm, *.kts |
//! | LaTeX | *.aux, *.cls, *.sty, *.tex |
//! | Liquid | *liquid |
//! | LLVM | *.llvm, *.ll |
//! | Lua | *.lua |
//! | Make | *.mak, *.d, *.make, *.makefile, *.mk, *.mkfile, *.dsp, BSDmakefile, GNUmakefile, Kbuild, Makefile, MAKEFILE, Makefile.am, Makefile.boot, Makefile.frag, Makefile*.in, Makefile.inc, Makefile.wat, makefile, makefile.sco, mkfile |
//! | Markdown | *.md, README, LICENSE |
//! | Markdown Inline | |
//! | Objective-C | *.m, *.objc |
//! | OCaml | *.ml |
//! | OCaml Interface | *.mli |
//! | Perl | *.pm, *.pl, *.t |
//! | PHP | *.php, *.phtml, *.php3, *.php4, *.php5, *.php7, *.phps |
//! | Plain Text | |
//! | PowerShell | *.ps1, *.psm1 |
//! | Protocol Buffer | *.proto, *.protobuf, *.proto2, *.proto3 |
//! | Python | *.py, *.py3, *.pyi, *.bzl, TARGETS, BUCK, DEPS |
//! | R | *.R, *.r, *.rd, *.rsx, .Rprofile, expr-dist |
//! | Regex | |
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
//! | XML | *.ant, *.csproj, *.mjml, *.plist, *.resx, *.svg, *.ui, *.vbproj, *.xaml, *.xml, *.xsd, *.xsl, *.xslt, *.zcml, *.rng, App.config, nuget.config, packages.config, .classpath, .cproject, .project |
//! | YAML | *.yaml, *.yml |
//! | Zig | *.zig |
//!
//! ## Themes available
//!
//! | Theme Name |
//! | ---------- |
//! | aura_dark |
//! | aura_dark_soft_text |
//! | aura_soft_dark |
//! | aura_soft_dark_soft_text |
//! | bamboo_dark |
//! | bamboo_light |
//! | carbonfox |
//! | catppuccin_frappe |
//! | catppuccin_latte |
//! | catppuccin_macchiato |
//! | catppuccin_mocha |
//! | cyberdream_dark |
//! | cyberdream_light |
//! | dawnfox |
//! | dayfox |
//! | dracula |
//! | dracula_soft |
//! | duskfox |
//! | edge_aura |
//! | edge_dark |
//! | edge_light |
//! | edge_neon |
//! | everforest_dark |
//! | everforest_light |
//! | github_dark |
//! | github_dark_colorblind |
//! | github_dark_default |
//! | github_dark_dimmed |
//! | github_dark_high_contrast |
//! | github_dark_tritanopia |
//! | github_light |
//! | github_light_colorblind |
//! | github_light_default |
//! | github_light_high_contrast |
//! | github_light_tritanopia |
//! | gruvbox_dark |
//! | gruvbox_dark_hard |
//! | gruvbox_dark_soft |
//! | gruvbox_light |
//! | gruvbox_light_hard |
//! | gruvbox_light_soft |
//! | gruvbox_material_dark |
//! | gruvbox_material_light |
//! | kanagawa_dragon |
//! | kanagawa_lotus |
//! | kanagawa_wave |
//! | material_darker |
//! | material_deep_ocean |
//! | material_lighter |
//! | material_oceanic |
//! | material_palenight |
//! | modus_operandi |
//! | modus_vivendi |
//! | monokai_pro_dark |
//! | monokai_pro_machine |
//! | monokai_pro_ristretto |
//! | monokai_pro_spectrum |
//! | moonfly |
//! | neosolarized_dark |
//! | neosolarized_light |
//! | nightfox |
//! | nord |
//! | onedark_cool |
//! | onedark_dark |
//! | onedark_darker |
//! | onedark_deep |
//! | onedark_light |
//! | onedark_warm |
//! | onedark_warmer |
//! | onedarkpro |
//! | onedarkpro_dark |
//! | onedarkpro_light |
//! | onedarkpro_vivid |
//! | rosepine_dark |
//! | rosepine_dawn |
//! | rosepine_moon |
//! | solarized_autumn |
//! | solarized_spring |
//! | solarized_summer |
//! | solarized_winter |
//! | terafox |
//! | tokyonight_day |
//! | tokyonight_moon |
//! | tokyonight_night |
//! | tokyonight_storm |
//! | vscode_dark |
//! | vscode_light |
//! | zephyr_dark |

#[doc(hidden)]
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
use std::sync::LazyLock;

static DEFAULT_THEME: LazyLock<Theme> = LazyLock::new(Theme::default);

/// The type of formatter to use for syntax highlighting.
#[derive(Debug, Clone)]
pub enum FormatterOption {
    /// HTML output with inline styles.
    HtmlInline,
    /// HTML output with linked styles.
    ///
    /// When using this formatter, CSS files for all themes are available in the `css/` directory.
    /// You need to include the corresponding CSS file for your chosen theme:
    ///
    /// ```html
    /// <link rel="stylesheet" href="css/dracula.css">
    /// ```
    HtmlLinked,
    /// Terminal output with ANSI colors.
    Terminal,
}

/// Options for the highlighter.
#[derive(Debug)]
pub struct Options<'a> {
    /// Theme to use for highlighting.
    ///
    /// # Examples
    ///
    /// ```
    /// use autumnus::{Options, themes, highlight};
    ///
    /// let options = Options {
    ///     theme: themes::get("dracula").expect("Theme not found"),
    ///     ..Options::default()
    /// };
    ///
    /// let code = r#"fn main() { println!("Hello"); }"#;
    /// let html = highlight("rust", code, options);
    /// // Output: <pre class="athl" style="color: #f8f8f2; background-color: #282a36;">
    /// //   <code class="language-rust" translate="no" tabindex="0">
    /// //     <span class="line" data-line="1">
    /// //       <span style="color: #ff79c6;">fn</span> <span style="color: #f8f8f2;">main</span>() {
    /// //       <span style="color: #8be9fd;">println!</span>(<span style="color: #f1fa8c;">"Hello"</span>); }
    /// //     </span>
    /// //   </code>
    /// // </pre>
    /// ```
    pub theme: &'a Theme,

    /// Class to add to the `<pre>` tag.
    ///
    /// # Examples
    ///
    /// ```
    /// use autumnus::{Options, highlight};
    ///
    /// let options = Options {
    ///     pre_class: Some("my-code-block"),
    ///     ..Options::default()
    /// };
    ///
    /// let code = r#"fn main() { println!("Hello"); }"#;
    /// let html = highlight("rust", code, options);
    /// // Output: <pre class="athl my-code-block">
    /// ```
    pub pre_class: Option<&'a str>,

    /// Whether to use italics for highlighting.
    ///
    /// # Examples
    ///
    /// ```
    /// use autumnus::{Options, highlight};
    ///
    /// let options = Options {
    ///     italic: true,
    ///     ..Options::default()
    /// };
    ///
    /// let code = r#"fn main() { println!("Hello"); }"#;
    /// let html = highlight("rust", code, options);
    /// // Output: <pre class="athl">
    /// //   <code class="language-rust" translate="no" tabindex="0">
    /// //     <span class="line" data-line="1">
    /// //       <span style="color: #ff79c6; font-style: italic;">fn</span> ...
    /// //     </span>
    /// //   </code>
    /// // </pre>
    /// ```
    pub italic: bool,

    /// Whether to include the original highlight scope name in a `data` attribute.
    /// Useful for debugging.
    ///
    /// # Examples
    ///
    /// ```
    /// use autumnus::{Options, highlight};
    ///
    /// let options = Options {
    ///     include_highlight: true,
    ///     ..Options::default()
    /// };
    ///
    /// let code = r#"fn main() { println!("Hello"); }"#;
    /// let html = highlight("rust", code, options);
    /// // Output: <pre class="athl">
    /// //   <code class="language-rust" translate="no" tabindex="0">
    /// //     <span class="line" data-line="1">
    /// //       <span style="color: #ff79c6;" data-highlight="keyword.function">fn</span> ...
    /// //     </span>
    /// //   </code>
    /// // </pre>
    /// ```
    pub include_highlight: bool,

    /// The type of formatter to use for output.
    ///
    /// # Examples
    ///
    /// ```
    /// use autumnus::{Options, FormatterOption, highlight};
    ///
    /// let options = Options {
    ///     formatter: FormatterOption::HtmlLinked,
    ///     ..Options::default()
    /// };
    ///
    /// let code = r#"fn main() { println!("Hello"); }"#;
    /// let html = highlight("rust", code, options);
    /// // Output: <pre class="athl">
    /// //   <code class="language-rust" translate="no" tabindex="0">
    /// //     <span class="line" data-line="1">
    /// //       <span class="keyword-function">fn</span> ...
    /// //     </span>
    /// //   </code>
    /// // </pre>
    /// ```
    pub formatter: FormatterOption,
}

impl<'a> Default for Options<'a> {
    fn default() -> Self {
        Self {
            theme: &DEFAULT_THEME,
            pre_class: None,
            italic: false,
            include_highlight: false,
            formatter: FormatterOption::HtmlInline,
        }
    }
}

/// Highlights source code and returns it as a string with syntax highlighting.
///
/// This function takes the language or file path, source code, and options as input,
/// and returns a string with the source code highlighted according to the specified formatter.
///
/// # Arguments
///
/// * `lang_or_path` - A string slice that represents the language or file path of the source code.
///   If a file path is provided, the language will be guessed based on the file extension.
/// * `source` - A string slice that represents the source code to be highlighted.
/// * `options` - An `Options` struct that contains the configuration options for the highlighter,
///   including the formatter type to use.
///
/// # Examples
///
/// Basic usage with HTML inline styles (default):
///
/// ```rust
/// use autumnus::highlight;
/// use autumnus::Options;
///
/// let code = r#"
/// fn main() {
///     println!("Hello, world!");
/// }
/// "#;
///
/// let html = highlight(
///     "rust",
///     code,
///     Options::default()
/// );
/// ```
///
/// Output with HTML inline styles (default):
/// ```html
/// <pre class="athl" style="color: #c6d0f5; background-color: #303446;">
///   <code class="language-rust" translate="no" tabindex="0">
///     <span class="line" data-line="1">
///       <span style="color: #ca9ee6;">fn</span> <span style="color: #8caaee;">main</span>() {
///     </span>
///     <span class="line" data-line="2">
///       <span style="color: #8caaee;">println!</span>(<span style="color: #a6d189;">"Hello, world!"</span>);
///     </span>
///     <span class="line" data-line="3">}</span>
///   </code>
/// </pre>
/// ```
///
/// Using HTML with linked styles:
///
/// ```rust
/// use autumnus::highlight;
/// use autumnus::Options;
/// use autumnus::FormatterOption;
///
/// let code = r#"
/// fn main() {
///     println!("Hello, world!");
/// }
/// "#;
///
/// let html = highlight(
///     "rust",
///     code,
///     Options {
///         formatter: FormatterOption::HtmlLinked,
///         ..Options::default()
///     }
/// );
/// ```
///
/// Output with HTML linked styles:
/// ```html
/// <pre class="athl">
///   <code class="language-rust" translate="no" tabindex="0">
///     <span class="line" data-line="1">
///       <span class="keyword-function">fn</span> <span class="function">main</span>() {
///     </span>
///     <span class="line" data-line="2">
///       <span class="function-macro">println!</span>(<span class="string">"Hello, world!"</span>);
///     </span>
///     <span class="line" data-line="3">}</span>
///   </code>
/// </pre>
/// ```
///
/// When using `FormatterOption::HtmlLinked`, you need to include the corresponding CSS file for your chosen theme.
/// CSS files for all themes are available in the `css/` directory:
///
/// ```html
/// <link rel="stylesheet" href="css/dracula.css">
/// ```
///
/// Using terminal output:
///
/// ```rust
/// use autumnus::highlight;
/// use autumnus::Options;
/// use autumnus::FormatterOption;
///
/// let code = r#"
/// fn main() {
///     println!("Hello, world!");
/// }
/// "#;
///
/// let ansi = highlight(
///     "rust",
///     code,
///     Options {
///         formatter: FormatterOption::Terminal,
///         ..Options::default()
///     }
/// );
/// ```
///
/// Output with ANSI terminal colors:
/// ```text
/// [38;2;202;158;230mfn[0m [38;2;140;170;238mmain[0m() {
///     [38;2;140;170;238mprintln![0m([38;2;166;209;137m"Hello, world!"[0m);
/// }
/// ```
pub fn highlight(lang_or_path: &str, source: &str, options: Options) -> String {
    let lang = Language::guess(lang_or_path, source);
    let mut buffer = String::new();
    let mut highlighter = Highlighter::new();
    let events = highlighter
        .highlight(lang.config(), source.as_bytes(), None, |injected| {
            Some(Language::guess(injected, "").config())
        })
        .expect("failed to generate highlight events");

    match options.formatter {
        FormatterOption::HtmlInline => {
            let formatter = HtmlInline::new(lang, options);
            formatter.start(&mut buffer, source);
            formatter.write(&mut buffer, source, events);
            formatter.finish(&mut buffer, source);
        }
        FormatterOption::HtmlLinked => {
            let formatter = HtmlLinked::new(lang, options);
            formatter.start(&mut buffer, source);
            formatter.write(&mut buffer, source, events);
            formatter.finish(&mut buffer, source);
        }

        FormatterOption::Terminal => {
            let formatter = Terminal::new(options);
            formatter.start(&mut buffer, source);
            formatter.write(&mut buffer, source, events);
            formatter.finish(&mut buffer, source);
        }
    };

    buffer
}

#[cfg(test)]
mod tests {
    use super::*;

    // println!("{}", result);
    // std::fs::write("result.html", result.clone()).unwrap();

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

        let expected = r#"<pre class="athl" style="color: #c6d0f5; background-color: #303446;"><code class="language-elixir" translate="no" tabindex="0"><span class="line" data-line="1"><span style="color: #ca9ee6;">defmodule</span> <span style="color: #babbf1;">Foo</span> <span style="color: #ca9ee6;">do</span>
</span><span class="line" data-line="2">  <span style="color: #99d1db;"><span style="color: #949cbb;">@<span style="color: #949cbb;">moduledoc</span> <span style="color: #a6d189;">&quot;&quot;&quot;</span></span></span>
</span><span class="line" data-line="3"><span style="color: #99d1db;"><span style="color: #949cbb;"><span style="color: #a6d189;">  Test Module</span></span></span>
</span><span class="line" data-line="4"><span style="color: #99d1db;"><span style="color: #949cbb;"><span style="color: #a6d189;">  &quot;&quot;&quot;</span></span></span>
</span><span class="line" data-line="5">
</span><span class="line" data-line="6">  <span style="color: #99d1db;"><span style="color: #ef9f76;">@<span style="color: #8caaee;"><span style="color: #ef9f76;">projects <span style="color: #949cbb;">[</span><span style="color: #a6d189;">&quot;Phoenix&quot;</span><span style="color: #949cbb;">,</span> <span style="color: #a6d189;">&quot;MDEx&quot;</span><span style="color: #949cbb;">]</span></span></span></span></span>
</span><span class="line" data-line="7">
</span><span class="line" data-line="8">  <span style="color: #ca9ee6;">def</span> <span style="color: #8caaee;">projects</span><span style="color: #949cbb;">,</span> <span style="color: #eebebe;">do: </span><span style="color: #99d1db;"><span style="color: #ef9f76;">@<span style="color: #ef9f76;">projects</span></span></span>
</span><span class="line" data-line="9"><span style="color: #ca9ee6;">end</span>
</span></code></pre>"#;

        let result = highlight(
            "elixir",
            code,
            Options {
                theme: themes::get("catppuccin_frappe").expect("Theme not found"),
                ..Options::default()
            },
        );

        assert_eq!(result, expected);
    }

    #[test]
    fn test_highlight_html_inline_escape_curly_braces() {
        let expected = r#"<pre class="athl" style="color: #c6d0f5; background-color: #303446;"><code class="language-elixir" translate="no" tabindex="0"><span class="line" data-line="1"><span style="color: #949cbb;">&lbrace;</span><span style="color: #eebebe;">:ok</span><span style="color: #949cbb;">,</span> <span style="color: #eebebe;">char: </span><span style="color: #81c8be;">&#39;&lbrace;&#39;</span><span style="color: #949cbb;">&rbrace;</span>
</span></code></pre>"#;

        let result = highlight(
            "elixir",
            "{:ok, char: '{'}",
            Options {
                theme: themes::get("catppuccin_frappe").expect("Theme not found"),
                ..Options::default()
            },
        );

        assert_eq!(result, expected);
    }

    #[test]
    fn test_highlight_html_linked_escape_curly_braces() {
        let expected = r#"<pre class="athl"><code class="language-elixir" translate="no" tabindex="0"><span class="line" data-line="1"><span class="punctuation-bracket">&lbrace;</span><span class="string-special-symbol">:ok</span><span class="punctuation-delimiter">,</span> <span class="string-special-symbol">char: </span><span class="character">&#39;&lbrace;&#39;</span><span class="punctuation-bracket">&rbrace;</span>
</span></code></pre>"#;

        let result = highlight(
            "elixir",
            "{:ok, char: '{'}",
            Options {
                formatter: FormatterOption::HtmlLinked,
                theme: themes::get("catppuccin_frappe").expect("Theme not found"),
                ..Options::default()
            },
        );

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

        let expected = r#"<pre class="athl"><code class="language-elixir" translate="no" tabindex="0"><span class="line" data-line="1"><span class="keyword-function">defmodule</span> <span class="module">Foo</span> <span class="keyword">do</span>
</span><span class="line" data-line="2">  <span class="operator"><span class="comment-documentation">@<span class="comment-documentation">moduledoc</span> <span class="string">&quot;&quot;&quot;</span></span></span>
</span><span class="line" data-line="3"><span class="operator"><span class="comment-documentation"><span class="string">  Test Module</span></span></span>
</span><span class="line" data-line="4"><span class="operator"><span class="comment-documentation"><span class="string">  &quot;&quot;&quot;</span></span></span>
</span><span class="line" data-line="5">
</span><span class="line" data-line="6">  <span class="operator"><span class="constant">@<span class="function-call"><span class="constant">projects <span class="punctuation-bracket">[</span><span class="string">&quot;Phoenix&quot;</span><span class="punctuation-delimiter">,</span> <span class="string">&quot;MDEx&quot;</span><span class="punctuation-bracket">]</span></span></span></span></span>
</span><span class="line" data-line="7">
</span><span class="line" data-line="8">  <span class="keyword-function">def</span> <span class="function">projects</span><span class="punctuation-delimiter">,</span> <span class="string-special-symbol">do: </span><span class="operator"><span class="constant">@<span class="constant">projects</span></span></span>
</span><span class="line" data-line="9"><span class="keyword">end</span>
</span></code></pre>"#;

        let result = highlight(
            "elixir",
            code,
            Options {
                formatter: FormatterOption::HtmlLinked,
                theme: themes::get("catppuccin_frappe").expect("Theme not found"),
                ..Options::default()
            },
        );

        assert_eq!(result, expected);
    }

    #[test]
    fn test_guess_language_by_file_name() {
        let result = highlight("app.ex", "foo = 1", Options::default());
        assert!(result.as_str().contains("language-elixir"));
    }

    #[test]
    fn test_guess_language_by_file_extension() {
        let result = highlight("md", "# Title", Options::default());
        assert!(result.as_str().contains("language-markdown"));

        let result = highlight("ex", "foo = 1", Options::default());
        assert!(result.as_str().contains("language-elixir"));
    }

    #[test]
    fn test_guess_language_by_shebang() {
        let result = highlight("test", "#!/usr/bin/env elixir", Options::default());
        assert!(result.as_str().contains("language-elixir"));
    }

    #[test]
    fn test_fallback_to_plain_text() {
        let result = highlight("none", "source code", Options::default());
        assert!(result.as_str().contains("language-plaintext"));
    }
}

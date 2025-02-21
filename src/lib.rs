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

#[derive(Debug, Default)]
pub struct Options {
    pub theme: Theme,
    pub pre_class: Option<String>,
    pub italic: bool,
    pub debug: bool,
}

pub fn highlight_html_inline(lang_or_path: &str, source: &str, options: Options) -> String {
    let lang = Language::guess(lang_or_path, source);
    let formatter = HtmlInline::new(lang, options);
    format(&formatter, lang, source)
}

pub fn highlight_html_linked(lang_or_path: &str, source: &str, options: Options) -> String {
    let lang = Language::guess(lang_or_path, source);
    let formatter = HtmlLinked::new(lang, options);
    format(&formatter, lang, source)
}

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
    use std::path::Path;

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
</span><span class="athl-line" data-athl-line="2">  <span style="color: #949cbb;">@</span><span style="color: #949cbb;">moduledoc</span> <span style="color: #949cbb;">&quot;&quot;&quot;</span>
</span><span class="athl-line" data-athl-line="3"><span style="color: #949cbb;">  Test Module</span>
</span><span class="athl-line" data-athl-line="4"><span style="color: #949cbb;">  &quot;&quot;&quot;</span>
</span><span class="athl-line" data-athl-line="5">
</span><span class="athl-line" data-athl-line="6">  <span style="color: #ef9f76;">@</span><span style="color: #ef9f76;">projects</span> <span style="color: #949cbb;">[</span><span style="color: #a6d189;">&quot;Phoenix&quot;</span><span style="color: #949cbb;">,</span> <span style="color: #a6d189;">&quot;MDEx&quot;</span><span style="color: #949cbb;">]</span>
</span><span class="athl-line" data-athl-line="7">
</span><span class="athl-line" data-athl-line="8">  <span style="color: #ca9ee6;">def</span> <span style="color: #8caaee;">projects</span><span style="color: #949cbb;">,</span> <span style="color: #eebebe;">do: </span><span style="color: #ef9f76;">@</span><span style="color: #ef9f76;">projects</span>
</span><span class="athl-line" data-athl-line="9"><span style="color: #ca9ee6;">end</span>
</span></code></pre>"#;

        let path = Path::new("themes/catppuccin_frappe.json");
        let theme = Theme::from_file(path).unwrap();

        let result = highlight_html_inline(
            "elixir",
            code,
            Options {
                theme,
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

        let expected = r#"<pre class="athl"><code class="language-elixir" translate="no" tabindex="0"><span class="athl-line" data-athl-line="1"><span class="keyword">defmodule</span> <span class="module">Foo</span> <span class="keyword">do</span>
</span><span class="athl-line" data-athl-line="2">  <span class="comment-doc">@</span><span class="comment-doc">moduledoc</span> <span class="comment-doc">&quot;&quot;&quot;</span>
</span><span class="athl-line" data-athl-line="3"><span class="comment-doc">  Test Module</span>
</span><span class="athl-line" data-athl-line="4"><span class="comment-doc">  &quot;&quot;&quot;</span>
</span><span class="athl-line" data-athl-line="5">
</span><span class="athl-line" data-athl-line="6">  <span class="attribute">@</span><span class="attribute">projects</span> <span class="punctuation-bracket">[</span><span class="string">&quot;Phoenix&quot;</span><span class="punctuation-delimiter">,</span> <span class="string">&quot;MDEx&quot;</span><span class="punctuation-bracket">]</span>
</span><span class="athl-line" data-athl-line="7">
</span><span class="athl-line" data-athl-line="8">  <span class="keyword">def</span> <span class="function">projects</span><span class="punctuation-delimiter">,</span> <span class="string-special-symbol">do: </span><span class="attribute">@</span><span class="attribute">projects</span>
</span><span class="athl-line" data-athl-line="9"><span class="keyword">end</span>
</span></code></pre>"#;

        let path = Path::new("themes/catppuccin_frappe.json");
        let theme = Theme::from_file(path).unwrap();

        let result = highlight_html_linked(
            "elixir",
            code,
            Options {
                theme,
                ..Options::default()
            },
        );

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

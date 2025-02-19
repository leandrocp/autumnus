pub mod constants;
pub mod formatter;
pub mod guess_language;
pub mod languages;
pub mod themes;

use crate::formatter::Formatter;
use crate::formatter::HtmlInline;
use crate::languages::Language;
use themes::Theme;
use tree_sitter_highlight::Highlighter;

pub fn highlight(
    lang_or_path: &str,
    source: &str,
    theme: Theme,
    pre_class: Option<String>,
    debug: bool,
) -> String {
    let lang = Language::guess(lang_or_path, source);
    let formatter = HtmlInline::new(lang, theme, pre_class, debug);
    format(&formatter, lang, source)
}

fn format<F>(formatter: &F, lang: Language, source: &str) -> String
where
    F: Formatter,
{
    let mut buffer = String::new();
    let mut highlighter = Highlighter::new();
    let hl_config = lang.config();

    // TODO: sub lang
    let events = highlighter
        .highlight(hl_config, source.as_bytes(), None, |_| None)
        .unwrap();

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
    fn test_highlight() {
        let code = r#"defmodule Foo do
  @moduledoc """
  Test Module
  """

  @projects ["Phoenix", "MDEx"]

  def projects, do: @projects
end
"#;

        let expected = r#"<pre class="athl" style="color: #c6d0f5;background-color: #303446;"><code class="language-elixir" translate="no" tabindex="0"><span class="line" data-athl-no="1"><span style="color: #ca9ee6;">defmodule</span> <span style="color: #babbf1;font-style: italic;">Foo</span> <span style="color: #ca9ee6;">do</span>
</span><span class="line" data-athl-no="2">  <span style="color: #949cbb;font-style: italic;">@</span><span style="color: #949cbb;font-style: italic;">moduledoc</span> <span style="color: #949cbb;font-style: italic;">&quot;&quot;&quot;</span>
</span><span class="line" data-athl-no="3"><span style="color: #949cbb;font-style: italic;">  Test Module</span>
</span><span class="line" data-athl-no="4"><span style="color: #949cbb;font-style: italic;">  &quot;&quot;&quot;</span>
</span><span class="line" data-athl-no="5">
</span><span class="line" data-athl-no="6">  <span style="color: #ef9f76;">@</span><span style="color: #ef9f76;">projects</span> <span style="color: #949cbb;">[</span><span style="color: #a6d189;">&quot;Phoenix&quot;</span><span style="color: #949cbb;">,</span> <span style="color: #a6d189;">&quot;MDEx&quot;</span><span style="color: #949cbb;">]</span>
</span><span class="line" data-athl-no="7">
</span><span class="line" data-athl-no="8">  <span style="color: #ca9ee6;">def</span> <span style="color: #8caaee;">projects</span><span style="color: #949cbb;">,</span> <span style="color: #eebebe;">do: </span><span style="color: #ef9f76;">@</span><span style="color: #ef9f76;">projects</span>
</span><span class="line" data-athl-no="9"><span style="color: #ca9ee6;">end</span>
</span></code></pre>"#;

        let path = Path::new("themes/catppuccin_frappe.json");
        let theme = Theme::from_file(path).unwrap();

        let result = highlight("elixir", code, theme, None, false);

        // println!("{}", result);
        // std::fs::write("result.html", result).unwrap();

        assert_eq!(result, expected);
    }

    #[test]
    fn test_fallback_to_plain_text() {
        let path = Path::new("themes/catppuccin_frappe.json");
        let theme = Theme::from_file(path).unwrap();

        let result = highlight("none", "source code", theme, None, false);
        
        assert!(result.as_str().contains("language-plaintext"))
    }

}

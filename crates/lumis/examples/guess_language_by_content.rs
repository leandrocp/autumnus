//! Guess a language from source content with Tree-sitter.

use lumis::languages::Language;

fn main() {
    let source = r#"defmodule Example do
  def hello, do: :world
end
"#;

    // Pass no hint to let Lumis fall back to parser-backed content guessing.
    let language = Language::guess(None, source);

    assert_eq!(language, Language::Elixir);
    println!("Guessed language: {language}");
}

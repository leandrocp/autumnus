use syntect::highlighting::ThemeSet;
use syntect::html::highlighted_html_for_string;
use syntect::parsing::SyntaxSet;

const SOURCE: &str = r#"
fn main() {
    println!("package-size");
}
"#;

fn main() {
    let syntaxes = SyntaxSet::load_defaults_newlines();
    let themes = ThemeSet::load_defaults();
    let syntax = syntaxes
        .find_syntax_by_extension("rs")
        .expect("built-in Rust syntax");
    let output = highlighted_html_for_string(
        SOURCE,
        &syntaxes,
        syntax,
        &themes.themes["base16-ocean.dark"],
    )
    .expect("highlight with syntect");
    println!("{}", output.len());
}

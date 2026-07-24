use lumis::{
    formatters::{Formatter as _, HtmlInline},
    languages::Language,
    themes, HtmlInlineBuilder,
};
use std::{env, fs, path::PathBuf};
use syntect::{highlighting::ThemeSet, html::highlighted_html_for_string, parsing::SyntaxSet};

fn main() {
    let generated_dir =
        PathBuf::from(env::var_os("BENCH_SHOWCASE_DIR").expect("BENCH_SHOWCASE_DIR"));
    let source = fs::read_to_string(
        generated_dir
            .join("assets")
            .join("webgpu_compute_reduce.html"),
    )
    .expect("read showcase fixture");
    fs::create_dir_all(generated_dir.join("fragments")).expect("create fragments directory");

    let theme = themes::get("dracula").expect("built-in Dracula theme");
    let formatter: HtmlInline = HtmlInlineBuilder::new()
        .language(Language::HTML)
        .theme(Some(theme.clone()))
        .build()
        .expect("build Lumis formatter");
    let mut lumis_output = Vec::with_capacity(source.len().saturating_mul(3));
    formatter
        .format(&source, &mut lumis_output)
        .expect("highlight showcase fixture with Lumis");
    validate(&lumis_output, source.len(), "Lumis Rust");
    fs::write(
        generated_dir.join("fragments").join("lumis-rust.html"),
        lumis_output,
    )
    .expect("write Lumis Rust fragment");

    let syntaxes = SyntaxSet::load_defaults_newlines();
    let syntax = syntaxes
        .find_syntax_by_extension("html")
        .expect("syntect HTML syntax");
    let theme = ThemeSet::get_theme(generated_dir.join("assets").join("Dracula.tmTheme"))
        .expect("load official Dracula theme");
    let syntect_output = highlighted_html_for_string(&source, &syntaxes, syntax, &theme)
        .expect("highlight showcase fixture with syntect");
    validate(syntect_output.as_bytes(), source.len(), "syntect");
    fs::write(
        generated_dir.join("fragments").join("syntect.html"),
        syntect_output,
    )
    .expect("write syntect fragment");
}

fn validate(output: &[u8], input_bytes: usize, implementation: &str) {
    let html = std::str::from_utf8(output).expect("highlight output is UTF-8");
    assert!(
        output.len() > input_bytes && html.contains("<pre") && html.contains("<span"),
        "{implementation} did not produce highlighted HTML"
    );
}

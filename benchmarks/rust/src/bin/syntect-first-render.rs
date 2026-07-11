use serde_json::json;
use std::env;
use std::fs;
use std::hint::black_box;
use std::time::Instant;
use syntect::highlighting::ThemeSet;
use syntect::html::highlighted_html_for_string;
use syntect::parsing::SyntaxSet;

fn main() {
    let total_started = Instant::now();
    let path = env::args()
        .nth(1)
        .expect("usage: syntect-first-render <fixture>");

    let read_started = Instant::now();
    let source = fs::read_to_string(&path).expect("read fixture");
    let read_ns = read_started.elapsed().as_nanos();

    let init_started = Instant::now();
    let syntax_set = SyntaxSet::load_defaults_newlines();
    let theme_set = ThemeSet::load_defaults();
    let syntax = syntax_set
        .find_syntax_by_extension("rs")
        .expect("built-in Rust syntax");
    let theme = &theme_set.themes["base16-ocean.dark"];
    let init_ns = init_started.elapsed().as_nanos();

    let render_started = Instant::now();
    let output = highlighted_html_for_string(black_box(&source), &syntax_set, syntax, theme)
        .expect("render fixture");
    let render_ns = render_started.elapsed().as_nanos();
    let output_bytes = black_box(output.len());

    assert!(
        output_bytes > source.len(),
        "syntect output must contain highlighted markup"
    );
    println!(
        "{}",
        json!({
            "schemaVersion": 1,
            "implementation": "syntect",
            "scenario": "library-first-render",
            "fixture": path,
            "readNs": read_ns,
            "initNs": init_ns,
            "renderNs": render_ns,
            "internalTotalNs": total_started.elapsed().as_nanos(),
            "inputBytes": source.len(),
            "outputBytes": output_bytes
        })
    );
}

use lumis::{formatters::Formatter as _, languages::Language, themes, HtmlInlineBuilder};
use serde_json::json;
use std::env;
use std::fs;
use std::hint::black_box;
use std::time::Instant;

fn main() {
    let total_started = Instant::now();
    let path = env::args()
        .nth(1)
        .expect("usage: lumis-first-render <fixture>");

    let read_started = Instant::now();
    let source = fs::read_to_string(&path).expect("read fixture");
    let read_ns = read_started.elapsed().as_nanos();

    let init_started = Instant::now();
    let theme = themes::get("github_dark").expect("built-in github_dark theme");
    let formatter = HtmlInlineBuilder::new()
        .language(Language::Rust)
        .theme(Some(theme))
        .build()
        .expect("valid Lumis formatter");
    let init_ns = init_started.elapsed().as_nanos();

    let render_started = Instant::now();
    let mut output = Vec::with_capacity(source.len().saturating_mul(3));
    formatter
        .format(black_box(&source), &mut output)
        .expect("render fixture");
    let render_ns = render_started.elapsed().as_nanos();
    let output_bytes = black_box(output.len());

    assert!(
        output_bytes > source.len(),
        "Lumis output must contain highlighted markup"
    );
    println!(
        "{}",
        json!({
            "schemaVersion": 1,
            "implementation": "lumis",
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

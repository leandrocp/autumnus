use lumis::{formatters::Formatter as _, languages::Language, themes, HtmlInlineBuilder};
use serde_json::{json, Value};
use std::fs;
use std::hint::black_box;
use std::path::PathBuf;
use std::time::Instant;

fn fixture_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../fixtures/application.json")
}

fn main() {
    let total_started = Instant::now();
    let fixture_started = Instant::now();
    let fixture_source = fs::read_to_string(fixture_path()).expect("read application fixture");
    let fixture: Value = serde_json::from_str(&fixture_source).expect("parse application fixture");
    let languages = fixture["languages"]
        .as_array()
        .expect("application fixture languages");
    assert_eq!(languages.len(), 2, "application fixture language count");
    let fixture_ns = fixture_started.elapsed().as_nanos();

    let init_started = Instant::now();
    let theme = themes::get("github_dark").expect("built-in github_dark theme");
    let javascript = HtmlInlineBuilder::new()
        .language(Language::JavaScript)
        .theme(Some(theme.clone()))
        .build()
        .expect("valid JavaScript formatter");
    let json_formatter = HtmlInlineBuilder::new()
        .language(Language::JSON)
        .theme(Some(theme))
        .build()
        .expect("valid JSON formatter");
    let mut preload_output = Vec::new();
    javascript
        .format("", &mut preload_output)
        .expect("preload JavaScript language");
    json_formatter
        .format("", &mut preload_output)
        .expect("preload JSON language");
    black_box(preload_output);
    let init_ns = init_started.elapsed().as_nanos();

    let render_started = Instant::now();
    let mut input_bytes = 0;
    let mut output_bytes = 0;
    let mut snippet_count = 0;
    for entry in languages {
        let language = entry["id"].as_str().expect("application language id");
        let formatter = match language {
            "javascript" => &javascript,
            "json" => &json_formatter,
            other => panic!("unsupported application language: {other}"),
        };
        for source in entry["snippets"]
            .as_array()
            .expect("application language snippets")
        {
            let source = source.as_str().expect("application snippet source");
            let mut output = Vec::with_capacity(source.len().saturating_mul(3));
            formatter
                .format(black_box(source), &mut output)
                .expect("render application snippet");
            assert!(
                output.len() > source.len(),
                "Lumis output must contain markup"
            );
            input_bytes += source.len();
            output_bytes += black_box(output.len());
            snippet_count += 1;
        }
    }
    let render_ns = render_started.elapsed().as_nanos();
    assert_eq!(snippet_count, 6, "application fixture snippet count");

    println!(
        "{}",
        json!({
            "schemaVersion": 1,
            "implementation": "lumis-rust",
            "scenario": "application-two-languages-six-snippets",
            "languages": ["javascript", "json"],
            "snippetCount": snippet_count,
            "fixtureNs": fixture_ns,
            "importNs": 0,
            "initNs": init_ns,
            "renderNs": render_ns,
            "internalTotalNs": total_started.elapsed().as_nanos(),
            "inputBytes": input_bytes,
            "outputBytes": output_bytes,
            "maxRssBytes": null
        })
    );
}

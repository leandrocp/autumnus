use lumis::{
    formatters::{Formatter as _, HtmlInline},
    languages::Language,
    themes, HtmlInlineBuilder,
};
use serde_json::{json, Value};
use std::env;
use std::fs;
use std::hint::black_box;
use std::path::PathBuf;
use std::time::Instant;
use syntect::highlighting::ThemeSet;
use syntect::html::highlighted_html_for_string;
use syntect::parsing::SyntaxSet;

struct Workload {
    languages: Vec<(String, Vec<String>)>,
    input_bytes: usize,
}

struct LumisRuntime {
    javascript: HtmlInline,
    json: HtmlInline,
}

struct SyntectRuntime {
    syntaxes: SyntaxSet,
    themes: ThemeSet,
}

fn load_workload() -> Workload {
    let path = env::var_os("BENCH_APPLICATION_FIXTURE")
        .map(PathBuf::from)
        .unwrap_or_else(|| {
            PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../fixtures/application.json")
        });
    let fixture: Value =
        serde_json::from_str(&fs::read_to_string(path).expect("read application fixture"))
            .expect("parse application fixture");
    let languages = fixture["languages"]
        .as_array()
        .expect("application fixture languages")
        .iter()
        .map(|entry| {
            let id = entry["id"]
                .as_str()
                .expect("application language id")
                .to_owned();
            let snippets = entry["snippets"]
                .as_array()
                .expect("application snippets")
                .iter()
                .map(|source| {
                    source
                        .as_str()
                        .expect("application snippet source")
                        .to_owned()
                })
                .collect::<Vec<_>>();
            (id, snippets)
        })
        .collect::<Vec<_>>();
    assert_eq!(
        languages
            .iter()
            .map(|(_, snippets)| snippets.len())
            .sum::<usize>(),
        6
    );
    let input_bytes = languages
        .iter()
        .flat_map(|(_, snippets)| snippets)
        .map(String::len)
        .sum();
    Workload {
        languages,
        input_bytes,
    }
}

fn initialize_lumis() -> LumisRuntime {
    let theme = themes::get("github_dark").expect("built-in github_dark theme");
    LumisRuntime {
        javascript: HtmlInlineBuilder::new()
            .language(Language::JavaScript)
            .theme(Some(theme.clone()))
            .build()
            .expect("valid JavaScript formatter"),
        json: HtmlInlineBuilder::new()
            .language(Language::JSON)
            .theme(Some(theme))
            .build()
            .expect("valid JSON formatter"),
    }
}

fn render_lumis(runtime: &LumisRuntime, workload: &Workload) -> usize {
    let mut output_bytes = 0;
    for (language, snippets) in &workload.languages {
        let formatter = match language.as_str() {
            "javascript" => &runtime.javascript,
            "json" => &runtime.json,
            other => panic!("unsupported application language: {other}"),
        };
        for source in snippets {
            let mut output = Vec::with_capacity(source.len().saturating_mul(3));
            formatter
                .format(black_box(source), &mut output)
                .expect("render application snippet");
            output_bytes += black_box(output.len());
        }
    }
    output_bytes
}

fn initialize_syntect() -> SyntectRuntime {
    SyntectRuntime {
        syntaxes: SyntaxSet::load_defaults_newlines(),
        themes: ThemeSet::load_defaults(),
    }
}

fn render_syntect(runtime: &SyntectRuntime, workload: &Workload) -> usize {
    let javascript = runtime
        .syntaxes
        .find_syntax_by_extension("js")
        .expect("syntect built-in JavaScript syntax");
    let json = runtime
        .syntaxes
        .find_syntax_by_extension("json")
        .expect("syntect built-in JSON syntax");
    let theme = &runtime.themes.themes["base16-ocean.dark"];
    let mut output_bytes = 0;
    for (language, snippets) in &workload.languages {
        let syntax = match language.as_str() {
            "javascript" => javascript,
            "json" => json,
            other => panic!("unsupported application language: {other}"),
        };
        for source in snippets {
            let output =
                highlighted_html_for_string(black_box(source), &runtime.syntaxes, syntax, theme)
                    .expect("render application snippet");
            output_bytes += black_box(output.len());
        }
    }
    output_bytes
}

fn elapsed_ns(started: Instant) -> u64 {
    u64::try_from(started.elapsed().as_nanos()).expect("benchmark duration fits u64")
}

fn main() {
    let implementation = env::var("BENCH_IMPLEMENTATION").expect("BENCH_IMPLEMENTATION is set");
    let workload = load_workload();
    let total_started = Instant::now();

    let (init_ns, render_ns, output_bytes, loaded_language_scope, theme) =
        match implementation.as_str() {
            "lumis-rust" => {
                let started = Instant::now();
                let runtime = initialize_lumis();
                let init_ns = elapsed_ns(started);
                let started = Instant::now();
                let output_bytes = render_lumis(&runtime, &workload);
                (
                    init_ns,
                    elapsed_ns(started),
                    output_bytes,
                    "requested-formatters",
                    "github_dark",
                )
            }
            "syntect" => {
                let started = Instant::now();
                let runtime = initialize_syntect();
                let init_ns = elapsed_ns(started);
                let started = Instant::now();
                let output_bytes = render_syntect(&runtime, &workload);
                (
                    init_ns,
                    elapsed_ns(started),
                    output_bytes,
                    "bundled-defaults",
                    "base16-ocean.dark",
                )
            }
            other => panic!("unknown application implementation: {other}"),
        };
    let total_ns = elapsed_ns(total_started);
    assert!(output_bytes > workload.input_bytes);

    println!(
        "{}",
        json!({
            "schemaVersion": 1,
            "implementation": implementation,
            "scenario": "application-two-languages-six-snippets",
            "languages": ["javascript", "json"],
            "snippetCount": 6,
            "inputBytes": workload.input_bytes,
            "outputBytes": output_bytes,
            "initNs": init_ns,
            "renderNs": render_ns,
            "totalNs": total_ns,
            "loadedLanguageScope": loaded_language_scope,
            "theme": theme,
        })
    );
}

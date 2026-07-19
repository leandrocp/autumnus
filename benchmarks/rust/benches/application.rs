use criterion::{criterion_group, criterion_main, BenchmarkId, Criterion};
use lumis::{
    formatters::{Formatter as _, HtmlInline},
    languages::Language,
    themes, HtmlInlineBuilder,
};
use serde_json::json;
use serde_json::Value;
use std::env;
use std::fs;
use std::hint::black_box;
use std::path::PathBuf;
use std::time::Duration;
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

fn fixture_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../fixtures/application.json")
}

fn load_workload() -> Workload {
    let source = fs::read_to_string(fixture_path()).expect("read application fixture");
    let fixture: Value = serde_json::from_str(&source).expect("parse application fixture");
    let languages = fixture["languages"]
        .as_array()
        .expect("application fixture languages")
        .iter()
        .map(|entry| {
            let language = entry["id"]
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
            (language, snippets)
        })
        .collect::<Vec<_>>();
    assert_eq!(languages.len(), 2, "application language count");
    assert_eq!(
        languages
            .iter()
            .map(|(_, snippets)| snippets.len())
            .sum::<usize>(),
        6,
        "application snippet count"
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
    let javascript = HtmlInlineBuilder::new()
        .language(Language::JavaScript)
        .theme(Some(theme.clone()))
        .build()
        .expect("valid JavaScript formatter");
    let json = HtmlInlineBuilder::new()
        .language(Language::JSON)
        .theme(Some(theme))
        .build()
        .expect("valid JSON formatter");
    LumisRuntime { javascript, json }
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
            assert!(
                output.len() > source.len(),
                "Lumis output must contain markup"
            );
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
            assert!(
                output.len() > source.len(),
                "syntect output must contain markup"
            );
            output_bytes += black_box(output.len());
        }
    }
    output_bytes
}

fn duration(name: &str, default: f64) -> Duration {
    Duration::from_secs_f64(
        env::var(name)
            .ok()
            .and_then(|value| value.parse().ok())
            .unwrap_or(default),
    )
}

fn write_metadata(implementation: &str, workload: &Workload, output_bytes: usize) {
    let Ok(directory) = env::var("BENCH_METADATA_DIR") else {
        return;
    };
    let file = match implementation {
        "lumis-rust" => "lumis-rust-metadata.json",
        "syntect" => "syntect-metadata.json",
        other => panic!("unsupported metadata implementation: {other}"),
    };
    let snippet_count = workload
        .languages
        .iter()
        .map(|(_, snippets)| snippets.len())
        .sum::<usize>();
    let path = PathBuf::from(directory).join(file);
    fs::create_dir_all(path.parent().expect("metadata parent directory"))
        .expect("create metadata directory");
    fs::write(
        path,
        format!(
            "{}\n",
            json!({
                "schemaVersion": 2,
                "runner": "criterion",
                "implementation": implementation,
                "scenario": "application-two-languages-six-snippets",
                "languages": ["javascript", "json"],
                "snippetCount": snippet_count,
                "inputBytes": workload.input_bytes,
                "outputBytes": output_bytes,
            })
        ),
    )
    .expect("write application metadata");
}

fn application(c: &mut Criterion) {
    let workload = load_workload();
    let lumis = initialize_lumis();
    let syntect = initialize_syntect();
    let lumis_output_bytes = render_lumis(&lumis, &workload);
    let syntect_output_bytes = render_syntect(&syntect, &workload);
    assert!(lumis_output_bytes > workload.input_bytes);
    assert!(syntect_output_bytes > workload.input_bytes);
    write_metadata("lumis-rust", &workload, lumis_output_bytes);
    write_metadata("syntect", &workload, syntect_output_bytes);

    let sample_size = env::var("BENCH_SAMPLES")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(20)
        .max(10);
    let mut group = c.benchmark_group("application");
    group.sample_size(sample_size);
    group.warm_up_time(duration("BENCH_WARMUP_SECONDS", 1.0));
    group.measurement_time(duration("BENCH_TIME_SECONDS", 2.0));

    group.bench_function(BenchmarkId::new("lumis-rust", "init"), |b| {
        b.iter_with_large_drop(|| black_box(initialize_lumis()))
    });
    group.bench_function(BenchmarkId::new("lumis-rust", "render"), |b| {
        b.iter(|| black_box(render_lumis(&lumis, &workload)))
    });
    group.bench_function(BenchmarkId::new("lumis-rust", "total"), |b| {
        b.iter_with_large_drop(|| {
            let runtime = initialize_lumis();
            let output_bytes = black_box(render_lumis(&runtime, &workload));
            (runtime, output_bytes)
        })
    });
    group.bench_function(BenchmarkId::new("syntect", "init"), |b| {
        b.iter_with_large_drop(|| black_box(initialize_syntect()))
    });
    group.bench_function(BenchmarkId::new("syntect", "render"), |b| {
        b.iter(|| black_box(render_syntect(&syntect, &workload)))
    });
    group.bench_function(BenchmarkId::new("syntect", "total"), |b| {
        b.iter_with_large_drop(|| {
            let runtime = initialize_syntect();
            let output_bytes = black_box(render_syntect(&runtime, &workload));
            (runtime, output_bytes)
        })
    });
    group.finish();
}

criterion_group!(benches, application);
criterion_main!(benches);

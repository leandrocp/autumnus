use criterion::{criterion_group, criterion_main, BenchmarkId, Criterion, Throughput};
use lumis::{formatters::Formatter as _, languages::Language, themes, HtmlInlineBuilder};
use std::fs;
use std::hint::black_box;
use std::path::{Path, PathBuf};
use std::time::Duration;
use syntect::highlighting::ThemeSet;
use syntect::html::highlighted_html_for_string;
use syntect::parsing::SyntaxSet;

struct Fixture {
    name: &'static str,
    source: String,
}

fn repo_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .to_path_buf()
}

fn fixtures() -> Vec<Fixture> {
    let root = repo_root();
    [
        ("small", root.join("benchmarks/fixtures/rust-small.rs")),
        (
            "large",
            root.join("target/benchmarks/fixtures/rust-large.rs"),
        ),
    ]
    .into_iter()
    .map(|(name, path)| Fixture {
        name,
        source: fs::read_to_string(&path)
            .unwrap_or_else(|error| panic!("failed to read {}: {error}", path.display())),
    })
    .collect()
}

fn render(c: &mut Criterion) {
    let fixtures = fixtures();

    let lumis_theme = themes::get("github_dark").expect("built-in github_dark theme");
    let lumis_formatter = HtmlInlineBuilder::new()
        .language(Language::Rust)
        .theme(Some(lumis_theme))
        .build()
        .expect("valid Lumis HTML formatter");

    let syntax_set = SyntaxSet::load_defaults_newlines();
    let theme_set = ThemeSet::load_defaults();
    let syntax = syntax_set
        .find_syntax_by_extension("rs")
        .expect("syntect built-in Rust syntax");
    let syntect_theme = &theme_set.themes["base16-ocean.dark"];

    // Force all lazy configuration before Criterion starts sampling.
    let mut warmup = Vec::new();
    lumis_formatter
        .format(&fixtures[0].source, &mut warmup)
        .expect("Lumis warmup render");
    highlighted_html_for_string(&fixtures[0].source, &syntax_set, syntax, syntect_theme)
        .expect("syntect warmup render");

    let mut group = c.benchmark_group("rust/library-warm-render/html-inline");
    group.warm_up_time(Duration::from_secs(2));
    group.measurement_time(Duration::from_secs(5));
    group.sample_size(30);

    for fixture in &fixtures {
        group.throughput(Throughput::Bytes(fixture.source.len() as u64));

        group.bench_with_input(
            BenchmarkId::new("lumis", fixture.name),
            &fixture.source,
            |bencher, source| {
                bencher.iter(|| {
                    let mut output = Vec::with_capacity(source.len().saturating_mul(3));
                    lumis_formatter
                        .format(black_box(source), &mut output)
                        .expect("Lumis render");
                    black_box(output)
                });
            },
        );

        group.bench_with_input(
            BenchmarkId::new("syntect", fixture.name),
            &fixture.source,
            |bencher, source| {
                bencher.iter(|| {
                    let output = highlighted_html_for_string(
                        black_box(source),
                        &syntax_set,
                        syntax,
                        syntect_theme,
                    )
                    .expect("syntect render");
                    black_box(output)
                });
            },
        );
    }

    group.finish();
}

criterion_group!(benches, render);
criterion_main!(benches);

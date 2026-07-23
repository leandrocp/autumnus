use anyhow::{bail, Context, Result};
use clap::{Parser, Subcommand};
use lumis::events::HighlightEvent;
use lumis::formatters::Formatter as _;
use lumis::highlight::{highlight_events_with_options, HighlightOptions};
use lumis::languages::Language;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::{BTreeMap, HashSet};
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::Command;
use xz2::write::XzEncoder;

#[derive(Parser)]
#[command(version)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    GenCss,
    SyncThemes,
    SyncCss,
    ListThemes,
    GenThemesMd,
    LangsList,
    UpgradeParsers {
        #[arg(default_value = "")]
        name: String,
    },
    FetchParsers {
        #[arg(default_value = "")]
        name: String,
    },
    CompressParsers {
        #[arg(default_value = "")]
        name: String,
    },
    UpgradeQueries {
        #[arg(default_value = "")]
        name: String,
    },
    FetchQueries {
        #[arg(default_value = "")]
        name: String,
    },
    CargoUpdateDep {
        #[arg(default_value = "")]
        name: String,
    },
    CargoUpdateFeatures,
    PreprocessQueries {
        #[arg(default_value = "")]
        name: String,
    },
    GenHighlights,
    GenLanguagesMd,
    BuildWasm {
        #[arg(default_value = "")]
        name: String,
    },
    StageWasm {
        name: String,
    },
    WasmMeta {
        name: String,
    },
    RenderConformance {
        source: String,
        #[arg(short = 'l', long)]
        language: String,
        #[arg(short = 'f', long)]
        formatter: String,
        #[arg(short = 't', long)]
        theme: Option<String>,
        #[arg(long)]
        themes: Vec<String>,
        #[arg(long)]
        default_theme: Option<String>,
        #[arg(long)]
        rainbow_brackets: bool,
    },
    DumpEvents {
        source: String,
        #[arg(short = 'l', long)]
        language: String,
    },
    VerifyConformance {
        #[arg(default_value = "")]
        name: String,
    },
    RegenConformance {
        #[arg(default_value = "")]
        name: String,
    },
}

fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::GenCss => gen_css(),
        Commands::SyncThemes => sync_themes(),
        Commands::SyncCss => sync_css(),
        Commands::ListThemes => list_themes(),
        Commands::GenThemesMd => gen_themes_md(),
        Commands::LangsList => langs_list(),
        Commands::UpgradeParsers { name } => upgrade_parsers(&name),
        Commands::FetchParsers { name } => fetch_parsers(&name),
        Commands::CompressParsers { name } => compress_parsers(&name),
        Commands::UpgradeQueries { name } => upgrade_queries(&name),
        Commands::FetchQueries { name } => fetch_queries(&name),
        Commands::CargoUpdateDep { name } => cargo_update_dep(&name),
        Commands::CargoUpdateFeatures => cargo_update_features(),
        Commands::PreprocessQueries { name } => preprocess_queries(&name),
        Commands::GenHighlights => gen_highlights(),
        Commands::GenLanguagesMd => gen_languages_md(),
        Commands::BuildWasm { name } => build_wasm(&name),
        Commands::StageWasm { name } => stage_wasm(&name),
        Commands::WasmMeta { name } => wasm_meta(&name),
        Commands::RenderConformance {
            source,
            language,
            formatter,
            theme,
            themes,
            default_theme,
            rainbow_brackets,
        } => render_conformance(
            &source,
            &language,
            &formatter,
            theme,
            themes,
            default_theme,
            rainbow_brackets,
        ),
        Commands::DumpEvents { source, language } => dump_events(&source, &language),
        Commands::VerifyConformance { name } => verify_conformance(&name),
        Commands::RegenConformance { name } => regen_conformance(&name),
    }
}

#[allow(clippy::too_many_arguments)]
fn render_conformance(
    source: &str,
    language: &str,
    formatter: &str,
    theme: Option<String>,
    themes: Vec<String>,
    default_theme: Option<String>,
    rainbow_brackets: bool,
) -> Result<()> {
    let language = parse_language(language)?;
    print!(
        "{}",
        render_formatter_output(
            source,
            language,
            formatter,
            theme,
            themes,
            default_theme,
            rainbow_brackets,
        )?
    );
    Ok(())
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
#[serde(tag = "type", rename_all = "camelCase")]
enum SerializableHighlightEvent {
    Start { scope: String, language: String },
    Source { start: usize, end: usize },
    End,
}

#[derive(Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
struct FixtureMetadata {
    name: String,
    language: String,
    theme: String,
    rainbow_brackets: bool,
}

fn is_false(value: &bool) -> bool {
    !*value
}

#[derive(Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
struct FixtureFile {
    name: String,
    language: String,
    theme: String,
    // Omitted from the JSON when false so non-rainbow fixtures stay unchanged.
    #[serde(default, skip_serializing_if = "is_false")]
    rainbow_brackets: bool,
    #[serde(default)]
    events: Vec<SerializableHighlightEvent>,
}

struct FixtureOutputs {
    metadata: FixtureMetadata,
    events: Vec<SerializableHighlightEvent>,
    html_inline: String,
    html_linked: String,
    html_multi_themes: String,
    terminal: String,
    bbcode: String,
}

fn serialize_events(events: Vec<HighlightEvent>) -> Vec<SerializableHighlightEvent> {
    events
        .into_iter()
        .map(|event| match event {
            HighlightEvent::Start {
                scope_index,
                language,
            } => SerializableHighlightEvent::Start {
                scope: lumis::highlights::HIGHLIGHT_NAMES[scope_index].to_string(),
                language,
            },
            HighlightEvent::Source { start, end } => {
                SerializableHighlightEvent::Source { start, end }
            }
            HighlightEvent::End => SerializableHighlightEvent::End,
        })
        .collect()
}

fn parse_language(language: &str) -> Result<Language> {
    language
        .parse()
        .map_err(|_| anyhow::anyhow!("invalid language '{}'", language))
}

fn fixture_root() -> PathBuf {
    PathBuf::from("fixtures/conformance")
}

fn selected_fixture_dirs(name: &str) -> Result<Vec<PathBuf>> {
    let root = fixture_root();
    if name.is_empty() {
        let mut dirs = fs::read_dir(&root)?
            .filter_map(|entry| {
                let entry = entry.ok()?;
                if !entry.file_type().ok()?.is_dir() {
                    return None;
                }
                Some(entry.path())
            })
            .collect::<Vec<_>>();
        dirs.sort();
        return Ok(dirs);
    }

    let dir = root.join(name);
    if !dir.is_dir() {
        bail!("fixture '{}' not found", name);
    }
    Ok(vec![dir])
}

#[allow(clippy::too_many_arguments)]
fn render_formatter_output(
    source: &str,
    language: Language,
    formatter: &str,
    theme: Option<String>,
    themes: Vec<String>,
    default_theme: Option<String>,
    rainbow_brackets: bool,
) -> Result<String> {
    let mut output = Vec::new();

    match formatter {
        "html-inline" => {
            let theme_name = theme.unwrap_or_else(|| "dracula".to_string());
            let theme = lumis::themes::get(&theme_name)?;
            let formatter = lumis::HtmlInlineBuilder::new()
                .language(language)
                .theme(Some(theme))
                .rainbow_brackets(rainbow_brackets)
                .build()
                .map_err(|e| anyhow::anyhow!("{e}"))?;
            formatter.format(source, &mut output)?;
        }
        "html-linked" => {
            let formatter = lumis::HtmlLinkedBuilder::new()
                .language(language)
                .rainbow_brackets(rainbow_brackets)
                .build()
                .map_err(|e| anyhow::anyhow!("{e}"))?;
            formatter.format(source, &mut output)?;
        }
        "html-multi-themes" => {
            if themes.is_empty() {
                bail!("html-multi-themes requires at least one --themes entry");
            }

            let mut theme_map = std::collections::HashMap::new();
            for spec in themes {
                let (name, theme_id) = spec
                    .split_once(':')
                    .ok_or_else(|| anyhow::anyhow!("invalid theme spec '{}'", spec))?;
                theme_map.insert(name.to_string(), lumis::themes::get(theme_id)?);
            }

            let mut builder = lumis::HtmlMultiThemesBuilder::new();
            builder
                .language(language)
                .themes(theme_map)
                .rainbow_brackets(rainbow_brackets);

            if let Some(default_theme) = default_theme {
                builder.default_theme(default_theme);
            }

            let formatter = builder.build().map_err(|e| anyhow::anyhow!("{e}"))?;
            formatter.format(source, &mut output)?;
        }
        "terminal" => {
            let theme_name = theme.unwrap_or_else(|| "dracula".to_string());
            let theme = lumis::themes::get(&theme_name)?;
            let formatter = lumis::TerminalBuilder::new()
                .language(language)
                .theme(Some(theme))
                .rainbow_brackets(rainbow_brackets)
                .build()
                .map_err(|e| anyhow::anyhow!("{e}"))?;
            formatter.format(source, &mut output)?;
        }
        "bbcode-scoped" => {
            let formatter = lumis::BBCodeScopedBuilder::new()
                .language(language)
                .rainbow_brackets(rainbow_brackets)
                .build()
                .map_err(|e| anyhow::anyhow!("{e}"))?;
            formatter.format(source, &mut output)?;
        }
        other => bail!("unsupported formatter '{}'", other),
    }

    String::from_utf8(output).map_err(Into::into)
}

fn fixture_outputs(
    source: &str,
    language: Language,
    theme: &str,
    name: &str,
    rainbow_brackets: bool,
) -> Result<FixtureOutputs> {
    let events =
        highlight_events_with_options(source, language, HighlightOptions { rainbow_brackets })?;
    let metadata = FixtureMetadata {
        name: name.to_string(),
        language: language.id_name().to_string(),
        theme: theme.to_string(),
        rainbow_brackets,
    };

    Ok(FixtureOutputs {
        metadata,
        events: serialize_events(events),
        html_inline: render_formatter_output(
            source,
            language,
            "html-inline",
            Some(theme.to_string()),
            vec![],
            None,
            rainbow_brackets,
        )?,
        html_linked: render_formatter_output(
            source,
            language,
            "html-linked",
            None,
            vec![],
            None,
            rainbow_brackets,
        )?,
        html_multi_themes: render_formatter_output(
            source,
            language,
            "html-multi-themes",
            None,
            vec![format!("main:{theme}")],
            Some("main".to_string()),
            rainbow_brackets,
        )?,
        terminal: render_formatter_output(
            source,
            language,
            "terminal",
            Some(theme.to_string()),
            vec![],
            None,
            rainbow_brackets,
        )?,
        bbcode: render_formatter_output(
            source,
            language,
            "bbcode-scoped",
            None,
            vec![],
            None,
            rainbow_brackets,
        )?,
    })
}

fn load_fixture_file(dir: &Path) -> Result<FixtureFile> {
    let json = fs::read_to_string(dir.join("fixture.json"))?;
    Ok(serde_json::from_str(&json)?)
}

fn dump_events(source: &str, language: &str) -> Result<()> {
    let language = parse_language(language)?;
    let events = serialize_events(highlight_events_with_options(
        source,
        language,
        HighlightOptions::default(),
    )?);

    println!("{}", serde_json::to_string_pretty(&events)?);
    Ok(())
}

fn verify_conformance(name: &str) -> Result<()> {
    let mut checked = 0usize;

    for dir in selected_fixture_dirs(name)? {
        let source = fs::read_to_string(dir.join("source.txt"))?;
        let stored = load_fixture_file(&dir)?;
        let language = parse_language(&stored.language)?;
        let generated = fixture_outputs(
            &source,
            language,
            &stored.theme,
            &stored.name,
            stored.rainbow_brackets,
        )?;

        ensure_fixture_file_match(
            &dir.join("fixture.json"),
            &stored,
            &FixtureFile {
                name: generated.metadata.name.clone(),
                language: generated.metadata.language.clone(),
                theme: generated.metadata.theme.clone(),
                rainbow_brackets: generated.metadata.rainbow_brackets,
                events: generated.events.clone(),
            },
        )?;
        ensure_fixture_match(
            &dir.join("html-inline.html"),
            &fs::read_to_string(dir.join("html-inline.html"))?,
            &generated.html_inline,
        )?;
        ensure_fixture_match(
            &dir.join("html-linked.html"),
            &fs::read_to_string(dir.join("html-linked.html"))?,
            &generated.html_linked,
        )?;
        ensure_fixture_match(
            &dir.join("html-multi-themes.html"),
            &fs::read_to_string(dir.join("html-multi-themes.html"))?,
            &generated.html_multi_themes,
        )?;
        ensure_fixture_match(
            &dir.join("terminal.txt"),
            &fs::read_to_string(dir.join("terminal.txt"))?,
            &generated.terminal,
        )?;
        ensure_fixture_match(
            &dir.join("bbcode.txt"),
            &fs::read_to_string(dir.join("bbcode.txt"))?,
            &generated.bbcode,
        )?;

        checked += 1;
        println!("ok {}", dir.display());
    }

    println!("verified {checked} fixture(s)");
    Ok(())
}

fn regen_conformance(name: &str) -> Result<()> {
    let mut regenerated = 0usize;

    for dir in selected_fixture_dirs(name)? {
        let source = fs::read_to_string(dir.join("source.txt"))?;
        let stored = load_fixture_file(&dir)?;
        let language = parse_language(&stored.language)?;
        let generated = fixture_outputs(
            &source,
            language,
            &stored.theme,
            &stored.name,
            stored.rainbow_brackets,
        )?;

        fs::write(
            dir.join("fixture.json"),
            serde_json::to_string_pretty(&FixtureFile {
                name: generated.metadata.name,
                language: generated.metadata.language,
                theme: generated.metadata.theme,
                rainbow_brackets: generated.metadata.rainbow_brackets,
                events: generated.events,
            })? + "\n",
        )?;
        fs::write(dir.join("html-inline.html"), generated.html_inline)?;
        fs::write(dir.join("html-linked.html"), generated.html_linked)?;
        fs::write(
            dir.join("html-multi-themes.html"),
            generated.html_multi_themes,
        )?;
        fs::write(dir.join("terminal.txt"), generated.terminal)?;
        fs::write(dir.join("bbcode.txt"), generated.bbcode)?;

        regenerated += 1;
        println!("regenerated {}", dir.display());
    }

    println!("regenerated {regenerated} fixture(s)");
    Ok(())
}

fn ensure_fixture_match(path: &Path, expected: &str, actual: &str) -> Result<()> {
    if expected == actual {
        return Ok(());
    }

    bail!("fixture mismatch: {}", path.display())
}

fn ensure_fixture_file_match(
    path: &Path,
    expected: &FixtureFile,
    actual: &FixtureFile,
) -> Result<()> {
    if expected == actual {
        return Ok(());
    }

    bail!("fixture mismatch: {}", path.display())
}

fn gen_css() -> Result<()> {
    let css_dir = Path::new("css");
    fs::create_dir_all(css_dir)?;

    let mut themes: Vec<_> = lumis::themes::ALL_THEMES.iter().collect();
    themes.sort_by(|a, b| a.name.cmp(&b.name));

    for theme in themes {
        let css = lumis::themes::CssBuilder::new(theme)
            .enable_italic(true)
            .build();
        let css_path = css_dir.join(format!("{}.css", theme.name));
        fs::write(&css_path, css)?;
        println!("{}", css_path.display());
    }

    Ok(())
}

fn sync_themes() -> Result<()> {
    let dest = Path::new("crates/lumis-core/themes");
    fs::create_dir_all(dest)?;

    for entry in fs::read_dir(dest)? {
        let entry = entry?;
        if entry.path().extension().is_some_and(|e| e == "json") {
            fs::remove_file(entry.path())?;
        }
    }

    for entry in glob::glob("themes/*.json")? {
        let src = entry?;
        let file_name = src.file_name().unwrap();
        fs::copy(&src, dest.join(file_name))?;
    }

    println!("Synced theme JSON files to crates/lumis-core/themes/");
    Ok(())
}

fn sync_css() -> Result<()> {
    let destinations = [
        "crates/lumis/css",
        "packages/elixir/lumis/priv/static/css",
        "packages/javascript/themes/dist/css",
    ];

    for dest in &destinations {
        let dest = Path::new(dest);
        fs::create_dir_all(dest)?;

        for entry in fs::read_dir(dest)? {
            let entry = entry?;
            if entry.path().extension().is_some_and(|e| e == "css") {
                fs::remove_file(entry.path())?;
            }
        }

        for entry in glob::glob("css/*.css")? {
            let src = entry?;
            let file_name = src.file_name().unwrap();
            fs::copy(&src, dest.join(file_name))?;
        }
    }

    println!(
        "Synced CSS files to crates/lumis/css/, packages/elixir/lumis/priv/static/css/, and packages/javascript/themes/dist/css/"
    );
    Ok(())
}

/// Extract (name, url) pairs from themes/themes.lua using full_moon AST parsing.
fn parse_themes_lua() -> Result<Vec<(String, String)>> {
    use full_moon::ast::{Expression, Field, LastStmt};
    use full_moon::tokenizer::TokenType;

    let source = fs::read_to_string("themes/themes.lua")?;
    let ast = full_moon::parse(&source).map_err(|e| anyhow::anyhow!("Lua parse error: {e:?}"))?;

    let mut entries = Vec::new();

    // The file is `return { {name=..., url=...}, ... }`
    // Get the return statement's table constructor
    let Some(LastStmt::Return(ret)) = ast.nodes().last_stmt() else {
        bail!("themes.lua: expected a return statement");
    };
    let Some(first_return) = ret.returns().first() else {
        bail!("themes.lua: expected return to contain a value");
    };
    let Expression::TableConstructor(outer) = first_return.value() else {
        bail!("themes.lua: expected return to contain a table");
    };

    // Each field in the outer table is a theme entry (NoKey variant)
    for field in outer.fields() {
        let Field::NoKey(expr) = field else {
            continue;
        };
        let Expression::TableConstructor(inner) = expr else {
            continue;
        };

        let mut name = None;
        let mut url = None;

        for inner_field in inner.fields() {
            let Field::NameKey { key, value, .. } = inner_field else {
                continue;
            };
            let key_str = key.token().to_string();

            if let Expression::String(token_ref) = value {
                if let TokenType::StringLiteral { literal, .. } = token_ref.token().token_type() {
                    match key_str.as_str() {
                        "name" => name = Some(literal.to_string()),
                        "url" => url = Some(literal.to_string()),
                        _ => {}
                    }
                }
            }
        }

        if let (Some(n), Some(u)) = (name, url) {
            entries.push((n, u));
        }
    }

    Ok(entries)
}

fn list_themes() -> Result<()> {
    let mut entries = parse_themes_lua()?;
    entries.sort_by(|a, b| a.0.cmp(&b.0));

    for (name, _) in &entries {
        println!("{name}");
    }
    Ok(())
}

fn gen_themes_md() -> Result<()> {
    let mut entries = parse_themes_lua()?;
    entries.sort_by(|a, b| a.0.cmp(&b.0));

    let mut table_lines = vec![
        "| Theme | Repository |".to_string(),
        "|-------|------------|".to_string(),
    ];

    for (name, url) in &entries {
        let repo_name = url.strip_prefix("https://github.com/").unwrap_or(url);
        table_lines.push(format!("| `{name}` | [{repo_name}]({url}) |"));
    }

    let mut themes_md = vec![
        "# Supported Themes".to_string(),
        String::new(),
        "> This file is auto-generated by `mise run docs-gen-themes-md`. Do not edit.".to_string(),
        String::new(),
    ];
    themes_md.extend(table_lines.clone());
    themes_md.push(String::new());

    fs::write("THEMES.md", themes_md.join("\n"))?;

    let mut docs_md = vec![
        "---".to_string(),
        "sidebar_position: 2".to_string(),
        "slug: /reference/themes".to_string(),
        "title: Themes".to_string(),
        "description: Built-in Lumis themes and their upstream repositories.".to_string(),
        "keywords:".to_string(),
        "  - lumis themes".to_string(),
        "  - supported themes".to_string(),
        "  - neovim themes".to_string(),
        "---".to_string(),
        String::new(),
        "# Themes".to_string(),
        String::new(),
        "Source: [`THEMES.md`](https://github.com/leandrocp/lumis/blob/main/THEMES.md)."
            .to_string(),
        String::new(),
        "Theme names in this list are the IDs you use across Lumis:".to_string(),
        String::new(),
        "- JavaScript modules: `@lumis-sh/themes/<theme>`".to_string(),
        "- CSS files: `@lumis-sh/themes/css/<theme>.css`".to_string(),
        "- JSON on CDN: `https://unpkg.com/@lumis-sh/themes/dist/json/<theme>.json`".to_string(),
        String::new(),
        "For usage examples, see [Themes](/themes) and [CSS Theme Files](/themes/css-files)."
            .to_string(),
        String::new(),
    ];
    docs_md.extend(table_lines);
    docs_md.push(String::new());

    fs::write("docs/content/reference/themes.md", docs_md.join("\n"))?;
    println!("Generated THEMES.md with {} themes", entries.len());
    Ok(())
}

#[derive(Debug, serde::Deserialize)]
struct LanguagesToml {
    queries: BTreeMap<String, QueryInfo>,
    parsers: BTreeMap<String, ParserInfo>,
    #[serde(default)]
    bundles: BTreeMap<String, BundleInfo>,
}

#[derive(Debug, serde::Deserialize)]
struct BundleInfo {
    parsers: BundleParsers,
}

#[derive(Debug, serde::Deserialize)]
#[serde(untagged)]
enum BundleParsers {
    List(Vec<String>),
    All(String),
}

#[derive(Debug, serde::Deserialize)]
struct QueryInfo {
    git: String,
    rev: String,
    #[allow(dead_code)]
    path: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize)]
struct ParserInfo {
    git: Option<String>,
    rev: Option<String>,
    version: Option<String>,
    #[serde(rename = "crate")]
    crate_field: Option<String>,
    location: Option<String>,
    query_name: Option<String>,
    generate: Option<bool>,
    wasm_name: Option<String>,
    feature: Option<String>,
    #[allow(dead_code)]
    #[serde(default)]
    globs: Vec<String>,
    #[allow(dead_code)]
    #[serde(default)]
    aliases: Vec<String>,
    #[allow(dead_code)]
    variant: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
struct HighlightsToml {
    scopes: Vec<String>,
}

fn read_languages_toml() -> Result<LanguagesToml> {
    let text = fs::read_to_string("languages.toml")?;
    Ok(toml::from_str(&text)?)
}

fn read_languages_toml_edit() -> Result<toml_edit::DocumentMut> {
    let text = fs::read_to_string("languages.toml")?;
    Ok(text.parse()?)
}

fn write_languages_toml_edit(doc: &toml_edit::DocumentMut) -> Result<()> {
    fs::write("languages.toml", doc.to_string())?;
    Ok(())
}

fn read_lumis_cargo_toml_edit() -> Result<toml_edit::DocumentMut> {
    let text = fs::read_to_string("crates/lumis/Cargo.toml")?;
    Ok(text.parse()?)
}

fn write_lumis_cargo_toml_edit(doc: &toml_edit::DocumentMut) -> Result<()> {
    fs::write("crates/lumis/Cargo.toml", doc.to_string())?;
    Ok(())
}

fn read_lumis_core_cargo_toml_edit() -> Result<toml_edit::DocumentMut> {
    let text = fs::read_to_string("crates/lumis-core/Cargo.toml")?;
    Ok(text.parse()?)
}

fn write_lumis_core_cargo_toml_edit(doc: &toml_edit::DocumentMut) -> Result<()> {
    fs::write("crates/lumis-core/Cargo.toml", doc.to_string())?;
    Ok(())
}

fn parser_feature_name(parser_name: &str, info: &ParserInfo) -> String {
    info.feature
        .clone()
        .unwrap_or_else(|| format!("lang-{}", parser_name.replace('_', "-")))
}

fn sync_bundle_features(
    toml: &LanguagesToml,
    lumis: &mut toml_edit::DocumentMut,
    lumis_core: &mut toml_edit::DocumentMut,
) -> Result<()> {
    let lumis_features = lumis["features"]
        .as_table_like_mut()
        .context("missing [features] in crates/lumis/Cargo.toml")?;
    let lumis_core_features = lumis_core["features"]
        .as_table_like_mut()
        .context("missing [features] in crates/lumis-core/Cargo.toml")?;

    for (bundle_name, bundle) in &toml.bundles {
        let bundle_feature = format!("lang-bundle-{bundle_name}");
        let parser_features = match &bundle.parsers {
            BundleParsers::List(parsers) => parsers
                .iter()
                .map(|parser_name| {
                    let info = toml.parsers.get(parser_name).with_context(|| {
                        format!("bundle '{bundle_name}' references unknown parser '{parser_name}'")
                    })?;
                    Ok(parser_feature_name(parser_name, info))
                })
                .collect::<Result<Vec<_>>>()?,
            BundleParsers::All(value) => {
                if value != "all" {
                    bail!("unsupported bundle parsers value for '{bundle_name}': {value}");
                }
                vec!["all-languages".to_string()]
            }
        };

        let lumis_core_array = toml_edit::Array::from_iter(parser_features.iter().cloned());
        let old_core_key_decor = lumis_core_features
            .key(&bundle_feature)
            .map(|k| k.leaf_decor().clone());
        lumis_core_features.insert(&bundle_feature, toml_edit::value(lumis_core_array));
        if let Some(decor) = old_core_key_decor {
            if let Some(mut key) = lumis_core_features.key_mut(&bundle_feature) {
                *key.leaf_decor_mut() = decor;
            }
        }

        let mut lumis_feature_values = parser_features;
        lumis_feature_values.push(format!("lumis-core/{bundle_feature}"));
        let lumis_array = toml_edit::Array::from_iter(lumis_feature_values);
        let old_lumis_key_decor = lumis_features
            .key(&bundle_feature)
            .map(|k| k.leaf_decor().clone());
        lumis_features.insert(&bundle_feature, toml_edit::value(lumis_array));
        if let Some(decor) = old_lumis_key_decor {
            if let Some(mut key) = lumis_features.key_mut(&bundle_feature) {
                *key.leaf_decor_mut() = decor;
            }
        }

        println!("  synced {bundle_feature}");
    }

    Ok(())
}

fn run_cmd(cmd: &str) -> Result<String> {
    let output = Command::new("sh")
        .arg("-c")
        .arg(cmd)
        .output()
        .with_context(|| format!("failed to run: {cmd}"))?;
    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

fn run_cmd_ok(cmd: &str) -> Result<()> {
    let status = Command::new("sh")
        .arg("-c")
        .arg(cmd)
        .status()
        .with_context(|| format!("failed to run: {cmd}"))?;
    if !status.success() {
        bail!("command failed: {cmd}");
    }
    Ok(())
}

fn git_ls_remote(url: &str) -> Result<String> {
    run_cmd(&format!("git ls-remote {url} HEAD | cut -f1"))
}

fn is_full_git_sha(rev: &str) -> bool {
    rev.len() == 40 && rev.bytes().all(|byte| byte.is_ascii_hexdigit())
}

fn git_resolve_rev(url: &str, rev: &str) -> Result<String> {
    if is_full_git_sha(rev) {
        return Ok(rev.to_string());
    }

    let output = Command::new("git")
        .args(["ls-remote", url, rev, &format!("{rev}^{{}}")])
        .output()
        .with_context(|| format!("failed to resolve git revision {rev} from {url}"))?;
    if !output.status.success() {
        bail!("failed to resolve git revision {rev} from {url}");
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    stdout
        .lines()
        .find(|line| line.ends_with("^{}"))
        .or_else(|| stdout.lines().next())
        .and_then(|line| line.split_whitespace().next())
        .map(str::to_string)
        .filter(|resolved| !resolved.is_empty())
        .with_context(|| format!("could not resolve git revision {rev} from {url}"))
}

fn git_resolve_version_tag(url: &str, version: &str) -> Option<String> {
    for tag in [format!("v{version}"), version.to_string()] {
        if let Ok(rev) = git_resolve_rev(url, &tag) {
            return Some(rev);
        }
    }
    None
}

fn semver_from_tag(tag: &str) -> Option<semver::Version> {
    semver::Version::parse(tag.strip_prefix('v').unwrap_or(tag)).ok()
}

fn git_latest_release_rev(url: &str) -> Result<Option<(String, String)>> {
    let output = Command::new("git")
        .args(["ls-remote", "--tags", url])
        .output()
        .with_context(|| format!("failed to list git tags from {url}"))?;
    if !output.status.success() {
        bail!("failed to list git tags from {url}");
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut tags = BTreeMap::<semver::Version, String>::new();
    for line in stdout.lines() {
        let Some((_, reference)) = line.split_once('\t') else {
            continue;
        };
        let Some(tag) = reference.strip_prefix("refs/tags/") else {
            continue;
        };
        if tag.ends_with("^{}") {
            continue;
        }
        let Some(version) = semver_from_tag(tag) else {
            continue;
        };
        if !version.pre.is_empty() {
            continue;
        }
        tags.insert(version, tag.to_string());
    }

    let Some((version, tag)) = tags.into_iter().next_back() else {
        return Ok(None);
    };
    let rev = git_resolve_rev(url, &tag)?;
    Ok(Some((version.to_string(), rev)))
}

fn latest_crate_version(crate_name: &str) -> Result<Option<String>> {
    let url = format!("https://crates.io/api/v1/crates/{crate_name}");
    let Ok(mut resp) = ureq::get(&url).call() else {
        return Ok(None);
    };
    let body = resp.body_mut().read_to_string()?;
    let value: Value = serde_json::from_str(&body)?;
    let Some(versions) = value
        .get("versions")
        .and_then(|versions| versions.as_array())
    else {
        return Ok(None);
    };

    let mut latest = None;
    for version in versions {
        if version
            .get("yanked")
            .and_then(|yanked| yanked.as_bool())
            .unwrap_or(true)
        {
            continue;
        }
        let Some(num) = version.get("num").and_then(|num| num.as_str()) else {
            continue;
        };
        let Ok(parsed) = semver::Version::parse(num) else {
            continue;
        };
        if !parsed.pre.is_empty() {
            continue;
        }
        latest = Some(latest.map_or(parsed.clone(), |current: semver::Version| {
            current.max(parsed)
        }));
    }

    Ok(latest.map(|version| version.to_string()))
}

fn tmpdir() -> Result<String> {
    run_cmd("mktemp -d")
}

fn query_names() -> Result<Vec<String>> {
    let mut names = std::collections::BTreeSet::new();

    for dir in [
        "queries/upstream",
        "queries/brackets",
        "queries/override",
        "queries/append",
    ] {
        let path = Path::new(dir);
        if !path.exists() {
            continue;
        }

        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let name = entry.file_name().to_string_lossy().to_string();
            if name != "README.md" && name != "default" && entry.file_type()?.is_dir() {
                names.insert(name);
            }
        }
    }

    Ok(names.into_iter().collect())
}

fn resolve_query_source<'a>(
    queries: &'a BTreeMap<String, QueryInfo>,
    query_name: &str,
) -> &'a QueryInfo {
    if query_name != "default" {
        if let Some(info) = queries.get(query_name) {
            return info;
        }
    }
    &queries["default"]
}

fn has_local_override_query(lang: &str) -> bool {
    ["highlights", "injections", "locals"]
        .iter()
        .any(|query_type| {
            Path::new("queries/override")
                .join(lang)
                .join(format!("{query_type}.scm"))
                .exists()
        })
}

fn langs_list() -> Result<()> {
    let toml = read_languages_toml()?;
    for name in toml.parsers.keys() {
        println!("{name}");
    }
    Ok(())
}

fn upgrade_parsers(name: &str) -> Result<()> {
    let mut doc = read_languages_toml_edit()?;
    let toml = read_languages_toml()?;

    for (parser_name, info) in &toml.parsers {
        let Some(ref git) = info.git else { continue };
        if !name.is_empty() && parser_name != name {
            continue;
        }

        let current_ver = info.version.as_deref().unwrap_or("");
        let current_rev = info.rev.as_deref().unwrap_or("");
        let (ver, new_rev) = if let Some(crate_name) = info.crate_field.as_deref() {
            let ver = latest_crate_version(crate_name)?.unwrap_or_else(|| current_ver.to_string());
            let rev = git_resolve_version_tag(git, &ver)
                .or_else(|| {
                    git_latest_release_rev(git)
                        .ok()
                        .flatten()
                        .map(|(_, rev)| rev)
                })
                .unwrap_or_else(|| git_ls_remote(git).unwrap_or_default());
            (ver, rev)
        } else if let Some((ver, rev)) = git_latest_release_rev(git)? {
            (ver, rev)
        } else {
            (current_ver.to_string(), git_ls_remote(git)?)
        };

        if new_rev.is_empty() {
            println!("Warning: could not resolve revision for {parser_name}, skipping");
            continue;
        }

        if current_rev == new_rev && ver == current_ver {
            println!("  {parser_name}: already up to date ({current_rev}, {current_ver})");
        } else {
            if current_rev != new_rev {
                println!("  {parser_name}: {current_rev} -> {new_rev}");
                doc["parsers"][parser_name.as_str()]["rev"] = toml_edit::value(&new_rev);
            }
            if ver != current_ver {
                println!("    version: {current_ver} -> {ver}");
                doc["parsers"][parser_name.as_str()]["version"] = toml_edit::value(&ver);
            }
        }
    }

    write_languages_toml_edit(&doc)?;
    Ok(())
}

fn fetch_parsers(name: &str) -> Result<()> {
    let toml = read_languages_toml()?;
    let tmp = tmpdir()?;

    for (parser_name, info) in &toml.parsers {
        if let Some(crate_name) = &info.crate_field {
            if name.is_empty() || parser_name == name {
                println!("Skipping {parser_name}: parser is provided by crate {crate_name}");
            }
            continue;
        }

        let Some(ref git) = info.git else { continue };
        if !name.is_empty() && parser_name != name {
            continue;
        }

        let rev = info.rev.as_deref().unwrap_or("HEAD");
        let parser_dir = vendored_parser_dir_name(parser_name, info);
        let clone_dir = format!("{tmp}/{parser_dir}");

        println!("Fetching {parser_name} from {git} at {rev}");

        run_cmd_ok(&format!("git clone {git} {clone_dir} 2>/dev/null"))?;
        run_cmd_ok(&format!("cd {clone_dir} && git checkout {rev} 2>/dev/null"))?;

        let dest = format!("crates/lumis/vendored_parsers/{parser_dir}");

        if info.generate.unwrap_or(false) {
            let _ = run_cmd_ok(&format!("rm -rf {dest}"));
            fs::create_dir_all(&dest)?;
            run_cmd_ok(&format!("cd {clone_dir} && tree-sitter generate"))?;
            let src = format!("{clone_dir}/src");
            if Path::new(&src).is_dir() {
                let _ = run_cmd_ok(&format!("cp -r {src} {dest}/"));
                println!("  Updated {parser_name} (generated)");
            } else {
                println!("  Warning: no generated src directory found for {parser_name}");
            }
        } else if let Some(ref location) = info.location {
            fs::create_dir_all(&dest)?;
            let src = format!("{clone_dir}/{location}/src");
            if Path::new(&src).is_dir() {
                let _ = run_cmd_ok(&format!("rm -rf {dest}/src"));
                let _ = run_cmd_ok(&format!("cp -r {src} {dest}/"));
                println!("  Updated {parser_name} (location: {location})");
            } else {
                println!(
                    "  Warning: no src directory found for {parser_name} in location {location}"
                );
            }
        } else {
            fs::create_dir_all(&dest)?;
            let src = format!("{clone_dir}/src");
            if Path::new(&src).is_dir() {
                let _ = run_cmd_ok(&format!("rm -rf {dest}/src"));
                let _ = run_cmd_ok(&format!("cp -r {src} {dest}/"));
                println!("  Updated {parser_name}");
            } else {
                println!("  Warning: no src directory found for {parser_name}");
            }
        }

        let _ = run_cmd_ok(&format!("rm -rf {clone_dir}"));
    }

    let _ = run_cmd_ok(&format!("rm -rf {tmp}"));
    Ok(())
}

fn vendored_parser_dir_name(parser_name: &str, info: &ParserInfo) -> String {
    if let Some(query_name) = &info.query_name {
        return format!("tree-sitter-{query_name}");
    }

    format!("tree-sitter-{parser_name}")
}

fn compress_source_file(parser_name: &str, src_dir: &Path, file_name: &str) -> Result<()> {
    let source = src_dir.join(file_name);
    let compressed = src_dir.join(format!("{file_name}.xz"));
    let bytes = fs::read(&source)
        .with_context(|| format!("failed to read parser source at {}", source.display()))?;
    let output = fs::File::create(&compressed).with_context(|| {
        format!(
            "failed to create compressed parser source at {}",
            compressed.display()
        )
    })?;
    let mut encoder = XzEncoder::new(output, 9);
    encoder.write_all(&bytes).with_context(|| {
        format!(
            "failed to write compressed parser source at {}",
            compressed.display()
        )
    })?;
    encoder.finish().with_context(|| {
        format!(
            "failed to finalize compressed parser source at {}",
            compressed.display()
        )
    })?;
    fs::remove_file(&source).with_context(|| {
        format!(
            "failed to remove uncompressed parser source at {}",
            source.display()
        )
    })?;
    println!("  Compressed {parser_name} {file_name} -> {file_name}.xz");

    Ok(())
}

fn compress_parsers(name: &str) -> Result<()> {
    let toml = read_languages_toml()?;

    for (parser_name, info) in &toml.parsers {
        if info.git.is_none() || info.crate_field.is_some() {
            continue;
        }
        if !name.is_empty() && parser_name != name {
            continue;
        }

        let parser_dir = format!(
            "crates/lumis/vendored_parsers/{}",
            vendored_parser_dir_name(parser_name, info)
        );
        if !Path::new(&parser_dir).exists() {
            continue;
        }

        let src_dir = if let Some(location) = &info.location {
            let nested = Path::new(&parser_dir).join(location).join("src");
            if nested.join("parser.c").exists() || nested.join("parser.c.xz").exists() {
                nested
            } else {
                Path::new(&parser_dir).join("src")
            }
        } else {
            Path::new(&parser_dir).join("src")
        };

        if !src_dir.exists() {
            println!(
                "  Warning: no src directory found for {parser_name} at {}",
                src_dir.display()
            );
            continue;
        }

        if !src_dir.join("parser.c").exists() && !src_dir.join("parser.c.xz").exists() {
            println!(
                "  Warning: no parser source found for {parser_name} at {}",
                src_dir.display()
            );
            continue;
        }

        for file_name in ["parser.c", "scanner.c", "scanner.cc"] {
            if src_dir.join(file_name).exists() {
                compress_source_file(parser_name, &src_dir, file_name)?;
            }
        }
    }

    Ok(())
}

fn upgrade_queries(name: &str) -> Result<()> {
    let mut doc = read_languages_toml_edit()?;
    let toml = read_languages_toml()?;

    let mut url_revs: BTreeMap<String, String> = BTreeMap::new();
    for info in toml.queries.values() {
        if !url_revs.contains_key(&info.git) {
            let rev = git_ls_remote(&info.git)?;
            println!("  {} -> {}", info.git, &rev[..12.min(rev.len())]);
            url_revs.insert(info.git.clone(), rev);
        }
    }

    for (query_name, info) in &toml.queries {
        if !name.is_empty() && query_name != name && query_name != "default" {
            continue;
        }

        let new_rev = &url_revs[&info.git];
        if info.rev != *new_rev {
            println!(
                "  {query_name}: {} -> {}",
                &info.rev[..12.min(info.rev.len())],
                &new_rev[..12.min(new_rev.len())]
            );
            doc["queries"][query_name.as_str()]["rev"] = toml_edit::value(new_rev);
        }
    }

    write_languages_toml_edit(&doc)?;
    println!("Done. Review changes with: git diff languages.toml");
    Ok(())
}

fn cargo_update_dep(name: &str) -> Result<()> {
    let toml = read_languages_toml()?;
    let mut cargo = read_lumis_cargo_toml_edit()?;
    let deps = cargo["dependencies"]
        .as_table_like_mut()
        .context("missing [dependencies] in crates/lumis/Cargo.toml")?;

    let mut crate_versions = BTreeMap::<String, String>::new();

    for (parser_name, info) in &toml.parsers {
        let Some(crate_name) = info.crate_field.as_ref() else {
            continue;
        };
        let Some(version) = info.version.as_ref() else {
            continue;
        };
        if !name.is_empty() && parser_name != name {
            continue;
        }

        if let Some(existing) = crate_versions.get(crate_name) {
            if existing != version {
                bail!("conflicting versions for crate {crate_name}: {existing} vs {version}");
            }
        } else {
            crate_versions.insert(crate_name.clone(), version.clone());
        }
    }

    for (crate_name, version) in crate_versions {
        let Some(dep_item) = deps.get_mut(&crate_name) else {
            bail!("missing dependency {crate_name} in crates/lumis/Cargo.toml");
        };

        match dep_item {
            toml_edit::Item::Value(toml_edit::Value::String(_)) => {
                *dep_item = toml_edit::value(version.clone());
            }
            toml_edit::Item::Value(toml_edit::Value::InlineTable(table)) => {
                table.insert("version", toml_edit::Value::from(version.clone()));
            }
            toml_edit::Item::Table(table) => {
                table["version"] = toml_edit::value(version.clone());
            }
            _ => bail!("unsupported dependency format for {crate_name}"),
        }

        println!("  synced {crate_name} -> {version}");
    }

    write_lumis_cargo_toml_edit(&cargo)
}

fn cargo_update_features() -> Result<()> {
    let toml = read_languages_toml()?;
    let mut cargo = read_lumis_cargo_toml_edit()?;
    let mut cargo_core = read_lumis_core_cargo_toml_edit()?;

    sync_bundle_features(&toml, &mut cargo, &mut cargo_core)?;

    write_lumis_cargo_toml_edit(&cargo)?;
    write_lumis_core_cargo_toml_edit(&cargo_core)
}

fn fetch_queries(name: &str) -> Result<()> {
    let toml = read_languages_toml()?;
    let tmp = tmpdir()?;
    let mut repo_clones: BTreeMap<String, String> = BTreeMap::new();

    for query_name in query_names()? {
        if !name.is_empty() && query_name != name {
            continue;
        }

        let info = resolve_query_source(&toml.queries, &query_name);
        let clone_key = format!("{}@{}", info.git, info.rev);

        if !repo_clones.contains_key(&clone_key) {
            use md5::{Digest, Md5};
            let hash = Md5::digest(clone_key.as_bytes())
                .iter()
                .map(|byte| format!("{byte:02x}"))
                .collect::<String>();
            let clone_dir = format!("{tmp}/repo-{hash}");
            println!(
                "Cloning {} at {}",
                info.git,
                &info.rev[..12.min(info.rev.len())]
            );
            let _ = run_cmd_ok(&format!("git clone {} {clone_dir} 2>/dev/null", info.git));
            let _ = run_cmd_ok(&format!(
                "cd {clone_dir} && git checkout {} 2>/dev/null",
                info.rev
            ));
            repo_clones.insert(clone_key.clone(), clone_dir);
        }

        let clone_dir = &repo_clones[&clone_key];
        let dest = format!("queries/upstream/{query_name}");

        let src_dir = if let Some(ref path) = info.path {
            if toml.queries.contains_key(&query_name) && query_name != "default" {
                format!("{clone_dir}/{path}")
            } else {
                format!("{clone_dir}/{path}/{query_name}")
            }
        } else {
            let base = format!("{clone_dir}/queries");
            let sub = format!("{base}/{query_name}");
            if Path::new(&sub).is_dir() {
                sub
            } else {
                base
            }
        };

        if Path::new(&src_dir).is_dir() {
            fs::create_dir_all(&dest)?;
            let _ = run_cmd_ok(&format!("cp -r {src_dir}/* {dest}/ 2>/dev/null"));
            println!("  Updated {query_name} queries");
        } else {
            println!("  Warning: no queries found for {query_name}");
        }
    }

    let _ = run_cmd_ok(&format!("rm -rf {tmp}"));
    Ok(())
}

fn apply_text_replacements(content: &str, lang: &str) -> String {
    let replacements = [
        ("@nospell", ""),
        ("@spell", ""),
        ("; inherits html_tags", "; inherits: html_tags"),
        (
            "#set! @string.special.url url @string.special.url",
            "#set! @string.special.url url \"string.special.url\"",
        ),
        (
            "#set! @_label url @_url",
            "#set! @_label url \"markup.link.url\"",
        ),
        (
            "#set! @_url url @_url",
            "#set! @_url highlight \"markup.link.url\"",
        ),
        (
            "#set! @_hyperlink url @markup.link.url",
            "#set! @_hyperlink highlight \"markup.link.url\"",
        ),
        (r"\c", "(?i)"),
        (r"\(?i)", "(?i)"),
        ("^{[-]|[^|]", r"^\{[-]|^\{[^|]"),
        (r#"^\\if"#, r#"^if"#),
        (
            "[
  \"\\\\.and\\\\.\"
  \"\\\\.or\\\\.\"
  \"\\\\.eqv\\\\.\"
  \"\\\\.neqv\\\\.\"
  \"\\\\.lt\\\\.\"
  \"\\\\.gt\\\\.\"
  \"\\\\.le\\\\.\"
  \"\\\\.ge\\\\.\"
  \"\\\\.eq\\\\.\"
  \"\\\\.ne\\\\.\"
  \"\\\\.not\\\\.\"
] @keyword.operator",
            "",
        ),
    ];

    let mut s = content.to_string();
    for (old, new) in &replacements {
        s = s.replace(old, new);
    }
    if lang == "swift" {
        s = s.replace(
            "(nil_literal) @constant.builtin",
            "\"nil\" @constant.builtin",
        );
    }
    if lang == "html_tags" {
        s = s.replace(
            r#"; lit-html style template interpolation
; <a @click=${e => console.log(e)}>
; <a @click="${e => console.log(e)}">
((attribute
  (quoted_attribute_value
    (attribute_value) @injection.content))
  (#lua-match? @injection.content "%${")
  (#offset! @injection.content 0 2 0 -1)
  (#set! injection.language "javascript"))

((attribute
  (attribute_value) @injection.content)
  (#lua-match? @injection.content "%${")
  (#offset! @injection.content 0 2 0 -2)
  (#set! injection.language "javascript"))

"#,
            "",
        );
    }
    s
}

fn strip_set_capture_patterns(content: &str) -> String {
    let bytes = content.as_bytes();
    let len = bytes.len();
    let mut result = Vec::new();
    let mut i = 0;
    let mut last_end = 0;

    while i < len {
        if bytes[i] == b'(' {
            let start = i;
            let mut depth = 1;
            let mut j = i + 1;
            let mut in_string = false;

            while j < len && depth > 0 {
                let ch = bytes[j];
                if ch == b'"' {
                    let preceding_backslashes = bytes[..j]
                        .iter()
                        .rev()
                        .take_while(|&&byte| byte == b'\\')
                        .count();
                    if preceding_backslashes % 2 == 0 {
                        in_string = !in_string;
                    }
                } else if !in_string {
                    if ch == b'(' {
                        depth += 1;
                    } else if ch == b')' {
                        depth -= 1;
                    }
                }
                j += 1;
            }

            let pattern = &content[start..j];
            if pattern.contains("(#set! @") {
                result.push(&content[last_end..start]);
                last_end = j;
            }
            i = j;
        } else {
            i += 1;
        }
    }

    result.push(&content[last_end..]);
    result.join("")
}

fn read_query_raw(src_dir: &str, lang: &str, query_type: &str) -> String {
    let path = format!("{src_dir}/{lang}/{query_type}.scm");
    fs::read_to_string(path).unwrap_or_default()
}

fn resolve_and_preprocess(
    src_dir: &str,
    override_dir: &str,
    append_dir: &str,
    lang: &str,
    query_type: &str,
    seen: &mut HashSet<String>,
) -> String {
    let key = format!("{lang}/{query_type}");
    if seen.contains(&key) {
        return String::new();
    }
    seen.insert(key);

    let override_path = format!("{override_dir}/{lang}/{query_type}.scm");
    if let Ok(override_content) = fs::read_to_string(&override_path) {
        let mut parts = vec![override_content];

        let append_path = format!("{append_dir}/{lang}/{query_type}.scm");
        if let Ok(append_content) = fs::read_to_string(&append_path) {
            parts.push(append_content);
        }

        return parts.join("\n");
    }

    let raw = if query_type == "brackets" {
        fs::read_to_string(format!("queries/brackets/{lang}/brackets.scm")).unwrap_or_default()
    } else {
        read_query_raw(src_dir, lang, query_type)
    };
    let append_path = format!("{append_dir}/{lang}/{query_type}.scm");
    let append_content = fs::read_to_string(&append_path).ok();

    if raw.is_empty() && append_content.is_none() {
        return String::new();
    }

    let mut parts = Vec::new();
    if !raw.is_empty() {
        let content = apply_text_replacements(&raw, lang);
        let content = strip_set_capture_patterns(&content);

        let mut stripped_lines = Vec::new();

        for line in content.lines() {
            if line.starts_with("; inherits: ") {
                let inherits_str = line.trim_start_matches("; inherits: ").trim();
                for parent in inherits_str.split([',', ' ']).filter(|s| !s.is_empty()) {
                    let parent_content = resolve_and_preprocess(
                        src_dir,
                        override_dir,
                        append_dir,
                        parent,
                        query_type,
                        seen,
                    );
                    if !parent_content.is_empty() {
                        parts.push(format!("; inherits: {parent}"));
                        parts.push(parent_content);
                    }
                }
            } else {
                stripped_lines.push(line);
            }
        }

        parts.push(stripped_lines.join("\n"));
    }

    if let Some(append_content) = append_content {
        parts.push(append_content);
    }

    parts.join("\n")
}

fn preprocess_queries(name: &str) -> Result<()> {
    let src = "queries/upstream";
    let override_dir = "queries/override";
    let append_dir = "queries/append";
    let dest = "queries/processed";

    if name.is_empty() {
        let _ = fs::remove_dir_all(dest);
        if let Ok(default_brackets) = fs::read_to_string("queries/brackets/default/brackets.scm") {
            fs::create_dir_all(format!("{dest}/default"))?;
            fs::write(
                format!("{dest}/default/brackets.scm"),
                format!("; This file is auto-generated. Do not edit.\n{default_brackets}"),
            )?;
        }
    }

    for lang in query_names()? {
        if !name.is_empty() && lang != name {
            continue;
        }
        let _ = fs::remove_dir_all(format!("{dest}/{lang}"));

        fs::create_dir_all(format!("{dest}/{lang}"))?;
        let mut wrote = false;
        for query_type in &["highlights", "injections", "locals", "brackets"] {
            let mut seen = HashSet::new();
            let content =
                resolve_and_preprocess(src, override_dir, append_dir, &lang, query_type, &mut seen);
            if !content.is_empty() {
                let full = format!("; This file is auto-generated. Do not edit.\n{content}");
                fs::write(format!("{dest}/{lang}/{query_type}.scm"), &full)?;
                wrote = true;
            }
        }
        if wrote {
            println!("  {lang}");
        }
    }

    Ok(())
}

fn gen_highlights() -> Result<()> {
    let text = fs::read_to_string("highlights.toml")?;
    let hl: HighlightsToml = toml::from_str(&text)?;
    let mut scopes = hl.scopes;
    scopes.sort();
    let n = scopes.len();

    // Generate highlights.rs
    let mut rs = Vec::new();
    rs.push("// This file is auto-generated from highlights.toml".to_string());
    rs.push("// Run: mise run langs-gen-highlights".to_string());
    rs.push("// Do not edit.".to_string());
    rs.push(String::new());
    rs.push("/// Tree-sitter highlight scope names.".to_string());
    rs.push(format!("pub const HIGHLIGHT_NAMES: [&str; {n}] = ["));
    for scope in &scopes {
        rs.push(format!("    \"{scope}\","));
    }
    rs.push("];".to_string());
    rs.push(String::new());
    rs.push("/// CSS class names for syntax highlighting.".to_string());
    rs.push("///".to_string());
    rs.push(
        "/// Each class name corresponds to a scope name in [`HIGHLIGHT_NAMES`] at the same index."
            .to_string(),
    );
    rs.push(format!("pub const CLASSES: [&str; {n}] = ["));
    for scope in &scopes {
        rs.push(format!("    \"{}\",", scope.replace('.', "-")));
    }
    rs.push("];".to_string());
    rs.push(String::new());

    let rs_path = "crates/lumis-core/src/highlights.rs";
    fs::write(rs_path, rs.join("\n"))?;
    println!("Generated {rs_path} ({n} scopes)");

    // Generate highlights.ts
    let mut ts = vec![
        "// This file is auto-generated from highlights.toml".to_string(),
        "// Run: mise run langs-gen-highlights".to_string(),
        "// Do not edit.".to_string(),
        String::new(),
        "export const HIGHLIGHT_NAMES: string[] = [".to_string(),
    ];
    for scope in &scopes {
        ts.push(format!("  \"{scope}\","));
    }
    ts.push("]".to_string());
    ts.push(String::new());

    let ts_path = "packages/javascript/lumis/src/highlights.ts";
    fs::write(ts_path, ts.join("\n"))?;
    println!("Generated {ts_path} ({n} scopes)");

    Ok(())
}

fn gen_languages_md() -> Result<()> {
    let toml = read_languages_toml()?;

    let mut lines = vec![
        "# Supported Languages".to_string(),
        String::new(),
        "> This file is auto-generated by `mise run docs-gen-languages-md`. Do not edit."
            .to_string(),
        String::new(),
        "| Language | Parser | Vendored | Version / Rev | Queries | WASM |".to_string(),
        "|----------|--------|----------|---------------|---------|------|".to_string(),
    ];

    for (lang, info) in &toml.parsers {
        let git = info.git.as_deref().unwrap_or("");
        let rev = info.rev.as_deref().unwrap_or("");
        let short_rev = &rev[..7.min(rev.len())];
        let repo_path = git
            .trim_start_matches("https://github.com/")
            .trim_end_matches(".git");

        let (vendored, version_col, parser_link) = if let Some(ref crate_name) = info.crate_field {
            let v = info.version.as_deref().unwrap_or("?");
            (
                "no",
                format!("`{v}`"),
                format!("[{crate_name}](https://crates.io/crates/{crate_name}/{v})"),
            )
        } else {
            (
                "yes",
                format!("`{short_rev}`"),
                format!("[tree-sitter-{lang}](https://github.com/{repo_path}/tree/{rev})"),
            )
        };

        let default_wasm_name = format!("tree-sitter-{lang}");
        let wasm_name = info.wasm_name.as_deref().unwrap_or(&default_wasm_name);
        let wasm_suffix = wasm_package_suffix(wasm_name);
        let wasm_col = format!(
            "[@lumis-sh/wasm-{wasm_suffix}](https://www.npmjs.com/package/@lumis-sh/wasm-{wasm_suffix})"
        );

        let query_col = if has_local_override_query(lang) {
            "local override".to_string()
        } else {
            let qi = resolve_query_source(&toml.queries, lang);
            let query_repo_path = qi
                .git
                .trim_start_matches("https://github.com/")
                .trim_end_matches(".git");
            let query_repo_name = query_repo_path
                .rsplit('/')
                .next()
                .unwrap_or(query_repo_path);
            let query_short_rev = &qi.rev[..7.min(qi.rev.len())];
            format!(
                "[{query_repo_name}](https://github.com/{query_repo_path}/tree/{}) `{query_short_rev}`",
                qi.rev
            )
        };

        lines.push(format!(
            "| {lang} | {parser_link} | {vendored} | {version_col} | {query_col} | {wasm_col} |"
        ));
    }

    if !toml.bundles.is_empty() {
        lines.push(String::new());
        lines.push("## Bundles".to_string());
        lines.push(String::new());
        lines.push("| Bundle | Languages |".to_string());
        lines.push("|--------|-----------|".to_string());

        let preferred_order = ["web", "web-extra", "system", "backend", "full"];
        let mut bundle_names: Vec<_> = preferred_order
            .iter()
            .filter(|name| toml.bundles.contains_key(**name))
            .copied()
            .collect();
        bundle_names.extend(
            toml.bundles
                .keys()
                .map(String::as_str)
                .filter(|name| !preferred_order.contains(name)),
        );

        for bundle_name in bundle_names {
            let bundle = toml
                .bundles
                .get(bundle_name)
                .with_context(|| format!("missing bundle '{bundle_name}'"))?;
            let parser_names = match &bundle.parsers {
                BundleParsers::List(parsers) => parsers.clone(),
                BundleParsers::All(value) => {
                    if value != "all" {
                        bail!("unsupported bundle parsers value for '{bundle_name}': {value}");
                    }
                    toml.parsers.keys().cloned().collect()
                }
            };
            let languages_col = parser_names
                .iter()
                .map(|parser| format!("`{parser}`"))
                .collect::<Vec<_>>()
                .join(", ");
            lines.push(format!("| `{bundle_name}` | {languages_col} |"));
        }
    }

    fs::write("LANGUAGES.md", lines.join("\n") + "\n")?;
    println!("Generated LANGUAGES.md");
    Ok(())
}

fn build_wasm(name: &str) -> Result<()> {
    let toml = read_languages_toml()?;
    let tmp = tmpdir()?;
    let cwd = std::env::current_dir()?;
    let out_dir = cwd.join("tmp/wasms");
    let log_dir = cwd.join("tmp/wasm-build-logs");
    fs::create_dir_all(&out_dir)?;
    fs::create_dir_all(&log_dir)?;
    let mut built_wasm_names = HashSet::new();

    for (parser_name, info) in &toml.parsers {
        let Some(ref git) = info.git else { continue };
        let rev = info.rev.as_deref().unwrap_or("HEAD");
        let default_wasm_name = format!("tree-sitter-{parser_name}");
        let wasm_name = info.wasm_name.as_deref().unwrap_or(&default_wasm_name);

        if !name.is_empty() && parser_name != name && wasm_name != name {
            continue;
        }

        if !built_wasm_names.insert(wasm_name.to_string()) {
            continue;
        }

        let wasm_file = out_dir.join(format!("{wasm_name}.wasm"));

        let clone_dir = format!("{tmp}/tree-sitter-{parser_name}");
        println!("-> Building WASM for {parser_name} ...");

        println!("* cloning {git}");
        let _ = run_cmd_ok(&format!("git clone --depth 1 {git} {clone_dir}"));
        println!("* checking out {rev}");
        let _ = run_cmd_ok(&format!(
            "cd {clone_dir} && git fetch --depth 1 origin {rev} && git checkout {rev}"
        ));

        let repo_dir = if let Some(ref location) = info.location {
            format!("{clone_dir}/{location}")
        } else {
            clone_dir.clone()
        };
        let metadata_dir = clone_dir.clone();

        let tree_sitter_json = Path::new(&repo_dir).join("tree-sitter.json");
        let has_grammar_source = Path::new(&repo_dir).join("grammar.js").exists()
            || Path::new(&repo_dir).join("grammar.json").exists();
        let has_package_json = Path::new(&repo_dir).join("package.json").exists()
            || Path::new(&metadata_dir).join("package.json").exists();
        let has_package_lock = Path::new(&repo_dir).join("package-lock.json").exists()
            || Path::new(&metadata_dir).join("package-lock.json").exists();

        if has_package_json || tree_sitter_json.exists() {
            println!("* writing tree-sitter.json metadata");
            write_tree_sitter_json(parser_name, &repo_dir, &metadata_dir, info)?;
        }

        if has_grammar_source || info.generate.unwrap_or(false) {
            if has_package_json {
                let npm_cmd = if has_package_lock {
                    "npm ci --ignore-scripts"
                } else {
                    "npm install --ignore-scripts"
                };
                let install_dir = if Path::new(&repo_dir).join("package.json").exists() {
                    &repo_dir
                } else {
                    &metadata_dir
                };
                println!("* installing npm dependencies in {install_dir}");
                let _ = run_cmd_ok(&format!("cd {install_dir} && {npm_cmd}"));
            }
            println!("* generating parser sources in {repo_dir}");
            let _ = run_cmd_ok(&format!("cd {repo_dir} && tree-sitter generate"));
        }

        let wasm_path = wasm_file.display();
        let build_log = log_dir.join(format!("{wasm_name}.log"));
        println!("* building wasm in {repo_dir}");
        println!("* build log: {}", build_log.display());
        match build_repo_wasm(&repo_dir, &wasm_file, &build_log) {
            Ok(()) => println!("{wasm_path}"),
            Err(_) => println!("  ERROR: failed to build {parser_name}"),
        }

        let _ = run_cmd_ok(&format!("rm -rf {clone_dir}"));
    }

    let _ = run_cmd_ok(&format!("rm -rf {tmp}"));
    Ok(())
}

fn build_repo_wasm(repo_dir: &str, wasm_file: &Path, build_log: &Path) -> Result<()> {
    let verbose = std::env::var("LUMIS_WASM_VERBOSE").ok().as_deref() == Some("1");
    let build_cmd = format!("tree-sitter build --wasm -o \"{}\"", wasm_file.display());
    let shell_cmd = if verbose {
        format!(
            "{{ printf '[start] %s\n' \"$(date)\"; printf '[cmd] %s\n' '{}' ; EMCC_DEBUG=1 {}; printf '[end] %s\n' \"$(date)\"; }} 2>&1 | tee \"{}\"",
            build_cmd,
            build_cmd,
            build_log.display()
        )
    } else {
        format!(
            "{{ printf '[start] %s\n' \"$(date)\"; printf '[cmd] %s\n' '{}' ; {}; printf '[end] %s\n' \"$(date)\"; }} 2>&1 | tee \"{}\"",
            build_cmd,
            build_cmd,
            build_log.display()
        )
    };

    let mut cmd = Command::new("sh");
    cmd.current_dir(repo_dir).arg("-c").arg(shell_cmd);

    if let Some(python3) = resolve_python3_10_plus() {
        cmd.env("EMSDK_PYTHON", &python3).env("PYTHON", python3);
    }

    let status = cmd
        .status()
        .with_context(|| format!("failed to build wasm in {repo_dir}"))?;
    if !status.success() {
        bail!("tree-sitter build failed in {repo_dir}");
    }

    Ok(())
}

fn resolve_python3_10_plus() -> Option<String> {
    let python3 = run_cmd("command -v python3").ok()?;
    if python3.is_empty() {
        return None;
    }

    let status = Command::new(&python3)
        .arg("-c")
        .arg("import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)")
        .status()
        .ok()?;

    if status.success() {
        Some(python3)
    } else {
        None
    }
}

fn write_tree_sitter_json(
    parser_name: &str,
    build_dir: &str,
    metadata_dir: &str,
    info: &ParserInfo,
) -> Result<()> {
    let package_path = if Path::new(build_dir).join("package.json").exists() {
        Path::new(build_dir).join("package.json")
    } else {
        Path::new(metadata_dir).join("package.json")
    };
    let package = if package_path.exists() {
        Some(
            serde_json::from_str::<Value>(
                &fs::read_to_string(&package_path)
                    .with_context(|| format!("failed to read {}", package_path.display()))?,
            )
            .with_context(|| format!("failed to parse {}", package_path.display()))?,
        )
    } else {
        None
    };

    let existing_path = Path::new(build_dir).join("tree-sitter.json");
    let existing = if existing_path.exists() {
        Some(
            serde_json::from_str::<Value>(
                &fs::read_to_string(&existing_path)
                    .with_context(|| format!("failed to read {}", existing_path.display()))?,
            )
            .with_context(|| format!("failed to parse {}", existing_path.display()))?,
        )
    } else {
        None
    };

    let selected_grammar = existing
        .as_ref()
        .and_then(|value| value.get("grammars"))
        .and_then(Value::as_array)
        .and_then(|grammars| {
            if let Some(location) = info.location.as_deref() {
                grammars.iter().find(|grammar| {
                    grammar.get("path").and_then(Value::as_str).unwrap_or(".") == location
                })
            } else {
                grammars.first()
            }
        });
    let selected_package_grammar = package
        .as_ref()
        .and_then(|value| value.get("tree-sitter"))
        .and_then(Value::as_array)
        .and_then(|grammars| {
            if let Some(location) = info.location.as_deref() {
                grammars.iter().find(|grammar| {
                    grammar.get("path").and_then(Value::as_str).unwrap_or(".") == location
                })
            } else {
                grammars.first()
            }
        });

    let package_name = package
        .as_ref()
        .and_then(|value| value.get("name"))
        .and_then(Value::as_str)
        .unwrap_or(parser_name);
    let grammar_name = selected_grammar
        .and_then(|grammar| grammar.get("name"))
        .and_then(Value::as_str)
        .or_else(|| {
            selected_package_grammar
                .and_then(|grammar| grammar.get("name"))
                .and_then(Value::as_str)
        })
        .unwrap_or_else(|| {
            if info.location.is_some() {
                parser_name
            } else {
                package_name
                    .strip_prefix("tree-sitter-")
                    .unwrap_or(package_name)
            }
        })
        .replace('_', "-");
    let grammar_path = info
        .location
        .clone()
        .or_else(|| {
            selected_grammar
                .and_then(|grammar| grammar.get("path"))
                .and_then(Value::as_str)
                .map(ToOwned::to_owned)
        })
        .unwrap_or_else(|| ".".to_string());
    let scope = selected_grammar
        .and_then(|grammar| grammar.get("scope"))
        .and_then(Value::as_str)
        .map(ToOwned::to_owned)
        .or_else(|| {
            selected_package_grammar
                .and_then(|entry| entry.get("scope"))
                .and_then(Value::as_str)
                .map(ToOwned::to_owned)
        })
        .unwrap_or_else(|| format!("source.{grammar_name}"));
    let file_types = selected_grammar
        .and_then(|grammar| grammar.get("file-types"))
        .and_then(Value::as_array)
        .cloned()
        .or_else(|| {
            selected_package_grammar
                .and_then(|entry| entry.get("file-types"))
                .and_then(Value::as_array)
                .cloned()
        })
        .unwrap_or_else(|| {
            info.globs
                .iter()
                .filter_map(|glob| {
                    glob.strip_prefix("*.")
                        .map(|ext| Value::String(ext.to_string()))
                })
                .collect()
        });
    let repository = existing
        .as_ref()
        .and_then(|value| value.get("metadata"))
        .and_then(|value| value.get("links"))
        .and_then(|value| value.get("repository"))
        .and_then(Value::as_str)
        .map(ToOwned::to_owned)
        .or_else(|| {
            package.as_ref().and_then(|value| {
                value.get("repository").and_then(|repo| match repo {
                    Value::String(url) => Some(url.clone()),
                    Value::Object(obj) => obj
                        .get("url")
                        .and_then(Value::as_str)
                        .map(ToOwned::to_owned),
                    _ => None,
                })
            })
        })
        .unwrap_or_else(|| info.git.clone().unwrap_or_default());
    let version = existing
        .as_ref()
        .and_then(|value| value.get("metadata"))
        .and_then(|value| value.get("version"))
        .and_then(Value::as_str)
        .map(ToOwned::to_owned)
        .or_else(|| {
            package
                .as_ref()
                .and_then(|value| value.get("version"))
                .and_then(Value::as_str)
                .map(ToOwned::to_owned)
        })
        .unwrap_or_else(|| info.version.clone().unwrap_or_default());
    let license = existing
        .as_ref()
        .and_then(|value| value.get("metadata"))
        .and_then(|value| value.get("license"))
        .and_then(Value::as_str)
        .or_else(|| {
            package
                .as_ref()
                .and_then(|value| value.get("license"))
                .and_then(Value::as_str)
        })
        .unwrap_or("UNKNOWN");
    let description = existing
        .as_ref()
        .and_then(|value| value.get("metadata"))
        .and_then(|value| value.get("description"))
        .and_then(Value::as_str)
        .or_else(|| {
            package
                .as_ref()
                .and_then(|value| value.get("description"))
                .and_then(Value::as_str)
        })
        .unwrap_or("");
    let normalized_repository = if let Some(repo) = repository.strip_prefix("git@github.com:") {
        format!("https://github.com/{}", repo.trim_end_matches(".git"))
    } else if repository.contains('/') && !repository.contains("://") {
        format!("https://github.com/{}", repository.trim_end_matches(".git"))
    } else {
        repository
    };
    let grammar_dir = Path::new(build_dir).join(&grammar_path);
    let external_files: Vec<Value> = [
        "src/scanner.c",
        "src/scanner.cc",
        "src/scanner.cpp",
        "src/scanner.h",
    ]
    .into_iter()
    .filter(|scanner| grammar_dir.join(scanner).exists())
    .map(|scanner| {
        if grammar_path == "." {
            Value::String(scanner.to_string())
        } else {
            Value::String(format!("{grammar_path}/{scanner}"))
        }
    })
    .collect();
    let bindings = existing
        .as_ref()
        .and_then(|value| value.get("bindings"))
        .cloned()
        .unwrap_or_else(|| json!({ "c": true }));

    let tree_sitter_json = json!({
        "grammars": [
            {
                "name": grammar_name,
                "camelcase": selected_grammar
                    .and_then(|grammar| grammar.get("camelcase"))
                    .and_then(Value::as_str)
                    .map(ToOwned::to_owned)
                    .unwrap_or_else(|| to_camel_case(parser_name)),
                "scope": scope,
                "path": grammar_path,
                "file-types": file_types,
                "external-files": external_files,
            }
        ],
        "metadata": {
            "version": version,
            "license": license,
            "description": description,
            "authors": [],
            "links": {
                "repository": normalized_repository,
            }
        },
        "bindings": bindings,
    });

    let output_path = Path::new(build_dir).join("tree-sitter.json");
    fs::write(
        &output_path,
        serde_json::to_string_pretty(&tree_sitter_json)
            .context("failed to serialize synthesized tree-sitter.json")?,
    )
    .with_context(|| format!("failed to write {}", output_path.display()))?;

    Ok(())
}

fn to_camel_case(value: &str) -> String {
    value
        .split(['-', '_'])
        .filter(|part| !part.is_empty())
        .map(|part| {
            let mut chars = part.chars();
            let mut out = String::new();
            if let Some(first) = chars.next() {
                out.push(first.to_ascii_uppercase());
                out.extend(chars);
            }
            out
        })
        .collect()
}

fn tree_sitter_cli_minor(version: &str) -> Result<String> {
    let mut parts = version.trim().split('.');
    let major = parts
        .next()
        .filter(|part| !part.is_empty())
        .context("tree-sitter version is missing major component")?;
    let minor = parts
        .next()
        .filter(|part| !part.is_empty())
        .context("tree-sitter version is missing minor component")?;
    Ok(format!("{major}.{minor}"))
}

fn next_wasm_npm_version(pkg_name: &str, ts_cli: &str) -> Result<String> {
    let output = Command::new("npm")
        .args(["view", pkg_name, "versions", "--json"])
        .output()
        .with_context(|| format!("failed to inspect published versions for {pkg_name}"))?;

    let versions = if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        parse_npm_versions_json(&stdout)?
    } else {
        Vec::new()
    };

    let prefix = format!("{ts_cli}.");
    let next_patch = versions
        .iter()
        .filter_map(|version| version.strip_prefix(&prefix))
        .filter_map(|patch| patch.parse::<u64>().ok())
        .max()
        .map_or(0, |patch| patch + 1);

    Ok(format!("{ts_cli}.{next_patch}"))
}

fn parse_npm_versions_json(input: &str) -> Result<Vec<String>> {
    let value: Value = serde_json::from_str(input.trim()).context("invalid npm versions JSON")?;
    match value {
        Value::Array(items) => Ok(items
            .into_iter()
            .filter_map(|item| item.as_str().map(ToOwned::to_owned))
            .collect()),
        Value::String(version) => Ok(vec![version]),
        _ => Ok(Vec::new()),
    }
}

fn parser_revision_published(pkg_name: &str, ts_cli: &str, rev: &str) -> Result<bool> {
    let output = Command::new("npm")
        .args(["view", pkg_name, "versions", "--json"])
        .output()
        .with_context(|| format!("failed to inspect published versions for {pkg_name}"))?;

    if !output.status.success() {
        return Ok(false);
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let versions = parse_npm_versions_json(&stdout)?;
    let prefix = format!("{ts_cli}.");

    for version in versions
        .iter()
        .filter(|version| version.starts_with(&prefix))
    {
        let field_output = Command::new("npm")
            .args(["view", &format!("{pkg_name}@{version}"), "lumis", "--json"])
            .output()
            .with_context(|| format!("failed to inspect metadata for {pkg_name}@{version}"))?;

        if !field_output.status.success() {
            continue;
        }

        let fields: Value = serde_json::from_slice(&field_output.stdout)
            .with_context(|| format!("invalid metadata for {pkg_name}@{version}"))?;
        let published_rev = fields.get("rev").and_then(Value::as_str).unwrap_or("");
        let published_ts = fields
            .get("treeSitter")
            .and_then(Value::as_str)
            .unwrap_or("");

        if published_rev == rev && published_ts == ts_cli {
            return Ok(true);
        }
    }

    Ok(false)
}

fn stage_wasm(name: &str) -> Result<()> {
    let toml = read_languages_toml()?;
    let (parser_name, info) = toml
        .parsers
        .iter()
        .find(|(parser_name, info)| {
            let default_wasm_name = format!("tree-sitter-{parser_name}");
            let wasm_name = info.wasm_name.as_deref().unwrap_or(&default_wasm_name);
            parser_name.as_str() == name || wasm_name == name
        })
        .with_context(|| format!("Unknown parser or wasm artifact: {name}"))?;

    let default_wasm_name = format!("tree-sitter-{parser_name}");
    let wasm_name = info.wasm_name.as_deref().unwrap_or(&default_wasm_name);
    let pkg_name = format!("@lumis-sh/wasm-{}", wasm_package_suffix(wasm_name));

    let wasm_file = format!("tmp/wasms/{wasm_name}.wasm");
    if !Path::new(&wasm_file).exists() {
        bail!("ERROR: {wasm_file} not found. Run 'mise run wasm-build {wasm_name}' first.");
    }

    let out = format!("tmp/wasm-publish/{wasm_name}");
    let _ = fs::remove_dir_all(&out);
    fs::create_dir_all(&out)?;

    fs::copy("templates/wasm/LICENSE", format!("{out}/LICENSE"))?;

    let readme_template = fs::read_to_string("templates/wasm/README.md.template")?;
    let git_url = info.git.as_deref().unwrap_or("");
    let rev = info.rev.as_deref().unwrap_or("");
    let ts_cli_version = run_cmd("tree-sitter --version")
        .unwrap_or_default()
        .replace("tree-sitter ", "");
    let ts_cli_minor = tree_sitter_cli_minor(&ts_cli_version)?;
    let npm_version = next_wasm_npm_version(&pkg_name, &ts_cli_minor)?;
    let version = info.version.as_deref().unwrap_or("0.1.0");
    fs::copy(&wasm_file, format!("{out}/{wasm_name}.wasm"))?;

    let wasm_bytes = fs::read(&wasm_file)?;
    let wasm_sha256 = sha256_hex(&wasm_bytes);
    let browser_template = fs::read_to_string("templates/wasm/index.js.template")?;
    let browser_entry = browser_template.replace("{wasm_name}", wasm_name);
    fs::write(format!("{out}/index.js"), browser_entry)?;

    fs::copy(
        "templates/wasm/index.d.ts.template",
        format!("{out}/index.d.ts"),
    )?;

    let readme = readme_template
        .replace("{wasm_name}", wasm_name)
        .replace("{lang}", parser_name)
        .replace("{git_url}", git_url)
        .replace("{rev}", rev)
        .replace("{upstream_version}", version)
        .replace("{npm_version}", &npm_version)
        .replace("{tree_sitter_cli_version}", &ts_cli_version)
        .replace("{tree_sitter_cli}", &ts_cli_minor)
        .replace("{parser_version}", version);
    fs::write(format!("{out}/README.md"), readme)?;

    let pkg_template = fs::read_to_string("templates/wasm/package.json.template")?;
    let pkg = pkg_template
        .replace("{pkg_name}", &pkg_name)
        .replace("{npm_version}", &npm_version)
        .replace("{lang}", parser_name)
        .replace("{upstream_version}", version)
        .replace("{rev}", rev)
        .replace("{tree_sitter_cli}", &ts_cli_minor)
        .replace("{wasm_name}", wasm_name)
        .replace("{sha256}", &wasm_sha256)
        .replace("{wasm_size}", &wasm_bytes.len().to_string());
    fs::write(format!("{out}/package.json"), pkg)?;

    println!("Staged in {out}");
    Ok(())
}

fn sha256_hex(bytes: &[u8]) -> String {
    use sha2::{Digest, Sha256};

    format!("{:x}", Sha256::digest(bytes))
}

fn wasm_meta(name: &str) -> Result<()> {
    let toml = read_languages_toml()?;
    let (parser_name, info) = toml
        .parsers
        .iter()
        .find(|(parser_name, info)| {
            let default_wasm_name = format!("tree-sitter-{parser_name}");
            let wasm_name = info.wasm_name.as_deref().unwrap_or(&default_wasm_name);
            parser_name.as_str() == name || wasm_name == name
        })
        .with_context(|| format!("Unknown parser or wasm artifact: {name}"))?;

    let default_wasm_name = format!("tree-sitter-{parser_name}");
    let wasm_name = info.wasm_name.as_deref().unwrap_or(&default_wasm_name);
    let rev = info.rev.as_deref().unwrap_or("");
    let pkg_name = format!("@lumis-sh/wasm-{}", wasm_package_suffix(wasm_name));
    let ts_cli_version = run_cmd("tree-sitter --version")
        .unwrap_or_default()
        .replace("tree-sitter ", "");
    let ts_cli_minor = tree_sitter_cli_minor(&ts_cli_version)?;
    let npm_version = next_wasm_npm_version(&pkg_name, &ts_cli_minor)?;
    let published = parser_revision_published(&pkg_name, &ts_cli_minor, rev)?;

    println!("wasm_name={wasm_name}");
    println!("pkg_name={pkg_name}");
    println!("npm_version={npm_version}");
    println!("tree_sitter_cli={ts_cli_minor}");
    println!("published={published}");
    Ok(())
}

fn wasm_package_suffix(wasm_name: &str) -> &str {
    wasm_name.strip_prefix("tree-sitter-").unwrap_or(wasm_name)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicU64, Ordering};
    use std::time::{SystemTime, UNIX_EPOCH};

    fn unique_test_root() -> std::path::PathBuf {
        static COUNTER: AtomicU64 = AtomicU64::new(0);

        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("time should be monotonic")
            .as_nanos();
        let counter = COUNTER.fetch_add(1, Ordering::Relaxed);
        std::env::temp_dir().join(format!("lumis-dev-query-test-{unique}-{counter}"))
    }

    #[test]
    fn resolve_and_preprocess_uses_append_without_upstream() {
        let root = unique_test_root();
        let upstream = root.join("upstream");
        let override_root = root.join("override");
        let append_root = root.join("append");
        let append_lang_dir = append_root.join("demo");

        fs::create_dir_all(&append_lang_dir).expect("append dir should be created");
        fs::write(
            append_lang_dir.join("highlights.scm"),
            "((comment) @comment)\n",
        )
        .expect("append query should be written");

        let mut seen = HashSet::new();
        let content = resolve_and_preprocess(
            upstream.to_str().expect("upstream path should be valid"),
            override_root
                .to_str()
                .expect("override path should be valid"),
            append_root.to_str().expect("append path should be valid"),
            "demo",
            "highlights",
            &mut seen,
        );

        assert_eq!(content, "((comment) @comment)\n");

        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn resolve_and_preprocess_override_replaces_upstream_query() {
        let root = unique_test_root();
        let upstream = root.join("upstream");
        let upstream_dir = upstream.join("demo");
        let override_root = root.join("override");
        let append_root = root.join("append");
        let override_lang_dir = override_root.join("demo");

        fs::create_dir_all(&upstream_dir).expect("upstream dir should be created");
        fs::create_dir_all(&override_lang_dir).expect("override dir should be created");
        fs::write(
            upstream_dir.join("highlights.scm"),
            "(bad_node_name) @error\n",
        )
        .expect("upstream query should be written");
        fs::write(
            override_lang_dir.join("highlights.scm"),
            "((comment) @comment)\n",
        )
        .expect("override query should be written");

        let mut seen = HashSet::new();
        let content = resolve_and_preprocess(
            upstream.to_str().expect("upstream path should be valid"),
            override_root
                .to_str()
                .expect("override path should be valid"),
            append_root.to_str().expect("append path should be valid"),
            "demo",
            "highlights",
            &mut seen,
        );

        assert_eq!(content, "((comment) @comment)\n");

        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn resolve_and_preprocess_appends_after_override() {
        let root = unique_test_root();
        let upstream = root.join("upstream");
        let upstream_dir = upstream.join("demo");
        let override_root = root.join("override");
        let override_lang_dir = override_root.join("demo");
        let append_root = root.join("append");
        let append_lang_dir = append_root.join("demo");

        fs::create_dir_all(&upstream_dir).expect("upstream dir should be created");
        fs::create_dir_all(&override_lang_dir).expect("override dir should be created");
        fs::create_dir_all(&append_lang_dir).expect("append dir should be created");
        fs::write(
            upstream_dir.join("highlights.scm"),
            "(bad_node_name) @error\n",
        )
        .expect("upstream query should be written");
        fs::write(
            override_lang_dir.join("highlights.scm"),
            "((comment) @comment)\n",
        )
        .expect("override query should be written");
        fs::write(
            append_lang_dir.join("highlights.scm"),
            "((string) @string)\n",
        )
        .expect("append query should be written");

        let mut seen = HashSet::new();
        let content = resolve_and_preprocess(
            upstream.to_str().expect("upstream path should be valid"),
            override_root
                .to_str()
                .expect("override path should be valid"),
            append_root.to_str().expect("append path should be valid"),
            "demo",
            "highlights",
            &mut seen,
        );

        assert_eq!(content, "((comment) @comment)\n\n((string) @string)\n");

        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn local_override_query_detection_checks_any_query_file() {
        let root = unique_test_root();
        let override_lang_dir = root.join("queries/override/demo");

        fs::create_dir_all(&override_lang_dir).expect("override dir should be created");
        fs::write(
            override_lang_dir.join("locals.scm"),
            "(node) @local.scope\n",
        )
        .expect("override query should be written");

        let cwd = std::env::current_dir().expect("cwd should be available");
        std::env::set_current_dir(&root).expect("should switch to temp dir");

        let result = (|| {
            assert!(has_local_override_query("demo"));
            assert!(!has_local_override_query("missing"));
        })();

        std::env::set_current_dir(cwd).expect("should restore cwd");
        result;
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn query_names_includes_override_only_languages() {
        let root = unique_test_root();
        let override_lang_dir = root.join("queries/override/demo");

        fs::create_dir_all(&override_lang_dir).expect("override dir should be created");
        fs::write(
            override_lang_dir.join("highlights.scm"),
            "((comment) @comment)\n",
        )
        .expect("override query should be written");

        let cwd = std::env::current_dir().expect("cwd should be available");
        std::env::set_current_dir(&root).expect("should switch to temp dir");

        let result = (|| {
            assert_eq!(
                query_names().expect("query names should load"),
                vec!["demo"]
            );
        })();

        std::env::set_current_dir(cwd).expect("should restore cwd");
        result;
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn strip_set_capture_patterns_handles_escaped_backslashes() {
        let content = r#"((hard_line_break
  "\\" @conceal)
  (#set! conceal ""))

((inline_link
  (link_destination) @_url) @_label
  (#set! @_label url @_url))

(comment) @comment
"#;

        let stripped = strip_set_capture_patterns(content);

        assert!(stripped.contains("hard_line_break"));
        assert!(!stripped.contains("inline_link"));
        assert!(stripped.contains("(comment) @comment"));
    }

    #[test]
    fn apply_text_replacements_uses_published_swift_nil_node() {
        let query = "(nil_literal) @constant.builtin";

        assert_eq!(
            apply_text_replacements(query, "swift"),
            "\"nil\" @constant.builtin"
        );
        assert_eq!(apply_text_replacements(query, "nim"), query);
    }

    #[test]
    fn apply_text_replacements_removes_redundant_html_javascript_reinjection() {
        let query = r#"; lit-html style template interpolation
; <a @click=${e => console.log(e)}>
; <a @click="${e => console.log(e)}">
((attribute
  (quoted_attribute_value
    (attribute_value) @injection.content))
  (#lua-match? @injection.content "%${")
  (#offset! @injection.content 0 2 0 -1)
  (#set! injection.language "javascript"))

((attribute
  (attribute_value) @injection.content)
  (#lua-match? @injection.content "%${")
  (#offset! @injection.content 0 2 0 -2)
  (#set! injection.language "javascript"))

((comment) @injection.content)
"#;

        assert_eq!(
            apply_text_replacements(query, "html_tags"),
            "((comment) @injection.content)\n"
        );
        assert_eq!(apply_text_replacements(query, "html"), query);
    }
}

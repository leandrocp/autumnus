use anyhow::{bail, Context, Result};
use clap::{Parser, Subcommand};
use lumis::formatter::Formatter as _;
use lumis::highlight::highlight_events;
use lumis::languages::Language;
use lumis_core::events::HighlightEvent;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::{BTreeMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

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
    UpgradeQueries {
        #[arg(default_value = "")]
        name: String,
    },
    FetchQueries {
        #[arg(default_value = "")]
        name: String,
    },
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
        Commands::UpgradeQueries { name } => upgrade_queries(&name),
        Commands::FetchQueries { name } => fetch_queries(&name),
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
        } => render_conformance(&source, &language, &formatter, theme, themes, default_theme),
        Commands::DumpEvents { source, language } => dump_events(&source, &language),
        Commands::VerifyConformance { name } => verify_conformance(&name),
        Commands::RegenConformance { name } => regen_conformance(&name),
    }
}

fn render_conformance(
    source: &str,
    language: &str,
    formatter: &str,
    theme: Option<String>,
    themes: Vec<String>,
    default_theme: Option<String>,
) -> Result<()> {
    let language = parse_language(language)?;
    print!(
        "{}",
        render_formatter_output(source, language, formatter, theme, themes, default_theme)?
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
}

#[derive(Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
struct FixtureFile {
    name: String,
    language: String,
    theme: String,
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
}

fn serialize_events(events: Vec<HighlightEvent>) -> Vec<SerializableHighlightEvent> {
    events
        .into_iter()
        .map(|event| match event {
            HighlightEvent::Start {
                scope_index,
                language,
            } => SerializableHighlightEvent::Start {
                scope: lumis_core::highlights::HIGHLIGHT_NAMES[scope_index].to_string(),
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

fn render_formatter_output(
    source: &str,
    language: Language,
    formatter: &str,
    theme: Option<String>,
    themes: Vec<String>,
    default_theme: Option<String>,
) -> Result<String> {
    let mut output = Vec::new();

    match formatter {
        "html-inline" => {
            let theme_name = theme.unwrap_or_else(|| "dracula".to_string());
            let theme = lumis::themes::get(&theme_name)?;
            let formatter = lumis::HtmlInlineBuilder::new()
                .lang(language)
                .theme(Some(theme))
                .build()
                .map_err(|e| anyhow::anyhow!("{e}"))?;
            formatter.format(source, &mut output)?;
        }
        "html-linked" => {
            let formatter = lumis::HtmlLinkedBuilder::new()
                .lang(language)
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
            builder.lang(language).themes(theme_map);

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
                .lang(language)
                .theme(Some(theme))
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
) -> Result<FixtureOutputs> {
    let events = highlight_events(source, language)?;
    let metadata = FixtureMetadata {
        name: name.to_string(),
        language: language.id_name().to_string(),
        theme: theme.to_string(),
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
        )?,
        html_linked: render_formatter_output(source, language, "html-linked", None, vec![], None)?,
        html_multi_themes: render_formatter_output(
            source,
            language,
            "html-multi-themes",
            None,
            vec![format!("main:{theme}")],
            Some("main".to_string()),
        )?,
        terminal: render_formatter_output(
            source,
            language,
            "terminal",
            Some(theme.to_string()),
            vec![],
            None,
        )?,
    })
}

fn load_fixture_file(dir: &Path) -> Result<FixtureFile> {
    let json = fs::read_to_string(dir.join("fixture.json"))?;
    Ok(serde_json::from_str(&json)?)
}

fn dump_events(source: &str, language: &str) -> Result<()> {
    let language = parse_language(language)?;
    let events = serialize_events(highlight_events(source, language)?);

    println!("{}", serde_json::to_string_pretty(&events)?);
    Ok(())
}

fn verify_conformance(name: &str) -> Result<()> {
    let mut checked = 0usize;

    for dir in selected_fixture_dirs(name)? {
        let source = fs::read_to_string(dir.join("source.txt"))?;
        let stored = load_fixture_file(&dir)?;
        let language = parse_language(&stored.language)?;
        let generated = fixture_outputs(&source, language, &stored.theme, &stored.name)?;

        ensure_fixture_file_match(
            &dir.join("fixture.json"),
            &stored,
            &FixtureFile {
                name: generated.metadata.name.clone(),
                language: generated.metadata.language.clone(),
                theme: generated.metadata.theme.clone(),
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
        let generated = fixture_outputs(&source, language, &stored.theme, &stored.name)?;

        fs::write(
            dir.join("fixture.json"),
            serde_json::to_string_pretty(&FixtureFile {
                name: generated.metadata.name,
                language: generated.metadata.language,
                theme: generated.metadata.theme,
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

    let mut themes: Vec<_> = lumis_core::themes::ALL_THEMES.iter().collect();
    themes.sort_by(|a, b| a.name.cmp(&b.name));

    for theme in themes {
        let css = theme.css(true);
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

    let mut lines = vec![
        "# Supported Themes".to_string(),
        String::new(),
        "> This file is auto-generated by `just docs-gen-themes`. Do not edit.".to_string(),
        String::new(),
        "| Theme | Repository |".to_string(),
        "|-------|------------|".to_string(),
    ];

    for (name, url) in &entries {
        let repo_name = url.strip_prefix("https://github.com/").unwrap_or(url);
        lines.push(format!("| `{name}` | [{repo_name}]({url}) |"));
    }
    lines.push(String::new());

    fs::write("THEMES.md", lines.join("\n"))?;
    println!("Generated THEMES.md with {} themes", entries.len());
    Ok(())
}

#[derive(Debug, serde::Deserialize)]
struct LanguagesToml {
    queries: BTreeMap<String, QueryInfo>,
    parsers: BTreeMap<String, ParserInfo>,
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
    generate: Option<bool>,
    wasm_name: Option<String>,
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

fn tmpdir() -> Result<String> {
    run_cmd("mktemp -d")
}

fn query_names() -> Result<Vec<String>> {
    let mut names = Vec::new();
    let dir = Path::new("crates/lumis/queries");
    if dir.exists() {
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let name = entry.file_name().to_string_lossy().to_string();
            if name != "README.md" && entry.file_type()?.is_dir() {
                names.push(name);
            }
        }
    }
    names.sort();
    Ok(names)
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

fn langs_list() -> Result<()> {
    let toml = read_languages_toml()?;
    for name in toml.parsers.keys() {
        println!("{name}");
    }
    Ok(())
}

fn resolve_upstream_version(git_url: &str, rev: &str) -> String {
    let raw_base = git_url
        .trim_end_matches(".git")
        .replace("github.com", "raw.githubusercontent.com");

    for filename in &["tree-sitter.json", "package.json"] {
        let url = format!("{raw_base}/{rev}/{filename}");
        let Ok(mut resp) = ureq::get(&url).call() else {
            continue;
        };
        let Ok(body) = resp.body_mut().read_to_string() else {
            continue;
        };
        if let Ok(obj) = serde_json::from_str::<serde_json::Value>(&body) {
            if let Some(ver) = obj.get("version").and_then(|v| v.as_str()).or_else(|| {
                obj.get("metadata")
                    .and_then(|m| m.get("version"))
                    .and_then(|v| v.as_str())
            }) {
                return ver.to_string();
            }
        }
    }

    "0.0.1".to_string()
}

fn upgrade_parsers(name: &str) -> Result<()> {
    let mut doc = read_languages_toml_edit()?;
    let toml = read_languages_toml()?;

    let tmp = tmpdir()?;
    let parsers_lua_url = "https://raw.githubusercontent.com/nvim-treesitter/nvim-treesitter/main/lua/nvim-treesitter/parsers.lua";
    run_cmd_ok(&format!("curl -sL {parsers_lua_url} -o {tmp}/parsers.lua"))?;

    for (parser_name, info) in &toml.parsers {
        let Some(ref git) = info.git else { continue };
        if !name.is_empty() && parser_name != name {
            continue;
        }

        let lua_code = format!(
            "local parsers = dofile('{tmp}/parsers.lua'); local li = parsers['{parser_name}']; if li and li.install_info and li.install_info.revision then print(li.install_info.revision) end"
        );
        let rev_from_lua =
            run_cmd(&format!("lua -e \"{lua_code}\" 2>/dev/null")).unwrap_or_default();

        let new_rev = if !rev_from_lua.is_empty() {
            rev_from_lua
        } else {
            git_ls_remote(git)?
        };

        if new_rev.is_empty() {
            println!("Warning: could not resolve revision for {parser_name}, skipping");
            continue;
        }

        let current_rev = info.rev.as_deref().unwrap_or("");
        if current_rev == new_rev {
            println!("  {parser_name}: already up to date ({current_rev})");
        } else {
            println!("  {parser_name}: {current_rev} -> {new_rev}");
            doc["parsers"][parser_name.as_str()]["rev"] = toml_edit::value(&new_rev);
        }

        if info.crate_field.is_none() {
            let ver = resolve_upstream_version(git, &new_rev);
            let current_ver = info.version.as_deref().unwrap_or("");
            if ver != current_ver {
                println!("    version: {current_ver} -> {ver}");
                doc["parsers"][parser_name.as_str()]["version"] = toml_edit::value(&ver);
            }
        }
    }

    write_languages_toml_edit(&doc)?;
    let _ = run_cmd_ok(&format!("rm -rf {tmp}"));
    Ok(())
}

fn fetch_parsers(name: &str) -> Result<()> {
    let toml = read_languages_toml()?;
    let tmp = tmpdir()?;

    for (parser_name, info) in &toml.parsers {
        let Some(ref git) = info.git else { continue };
        if !name.is_empty() && parser_name != name {
            continue;
        }

        let rev = info.rev.as_deref().unwrap_or("HEAD");
        let parser_dir = format!("tree-sitter-{parser_name}");
        let clone_dir = format!("{tmp}/{parser_dir}");

        println!("Fetching {parser_name} from {git} at {rev}");

        let _ = run_cmd_ok(&format!("git clone {git} {clone_dir} 2>/dev/null"));
        let _ = run_cmd_ok(&format!("cd {clone_dir} && git checkout {rev} 2>/dev/null"));

        let dest = format!("crates/lumis/vendored_parsers/{parser_dir}");

        if info.generate.unwrap_or(false) {
            let _ = run_cmd_ok(&format!("rm -rf {dest}"));
            fs::create_dir_all(&dest)?;
            let _ = run_cmd_ok(&format!("cp -r {clone_dir}/* {dest}/"));
            let _ = run_cmd_ok(&format!(
                "cd {dest} && npm install --no-save tree-sitter-cli && npx tree-sitter generate"
            ));
            let _ = run_cmd_ok(&format!("rm -f {dest}/Cargo.toml"));
            let _ = run_cmd_ok(&format!("rm -rf {dest}/node_modules"));
            let _ = run_cmd_ok(&format!("rm -rf {dest}/bindings"));
            println!("  Updated {parser_name} (generated)");
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
            let hash = format!("{:x}", Md5::digest(clone_key.as_bytes()));
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
        let dest = format!("crates/lumis/queries/{query_name}");

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

fn apply_text_replacements(content: &str) -> String {
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
        ("\\\\c", "(?i)"),
        ("^{[-]|[^|]", "^\\{[-]|^\\{[^|]"),
        ("\"^\\\\if", "\"^if"),
    ];

    let mut s = content.to_string();
    for (old, new) in &replacements {
        s = s.replace(old, new);
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
                if ch == b'"' && (j == 0 || bytes[j - 1] != b'\\') {
                    in_string = !in_string;
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
    overwrites_dir: &str,
    lang: &str,
    query_type: &str,
    seen: &mut HashSet<String>,
) -> String {
    let key = format!("{lang}/{query_type}");
    if seen.contains(&key) {
        return String::new();
    }
    seen.insert(key);

    let raw = read_query_raw(src_dir, lang, query_type);
    if raw.is_empty() {
        return String::new();
    }

    let content = apply_text_replacements(&raw);
    let content = strip_set_capture_patterns(&content);

    let mut parts = Vec::new();
    let mut stripped_lines = Vec::new();

    for line in content.lines() {
        if line.starts_with("; inherits: ") {
            let inherits_str = line.trim_start_matches("; inherits: ").trim();
            for parent in inherits_str.split([',', ' ']).filter(|s| !s.is_empty()) {
                let parent_content =
                    resolve_and_preprocess(src_dir, overwrites_dir, parent, query_type, seen);
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

    let overwrite_path = format!("{overwrites_dir}/{lang}/{query_type}.scm");
    if let Ok(overwrite_content) = fs::read_to_string(overwrite_path) {
        parts.push(overwrite_content);
    }

    parts.join("\n")
}

fn preprocess_queries(name: &str) -> Result<()> {
    let src = "crates/lumis/queries";
    let overwrites = "crates/lumis/overwrites";
    let dest = "tmp/queries_processed";
    let cli_dest = "crates/lumis-cli/queries";

    let _ = fs::remove_dir_all(dest);
    let _ = fs::remove_dir_all(cli_dest);

    for lang in query_names()? {
        if !name.is_empty() && lang != name {
            continue;
        }

        fs::create_dir_all(format!("{dest}/{lang}"))?;
        fs::create_dir_all(format!("{cli_dest}/{lang}"))?;

        let mut wrote = false;
        for query_type in &["highlights", "injections", "locals"] {
            let mut seen = HashSet::new();
            let content = resolve_and_preprocess(src, overwrites, &lang, query_type, &mut seen);
            if !content.is_empty() {
                let full = format!("; This file is auto-generated. Do not edit.\n{content}");
                fs::write(format!("{dest}/{lang}/{query_type}.scm"), &full)?;
                fs::write(format!("{cli_dest}/{lang}/{query_type}.scm"), &full)?;
                wrote = true;
            }
        }
        if wrote {
            println!("  {lang}");
        }
    }

    // Sync languages.toml into crates
    fs::copy("languages.toml", "crates/lumis-core/languages.toml")?;
    fs::copy("languages.toml", "crates/lumis-cli/languages.toml")?;

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
    rs.push("// Run: just langs-gen-highlights".to_string());
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
        "// Run: just langs-gen-highlights".to_string(),
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
        "> This file is auto-generated by `just docs-gen-languages`. Do not edit.".to_string(),
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
        let query_col = format!(
            "[{query_repo_name}](https://github.com/{query_repo_path}/tree/{}) `{query_short_rev}`",
            qi.rev
        );

        lines.push(format!(
            "| {lang} | {parser_link} | {vendored} | {version_col} | {query_col} | {wasm_col} |"
        ));
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
    fs::create_dir_all(&out_dir)?;
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
        println!("Building WASM for {parser_name} ...");

        let _ = run_cmd_ok(&format!(
            "git clone --depth 1 {git} {clone_dir} 2>/dev/null"
        ));
        let _ = run_cmd_ok(&format!(
            "cd {clone_dir} && git fetch --depth 1 origin {rev} && git checkout {rev} 2>/dev/null"
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
                let _ = run_cmd_ok(&format!("cd {install_dir} && {npm_cmd} 2>/dev/null"));
            }
            let _ = run_cmd_ok(&format!(
                "cd {repo_dir} && tree-sitter generate 2>/dev/null"
            ));
        }

        if has_package_json || tree_sitter_json.exists() {
            write_tree_sitter_json(parser_name, &repo_dir, &metadata_dir, info)?;
        }

        let wasm_path = wasm_file.display();
        match build_repo_wasm(&repo_dir, &wasm_file) {
            Ok(()) => println!("{wasm_path}"),
            Err(_) => println!("  ERROR: failed to build {parser_name}"),
        }

        let _ = run_cmd_ok(&format!("rm -rf {clone_dir}"));
    }

    let _ = run_cmd_ok(&format!("rm -rf {tmp}"));
    Ok(())
}

fn build_repo_wasm(repo_dir: &str, wasm_file: &Path) -> Result<()> {
    let mut cmd = Command::new("tree-sitter");
    cmd.current_dir(repo_dir)
        .arg("build")
        .arg("--wasm")
        .arg("-o")
        .arg(wasm_file);

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
        bail!("ERROR: {wasm_file} not found. Run 'just wasm-build {wasm_name}' first.");
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

    // Generate browser entry (base64-inlined wasm)
    let wasm_bytes = fs::read(&wasm_file)?;
    let base64_wasm = {
        use base64::prelude::*;
        BASE64_STANDARD.encode(&wasm_bytes)
    };
    let browser_template = fs::read_to_string("templates/wasm/index.js.template")?;
    let browser_entry = browser_template.replace("{base64_wasm}", &base64_wasm);
    fs::write(format!("{out}/index.js"), browser_entry)?;

    // Generate Node.js entry (reads from disk)
    let node_template = fs::read_to_string("templates/wasm/index.node.js.template")?;
    let node_entry = node_template.replace("{wasm_name}", wasm_name);
    fs::write(format!("{out}/index.node.js"), node_entry)?;

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
        .replace("{wasm_name}", wasm_name);
    fs::write(format!("{out}/package.json"), pkg)?;

    println!("Staged in {out}");
    Ok(())
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

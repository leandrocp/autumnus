mod gen_theme;
#[allow(clippy::all, dead_code)]
mod highlight;
mod registry;

use anyhow::Result;
use clap::{ArgAction, Parser, Subcommand, ValueEnum};
use etcetera::BaseStrategy;
use lumis_core::events::HighlightEvent;
use lumis_core::formatter::Formatter as CoreFormatter;
use lumis_core::languages::Language;
use std::fmt::Display;
use std::fs;
use std::io::{IsTerminal, Read as _};
use std::ops::RangeInclusive;
use std::path::{Path, PathBuf};

#[derive(Parser)]
#[command(
    version,
    about = "Syntax Highlighter powered by Tree-sitter and Neovim themes",
    disable_help_flag = true
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,

    /// Where to look for WASM parsers and theme JSON files
    #[arg(short = 'd', long, env("LUMIS_DATA_DIR"), global = true)]
    data_dir: Option<PathBuf>,

    /// Show extra output (downloads, cache hits, etc.)
    #[arg(short = 'v', long, global = true)]
    verbose: bool,

    /// Print help
    #[arg(long, global = true, action = ArgAction::Help, help = "Print help")]
    help: Option<bool>,
}

#[derive(Subcommand)]
enum Commands {
    /// Highlight source code from a file or stdin
    #[command(
        after_help = "Examples:\n  lumis highlight main.rs\n  lumis highlight -l javascript main.txt\n  lumis highlight -f html-inline -t dracula main.rs\n  lumis highlight -h 1,3-5 lib.rs\n  cat main.rs | lumis highlight -l rust\n  echo 'fn main() {}' | lumis highlight -l rust"
    )]
    Highlight {
        /// File to highlight (reads from stdin if omitted)
        path: Option<String>,

        /// Language id (e.g. rust, javascript, elixir)
        #[arg(short = 'l', long)]
        language: Option<String>,

        /// Output format [default: terminal]
        #[arg(short = 'f', long)]
        formatter: Option<Formatter>,

        /// Theme name, e.g. dracula, github_dark
        #[arg(short = 't', long)]
        theme: Option<String>,

        /// Theme pair as name:theme_id, can be repeated (requires html-multi-themes)
        #[arg(long)]
        themes: Vec<String>,

        /// Which --themes entry gets inline styles
        #[arg(long)]
        default_theme: Option<String>,

        /// Prefix for CSS custom properties
        #[arg(long, default_value = "--lumis")]
        css_variable_prefix: String,

        /// Lines to highlight, e.g. "1,3-5,10"
        #[arg(short = 'h', long)]
        highlight_lines: Option<String>,
    },

    /// Manage languages
    Languages {
        #[command(subcommand)]
        command: LanguagesCommands,
    },

    /// Manage themes
    Themes {
        #[command(subcommand)]
        command: ThemesCommands,
    },

    /// Manage Tree-sitter WASM parsers
    Parsers {
        #[command(subcommand)]
        command: ParsersCommands,
    },
}

#[derive(Subcommand)]
enum LanguagesCommands {
    /// Print supported languages and their file patterns
    List,
}

#[derive(Subcommand)]
enum ThemesCommands {
    /// Print available themes (built-in and from --data-dir)
    List,

    /// Extract a theme from a Neovim colorscheme Git repo
    #[command(
        after_help = "Examples:\n  lumis themes generate -u https://github.com/catppuccin/nvim -c catppuccin-mocha\n  lumis themes generate -u https://github.com/folke/tokyonight.nvim -c tokyonight-night -o tokyonight.json"
    )]
    Generate {
        /// Git repository URL
        #[arg(short = 'u', long)]
        url: String,

        /// Colorscheme name to activate, e.g. catppuccin-mocha
        #[arg(short = 'c', long)]
        colorscheme: String,

        /// Lua code to run before loading the colorscheme
        #[arg(short = 's', long)]
        setup: Option<String>,

        /// Write JSON to this path instead of stdout
        #[arg(short = 'o', long)]
        output: Option<String>,

        /// light or dark [default: dark]
        #[arg(short = 'a', long)]
        appearance: Option<String>,
    },
}

#[derive(Subcommand)]
enum ParsersCommands {
    /// Download parser WASMs ahead of time
    #[command(
        after_help = "Examples:\n  lumis parsers fetch rust javascript\n  lumis parsers fetch --all"
    )]
    Fetch {
        /// Language names to download (e.g. rust javascript elixir)
        languages: Vec<String>,

        /// Download all supported parsers
        #[arg(long)]
        all: bool,
    },

    /// Re-download parser WASMs to get the latest versions
    #[command(
        after_help = "Examples:\n  lumis parsers update rust javascript\n  lumis parsers update --all"
    )]
    Update {
        /// Language names to update (e.g. rust javascript elixir)
        languages: Vec<String>,

        /// Update all cached parsers
        #[arg(long)]
        all: bool,
    },
}

#[derive(Clone, Default, ValueEnum)]
enum Formatter {
    /// HTML with inline style attributes
    HtmlInline,
    /// HTML with CSS custom properties, one set per theme
    HtmlMultiThemes,
    /// HTML with CSS class names (pair with a theme stylesheet)
    HtmlLinked,
    /// ANSI escape codes
    #[default]
    Terminal,
}

fn default_data_dir() -> PathBuf {
    etcetera::choose_base_strategy()
        .expect("failed to determine home directory")
        .data_dir()
        .join("lumis")
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    let data_dir = cli.data_dir.unwrap_or_else(default_data_dir);
    let verbose = cli.verbose;

    match cli.command {
        Commands::Highlight {
            path,
            language,
            formatter,
            theme,
            themes,
            default_theme,
            css_variable_prefix,
            highlight_lines,
        } => {
            let reg = registry::Registry::new(data_dir)?;
            do_highlight(
                &reg,
                path,
                language,
                formatter,
                theme,
                themes,
                default_theme,
                css_variable_prefix,
                highlight_lines,
            )
        }
        Commands::Languages { command } => match command {
            LanguagesCommands::List => list_languages(),
        },
        Commands::Themes { command } => match command {
            ThemesCommands::List => list_themes(&data_dir),
            ThemesCommands::Generate {
                url,
                colorscheme,
                setup,
                output,
                appearance,
            } => gen_theme::generate_theme(
                &url,
                &colorscheme,
                setup.as_deref(),
                output.as_deref(),
                appearance.as_deref(),
            ),
        },
        Commands::Parsers { command } => match command {
            ParsersCommands::Fetch { languages, all } => {
                let reg = registry::Registry::new(data_dir)?;
                fetch_parsers(&reg, &languages, all, verbose)
            }
            ParsersCommands::Update { languages, all } => {
                let reg = registry::Registry::new(data_dir)?;
                update_parsers(&reg, &languages, all, verbose)
            }
        },
    }
}

fn fetch_parsers(
    reg: &registry::Registry,
    languages: &[String],
    all: bool,
    verbose: bool,
) -> Result<()> {
    let names: Vec<&str> = if all {
        registry::all_wasm_names()
            .iter()
            .map(|(qn, _)| *qn)
            .collect()
    } else {
        if languages.is_empty() {
            return Err(anyhow::anyhow!(
                "specify language names or use --all to download all parsers"
            ));
        }
        languages.iter().map(|s| s.as_str()).collect()
    };

    let mut errors = Vec::new();
    for name in &names {
        let query_name = resolve_query_name(name);
        if reg.is_cached(query_name) {
            if verbose {
                eprintln!("{}: {}", name, reg.parser_path(query_name).display());
            }
            continue;
        }
        match reg.download_parser(query_name) {
            Ok(_) => {
                if verbose {
                    eprintln!("{}: {}", name, reg.parser_path(query_name).display());
                }
            }
            Err(e) => {
                eprintln!("{}: failed", name);
                errors.push((*name, e));
            }
        }
    }

    if !errors.is_empty() {
        return Err(anyhow::anyhow!(
            "failed to download {} parser(s)",
            errors.len()
        ));
    }

    Ok(())
}

fn update_parsers(
    reg: &registry::Registry,
    languages: &[String],
    all: bool,
    verbose: bool,
) -> Result<()> {
    let names: Vec<&str> = if all {
        // When --all, only update parsers that are already cached
        registry::all_wasm_names()
            .iter()
            .filter(|(qn, _)| reg.is_cached(qn))
            .map(|(qn, _)| *qn)
            .collect()
    } else {
        if languages.is_empty() {
            return Err(anyhow::anyhow!(
                "specify language names or use --all to update all cached parsers"
            ));
        }
        languages.iter().map(|s| s.as_str()).collect()
    };

    if names.is_empty() {
        if verbose {
            eprintln!("No cached parsers to update.");
        }
        return Ok(());
    }

    let mut errors = Vec::new();
    for name in &names {
        let query_name = resolve_query_name(name);
        match reg.update_parser(query_name) {
            Ok(_) => {
                if verbose {
                    eprintln!("{}: {}", name, reg.parser_path(query_name).display());
                }
            }
            Err(e) => {
                eprintln!("{}: failed", name);
                errors.push((*name, e));
            }
        }
    }

    if !errors.is_empty() {
        return Err(anyhow::anyhow!(
            "failed to update {} parser(s)",
            errors.len()
        ));
    }

    Ok(())
}

/// Resolve a user-provided language name to the query name used internally.
/// Tries Language::guess first (handles aliases), falls back to the input as-is.
fn resolve_query_name(name: &str) -> &str {
    // For fetch/update we just need the query name mapping.
    // If the user passes a known language id, use the enum mapping.
    // Otherwise pass through (the user might be using the query name directly).
    let lang = Language::guess(Some(name), "");
    if lang != Language::PlainText || name == "plaintext" {
        // Return the static query name from the generated code
        registry::language_to_query_name(lang)
    } else {
        name
    }
}

fn list_themes(data_dir: &Path) -> Result<()> {
    let mut themes: Vec<_> = lumis_core::themes::available_themes()
        .map(|t| t.name.clone())
        .collect();

    // Add file themes from data dir
    let themes_dir = data_dir.join("themes");
    if let Ok(entries) = std::fs::read_dir(&themes_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().is_some_and(|ext| ext == "json") {
                if let Some(stem) = path.file_stem() {
                    let name = format!("{} (file)", stem.to_string_lossy());
                    themes.push(name);
                }
            }
        }
    }

    themes.sort();
    for theme in themes {
        println!("{}", theme);
    }

    Ok(())
}

fn list_languages() -> Result<()> {
    for language in Language::iter() {
        let name = Language::id_name(&language);
        println!("{name}");

        for glob in Language::language_globs(language) {
            print!("  {}", glob.as_str());
        }

        println!();
    }

    Ok(())
}

fn resolve_theme(
    name: Option<String>,
    data_dir: Option<&Path>,
) -> Option<lumis_core::themes::Theme> {
    let name = name.unwrap_or_else(|| "catppuccin_frappe".to_string());

    // Try built-in theme first
    if let Ok(theme) = lumis_core::themes::get(&name) {
        return Some(theme);
    }

    // Try file theme from data dir
    if let Some(dir) = data_dir {
        let path = dir.join("themes").join(format!("{}.json", name));
        if let Ok(theme) = lumis_core::themes::from_file(&path) {
            return Some(theme);
        }
    }

    None
}

#[allow(clippy::too_many_arguments)]
fn do_highlight(
    reg: &registry::Registry,
    path: Option<String>,
    language: Option<String>,
    formatter: Option<Formatter>,
    theme: Option<String>,
    themes: Vec<String>,
    default_theme: Option<String>,
    css_variable_prefix: String,
    highlight_lines: Option<String>,
) -> Result<()> {
    let (source, lang) = if let Some(path) = path {
        let bytes = read_or_die(Path::new(&path));
        let source = std::str::from_utf8(&bytes)
            .map_err(|e| anyhow::anyhow!("Failed to decode file '{}' as UTF-8: {}", path, e))?
            .to_string();
        let lang = if language.is_some() {
            Language::guess(language.as_deref(), &source)
        } else {
            Language::guess(Some(path.as_str()), &source)
        };
        (source, lang)
    } else if !std::io::stdin().is_terminal() {
        let mut buf = String::new();
        std::io::stdin().read_to_string(&mut buf)?;
        let lang = Language::guess(language.as_deref(), &buf);
        (buf, lang)
    } else {
        return Err(anyhow::anyhow!(
            "provide a file path or pipe input via stdin"
        ));
    };

    if lang == Language::PlainText {
        print!("{}", source);
        return Ok(());
    }

    let lang_name = registry::language_to_query_name(lang);
    let events = highlight_to_events(reg, &source, lang_name)?;

    let parsed_highlight_lines = if let Some(lines_str) = highlight_lines {
        Some(parse_highlight_lines(&lines_str)?)
    } else {
        None
    };

    render_output(
        reg,
        &source,
        &events,
        lang,
        formatter,
        theme,
        themes,
        default_theme,
        css_variable_prefix,
        parsed_highlight_lines,
    )
}

#[allow(clippy::too_many_arguments)]
fn render_output(
    reg: &registry::Registry,
    source: &str,
    events: &[HighlightEvent],
    lang: Language,
    formatter: Option<Formatter>,
    theme: Option<String>,
    themes: Vec<String>,
    default_theme: Option<String>,
    css_variable_prefix: String,
    highlight_lines: Option<Vec<RangeInclusive<usize>>>,
) -> Result<()> {
    let theme_obj = resolve_theme(theme, Some(reg.data_dir()));

    match formatter.unwrap_or_default() {
        Formatter::HtmlInline => {
            let mut builder = lumis_core::formatter::HtmlInlineBuilder::new();
            builder
                .lang(lang)
                .theme(theme_obj)
                .italic(false)
                .include_highlights(false);

            if let Some(lines) = highlight_lines {
                let hl = lumis_core::formatter::html_inline::HighlightLines {
                    lines,
                    style: Some(lumis_core::formatter::html_inline::HighlightLinesStyle::Theme),
                    class: None,
                };
                builder.highlight_lines(Some(hl));
            }

            let fmt = builder.build().map_err(|e| anyhow::anyhow!("{}", e))?;
            let mut output = Vec::new();
            fmt.render(source, events, &mut output)?;
            print!("{}", String::from_utf8(output)?);
        }

        Formatter::HtmlMultiThemes => {
            if themes.is_empty() {
                return Err(anyhow::anyhow!(
                    "--formatter html-multi-themes requires --themes"
                ));
            }

            let mut theme_map = std::collections::HashMap::new();
            for theme_spec in themes {
                let parts: Vec<&str> = theme_spec.split(':').collect();
                if parts.len() != 2 {
                    return Err(anyhow::anyhow!(
                        "Invalid theme format '{}', expected 'name:theme_id'",
                        theme_spec
                    ));
                }
                let theme_name = parts[0].to_string();
                let theme_id = parts[1];
                let theme_obj = resolve_theme(Some(theme_id.to_string()), Some(reg.data_dir()))
                    .ok_or_else(|| anyhow::anyhow!("Theme '{}' not found", theme_id))?;
                theme_map.insert(theme_name, theme_obj);
            }

            let mut builder = lumis_core::formatter::HtmlMultiThemesBuilder::new();
            builder
                .lang(lang)
                .themes(theme_map)
                .css_variable_prefix(css_variable_prefix);

            if let Some(default) = default_theme {
                builder.default_theme(default);
            }

            if let Some(lines) = highlight_lines {
                let hl = lumis_core::formatter::html_inline::HighlightLines {
                    lines,
                    style: Some(lumis_core::formatter::html_inline::HighlightLinesStyle::Theme),
                    class: None,
                };
                builder.highlight_lines(Some(hl));
            }

            let fmt = builder.build().map_err(|e| anyhow::anyhow!("{}", e))?;
            let mut output = Vec::new();
            fmt.render(source, events, &mut output)?;
            print!("{}", String::from_utf8(output)?);
        }

        Formatter::HtmlLinked => {
            let mut builder = lumis_core::formatter::HtmlLinkedBuilder::new();
            builder.lang(lang);

            if let Some(lines) = highlight_lines {
                let hl = lumis_core::formatter::html_linked::HighlightLines {
                    lines,
                    class: "highlighted".to_string(),
                };
                builder.highlight_lines(Some(hl));
            }

            let fmt = builder.build().map_err(|e| anyhow::anyhow!("{}", e))?;
            let mut output = Vec::new();
            fmt.render(source, events, &mut output)?;
            print!("{}", String::from_utf8(output)?);
        }

        Formatter::Terminal => {
            let mut builder = lumis_core::formatter::TerminalBuilder::new();
            builder.lang(lang).theme(theme_obj);

            let fmt = builder.build().map_err(|e| anyhow::anyhow!("{}", e))?;
            let mut output = Vec::new();
            fmt.render(source, events, &mut output)?;
            print!("{}", String::from_utf8(output)?);
        }
    }

    Ok(())
}

const EXIT_BAD_ARGUMENTS: i32 = 2;

fn read_or_die(path: &Path) -> Vec<u8> {
    match fs::read(path) {
        Ok(src) => src,
        Err(e) => {
            eprint_read_error(&FileArgument::NamedPath(path.to_path_buf()), &e);
            std::process::exit(EXIT_BAD_ARGUMENTS);
        }
    }
}

fn eprint_read_error(file_arg: &FileArgument, e: &std::io::Error) {
    match e.kind() {
        std::io::ErrorKind::NotFound => {
            eprintln!("No such file: {file_arg}");
        }
        std::io::ErrorKind::PermissionDenied => {
            eprintln!("Permission denied when reading file: {file_arg}");
        }
        _ => match file_arg {
            FileArgument::NamedPath(path) if path.is_dir() => {
                eprintln!("Expected a file, got a directory: {}", path.display());
            }
            _ => eprintln!("Could not read file: {} (error {:?})", file_arg, e.kind()),
        },
    };
}

#[allow(dead_code)]
enum FileArgument {
    NamedPath(std::path::PathBuf),
    Stdin,
    DevNull,
}

impl Display for FileArgument {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            FileArgument::NamedPath(path) => {
                write!(f, "{}", relative_to_current(path).display())
            }
            FileArgument::Stdin => write!(f, "(stdin)"),
            FileArgument::DevNull => write!(f, "/dev/null"),
        }
    }
}

fn parse_highlight_lines(input: &str) -> Result<Vec<RangeInclusive<usize>>> {
    let mut ranges = Vec::new();

    for part in input.split(',') {
        let part = part.trim();
        if part.is_empty() {
            continue;
        }

        if let Some((start, end)) = part.split_once('-') {
            let start: usize = start
                .trim()
                .parse()
                .map_err(|_| anyhow::anyhow!("Invalid line number: '{}'", start.trim()))?;
            let end: usize = end
                .trim()
                .parse()
                .map_err(|_| anyhow::anyhow!("Invalid line number: '{}'", end.trim()))?;

            if start == 0 || end == 0 {
                return Err(anyhow::anyhow!("Line numbers must be greater than 0"));
            }
            if start > end {
                return Err(anyhow::anyhow!(
                    "Start line ({}) must be less than or equal to end line ({})",
                    start,
                    end
                ));
            }

            ranges.push(start..=end);
        } else {
            let line: usize = part
                .parse()
                .map_err(|_| anyhow::anyhow!("Invalid line number: '{}'", part))?;

            if line == 0 {
                return Err(anyhow::anyhow!("Line numbers must be greater than 0"));
            }

            ranges.push(line..=line);
        }
    }

    Ok(ranges)
}

fn relative_to_current(path: &Path) -> PathBuf {
    if let Ok(current_path) = std::env::current_dir() {
        let path = try_canonicalize(path);
        let current_path = try_canonicalize(&current_path);

        if let Ok(rel_path) = path.strip_prefix(current_path) {
            return rel_path.into();
        }
    }

    path.into()
}

fn try_canonicalize(path: &Path) -> PathBuf {
    path.canonicalize().unwrap_or_else(|_| path.into())
}

fn highlight_to_events(
    reg: &registry::Registry,
    source: &str,
    lang_name: &str,
) -> Result<Vec<HighlightEvent>> {
    reg.ensure_config(lang_name)?;
    // Load any cached injection language parsers so injections resolve
    reg.load_cached_parsers();

    let configs = reg.configs();
    let config = configs
        .get(lang_name)
        .ok_or_else(|| anyhow::anyhow!("no config for language '{}'", lang_name))?;

    let mut highlighter = crate::highlight::Highlighter::new();

    let wasm_store = reg.new_wasm_store()?;
    highlighter
        .parser()
        .set_wasm_store(wasm_store)
        .map_err(|e| anyhow::anyhow!("failed to set wasm store: {:?}", e))?;

    // Injection languages (e.g. heex inside elixir) are resolved from already-loaded
    // configs. Missing injections are silently skipped — use `parsers fetch` to
    // pre-download injection language parsers for full highlighting.
    let events = highlighter
        .highlight(config, source.as_bytes(), None, |injected| {
            configs.get(injected)
        })
        .map_err(|e| anyhow::anyhow!("highlight init failed: {:?}", e))?;

    let mut core_events = Vec::new();

    for event in events {
        let event = event.map_err(|e| anyhow::anyhow!("highlight event error: {:?}", e))?;

        match event {
            crate::highlight::HighlightEvent::Source { start, end } => {
                core_events.push(HighlightEvent::Source { start, end });
            }
            crate::highlight::HighlightEvent::HighlightStart {
                highlight,
                language,
            } => {
                core_events.push(HighlightEvent::Start {
                    scope_index: highlight.0,
                    language,
                });
            }
            crate::highlight::HighlightEvent::HighlightEnd => {
                core_events.push(HighlightEvent::End);
            }
        }
    }

    Ok(core_events)
}

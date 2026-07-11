mod config;
mod gen_theme;
mod registry;
#[allow(clippy::all, dead_code)]
mod vendor;

use anyhow::Result;
use clap::{ArgAction, Parser, Subcommand, ValueEnum};
use etcetera::BaseStrategy;
use lumis_core::events::HighlightEvent;
use lumis_core::formatter::Formatter as CoreFormatter;
use lumis_core::formatter::TerminalBackground;
use lumis_core::languages::Language;
use std::fmt::Display;
use std::fs;
use std::io::{IsTerminal, Read as _};
use std::ops::RangeInclusive;
use std::path::{Path, PathBuf};
use terminal_size::{terminal_size, Width};

#[derive(Parser)]
#[command(
    version,
    propagate_version = true,
    about = "Syntax Highlighter powered by Tree-sitter and Neovim themes",
    disable_help_flag = true,
    disable_version_flag = true
)]
struct Cli {
    /// Print version
    #[arg(short = 'v', long, global = true, action = ArgAction::Version, help = "Print version")]
    version: Option<bool>,

    #[command(subcommand)]
    command: Commands,

    /// Where to look for WASM parsers and theme JSON files
    #[arg(short = 'd', long, env("LUMIS_DATA_DIR"), global = true)]
    data_dir: Option<PathBuf>,

    /// Path to the configuration file
    #[arg(long, env("LUMIS_CONFIG"), global = true)]
    config: Option<PathBuf>,

    /// Show extra output (downloads, cache hits, etc.)
    #[arg(short = 'V', long, global = true)]
    verbose: bool,

    /// Print help
    #[arg(long, global = true, action = ArgAction::Help, help = "Print help")]
    help: Option<bool>,
}

#[derive(Subcommand)]
enum Commands {
    /// Highlight source code from a file or stdin
    #[command(
        after_help = "Examples:\n  lumis highlight main.rs\n  lumis highlight -l javascript main.txt\n  lumis highlight -f html-inline -t dracula main.rs\n  lumis highlight -b theme -w 120 main.rs\n  lumis highlight --background '#282a36' --width 120 main.rs\n  lumis highlight -h 1,3-5 lib.rs\n  cat main.rs | lumis highlight -l rust\n  echo 'fn main() {}' | lumis highlight -l rust"
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

        /// Theme name, e.g. dracula, github_dark, or auto
        #[arg(short = 't', long)]
        theme: Option<String>,

        /// Terminal background: use `theme`, a hex color, or omit it to inherit the output background
        #[arg(short = 'b', long = "background")]
        background: Option<String>,

        /// Terminal render width for background padding. Use a number or 'auto'.
        #[arg(short = 'w', long)]
        width: Option<String>,

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

        /// Render nested brackets using rainbow bracket scopes
        #[arg(long)]
        rainbow_brackets: bool,
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
    /// BBCode using highlight scope names as tags
    BbcodeScoped,
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
    let config_path = cli.config.unwrap_or_else(config::default_path);
    let verbose = cli.verbose;

    match cli.command {
        Commands::Highlight {
            path,
            language,
            formatter,
            theme,
            background,
            width,
            themes,
            default_theme,
            css_variable_prefix,
            highlight_lines,
            rainbow_brackets,
        } => {
            let config = config::Config::load(&config_path)?;
            let reg = registry::Registry::new(data_dir)?;
            do_highlight(
                &reg,
                path,
                language,
                formatter,
                theme.or(config.highlight.theme),
                background,
                width,
                themes,
                default_theme,
                css_variable_prefix,
                highlight_lines,
                rainbow_brackets,
                verbose,
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
        let parser_path = reg.parser_path(query_name);
        if reg.is_cached(query_name) {
            if verbose {
                eprintln!("{}: {}", name, parser_path.display());
            }
            continue;
        }
        match reg.download_parser(query_name) {
            Ok(_) => {
                if verbose {
                    eprintln!(
                        "{}: {} -> {}",
                        name,
                        reg.parser_download_url(query_name),
                        parser_path.display()
                    );
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
        let parser_path = reg.parser_path(query_name);
        match reg.update_parser(query_name) {
            Ok(_) => {
                if verbose {
                    eprintln!(
                        "{}: {} -> {}",
                        name,
                        reg.parser_download_url(query_name),
                        parser_path.display()
                    );
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
    verbose: bool,
) -> Option<lumis_core::themes::Theme> {
    let name = match name.as_deref() {
        None | Some("auto") => match guess_terminal_theme() {
            Some(name) => name,
            None => {
                if verbose {
                    eprintln!("theme: auto unavailable");
                }
                return None;
            }
        },
        Some(name) => name.to_string(),
    };

    // Try built-in theme first
    if let Ok(theme) = lumis_core::themes::get(&name) {
        if verbose {
            eprintln!("theme: {}", theme.name);
        }
        return Some(theme);
    }

    // Try file theme from data dir
    if let Some(dir) = data_dir {
        let path = dir.join("themes").join(format!("{}.json", name));
        if let Ok(theme) = lumis_core::themes::from_file(&path) {
            if verbose {
                eprintln!("theme: {}", theme.name);
            }
            return Some(theme);
        }
    }

    if verbose {
        eprintln!("theme: {name} not found");
    }

    None
}

fn guess_terminal_theme() -> Option<String> {
    let background =
        terminal_colorsaurus::background_color(terminal_colorsaurus::QueryOptions::default())
            .ok()?
            .scale_to_8bit();

    closest_builtin_theme(background)
}

fn closest_builtin_theme(background: (u8, u8, u8)) -> Option<String> {
    lumis_core::themes::available_themes()
        .filter_map(|theme| {
            let theme_background = theme.bg().and_then(parse_hex_color)?;
            Some((color_distance(background, theme_background), &theme.name))
        })
        .min_by_key(|(distance, _)| *distance)
        .map(|(_, name)| name.clone())
}

fn parse_hex_color(color: &str) -> Option<(u8, u8, u8)> {
    let color = color.strip_prefix('#')?;
    if color.len() != 6 {
        return None;
    }

    Some((
        u8::from_str_radix(&color[0..2], 16).ok()?,
        u8::from_str_radix(&color[2..4], 16).ok()?,
        u8::from_str_radix(&color[4..6], 16).ok()?,
    ))
}

// Redmean color distance weights RGB channels based on human perception.
fn color_distance(left: (u8, u8, u8), right: (u8, u8, u8)) -> u64 {
    let red_mean = (u64::from(left.0) + u64::from(right.0)) / 2;
    let red = i64::from(left.0) - i64::from(right.0);
    let green = i64::from(left.1) - i64::from(right.1);
    let blue = i64::from(left.2) - i64::from(right.2);

    (((512 + red_mean) * red.unsigned_abs().pow(2)) >> 8)
        + 4 * green.unsigned_abs().pow(2)
        + (((767 - red_mean) * blue.unsigned_abs().pow(2)) >> 8)
}

#[allow(clippy::too_many_arguments)]
fn do_highlight(
    reg: &registry::Registry,
    path: Option<String>,
    language: Option<String>,
    formatter: Option<Formatter>,
    theme: Option<String>,
    background: Option<String>,
    width: Option<String>,
    themes: Vec<String>,
    default_theme: Option<String>,
    css_variable_prefix: String,
    highlight_lines: Option<String>,
    rainbow_brackets: bool,
    verbose: bool,
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

    if verbose {
        eprintln!("--");
        eprintln!("language: {}", lang.id_name());
    }

    if lang == Language::PlainText {
        if verbose {
            eprintln!("--\n");
        }
        print!("{}", source);
        return Ok(());
    }

    let lang_name = registry::language_to_query_name(lang);
    let mut events = highlight_to_events(reg, &source, lang_name)?;
    if rainbow_brackets {
        let ranges = reg.rainbow_ranges(lang_name, &source)?;
        events = overlay_rainbow_ranges(&events, &ranges, lang.id_name());
    }

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
        background,
        width,
        themes,
        default_theme,
        css_variable_prefix,
        parsed_highlight_lines,
        verbose,
    )
}

fn overlay_rainbow_ranges(
    events: &[HighlightEvent],
    ranges: &[registry::RainbowRange],
    language: &str,
) -> Vec<HighlightEvent> {
    let mut output = Vec::with_capacity(events.len() + ranges.len() * 3);
    let mut range_index = 0usize;

    for event in events {
        match event {
            HighlightEvent::Source { start, end } => {
                let mut cursor = *start;

                while range_index < ranges.len() && ranges[range_index].end <= *start {
                    range_index += 1;
                }

                let mut next_index = range_index;
                while next_index < ranges.len() {
                    let range = &ranges[next_index];
                    if range.start >= *end {
                        break;
                    }
                    if range.start < *start || range.end > *end {
                        next_index += 1;
                        continue;
                    }

                    if cursor < range.start {
                        output.push(HighlightEvent::Source {
                            start: cursor,
                            end: range.start,
                        });
                    }

                    output.push(HighlightEvent::Start {
                        scope_index: range.scope_index,
                        language: language.to_string(),
                    });
                    output.push(HighlightEvent::Source {
                        start: range.start,
                        end: range.end,
                    });
                    output.push(HighlightEvent::End);
                    cursor = range.end;
                    next_index += 1;
                }

                if cursor < *end {
                    output.push(HighlightEvent::Source {
                        start: cursor,
                        end: *end,
                    });
                }
            }
            other => output.push(other.clone()),
        }
    }

    output
}

#[allow(clippy::too_many_arguments)]
fn render_output(
    reg: &registry::Registry,
    source: &str,
    events: &[HighlightEvent],
    lang: Language,
    formatter: Option<Formatter>,
    theme: Option<String>,
    background: Option<String>,
    width: Option<String>,
    themes: Vec<String>,
    default_theme: Option<String>,
    css_variable_prefix: String,
    highlight_lines: Option<Vec<RangeInclusive<usize>>>,
    verbose: bool,
) -> Result<()> {
    match formatter.unwrap_or_default() {
        Formatter::HtmlInline => {
            let theme_obj = resolve_theme(theme, Some(reg.data_dir()), verbose);
            if verbose {
                eprintln!("--\n");
            }
            let mut builder = lumis_core::formatter::HtmlInlineBuilder::new();
            builder
                .language(lang)
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
                let theme_obj =
                    resolve_theme(Some(theme_id.to_string()), Some(reg.data_dir()), verbose)
                        .ok_or_else(|| anyhow::anyhow!("Theme '{}' not found", theme_id))?;
                theme_map.insert(theme_name, theme_obj);
            }
            if verbose {
                eprintln!("--\n");
            }

            let mut builder = lumis_core::formatter::HtmlMultiThemesBuilder::new();
            builder
                .language(lang)
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
            if verbose {
                eprintln!("--\n");
            }
            let mut builder = lumis_core::formatter::HtmlLinkedBuilder::new();
            builder.language(lang);

            if let Some(lines) = highlight_lines {
                let hl = lumis_core::formatter::html_linked::HighlightLines {
                    lines,
                    class: "l-highlighted".to_string(),
                };
                builder.highlight_lines(Some(hl));
            }

            let fmt = builder.build().map_err(|e| anyhow::anyhow!("{}", e))?;
            let mut output = Vec::new();
            fmt.render(source, events, &mut output)?;
            print!("{}", String::from_utf8(output)?);
        }

        Formatter::Terminal => {
            let theme_obj = resolve_theme(theme, Some(reg.data_dir()), verbose);
            if verbose {
                eprintln!("--\n");
            }
            let mut builder = lumis_core::formatter::TerminalBuilder::new();
            builder
                .language(lang)
                .theme(theme_obj)
                .background(parse_terminal_background(background.as_deref()))
                .width(resolve_terminal_width(width.as_deref())?);

            let fmt = builder.build().map_err(|e| anyhow::anyhow!("{}", e))?;
            let mut output = Vec::new();
            fmt.render(source, events, &mut output)?;
            print!("{}", String::from_utf8(output)?);
        }

        Formatter::BbcodeScoped => {
            if verbose {
                eprintln!("--\n");
            }
            let fmt = lumis_core::formatter::BBCodeScoped::new(lang);
            let mut output = Vec::new();
            fmt.render(source, events, &mut output)?;
            print!("{}", String::from_utf8(output)?);
        }
    }

    Ok(())
}

fn parse_terminal_background(bg: Option<&str>) -> TerminalBackground {
    match bg {
        Some("theme") => TerminalBackground::Theme,
        Some(color) => TerminalBackground::Color(color.to_string()),
        None => TerminalBackground::Inherit,
    }
}

fn resolve_terminal_width(width: Option<&str>) -> Result<Option<usize>> {
    match width {
        Some("auto") | None => Ok(auto_terminal_width()),
        Some(raw) => raw.parse::<usize>().map(Some).map_err(|_| {
            anyhow::anyhow!(
                "invalid width '{}', expected a positive integer or 'auto'",
                raw
            )
        }),
    }
}

fn auto_terminal_width() -> Option<usize> {
    compute_auto_terminal_width(
        std::io::stdout().is_terminal(),
        terminal_size().map(|(Width(width), _)| usize::from(width)),
        std::env::var("COLUMNS")
            .ok()
            .and_then(|value| value.parse().ok()),
    )
}

fn compute_auto_terminal_width(
    stdout_is_terminal: bool,
    detected_width: Option<usize>,
    columns_env: Option<usize>,
) -> Option<usize> {
    if !stdout_is_terminal {
        return None;
    }

    detected_width.or(columns_env)
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

#[allow(dead_code)]
fn relative_to_current(path: &Path) -> PathBuf {
    if let Ok(current_path) = std::env::current_dir() {
        let path = path.canonicalize().unwrap_or_else(|_| path.into());
        let current_path = current_path.canonicalize().unwrap_or(current_path);

        if let Ok(relative_path) = path.strip_prefix(&current_path) {
            return relative_path.into();
        }

        return path;
    }

    path.into()
}

fn highlight_to_events(
    reg: &registry::Registry,
    source: &str,
    lang_name: &str,
) -> Result<Vec<HighlightEvent>> {
    let config = reg
        .load_config(lang_name)?
        .ok_or_else(|| anyhow::anyhow!("no config for language '{}'", lang_name))?;
    // Leak configs to satisfy the 'static lifetime required by the highlight callback.
    // Acceptable because the CLI process exits after highlighting.
    let config = Box::leak(Box::new(config));
    let mut injected_configs: std::collections::HashMap<
        String,
        &'static crate::vendor::tree_sitter_highlight::HighlightConfiguration,
    > = std::collections::HashMap::new();

    let mut highlighter = crate::vendor::tree_sitter_highlight::Highlighter::new();
    let wasm_store = reg.new_wasm_store()?;
    highlighter
        .parser()
        .set_wasm_store(wasm_store)
        .map_err(|e| anyhow::anyhow!("failed to set wasm store: {:?}", e))?;

    // Injected languages are loaded lazily and only if their parsers were cached already.
    let events = highlighter
        .highlight(config, source.as_bytes(), None, |injected| {
            if !injected_configs.contains_key(injected) {
                if let Ok(Some(cfg)) = reg.load_cached_config(injected) {
                    injected_configs.insert(injected.to_string(), Box::leak(Box::new(cfg)));
                }
            }

            injected_configs.get(injected).copied()
        })
        .map_err(|e| anyhow::anyhow!("highlight init failed: {:?}", e))?;

    let mut core_events = Vec::new();

    for event in events {
        let event = event.map_err(|e| anyhow::anyhow!("highlight event error: {:?}", e))?;

        match event {
            crate::vendor::tree_sitter_highlight::HighlightEvent::Source { start, end } => {
                core_events.push(HighlightEvent::Source { start, end });
            }
            crate::vendor::tree_sitter_highlight::HighlightEvent::HighlightStart {
                highlight,
                language,
            } => {
                core_events.push(HighlightEvent::Start {
                    scope_index: highlight.0,
                    language,
                });
            }
            crate::vendor::tree_sitter_highlight::HighlightEvent::HighlightEnd => {
                core_events.push(HighlightEvent::End);
            }
        }
    }

    Ok(core_events)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn highlight_to_events_uses_cached_injection_parsers() {
        let dir = tempdir().unwrap();
        let reg = registry::Registry::new(dir.path().to_path_buf()).unwrap();
        reg.download_parser("elixir").unwrap();
        reg.download_parser("heex").unwrap();

        let source = r#"
defmodule MyAppWeb.CounterLive do
  use MyAppWeb, :live_view

  def render(assigns) do
    ~H"""
    <div>{@count}</div>
    """
  end
end
"#;

        let events = highlight_to_events(&reg, source, "elixir").unwrap();

        assert!(events.iter().any(|event| matches!(
            event,
            HighlightEvent::Start { language, .. } if language == "heex"
        )));
    }

    #[test]
    fn closest_builtin_theme_matches_exact_background() {
        assert_eq!(
            closest_builtin_theme((0x22, 0x24, 0x36)).as_deref(),
            Some("tokyonight_moon")
        );
    }

    #[test]
    fn parse_hex_color_rejects_invalid_values() {
        assert_eq!(parse_hex_color("#282a36"), Some((0x28, 0x2a, 0x36)));
        assert_eq!(parse_hex_color("282a36"), None);
        assert_eq!(parse_hex_color("#fff"), None);
    }

    #[test]
    fn compute_auto_terminal_width_prefers_detected_terminal_width() {
        assert_eq!(
            compute_auto_terminal_width(true, Some(120), Some(80)),
            Some(120)
        );
    }

    #[test]
    fn compute_auto_terminal_width_falls_back_to_columns_env() {
        assert_eq!(compute_auto_terminal_width(true, None, Some(80)), Some(80));
    }

    #[test]
    fn compute_auto_terminal_width_returns_none_when_not_a_tty() {
        assert_eq!(
            compute_auto_terminal_width(false, Some(120), Some(80)),
            None
        );
    }
}

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
use lumis_core::themes::{Style, Theme};
use std::fmt::Display;
use std::fs;
use std::io::{IsTerminal, Read as _};
use std::path::{Path, PathBuf};
use std::str::FromStr;
use terminal_size::{terminal_size, Width};
use tree_sitter::StreamingIterator;

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
    #[arg(long, env("LUMIS_DATA_DIR"), global = true)]
    data_dir: Option<PathBuf>,

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
    #[command(after_help = r#"Examples:
  lumis highlight main.rs
  lumis highlight -l javascript main.txt
  lumis highlight -f html-inline -t dracula main.rs
  lumis highlight -b theme -w 120 main.rs
  lumis highlight --background '#282a36' --width 120 main.rs
  lumis highlight -d rainbow-brackets main.rs
  cat main.rs | lumis highlight -l rust
  echo 'fn main() {}' | lumis highlight -l rust"#)]
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

        /// Built-in decorator to apply, can be repeated
        #[arg(short = 'd', long = "decorator")]
        decorators: Vec<DecoratorSpec>,
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

#[derive(Clone, Debug, PartialEq, Eq)]
enum DecoratorSpec {
    /// Color bracket pairs by nesting depth
    RainbowBrackets,
}

impl FromStr for DecoratorSpec {
    type Err = String;

    fn from_str(input: &str) -> Result<Self, Self::Err> {
        let input = input.trim();
        match input {
            "rainbow-brackets" => Ok(Self::RainbowBrackets),
            _ => Err(format!(
                "unknown decorator '{input}', expected rainbow-brackets"
            )),
        }
    }
}

impl clap::builder::ValueParserFactory for DecoratorSpec {
    type Parser = DecoratorSpecParser;

    fn value_parser() -> Self::Parser {
        DecoratorSpecParser
    }
}

#[derive(Clone, Copy)]
struct DecoratorSpecParser;

impl clap::builder::TypedValueParser for DecoratorSpecParser {
    type Value = DecoratorSpec;

    fn parse_ref(
        &self,
        cmd: &clap::Command,
        arg: Option<&clap::Arg>,
        value: &std::ffi::OsStr,
    ) -> Result<Self::Value, clap::Error> {
        DecoratorSpec::from_str.parse_ref(cmd, arg, value)
    }

    fn possible_values(
        &self,
    ) -> Option<Box<dyn Iterator<Item = clap::builder::PossibleValue> + '_>> {
        let values = vec![clap::builder::PossibleValue::new("rainbow-brackets")
            .help("Color bracket pairs by nesting depth")];
        Some(Box::new(values.into_iter()))
    }
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
            background,
            width,
            themes,
            default_theme,
            css_variable_prefix,
            decorators,
        } => {
            let reg = registry::Registry::new(data_dir)?;
            do_highlight(
                &reg,
                path,
                language,
                formatter,
                theme,
                background,
                width,
                themes,
                default_theme,
                css_variable_prefix,
                decorators,
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
    background: Option<String>,
    width: Option<String>,
    themes: Vec<String>,
    default_theme: Option<String>,
    css_variable_prefix: String,
    decorators: Vec<DecoratorSpec>,
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

    if lang == Language::PlainText && decorators.is_empty() {
        print!("{}", source);
        return Ok(());
    }

    let events = if lang == Language::PlainText {
        vec![HighlightEvent::Source {
            start: 0,
            end: source.len(),
        }]
    } else {
        let lang_name = registry::language_to_query_name(lang);
        highlight_to_events(reg, &source, lang_name)?
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
        decorators,
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
    background: Option<String>,
    width: Option<String>,
    themes: Vec<String>,
    default_theme: Option<String>,
    css_variable_prefix: String,
    decorators: Vec<DecoratorSpec>,
) -> Result<()> {
    let theme_obj = resolve_theme(theme, Some(reg.data_dir()));
    let use_decorator_document = !decorators.is_empty();

    match formatter.unwrap_or_default() {
        Formatter::HtmlInline => {
            if use_decorator_document {
                return Err(anyhow::anyhow!(
                    "decorators currently render only with --formatter terminal"
                ));
            }

            let mut builder = lumis_core::formatter::HtmlInlineBuilder::new();
            builder
                .language(lang)
                .theme(theme_obj)
                .italic(false)
                .include_highlights(false);

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

            if use_decorator_document {
                return Err(anyhow::anyhow!(
                    "decorators currently render only with --formatter terminal"
                ));
            }

            let mut builder = lumis_core::formatter::HtmlMultiThemesBuilder::new();
            builder
                .language(lang)
                .themes(theme_map)
                .css_variable_prefix(css_variable_prefix);

            if let Some(default) = default_theme {
                builder.default_theme(default);
            }

            let fmt = builder.build().map_err(|e| anyhow::anyhow!("{}", e))?;
            let mut output = Vec::new();
            fmt.render(source, events, &mut output)?;
            print!("{}", String::from_utf8(output)?);
        }

        Formatter::HtmlLinked => {
            if use_decorator_document {
                return Err(anyhow::anyhow!(
                    "decorators currently render only with --formatter terminal"
                ));
            }

            let mut builder = lumis_core::formatter::HtmlLinkedBuilder::new();
            builder.language(lang);

            let fmt = builder.build().map_err(|e| anyhow::anyhow!("{}", e))?;
            let mut output = Vec::new();
            fmt.render(source, events, &mut output)?;
            print!("{}", String::from_utf8(output)?);
        }

        Formatter::Terminal => {
            if use_decorator_document {
                let output = render_terminal_document(
                    source,
                    events,
                    reg,
                    lang,
                    theme_obj.as_ref(),
                    parse_terminal_background(background.as_deref()),
                    resolve_terminal_width(width.as_deref())?,
                    &decorators,
                )?;
                print!("{output}");
                return Ok(());
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
            if use_decorator_document {
                return Err(anyhow::anyhow!(
                    "decorators currently render only with --formatter terminal"
                ));
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

#[allow(clippy::too_many_arguments)]
fn render_terminal_document(
    source: &str,
    events: &[HighlightEvent],
    reg: &registry::Registry,
    fallback_language: Language,
    theme: Option<&Theme>,
    background: TerminalBackground,
    width: Option<usize>,
    decorators: &[DecoratorSpec],
) -> Result<String> {
    let document = line_view(source, events, reg, fallback_language, decorators)?;
    let fallback_bg = terminal_fallback_bg(theme, &background);
    let mut output = String::new();

    for line in &document.lines {
        let line_style = merged_line_style(line);
        let mut line_width = 0usize;
        let mut column = 0usize;
        let gutter = render_terminal_gutter(line, &line_style);
        line_width += display_width_without_ansi(&gutter);
        output.push_str(&gutter);

        for span in &line.spans {
            let mut style = span_theme_style(span, fallback_language, theme);
            if let Some(line_style) = &line_style {
                merge_theme_style(&mut style, line_style);
            }
            if let Some(patch) = &span.style {
                apply_style_patch(&mut style, patch);
            }
            if style.bg.is_none() {
                if let Some(bg) = fallback_bg.as_deref() {
                    style.bg = Some(bg.to_string());
                }
            }

            let rendered =
                render_terminal_text_with_virtuals(&span.text, line, &mut column, &style);
            line_width += display_width(&span.text);
            output.push_str(&rendered);
        }

        let remaining_virtuals = render_terminal_remaining_virtuals(line, &mut column);
        line_width += display_width_without_ansi(&remaining_virtuals);
        output.push_str(&remaining_virtuals);

        if let (Some(bg), Some(width)) = (fallback_bg.as_deref(), width) {
            if line_width < width {
                let padding = " ".repeat(width - line_width);
                output.push_str(&lumis_core::formatter::ansi::paint(
                    &padding,
                    &Style {
                        bg: Some(bg.to_string()),
                        ..Style::default()
                    },
                ));
            }
        }

        output.push('\n');
    }

    Ok(output)
}

fn render_terminal_gutter(
    line: &lumis_core::highlight::Line,
    line_style: &Option<lumis_core::highlight::StylePatch>,
) -> String {
    if line.gutter_text.is_empty() && line_sign(line).is_none() {
        return String::new();
    }

    let mut output = String::new();
    for item in &line.gutter_text {
        output.push_str(&paint_terminal(&item.text, &style_from_patch(&item.style)));
        output.push(' ');
    }
    if let Some(sign) = line_sign(line) {
        let style = line_style
            .as_ref()
            .map(style_from_patch)
            .unwrap_or_default();
        output.push_str(&paint_terminal(sign, &style));
        output.push(' ');
    }
    output.push_str("│ ");
    output
}

fn render_terminal_text_with_virtuals(
    text: &str,
    line: &lumis_core::highlight::Line,
    column: &mut usize,
    style: &Style,
) -> String {
    if line.virtual_text.is_empty() {
        *column += display_width(text);
        return paint_terminal(text, style);
    }

    let mut output = String::new();
    for ch in text.chars() {
        if let Some(virtual_text) = virtual_text_at_column(line, *column) {
            let mut virtual_style = style.clone();
            apply_style_patch(&mut virtual_style, &virtual_text.style);
            output.push_str(&paint_terminal(&virtual_text.text, &virtual_style));
        } else {
            output.push_str(&paint_terminal(&ch.to_string(), style));
        }
        *column += char_display_width(ch);
    }

    output
}

fn render_terminal_remaining_virtuals(
    line: &lumis_core::highlight::Line,
    column: &mut usize,
) -> String {
    let mut output = String::new();
    for virtual_text in &line.virtual_text {
        if virtual_text.column < *column {
            continue;
        }
        while *column < virtual_text.column {
            output.push(' ');
            *column += 1;
        }
        output.push_str(&paint_terminal(
            &virtual_text.text,
            &style_from_patch(&virtual_text.style),
        ));
        *column += display_width(&virtual_text.text);
    }
    output
}

fn line_sign(line: &lumis_core::highlight::Line) -> Option<&str> {
    line.signs.iter().map(|sign| sign.text.as_str()).next()
}

fn line_view(
    source: &str,
    events: &[HighlightEvent],
    reg: &registry::Registry,
    lang: Language,
    decorators: &[DecoratorSpec],
) -> Result<lumis_core::highlight::LineView> {
    let mut options = lumis_core::highlight::LineViewOptions::default();

    for decorator in decorators {
        match decorator {
            DecoratorSpec::RainbowBrackets => {
                options.highlight_decorations.extend(
                    lumis_core::decorators::rainbow_brackets_decorations_from_pairs(
                        rainbow_brackets_query_pairs(reg, source, lang)?,
                        &lumis_core::highlight::RainbowBracketsOptions::default(),
                    ),
                );
            }
        }
    }

    Ok(lumis_core::highlight::LineView::from_events(
        source, events, &options,
    ))
}

fn rainbow_brackets_query_pairs(
    reg: &registry::Registry,
    source: &str,
    lang: Language,
) -> Result<Vec<(std::ops::Range<usize>, std::ops::Range<usize>)>> {
    let lang_name = registry::language_to_query_name(lang);
    let brackets_query = reg.brackets_query(lang_name).ok_or_else(|| {
        anyhow::anyhow!("rainbow-brackets requires a brackets.scm query for '{lang_name}'")
    })?;
    let config = reg
        .load_config(lang_name)?
        .ok_or_else(|| anyhow::anyhow!("failed to load parser config for '{lang_name}'"))?;

    let mut parser = tree_sitter::Parser::new();
    parser.set_wasm_store(reg.new_wasm_store()?)?;
    parser.set_language(&config.language)?;
    let tree = parser
        .parse(source, None)
        .ok_or_else(|| anyhow::anyhow!("failed to parse source for '{lang_name}'"))?;
    let query = tree_sitter::Query::new(&config.language, brackets_query)?;
    let open_index = query
        .capture_index_for_name("open")
        .ok_or_else(|| anyhow::anyhow!("brackets.scm for '{lang_name}' is missing @open"))?;
    let close_index = query
        .capture_index_for_name("close")
        .ok_or_else(|| anyhow::anyhow!("brackets.scm for '{lang_name}' is missing @close"))?;
    let mut cursor = tree_sitter::QueryCursor::new();
    let mut pairs = Vec::new();

    let mut query_matches = cursor.matches(&query, tree.root_node(), source.as_bytes());
    while let Some(query_match) = query_matches.next() {
        if query
            .property_settings(query_match.pattern_index)
            .iter()
            .any(|property| property.key.as_ref() == "rainbow.exclude")
        {
            continue;
        }

        let mut open = None;
        let mut close = None;
        for capture in query_match.captures {
            if capture.index == open_index {
                open = Some(capture.node.byte_range());
            } else if capture.index == close_index {
                close = Some(capture.node.byte_range());
            }
        }
        if let (Some(open), Some(close)) = (open, close) {
            pairs.push((open, close));
        }
    }

    Ok(pairs)
}

fn merged_line_style(
    line: &lumis_core::highlight::Line,
) -> Option<lumis_core::highlight::StylePatch> {
    let mut style = lumis_core::highlight::StylePatch::default();
    for highlight in &line.line_highlights {
        style.merge(&highlight.style);
    }

    (!style.is_empty()).then_some(style)
}

fn style_from_patch(patch: &lumis_core::highlight::StylePatch) -> Style {
    let mut style = Style::default();
    apply_style_patch(&mut style, patch);
    style
}

fn span_theme_style(
    span: &lumis_core::highlight::Span,
    fallback_language: Language,
    theme: Option<&Theme>,
) -> Style {
    let Some(theme) = theme else {
        return Style::default();
    };
    let Some(scope) = span.scopes.last() else {
        return Style::default();
    };
    let scope_name = lumis_core::highlights::HIGHLIGHT_NAMES
        .get(scope.scope_index)
        .copied()
        .unwrap_or("");
    let language = scope.language.unwrap_or(fallback_language);
    let specialized = format!("{}.{}", scope_name, language.id_name());
    theme
        .get_style(&specialized)
        .or_else(|| theme.get_style(scope_name))
        .cloned()
        .unwrap_or_default()
}

fn merge_theme_style(base: &mut Style, patch: &lumis_core::highlight::StylePatch) {
    if let Some(fg) = &patch.fg {
        base.fg = Some(fg.clone());
    }
    if let Some(bg) = &patch.bg {
        base.bg = Some(bg.clone());
    }
    if let Some(bold) = patch.bold {
        base.bold = bold;
    }
    if let Some(italic) = patch.italic {
        base.italic = italic;
    }
    if let Some(underline) = patch.text_decoration.underline {
        base.text_decoration.underline = underline;
    }
    if let Some(strikethrough) = patch.text_decoration.strikethrough {
        base.text_decoration.strikethrough = strikethrough;
    }
}

fn apply_style_patch(base: &mut Style, patch: &lumis_core::highlight::StylePatch) {
    merge_theme_style(base, patch);
}

fn terminal_fallback_bg(theme: Option<&Theme>, background: &TerminalBackground) -> Option<String> {
    match background {
        TerminalBackground::Inherit => None,
        TerminalBackground::Theme => theme.and_then(Theme::bg).map(ToString::to_string),
        TerminalBackground::Color(color) => Some(color.clone()),
    }
}

fn paint_terminal(text: &str, style: &Style) -> String {
    if style == &Style::default() {
        text.to_string()
    } else {
        lumis_core::formatter::ansi::paint(text, style)
    }
}

fn display_width(text: &str) -> usize {
    text.chars().map(char_display_width).sum()
}

fn display_width_without_ansi(text: &str) -> usize {
    let mut width = 0;
    let mut chars = text.chars().peekable();

    while let Some(ch) = chars.next() {
        if ch == '\x1b' && chars.peek() == Some(&'[') {
            for next in chars.by_ref() {
                if next == 'm' {
                    break;
                }
            }
            continue;
        }
        width += char_display_width(ch);
    }

    width
}

fn char_display_width(ch: char) -> usize {
    match ch {
        '\t' => 4,
        _ => 1,
    }
}

fn virtual_text_at_column(
    line: &lumis_core::highlight::Line,
    column: usize,
) -> Option<&lumis_core::highlight::VirtualText> {
    line.virtual_text
        .iter()
        .find(|virtual_text| virtual_text.column == column)
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

enum FileArgument {
    NamedPath(std::path::PathBuf),
}

impl Display for FileArgument {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            FileArgument::NamedPath(path) => {
                write!(f, "{}", relative_to_current(path).display())
            }
        }
    }
}

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

    #[test]
    fn decorator_spec_rejects_unknown_decorators() {
        let error = "unknown".parse::<DecoratorSpec>().unwrap_err();

        assert!(error.contains("unknown decorator 'unknown'"));
    }
}

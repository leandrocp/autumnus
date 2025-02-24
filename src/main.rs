use anyhow::Result;
use autumnus::languages::Language;
use clap::{Parser, Subcommand, ValueEnum};
use std::fmt::Display;
use std::path::{Path, PathBuf};
use std::fs;
use strum::IntoEnumIterator;

#[cfg(feature = "dev")]
use anyhow::Context;

#[derive(Parser)]
#[command(version)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    ListLanguages,

    Highlight {
        path: String,

        #[arg(short = 'f', long)]
        formatter: Option<Formatter>,

        #[arg(short = 't', long)]
        theme: Option<String>,
    },

    HighlightSource {
        source: String,

        #[arg(short = 'l', long)]
        language: Option<String>,

        #[arg(short = 'f', long)]
        formatter: Option<Formatter>,

        #[arg(short = 't', long)]
        theme: Option<String>,
    },

    #[cfg(feature = "dev")]
    GenSamples,
}

#[derive(Clone, ValueEnum, Default)]
enum Formatter {
    HtmlInline,
    HtmlLinked,
    #[default]
    Terminal,
}

// cargo run --features=dev -- gen-samples
// cargo run -- highlight-source "code" --formatter terminal
fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::ListLanguages => list_languages(),

        Commands::Highlight {
            path,
            formatter,
            theme,
        } => highlight(&path, formatter, theme),

        Commands::HighlightSource {
            source,
            language,
            formatter,
            theme,
        } => highlight_source(&source, language.as_deref(), formatter, theme),

        #[cfg(feature = "dev")]
        Commands::GenSamples => gen_samples(),
    }
}

fn list_languages() -> Result<()> {
    for language in Language::iter() {
        let name = Language::id_name(&language);
        println!("{}", name);

        for glob in Language::language_globs(language) {
            print!(" {}", glob.as_str());
        }

        println!();
    }

    Ok(())
}

fn highlight(path: &str, formatter: Option<Formatter>, theme: Option<String>) -> Result<()> {
    let theme = autumnus::themes::get(&theme.unwrap_or("dracula".to_string()))
        .cloned()
        .unwrap_or_default();

    let bytes = read_or_die(Path::new(&path));
    let source = std::str::from_utf8(&bytes).unwrap();

    match formatter.unwrap_or_default() {
        Formatter::HtmlInline => {
            let highlighted = autumnus::highlight_html_inline(
                path,
                source,
                autumnus::Options {
                    theme,
                    debug: false,
                    ..autumnus::Options::default()
                },
            );

            println!("{}", highlighted);
        }

        Formatter::HtmlLinked => {
            let highlighted = autumnus::highlight_html_linked(
                path,
                source,
                autumnus::Options {
                    theme,
                    debug: false,
                    ..autumnus::Options::default()
                },
            );

            println!("{}", highlighted);
        }

        Formatter::Terminal => {
            let highlighted = autumnus::highlight_terminal(
                path,
                source,
                autumnus::Options {
                    theme,
                    ..autumnus::Options::default()
                },
            );

            println!("{}", highlighted);
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
            eprintln!("No such file: {}", file_arg);
        }
        std::io::ErrorKind::PermissionDenied => {
            eprintln!("Permission denied when reading file: {}", file_arg);
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

fn highlight_source(
    source: &str,
    language: Option<&str>,
    formatter: Option<Formatter>,
    theme: Option<String>,
) -> Result<()> {
    let theme = autumnus::themes::get(&theme.unwrap_or("dracula".to_string()))
        .cloned()
        .unwrap_or_default();

    match formatter.unwrap_or_default() {
        Formatter::HtmlInline => {
            let highlighted = autumnus::highlight_html_inline(
                language.unwrap_or_default(),
                source,
                autumnus::Options {
                    theme,
                    debug: false,
                    ..autumnus::Options::default()
                },
            );

            println!("{}", highlighted);
        }

        Formatter::HtmlLinked => {
            let highlighted = autumnus::highlight_html_linked(
                language.unwrap_or_default(),
                source,
                autumnus::Options {
                    theme,
                    debug: false,
                    ..autumnus::Options::default()
                },
            );

            println!("{}", highlighted);
        }

        Formatter::Terminal => {
            let highlighted = autumnus::highlight_terminal(
                language.unwrap_or_default(),
                source,
                autumnus::Options {
                    theme,
                    ..autumnus::Options::default()
                },
            );

            println!("{}", highlighted);
        }
    }

    Ok(())
}

#[cfg(feature = "dev")]
const HTML_TEMPLATE: &str = r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{lang} - {theme} - Autumnus</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
    <style>
        * {
            font-family: 'JetBrains Mono', monospace;
            line-height: 1.5;
        }
        pre {
            font-size: 15px;
            margin: 20px;
            padding: 50px;
            border-radius: 10px;
        }
    </style>
</head>
<body>
</body>
</html>"#;

#[cfg(feature = "dev")]
fn gen_samples() -> Result<()> {
    let samples_path = PathBuf::from("./samples");

    let themes = [
        "catppuccin_frappe",
        "catppuccin_latte",
        "dracula",
        "github_dark",
        "github_light",
        "gruvbox_dark",
        "gruvbox_light",
        "kanagawa_lotus",
        "kanagawa_wave",
        "solarized_dark",
        "solarized_light",
        "tokyonight_day",
        "tokyonight_night",
        "vscode_dark",
        "vscode_light",
    ];

    let entries = collect_sample_entries(&samples_path)?;

    gen_samples_entries(&themes, &samples_path, &entries)?;

    Ok(())
}

#[cfg(feature = "dev")]
fn collect_sample_entries(samples_path: &Path) -> Result<Vec<fs::DirEntry>> {
    let entries = fs::read_dir(samples_path)
        .context("failed to read samples")?
        .filter_map(|entry| {
            let e = entry.ok()?;
            let path = e.path();
            let file_name = path.file_name().and_then(|n| n.to_str())?;

            if file_name == "README.md" {
                None
            } else if file_name == "html.html"
                || path.extension().and_then(|ext| ext.to_str()) != Some("html")
            {
                Some(e)
            } else {
                None
            }
        })
        .collect::<Vec<_>>();
    Ok(entries)
}

#[cfg(feature = "dev")]
fn gen_samples_entries(
    themes: &[&str],
    samples_path: &Path,
    entries: &[fs::DirEntry],
) -> Result<()> {
    for theme in themes {
        let theme = autumnus::themes::get(theme).unwrap();

        for entry in entries {
            let path = entry.path();

            let file_name = path
                .file_name()
                .expect("failed to read sample file name")
                .to_str()
                .unwrap();

            let contents = fs::read_to_string(&path)
                .with_context(|| format!("failed to read sample file: {}", file_name))?;

            let highlighted = autumnus::highlight_html_inline(
                file_name,
                &contents,
                autumnus::Options {
                    theme: theme.clone(),
                    debug: false,
                    ..autumnus::Options::default()
                },
            );

            let base_name = file_name.split('.').next().unwrap_or(file_name);
            let html_path = samples_path.join(format!("{}.{}.html", base_name, theme.name));

            let html = HTML_TEMPLATE
                .replace("{lang}", base_name)
                .replace("{theme}", &theme.name);
            let full_html = html.replace("<body>", &format!("<body>\n{}", highlighted));

            fs::write(&html_path, full_html)
                .with_context(|| format!("failed to write output file: {}", html_path.display()))?;

            println!("{}", html_path.display());
        }
    }
    Ok(())
}

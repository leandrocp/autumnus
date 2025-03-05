use anyhow::Result;
use autumnus::languages::Language;
use clap::{Parser, Subcommand, ValueEnum};
use std::fmt::Display;
use std::fs;
use std::path::{Path, PathBuf};
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
    ListThemes,

    DumpTreeSitter {
        path: String,
    },

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
}

#[derive(Clone, ValueEnum, Default)]
enum Formatter {
    HtmlInline,
    HtmlLinked,
    #[default]
    Terminal,
}

// cargo run -- highlight-source "code" --formatter terminal
fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::ListLanguages => list_languages(),

        Commands::ListThemes => list_themes(),

        Commands::DumpTreeSitter { path } => dump_tree_sitter(&path),

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
    }
}

fn list_themes() -> Result<()> {
    let mut themes: Vec<_> = autumnus::themes::ALL_THEMES.iter().collect();
    themes.sort_by(|a, b| a.name.cmp(&b.name));

    for theme in themes {
        println!("{}", theme.name);
    }

    Ok(())
}

fn list_languages() -> Result<()> {
    for language in Language::iter() {
        let name = Language::id_name(&language);
        println!("{}", name);

        for glob in Language::language_globs(language) {
            print!("  {}", glob.as_str());
        }

        println!();
    }

    Ok(())
}

// https://github.com/Wilfred/difftastic/blob/8953c55cf854ceac2ccb6ece004d6a94a5bfa122/src/main.rs#L121
fn dump_tree_sitter(path: &str) -> Result<()> {
    let bytes = read_or_die(Path::new(&path));
    let source = String::from_utf8_lossy(&bytes).to_string();
    let language = autumnus::languages::Language::guess(path, &source);
    let config = language.config();
    let tree = to_tree(&source, &config.language);
    print_tree(&source, &tree);
    Ok(())
}

fn to_tree(src: &str, language: &tree_sitter::Language) -> tree_sitter::Tree {
    let mut parser = tree_sitter::Parser::new();

    parser
        .set_language(language)
        .expect("Incompatible tree-sitter version");

    parser.parse(src, None).unwrap()
}

fn print_tree(src: &str, tree: &tree_sitter::Tree) {
    let mut cursor = tree.walk();
    print_cursor(src, &mut cursor, 0);
}

fn print_cursor(src: &str, cursor: &mut tree_sitter::TreeCursor, depth: usize) {
    loop {
        let node = cursor.node();

        let formatted_node = format!(
            "{} {} - {}",
            node.kind().replace('\n', "\\n"),
            node.start_position(),
            node.end_position()
        );

        if node.child_count() == 0 {
            let node_src = &src[node.start_byte()..node.end_byte()];
            println!("{}{} {:?}", "  ".repeat(depth), formatted_node, node_src);
        } else {
            println!("{}{}", "  ".repeat(depth), formatted_node,);
        }

        if cursor.goto_first_child() {
            print_cursor(src, cursor, depth + 1);
            cursor.goto_parent();
        }

        if !cursor.goto_next_sibling() {
            break;
        }
    }
}

fn highlight(path: &str, formatter: Option<Formatter>, theme: Option<String>) -> Result<()> {
    let theme = theme.unwrap_or("catppuccin_frappe".to_string());
    let theme = autumnus::themes::get(&theme).expect("Theme not found");

    let bytes = read_or_die(Path::new(&path));
    let source = std::str::from_utf8(&bytes).unwrap();

    match formatter.unwrap_or_default() {
        Formatter::HtmlInline => {
            let highlighted = autumnus::highlight(
                path,
                source,
                autumnus::Options {
                    formatter: autumnus::FormatterOption::HtmlInline,
                    theme,
                    include_highlight: false,
                    ..autumnus::Options::default()
                },
            );

            println!("{}", highlighted);
        }

        Formatter::HtmlLinked => {
            let highlighted = autumnus::highlight(
                path,
                source,
                autumnus::Options {
                    formatter: autumnus::FormatterOption::HtmlLinked,
                    theme,
                    include_highlight: false,
                    ..autumnus::Options::default()
                },
            );

            println!("{}", highlighted);
        }

        Formatter::Terminal => {
            let highlighted = autumnus::highlight(
                path,
                source,
                autumnus::Options {
                    formatter: autumnus::FormatterOption::Terminal,
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
    let theme = theme.unwrap_or("catppuccin_frappe".to_string());
    let theme = autumnus::themes::get(&theme).expect("Theme not found");

    match formatter.unwrap_or_default() {
        Formatter::HtmlInline => {
            let highlighted = autumnus::highlight(
                language.unwrap_or_default(),
                source,
                autumnus::Options {
                    formatter: autumnus::FormatterOption::HtmlInline,
                    theme,
                    include_highlight: false,
                    ..autumnus::Options::default()
                },
            );

            println!("{}", highlighted);
        }

        Formatter::HtmlLinked => {
            let highlighted = autumnus::highlight(
                language.unwrap_or_default(),
                source,
                autumnus::Options {
                    formatter: autumnus::FormatterOption::HtmlLinked,
                    theme,
                    include_highlight: false,
                    ..autumnus::Options::default()
                },
            );

            println!("{}", highlighted);
        }

        Formatter::Terminal => {
            let highlighted = autumnus::highlight(
                language.unwrap_or_default(),
                source,
                autumnus::Options {
                    formatter: autumnus::FormatterOption::Terminal,
                    theme,
                    ..autumnus::Options::default()
                },
            );

            println!("{}", highlighted);
        }
    }

    Ok(())
}

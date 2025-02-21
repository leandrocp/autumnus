use anyhow::{Context, Result};
use clap::{Parser, Subcommand, ValueEnum};
use std::path::{Path, PathBuf};

#[derive(Parser)]
#[command(version)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Highlight {
        source: String,

        #[arg(short = 'l', long)]
        language: Option<String>,

        #[arg(short, long)]
        formatter: Option<Formatter>,
    },

    #[cfg(feature = "dev")]
    GenSamples,
}

#[derive(Clone, ValueEnum)]
enum Formatter {
    HtmlInline,
    HtmlLinked,
    Terminal,
}

// cargo run --features=dev -- gen-samples
// cargo run -- highlight "code" --formatter terminal
fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Highlight {
            source,
            language,
            formatter,
        } => highlight(&source, language.as_deref(), formatter),

        #[cfg(feature = "dev")]
        Commands::GenSamples => gen_samples(),
    }
}

fn highlight(source: &str, language: Option<&str>, _formatter: Option<Formatter>) -> Result<()> {
    // TODO: options

    let path = Path::new("themes/catppuccin_frappe.json");
    let theme = autumnus::themes::Theme::from_file(path).unwrap();

    let highlighted = autumnus::highlight_to_html_inline(
        language.unwrap_or_default(),
        source,
        autumnus::Options {
            theme,
            ..autumnus::Options::default()
        },
    );

    println!("{}", highlighted);

    Ok(())
}

fn gen_samples() -> Result<()> {
    println!("gen_samples");
    Ok(())
}

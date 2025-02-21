use anyhow::{Context, Result};
use clap::{Parser, Subcommand, ValueEnum};
use std::{
    fs,
    path::{Path, PathBuf},
};

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

    let theme_path = Path::new("themes/catppuccin_frappe.json");
    let theme = autumnus::themes::Theme::from_file(theme_path).unwrap();

    let highlighted = autumnus::highlight_html_inline(
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
    let theme_path = Path::new("themes/catppuccin_frappe.json");
    let theme_name = theme_path
        .file_stem()
        .and_then(|s| s.to_str())
        .expect("failed to extract theme name");

    let samples_path = PathBuf::from("./samples");
    let entries = fs::read_dir(&samples_path)
        .context("failed to read samples")?
        .filter_map(|entry| {
            entry.ok().and_then(|e| {
                let path = e.path();
                let file_name = path.file_name().and_then(|n| n.to_str())?;

                if file_name == "html.html"
                    || path.extension().and_then(|ext| ext.to_str()) != Some("html")
                {
                    Some(e)
                } else {
                    None
                }
            })
        });

    for entry in entries {
        let theme = autumnus::themes::Theme::from_file(theme_path).unwrap();
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
                theme,
                ..autumnus::Options::default()
            },
        );

        let html_filename = file_name
            .split('.')
            .next()
            .expect("failed to generate output name");
        let html_path = samples_path.join(format!("{}.{}.html", html_filename, theme_name));

        fs::write(&html_path, highlighted)
            .with_context(|| format!("failed to write output file: {}", html_path.display()))?;

        println!("generated: {}", html_path.display());
    }

    Ok(())
}

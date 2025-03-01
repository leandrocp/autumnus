use anyhow::{Context, Result};
use clap::{Parser, Subcommand};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Parser)]
#[command(version)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    GenSamples,
}

fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::GenSamples => gen_samples(),
    }
}

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

fn gen_samples() -> Result<()> {
    let samples_path = PathBuf::from("./samples");

    let themes = [
        "catppuccin_frappe",
        "catppuccin_latte",
        "catppuccin_macchiato",
        "catppuccin_mocha",
        "dracula",
        "dracula_soft",
        "github_dark",
        "github_light",
        "gruvbox_dark",
        "gruvbox_light",
        "kanagawa_dragon",
        "kanagawa_lotus",
        "kanagawa_wave",
        "material_lighter",
        "material_oceanic",
        "nord",
        "onedark_dark",
        "onedark_pro_dark",
        "onelight",
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

fn collect_sample_entries(samples_path: &Path) -> Result<Vec<fs::DirEntry>> {
    let entries = fs::read_dir(samples_path)
        .context("failed to read samples")?
        .filter_map(|entry| {
            let e = entry.ok()?;
            let path = e.path();
            let file_name = path.file_name().and_then(|n| n.to_str())?;

            if file_name == "README.md" || file_name == "LICENSE.md" {
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

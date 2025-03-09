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
    GenCss,
}

fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::GenSamples => gen_samples(),
        Commands::GenCss => gen_css(),
    }
}

const HTML_TEMPLATE: &str = r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{lang} - {theme} - Autumnus</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=fira-code:300,400,500,600,700" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      * {
        font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
      }
    </style>
</head>
<body>
</body>
</html>"#;

fn gen_samples() -> Result<()> {
    let samples_path = PathBuf::from("./samples");

    let themes = [
        "aura_dark",
        "ayu_dark",
        "ayu_light",
        "catppuccin_latte",
        "catppuccin_mocha",
        "cyberdream_dark",
        "cyberdream_light",
        "dracula",
        "edge_dark",
        "edge_light",
        "everforest_dark",
        "everforest_light",
        "github_dark",
        "github_light",
        "gruvbox_dark",
        "gruvbox_light",
        "kanagawa_lotus",
        "kanagawa_wave",
        "material_lighter",
        "material_oceanic",
        "melange_dark",
        "melange_light",
        "monokai_pro_dark",
        "nightfox",
        "nord",
        "onedark",
        "onelight",
        "rosepine_dark",
        "rosepine_dawn",
        "solarized_autumn_dark",
        "solarized_autumn_light",
        "tokyonight_day",
        "tokyonight_night",
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
        let theme = autumnus::themes::get(theme).expect("Failed to get theme");

        for entry in entries {
            let path = entry.path();

            let file_name = path
                .file_name()
                .expect("failed to read sample file name")
                .to_str()
                .unwrap();

            let contents = fs::read_to_string(&path)
                .with_context(|| format!("failed to read sample file: {}", file_name))?;

            let highlighted = autumnus::highlight(
                &contents,
                autumnus::Options {
                    lang_or_path: Some(file_name),
                    formatter: autumnus::FormatterOption::HtmlInline {
                        pre_class: Some(
                            "w-full overflow-auto rounded-lg p-8 text-sm antialiased leading-6",
                        ),
                        italic: false,
                        include_highlight: false,
                    },
                    theme,
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

fn gen_css() -> Result<()> {
    let css_dir = Path::new("css");
    fs::create_dir_all(css_dir)?;

    let mut themes: Vec<_> = autumnus::themes::ALL_THEMES.iter().collect();
    themes.sort_by(|a, b| a.name.cmp(&b.name));

    for theme in themes {
        let css = theme.css(true);
        let css_path = css_dir.join(format!("{}.css", theme.name));
        fs::write(&css_path, css)?;
        println!("{}", css_path.display());
    }

    Ok(())
}

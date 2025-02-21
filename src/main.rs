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
    let theme_paths = [
        Path::new("themes/catppuccin_frappe.json"),
        Path::new("themes/github_light.json"),
        Path::new("themes/tokyonight_day.json"),
        Path::new("themes/tokyonight_night.json"),
    ];

    let samples_path = PathBuf::from("./samples");
    let entries = collect_sample_entries(&samples_path)?;

    gen_samples_entries(&theme_paths, &samples_path, &entries)?;
    gen_samples_index(&theme_paths, &samples_path, &entries)?;

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

            if file_name == "html.html"
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
    theme_paths: &[&Path],
    samples_path: &Path,
    entries: &[fs::DirEntry],
) -> Result<()> {
    for theme_path in theme_paths {
        let theme_name = theme_path
            .file_stem()
            .and_then(|s| s.to_str())
            .expect("failed to extract theme name");

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

            let base_name = file_name.split('.').next().unwrap_or(file_name);
            let html_path = samples_path.join(format!("{}.{}.html", base_name, theme_name));

            let html = HTML_TEMPLATE
                .replace("{lang}", base_name)
                .replace("{theme}", theme_name);
            let full_html = html.replace("<body>", &format!("<body>\n{}", highlighted));

            fs::write(&html_path, full_html)
                .with_context(|| format!("failed to write output file: {}", html_path.display()))?;

            println!("Generated: {}", html_path.display());
        }
    }
    Ok(())
}

#[cfg(feature = "dev")]
fn gen_samples_index(
    theme_paths: &[&Path],
    samples_path: &Path,
    entries: &[fs::DirEntry],
) -> Result<()> {
    let mut index_content = String::from(
        r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Autumnus Samples</title>
    <style>
        body { font-family: system, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { margin-bottom: 30px; }
        .theme-section { margin-bottom: 40px; }
        h2 { margin-bottom: 20px; }
        .sample-list { list-style: none; padding: 0; }
        .sample-list li { margin-bottom: 10px; }
        a { color: #0366d6; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>Autumnus Samples</h1>
"#,
    );

    for theme_path in theme_paths {
        let theme_name = theme_path
            .file_stem()
            .and_then(|s| s.to_str())
            .expect("failed to extract theme name");

        index_content.push_str(&format!("    <div class=\"theme-section\">\n        <h2>{}</h2>\n        <ul class=\"sample-list\">\n", theme_name));

        for entry in entries {
            let path = entry.path();
            let file_name = path
                .file_name()
                .expect("failed to read sample file name")
                .to_str()
                .unwrap();
            let base_name = file_name.split('.').next().unwrap_or(file_name);
            let html_path = format!("{}.{}.html", base_name, theme_name);

            index_content.push_str(&format!(
                "            <li><a href=\"{}\">{} - {}</a></li>\n",
                html_path, base_name, theme_name
            ));
        }

        index_content.push_str("        </ul>\n    </div>\n");
    }

    index_content.push_str("</body>\n</html>");

    fs::write(samples_path.join("index.html"), index_content)
        .context("failed to write index.html")?;
    println!("Generated: index.html");

    Ok(())
}

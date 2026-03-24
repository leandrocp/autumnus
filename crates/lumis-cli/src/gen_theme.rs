use anyhow::{Context, Result};
use std::fs;
use std::path::Path;
use std::path::PathBuf;
use std::process::Command;
use tempfile::TempDir;

pub fn generate_theme(
    url: &str,
    colorscheme: &str,
    setup: Option<&str>,
    output: Option<&str>,
    appearance: Option<&str>,
) -> Result<()> {
    let temp_dir = TempDir::new().context("Failed to create temporary directory")?;
    let temp_path = temp_dir.path();

    create_init_lua(temp_path)?;
    create_themes_lua(temp_path, url, colorscheme, setup, appearance)?;
    copy_extract_theme_lua(temp_path)?;

    run_nvim_extraction(temp_path, colorscheme)?;

    let json_path = temp_path.join(format!("{}.json", colorscheme));
    let json_content = fs::read_to_string(&json_path)
        .context(format!("Failed to read generated JSON at {:?}", json_path))?;

    if let Some(output_path) = output {
        fs::write(output_path, &json_content)
            .context(format!("Failed to write output to {}", output_path))?;
        eprintln!("Theme saved to {}", output_path);
    } else {
        println!("{}", json_content);
    }

    Ok(())
}

fn create_init_lua(temp_path: &std::path::Path) -> Result<()> {
    let init_content = r#"vim.env.XDG_DATA_HOME = "nvim/data"
vim.opt.termguicolors = true
vim.opt.runtimepath:prepend(vim.fn.stdpath("data") .. "/site")
"#;

    fs::write(temp_path.join("init.lua"), init_content).context("Failed to write init.lua")?;

    Ok(())
}

fn create_themes_lua(
    temp_path: &std::path::Path,
    url: &str,
    colorscheme: &str,
    setup: Option<&str>,
    appearance: Option<&str>,
) -> Result<()> {
    let appearance = appearance.unwrap_or("dark");

    let config_fn = if let Some(setup_code) = setup {
        format!(
            r#"config = function()
			vim.o.background = "{}"
			{}
			vim.cmd([[colorscheme {}]])
		end,"#,
            appearance, setup_code, colorscheme
        )
    } else {
        format!(
            r#"config = function()
			vim.o.background = "{}"
			vim.cmd([[colorscheme {}]])
		end,"#,
            appearance, colorscheme
        )
    };

    let themes_content = format!(
        r#"return {{
	{{
		url = "{}",
		name = "{}",
		{}
	}},
}}
"#,
        url, colorscheme, config_fn
    );

    fs::write(temp_path.join("themes.lua"), themes_content)
        .context("Failed to write themes.lua")?;

    Ok(())
}

fn copy_extract_theme_lua(temp_path: &std::path::Path) -> Result<()> {
    let extract_theme_path = extract_theme_source_path();

    let content = fs::read_to_string(&extract_theme_path)
        .context("Failed to read themes/extract_theme.lua")?;

    fs::write(temp_path.join("extract_theme.lua"), content)
        .context("Failed to write extract_theme.lua to temp directory")?;

    Ok(())
}

fn extract_theme_source_path() -> PathBuf {
    resolve_workspace_or_crate_path(
        Path::new(env!("CARGO_MANIFEST_DIR")),
        "themes/extract_theme.lua",
    )
}

fn resolve_workspace_or_crate_path(manifest_dir: &Path, relative_to_root: &str) -> PathBuf {
    let workspace_path = manifest_dir
        .parent()
        .and_then(|path| path.parent())
        .map(|path| path.join(relative_to_root));

    if let Some(path) = workspace_path.as_ref().filter(|path| path.exists()) {
        return path.clone();
    }

    let crate_local_path = manifest_dir.join(relative_to_root);
    if crate_local_path.exists() {
        return crate_local_path;
    }

    workspace_path.unwrap_or(crate_local_path)
}

fn run_nvim_extraction(temp_path: &std::path::Path, colorscheme: &str) -> Result<()> {
    let output = Command::new("nvim")
        .arg("--clean")
        .arg("--headless")
        .arg("-V3")
        .arg("-u")
        .arg("init.lua")
        .arg("-l")
        .arg("extract_theme.lua")
        .arg(colorscheme)
        .current_dir(temp_path)
        .output()
        .context("Failed to execute nvim")?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);

        anyhow::bail!(
            "Neovim theme extraction failed:\nstdout: {}\nstderr: {}",
            stdout,
            stderr
        );
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resolve_workspace_path_before_crate_local_path() {
        let tmp = tempfile::tempdir().unwrap();
        let workspace_root = tmp.path();
        let manifest_dir = workspace_root.join("crates/lumis-cli");

        fs::create_dir_all(workspace_root.join("themes")).unwrap();
        fs::create_dir_all(manifest_dir.join("themes")).unwrap();
        fs::write(workspace_root.join("themes/extract_theme.lua"), "workspace").unwrap();
        fs::write(manifest_dir.join("themes/extract_theme.lua"), "crate-local").unwrap();

        let resolved = resolve_workspace_or_crate_path(&manifest_dir, "themes/extract_theme.lua");

        assert_eq!(resolved, workspace_root.join("themes/extract_theme.lua"));
    }

    #[test]
    fn resolve_crate_local_path_when_workspace_path_is_missing() {
        let tmp = tempfile::tempdir().unwrap();
        let manifest_dir = tmp.path().join("crates/lumis-cli");

        fs::create_dir_all(manifest_dir.join("themes")).unwrap();
        fs::write(manifest_dir.join("themes/extract_theme.lua"), "crate-local").unwrap();

        let resolved = resolve_workspace_or_crate_path(&manifest_dir, "themes/extract_theme.lua");

        assert_eq!(resolved, manifest_dir.join("themes/extract_theme.lua"));
    }

    #[test]
    fn copy_extract_theme_lua_writes_expected_content() {
        let tmp = tempfile::tempdir().unwrap();

        copy_extract_theme_lua(tmp.path()).unwrap();

        let copied = fs::read_to_string(tmp.path().join("extract_theme.lua")).unwrap();
        let source = fs::read_to_string(extract_theme_source_path()).unwrap();

        assert_eq!(copied, source);
    }
}

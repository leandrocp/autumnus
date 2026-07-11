use anyhow::{Context, Result};
use etcetera::BaseStrategy;
use serde::Deserialize;
use std::fs;
use std::io::ErrorKind;
use std::path::{Path, PathBuf};

#[derive(Debug, Default, Deserialize)]
#[serde(default)]
pub struct Config {
    pub highlight: HighlightConfig,
}

#[derive(Debug, Default, Deserialize)]
#[serde(default)]
pub struct HighlightConfig {
    pub theme: Option<String>,
}

pub fn default_path() -> PathBuf {
    let config_home = std::env::var_os("XDG_CONFIG_HOME")
        .filter(|path| !path.is_empty())
        .map(PathBuf::from);

    if let Some(config_home) = config_home {
        return config_path(Some(config_home), PathBuf::new());
    }

    #[cfg(windows)]
    if let Some(app_data) = std::env::var_os("APPDATA").filter(|path| !path.is_empty()) {
        return config_path(Some(PathBuf::from(app_data)), PathBuf::new());
    }

    let home = etcetera::choose_base_strategy()
        .expect("failed to determine home directory")
        .home_dir()
        .to_path_buf();
    config_path(config_home, home)
}

fn config_path(config_home: Option<PathBuf>, home: PathBuf) -> PathBuf {
    config_home
        .unwrap_or_else(|| home.join(".config"))
        .join("lumis")
        .join("config.toml")
}

impl Config {
    pub fn load(path: &Path) -> Result<Self> {
        let contents = match fs::read_to_string(path) {
            Ok(contents) => contents,
            Err(error) if error.kind() == ErrorKind::NotFound => return Ok(Self::default()),
            Err(error) => {
                return Err(error)
                    .with_context(|| format!("failed to read config file {}", path.display()));
            }
        };

        toml::from_str(&contents)
            .with_context(|| format!("failed to parse config file {}", path.display()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn config_path_prefers_xdg_config_home() {
        assert_eq!(
            config_path(Some(PathBuf::from("/xdg")), PathBuf::from("/home/user")),
            PathBuf::from("/xdg/lumis/config.toml")
        );
    }

    #[test]
    fn config_path_falls_back_to_dot_config() {
        assert_eq!(
            config_path(None, PathBuf::from("/home/user")),
            PathBuf::from("/home/user/.config/lumis/config.toml")
        );
    }
}

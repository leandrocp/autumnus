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

/// `etcetera` resolves `XDG_CONFIG_HOME` on Unix and `%APPDATA%` on Windows, the
/// same base strategy [`lumis_wasm_runtime::store::default_data_dir`] uses.
pub fn default_path() -> PathBuf {
    etcetera::choose_base_strategy()
        .expect("failed to determine home directory")
        .config_dir()
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

    /// `etcetera` owns the base directory; what is ours is choosing the config
    /// one over the data one and naming the file under it.
    #[test]
    fn default_path_is_lumis_config_toml_under_the_config_dir() {
        let strategy =
            etcetera::choose_base_strategy().expect("failed to determine home directory");

        assert_eq!(
            default_path(),
            strategy.config_dir().join("lumis").join("config.toml")
        );
        assert_ne!(
            default_path(),
            strategy.data_dir().join("lumis").join("config.toml")
        );
    }
}

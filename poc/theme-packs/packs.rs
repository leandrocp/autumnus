use super::{from_file, Theme, ThemeError};
use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::{LazyLock, OnceLock};

struct Catalog {
    dirs: Vec<PathBuf>,
    themes: BTreeMap<String, Theme>,
}

static CATALOG: OnceLock<Catalog> = OnceLock::new();

#[doc(hidden)]
pub static ALL_THEMES: LazyLock<Vec<&'static Theme>> =
    LazyLock::new(|| available_themes().collect());

#[doc(hidden)]
pub fn configure_theme_dirs(mut dirs: Vec<PathBuf>) -> Result<(), String> {
    dirs.sort();
    dirs.dedup();
    if let Some(catalog) = CATALOG.get() {
        return if catalog.dirs == dirs {
            Ok(())
        } else {
            Err("theme packs are already configured; restart to change dependencies".into())
        };
    }
    let mut themes = BTreeMap::new();
    for dir in &dirs {
        load_dir(dir, &mut themes)?;
    }
    CATALOG
        .set(Catalog { dirs, themes })
        .map_err(|_| "theme packs were configured concurrently".into())
}

fn load_dir(dir: &Path, themes: &mut BTreeMap<String, Theme>) -> Result<(), String> {
    let entries = fs::read_dir(dir).map_err(|error| format!("{}: {error}", dir.display()))?;
    for entry in entries {
        let path = entry.map_err(|error| error.to_string())?.path();
        if path
            .extension()
            .is_some_and(|extension| extension == "json")
        {
            let theme = from_file(&path).map_err(|error| format!("{}: {error}", path.display()))?;
            let name = theme.name.clone();
            if themes.insert(name.clone(), theme).is_some() {
                return Err(format!("duplicate theme '{name}' in installed packs"));
            }
        }
    }
    Ok(())
}

pub fn get(name: &str) -> Result<Theme, ThemeError> {
    CATALOG
        .get()
        .and_then(|catalog| catalog.themes.get(name))
        .cloned()
        .ok_or_else(|| ThemeError::NotFound(name.to_owned()))
}

pub fn available_themes() -> impl Iterator<Item = &'static Theme> {
    CATALOG
        .get()
        .into_iter()
        .flat_map(|catalog| catalog.themes.values())
}

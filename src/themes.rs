#![allow(unused_must_use)]

use serde::{Deserialize, Serialize};
use std::{collections::BTreeMap, fs, path::Path};

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
/// A theme for syntax highlighting.
///
/// A theme consists of a name, appearance (light/dark), and a collection of highlight styles
/// mapped to their scope names.
///
/// # Examples
///
/// Creating a theme programmatically:
///
/// ```
/// use autumnus::themes::{Theme, Style};
/// use std::collections::BTreeMap;
///
/// let mut highlights = BTreeMap::new();
/// highlights.insert("keyword".to_string(), Style {
///     fg: Some("#ff79c6".to_string()),
///     bold: true,
///     ..Default::default()
/// });
///
/// let theme = Theme::new(
///     "my_theme".to_string(),
///     "dark".to_string(),
///     highlights
/// );
/// ```
///
/// Loading a theme from a JSON file:
///
/// ```
/// use autumnus::themes;
/// use std::path::Path;
///
/// let theme = themes::from_file(Path::new("themes/dracula.json")).unwrap();
/// ```
pub struct Theme {
    /// The name of the theme.
    pub name: String,
    /// The appearance of the theme ("light" or "dark").
    pub appearance: String,
    /// A map of highlight scope names to their styles.
    pub highlights: BTreeMap<String, Style>,
}

#[derive(Debug, Default, Clone, PartialEq, Serialize, Deserialize)]
/// A style for syntax highlighting.
///
/// A style defines the visual appearance of a highlight scope, including colors,
/// font weight, and text decoration.
///
/// # Examples
///
/// Creating a style with foreground color and bold text:
///
/// ```
/// use autumnus::themes::Style;
///
/// let style = Style {
///     fg: Some("#ff79c6".to_string()),
///     bold: true,
///     ..Default::default()
/// };
/// ```
///
/// Creating a style with background color and italic text:
///
/// ```
/// use autumnus::themes::Style;
///
/// let style = Style {
///     bg: Some("#282a36".to_string()),
///     italic: true,
///     ..Default::default()
/// };
/// ```
///
/// Creating a style with text decoration:
///
/// ```
/// use autumnus::themes::Style;
///
/// let style = Style {
///     underline: true,
///     strikethrough: true,
///     ..Default::default()
/// };
/// ```
pub struct Style {
    /// The foreground color in hex format (e.g., "#ff79c6").
    #[serde(default)]
    pub fg: Option<String>,
    /// The background color in hex format (e.g., "#282a36").
    #[serde(default)]
    pub bg: Option<String>,
    /// Whether to underline the text.
    #[serde(default)]
    pub underline: bool,
    /// Whether to make the text bold.
    #[serde(default)]
    pub bold: bool,
    /// Whether to make the text italic.
    #[serde(default)]
    pub italic: bool,
    /// Whether to strikethrough the text.
    #[serde(default)]
    pub strikethrough: bool,
}

include!(concat!(env!("OUT_DIR"), "/theme_data.rs"));

/// Creates a `Theme` from a JSON file.
///
/// # Examples
///
/// ```
/// use autumnus::themes;
/// use std::path::Path;
///
/// let path = Path::new("catppuccin_frappe.json");
/// let theme = themes::from_file(path);
/// ```
pub fn from_file<P: AsRef<Path>>(path: P) -> Result<Theme, Box<dyn std::error::Error>> {
    let json = fs::read_to_string(path)?;
    Ok(serde_json::from_str(&json)?)
}

/// Creates a `Theme` from a JSON string.
///
/// # Examples
///
/// ```
/// use autumnus::themes;
///
/// let json = r#"{"name": "My Theme", "appearance": "dark", "highlights": {"keyword": {"fg": "blue"}}}"#;
/// let theme = themes::from_json(json).unwrap();
///
/// assert_eq!(theme.name, "My Theme");
/// ```
pub fn from_json(json: &str) -> Result<Theme, Box<dyn std::error::Error>> {
    Ok(serde_json::from_str(json)?)
}

impl Theme {
    pub fn new(name: String, appearance: String, highlights: BTreeMap<String, Style>) -> Self {
        Theme {
            name,
            appearance,
            highlights,
        }
    }

    pub fn css(&self, enable_italic: bool) -> String {
        let mut rules = Vec::new();

        rules.push("pre.athl".to_string());

        if let Some(pre_style) = &self.pre_style("\n  ") {
            rules.push(format!(" {{\n  {}\n}}\n", pre_style));
            // write!(css, "pre.athl {{ {} }}\n", pre_style);
        } else {
            rules.push(" {}\n".to_string());
        }

        for (scope, style) in &self.highlights {
            let style_css = style.css(enable_italic, "\n  ");

            if !style_css.is_empty() {
                rules.push(format!(".athl-{} {{\n  {}\n}}\n", scope, style_css))
            };
        }

        rules.join("")
    }

    pub fn get_style(&self, scope: &str) -> Option<&Style> {
        match self.highlights.get(scope) {
            Some(syntax) => Some(syntax),
            None => {
                // try to match ancestor
                if scope.contains('.') {
                    let split: Vec<&str> = scope.split('.').collect();
                    let joined = split[0..split.len() - 1].join(".");
                    self.get_style(joined.as_str())
                } else {
                    None
                }
            }
        }
    }

    pub fn fg(&self) -> Option<String> {
        if let Some(style) = self.get_style("normal") {
            style.fg.clone()
        } else {
            None
        }
    }

    pub fn bg(&self) -> Option<String> {
        if let Some(style) = self.get_style("normal") {
            style.bg.clone()
        } else {
            None
        }
    }

    pub fn pre_style(&self, separator: &str) -> Option<String> {
        let mut rules = Vec::new();

        if let Some(fg) = &self.fg() {
            rules.push(format!("color: {};", fg));
        }

        if let Some(bg) = &self.bg() {
            rules.push(format!("background-color: {};", bg));
        }

        if rules.is_empty() {
            None
        } else {
            Some(rules.join(separator))
        }
    }
}

impl Style {
    pub fn css(&self, enable_italic: bool, separator: &str) -> String {
        let mut rules = Vec::new();

        if let Some(fg) = &self.fg {
            rules.push(format!("color: {};", fg))
        };

        if let Some(bg) = &self.bg {
            rules.push(format!("background-color: {};", bg))
        };

        if self.bold {
            rules.push("font-weight: bold;".to_string())
        }

        if enable_italic && self.italic {
            rules.push("font-style: italic;".to_string())
        };

        match (self.underline, self.strikethrough) {
            (true, true) => rules.push("text-decoration: underline line-through;".to_string()),
            (true, false) => rules.push("text-decoration: underline;".to_string()),
            (false, true) => rules.push("text-decoration: line-through;".to_string()),
            (false, false) => (),
        };

        rules.join(separator)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    #[test]
    fn test_load_all_themes() {
        for theme in ALL_THEMES.iter() {
            assert!(!theme.name.is_empty());
        }

        assert_eq!(ALL_THEMES.len(), 104);
    }

    #[test]
    fn test_get_by_name() {
        let theme = get("github_light");
        assert_eq!(theme.unwrap().name, "github_light")
    }

    #[test]
    fn test_from_json() {
        let json =
            r#"{"name": "test", "appearance": "dark", "highlights": {"keyword": {"fg": "blue"}}}"#;
        let theme = from_json(json).unwrap();

        assert_eq!(theme.name, "test");

        assert_eq!(
            theme.get_style("keyword"),
            Some(&Style {
                fg: Some("blue".to_string()),
                ..Default::default()
            })
        );
    }

    #[test]
    fn test_from_file() {
        let path = Path::new("themes/catppuccin_frappe.json");
        let theme = from_file(path).unwrap();

        assert_eq!(theme.name, "catppuccin_frappe");

        assert_eq!(
            theme.get_style("tag.attribute"),
            Some(&Style {
                fg: Some("#81c8be".to_string()),
                italic: true,
                ..Default::default()
            })
        );
    }

    #[test]
    fn test_style_css() {
        let style = Style {
            fg: Some("blue".to_string()),
            underline: true,
            italic: true,
            ..Default::default()
        };

        assert_eq!(
            style.css(true, " "),
            "color: blue; font-style: italic; text-decoration: underline;"
        );
    }

    #[test]
    fn test_theme_css() {
        let json = r#"{"name": "test", "appearance": "dark", "highlights": {"normal": {"fg": "red", "bg": "green"}, "keyword": {"fg": "blue", "italic": true}, "tag.attribute": {"bg": "gray", "bold": true}}}"#;
        let theme = from_json(json).unwrap();

        let expected = r#"pre.athl {
  color: red;
  background-color: green;
}
.athl-keyword {
  color: blue;
  font-style: italic;
}
.athl-normal {
  color: red;
  background-color: green;
}
.athl-tag.attribute {
  background-color: gray;
  font-weight: bold;
}
"#;

        assert_eq!(theme.css(true), expected);
    }
}

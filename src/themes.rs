#![allow(unused_must_use)]

use serde::{Deserialize, Serialize};
use std::{collections::BTreeMap, fs, path::Path};

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct Theme {
    pub name: String,
    pub highlights: BTreeMap<String, Style>,
}

#[derive(Debug, Default, Clone, PartialEq, Serialize, Deserialize)]
pub struct Style {
    #[serde(default)]
    pub fg: Option<String>,
    #[serde(default)]
    pub bg: Option<String>,
    #[serde(default)]
    pub underline: bool,
    #[serde(default)]
    pub bold: bool,
    #[serde(default)]
    pub italic: bool,
    #[serde(default)]
    pub strikethrough: bool,
}

mod generated {
    use super::Theme;
    include!(concat!(env!("OUT_DIR"), "/theme_data.rs"));
}

pub use generated::*;

pub fn get(name: &str) -> Option<&'static Theme> {
    ALL_THEMES.iter().find(|theme| theme.name == name).copied()
}

pub fn from_file<P: AsRef<Path>>(path: P) -> Result<Theme, Box<dyn std::error::Error>> {
    let json = fs::read_to_string(path)?;
    Ok(serde_json::from_str(&json)?)
}

pub fn from_json(json: &str) -> Result<Theme, Box<dyn std::error::Error>> {
    Ok(serde_json::from_str(json)?)
}

impl Theme {
    pub fn new(name: String, highlights: BTreeMap<String, Style>) -> Self {
        Theme { name, highlights }
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
    }

    #[test]
    fn test_get_by_name() {
        let theme = get("github_light");
        assert_eq!(theme.unwrap().name, "github_light")
    }

    #[test]
    fn test_from_json() {
        let json = r#"{"highlights": {"keyword": {"fg": "blue"}}, "name": "test"}"#;
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
        let json = r#"{"highlights": {"normal": {"fg": "red", "bg": "green"}, "keyword": {"fg": "blue", "italic": true}, "tag.attribute": {"bg": "gray", "bold": true}}, "name": "test"}"#;
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

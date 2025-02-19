use serde::{Deserialize, Serialize};
use std::{collections::BTreeMap, fs, path::Path};

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct Theme {
    pub name: String,
    pub highlights: BTreeMap<String, Style>,
}

#[derive(Debug, Default, PartialEq, Serialize, Deserialize)]
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

impl Theme {
    pub fn new(name: String, highlights: BTreeMap<String, Style>) -> Self {
        Theme { name, highlights }
    }

    pub fn from_file<P: AsRef<Path>>(path: P) -> Result<Self, Box<dyn std::error::Error>> {
        let json = fs::read_to_string(path)?;
        Ok(serde_json::from_str(&json)?)
    }

    pub fn from_json(json: &str) -> Result<Self, Box<dyn std::error::Error>> {
        Ok(serde_json::from_str(json)?)
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

    pub fn pre_style(&self) -> String {
        let mut css = String::new();

        if let Some(fg) = self.fg() {
            css.push_str(&format!("color: {};", fg));
        }

        if let Some(bg) = self.bg() {
            css.push_str(&format!("background-color: {};", bg));
        }

        css
    }
}

impl Style {
    pub fn css(&self, enable_italic: bool) -> String {
        let fg = self
            .fg
            .as_ref()
            .map(|fg| format!("color: {};", fg))
            .unwrap_or_default();

        let bg = self
            .bg
            .as_ref()
            .map(|bg| format!("background-color: {};", bg))
            .unwrap_or_default();

        let text_decoration = match (self.underline, self.strikethrough) {
            (true, true) => "text-decoration: underline line-through;",
            (true, false) => "text-decoration: underline;",
            (false, true) => "text-decoration: line-through;",
            (false, false) => "",
        };

        let bold = if self.bold { "font-weight: bold;" } else { "" };

        let italic = if enable_italic && self.italic  {
            "font-style: italic;"
        } else {
            ""
        };

        format!("{}{}{}{}{}", fg, bg, text_decoration, bold, italic)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    #[test]
    fn test_from_json() {
        let json = r#"{"highlights": {"keyword": {"fg": "blue"}}, "name": "test"}"#;
        let theme = Theme::from_json(json).unwrap();

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
        let theme = Theme::from_file(path).unwrap();

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
}

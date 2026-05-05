//! Rainbow bracket [`StyleOverride`] implementation.
//!
//! Colors nested bracket pairs with a cycling palette so that matching
//! delimiters are visually distinct at a glance.
//!
//! # Example
//!
//! ```rust
//! use lumis_core::formatter::StyleOverride;
//! use lumis_core::formatter::RainbowBrackets;
//!
//! let colors = vec!["#e06c75".into(), "#61afef".into(), "#98c379".into()];
//! let rb = RainbowBrackets::new(colors);
//! ```

use crate::themes::{Style, Theme};
use std::sync::Arc;

use super::StyleOverride;

const CLOSE_BRACKETS: &[char] = &['}', ']', ')', '>'];
const FALLBACK_COLORS: &[&str] = &[
    "#e06c75", "#e5c07b", "#61afef", "#d19a66", "#98c379", "#c678dd", "#56b6c2",
];
const THEME_COLOR_SCOPES: &[&str] = &[
    "rainbow.delimiter.red",
    "rainbow.delimiter.yellow",
    "rainbow.delimiter.blue",
    "rainbow.delimiter.orange",
    "rainbow.delimiter.green",
    "rainbow.delimiter.violet",
    "rainbow.delimiter.cyan",
];

/// A [`StyleOverride`] that colors bracket characters with a cycling
/// palette based on nesting depth.
#[derive(Clone, Debug)]
pub struct RainbowBrackets {
    colors: Vec<String>,
}

impl RainbowBrackets {
    /// Create a new override with the given color palette.
    ///
    /// Colors cycle by nesting depth: depth 0 gets `colors[0]`,
    /// depth 1 gets `colors[1]`, and so on, wrapping around.
    ///
    /// # Panics
    ///
    /// Panics if `colors` is empty.
    pub fn new(colors: Vec<String>) -> Self {
        assert!(
            !colors.is_empty(),
            "RainbowBrackets requires at least one color"
        );
        Self { colors }
    }

    /// Create an override from the standard `RainbowDelimiter*` theme groups.
    ///
    /// Missing theme colors fall back to a built-in palette using the standard
    /// red, yellow, blue, orange, green, violet, cyan order.
    pub fn from_theme(theme: Option<&Theme>) -> Self {
        let colors = THEME_COLOR_SCOPES
            .iter()
            .zip(FALLBACK_COLORS)
            .map(|(scope, fallback)| {
                theme
                    .and_then(|theme| theme.get_style(scope))
                    .and_then(|style| style.fg.clone())
                    .unwrap_or_else(|| (*fallback).to_string())
            })
            .collect();

        Self { colors }
    }

    /// Convenience constructor that wraps in `Arc<dyn StyleOverride>`.
    pub fn into_override(self) -> Arc<dyn StyleOverride> {
        Arc::new(self)
    }
}

impl StyleOverride for RainbowBrackets {
    fn override_style(&self, text: &str, scope: &str, base: &Style, state: &mut usize) -> Style {
        if !scope.starts_with("punctuation.bracket") {
            return base.clone();
        }

        let color_idx = if text.starts_with(|c: char| CLOSE_BRACKETS.contains(&c)) {
            *state = state.saturating_sub(1);
            *state % self.colors.len()
        } else {
            let idx = *state % self.colors.len();
            *state = state.saturating_add(1);
            idx
        };

        Style {
            fg: Some(self.colors[color_idx].clone()),
            ..base.clone()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::themes::Appearance;
    use std::collections::BTreeMap;

    #[test]
    fn from_theme_uses_standard_rainbow_delimiter_groups() {
        let mut highlights = BTreeMap::new();
        highlights.insert(
            "rainbow.delimiter.red".to_string(),
            Style {
                fg: Some("#ff0000".to_string()),
                ..Style::default()
            },
        );
        highlights.insert(
            "rainbow.delimiter.yellow".to_string(),
            Style {
                fg: Some("#ffff00".to_string()),
                ..Style::default()
            },
        );

        let theme = Theme {
            name: "test".to_string(),
            appearance: Appearance::Dark,
            revision: "test".to_string(),
            highlights,
        };
        let rainbow = RainbowBrackets::from_theme(Some(&theme));

        assert_eq!(rainbow.colors[0], "#ff0000");
        assert_eq!(rainbow.colors[1], "#ffff00");
        assert_eq!(rainbow.colors[2], "#61afef");
    }

    #[test]
    fn from_theme_uses_full_fallback_palette_without_theme() {
        let rainbow = RainbowBrackets::from_theme(None);

        assert_eq!(rainbow.colors, FALLBACK_COLORS);
    }
}

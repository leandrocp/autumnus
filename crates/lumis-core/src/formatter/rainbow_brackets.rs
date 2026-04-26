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

use crate::themes::Style;
use std::sync::Arc;

use super::StyleOverride;

const CLOSE_BRACKETS: &[char] = &['}', ']', ')', '>'];

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

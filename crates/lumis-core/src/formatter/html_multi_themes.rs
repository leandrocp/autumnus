//! HTML formatter with multiple theme support using CSS variables.
//!
//! Works with pre-computed highlight events from any source.

use super::{Formatter, HtmlElement};
use crate::events::HighlightEvent;
use crate::formatter::html_inline::HighlightLines;
use crate::languages::Language;
use crate::themes::Theme;
use derive_builder::Builder;
use std::collections::HashMap;
use std::io::{self, Write};
use std::str::FromStr;

/// Configuration for which theme to use as the default (inline styles).
#[derive(Clone, Debug)]
pub enum DefaultTheme {
    /// Use a specific named theme as the default (e.g., "light", "dark")
    Theme(String),
    /// Use CSS `light-dark()` function (requires light and dark themes)
    LightDark,
}

impl FromStr for DefaultTheme {
    type Err = std::convert::Infallible;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(match s {
            "light-dark()" => DefaultTheme::LightDark,
            theme_name => DefaultTheme::Theme(theme_name.to_string()),
        })
    }
}

/// HTML formatter with multiple theme support.
#[derive(Builder, Clone, Debug)]
#[builder(default, build_fn(skip))]
pub struct HtmlMultiThemes {
    lang: Language,
    themes: HashMap<String, Theme>,
    #[builder(setter(custom))]
    default_theme: Option<DefaultTheme>,
    #[builder(setter(into))]
    css_variable_prefix: String,
    pre_class: Option<String>,
    italic: bool,
    include_highlights: bool,
    highlight_lines: Option<HighlightLines>,
    header: Option<HtmlElement>,
}

impl HtmlMultiThemesBuilder {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn default_theme<T: Into<DefaultThemeArg>>(&mut self, value: T) -> &mut Self {
        self.default_theme = Some(value.into().into_enum());
        self
    }

    pub fn build(&mut self) -> Result<HtmlMultiThemes, String> {
        let result = HtmlMultiThemes {
            lang: self.lang.take().unwrap_or(Language::PlainText),
            themes: self.themes.take().unwrap_or_default(),
            default_theme: self.default_theme.take().flatten(),
            css_variable_prefix: self
                .css_variable_prefix
                .take()
                .unwrap_or_else(|| "--lumis".to_string()),
            pre_class: self.pre_class.take().flatten(),
            italic: self.italic.take().unwrap_or(false),
            include_highlights: self.include_highlights.take().unwrap_or(false),
            highlight_lines: self.highlight_lines.take().flatten(),
            header: self.header.take().flatten(),
        };

        if result.themes.is_empty() {
            return Err("At least one theme is required".to_string());
        }

        match &result.default_theme {
            Some(DefaultTheme::Theme(name)) if !result.themes.contains_key(name) => {
                return Err(format!("Default theme '{}' not found in themes map", name));
            }
            Some(DefaultTheme::LightDark)
                if !result.themes.contains_key("light") || !result.themes.contains_key("dark") =>
            {
                return Err("LightDark mode requires themes named 'light' and 'dark'".to_string());
            }
            _ => {}
        }

        Ok(result)
    }
}

/// Argument type for the `default_theme` builder method.
#[doc(hidden)]
pub enum DefaultThemeArg {
    String(String),
    Bool(bool),
}

impl DefaultThemeArg {
    fn into_enum(self) -> Option<DefaultTheme> {
        match self {
            DefaultThemeArg::String(s) => Some(s.parse().unwrap()),
            DefaultThemeArg::Bool(false) => None,
            DefaultThemeArg::Bool(true) => Some(DefaultTheme::Theme("light".to_string())),
        }
    }
}

impl From<&str> for DefaultThemeArg {
    fn from(s: &str) -> Self {
        DefaultThemeArg::String(s.to_string())
    }
}

impl From<String> for DefaultThemeArg {
    fn from(s: String) -> Self {
        DefaultThemeArg::String(s)
    }
}

impl From<bool> for DefaultThemeArg {
    fn from(b: bool) -> Self {
        DefaultThemeArg::Bool(b)
    }
}

impl Default for HtmlMultiThemes {
    fn default() -> Self {
        Self {
            lang: Language::PlainText,
            themes: HashMap::new(),
            default_theme: None,
            css_variable_prefix: "--lumis".to_string(),
            pre_class: None,
            italic: false,
            include_highlights: false,
            highlight_lines: None,
            header: None,
        }
    }
}

impl HtmlMultiThemes {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        lang: Language,
        themes: HashMap<String, Theme>,
        default_theme: Option<DefaultTheme>,
        css_variable_prefix: String,
        pre_class: Option<String>,
        italic: bool,
        include_highlights: bool,
        highlight_lines: Option<HighlightLines>,
        header: Option<HtmlElement>,
    ) -> Self {
        Self {
            lang,
            themes,
            default_theme,
            css_variable_prefix,
            pre_class,
            italic,
            include_highlights,
            highlight_lines,
            header,
        }
    }

    fn generate_pre_classes(&self) -> String {
        let mut classes = vec!["lumis".to_string(), "lumis-themes".to_string()];

        if let Some(ref pre_class) = self.pre_class {
            classes.push(pre_class.clone());
        }

        for theme_name in self.themes.keys() {
            classes.push(theme_name.clone());
        }

        classes.join(" ")
    }

    fn generate_pre_style(&self) -> io::Result<String> {
        let mut styles = Vec::new();

        match &self.default_theme {
            Some(DefaultTheme::Theme(default_name)) => {
                if let Some(default_theme) = self.themes.get(default_name) {
                    if let Some(fg) = default_theme.fg() {
                        styles.push(format!("color:{};", fg));
                    }
                    if let Some(bg) = default_theme.bg() {
                        styles.push(format!("background-color:{};", bg));
                    }
                }

                for (theme_name, theme) in &self.themes {
                    if theme_name != default_name {
                        let sanitized = crate::formatter::html::sanitize_theme_name(theme_name);
                        if let Some(fg) = theme.fg() {
                            styles.push(format!(
                                "{}-{}:{};",
                                self.css_variable_prefix, sanitized, fg
                            ));
                        }
                        if let Some(bg) = theme.bg() {
                            styles.push(format!(
                                "{}-{}-bg:{};",
                                self.css_variable_prefix, sanitized, bg
                            ));
                        }
                    }
                }
            }
            Some(DefaultTheme::LightDark) => {
                if let (Some(light), Some(dark)) =
                    (self.themes.get("light"), self.themes.get("dark"))
                {
                    let light_fg = light.fg().unwrap_or("#000000");
                    let light_bg = light.bg().unwrap_or("#ffffff");
                    let dark_fg = dark.fg().unwrap_or("#ffffff");
                    let dark_bg = dark.bg().unwrap_or("#000000");

                    styles.push(format!("color: light-dark({}, {});", light_fg, dark_fg));
                    styles.push(format!(
                        "background-color: light-dark({}, {});",
                        light_bg, dark_bg
                    ));
                }
            }
            None => {
                for (theme_name, theme) in &self.themes {
                    let sanitized = crate::formatter::html::sanitize_theme_name(theme_name);
                    if let Some(fg) = theme.fg() {
                        styles.push(format!(
                            "{}-{}: {};",
                            self.css_variable_prefix, sanitized, fg
                        ));
                    }
                    if let Some(bg) = theme.bg() {
                        styles.push(format!(
                            "{}-{}-bg: {};",
                            self.css_variable_prefix, sanitized, bg
                        ));
                    }
                }
            }
        }

        Ok(styles.join(" "))
    }

    fn open_pre_tag(&self, output: &mut dyn Write) -> io::Result<()> {
        let classes = self.generate_pre_classes();
        let style = self.generate_pre_style()?;

        write!(output, "<pre class=\"{}\"", classes)?;
        if !style.is_empty() {
            write!(output, " style=\"{}\"", style)?;
        }
        write!(output, ">")
    }

    fn get_line_attrs(&self, line_number: usize) -> (Option<String>, Option<String>) {
        let is_highlighted = self
            .highlight_lines
            .as_ref()
            .is_some_and(|hl| hl.lines.iter().any(|r| r.contains(&line_number)));

        if !is_highlighted {
            return (None, None);
        }

        let class_suffix = self
            .highlight_lines
            .as_ref()
            .and_then(|hl| hl.class.as_ref())
            .map(|c| format!(" {}", c));

        let style = self.get_highlight_style();

        (class_suffix, style)
    }

    fn get_highlight_style(&self) -> Option<String> {
        use crate::formatter::html_inline::HighlightLinesStyle;

        let highlight_lines = self.highlight_lines.as_ref()?;

        match &highlight_lines.style {
            Some(HighlightLinesStyle::Theme) => {
                if let Some(DefaultTheme::Theme(default_name)) = &self.default_theme {
                    let theme = self.themes.get(default_name)?;
                    let highlighted_style = theme.get_style("highlighted")?;
                    Some(highlighted_style.css(self.italic, " "))
                } else {
                    None
                }
            }
            Some(HighlightLinesStyle::Style(style_string)) => Some(style_string.clone()),
            None => None,
        }
    }

    fn span_attrs_from_index(&self, scope_index: usize, language: &str) -> String {
        let scope = crate::highlights::HIGHLIGHT_NAMES
            .get(scope_index)
            .copied()
            .unwrap_or("");
        let lang = language.parse::<Language>().ok();
        let default_theme_str = match &self.default_theme {
            Some(DefaultTheme::Theme(name)) => Some(name.as_str()),
            Some(DefaultTheme::LightDark) => Some("light-dark()"),
            None => None,
        };
        crate::formatter::html::span_multi_themes_attrs(
            scope,
            lang,
            &self.themes,
            default_theme_str,
            &self.css_variable_prefix,
            self.italic,
            self.include_highlights,
        )
    }
}

impl Formatter for HtmlMultiThemes {
    fn render(
        &self,
        source: &str,
        events: &[HighlightEvent],
        output: &mut dyn Write,
    ) -> io::Result<()> {
        let mut buffer = Vec::new();

        if let Some(ref header) = self.header {
            write!(buffer, "{}", header.open_tag)?;
        }

        self.open_pre_tag(&mut buffer)?;
        crate::formatter::html::open_code_tag(&mut buffer, &self.lang)?;

        let lines = crate::formatter::html::render_lines_from_events(
            source,
            events,
            |scope_index, language| self.span_attrs_from_index(scope_index, language),
        );

        for (i, line) in lines.iter().enumerate() {
            let line_number = i + 1;
            let line_with_newline = format!("{line}\n");
            let (class_suffix, style) = self.get_line_attrs(line_number);
            let wrapped = crate::formatter::html::wrap_line(
                line_number,
                &line_with_newline,
                class_suffix.as_deref(),
                style.as_deref(),
            );
            write!(&mut buffer, "{}", wrapped)?;
        }

        crate::formatter::html::closing_tags(&mut buffer)?;

        if let Some(ref header) = self.header {
            write!(buffer, "{}", header.close_tag)?;
        }

        output.write_all(&buffer)?;
        Ok(())
    }
}

use std::collections::HashMap;

use lumis_core::events::HighlightEvent;
use lumis_core::formatter::html;
use lumis_core::languages::Language;
use lumis_wasm_runtime::RuntimeError;
use rustler::{Encoder, Resource, ResourceArc, Term};

use crate::elixir::{
    ExAppearance, ExFormatterOption, ExHtmlInlineHighlightLines, ExHtmlInlineHighlightLinesStyle,
    ExHtmlLinkedHighlightLines, ExLineSpec, ThemeOrString,
};

pub struct MdexBridge;

#[rustler::resource_impl(name = "lumis_mdex_bridge_v1")]
impl Resource for MdexBridge {
    const IMPLEMENTS_DYNCALL: bool = true;

    unsafe fn dyncall<'a>(&'a self, env: rustler::Env<'a>, call_data: *mut rustler::sys::c_void) {
        let call_term = &mut *call_data.cast::<usize>();
        let request = Term::new(env, *call_term);

        *call_term = match request.decode::<MdexRequest>() {
            Ok((source, language, formatter, attributes, render_unsafe)) => {
                match render_code_fence(
                    &source,
                    language.as_deref(),
                    formatter,
                    &attributes,
                    render_unsafe,
                ) {
                    Ok(output) => (crate::ok(), output).encode(env).as_c_arg(),
                    Err(reason) => (crate::error(), reason).encode(env).as_c_arg(),
                }
            }
            Err(_) => (crate::error(), "invalid MDEx bridge request")
                .encode(env)
                .as_c_arg(),
        };
    }
}

type MdexRequest = (
    String,
    Option<String>,
    Option<ExFormatterOption>,
    HashMap<String, String>,
    bool,
);

#[rustler::nif]
pub fn mdex_bridge() -> ResourceArc<MdexBridge> {
    ResourceArc::new(MdexBridge)
}

fn render_code_fence(
    source: &str,
    language: Option<&str>,
    formatter: Option<ExFormatterOption>,
    attributes: &HashMap<String, String>,
    render_unsafe: bool,
) -> Result<String, String> {
    // Comrak includes the code-fence terminator's newline in the literal. Its
    // adapter contract historically did not turn that into another visual line.
    let source = source.strip_suffix('\n').unwrap_or(source);
    let language = Language::guess(language, source);
    let formatter = formatter
        .unwrap_or_default()
        .with_mdex_attributes(attributes, render_unsafe);
    let (formatter, rainbow_brackets) = formatter.into_formatter(language)?;

    let events = if language == Language::PlainText {
        vec![HighlightEvent::Source {
            start: 0,
            end: source.len(),
        }]
    } else {
        let executor = crate::executor().map_err(|reason| format!("{reason:#}"))?;
        match executor.highlight(source, language.id_name(), rainbow_brackets) {
            Ok(events) => flatten_events(source, events),
            Err(RuntimeError::LanguageNotLoaded(language)) => {
                return Err(format!("language {language} is not loaded"));
            }
            Err(runtime_error) => return Err(runtime_error.to_string()),
        }
    };

    let mut output = Vec::new();
    formatter
        .render(source, &events, &mut output)
        .map_err(|error| error.to_string())?;
    let output = String::from_utf8(output).map_err(|error| error.to_string())?;

    output
        .strip_suffix("</code></pre>")
        .map(str::to_owned)
        .ok_or_else(|| "Lumis formatter did not produce HTML code-fence output".to_string())
}

impl ExFormatterOption {
    fn with_mdex_attributes(
        self,
        attributes: &HashMap<String, String>,
        render_unsafe: bool,
    ) -> Self {
        let pre_class = || mdex_attribute(attributes, "pre_class", render_unsafe);

        match self {
            Self::HtmlInline {
                mut theme,
                pre_class: mut formatter_pre_class,
                italic,
                mut include_highlights,
                rainbow_brackets,
                mut highlight_lines,
                header: _,
            } => {
                if theme.is_none() {
                    theme = Some(ThemeOrString::String("onedark".to_string()));
                }
                if let Some(theme_name) = attributes.get("theme") {
                    theme = Some(ThemeOrString::String(theme_name.clone()));
                }
                if let Some(class) = pre_class() {
                    formatter_pre_class = Some(class);
                }
                if attributes.contains_key("include_highlights") {
                    include_highlights = true;
                }
                if let Some(lines) =
                    inline_highlight_lines(attributes, Some(line_background(&theme)), render_unsafe)
                {
                    highlight_lines = Some(lines);
                }

                Self::HtmlInline {
                    theme,
                    pre_class: formatter_pre_class,
                    italic,
                    include_highlights,
                    rainbow_brackets,
                    highlight_lines,
                    // Comrak owns the closing tags, so an outer header cannot be
                    // closed by its syntax-highlighter adapter contract.
                    header: None,
                }
            }
            Self::HtmlLinked {
                pre_class: mut formatter_pre_class,
                rainbow_brackets,
                mut highlight_lines,
                header: _,
            } => {
                if let Some(class) = pre_class() {
                    formatter_pre_class = Some(class);
                }
                if let Some(lines) = linked_highlight_lines(attributes, render_unsafe) {
                    highlight_lines = Some(lines);
                }

                Self::HtmlLinked {
                    pre_class: formatter_pre_class,
                    rainbow_brackets,
                    highlight_lines,
                    header: None,
                }
            }
            Self::HtmlMultiThemes {
                themes,
                default_theme,
                css_variable_prefix,
                pre_class: mut formatter_pre_class,
                italic,
                mut include_highlights,
                rainbow_brackets,
                mut highlight_lines,
                header: _,
            } => {
                if let Some(class) = pre_class() {
                    formatter_pre_class = Some(class);
                }
                if attributes.contains_key("include_highlights") {
                    include_highlights = true;
                }
                if let Some(lines) = inline_highlight_lines(
                    attributes,
                    Some(line_background_from_name(attributes.get("theme"))),
                    render_unsafe,
                ) {
                    highlight_lines = Some(lines);
                } else if let Some(lines) = highlight_lines.as_mut() {
                    if matches!(lines.style, Some(ExHtmlInlineHighlightLinesStyle::Theme)) {
                        lines.style = Some(ExHtmlInlineHighlightLinesStyle::Style {
                            style: line_background_from_name(attributes.get("theme")),
                        });
                    }
                }

                Self::HtmlMultiThemes {
                    themes,
                    default_theme,
                    css_variable_prefix,
                    pre_class: formatter_pre_class,
                    italic,
                    include_highlights,
                    rainbow_brackets,
                    highlight_lines,
                    header: None,
                }
            }
            Self::Terminal {
                mut theme,
                rainbow_brackets,
                ..
            } => {
                if theme.is_none() {
                    theme = Some(ThemeOrString::String("onedark".to_string()));
                }
                if let Some(theme_name) = attributes.get("theme") {
                    theme = Some(ThemeOrString::String(theme_name.clone()));
                }
                let highlight_lines = inline_highlight_lines(
                    attributes,
                    Some(line_background(&theme)),
                    render_unsafe,
                );

                Self::HtmlInline {
                    theme,
                    pre_class: pre_class(),
                    italic: false,
                    include_highlights: attributes.contains_key("include_highlights"),
                    rainbow_brackets,
                    highlight_lines,
                    header: None,
                }
            }
            Self::BbcodeScoped { rainbow_brackets } => Self::HtmlInline {
                theme: None,
                pre_class: pre_class(),
                italic: false,
                include_highlights: attributes.contains_key("include_highlights"),
                rainbow_brackets,
                highlight_lines: inline_highlight_lines(attributes, None, render_unsafe),
                header: None,
            },
        }
    }
}

fn inline_highlight_lines(
    attributes: &HashMap<String, String>,
    default_style: Option<String>,
    render_unsafe: bool,
) -> Option<ExHtmlInlineHighlightLines> {
    let lines = parse_highlight_lines(attributes.get("highlight_lines")?)?;
    let style = attributes
        .get("highlight_lines_style")
        .map(|style| match style.as_str() {
            "theme" => ExHtmlInlineHighlightLinesStyle::Theme,
            style => ExHtmlInlineHighlightLinesStyle::Style {
                style: escape_mdex_attribute(style, render_unsafe),
            },
        })
        .or_else(|| default_style.map(|style| ExHtmlInlineHighlightLinesStyle::Style { style }));

    Some(ExHtmlInlineHighlightLines {
        lines,
        style,
        class: mdex_attribute(attributes, "highlight_lines_class", render_unsafe),
    })
}

fn mdex_attribute(
    attributes: &HashMap<String, String>,
    name: &str,
    render_unsafe: bool,
) -> Option<String> {
    attributes
        .get(name)
        .map(|value| escape_mdex_attribute(value, render_unsafe))
}

fn escape_mdex_attribute(value: &str, render_unsafe: bool) -> String {
    if render_unsafe {
        value.to_string()
    } else {
        html::escape(value)
    }
}

fn line_background(theme: &Option<ThemeOrString>) -> String {
    let is_light = match theme {
        Some(ThemeOrString::Theme(theme)) => theme.appearance == ExAppearance::Light,
        Some(ThemeOrString::String(name)) => lumis_core::themes::get(name)
            .map(|theme| theme.appearance == lumis_core::themes::Appearance::Light)
            .unwrap_or_else(|_| name.to_lowercase().contains("light")),
        None => false,
    };

    if is_light {
        "background-color: #e7eaf0;".to_string()
    } else {
        "background-color: #3b4252;".to_string()
    }
}

fn line_background_from_name(theme: Option<&String>) -> String {
    let theme = theme.map(|name| ThemeOrString::String(name.clone()));
    line_background(&theme)
}

fn flatten_events(source: &str, events: Vec<HighlightEvent>) -> Vec<HighlightEvent> {
    let mut flattened = Vec::with_capacity(events.len());
    let mut scopes = Vec::new();

    for event in events {
        match event {
            HighlightEvent::Start {
                scope_index,
                language,
            } => scopes.push((scope_index, language)),
            HighlightEvent::End => {
                scopes.pop();
            }
            HighlightEvent::Source { start, end } => {
                let text = source.get(start..end).unwrap_or_default();
                if text.trim().is_empty() || scopes.is_empty() {
                    flattened.push(HighlightEvent::Source { start, end });
                } else if let Some((scope_index, language)) = scopes.last() {
                    flattened.push(HighlightEvent::Start {
                        scope_index: *scope_index,
                        language: language.clone(),
                    });
                    flattened.push(HighlightEvent::Source { start, end });
                    flattened.push(HighlightEvent::End);
                }
            }
        }
    }

    flattened
}

fn linked_highlight_lines(
    attributes: &HashMap<String, String>,
    render_unsafe: bool,
) -> Option<ExHtmlLinkedHighlightLines> {
    Some(ExHtmlLinkedHighlightLines {
        lines: parse_highlight_lines(attributes.get("highlight_lines")?)?,
        class: mdex_attribute(attributes, "highlight_lines_class", render_unsafe)
            .unwrap_or_else(|| "highlighted".to_string()),
    })
}

fn parse_highlight_lines(spec: &str) -> Option<Vec<ExLineSpec>> {
    let mut lines = Vec::new();

    for part in spec
        .split(',')
        .map(str::trim)
        .filter(|part| !part.is_empty())
    {
        if let Some((start, end)) = part.split_once('-') {
            let start = start.trim().parse().ok()?;
            let end = end.trim().parse().ok()?;
            if start == 0 || start > end {
                continue;
            }
            lines.push(ExLineSpec::Range { start, end });
        } else {
            let line = part.parse().ok()?;
            if line > 0 {
                lines.push(ExLineSpec::Single(line));
            }
        }
    }

    Some(lines)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_single_lines_and_ranges() {
        let lines = parse_highlight_lines("1, 3-5, 0, 7-6").unwrap();
        assert_eq!(lines.len(), 2);
        assert!(matches!(lines[0], ExLineSpec::Single(1)));
        assert!(matches!(lines[1], ExLineSpec::Range { start: 3, end: 5 }));
    }

    #[test]
    fn flattens_nested_scopes_to_the_innermost_non_whitespace_scope() {
        let events = vec![
            HighlightEvent::Start {
                scope_index: 1,
                language: "elixir".to_string(),
            },
            HighlightEvent::Source { start: 0, end: 1 },
            HighlightEvent::Start {
                scope_index: 2,
                language: "elixir".to_string(),
            },
            HighlightEvent::Source { start: 1, end: 2 },
            HighlightEvent::End,
            HighlightEvent::Source { start: 2, end: 3 },
            HighlightEvent::End,
        ];

        assert_eq!(
            flatten_events("a b", events),
            vec![
                HighlightEvent::Start {
                    scope_index: 1,
                    language: "elixir".to_string(),
                },
                HighlightEvent::Source { start: 0, end: 1 },
                HighlightEvent::End,
                HighlightEvent::Source { start: 1, end: 2 },
                HighlightEvent::Start {
                    scope_index: 1,
                    language: "elixir".to_string(),
                },
                HighlightEvent::Source { start: 2, end: 3 },
                HighlightEvent::End,
            ]
        );
    }

    #[test]
    fn escapes_decorator_attributes_in_safe_rendering() {
        let attributes = HashMap::from([
            ("highlight_lines".to_string(), "1".to_string()),
            (
                "highlight_lines_style".to_string(),
                "color: red;\" onmouseover=\"alert(1)".to_string(),
            ),
            (
                "highlight_lines_class".to_string(),
                "line\" onmouseover=\"alert(1)".to_string(),
            ),
        ]);

        let inline = inline_highlight_lines(&attributes, None, false).unwrap();
        assert!(matches!(
            inline.style,
            Some(ExHtmlInlineHighlightLinesStyle::Style { style })
                if style == html::escape(&attributes["highlight_lines_style"])
        ));
        assert_eq!(
            inline.class,
            Some(html::escape(&attributes["highlight_lines_class"]))
        );

        let linked = linked_highlight_lines(&attributes, false).unwrap();
        assert_eq!(
            linked.class,
            html::escape(&attributes["highlight_lines_class"])
        );
    }

    #[test]
    fn preserves_decorator_attributes_in_unsafe_rendering() {
        let attributes = HashMap::from([
            ("highlight_lines".to_string(), "1".to_string()),
            (
                "highlight_lines_style".to_string(),
                "color: red;\" onmouseover=\"alert(1)".to_string(),
            ),
            (
                "highlight_lines_class".to_string(),
                "line\" onmouseover=\"alert(1)".to_string(),
            ),
        ]);

        let inline = inline_highlight_lines(&attributes, None, true).unwrap();
        assert!(matches!(
            inline.style,
            Some(ExHtmlInlineHighlightLinesStyle::Style { style })
                if style == attributes["highlight_lines_style"]
        ));
        assert_eq!(
            inline.class.as_deref(),
            Some(attributes["highlight_lines_class"].as_str())
        );

        let linked = linked_highlight_lines(&attributes, true).unwrap();
        assert_eq!(linked.class, attributes["highlight_lines_class"]);
    }
}

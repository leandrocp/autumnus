//! HTML generation helpers for creating custom HTML formatters.
//!
//! These helpers work with language names as strings, making them independent of tree-sitter.

use crate::languages::Language;
use crate::themes::{TextDecoration, Theme, UnderlineStyle};
use std::io::{self, Write};

/// Generate HTML attributes for a span with inline CSS styles.
pub fn span_inline_attrs(
    language: Option<Language>,
    scope: &str,
    theme: Option<&Theme>,
    italic: bool,
    include_highlights: bool,
) -> String {
    let mut attrs = String::new();

    if include_highlights {
        attrs.push_str(&format!("data-highlight=\"{}\"", scope));
    }

    if let Some(theme) = theme {
        let specialized_scope = if let Some(lang) = language {
            format!("{}.{}", scope, lang.id_name())
        } else {
            scope.to_string()
        };

        if let Some(style) = theme.get_style(&specialized_scope) {
            let has_decoration = style.text_decoration.underline != UnderlineStyle::None
                || style.text_decoration.strikethrough;
            if include_highlights
                && (style.fg.is_some()
                    || style.bg.is_some()
                    || style.bold
                    || (italic && style.italic)
                    || has_decoration)
            {
                attrs.push(' ');
            }

            let css = style.css(italic, " ");
            if !css.is_empty() {
                attrs.push_str(&format!("style=\"{}\"", css));
            }
        }
    }

    attrs
}

/// Generate an HTML `<span>` element with inline CSS styles.
pub fn span_inline(
    text: &str,
    language: Option<Language>,
    scope: &str,
    theme: Option<&Theme>,
    italic: bool,
    include_highlights: bool,
) -> String {
    let escaped = escape(text);
    let attrs = span_inline_attrs(language, scope, theme, italic, include_highlights);

    if attrs.is_empty() {
        escaped
    } else {
        format!("<span {}>{}</span>", attrs, escaped)
    }
}

/// Generate HTML attributes for a span with CSS class.
pub fn span_linked_attrs(scope: &str) -> String {
    let class = scope_to_class(scope);
    format!("class=\"{}\"", class)
}

/// Generate an HTML `<span>` element with CSS class.
pub fn span_linked(text: &str, scope: &str) -> String {
    let escaped = escape(text);
    let class = scope_to_class(scope);
    format!("<span class=\"{}\">{}</span>", class, escaped)
}

/// Sanitize a theme name for use in CSS variable names.
pub fn sanitize_theme_name(name: &str) -> String {
    name.chars()
        .map(|c| {
            if c.is_alphanumeric() || c == '-' || c == '_' {
                c
            } else {
                '-'
            }
        })
        .collect()
}

/// Get the CSS text-decoration value from a TextDecoration struct.
pub fn text_decoration(td: &TextDecoration) -> &'static str {
    match (td.underline, td.strikethrough) {
        (UnderlineStyle::None, false) => "none",
        (UnderlineStyle::None, true) => "line-through",
        (UnderlineStyle::Solid, false) => "underline",
        (UnderlineStyle::Solid, true) => "underline line-through",
        (UnderlineStyle::Wavy, false) => "underline wavy",
        (UnderlineStyle::Wavy, true) => "underline wavy line-through",
        (UnderlineStyle::Double, false) => "underline double",
        (UnderlineStyle::Double, true) => "underline double line-through",
        (UnderlineStyle::Dotted, false) => "underline dotted",
        (UnderlineStyle::Dotted, true) => "underline dotted line-through",
        (UnderlineStyle::Dashed, false) => "underline dashed",
        (UnderlineStyle::Dashed, true) => "underline dashed line-through",
    }
}

/// Generate HTML attributes for a span with CSS variables for multiple themes.
#[allow(clippy::too_many_arguments)]
pub fn span_multi_themes_attrs(
    scope: &str,
    language: Option<Language>,
    themes: &std::collections::HashMap<String, Theme>,
    default_theme: Option<&str>,
    css_variable_prefix: &str,
    italic: bool,
    include_highlights: bool,
) -> String {
    if themes.is_empty() {
        return String::new();
    }

    let specialized_scope = if let Some(lang) = language {
        format!("{}.{}", scope, lang.id_name())
    } else {
        scope.to_string()
    };

    let mut inline_styles = Vec::new();
    let mut css_vars = Vec::new();

    if let Some(default_name) = default_theme {
        if default_name == "light-dark()" {
            if let (Some(light_theme), Some(dark_theme)) = (themes.get("light"), themes.get("dark"))
            {
                if let (Some(light_style), Some(dark_style)) = (
                    light_theme.get_style(&specialized_scope),
                    dark_theme.get_style(&specialized_scope),
                ) {
                    if let (Some(light_fg), Some(dark_fg)) = (&light_style.fg, &dark_style.fg) {
                        inline_styles
                            .push(format!("color: light-dark({}, {});", light_fg, dark_fg));
                    }
                    if let (Some(light_bg), Some(dark_bg)) = (&light_style.bg, &dark_style.bg) {
                        inline_styles.push(format!(
                            "background-color: light-dark({}, {});",
                            light_bg, dark_bg
                        ));
                    }
                    let light_weight = if light_style.bold { "bold" } else { "normal" };
                    let dark_weight = if dark_style.bold { "bold" } else { "normal" };
                    inline_styles.push(format!(
                        "font-weight: light-dark({}, {});",
                        light_weight, dark_weight
                    ));
                    if italic {
                        let light_style_val = if light_style.italic {
                            "italic"
                        } else {
                            "normal"
                        };
                        let dark_style_val = if dark_style.italic {
                            "italic"
                        } else {
                            "normal"
                        };
                        inline_styles.push(format!(
                            "font-style: light-dark({}, {});",
                            light_style_val, dark_style_val
                        ));
                    }
                    let light_decoration = text_decoration(&light_style.text_decoration);
                    let dark_decoration = text_decoration(&dark_style.text_decoration);
                    inline_styles.push(format!(
                        "text-decoration: light-dark({}, {});",
                        light_decoration, dark_decoration
                    ));
                }
            }
        } else if let Some(default_theme_obj) = themes.get(default_name) {
            if let Some(style) = default_theme_obj.get_style(&specialized_scope) {
                if let Some(fg) = &style.fg {
                    inline_styles.push(format!("color:{};", fg));
                }
                if let Some(bg) = &style.bg {
                    inline_styles.push(format!("background-color:{};", bg));
                }
                if style.bold {
                    inline_styles.push("font-weight:bold;".to_string());
                }
                if italic && style.italic {
                    inline_styles.push("font-style:italic;".to_string());
                }
                let td_css = text_decoration(&style.text_decoration);
                if td_css != "none" {
                    inline_styles.push(format!("text-decoration:{};", td_css));
                }

                let sanitized = sanitize_theme_name(default_name);
                let font_style = if style.italic { "italic" } else { "normal" };
                css_vars.push(format!(
                    "{}-{}-font-style:{};",
                    css_variable_prefix, sanitized, font_style
                ));

                let font_weight = if style.bold { "bold" } else { "normal" };
                css_vars.push(format!(
                    "{}-{}-font-weight:{};",
                    css_variable_prefix, sanitized, font_weight
                ));

                let text_dec = text_decoration(&style.text_decoration);
                css_vars.push(format!(
                    "{}-{}-text-decoration:{};",
                    css_variable_prefix, sanitized, text_dec
                ));
            }

            for (theme_name, theme) in themes.iter() {
                if theme_name != default_name {
                    if let Some(style) = theme.get_style(&specialized_scope) {
                        let sanitized = sanitize_theme_name(theme_name);

                        if let Some(fg) = &style.fg {
                            css_vars.push(format!("{}-{}:{};", css_variable_prefix, sanitized, fg));
                        }
                        if let Some(bg) = &style.bg {
                            css_vars
                                .push(format!("{}-{}-bg:{};", css_variable_prefix, sanitized, bg));
                        }

                        let font_style = if style.italic { "italic" } else { "normal" };
                        css_vars.push(format!(
                            "{}-{}-font-style:{};",
                            css_variable_prefix, sanitized, font_style
                        ));

                        let font_weight = if style.bold { "bold" } else { "normal" };
                        css_vars.push(format!(
                            "{}-{}-font-weight:{};",
                            css_variable_prefix, sanitized, font_weight
                        ));

                        let text_dec = text_decoration(&style.text_decoration);
                        css_vars.push(format!(
                            "{}-{}-text-decoration:{};",
                            css_variable_prefix, sanitized, text_dec
                        ));
                    }
                }
            }
        }
    } else {
        for (theme_name, theme) in themes.iter() {
            if let Some(style) = theme.get_style(&specialized_scope) {
                let sanitized = sanitize_theme_name(theme_name);

                if let Some(fg) = &style.fg {
                    css_vars.push(format!("{}-{}: {};", css_variable_prefix, sanitized, fg));
                }
                if let Some(bg) = &style.bg {
                    css_vars.push(format!("{}-{}-bg: {};", css_variable_prefix, sanitized, bg));
                }

                let font_style = if style.italic { "italic" } else { "normal" };
                css_vars.push(format!(
                    "{}-{}-font-style: {};",
                    css_variable_prefix, sanitized, font_style
                ));

                let font_weight = if style.bold { "bold" } else { "normal" };
                css_vars.push(format!(
                    "{}-{}-font-weight: {};",
                    css_variable_prefix, sanitized, font_weight
                ));

                let text_dec = text_decoration(&style.text_decoration);
                css_vars.push(format!(
                    "{}-{}-text-decoration: {};",
                    css_variable_prefix, sanitized, text_dec
                ));
            }
        }
    }

    if inline_styles.is_empty() && css_vars.is_empty() {
        return String::new();
    }

    let mut attrs = String::new();
    if include_highlights {
        attrs.push_str(&format!("data-highlight=\"{}\" ", scope));
    }

    attrs.push_str("style=\"");
    if !inline_styles.is_empty() {
        attrs.push_str(&inline_styles.join(" "));
    }
    if !css_vars.is_empty() {
        if !inline_styles.is_empty() {
            attrs.push(' ');
        }
        attrs.push_str(&css_vars.join(" "));
    }
    attrs.push('"');

    attrs
}

/// Generate an HTML `<span>` element with CSS variables for multiple themes.
#[allow(clippy::too_many_arguments)]
pub fn span_multi_themes(
    text: &str,
    scope: &str,
    language: Option<Language>,
    themes: &std::collections::HashMap<String, Theme>,
    default_theme: Option<&str>,
    css_variable_prefix: &str,
    italic: bool,
    include_highlights: bool,
) -> String {
    let escaped = escape(text);

    if themes.is_empty() {
        return escaped;
    }

    let attrs = span_multi_themes_attrs(
        scope,
        language,
        themes,
        default_theme,
        css_variable_prefix,
        italic,
        include_highlights,
    );

    if attrs.is_empty() {
        escaped
    } else {
        format!("<span {}>{}</span>", attrs, escaped)
    }
}

/// Escape text for safe HTML output.
pub fn escape(text: &str) -> String {
    let mut buf = String::with_capacity(text.len() + text.len() / 10);

    for c in text.chars() {
        match c {
            '&' => buf.push_str("&amp;"),
            '<' => buf.push_str("&lt;"),
            '>' => buf.push_str("&gt;"),
            '"' => buf.push_str("&quot;"),
            '\'' => buf.push_str("&#39;"),
            '{' => buf.push_str("&lbrace;"),
            '}' => buf.push_str("&rbrace;"),
            _ => buf.push(c),
        }
    }

    buf
}

/// Escape braces for framework compatibility.
pub fn escape_braces(text: &str) -> String {
    text.replace('{', "&lbrace;").replace('}', "&rbrace;")
}

/// Wrap content in a line div with optional class and style attributes.
pub fn wrap_line(
    line_number: usize,
    content: &str,
    class_suffix: Option<&str>,
    style: Option<&str>,
) -> String {
    let class_attr = if let Some(suffix) = class_suffix {
        format!("line{}", suffix)
    } else {
        "line".to_string()
    };

    let style_attr = if let Some(s) = style {
        format!(" style=\"{}\"", s)
    } else {
        String::new()
    };

    format!(
        "<div class=\"{}\"{}data-line=\"{}\">{}</div>",
        class_attr,
        if style.is_some() {
            format!("{} ", style_attr)
        } else {
            " ".to_string()
        },
        line_number,
        content
    )
}

/// Map tree-sitter scope to CSS class name.
pub fn scope_to_class(scope: &str) -> &str {
    crate::highlights::HIGHLIGHT_NAMES
        .iter()
        .position(|&s| s == scope)
        .and_then(|idx| crate::highlights::CLASSES.get(idx))
        .copied()
        .unwrap_or("text")
}

/// Generate an opening `<pre>` tag with optional class and theme styles.
pub fn open_pre_tag(
    output: &mut dyn Write,
    pre_class: Option<&str>,
    theme: Option<&Theme>,
) -> io::Result<()> {
    let class = if let Some(pre_class) = pre_class {
        format!("lumis {pre_class}")
    } else {
        "lumis".to_string()
    };

    write!(
        output,
        "<pre class=\"{}\"{}>",
        class,
        theme
            .and_then(|theme| theme.pre_style(" "))
            .map(|pre_style| format!(" style=\"{pre_style}\""))
            .unwrap_or_default(),
    )
}

/// Generate an opening `<code>` tag with language class.
pub fn open_code_tag(output: &mut dyn Write, lang: &Language) -> io::Result<()> {
    write!(
        output,
        "<code class=\"language-{}\" translate=\"no\" tabindex=\"0\">",
        lang.id_name()
    )
}

/// Generate closing `</code>` tag.
pub fn close_code_tag(output: &mut dyn Write) -> io::Result<()> {
    output.write_all(b"</code>")
}

/// Generate closing `</pre>` tag.
pub fn close_pre_tag(output: &mut dyn Write) -> io::Result<()> {
    output.write_all(b"</pre>")
}

/// Generate closing `</code></pre>` tags.
pub fn closing_tags(output: &mut dyn Write) -> io::Result<()> {
    close_code_tag(output)?;
    close_pre_tag(output)
}

/// Split a fragment across lines, appending to the current line and starting new ones at `\n`.
pub fn append_fragment(lines: &mut Vec<String>, fragment: &str) {
    let mut parts = fragment.split('\n').peekable();

    while let Some(part) = parts.next() {
        if let Some(current) = lines.last_mut() {
            current.push_str(part);
        }

        if parts.peek().is_some() {
            lines.push(String::new());
        }
    }
}

/// Escape text for use in HTML span content (escapes HTML entities and braces).
pub fn escape_fragment(text: &str) -> String {
    escape(text)
}

/// Render highlight events into HTML lines, reopening active spans at line boundaries.
pub fn render_lines_from_events<F>(
    source: &str,
    events: &[crate::events::HighlightEvent],
    span_attrs: F,
) -> Vec<String>
where
    F: Fn(usize, &str) -> String,
{
    let mut lines = vec![String::new()];
    let mut stack: Vec<(usize, String)> = Vec::new();

    for event in events {
        match event {
            crate::events::HighlightEvent::Start {
                scope_index,
                language,
            } => {
                let attrs = span_attrs(*scope_index, language);
                append_fragment(&mut lines, &format!("<span {attrs}>"));
                stack.push((*scope_index, language.clone()));
            }
            crate::events::HighlightEvent::End => {
                if stack.pop().is_some() {
                    append_fragment(&mut lines, "</span>");
                }
            }
            crate::events::HighlightEvent::Source { start, end } => {
                let s = (*start).min(source.len());
                let e = (*end).min(source.len()).max(s);
                render_source_event(&mut lines, &source[s..e], &stack, &span_attrs);
            }
        }
    }

    while stack.pop().is_some() {
        append_fragment(&mut lines, "</span>");
    }

    lines
}

fn render_source_event<F>(
    lines: &mut Vec<String>,
    text: &str,
    stack: &[(usize, String)],
    span_attrs: &F,
) where
    F: Fn(usize, &str) -> String,
{
    let mut remaining = text;

    loop {
        match remaining.find('\n') {
            Some(newline_index) => {
                let fragment = &remaining[..newline_index];
                append_fragment(lines, &escape_fragment(fragment));
                close_open_spans(lines, stack.len());
                lines.push(String::new());
                reopen_spans(lines, stack, span_attrs);
                remaining = &remaining[newline_index + 1..];
            }
            None => {
                append_fragment(lines, &escape_fragment(remaining));
                break;
            }
        }
    }
}

fn close_open_spans(lines: &mut Vec<String>, len: usize) {
    for _ in 0..len {
        append_fragment(lines, "</span>");
    }
}

fn reopen_spans<F>(lines: &mut Vec<String>, stack: &[(usize, String)], span_attrs: &F)
where
    F: Fn(usize, &str) -> String,
{
    for (scope_index, language) in stack {
        let attrs = span_attrs(*scope_index, language);
        append_fragment(lines, &format!("<span {attrs}>"));
    }
}

/// Render highlight events into HTML lines, calling `attribute_callback` for each highlight span.
///
/// This is a simplified version of the vendored HtmlRenderer that works with
/// pre-computed `HighlightEvent` slices instead of tree-sitter iterators.
pub fn render_events<F>(
    source: &str,
    events: &[crate::events::HighlightEvent],
    attribute_callback: &F,
) -> (Vec<u8>, Vec<u32>)
where
    F: Fn(usize, &str, &mut Vec<u8>),
{
    let source = source.as_bytes();
    let mut html = Vec::new();
    let mut line_offsets = vec![0u32];
    let mut highlight_stack: Vec<(usize, String)> = Vec::new();

    for event in events {
        match event {
            crate::events::HighlightEvent::Start {
                scope_index,
                language,
            } => {
                html.extend_from_slice(b"<span ");
                attribute_callback(*scope_index, language, &mut html);
                html.push(b'>');
                highlight_stack.push((*scope_index, language.clone()));
            }
            crate::events::HighlightEvent::End => {
                html.extend_from_slice(b"</span>");
                highlight_stack.pop();
            }
            crate::events::HighlightEvent::Source { start, end } => {
                let s = (*start).min(source.len());
                let e = (*end).min(source.len()).max(s);
                let text = &source[s..e];
                // Process character by character, tracking line boundaries
                for &byte in text {
                    if byte == b'\n' {
                        html.push(b'\n');
                        // Close all open spans for line boundary
                        // (they'll be reopened on the next line by the caller
                        // if needed — but in this simplified model we just track offsets)
                        line_offsets.push(html.len() as u32);
                    } else {
                        // HTML-escape individual characters
                        match byte {
                            b'&' => html.extend_from_slice(b"&amp;"),
                            b'<' => html.extend_from_slice(b"&lt;"),
                            b'>' => html.extend_from_slice(b"&gt;"),
                            b'"' => html.extend_from_slice(b"&quot;"),
                            b'\'' => html.extend_from_slice(b"&#39;"),
                            _ => html.push(byte),
                        }
                    }
                }
            }
        }
    }

    (html, line_offsets)
}

/// Iterator over rendered HTML lines.
pub fn lines_from_offsets<'a>(
    html: &'a [u8],
    line_offsets: &'a [u32],
) -> impl Iterator<Item = &'a str> + 'a {
    line_offsets
        .windows(2)
        .map(move |w| {
            let start = w[0] as usize;
            let end = w[1] as usize;
            std::str::from_utf8(&html[start..end]).unwrap_or("")
        })
        .chain(std::iter::once({
            let last_offset = *line_offsets.last().unwrap_or(&0) as usize;
            std::str::from_utf8(&html[last_offset..]).unwrap_or("")
        }))
}

#[cfg(test)]
mod tests {
    use super::*;
    use pretty_assertions::assert_str_eq;

    #[test]
    fn test_escape_all_entities() {
        assert_eq!(
            escape("&<>\"'{}"),
            "&amp;&lt;&gt;&quot;&#39;&lbrace;&rbrace;"
        );
    }

    #[test]
    fn test_escape_preserves_normal_text() {
        assert_eq!(escape("hello world"), "hello world");
    }

    #[test]
    fn test_escape_mixed_content() {
        assert_eq!(
            escape("fn main() { println!(\"<html>\"); }"),
            "fn main() &lbrace; println!(&quot;&lt;html&gt;&quot;); &rbrace;"
        );
    }

    #[test]
    fn test_escape_empty_string() {
        assert_eq!(escape(""), "");
    }

    #[test]
    fn test_escape_braces_only() {
        assert_eq!(escape_braces("fn() {}"), "fn() &lbrace;&rbrace;");
    }

    #[test]
    fn test_scope_to_class_keyword_conditional() {
        assert_eq!(scope_to_class("keyword.conditional"), "keyword-conditional");
    }

    #[test]
    fn test_scope_to_class_unknown_scope() {
        assert_eq!(scope_to_class("unknown.scope.name"), "text");
    }

    #[test]
    fn test_wrap_line_simple() {
        let result = wrap_line(1, "content", None, None);
        assert_str_eq!(result, r#"<div class="line" data-line="1">content</div>"#);
    }

    #[test]
    fn test_wrap_line_with_class() {
        let result = wrap_line(5, "highlighted content", Some(" highlighted"), None);
        assert_str_eq!(
            result,
            r#"<div class="line highlighted" data-line="5">highlighted content</div>"#
        );
    }

    #[test]
    fn test_wrap_line_with_style() {
        let result = wrap_line(3, "styled", None, Some("color: red;"));
        assert_str_eq!(
            result,
            r#"<div class="line" style="color: red;" data-line="3">styled</div>"#
        );
    }
}

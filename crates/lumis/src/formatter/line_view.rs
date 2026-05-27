use crate::themes::Style;
use lumis_core::highlight::{Line, Scope, Span, StylePatch, VirtualText};
use std::io::{self, Write};

pub(crate) fn render_html_line<F>(line: &Line, span_attrs: F) -> String
where
    F: Fn(&Scope) -> String,
{
    let mut column = 0usize;
    let mut rendered = String::new();
    let mut stack: Vec<Scope> = Vec::new();

    rendered.push_str(&render_html_gutter(line));
    for span in &line.spans {
        let common = extended_scope_prefix(&stack, &span.scopes);
        for _ in common..stack.len() {
            rendered.push_str("</span>");
        }
        for scope in &span.scopes[common..] {
            let attrs = span_attrs(scope);
            rendered.push_str(&format!("<span {attrs}>"));
        }
        stack.clone_from(&span.scopes);

        let text = render_html_text_with_virtuals(&span.text, line, &mut column);
        rendered.push_str(&wrap_decorated_html_span(span, text));
    }
    for _ in 0..stack.len() {
        rendered.push_str("</span>");
    }
    rendered.push_str(&render_html_remaining_virtuals(line, &mut column));
    rendered.push('\n');
    rendered
}

pub(crate) fn write_html_line(
    output: &mut dyn Write,
    line: &Line,
    content: &str,
    custom_style: Option<&str>,
) -> io::Result<()> {
    let style = match (line_style(line), custom_style) {
        (Some(line_style), Some(custom_style)) => Some(format!("{line_style}; {custom_style}")),
        (Some(line_style), None) => Some(line_style),
        (None, Some(custom_style)) => Some(custom_style.to_string()),
        (None, None) => None,
    };
    let wrapped = lumis_core::formatter::html::wrap_line(
        line.line_number,
        content,
        line_class_suffix(line).as_deref(),
        style.as_deref(),
    );
    write!(output, "{wrapped}")
}

fn extended_scope_prefix(left: &[Scope], right: &[Scope]) -> usize {
    let common = left
        .iter()
        .zip(right)
        .take_while(|(left, right)| left == right)
        .count();
    if common > 0 && common == left.len() && common == right.len() {
        common - 1
    } else {
        common
    }
}

fn wrap_decorated_html_span(span: &Span, rendered: String) -> String {
    let style = span.style.as_ref().and_then(style_patch_css);
    if style.is_none() && span.decoration_kinds.is_empty() {
        return rendered;
    }

    let mut attrs = Vec::new();
    if !span.decoration_kinds.is_empty() {
        attrs.push(format!(
            "data-decoration=\"{}\"",
            escape_html_attr(&span.decoration_kinds.join(" "))
        ));
    }
    if let Some(style) = style {
        attrs.push(format!("style=\"{style}\""));
    }
    format!("<span {}>{rendered}</span>", attrs.join(" "))
}

fn render_html_gutter(line: &Line) -> String {
    if line.gutter_text.is_empty() && line.signs.is_empty() {
        return String::new();
    }

    let mut output = String::from("<span class=\"gutter\">");
    for item in &line.gutter_text {
        let text = lumis_core::formatter::html::escape_fragment(&item.text);
        let style = style_patch_css(&item.style);
        let kind = item.kind.as_deref().map(escape_html_attr);
        output.push_str(&html_annotated_span(
            "gutter-text",
            "data-gutter",
            kind,
            style,
            text,
        ));
    }
    for item in &line.signs {
        let text = lumis_core::formatter::html::escape_fragment(&item.text);
        let style = style_patch_css(&item.style);
        let kind = item.kind.as_deref().map(escape_html_attr);
        output.push_str(&html_annotated_span(
            "gutter-sign",
            "data-sign",
            kind,
            style,
            text,
        ));
    }
    output.push_str("<span class=\"gutter-separator\"> │ </span></span>");
    output
}

fn html_annotated_span(
    class_name: &str,
    data_attr: &str,
    kind: Option<String>,
    style: Option<String>,
    text: String,
) -> String {
    let mut attrs = vec![format!("class=\"{class_name}\"")];
    if let Some(kind) = kind {
        attrs.push(format!("{data_attr}=\"{kind}\""));
    }
    if let Some(style) = style {
        attrs.push(format!("style=\"{style}\""));
    }
    format!("<span {}>{text}</span>", attrs.join(" "))
}

fn render_html_text_with_virtuals(text: &str, line: &Line, column: &mut usize) -> String {
    if line.virtual_text.is_empty() {
        *column += display_width(text);
        return lumis_core::formatter::html::escape_fragment(text);
    }

    let mut rendered = String::new();
    for ch in text.chars() {
        if let Some(virtual_text) = virtual_text_at_column(line, *column) {
            rendered.push_str(&render_html_virtual_text(virtual_text));
        }
        rendered.push_str(&lumis_core::formatter::html::escape_fragment(
            &ch.to_string(),
        ));
        *column += char_display_width(ch);
    }
    rendered
}

fn render_html_virtual_text(virtual_text: &VirtualText) -> String {
    let text = lumis_core::formatter::html::escape_fragment(&virtual_text.text);
    let style = style_patch_css(&virtual_text.style);
    let kind = virtual_text.kind.as_deref().map(escape_html_attr);
    html_annotated_span("virtual-text", "data-virtual", kind, style, text)
}

fn render_html_remaining_virtuals(line: &Line, column: &mut usize) -> String {
    let mut rendered = String::new();
    for virtual_text in &line.virtual_text {
        if virtual_text.column < *column {
            continue;
        }
        while *column < virtual_text.column {
            rendered.push(' ');
            *column += 1;
        }
        rendered.push_str(&render_html_virtual_text(virtual_text));
        *column += display_width(&virtual_text.text);
    }
    rendered
}

fn line_class_suffix(line: &Line) -> Option<String> {
    let mut classes = Vec::new();
    for class in line
        .line_highlights
        .iter()
        .filter_map(|highlight| highlight.class.as_deref())
    {
        if !classes.contains(&class) {
            classes.push(class);
        }
    }
    (!classes.is_empty()).then(|| format!(" {}", classes.join(" ")))
}

fn line_style(line: &Line) -> Option<String> {
    merged_line_style(line).as_ref().and_then(style_patch_css)
}

pub(crate) fn merged_line_style(line: &Line) -> Option<StylePatch> {
    let mut style = StylePatch::default();
    for highlight in &line.line_highlights {
        style.merge(&highlight.style);
    }
    style_patch_css(&style).is_some().then_some(style)
}

fn style_patch_css(style: &StylePatch) -> Option<String> {
    let mut theme_style = Style::default();
    apply_style_patch(&mut theme_style, style);
    let css = theme_style.css(true, " ");
    (!css.is_empty()).then_some(css)
}

pub(crate) fn apply_style_patch(base: &mut Style, patch: &StylePatch) {
    if let Some(fg) = &patch.fg {
        base.fg = Some(fg.clone());
    }
    if let Some(bg) = &patch.bg {
        base.bg = Some(bg.clone());
    }
    if let Some(bold) = patch.bold {
        base.bold = bold;
    }
    if let Some(italic) = patch.italic {
        base.italic = italic;
    }
    if let Some(underline) = patch.text_decoration.underline {
        base.text_decoration.underline = underline;
    }
    if let Some(strikethrough) = patch.text_decoration.strikethrough {
        base.text_decoration.strikethrough = strikethrough;
    }
}

pub(crate) fn display_width(text: &str) -> usize {
    text.chars().map(char_display_width).sum()
}

pub(crate) fn char_display_width(ch: char) -> usize {
    match ch {
        '\t' => 4,
        _ => 1,
    }
}

pub(crate) fn virtual_text_at_column(line: &Line, column: usize) -> Option<&VirtualText> {
    line.virtual_text
        .iter()
        .find(|virtual_text| virtual_text.column == column)
}

fn escape_html_attr(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

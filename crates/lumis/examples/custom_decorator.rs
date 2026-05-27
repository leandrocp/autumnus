use lumis::highlight::{
    DecorationOutput, DecoratorContext, GutterText, Line, LineHighlight, LineViewBuilder,
    LineViewDecorator, StylePatch,
};
use lumis::languages::Language;
use lumis::{formatters::ansi, themes::Style};

#[derive(Debug)]
struct TodoLines {
    style: StylePatch,
    gutter_style: StylePatch,
}

impl TodoLines {
    fn new() -> Self {
        Self {
            style: StylePatch {
                bg: Some("#3a2f16".to_string()),
                ..StylePatch::default()
            },
            gutter_style: StylePatch {
                fg: Some("#ffb86c".to_string()),
                ..StylePatch::default()
            },
        }
    }
}

impl LineViewDecorator for TodoLines {
    fn run(&self, context: DecoratorContext<'_>, output: &mut DecorationOutput) {
        for (index, line) in context.source().split('\n').enumerate() {
            if line.contains("TODO") || line.contains("FIXME") {
                output.line_highlights.push(LineHighlight {
                    line: index + 1,
                    kind: Some("todo.line".to_string()),
                    class: Some("todo-line".to_string()),
                    style: self.style.clone(),
                });
                output.gutter_text.push(GutterText {
                    line: index + 1,
                    kind: Some("todo.marker".to_string()),
                    text: "TODO".to_string(),
                    style: self.gutter_style.clone(),
                });
            }
        }
    }
}

fn main() {
    let source = "function main() {\n    // TODO: rewrite in Rust\n}\n";
    let todo_lines = TodoLines::new();

    let view = LineViewBuilder::new()
        .source(source)
        .language(Language::JavaScript)
        .decorators(vec![&todo_lines])
        .build()
        .unwrap();

    println!("{view:#?}");

    println!("\nTerminal preview:");
    for line in &view.lines {
        println!("{} │ {}", terminal_gutter(line), terminal_source_line(line));
    }

    println!("\nTODOs:");
    for line in view.lines.iter().filter(|line| is_todo_line(line)) {
        println!("- line {}: {}", line.line_number, source_line(line));
    }
}

fn is_todo_line(line: &Line) -> bool {
    line.line_highlights
        .iter()
        .any(|highlight| highlight.kind.as_deref() == Some("todo.line"))
}

fn source_line(line: &Line) -> String {
    line.spans.iter().map(|span| span.text.as_str()).collect()
}

fn terminal_gutter(line: &Line) -> String {
    let Some(gutter) = line.gutter_text.first() else {
        return "    ".to_string();
    };

    ansi::paint(
        &format!("{:>4}", gutter.text),
        &style_from_patch(&gutter.style),
    )
}

fn terminal_source_line(line: &Line) -> String {
    let text = source_line(line);
    let Some(highlight) = line.line_highlights.first() else {
        return text;
    };

    ansi::paint(&text, &style_from_patch(&highlight.style))
}

fn style_from_patch(patch: &StylePatch) -> Style {
    let mut style = Style::default();
    style.fg.clone_from(&patch.fg);
    style.bg.clone_from(&patch.bg);
    if let Some(bold) = patch.bold {
        style.bold = bold;
    }
    if let Some(italic) = patch.italic {
        style.italic = italic;
    }
    if let Some(underline) = patch.text_decoration.underline {
        style.text_decoration.underline = underline;
    }
    if let Some(strikethrough) = patch.text_decoration.strikethrough {
        style.text_decoration.strikethrough = strikethrough;
    }
    style
}

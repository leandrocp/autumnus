//! Custom formatter plus custom decorator example.
//!
//! This is the most flexible decorator path: the decorator detects review notes
//! and emits formatter-neutral `LineView` decorations, while the formatter owns
//! the final HTML shape. The output is a small code-review surface with line
//! numbers from `Line.line_number`, highlighted TODO/FIXME markers, and an
//! annotation rail.
//! The formatter also applies theme colors from each span's syntax scopes, so the
//! custom decorator layers on top of normal syntax highlighting instead of
//! replacing it.

use lumis::formatters::{html, Formatter};
use lumis::highlight::{
    DecorationOutput, DecoratorContext, HighlightDecoration, Line, LineView, LineViewBuilder,
    LineViewDecorator, Span, StylePatch, HIGHLIGHT_NAMES,
};
use lumis::languages::Language;
use lumis::themes::{self, Style, Theme};
use std::io::{self, Write};

#[derive(Clone, Debug)]
struct ReviewNoteDecorator;

impl LineViewDecorator for ReviewNoteDecorator {
    fn run(&self, context: DecoratorContext<'_>, output: &mut DecorationOutput) {
        let mut byte_offset = 0;

        for (index, line) in context.source().split_inclusive('\n').enumerate() {
            let line_text = line.trim_end_matches('\n');
            let line_number = index + 1;

            if let Some(column) = line_text.find("FIXME") {
                push_review_note(output, line_number, byte_offset + column, "FIXME", "fixme");
            } else if let Some(column) = line_text.find("TODO") {
                push_review_note(output, line_number, byte_offset + column, "TODO", "todo");
            }

            byte_offset += line.len();
        }
    }
}

fn push_review_note(
    output: &mut DecorationOutput,
    _line: usize,
    start: usize,
    marker: &str,
    severity: &str,
) {
    output.highlight_decorations.push(HighlightDecoration {
        range: start..start + marker.len(),
        kind: Some(format!("review.marker.{severity}")),
        style: StylePatch::default(),
    });
}

struct ReviewHtmlFormatter {
    language: Language,
    theme: Theme,
    decorators: Vec<Box<dyn LineViewDecorator + Send + Sync>>,
}

impl ReviewHtmlFormatter {
    fn new(language: Language, theme: Theme) -> Self {
        Self {
            language,
            theme,
            decorators: Vec::new(),
        }
    }

    fn decorator(mut self, decorator: impl LineViewDecorator + Send + Sync + 'static) -> Self {
        self.decorators.push(Box::new(decorator));
        self
    }
}

impl Formatter for ReviewHtmlFormatter {
    fn language(&self) -> Language {
        self.language
    }

    fn prepare_line_view<'a>(&self, source: &'a str, builder: &mut LineViewBuilder<'a>) {
        // The formatter renders custom decorator output from the LineView.
        for decorator in &self.decorators {
            let mut decoration_output = DecorationOutput::default();
            decorator.run(DecoratorContext::new(source), &mut decoration_output);
            builder.decoration_output(decoration_output);
        }
    }

    fn render(&self, view: &LineView, output: &mut dyn Write) -> io::Result<()> {
        let annotations = collect_annotations(view);

        write!(output, "{}", REVIEW_CSS)?;
        writeln!(output, "<section class=\"review-card\">")?;
        writeln!(output, "  <header class=\"review-header\">")?;
        writeln!(output, "    <div>")?;
        writeln!(
            output,
            "      <p class=\"review-eyebrow\">custom formatter + decorator</p>"
        )?;
        writeln!(output, "      <h2>Checkout flow review</h2>")?;
        writeln!(output, "    </div>")?;
        writeln!(
            output,
            "    <span class=\"review-count\">{} notes</span>",
            annotations.len()
        )?;
        writeln!(output, "  </header>")?;

        writeln!(output, "  <div class=\"review-layout\">")?;
        render_code(view, &self.theme, output)?;
        render_annotations(&annotations, output)?;
        writeln!(output, "  </div>")?;
        writeln!(output, "</section>")
    }
}

fn render_code(view: &LineView, theme: &Theme, output: &mut dyn Write) -> io::Result<()> {
    writeln!(output, "  <div class=\"review-code\"><code>")?;
    for line in &view.lines {
        render_line(line, theme, output)?;
    }
    writeln!(output, "  </code></div>")
}

fn render_line(line: &Line, theme: &Theme, output: &mut dyn Write) -> io::Result<()> {
    let class = line_class(line);
    write!(
        output,
        "<span class=\"{}\" data-line=\"{}\">",
        html::escape(&class),
        line.line_number
    )?;
    write!(
        output,
        "<span class=\"review-ln\">{}</span>",
        line.line_number
    )?;
    write!(output, "<span class=\"review-source\">")?;
    for span in &line.spans {
        render_span(span, theme, output)?;
    }
    writeln!(output, "</span></span>")
}

fn render_span(span: &Span, theme: &Theme, output: &mut dyn Write) -> io::Result<()> {
    let class = span
        .decoration_kinds
        .iter()
        .map(|kind| kind.replace('.', "-"))
        .collect::<Vec<_>>()
        .join(" ");
    let style = span_style(span, theme);

    if class.is_empty() {
        write!(
            output,
            "<span{}>{}</span>",
            attr("style", &style),
            html::escape(&span.text)
        )
    } else {
        write!(
            output,
            "<mark class=\"{}\"{}>{}</mark>",
            html::escape(&class),
            attr("style", &style),
            html::escape(&span.text)
        )
    }
}

fn span_style(span: &Span, theme: &Theme) -> String {
    span.scopes
        .iter()
        .rev()
        .filter_map(|scope| {
            let name = HIGHLIGHT_NAMES.get(scope.scope_index)?;
            let language = scope
                .language
                .map(|language| language.id_name())
                .unwrap_or("");
            let scoped_name = if language.is_empty() {
                (*name).to_string()
            } else {
                format!("{name}.{language}")
            };
            theme.get_style(&scoped_name)
        })
        .next()
        .map(style_attr)
        .unwrap_or_default()
}

fn style_attr(style: &Style) -> String {
    style.css(true, "")
}

fn attr(name: &str, value: &str) -> String {
    if value.is_empty() {
        String::new()
    } else {
        format!(" {name}=\"{}\"", html::escape(value))
    }
}

fn render_annotations(annotations: &[ReviewAnnotation], output: &mut dyn Write) -> io::Result<()> {
    writeln!(
        output,
        "    <aside class=\"review-notes\" aria-label=\"Review notes\">"
    )?;
    writeln!(output, "      <h3>Annotations</h3>")?;
    for annotation in annotations {
        writeln!(
            output,
            "      <article class=\"review-note review-note-{}\">",
            html::escape(annotation.severity)
        )?;
        writeln!(
            output,
            "        <span class=\"review-note-line\">line {}</span>",
            annotation.line
        )?;
        writeln!(
            output,
            "        <p>{}</p>",
            html::escape(&annotation.message)
        )?;
        writeln!(output, "      </article>")?;
    }
    writeln!(output, "    </aside>")
}

fn line_class(line: &Line) -> String {
    let mut classes = vec!["review-row".to_string()];
    if line.spans.iter().any(|span| {
        span.decoration_kinds
            .iter()
            .any(|kind| kind == "review.marker.todo")
    }) {
        classes.push("review-line-todo".to_string());
    }
    if line.spans.iter().any(|span| {
        span.decoration_kinds
            .iter()
            .any(|kind| kind == "review.marker.fixme")
    }) {
        classes.push("review-line-fixme".to_string());
    }
    classes.join(" ")
}

#[derive(Debug)]
struct ReviewAnnotation {
    line: usize,
    severity: &'static str,
    message: String,
}

fn collect_annotations(view: &LineView) -> Vec<ReviewAnnotation> {
    view.lines
        .iter()
        .filter_map(|line| {
            let severity = line.spans.iter().find_map(|span| {
                span.decoration_kinds
                    .iter()
                    .find_map(|kind| kind.strip_prefix("review.marker."))
            })?;
            let source = source_line(line);
            let message = source
                .split_once(':')
                .map(|(_, message)| message.trim())
                .filter(|message| !message.is_empty())
                .unwrap_or("Review this line before merging.")
                .to_string();

            Some(ReviewAnnotation {
                line: line.line_number,
                severity: if severity == "fixme" { "fixme" } else { "todo" },
                message,
            })
        })
        .collect()
}

fn source_line(line: &Line) -> String {
    line.spans.iter().map(|span| span.text.as_str()).collect()
}

const REVIEW_CSS: &str = r#"<style>
.review-card{background:#0f172a;border:1px solid #26344f;border-radius:14px;color:#dbeafe;font:13px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;overflow:hidden;max-width:1040px}
.review-header{align-items:center;background:linear-gradient(135deg,#111827,#172554);border-bottom:1px solid #26344f;display:flex;justify-content:space-between;padding:18px 22px}
.review-header h2{font-family:Inter,system-ui,sans-serif;font-size:18px;margin:2px 0 0}
.review-eyebrow{color:#93c5fd;font-size:11px;letter-spacing:.14em;margin:0;text-transform:uppercase}
.review-count{background:#1e3a8a;border:1px solid #3b82f6;border-radius:999px;color:#bfdbfe;padding:4px 10px}
.review-layout{display:grid;grid-template-columns:minmax(0,1fr) 280px}
.review-code{background:#020617;margin:0;overflow:auto;padding:10px 0}
.review-code code{display:block}
.review-row{display:grid;grid-template-columns:4.5ch minmax(0,1fr);min-height:21px;padding:0 16px}
.review-row:hover{background:#0b1220}
.review-line-todo{background:rgba(245,158,11,.12);box-shadow:inset 3px 0 #f59e0b}
.review-line-fixme{background:rgba(239,68,68,.14);box-shadow:inset 3px 0 #ef4444}
.review-ln{color:#64748b;text-align:right;user-select:none}
.review-source{white-space:pre}
mark{background:transparent;border-radius:4px;color:inherit;padding:0 2px}
.review-marker-todo{background:#92400e;color:#fde68a}
.review-marker-fixme{background:#991b1b;color:#fecaca}
.review-notes{background:#0b1120;border-left:1px solid #26344f;padding:16px}
.review-notes h3{font-family:Inter,system-ui,sans-serif;font-size:13px;margin:0 0 12px}
.review-note{border:1px solid #26344f;border-radius:10px;margin-bottom:10px;padding:10px 12px}
.review-note-todo{background:rgba(245,158,11,.08)}
.review-note-fixme{background:rgba(239,68,68,.1)}
.review-note-line{color:#93c5fd;font-size:12px}
.review-note p{color:#cbd5e1;margin:5px 0 0;white-space:normal}
</style>
"#;

fn main() {
    let source = r#"export function checkout(cart) {
  const total = cart.items.reduce((sum, item) => sum + item.price, 0)
  // TODO: show tax and shipping before charging the card
  charge(total)
  // FIXME: handle failed payments and retry safely
  return { ok: true }
}
"#;
    let theme = themes::get("catppuccin_mocha").unwrap();
    let formatter =
        ReviewHtmlFormatter::new(Language::JavaScript, theme).decorator(ReviewNoteDecorator);

    let mut output = Vec::new();
    formatter.format(source, &mut output).unwrap();

    println!("{}", String::from_utf8(output).unwrap());
}

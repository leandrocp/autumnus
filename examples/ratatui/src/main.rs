use ansi_to_tui::IntoText;
use lumis::{formatter::Formatter, languages::Language, themes, TerminalBuilder};
use ratatui::{
    crossterm::event::{self, Event, KeyCode},
    widgets::{Block, Paragraph},
    Frame,
};

const JS_SOURCE: &str = r#"export function greet(name) {
  return `Hello, ${name}!`
}
"#;

const RUST_SOURCE: &str = r#"fn main() {
    println!("Hello, world!");
}
"#;

fn highlight(source: &str, language: Language) -> String {
    let theme = themes::get("dracula").unwrap();
    let formatter = TerminalBuilder::new()
        .lang(language)
        .theme(Some(theme))
        .build()
        .unwrap();

    let mut output = Vec::new();
    formatter.format(source, &mut output).unwrap();
    String::from_utf8(output).unwrap()
}

fn ui(frame: &mut Frame) {
    let js_ansi = highlight(JS_SOURCE, Language::JavaScript);
    let rust_ansi = highlight(RUST_SOURCE, Language::Rust);
    let combined = format!("{}\n{}", js_ansi, rust_ansi);
    let text = combined.into_text().unwrap();
    let paragraph = Paragraph::new(text).block(Block::bordered().title("Ratatui + Lumis"));
    frame.render_widget(paragraph, frame.area());
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut terminal = ratatui::init();
    loop {
        terminal.draw(ui)?;
        if let Event::Key(key) = event::read()? {
            if key.code == KeyCode::Char('q') {
                break;
            }
        }
    }
    ratatui::restore();
    Ok(())
}

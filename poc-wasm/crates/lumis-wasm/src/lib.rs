use serde::Deserialize;
use std::cell::RefCell;
use std::collections::HashMap;
use tree_sitter_highlight::{HighlightConfiguration, HighlightEvent, Highlighter};

const HIGHLIGHT_NAMES: &[&str] = &[
    "attribute",
    "attribute.builtin",
    "boolean",
    "character",
    "character.special",
    "comment",
    "comment.documentation",
    "constant",
    "constant.builtin",
    "constructor",
    "function",
    "function.builtin",
    "function.call",
    "function.macro",
    "function.method",
    "keyword",
    "keyword.conditional",
    "keyword.control",
    "keyword.directive",
    "keyword.exception",
    "keyword.function",
    "keyword.import",
    "keyword.modifier",
    "keyword.operator",
    "keyword.repeat",
    "keyword.return",
    "keyword.type",
    "label",
    "markup.heading",
    "markup.heading.1",
    "markup.heading.2",
    "markup.heading.3",
    "markup.heading.4",
    "markup.heading.5",
    "markup.heading.6",
    "markup.italic",
    "markup.link.label",
    "markup.raw",
    "markup.strikethrough",
    "markup.strong",
    "markup.underline",
    "module",
    "namespace",
    "none",
    "number",
    "number.float",
    "operator",
    "property",
    "punctuation.bracket",
    "punctuation.delimiter",
    "punctuation.special",
    "string",
    "string.escape",
    "string.regex",
    "string.special",
    "string.special.url",
    "tag",
    "tag.attribute",
    "tag.builtin",
    "tag.delimiter",
    "type",
    "type.builtin",
    "type.definition",
    "variable",
    "variable.builtin",
    "variable.member",
    "variable.parameter",
];

// Query includes
#[cfg(feature = "lang-html")]
const HTML_HIGHLIGHTS: &str = include_str!("../queries/html/highlights.scm");

#[cfg(feature = "lang-css")]
const CSS_HIGHLIGHTS: &str = include_str!("../queries/css/highlights.scm");

#[cfg(feature = "lang-javascript")]
const JS_HIGHLIGHTS: &str = include_str!("../queries/javascript/highlights.scm");

#[cfg(feature = "lang-typescript")]
const TS_HIGHLIGHTS: &str = include_str!("../queries/typescript/highlights.scm");

#[cfg(feature = "lang-json")]
const JSON_HIGHLIGHTS: &str = include_str!("../queries/json/highlights.scm");

#[cfg(feature = "lang-rust")]
const RUST_HIGHLIGHTS: &str = include_str!("../queries/rust/highlights.scm");

#[cfg(feature = "lang-go")]
const GO_HIGHLIGHTS: &str = include_str!("../queries/go/highlights.scm");

#[cfg(feature = "lang-c")]
const C_HIGHLIGHTS: &str = include_str!("../queries/c/highlights.scm");

#[cfg(feature = "lang-python")]
const PYTHON_HIGHLIGHTS: &str = include_str!("../queries/python/highlights.scm");

#[cfg(feature = "lang-ruby")]
const RUBY_HIGHLIGHTS: &str = include_str!("../queries/ruby/highlights.scm");

#[cfg(feature = "lang-bash")]
const BASH_HIGHLIGHTS: &str = include_str!("../queries/bash/highlights.scm");

#[cfg(feature = "lang-lua")]
const LUA_HIGHLIGHTS: &str = include_str!("../queries/lua/highlights.scm");

#[derive(Debug, Deserialize)]
struct Theme {
    #[serde(default)]
    highlights: HashMap<String, Style>,
}

#[derive(Debug, Deserialize, Default)]
struct Style {
    #[serde(default)]
    fg: Option<String>,
    #[serde(default)]
    bg: Option<String>,
    #[serde(default)]
    bold: Option<bool>,
    #[serde(default)]
    italic: Option<bool>,
}

thread_local! {
    static RESULT: RefCell<Vec<u8>> = RefCell::new(Vec::new());
}

#[no_mangle]
pub extern "C" fn alloc(len: usize) -> *mut u8 {
    let mut buf = Vec::with_capacity(len);
    let ptr = buf.as_mut_ptr();
    std::mem::forget(buf);
    ptr
}

#[no_mangle]
pub extern "C" fn dealloc(ptr: *mut u8, len: usize) {
    if !ptr.is_null() && len > 0 {
        unsafe {
            let _ = Vec::from_raw_parts(ptr, 0, len);
        }
    }
}

#[no_mangle]
pub extern "C" fn get_result_ptr() -> *const u8 {
    RESULT.with(|r| r.borrow().as_ptr())
}

#[no_mangle]
pub extern "C" fn get_result_len() -> usize {
    RESULT.with(|r| r.borrow().len())
}

#[no_mangle]
pub extern "C" fn highlight(
    code_ptr: *const u8,
    code_len: usize,
    lang_ptr: *const u8,
    lang_len: usize,
    theme_ptr: *const u8,
    theme_len: usize,
) -> i32 {
    let code = unsafe {
        std::str::from_utf8_unchecked(std::slice::from_raw_parts(code_ptr, code_len))
    };
    let lang = unsafe {
        std::str::from_utf8_unchecked(std::slice::from_raw_parts(lang_ptr, lang_len))
    };
    let theme_json = unsafe {
        std::str::from_utf8_unchecked(std::slice::from_raw_parts(theme_ptr, theme_len))
    };

    match highlight_impl(code, lang, theme_json) {
        Ok(html) => {
            RESULT.with(|r| {
                *r.borrow_mut() = html.into_bytes();
            });
            0
        }
        Err(e) => {
            RESULT.with(|r| {
                *r.borrow_mut() = format!("Error: {}", e).into_bytes();
            });
            1
        }
    }
}

/// Returns a comma-separated list of supported languages
#[no_mangle]
pub extern "C" fn get_languages() -> i32 {
    let mut langs = Vec::new();

    #[cfg(feature = "lang-html")]
    langs.push("html");
    #[cfg(feature = "lang-css")]
    langs.push("css");
    #[cfg(feature = "lang-javascript")]
    langs.push("javascript");
    #[cfg(feature = "lang-typescript")]
    langs.push("typescript");
    #[cfg(feature = "lang-json")]
    langs.push("json");
    #[cfg(feature = "lang-rust")]
    langs.push("rust");
    #[cfg(feature = "lang-go")]
    langs.push("go");
    #[cfg(feature = "lang-c")]
    langs.push("c");
    #[cfg(feature = "lang-python")]
    langs.push("python");
    #[cfg(feature = "lang-ruby")]
    langs.push("ruby");
    #[cfg(feature = "lang-bash")]
    langs.push("bash");
    #[cfg(feature = "lang-lua")]
    langs.push("lua");

    RESULT.with(|r| {
        *r.borrow_mut() = langs.join(",").into_bytes();
    });
    0
}

fn highlight_impl(code: &str, lang: &str, theme_json: &str) -> Result<String, String> {
    let theme: Theme = serde_json::from_str(theme_json)
        .map_err(|e| format!("Failed to parse theme: {}", e))?;

    let mut config = get_language_config(lang)?;
    config.configure(HIGHLIGHT_NAMES);

    let mut highlighter = Highlighter::new();

    let highlights = highlighter
        .highlight(&config, code.as_bytes(), None, |_| None)
        .map_err(|e| format!("Highlight error: {:?}", e))?;

    let mut html = String::new();
    html.push_str("<pre><code>");

    let mut style_stack: Vec<&str> = Vec::new();

    for event in highlights {
        match event.map_err(|e| format!("Event error: {:?}", e))? {
            HighlightEvent::Source { start, end } => {
                let text = &code[start..end];
                let escaped = escape_html(text);

                if let Some(scope) = style_stack.last() {
                    if let Some(style) = theme.highlights.get(*scope) {
                        html.push_str(&format_with_style(&escaped, style));
                    } else {
                        html.push_str(&escaped);
                    }
                } else {
                    html.push_str(&escaped);
                }
            }
            HighlightEvent::HighlightStart(highlight) => {
                let scope = HIGHLIGHT_NAMES.get(highlight.0).copied().unwrap_or("");
                style_stack.push(scope);
            }
            HighlightEvent::HighlightEnd => {
                style_stack.pop();
            }
        }
    }

    html.push_str("</code></pre>");
    Ok(html)
}

fn get_language_config(lang: &str) -> Result<HighlightConfiguration, String> {
    match lang {
        #[cfg(feature = "lang-html")]
        "html" => {
            HighlightConfiguration::new(
                tree_sitter_html::LANGUAGE.into(),
                "html",
                HTML_HIGHLIGHTS,
                "",
                "",
            )
            .map_err(|e| format!("Failed to create html config: {:?}", e))
        }
        #[cfg(feature = "lang-css")]
        "css" => {
            HighlightConfiguration::new(
                tree_sitter_css::LANGUAGE.into(),
                "css",
                CSS_HIGHLIGHTS,
                "",
                "",
            )
            .map_err(|e| format!("Failed to create css config: {:?}", e))
        }
        #[cfg(feature = "lang-javascript")]
        "javascript" | "js" => {
            HighlightConfiguration::new(
                tree_sitter_javascript::LANGUAGE.into(),
                "javascript",
                JS_HIGHLIGHTS,
                "",
                "",
            )
            .map_err(|e| format!("Failed to create javascript config: {:?}", e))
        }
        #[cfg(feature = "lang-typescript")]
        "typescript" | "ts" => {
            HighlightConfiguration::new(
                tree_sitter_typescript::LANGUAGE_TYPESCRIPT.into(),
                "typescript",
                TS_HIGHLIGHTS,
                "",
                "",
            )
            .map_err(|e| format!("Failed to create typescript config: {:?}", e))
        }
        #[cfg(feature = "lang-json")]
        "json" => {
            HighlightConfiguration::new(
                tree_sitter_json::LANGUAGE.into(),
                "json",
                JSON_HIGHLIGHTS,
                "",
                "",
            )
            .map_err(|e| format!("Failed to create json config: {:?}", e))
        }
        #[cfg(feature = "lang-rust")]
        "rust" | "rs" => {
            HighlightConfiguration::new(
                tree_sitter_rust::LANGUAGE.into(),
                "rust",
                RUST_HIGHLIGHTS,
                "",
                "",
            )
            .map_err(|e| format!("Failed to create rust config: {:?}", e))
        }
        #[cfg(feature = "lang-go")]
        "go" => {
            HighlightConfiguration::new(
                tree_sitter_go::LANGUAGE.into(),
                "go",
                GO_HIGHLIGHTS,
                "",
                "",
            )
            .map_err(|e| format!("Failed to create go config: {:?}", e))
        }
        #[cfg(feature = "lang-c")]
        "c" => {
            HighlightConfiguration::new(
                tree_sitter_c::LANGUAGE.into(),
                "c",
                C_HIGHLIGHTS,
                "",
                "",
            )
            .map_err(|e| format!("Failed to create c config: {:?}", e))
        }
        #[cfg(feature = "lang-python")]
        "python" | "py" => {
            HighlightConfiguration::new(
                tree_sitter_python::LANGUAGE.into(),
                "python",
                PYTHON_HIGHLIGHTS,
                "",
                "",
            )
            .map_err(|e| format!("Failed to create python config: {:?}", e))
        }
        #[cfg(feature = "lang-ruby")]
        "ruby" | "rb" => {
            HighlightConfiguration::new(
                tree_sitter_ruby::LANGUAGE.into(),
                "ruby",
                RUBY_HIGHLIGHTS,
                "",
                "",
            )
            .map_err(|e| format!("Failed to create ruby config: {:?}", e))
        }
        #[cfg(feature = "lang-bash")]
        "bash" | "sh" => {
            HighlightConfiguration::new(
                tree_sitter_bash::LANGUAGE.into(),
                "bash",
                BASH_HIGHLIGHTS,
                "",
                "",
            )
            .map_err(|e| format!("Failed to create bash config: {:?}", e))
        }
        #[cfg(feature = "lang-lua")]
        "lua" => {
            HighlightConfiguration::new(
                tree_sitter_lua::LANGUAGE.into(),
                "lua",
                LUA_HIGHLIGHTS,
                "",
                "",
            )
            .map_err(|e| format!("Failed to create lua config: {:?}", e))
        }
        _ => Err(format!("Unknown language: {}", lang)),
    }
}

fn escape_html(text: &str) -> String {
    text.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

fn format_with_style(text: &str, style: &Style) -> String {
    let mut css = String::new();

    if let Some(fg) = &style.fg {
        css.push_str(&format!("color:{};", fg));
    }
    if let Some(bg) = &style.bg {
        css.push_str(&format!("background-color:{};", bg));
    }
    if style.bold == Some(true) {
        css.push_str("font-weight:bold;");
    }
    if style.italic == Some(true) {
        css.push_str("font-style:italic;");
    }

    if css.is_empty() {
        text.to_string()
    } else {
        format!("<span style=\"{}\">{}</span>", css, text)
    }
}

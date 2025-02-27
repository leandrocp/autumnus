//! This crate provides CSV, PSV, & TSV language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [language][language func] function to add this language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! let code = r#"
//! "Name","Age","Salary"
//! "John Doe",30,120000
//! "#;
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language(tree_sitter_csv::language_csv()).expect("Error loading CSV grammar");
//! let tree = parser.parse(code, None).unwrap();
//!
//! let code = r"
//! Name|Age|Salary
//! John Doe|30|120000
//! ";
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language(tree_sitter_csv::language_tsv()).expect("Error loading PSV grammar");
//! let tree = parser.parse(code, None).unwrap();
//!
//! let code = r"
//! Name\tAge\tSalary
//! John Doe\t30\t120000
//! ";
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language(tree_sitter_csv::language_tsv()).expect("Error loading TSV grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

extern "C" {
    fn tree_sitter_csv() -> Language;
    fn tree_sitter_psv() -> Language;
    fn tree_sitter_tsv() -> Language;
}

/// Get the tree-sitter [Language][] for this grammar.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
pub fn language_csv() -> Language {
    unsafe { tree_sitter_csv() }
}

pub fn language_psv() -> Language {
    unsafe { tree_sitter_psv() }
}

pub fn language_tsv() -> Language {
    unsafe { tree_sitter_tsv() }
}

/// The content of the [`grammar.json`][] file for CSV.
pub const GRAMMAR_JSON_CSV: &str = include_str!("../../csv/src/grammar.json");

/// The content of the [`grammar.json`][] file for PSV.
pub const GRAMMAR_JSON_PSV: &str = include_str!("../../psv/src/grammar.json");

/// The content of the [`grammar.json`][] file for TSV.
pub const GRAMMAR_JSON_TSV: &str = include_str!("../../tsv/src/grammar.json");

/// The content of the [`node-types.json`][] file for CSV.
///
/// [`node-types.json`]: https://tree-sitter.github.io/tree-sitter/using-parsers#static-node-types
pub const NODE_TYPES_CSV: &str = include_str!("../../csv/src/node-types.json");

/// The content of the [`node-types.json`][] file for PSV.
///
/// [`node-types.json`]: https://tree-sitter.github.io/tree-sitter/using-parsers#static-node-types
pub const NODE_TYPES_PSV: &str = include_str!("../../psv/src/node-types.json");

/// The content of the [`node-types.json`][] file for TSV.
///
/// [`node-types.json`]: https://tree-sitter.github.io/tree-sitter/using-parsers#static-node-types
pub const NODE_TYPES_TSV: &str = include_str!("../../tsv/src/node-types.json");

/// The syntax highlighting query for CSV.
pub const HIGHLIGHT_QUERY_CSV: &str = include_str!("../../csv/queries/highlights.scm");

/// The syntax highlighting query for PSV.
pub const HIGHLIGHT_QUERY_PSV: &str = include_str!("../../psv/queries/highlights.scm");

/// The syntax highlighting query for TSV.
pub const HIGHLIGHT_QUERY_TSV: &str = include_str!("../../tsv/queries/highlights.scm");

#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(super::language_csv())
            .expect("Error loading CSV grammar");

        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(super::language_psv())
            .expect("Error loading PSV grammar");

        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(super::language_tsv())
            .expect("Error loading TSV grammar");
    }
}

/// Convert `#lua-match?` predicates to `#match?` with Lua-to-Rust regex conversion.
pub fn convert_lua_matches(content: &str) -> String {
    let mut result = String::new();

    for line in content.lines() {
        let line = line
            .replace("#lua-match?", "#match?")
            .replace("#not-lua-match?", "#not-match?");

        if line.contains("#match?") || line.contains("#not-match?") {
            if let Some(pattern_start) = line.find('"') {
                if let Some(pattern_end) = line[pattern_start + 1..].find('"') {
                    let pattern_end = pattern_start + 1 + pattern_end;
                    let lua_pattern = &line[pattern_start + 1..pattern_end];
                    let rust_pattern = convert_lua_pattern_to_rust_regex(lua_pattern);

                    let mut new_line = line[..pattern_start + 1].to_string();
                    new_line.push_str(&rust_pattern);
                    new_line.push_str(&line[pattern_end..]);
                    result.push_str(&new_line);
                    result.push('\n');
                    continue;
                }
            }
        }

        result.push_str(&line);
        result.push('\n');
    }

    if !content.ends_with('\n') && result.ends_with('\n') {
        result.pop();
    }

    result
}

/// Convert a single Lua pattern to a Rust-compatible regex.
fn convert_lua_pattern_to_rust_regex(lua_pattern: &str) -> String {
    let mut result = String::new();
    let mut chars = lua_pattern.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '%' {
            if let Some(&next_char) = chars.peek() {
                match next_char {
                    'd' => {
                        result.push_str("\\d");
                        chars.next();
                    }
                    's' => {
                        result.push_str("\\s");
                        chars.next();
                    }
                    'l' => {
                        result.push_str("[a-z]");
                        chars.next();
                    }
                    'u' => {
                        result.push_str("[A-Z]");
                        chars.next();
                    }
                    'A' => {
                        result.push_str("[^a-zA-Z]");
                        chars.next();
                    }
                    'S' => {
                        result.push_str("\\S");
                        chars.next();
                    }
                    '.' => {
                        result.push_str("\\.");
                        chars.next();
                    }
                    '%' => {
                        result.push('%');
                        chars.next();
                    }
                    '{' => {
                        result.push_str("\\{");
                        chars.next();
                    }
                    '}' => {
                        result.push_str("\\}");
                        chars.next();
                    }
                    '$' => {
                        result.push_str("\\$");
                        chars.next();
                        if let Some(&next) = chars.peek() {
                            if next == '{' {
                                result.push('\\');
                            }
                        }
                    }
                    '^' => {
                        result.push_str("\\^");
                        chars.next();
                    }
                    _ => {
                        result.push('\\');
                        result.push(next_char);
                        chars.next();
                    }
                }
            } else {
                result.push('%');
            }
        } else if c == '\\' {
            result.push('\\');
            result.push('\\');
            if let Some(&next_char) = chars.peek() {
                result.push(next_char);
                chars.next();
            }
        } else if c == '$' {
            result.push_str("\\$");
            if let Some(&next) = chars.peek() {
                if next == '{' {
                    result.push('\\');
                }
            }
        } else if matches!(
            c,
            '.' | '*' | '+' | '?' | '(' | ')' | '[' | ']' | '{' | '}' | '|'
        ) || (c == '^' && !result.is_empty())
        {
            result.push('\\');
            result.push(c);
        } else {
            result.push(c);
        }
    }

    result
}

#[cfg(test)]
mod tests {
    use super::*;

    // -- convert_lua_pattern_to_rust_regex --

    #[test]
    fn lua_digit_class() {
        assert_eq!(convert_lua_pattern_to_rust_regex("%d"), "\\d");
    }

    #[test]
    fn lua_space_class() {
        assert_eq!(convert_lua_pattern_to_rust_regex("%s"), "\\s");
    }

    #[test]
    fn lua_non_space_class() {
        assert_eq!(convert_lua_pattern_to_rust_regex("%S"), "\\S");
    }

    #[test]
    fn lua_lowercase_class() {
        assert_eq!(convert_lua_pattern_to_rust_regex("%l"), "[a-z]");
    }

    #[test]
    fn lua_uppercase_class() {
        assert_eq!(convert_lua_pattern_to_rust_regex("%u"), "[A-Z]");
    }

    #[test]
    fn lua_non_alpha_class() {
        assert_eq!(convert_lua_pattern_to_rust_regex("%A"), "[^a-zA-Z]");
    }

    #[test]
    fn lua_escaped_dot() {
        assert_eq!(convert_lua_pattern_to_rust_regex("%."), "\\.");
    }

    #[test]
    fn lua_escaped_percent() {
        assert_eq!(convert_lua_pattern_to_rust_regex("%%"), "%");
    }

    #[test]
    fn lua_escaped_braces() {
        assert_eq!(convert_lua_pattern_to_rust_regex("%{%}"), "\\{\\}");
    }

    #[test]
    fn lua_escaped_dollar() {
        assert_eq!(convert_lua_pattern_to_rust_regex("%$"), "\\$");
    }

    #[test]
    fn lua_escaped_caret() {
        assert_eq!(convert_lua_pattern_to_rust_regex("%^"), "\\^");
    }

    #[test]
    fn lua_unknown_escape_passes_through() {
        assert_eq!(convert_lua_pattern_to_rust_regex("%w"), "\\w");
    }

    #[test]
    fn trailing_percent_preserved() {
        assert_eq!(convert_lua_pattern_to_rust_regex("%"), "%");
    }

    #[test]
    fn regex_metachar_dot_escaped() {
        assert_eq!(convert_lua_pattern_to_rust_regex("."), "\\.");
    }

    #[test]
    fn regex_metachar_star_escaped() {
        assert_eq!(convert_lua_pattern_to_rust_regex("*"), "\\*");
    }

    #[test]
    fn regex_metachar_plus_escaped() {
        assert_eq!(convert_lua_pattern_to_rust_regex("+"), "\\+");
    }

    #[test]
    fn regex_metachar_parens_escaped() {
        assert_eq!(convert_lua_pattern_to_rust_regex("()"), "\\(\\)");
    }

    #[test]
    fn regex_metachar_brackets_escaped() {
        assert_eq!(convert_lua_pattern_to_rust_regex("[]"), "\\[\\]");
    }

    #[test]
    fn regex_metachar_pipe_escaped() {
        assert_eq!(convert_lua_pattern_to_rust_regex("|"), "\\|");
    }

    #[test]
    fn bare_dollar_escaped() {
        assert_eq!(convert_lua_pattern_to_rust_regex("$"), "\\$");
    }

    #[test]
    fn caret_at_start_preserved() {
        assert_eq!(convert_lua_pattern_to_rust_regex("^foo"), "^foo");
    }

    #[test]
    fn caret_mid_string_escaped() {
        assert_eq!(convert_lua_pattern_to_rust_regex("a^b"), "a\\^b");
    }

    #[test]
    fn backslash_doubled() {
        assert_eq!(convert_lua_pattern_to_rust_regex("\\n"), "\\\\n");
    }

    #[test]
    fn complex_pattern_uppercase_start() {
        assert_eq!(convert_lua_pattern_to_rust_regex("^%u"), "^[A-Z]");
    }

    #[test]
    fn mixed_pattern() {
        assert_eq!(
            convert_lua_pattern_to_rust_regex("^%u%l+%d"),
            "^[A-Z][a-z]\\+\\d"
        );
    }

    // -- convert_lua_matches (full line processing) --

    #[test]
    fn lua_match_predicate_converted() {
        let input = r#"((identifier) @var (#lua-match? @var "^%u"))"#;
        let expected = r#"((identifier) @var (#match? @var "^[A-Z]"))"#;
        assert_eq!(convert_lua_matches(input), expected);
    }

    #[test]
    fn not_lua_match_predicate_converted() {
        let input = r#"((identifier) @var (#not-lua-match? @var "^%d"))"#;
        let expected = r#"((identifier) @var (#not-match? @var "^\d"))"#;
        assert_eq!(convert_lua_matches(input), expected);
    }

    #[test]
    fn non_matching_line_unchanged() {
        let input = "(identifier) @variable";
        assert_eq!(convert_lua_matches(input), input);
    }

    #[test]
    fn multiline_input() {
        let input = "(identifier) @var\n(#lua-match? @var \"^%u\")\n(string) @str";
        let output = convert_lua_matches(input);
        assert!(output.contains("(#match? @var \"^[A-Z]\")"));
        assert!(output.contains("(identifier) @var"));
        assert!(output.contains("(string) @str"));
    }

    #[test]
    fn preserves_no_trailing_newline() {
        let input = "no newline at end";
        let output = convert_lua_matches(input);
        assert!(!output.ends_with('\n'));
    }

    #[test]
    fn preserves_trailing_newline() {
        let input = "has newline\n";
        let output = convert_lua_matches(input);
        assert!(output.ends_with('\n'));
    }
}

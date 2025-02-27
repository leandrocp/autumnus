#include <tree_sitter/parser.h>
#include <wctype.h>
#include <stdio.h>

enum TokenType {
  COMMENT
};

void *tree_sitter_glimmer_external_scanner_create() { return NULL; }
void tree_sitter_glimmer_external_scanner_destroy(void *p) {}
void tree_sitter_glimmer_external_scanner_reset(void *p) {}
unsigned tree_sitter_glimmer_external_scanner_serialize(void *p, char *buffer) { return 0; }
void tree_sitter_glimmer_external_scanner_deserialize(void *p, const char *b, unsigned n) {}

static void advance(TSLexer *lexer) { lexer->advance(lexer, false); }

static bool scan_html_comment(TSLexer *lexer) {
    // Ensure the next characters are `!--`
    if (lexer->lookahead != '!') return false;
    advance(lexer);
    if (lexer->lookahead != '-') return false;
    advance(lexer);
    if (lexer->lookahead != '-') return false;
    advance(lexer);

    // Consume characters until we read `-->`
    unsigned dashes = 0;
    while (lexer->lookahead) {
        switch (lexer->lookahead) {
            case '-':
                ++dashes;
                break;
            case '>':
                if (dashes >= 2) {
                    lexer->result_symbol = COMMENT;
                    advance(lexer);
                    lexer->mark_end(lexer);
                    return true;
                }
            default:
                dashes = 0;
        }
        advance(lexer);
    }

    return false;
}

static bool scan_multi_line_handlebars_comment(TSLexer *lexer) {
    // Ensure the next character is `-`
    if (lexer->lookahead != '-') return false;

    // Consume characters until we read `--}}`
    unsigned dashes = 0;
    unsigned brackets = 0;
    while (lexer->lookahead) {
        switch (lexer->lookahead) {
            case '-':
                ++dashes;
                break;
            case '}':
                ++brackets;
                if (dashes >= 2 && brackets == 2) {
                    lexer->result_symbol = COMMENT;
                    advance(lexer);
                    lexer->mark_end(lexer);
                    return true;
                } else {
                    break;
                }
            default:
                dashes = 0;
                brackets = 0;
        }
        advance(lexer);
    }

    return false;
}

static bool scan_single_line_handlebars_comment(TSLexer *lexer) {
    // Consume characters until we read `}}`
    unsigned brackets = 0;
    while (lexer->lookahead) {
        switch (lexer->lookahead) {
            case '}':
                ++brackets;
                if (brackets == 2) {
                    lexer->result_symbol = COMMENT;
                    advance(lexer);
                    lexer->mark_end(lexer);
                    return true;
                } else {
                    break;
                }
            default:
                brackets = 0;
        }
        advance(lexer);
    }

    return false;
}


static bool scan_handlebars_comment(TSLexer *lexer) {
    // Ensure the next characters are `{!`
    if (lexer->lookahead != '{') return false;
    advance(lexer);
    if (lexer->lookahead != '!') return false;
    advance(lexer);

    // Handle either multi-line or single-line comment
    switch (lexer->lookahead) {
        // Multi-Line Comment
        case '-':
            advance(lexer);

            return scan_multi_line_handlebars_comment(lexer);

        // Single-Line Comment
        default:
            advance(lexer);

            return scan_single_line_handlebars_comment(lexer);
    }

    return false;
}

bool tree_sitter_glimmer_external_scanner_scan(void *payload, TSLexer *lexer,
                                                  const bool *valid_symbols) {
    // Eat whitespace
    while (iswspace(lexer->lookahead)) {
      lexer->advance(lexer, true);
    }

    if (valid_symbols[COMMENT]) {
        switch (lexer->lookahead) {
            case '<':
                lexer->mark_end(lexer);
                advance(lexer);

                return scan_html_comment(lexer);

            case '{':
                lexer->mark_end(lexer);
                advance(lexer);

                return scan_handlebars_comment(lexer);

            default:
                return false;

      }
  }

  return false;
}

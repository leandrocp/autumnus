/*
 * shamelessly ripped from tree-sitter-jsdoc scanner, which is close to what we need.
 * javadoc inline tags can span multiple lines and we also don't emit 0-byte tokens.
 */
#include "tree_sitter/parser.h"

enum TokenType { INLINE_DESCRIPTION_TOKEN };

void *tree_sitter_javadoc_external_scanner_create() { return NULL; }

void tree_sitter_javadoc_external_scanner_destroy(void *payload UNUSED) {}

unsigned tree_sitter_javadoc_external_scanner_serialize(void *payload UNUSED, char *buffer UNUSED) { return 0; }

void tree_sitter_javadoc_external_scanner_deserialize(void *payload UNUSED, const char *buffer UNUSED,
                                                      unsigned length UNUSED) {}

// Scan to the next balanced `}` character.
static bool scan_for_inline_description(TSLexer *lexer) {
    int stack = 0;
    int seen = 0;
    while (true) {
        if (lexer->eof(lexer)) {
            return false;
        }
        switch (lexer->lookahead) {
            case '{':
                stack++;
                seen++;
                break;
            case '}':
                stack--;
                if (stack == -1) {
                    return seen > 0;
                }
                break;
            case '\0':
                // Something's gone wrong.
                return false;
            default:
                seen++;
        }
        lexer->advance(lexer, false);
    }
}

bool tree_sitter_javadoc_external_scanner_scan(void *payload UNUSED, TSLexer *lexer, const bool *valid_symbols) {
    if (valid_symbols[INLINE_DESCRIPTION_TOKEN] && scan_for_inline_description(lexer)) {
        lexer->result_symbol = INLINE_DESCRIPTION_TOKEN;
        lexer->mark_end(lexer);
        return true;
    }

    return false;
}

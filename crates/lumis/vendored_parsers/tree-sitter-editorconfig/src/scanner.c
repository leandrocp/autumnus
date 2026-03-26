#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#include "tree_sitter/parser.h"

enum TokenType {
    END_OF_FILE,
    INTEGER_RANGE_START,
};

static inline bool is_digit(int32_t character) {
    return character >= '0' && character <= '9';
}

static inline bool parse_integer_range(TSLexer *lexer) {
    int32_t previous = lexer->lookahead;
    lexer->advance(lexer, false);

    if (!is_digit(previous) && !(previous == '-' && is_digit(lexer->lookahead))) {
        return false;
    }

    while (is_digit(lexer->lookahead)) {
        lexer->advance(lexer, false);
    }
    // Integer ends here, but keep parsing to see if its a valid integer range
    lexer->mark_end(lexer);

    previous = lexer->lookahead;
    lexer->advance(lexer, false);

    if (!(previous == '.' && lexer->lookahead == '.')) {
        return false;
    }

    lexer->result_symbol = INTEGER_RANGE_START;
    return true;
}

bool tree_sitter_editorconfig_external_scanner_scan(
    void *payload, TSLexer *lexer, const bool *valid_symbols) {
    if (valid_symbols[END_OF_FILE] && valid_symbols[INTEGER_RANGE_START]) {
        // Tree-sitter is in error correction mode, don't parse anything
        return false;
    }

    if (valid_symbols[END_OF_FILE] && lexer->eof(lexer)) {
        lexer->advance(lexer, false);
        lexer->mark_end(lexer);
        lexer->result_symbol = END_OF_FILE;
        return true;
    }

    if (valid_symbols[INTEGER_RANGE_START]) {
        return parse_integer_range(lexer);
    }

    return false;
}

void *tree_sitter_editorconfig_external_scanner_create(void) {
    return NULL;
}

void tree_sitter_editorconfig_external_scanner_destroy(void *payload) {}

unsigned tree_sitter_editorconfig_external_scanner_serialize(void *payload, char *buffer) {
    return 0;
}

void tree_sitter_editorconfig_external_scanner_deserialize(
    void *payload, const char *buffer, unsigned length) {}

#include "tree_sitter/parser.h"

enum TokenType {
    TOKEN_TYPE_RAW_CHAR,
    TOKEN_TYPE_RAW_END,
    TOKEN_TYPE_EOF,
};

static inline bool skip_white_space(TSLexer *lexer, bool skip_newline);
static inline bool is_white_space(int32_t ch);
static inline bool is_newline(int32_t ch);
static inline bool parse_sequence_impl(TSLexer *lexer, char const *sequence, uintptr_t len);
#define parse_sequence(lexer, sequence) parse_sequence_impl(lexer, sequence, sizeof(sequence) - 1)

static inline void skip_char(TSLexer *lexer, char ch);

static inline void advance(TSLexer *lexer) {
    lexer->advance(lexer, false);
}

bool tree_sitter_jinja_inline_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
    if(lexer->eof(lexer)) {
        lexer->result_symbol = TOKEN_TYPE_EOF;
        return true;
    }

    if(valid_symbols[TOKEN_TYPE_RAW_CHAR] || valid_symbols[TOKEN_TYPE_RAW_END]) {
        if(is_newline(lexer->lookahead)) {
            advance(lexer);
            if(lexer->lookahead == '#') {
                advance(lexer);
                skip_white_space(lexer, false);
                if(parse_sequence(lexer, "raw")) {
                    skip_white_space(lexer, false);
                    if(is_newline(lexer->lookahead)) {
                        advance(lexer);
                        lexer->result_symbol = TOKEN_TYPE_RAW_END;
                        return true;
                    }
                }
            }
        }

        lexer->result_symbol = TOKEN_TYPE_RAW_CHAR;
        return true;
    }

    return false;
}

void *tree_sitter_jinja_inline_external_scanner_create() {
    return NULL;
}

void tree_sitter_jinja_inline_external_scanner_destroy(void *payload) {
}

unsigned tree_sitter_jinja_inline_external_scanner_serialize(void *payload, char *buffer) {
    return 0;
}

void tree_sitter_jinja_inline_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
}

static inline bool skip_white_space(TSLexer *lexer, bool skip_newline) {
    bool has_skiped = false;
    while(is_white_space(lexer->lookahead) ||
          (skip_newline && is_newline(lexer->lookahead))) {
        lexer->advance(lexer, false);
        has_skiped = true;
    }

    return has_skiped;
}

static inline bool is_white_space(int32_t ch) {
    return ch == ' ' || ch == '\t';
}

static inline bool is_newline(int32_t ch) {
    return ch == '\r' || ch == '\n';
}

static inline bool parse_sequence_impl(TSLexer *lexer, char const *sequence, uintptr_t len) {
    uintptr_t pos = 0;

    while(pos < len) {
        if(lexer->lookahead != sequence[pos]) {
            return false;
        }

        lexer->advance(lexer, false);
        ++pos;
    }

    return true;
}

static inline void skip_char(TSLexer *lexer, char ch) {
    if(lexer->lookahead == ch) {
        lexer->advance(lexer, false);
    }
}

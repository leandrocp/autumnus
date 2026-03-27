#include <string.h>
#include "tree_sitter/alloc.h"
#include "tree_sitter/parser.h"

enum TokenType {
    TOKEN_TYPE_RAW_START,
    TOKEN_TYPE_RAW_CHAR,
    TOKEN_TYPE_RAW_END,
    TOKEN_INLINE_WORDS,
};

typedef struct TokenStack {
    char ch[1024];
    int32_t pos;
} TokenStack;

static inline TokenStack token_stack_new() {
    TokenStack a;
    memset(&a, 0, sizeof(a));
    return a;
}

static inline bool token_stack_empty(TokenStack *const self) {
    return self->pos == 0;
}

static inline bool token_stack_push(TokenStack *const self, char ch) {
    if(self->pos == 1024) {
        return false;
    }

    self->ch[self->pos++] = ch;

    return true;
}

static inline bool token_stack_pop(TokenStack *const self) {
    if(self->pos == 0) {
        return false;
    }

    self->pos -= 1;

    return true;
}

static inline char token_stack_top(TokenStack *const self) {
    if(self->pos == 0) {
        return -1;
    }

    return self->ch[self->pos - 1];
}

static inline bool skip_white_space(TSLexer *lexer, bool skip_newline);
static inline bool is_white_space(int32_t ch);
static inline bool is_newline(int32_t ch);
static inline bool parse_sequence_impl(TSLexer *lexer, char const *sequence, uintptr_t len);
#define parse_sequence(lexer, sequence) parse_sequence_impl(lexer, sequence, sizeof(sequence) - 1)

typedef struct Scanner {
    /// is {% raw %}
    bool is_block_raw;
} Scanner;

static inline void skip_char(TSLexer *lexer, char ch);
#define is_matching_raw valid_symbols[TOKEN_TYPE_RAW_END]

bool tree_sitter_jinja_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
    if(lexer->eof(lexer)) {
        return false;
    }
    Scanner *s = (Scanner *)payload;

    if(valid_symbols[TOKEN_INLINE_WORDS]) {
        lexer->result_symbol = TOKEN_INLINE_WORDS;
        TokenStack s = token_stack_new();
        while(true) {
            if(lexer->eof(lexer)) {
                return true;
            }
            if(is_newline(lexer->lookahead)) {
                if(token_stack_empty(&s)) {
                    break;
                }
            }
            switch(lexer->lookahead) {
                case '(':
                case '[':
                case '{': {
                    if(!token_stack_push(&s, lexer->lookahead)) {
                        return true;
                    }
                    break;
                }
                case ')': {
                    if(token_stack_top(&s) == '(') {
                        token_stack_pop(&s);
                    }
                    break;
                }
                case ']': {
                    if(token_stack_top(&s) == '[') {
                        token_stack_pop(&s);
                    }
                    break;
                }
                case '}': {
                    if(token_stack_top(&s) == '{') {
                        token_stack_pop(&s);
                    }
                    break;
                }
            }
            lexer->advance(lexer, false);
        }
        return true;
    }

    if(valid_symbols[TOKEN_TYPE_RAW_START]) {
        switch(lexer->lookahead) {
            case '{': {
                if(parse_sequence(lexer, "{%")) {
                    skip_char(lexer, '-');
                    skip_white_space(lexer, true);
                    if(parse_sequence(lexer, "raw")) {
                        skip_white_space(lexer, true);
                        skip_char(lexer, '-');
                        if(parse_sequence(lexer, "%}")) {
                            lexer->result_symbol = TOKEN_TYPE_RAW_START;
                            s->is_block_raw = true;
                            return true;
                        }
                    }
                }
                break;
            }
            case '#': {
                lexer->advance(lexer, false);
                if(lexer->lookahead == ' ') {
                    lexer->advance(lexer, false);
                    if(parse_sequence(lexer, "raw")) {
                        skip_white_space(lexer, false);
                        if(is_newline(lexer->lookahead)) {
                            lexer->advance(lexer, false);
                            lexer->result_symbol = TOKEN_TYPE_RAW_START;
                            s->is_block_raw = false;
                            return true;
                        }
                    }
                }
                break;
            }
        }
        return false;
    }

    if(valid_symbols[TOKEN_TYPE_RAW_CHAR]) {
        lexer->result_symbol = TOKEN_TYPE_RAW_CHAR;
        switch(lexer->lookahead) {
            case '{': {
                if(parse_sequence(lexer, "{%")) {
                    skip_char(lexer, '-');
                    skip_white_space(lexer, true);
                    if(parse_sequence(lexer, "endraw")) {
                        skip_white_space(lexer, true);
                        skip_char(lexer, '-');
                        if(parse_sequence(lexer, "%}") && is_matching_raw && s->is_block_raw) {
                            lexer->result_symbol = TOKEN_TYPE_RAW_END;
                            s->is_block_raw = false;
                            return true;
                        }
                    }
                }
                break;
            }
            case '#': {
                lexer->advance(lexer, false);
                if(lexer->lookahead == ' ') {
                    lexer->advance(lexer, false);
                    if(parse_sequence(lexer, "endraw")) {
                        skip_white_space(lexer, false);
                        if(is_newline(lexer->lookahead) && is_matching_raw && !s->is_block_raw) {
                            lexer->result_symbol = TOKEN_TYPE_RAW_END;
                            return true;
                        }
                    }
                }
                break;
                default: {
                    lexer->advance(lexer, false);
                }
            }
        }

        return true;
    }

    return false;
}

void *tree_sitter_jinja_external_scanner_create() {
    return ts_calloc(1, sizeof(Scanner));
}

void tree_sitter_jinja_external_scanner_destroy(void *payload) {
    ts_free(payload);
}

unsigned tree_sitter_jinja_external_scanner_serialize(void *payload, char *buffer) {
    memcpy(buffer, payload, sizeof(Scanner));
    return sizeof(Scanner);
}

void tree_sitter_jinja_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
    if(buffer == NULL) {
        return;
    }
    memcpy(payload, buffer, sizeof(Scanner));
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

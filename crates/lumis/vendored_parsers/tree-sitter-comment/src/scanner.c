#include <tree_sitter/parser.h>

#include "tree_sitter_comment/parser.c"
#include "tree_sitter_comment/tokens.h"

void* tree_sitter_comment_external_scanner_create()
{
  return NULL;
}

void tree_sitter_comment_external_scanner_destroy(void* payload)
{
}

unsigned tree_sitter_comment_external_scanner_serialize(
    void* payload,
    char* buffer)
{
  return 0;
}

void tree_sitter_comment_external_scanner_deserialize(
    void* payload,
    const char* buffer,
    unsigned length)
{
}

bool tree_sitter_comment_external_scanner_scan(
    void* payload,
    TSLexer* lexer,
    const bool* valid_symbols)
{
  return parse(lexer, valid_symbols);
}

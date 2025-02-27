#include "tree_sitter/parser.h"

#if defined(__GNUC__) || defined(__clang__)
#pragma GCC diagnostic ignored "-Wmissing-field-initializers"
#endif

#define LANGUAGE_VERSION 14
#define STATE_COUNT 42
#define LARGE_STATE_COUNT 31
#define SYMBOL_COUNT 19
#define ALIAS_COUNT 0
#define TOKEN_COUNT 10
#define EXTERNAL_TOKEN_COUNT 0
#define FIELD_COUNT 0
#define MAX_ALIAS_SEQUENCE_LENGTH 4
#define PRODUCTION_ID_COUNT 1

enum ts_symbol_identifiers {
  aux_sym_document_token1 = 1,
  anon_sym_TAB = 2,
  sym_text = 3,
  aux_sym_number_token1 = 4,
  aux_sym_number_token2 = 5,
  aux_sym_float_token1 = 6,
  aux_sym_float_token2 = 7,
  anon_sym_true = 8,
  anon_sym_false = 9,
  sym_document = 10,
  sym_row = 11,
  sym_field = 12,
  sym_number = 13,
  sym_float = 14,
  sym_boolean = 15,
  aux_sym_document_repeat1 = 16,
  aux_sym_row_repeat1 = 17,
  aux_sym_row_repeat2 = 18,
};

static const char * const ts_symbol_names[] = {
  [ts_builtin_sym_end] = "end",
  [aux_sym_document_token1] = "document_token1",
  [anon_sym_TAB] = "\t",
  [sym_text] = "text",
  [aux_sym_number_token1] = "number_token1",
  [aux_sym_number_token2] = "number_token2",
  [aux_sym_float_token1] = "float_token1",
  [aux_sym_float_token2] = "float_token2",
  [anon_sym_true] = "true",
  [anon_sym_false] = "false",
  [sym_document] = "document",
  [sym_row] = "row",
  [sym_field] = "field",
  [sym_number] = "number",
  [sym_float] = "float",
  [sym_boolean] = "boolean",
  [aux_sym_document_repeat1] = "document_repeat1",
  [aux_sym_row_repeat1] = "row_repeat1",
  [aux_sym_row_repeat2] = "row_repeat2",
};

static const TSSymbol ts_symbol_map[] = {
  [ts_builtin_sym_end] = ts_builtin_sym_end,
  [aux_sym_document_token1] = aux_sym_document_token1,
  [anon_sym_TAB] = anon_sym_TAB,
  [sym_text] = sym_text,
  [aux_sym_number_token1] = aux_sym_number_token1,
  [aux_sym_number_token2] = aux_sym_number_token2,
  [aux_sym_float_token1] = aux_sym_float_token1,
  [aux_sym_float_token2] = aux_sym_float_token2,
  [anon_sym_true] = anon_sym_true,
  [anon_sym_false] = anon_sym_false,
  [sym_document] = sym_document,
  [sym_row] = sym_row,
  [sym_field] = sym_field,
  [sym_number] = sym_number,
  [sym_float] = sym_float,
  [sym_boolean] = sym_boolean,
  [aux_sym_document_repeat1] = aux_sym_document_repeat1,
  [aux_sym_row_repeat1] = aux_sym_row_repeat1,
  [aux_sym_row_repeat2] = aux_sym_row_repeat2,
};

static const TSSymbolMetadata ts_symbol_metadata[] = {
  [ts_builtin_sym_end] = {
    .visible = false,
    .named = true,
  },
  [aux_sym_document_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_TAB] = {
    .visible = true,
    .named = false,
  },
  [sym_text] = {
    .visible = true,
    .named = true,
  },
  [aux_sym_number_token1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_number_token2] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_float_token1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_float_token2] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_true] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_false] = {
    .visible = true,
    .named = false,
  },
  [sym_document] = {
    .visible = true,
    .named = true,
  },
  [sym_row] = {
    .visible = true,
    .named = true,
  },
  [sym_field] = {
    .visible = true,
    .named = true,
  },
  [sym_number] = {
    .visible = true,
    .named = true,
  },
  [sym_float] = {
    .visible = true,
    .named = true,
  },
  [sym_boolean] = {
    .visible = true,
    .named = true,
  },
  [aux_sym_document_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_row_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_row_repeat2] = {
    .visible = false,
    .named = false,
  },
};

static const TSSymbol ts_alias_sequences[PRODUCTION_ID_COUNT][MAX_ALIAS_SEQUENCE_LENGTH] = {
  [0] = {0},
};

static const uint16_t ts_non_terminal_alias_map[] = {
  0,
};

static const TSStateId ts_primary_state_ids[STATE_COUNT] = {
  [0] = 0,
  [1] = 1,
  [2] = 2,
  [3] = 3,
  [4] = 4,
  [5] = 5,
  [6] = 6,
  [7] = 7,
  [8] = 8,
  [9] = 9,
  [10] = 8,
  [11] = 11,
  [12] = 3,
  [13] = 4,
  [14] = 5,
  [15] = 15,
  [16] = 7,
  [17] = 17,
  [18] = 17,
  [19] = 15,
  [20] = 11,
  [21] = 9,
  [22] = 22,
  [23] = 22,
  [24] = 24,
  [25] = 24,
  [26] = 26,
  [27] = 27,
  [28] = 28,
  [29] = 29,
  [30] = 30,
  [31] = 26,
  [32] = 27,
  [33] = 29,
  [34] = 34,
  [35] = 30,
  [36] = 28,
  [37] = 24,
  [38] = 38,
  [39] = 39,
  [40] = 40,
  [41] = 41,
};

static bool ts_lex(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (eof) ADVANCE(9);
      ADVANCE_MAP(
        '\t', 12,
        '\n', 10,
        '\r', 10,
        '"', 1,
        '.', 4,
        '0', 22,
        'f', 2,
        't', 3,
      );
      if (lookahead == 0x0b ||
          lookahead == '\f' ||
          lookahead == ' ') SKIP(0);
      if (('1' <= lookahead && lookahead <= '9')) ADVANCE(23);
      if (lookahead != 0) ADVANCE(6);
      END_STATE();
    case 1:
      if (lookahead == '"') ADVANCE(14);
      if (lookahead != 0) ADVANCE(1);
      END_STATE();
    case 2:
      if (lookahead == 'a') ADVANCE(17);
      if (lookahead != 0 &&
          lookahead != '\t' &&
          lookahead != '\n' &&
          lookahead != '\r' &&
          lookahead != ' ' &&
          lookahead != '"') ADVANCE(21);
      END_STATE();
    case 3:
      if (lookahead == 'r') ADVANCE(19);
      if (lookahead != 0 &&
          lookahead != '\t' &&
          lookahead != '\n' &&
          lookahead != '\r' &&
          lookahead != ' ' &&
          lookahead != '"') ADVANCE(21);
      END_STATE();
    case 4:
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(20);
      if (lookahead != 0 &&
          lookahead != '\t' &&
          lookahead != '\n' &&
          lookahead != '\r' &&
          lookahead != ' ' &&
          lookahead != '"') ADVANCE(21);
      END_STATE();
    case 5:
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'F') ||
          ('a' <= lookahead && lookahead <= 'f')) ADVANCE(24);
      END_STATE();
    case 6:
      if (lookahead != 0 &&
          lookahead != '\t' &&
          lookahead != '\n' &&
          lookahead != '\r' &&
          lookahead != ' ' &&
          lookahead != '"') ADVANCE(21);
      END_STATE();
    case 7:
      if (eof) ADVANCE(9);
      if (lookahead == '\t') ADVANCE(13);
      if (lookahead == '"') ADVANCE(1);
      if (lookahead == '.') ADVANCE(4);
      if (lookahead == '0') ADVANCE(22);
      if (lookahead == 'f') ADVANCE(2);
      if (lookahead == 't') ADVANCE(3);
      if (('\n' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(7);
      if (('1' <= lookahead && lookahead <= '9')) ADVANCE(23);
      if (lookahead != 0) ADVANCE(6);
      END_STATE();
    case 8:
      if (eof) ADVANCE(9);
      if (lookahead == '\n') ADVANCE(11);
      if (lookahead == '\r') ADVANCE(11);
      if (('\t' <= lookahead && lookahead <= '\f') ||
          lookahead == ' ') SKIP(8);
      END_STATE();
    case 9:
      ACCEPT_TOKEN(ts_builtin_sym_end);
      END_STATE();
    case 10:
      ACCEPT_TOKEN(aux_sym_document_token1);
      if (lookahead == '\t') ADVANCE(12);
      if (lookahead == '\n') ADVANCE(10);
      if (lookahead == '\r') ADVANCE(10);
      END_STATE();
    case 11:
      ACCEPT_TOKEN(aux_sym_document_token1);
      if (lookahead == '\n') ADVANCE(11);
      if (lookahead == '\r') ADVANCE(11);
      END_STATE();
    case 12:
      ACCEPT_TOKEN(anon_sym_TAB);
      if (lookahead == '\t') ADVANCE(12);
      if (lookahead == '\n') ADVANCE(10);
      if (lookahead == '\r') ADVANCE(10);
      END_STATE();
    case 13:
      ACCEPT_TOKEN(anon_sym_TAB);
      if (lookahead == '\t') ADVANCE(13);
      END_STATE();
    case 14:
      ACCEPT_TOKEN(sym_text);
      if (lookahead == '"') ADVANCE(1);
      END_STATE();
    case 15:
      ACCEPT_TOKEN(sym_text);
      if (lookahead == 'e') ADVANCE(27);
      if (lookahead != 0 &&
          lookahead != '\t' &&
          lookahead != '\n' &&
          lookahead != '\r' &&
          lookahead != ' ' &&
          lookahead != '"') ADVANCE(21);
      END_STATE();
    case 16:
      ACCEPT_TOKEN(sym_text);
      if (lookahead == 'e') ADVANCE(28);
      if (lookahead != 0 &&
          lookahead != '\t' &&
          lookahead != '\n' &&
          lookahead != '\r' &&
          lookahead != ' ' &&
          lookahead != '"') ADVANCE(21);
      END_STATE();
    case 17:
      ACCEPT_TOKEN(sym_text);
      if (lookahead == 'l') ADVANCE(18);
      if (lookahead != 0 &&
          lookahead != '\t' &&
          lookahead != '\n' &&
          lookahead != '\r' &&
          lookahead != ' ' &&
          lookahead != '"') ADVANCE(21);
      END_STATE();
    case 18:
      ACCEPT_TOKEN(sym_text);
      if (lookahead == 's') ADVANCE(16);
      if (lookahead != 0 &&
          lookahead != '\t' &&
          lookahead != '\n' &&
          lookahead != '\r' &&
          lookahead != ' ' &&
          lookahead != '"') ADVANCE(21);
      END_STATE();
    case 19:
      ACCEPT_TOKEN(sym_text);
      if (lookahead == 'u') ADVANCE(15);
      if (lookahead != 0 &&
          lookahead != '\t' &&
          lookahead != '\n' &&
          lookahead != '\r' &&
          lookahead != ' ' &&
          lookahead != '"') ADVANCE(21);
      END_STATE();
    case 20:
      ACCEPT_TOKEN(sym_text);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(20);
      if (lookahead != 0 &&
          lookahead != '\t' &&
          lookahead != '\n' &&
          lookahead != '\r' &&
          lookahead != ' ' &&
          lookahead != '"') ADVANCE(21);
      END_STATE();
    case 21:
      ACCEPT_TOKEN(sym_text);
      if (lookahead != 0 &&
          lookahead != '\t' &&
          lookahead != '\n' &&
          lookahead != '\r' &&
          lookahead != ' ' &&
          lookahead != '"') ADVANCE(21);
      END_STATE();
    case 22:
      ACCEPT_TOKEN(aux_sym_number_token1);
      if (lookahead == '.') ADVANCE(26);
      if (lookahead == 'X' ||
          lookahead == 'x') ADVANCE(5);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(23);
      END_STATE();
    case 23:
      ACCEPT_TOKEN(aux_sym_number_token1);
      if (lookahead == '.') ADVANCE(26);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(23);
      END_STATE();
    case 24:
      ACCEPT_TOKEN(aux_sym_number_token2);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'F') ||
          ('a' <= lookahead && lookahead <= 'f')) ADVANCE(24);
      END_STATE();
    case 25:
      ACCEPT_TOKEN(aux_sym_float_token1);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(25);
      END_STATE();
    case 26:
      ACCEPT_TOKEN(aux_sym_float_token2);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(25);
      END_STATE();
    case 27:
      ACCEPT_TOKEN(anon_sym_true);
      if (lookahead != 0 &&
          lookahead != '\t' &&
          lookahead != '\n' &&
          lookahead != '\r' &&
          lookahead != ' ' &&
          lookahead != '"') ADVANCE(21);
      END_STATE();
    case 28:
      ACCEPT_TOKEN(anon_sym_false);
      if (lookahead != 0 &&
          lookahead != '\t' &&
          lookahead != '\n' &&
          lookahead != '\r' &&
          lookahead != ' ' &&
          lookahead != '"') ADVANCE(21);
      END_STATE();
    default:
      return false;
  }
}

static const TSLexMode ts_lex_modes[STATE_COUNT] = {
  [0] = {.lex_state = 0},
  [1] = {.lex_state = 7},
  [2] = {.lex_state = 7},
  [3] = {.lex_state = 0},
  [4] = {.lex_state = 0},
  [5] = {.lex_state = 0},
  [6] = {.lex_state = 7},
  [7] = {.lex_state = 0},
  [8] = {.lex_state = 0},
  [9] = {.lex_state = 0},
  [10] = {.lex_state = 0},
  [11] = {.lex_state = 0},
  [12] = {.lex_state = 0},
  [13] = {.lex_state = 0},
  [14] = {.lex_state = 0},
  [15] = {.lex_state = 0},
  [16] = {.lex_state = 0},
  [17] = {.lex_state = 0},
  [18] = {.lex_state = 0},
  [19] = {.lex_state = 0},
  [20] = {.lex_state = 0},
  [21] = {.lex_state = 0},
  [22] = {.lex_state = 7},
  [23] = {.lex_state = 7},
  [24] = {.lex_state = 0},
  [25] = {.lex_state = 0},
  [26] = {.lex_state = 0},
  [27] = {.lex_state = 0},
  [28] = {.lex_state = 0},
  [29] = {.lex_state = 0},
  [30] = {.lex_state = 0},
  [31] = {.lex_state = 0},
  [32] = {.lex_state = 0},
  [33] = {.lex_state = 0},
  [34] = {.lex_state = 7},
  [35] = {.lex_state = 0},
  [36] = {.lex_state = 0},
  [37] = {.lex_state = 7},
  [38] = {.lex_state = 8},
  [39] = {.lex_state = 8},
  [40] = {.lex_state = 8},
  [41] = {.lex_state = 0},
};

static const uint16_t ts_parse_table[LARGE_STATE_COUNT][SYMBOL_COUNT] = {
  [0] = {
    [ts_builtin_sym_end] = ACTIONS(1),
    [aux_sym_document_token1] = ACTIONS(1),
    [anon_sym_TAB] = ACTIONS(1),
    [sym_text] = ACTIONS(1),
    [aux_sym_number_token1] = ACTIONS(1),
    [aux_sym_number_token2] = ACTIONS(1),
    [aux_sym_float_token1] = ACTIONS(1),
    [aux_sym_float_token2] = ACTIONS(1),
    [anon_sym_true] = ACTIONS(1),
    [anon_sym_false] = ACTIONS(1),
  },
  [1] = {
    [sym_document] = STATE(41),
    [sym_row] = STATE(38),
    [sym_field] = STATE(8),
    [sym_number] = STATE(30),
    [sym_float] = STATE(30),
    [sym_boolean] = STATE(30),
    [aux_sym_document_repeat1] = STATE(2),
    [aux_sym_row_repeat1] = STATE(9),
    [ts_builtin_sym_end] = ACTIONS(3),
    [anon_sym_TAB] = ACTIONS(5),
    [sym_text] = ACTIONS(7),
    [aux_sym_number_token1] = ACTIONS(9),
    [aux_sym_number_token2] = ACTIONS(9),
    [aux_sym_float_token1] = ACTIONS(11),
    [aux_sym_float_token2] = ACTIONS(11),
    [anon_sym_true] = ACTIONS(13),
    [anon_sym_false] = ACTIONS(13),
  },
  [2] = {
    [sym_row] = STATE(39),
    [sym_field] = STATE(8),
    [sym_number] = STATE(30),
    [sym_float] = STATE(30),
    [sym_boolean] = STATE(30),
    [aux_sym_document_repeat1] = STATE(6),
    [aux_sym_row_repeat1] = STATE(9),
    [ts_builtin_sym_end] = ACTIONS(15),
    [anon_sym_TAB] = ACTIONS(5),
    [sym_text] = ACTIONS(7),
    [aux_sym_number_token1] = ACTIONS(9),
    [aux_sym_number_token2] = ACTIONS(9),
    [aux_sym_float_token1] = ACTIONS(11),
    [aux_sym_float_token2] = ACTIONS(11),
    [anon_sym_true] = ACTIONS(13),
    [anon_sym_false] = ACTIONS(13),
  },
  [3] = {
    [sym_field] = STATE(4),
    [sym_number] = STATE(30),
    [sym_float] = STATE(30),
    [sym_boolean] = STATE(30),
    [aux_sym_row_repeat1] = STATE(17),
    [aux_sym_row_repeat2] = STATE(4),
    [ts_builtin_sym_end] = ACTIONS(17),
    [aux_sym_document_token1] = ACTIONS(19),
    [anon_sym_TAB] = ACTIONS(21),
    [sym_text] = ACTIONS(7),
    [aux_sym_number_token1] = ACTIONS(9),
    [aux_sym_number_token2] = ACTIONS(9),
    [aux_sym_float_token1] = ACTIONS(11),
    [aux_sym_float_token2] = ACTIONS(11),
    [anon_sym_true] = ACTIONS(13),
    [anon_sym_false] = ACTIONS(13),
  },
  [4] = {
    [sym_field] = STATE(4),
    [sym_number] = STATE(30),
    [sym_float] = STATE(30),
    [sym_boolean] = STATE(30),
    [aux_sym_row_repeat1] = STATE(23),
    [aux_sym_row_repeat2] = STATE(4),
    [ts_builtin_sym_end] = ACTIONS(23),
    [aux_sym_document_token1] = ACTIONS(25),
    [anon_sym_TAB] = ACTIONS(27),
    [sym_text] = ACTIONS(30),
    [aux_sym_number_token1] = ACTIONS(33),
    [aux_sym_number_token2] = ACTIONS(33),
    [aux_sym_float_token1] = ACTIONS(36),
    [aux_sym_float_token2] = ACTIONS(36),
    [anon_sym_true] = ACTIONS(39),
    [anon_sym_false] = ACTIONS(39),
  },
  [5] = {
    [sym_field] = STATE(3),
    [sym_number] = STATE(30),
    [sym_float] = STATE(30),
    [sym_boolean] = STATE(30),
    [aux_sym_row_repeat1] = STATE(15),
    [aux_sym_row_repeat2] = STATE(3),
    [ts_builtin_sym_end] = ACTIONS(42),
    [aux_sym_document_token1] = ACTIONS(44),
    [anon_sym_TAB] = ACTIONS(46),
    [sym_text] = ACTIONS(7),
    [aux_sym_number_token1] = ACTIONS(9),
    [aux_sym_number_token2] = ACTIONS(9),
    [aux_sym_float_token1] = ACTIONS(11),
    [aux_sym_float_token2] = ACTIONS(11),
    [anon_sym_true] = ACTIONS(13),
    [anon_sym_false] = ACTIONS(13),
  },
  [6] = {
    [sym_row] = STATE(40),
    [sym_field] = STATE(10),
    [sym_number] = STATE(35),
    [sym_float] = STATE(35),
    [sym_boolean] = STATE(35),
    [aux_sym_document_repeat1] = STATE(6),
    [aux_sym_row_repeat1] = STATE(21),
    [ts_builtin_sym_end] = ACTIONS(48),
    [anon_sym_TAB] = ACTIONS(50),
    [sym_text] = ACTIONS(53),
    [aux_sym_number_token1] = ACTIONS(56),
    [aux_sym_number_token2] = ACTIONS(56),
    [aux_sym_float_token1] = ACTIONS(59),
    [aux_sym_float_token2] = ACTIONS(59),
    [anon_sym_true] = ACTIONS(62),
    [anon_sym_false] = ACTIONS(62),
  },
  [7] = {
    [sym_field] = STATE(4),
    [sym_number] = STATE(30),
    [sym_float] = STATE(30),
    [sym_boolean] = STATE(30),
    [aux_sym_row_repeat1] = STATE(15),
    [aux_sym_row_repeat2] = STATE(4),
    [ts_builtin_sym_end] = ACTIONS(42),
    [aux_sym_document_token1] = ACTIONS(44),
    [anon_sym_TAB] = ACTIONS(46),
    [sym_text] = ACTIONS(7),
    [aux_sym_number_token1] = ACTIONS(9),
    [aux_sym_number_token2] = ACTIONS(9),
    [aux_sym_float_token1] = ACTIONS(11),
    [aux_sym_float_token2] = ACTIONS(11),
    [anon_sym_true] = ACTIONS(13),
    [anon_sym_false] = ACTIONS(13),
  },
  [8] = {
    [sym_field] = STATE(7),
    [sym_number] = STATE(30),
    [sym_float] = STATE(30),
    [sym_boolean] = STATE(30),
    [aux_sym_row_repeat1] = STATE(11),
    [aux_sym_row_repeat2] = STATE(7),
    [ts_builtin_sym_end] = ACTIONS(65),
    [aux_sym_document_token1] = ACTIONS(67),
    [anon_sym_TAB] = ACTIONS(69),
    [sym_text] = ACTIONS(7),
    [aux_sym_number_token1] = ACTIONS(9),
    [aux_sym_number_token2] = ACTIONS(9),
    [aux_sym_float_token1] = ACTIONS(11),
    [aux_sym_float_token2] = ACTIONS(11),
    [anon_sym_true] = ACTIONS(13),
    [anon_sym_false] = ACTIONS(13),
  },
  [9] = {
    [sym_field] = STATE(5),
    [sym_number] = STATE(30),
    [sym_float] = STATE(30),
    [sym_boolean] = STATE(30),
    [aux_sym_row_repeat1] = STATE(24),
    [ts_builtin_sym_end] = ACTIONS(65),
    [aux_sym_document_token1] = ACTIONS(67),
    [anon_sym_TAB] = ACTIONS(71),
    [sym_text] = ACTIONS(7),
    [aux_sym_number_token1] = ACTIONS(9),
    [aux_sym_number_token2] = ACTIONS(9),
    [aux_sym_float_token1] = ACTIONS(11),
    [aux_sym_float_token2] = ACTIONS(11),
    [anon_sym_true] = ACTIONS(13),
    [anon_sym_false] = ACTIONS(13),
  },
  [10] = {
    [sym_field] = STATE(16),
    [sym_number] = STATE(35),
    [sym_float] = STATE(35),
    [sym_boolean] = STATE(35),
    [aux_sym_row_repeat1] = STATE(20),
    [aux_sym_row_repeat2] = STATE(16),
    [aux_sym_document_token1] = ACTIONS(67),
    [anon_sym_TAB] = ACTIONS(73),
    [sym_text] = ACTIONS(75),
    [aux_sym_number_token1] = ACTIONS(77),
    [aux_sym_number_token2] = ACTIONS(77),
    [aux_sym_float_token1] = ACTIONS(79),
    [aux_sym_float_token2] = ACTIONS(79),
    [anon_sym_true] = ACTIONS(81),
    [anon_sym_false] = ACTIONS(81),
  },
  [11] = {
    [sym_field] = STATE(28),
    [sym_number] = STATE(30),
    [sym_float] = STATE(30),
    [sym_boolean] = STATE(30),
    [aux_sym_row_repeat1] = STATE(24),
    [ts_builtin_sym_end] = ACTIONS(42),
    [aux_sym_document_token1] = ACTIONS(44),
    [anon_sym_TAB] = ACTIONS(71),
    [sym_text] = ACTIONS(7),
    [aux_sym_number_token1] = ACTIONS(9),
    [aux_sym_number_token2] = ACTIONS(9),
    [aux_sym_float_token1] = ACTIONS(11),
    [aux_sym_float_token2] = ACTIONS(11),
    [anon_sym_true] = ACTIONS(13),
    [anon_sym_false] = ACTIONS(13),
  },
  [12] = {
    [sym_field] = STATE(13),
    [sym_number] = STATE(35),
    [sym_float] = STATE(35),
    [sym_boolean] = STATE(35),
    [aux_sym_row_repeat1] = STATE(18),
    [aux_sym_row_repeat2] = STATE(13),
    [aux_sym_document_token1] = ACTIONS(19),
    [anon_sym_TAB] = ACTIONS(83),
    [sym_text] = ACTIONS(75),
    [aux_sym_number_token1] = ACTIONS(77),
    [aux_sym_number_token2] = ACTIONS(77),
    [aux_sym_float_token1] = ACTIONS(79),
    [aux_sym_float_token2] = ACTIONS(79),
    [anon_sym_true] = ACTIONS(81),
    [anon_sym_false] = ACTIONS(81),
  },
  [13] = {
    [sym_field] = STATE(13),
    [sym_number] = STATE(35),
    [sym_float] = STATE(35),
    [sym_boolean] = STATE(35),
    [aux_sym_row_repeat1] = STATE(22),
    [aux_sym_row_repeat2] = STATE(13),
    [aux_sym_document_token1] = ACTIONS(25),
    [anon_sym_TAB] = ACTIONS(85),
    [sym_text] = ACTIONS(88),
    [aux_sym_number_token1] = ACTIONS(91),
    [aux_sym_number_token2] = ACTIONS(91),
    [aux_sym_float_token1] = ACTIONS(94),
    [aux_sym_float_token2] = ACTIONS(94),
    [anon_sym_true] = ACTIONS(97),
    [anon_sym_false] = ACTIONS(97),
  },
  [14] = {
    [sym_field] = STATE(12),
    [sym_number] = STATE(35),
    [sym_float] = STATE(35),
    [sym_boolean] = STATE(35),
    [aux_sym_row_repeat1] = STATE(19),
    [aux_sym_row_repeat2] = STATE(12),
    [aux_sym_document_token1] = ACTIONS(44),
    [anon_sym_TAB] = ACTIONS(100),
    [sym_text] = ACTIONS(75),
    [aux_sym_number_token1] = ACTIONS(77),
    [aux_sym_number_token2] = ACTIONS(77),
    [aux_sym_float_token1] = ACTIONS(79),
    [aux_sym_float_token2] = ACTIONS(79),
    [anon_sym_true] = ACTIONS(81),
    [anon_sym_false] = ACTIONS(81),
  },
  [15] = {
    [sym_field] = STATE(28),
    [sym_number] = STATE(30),
    [sym_float] = STATE(30),
    [sym_boolean] = STATE(30),
    [aux_sym_row_repeat1] = STATE(24),
    [ts_builtin_sym_end] = ACTIONS(17),
    [aux_sym_document_token1] = ACTIONS(19),
    [anon_sym_TAB] = ACTIONS(71),
    [sym_text] = ACTIONS(7),
    [aux_sym_number_token1] = ACTIONS(9),
    [aux_sym_number_token2] = ACTIONS(9),
    [aux_sym_float_token1] = ACTIONS(11),
    [aux_sym_float_token2] = ACTIONS(11),
    [anon_sym_true] = ACTIONS(13),
    [anon_sym_false] = ACTIONS(13),
  },
  [16] = {
    [sym_field] = STATE(13),
    [sym_number] = STATE(35),
    [sym_float] = STATE(35),
    [sym_boolean] = STATE(35),
    [aux_sym_row_repeat1] = STATE(19),
    [aux_sym_row_repeat2] = STATE(13),
    [aux_sym_document_token1] = ACTIONS(44),
    [anon_sym_TAB] = ACTIONS(100),
    [sym_text] = ACTIONS(75),
    [aux_sym_number_token1] = ACTIONS(77),
    [aux_sym_number_token2] = ACTIONS(77),
    [aux_sym_float_token1] = ACTIONS(79),
    [aux_sym_float_token2] = ACTIONS(79),
    [anon_sym_true] = ACTIONS(81),
    [anon_sym_false] = ACTIONS(81),
  },
  [17] = {
    [sym_field] = STATE(28),
    [sym_number] = STATE(30),
    [sym_float] = STATE(30),
    [sym_boolean] = STATE(30),
    [aux_sym_row_repeat1] = STATE(24),
    [ts_builtin_sym_end] = ACTIONS(102),
    [aux_sym_document_token1] = ACTIONS(104),
    [anon_sym_TAB] = ACTIONS(71),
    [sym_text] = ACTIONS(7),
    [aux_sym_number_token1] = ACTIONS(9),
    [aux_sym_number_token2] = ACTIONS(9),
    [aux_sym_float_token1] = ACTIONS(11),
    [aux_sym_float_token2] = ACTIONS(11),
    [anon_sym_true] = ACTIONS(13),
    [anon_sym_false] = ACTIONS(13),
  },
  [18] = {
    [sym_field] = STATE(36),
    [sym_number] = STATE(35),
    [sym_float] = STATE(35),
    [sym_boolean] = STATE(35),
    [aux_sym_row_repeat1] = STATE(25),
    [aux_sym_document_token1] = ACTIONS(104),
    [anon_sym_TAB] = ACTIONS(106),
    [sym_text] = ACTIONS(75),
    [aux_sym_number_token1] = ACTIONS(77),
    [aux_sym_number_token2] = ACTIONS(77),
    [aux_sym_float_token1] = ACTIONS(79),
    [aux_sym_float_token2] = ACTIONS(79),
    [anon_sym_true] = ACTIONS(81),
    [anon_sym_false] = ACTIONS(81),
  },
  [19] = {
    [sym_field] = STATE(36),
    [sym_number] = STATE(35),
    [sym_float] = STATE(35),
    [sym_boolean] = STATE(35),
    [aux_sym_row_repeat1] = STATE(25),
    [aux_sym_document_token1] = ACTIONS(19),
    [anon_sym_TAB] = ACTIONS(106),
    [sym_text] = ACTIONS(75),
    [aux_sym_number_token1] = ACTIONS(77),
    [aux_sym_number_token2] = ACTIONS(77),
    [aux_sym_float_token1] = ACTIONS(79),
    [aux_sym_float_token2] = ACTIONS(79),
    [anon_sym_true] = ACTIONS(81),
    [anon_sym_false] = ACTIONS(81),
  },
  [20] = {
    [sym_field] = STATE(36),
    [sym_number] = STATE(35),
    [sym_float] = STATE(35),
    [sym_boolean] = STATE(35),
    [aux_sym_row_repeat1] = STATE(25),
    [aux_sym_document_token1] = ACTIONS(44),
    [anon_sym_TAB] = ACTIONS(106),
    [sym_text] = ACTIONS(75),
    [aux_sym_number_token1] = ACTIONS(77),
    [aux_sym_number_token2] = ACTIONS(77),
    [aux_sym_float_token1] = ACTIONS(79),
    [aux_sym_float_token2] = ACTIONS(79),
    [anon_sym_true] = ACTIONS(81),
    [anon_sym_false] = ACTIONS(81),
  },
  [21] = {
    [sym_field] = STATE(14),
    [sym_number] = STATE(35),
    [sym_float] = STATE(35),
    [sym_boolean] = STATE(35),
    [aux_sym_row_repeat1] = STATE(25),
    [aux_sym_document_token1] = ACTIONS(67),
    [anon_sym_TAB] = ACTIONS(106),
    [sym_text] = ACTIONS(75),
    [aux_sym_number_token1] = ACTIONS(77),
    [aux_sym_number_token2] = ACTIONS(77),
    [aux_sym_float_token1] = ACTIONS(79),
    [aux_sym_float_token2] = ACTIONS(79),
    [anon_sym_true] = ACTIONS(81),
    [anon_sym_false] = ACTIONS(81),
  },
  [22] = {
    [sym_field] = STATE(36),
    [sym_number] = STATE(35),
    [sym_float] = STATE(35),
    [sym_boolean] = STATE(35),
    [aux_sym_row_repeat1] = STATE(37),
    [anon_sym_TAB] = ACTIONS(108),
    [sym_text] = ACTIONS(75),
    [aux_sym_number_token1] = ACTIONS(77),
    [aux_sym_number_token2] = ACTIONS(77),
    [aux_sym_float_token1] = ACTIONS(79),
    [aux_sym_float_token2] = ACTIONS(79),
    [anon_sym_true] = ACTIONS(81),
    [anon_sym_false] = ACTIONS(81),
  },
  [23] = {
    [sym_field] = STATE(28),
    [sym_number] = STATE(30),
    [sym_float] = STATE(30),
    [sym_boolean] = STATE(30),
    [aux_sym_row_repeat1] = STATE(37),
    [anon_sym_TAB] = ACTIONS(108),
    [sym_text] = ACTIONS(7),
    [aux_sym_number_token1] = ACTIONS(9),
    [aux_sym_number_token2] = ACTIONS(9),
    [aux_sym_float_token1] = ACTIONS(11),
    [aux_sym_float_token2] = ACTIONS(11),
    [anon_sym_true] = ACTIONS(13),
    [anon_sym_false] = ACTIONS(13),
  },
  [24] = {
    [aux_sym_row_repeat1] = STATE(24),
    [ts_builtin_sym_end] = ACTIONS(110),
    [aux_sym_document_token1] = ACTIONS(112),
    [anon_sym_TAB] = ACTIONS(114),
    [sym_text] = ACTIONS(112),
    [aux_sym_number_token1] = ACTIONS(112),
    [aux_sym_number_token2] = ACTIONS(112),
    [aux_sym_float_token1] = ACTIONS(112),
    [aux_sym_float_token2] = ACTIONS(112),
    [anon_sym_true] = ACTIONS(112),
    [anon_sym_false] = ACTIONS(112),
  },
  [25] = {
    [aux_sym_row_repeat1] = STATE(25),
    [aux_sym_document_token1] = ACTIONS(112),
    [anon_sym_TAB] = ACTIONS(117),
    [sym_text] = ACTIONS(112),
    [aux_sym_number_token1] = ACTIONS(112),
    [aux_sym_number_token2] = ACTIONS(112),
    [aux_sym_float_token1] = ACTIONS(112),
    [aux_sym_float_token2] = ACTIONS(112),
    [anon_sym_true] = ACTIONS(112),
    [anon_sym_false] = ACTIONS(112),
  },
  [26] = {
    [ts_builtin_sym_end] = ACTIONS(120),
    [aux_sym_document_token1] = ACTIONS(122),
    [anon_sym_TAB] = ACTIONS(122),
    [sym_text] = ACTIONS(122),
    [aux_sym_number_token1] = ACTIONS(122),
    [aux_sym_number_token2] = ACTIONS(122),
    [aux_sym_float_token1] = ACTIONS(122),
    [aux_sym_float_token2] = ACTIONS(122),
    [anon_sym_true] = ACTIONS(122),
    [anon_sym_false] = ACTIONS(122),
  },
  [27] = {
    [ts_builtin_sym_end] = ACTIONS(124),
    [aux_sym_document_token1] = ACTIONS(126),
    [anon_sym_TAB] = ACTIONS(126),
    [sym_text] = ACTIONS(126),
    [aux_sym_number_token1] = ACTIONS(126),
    [aux_sym_number_token2] = ACTIONS(126),
    [aux_sym_float_token1] = ACTIONS(126),
    [aux_sym_float_token2] = ACTIONS(126),
    [anon_sym_true] = ACTIONS(126),
    [anon_sym_false] = ACTIONS(126),
  },
  [28] = {
    [ts_builtin_sym_end] = ACTIONS(23),
    [aux_sym_document_token1] = ACTIONS(25),
    [anon_sym_TAB] = ACTIONS(25),
    [sym_text] = ACTIONS(25),
    [aux_sym_number_token1] = ACTIONS(25),
    [aux_sym_number_token2] = ACTIONS(25),
    [aux_sym_float_token1] = ACTIONS(25),
    [aux_sym_float_token2] = ACTIONS(25),
    [anon_sym_true] = ACTIONS(25),
    [anon_sym_false] = ACTIONS(25),
  },
  [29] = {
    [ts_builtin_sym_end] = ACTIONS(128),
    [aux_sym_document_token1] = ACTIONS(130),
    [anon_sym_TAB] = ACTIONS(130),
    [sym_text] = ACTIONS(130),
    [aux_sym_number_token1] = ACTIONS(130),
    [aux_sym_number_token2] = ACTIONS(130),
    [aux_sym_float_token1] = ACTIONS(130),
    [aux_sym_float_token2] = ACTIONS(130),
    [anon_sym_true] = ACTIONS(130),
    [anon_sym_false] = ACTIONS(130),
  },
  [30] = {
    [ts_builtin_sym_end] = ACTIONS(132),
    [aux_sym_document_token1] = ACTIONS(134),
    [anon_sym_TAB] = ACTIONS(134),
    [sym_text] = ACTIONS(134),
    [aux_sym_number_token1] = ACTIONS(134),
    [aux_sym_number_token2] = ACTIONS(134),
    [aux_sym_float_token1] = ACTIONS(134),
    [aux_sym_float_token2] = ACTIONS(134),
    [anon_sym_true] = ACTIONS(134),
    [anon_sym_false] = ACTIONS(134),
  },
};

static const uint16_t ts_small_parse_table[] = {
  [0] = 1,
    ACTIONS(122), 9,
      aux_sym_document_token1,
      anon_sym_TAB,
      sym_text,
      aux_sym_number_token1,
      aux_sym_number_token2,
      aux_sym_float_token1,
      aux_sym_float_token2,
      anon_sym_true,
      anon_sym_false,
  [12] = 1,
    ACTIONS(126), 9,
      aux_sym_document_token1,
      anon_sym_TAB,
      sym_text,
      aux_sym_number_token1,
      aux_sym_number_token2,
      aux_sym_float_token1,
      aux_sym_float_token2,
      anon_sym_true,
      anon_sym_false,
  [24] = 1,
    ACTIONS(130), 9,
      aux_sym_document_token1,
      anon_sym_TAB,
      sym_text,
      aux_sym_number_token1,
      aux_sym_number_token2,
      aux_sym_float_token1,
      aux_sym_float_token2,
      anon_sym_true,
      anon_sym_false,
  [36] = 2,
    ACTIONS(48), 2,
      ts_builtin_sym_end,
      anon_sym_TAB,
    ACTIONS(136), 7,
      sym_text,
      aux_sym_number_token1,
      aux_sym_number_token2,
      aux_sym_float_token1,
      aux_sym_float_token2,
      anon_sym_true,
      anon_sym_false,
  [50] = 1,
    ACTIONS(134), 9,
      aux_sym_document_token1,
      anon_sym_TAB,
      sym_text,
      aux_sym_number_token1,
      aux_sym_number_token2,
      aux_sym_float_token1,
      aux_sym_float_token2,
      anon_sym_true,
      anon_sym_false,
  [62] = 1,
    ACTIONS(25), 9,
      aux_sym_document_token1,
      anon_sym_TAB,
      sym_text,
      aux_sym_number_token1,
      aux_sym_number_token2,
      aux_sym_float_token1,
      aux_sym_float_token2,
      anon_sym_true,
      anon_sym_false,
  [74] = 3,
    ACTIONS(138), 1,
      anon_sym_TAB,
    STATE(37), 1,
      aux_sym_row_repeat1,
    ACTIONS(112), 7,
      sym_text,
      aux_sym_number_token1,
      aux_sym_number_token2,
      aux_sym_float_token1,
      aux_sym_float_token2,
      anon_sym_true,
      anon_sym_false,
  [90] = 2,
    ACTIONS(15), 1,
      ts_builtin_sym_end,
    ACTIONS(141), 1,
      aux_sym_document_token1,
  [97] = 2,
    ACTIONS(141), 1,
      aux_sym_document_token1,
    ACTIONS(143), 1,
      ts_builtin_sym_end,
  [104] = 1,
    ACTIONS(141), 1,
      aux_sym_document_token1,
  [108] = 1,
    ACTIONS(145), 1,
      ts_builtin_sym_end,
};

static const uint32_t ts_small_parse_table_map[] = {
  [SMALL_STATE(31)] = 0,
  [SMALL_STATE(32)] = 12,
  [SMALL_STATE(33)] = 24,
  [SMALL_STATE(34)] = 36,
  [SMALL_STATE(35)] = 50,
  [SMALL_STATE(36)] = 62,
  [SMALL_STATE(37)] = 74,
  [SMALL_STATE(38)] = 90,
  [SMALL_STATE(39)] = 97,
  [SMALL_STATE(40)] = 104,
  [SMALL_STATE(41)] = 108,
};

static const TSParseActionEntry ts_parse_actions[] = {
  [0] = {.entry = {.count = 0, .reusable = false}},
  [1] = {.entry = {.count = 1, .reusable = false}}, RECOVER(),
  [3] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_document, 0, 0, 0),
  [5] = {.entry = {.count = 1, .reusable = true}}, SHIFT(9),
  [7] = {.entry = {.count = 1, .reusable = false}}, SHIFT(30),
  [9] = {.entry = {.count = 1, .reusable = false}}, SHIFT(26),
  [11] = {.entry = {.count = 1, .reusable = false}}, SHIFT(27),
  [13] = {.entry = {.count = 1, .reusable = false}}, SHIFT(29),
  [15] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_document, 1, 0, 0),
  [17] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_row, 3, 0, 0),
  [19] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_row, 3, 0, 0),
  [21] = {.entry = {.count = 1, .reusable = false}}, SHIFT(17),
  [23] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_row_repeat2, 2, 0, 0),
  [25] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_row_repeat2, 2, 0, 0),
  [27] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_row_repeat2, 2, 0, 0), SHIFT_REPEAT(23),
  [30] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_row_repeat2, 2, 0, 0), SHIFT_REPEAT(30),
  [33] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_row_repeat2, 2, 0, 0), SHIFT_REPEAT(26),
  [36] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_row_repeat2, 2, 0, 0), SHIFT_REPEAT(27),
  [39] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_row_repeat2, 2, 0, 0), SHIFT_REPEAT(29),
  [42] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_row, 2, 0, 0),
  [44] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_row, 2, 0, 0),
  [46] = {.entry = {.count = 1, .reusable = false}}, SHIFT(15),
  [48] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_document_repeat1, 2, 0, 0),
  [50] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_document_repeat1, 2, 0, 0), SHIFT_REPEAT(21),
  [53] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_document_repeat1, 2, 0, 0), SHIFT_REPEAT(35),
  [56] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_document_repeat1, 2, 0, 0), SHIFT_REPEAT(31),
  [59] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_document_repeat1, 2, 0, 0), SHIFT_REPEAT(32),
  [62] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_document_repeat1, 2, 0, 0), SHIFT_REPEAT(33),
  [65] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_row, 1, 0, 0),
  [67] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_row, 1, 0, 0),
  [69] = {.entry = {.count = 1, .reusable = false}}, SHIFT(11),
  [71] = {.entry = {.count = 1, .reusable = false}}, SHIFT(24),
  [73] = {.entry = {.count = 1, .reusable = false}}, SHIFT(20),
  [75] = {.entry = {.count = 1, .reusable = false}}, SHIFT(35),
  [77] = {.entry = {.count = 1, .reusable = false}}, SHIFT(31),
  [79] = {.entry = {.count = 1, .reusable = false}}, SHIFT(32),
  [81] = {.entry = {.count = 1, .reusable = false}}, SHIFT(33),
  [83] = {.entry = {.count = 1, .reusable = false}}, SHIFT(18),
  [85] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_row_repeat2, 2, 0, 0), SHIFT_REPEAT(22),
  [88] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_row_repeat2, 2, 0, 0), SHIFT_REPEAT(35),
  [91] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_row_repeat2, 2, 0, 0), SHIFT_REPEAT(31),
  [94] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_row_repeat2, 2, 0, 0), SHIFT_REPEAT(32),
  [97] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_row_repeat2, 2, 0, 0), SHIFT_REPEAT(33),
  [100] = {.entry = {.count = 1, .reusable = false}}, SHIFT(19),
  [102] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_row, 4, 0, 0),
  [104] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_row, 4, 0, 0),
  [106] = {.entry = {.count = 1, .reusable = false}}, SHIFT(25),
  [108] = {.entry = {.count = 1, .reusable = true}}, SHIFT(37),
  [110] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_row_repeat1, 2, 0, 0),
  [112] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_row_repeat1, 2, 0, 0),
  [114] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_row_repeat1, 2, 0, 0), SHIFT_REPEAT(24),
  [117] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_row_repeat1, 2, 0, 0), SHIFT_REPEAT(25),
  [120] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_number, 1, 0, 0),
  [122] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_number, 1, 0, 0),
  [124] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_float, 1, 0, 0),
  [126] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_float, 1, 0, 0),
  [128] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_boolean, 1, 0, 0),
  [130] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_boolean, 1, 0, 0),
  [132] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_field, 1, 0, 0),
  [134] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_field, 1, 0, 0),
  [136] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_document_repeat1, 2, 0, 0),
  [138] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_row_repeat1, 2, 0, 0), SHIFT_REPEAT(37),
  [141] = {.entry = {.count = 1, .reusable = true}}, SHIFT(34),
  [143] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_document, 2, 0, 0),
  [145] = {.entry = {.count = 1, .reusable = true}},  ACCEPT_INPUT(),
};

#ifdef __cplusplus
extern "C" {
#endif
#ifdef TREE_SITTER_HIDE_SYMBOLS
#define TS_PUBLIC
#elif defined(_WIN32)
#define TS_PUBLIC __declspec(dllexport)
#else
#define TS_PUBLIC __attribute__((visibility("default")))
#endif

TS_PUBLIC const TSLanguage *tree_sitter_tsv(void) {
  static const TSLanguage language = {
    .version = LANGUAGE_VERSION,
    .symbol_count = SYMBOL_COUNT,
    .alias_count = ALIAS_COUNT,
    .token_count = TOKEN_COUNT,
    .external_token_count = EXTERNAL_TOKEN_COUNT,
    .state_count = STATE_COUNT,
    .large_state_count = LARGE_STATE_COUNT,
    .production_id_count = PRODUCTION_ID_COUNT,
    .field_count = FIELD_COUNT,
    .max_alias_sequence_length = MAX_ALIAS_SEQUENCE_LENGTH,
    .parse_table = &ts_parse_table[0][0],
    .small_parse_table = ts_small_parse_table,
    .small_parse_table_map = ts_small_parse_table_map,
    .parse_actions = ts_parse_actions,
    .symbol_names = ts_symbol_names,
    .symbol_metadata = ts_symbol_metadata,
    .public_symbol_map = ts_symbol_map,
    .alias_map = ts_non_terminal_alias_map,
    .alias_sequences = &ts_alias_sequences[0][0],
    .lex_modes = ts_lex_modes,
    .lex_fn = ts_lex,
    .primary_state_ids = ts_primary_state_ids,
  };
  return &language;
}
#ifdef __cplusplus
}
#endif

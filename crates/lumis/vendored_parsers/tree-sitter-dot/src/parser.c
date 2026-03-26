#include <tree_sitter/parser.h>

#if defined(__GNUC__) || defined(__clang__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wmissing-field-initializers"
#endif

#define LANGUAGE_VERSION 13
#define STATE_COUNT 80
#define LARGE_STATE_COUNT 4
#define SYMBOL_COUNT 51
#define ALIAS_COUNT 1
#define TOKEN_COUNT 28
#define EXTERNAL_TOKEN_COUNT 0
#define FIELD_COUNT 4
#define MAX_ALIAS_SEQUENCE_LENGTH 4
#define PRODUCTION_ID_COUNT 8

enum {
  sym_identifier = 1,
  aux_sym_source_file_token1 = 2,
  aux_sym_source_file_token2 = 3,
  aux_sym_source_file_token3 = 4,
  anon_sym_LBRACE = 5,
  anon_sym_RBRACE = 6,
  anon_sym_SEMI = 7,
  aux_sym_subgraph_token1 = 8,
  aux_sym_attr_stmt_token1 = 9,
  aux_sym_attr_stmt_token2 = 10,
  anon_sym_COLON = 11,
  anon_sym_LBRACK = 12,
  anon_sym_RBRACK = 13,
  anon_sym_COMMA = 14,
  anon_sym_EQ = 15,
  anon_sym_PLUS = 16,
  sym_number_literal = 17,
  anon_sym_DQUOTE = 18,
  aux_sym_string_literal_token1 = 19,
  anon_sym_LT = 20,
  anon_sym_GT = 21,
  aux_sym__html_internal_token1 = 22,
  anon_sym_DASH_GT = 23,
  anon_sym_DASH_DASH = 24,
  sym_comment = 25,
  anon_sym_POUND = 26,
  aux_sym_preproc_token1 = 27,
  sym_source_file = 28,
  sym_block = 29,
  sym_stmt_list = 30,
  sym__stmt = 31,
  sym_subgraph = 32,
  sym_node_stmt = 33,
  sym_edge_stmt = 34,
  sym_attr_stmt = 35,
  sym_node_id = 36,
  sym_port = 37,
  sym_attr_list = 38,
  aux_sym__a_list = 39,
  sym_attribute = 40,
  sym_id = 41,
  sym_string_literal = 42,
  sym_html_string = 43,
  aux_sym__html_internal = 44,
  sym_edgeop = 45,
  sym_preproc = 46,
  aux_sym_stmt_list_repeat1 = 47,
  aux_sym_edge_stmt_repeat1 = 48,
  aux_sym_attr_list_repeat1 = 49,
  aux_sym_id_repeat1 = 50,
  alias_sym_html_internal = 51,
};

static const char * const ts_symbol_names[] = {
  [ts_builtin_sym_end] = "end",
  [sym_identifier] = "identifier",
  [aux_sym_source_file_token1] = "strict",
  [aux_sym_source_file_token2] = "graph",
  [aux_sym_source_file_token3] = "digraph",
  [anon_sym_LBRACE] = "{",
  [anon_sym_RBRACE] = "}",
  [anon_sym_SEMI] = ";",
  [aux_sym_subgraph_token1] = "subgraph",
  [aux_sym_attr_stmt_token1] = "node",
  [aux_sym_attr_stmt_token2] = "edge",
  [anon_sym_COLON] = "operator",
  [anon_sym_LBRACK] = "[",
  [anon_sym_RBRACK] = "]",
  [anon_sym_COMMA] = ",",
  [anon_sym_EQ] = "operator",
  [anon_sym_PLUS] = "operator",
  [sym_number_literal] = "number_literal",
  [anon_sym_DQUOTE] = "\"",
  [aux_sym_string_literal_token1] = "string_literal_token1",
  [anon_sym_LT] = "<",
  [anon_sym_GT] = ">",
  [aux_sym__html_internal_token1] = "_html_internal_token1",
  [anon_sym_DASH_GT] = "->",
  [anon_sym_DASH_DASH] = "--",
  [sym_comment] = "comment",
  [anon_sym_POUND] = "#",
  [aux_sym_preproc_token1] = "preproc_token1",
  [sym_source_file] = "source_file",
  [sym_block] = "block",
  [sym_stmt_list] = "stmt_list",
  [sym__stmt] = "_stmt",
  [sym_subgraph] = "subgraph",
  [sym_node_stmt] = "node_stmt",
  [sym_edge_stmt] = "edge_stmt",
  [sym_attr_stmt] = "attr_stmt",
  [sym_node_id] = "node_id",
  [sym_port] = "port",
  [sym_attr_list] = "attr_list",
  [aux_sym__a_list] = "_a_list",
  [sym_attribute] = "attribute",
  [sym_id] = "id",
  [sym_string_literal] = "string_literal",
  [sym_html_string] = "html_string",
  [aux_sym__html_internal] = "_html_internal",
  [sym_edgeop] = "edgeop",
  [sym_preproc] = "preproc",
  [aux_sym_stmt_list_repeat1] = "stmt_list_repeat1",
  [aux_sym_edge_stmt_repeat1] = "edge_stmt_repeat1",
  [aux_sym_attr_list_repeat1] = "attr_list_repeat1",
  [aux_sym_id_repeat1] = "id_repeat1",
  [alias_sym_html_internal] = "html_internal",
};

static const TSSymbol ts_symbol_map[] = {
  [ts_builtin_sym_end] = ts_builtin_sym_end,
  [sym_identifier] = sym_identifier,
  [aux_sym_source_file_token1] = aux_sym_source_file_token1,
  [aux_sym_source_file_token2] = aux_sym_source_file_token2,
  [aux_sym_source_file_token3] = aux_sym_source_file_token3,
  [anon_sym_LBRACE] = anon_sym_LBRACE,
  [anon_sym_RBRACE] = anon_sym_RBRACE,
  [anon_sym_SEMI] = anon_sym_SEMI,
  [aux_sym_subgraph_token1] = aux_sym_subgraph_token1,
  [aux_sym_attr_stmt_token1] = aux_sym_attr_stmt_token1,
  [aux_sym_attr_stmt_token2] = aux_sym_attr_stmt_token2,
  [anon_sym_COLON] = anon_sym_COLON,
  [anon_sym_LBRACK] = anon_sym_LBRACK,
  [anon_sym_RBRACK] = anon_sym_RBRACK,
  [anon_sym_COMMA] = anon_sym_COMMA,
  [anon_sym_EQ] = anon_sym_COLON,
  [anon_sym_PLUS] = anon_sym_COLON,
  [sym_number_literal] = sym_number_literal,
  [anon_sym_DQUOTE] = anon_sym_DQUOTE,
  [aux_sym_string_literal_token1] = aux_sym_string_literal_token1,
  [anon_sym_LT] = anon_sym_LT,
  [anon_sym_GT] = anon_sym_GT,
  [aux_sym__html_internal_token1] = aux_sym__html_internal_token1,
  [anon_sym_DASH_GT] = anon_sym_DASH_GT,
  [anon_sym_DASH_DASH] = anon_sym_DASH_DASH,
  [sym_comment] = sym_comment,
  [anon_sym_POUND] = anon_sym_POUND,
  [aux_sym_preproc_token1] = aux_sym_preproc_token1,
  [sym_source_file] = sym_source_file,
  [sym_block] = sym_block,
  [sym_stmt_list] = sym_stmt_list,
  [sym__stmt] = sym__stmt,
  [sym_subgraph] = sym_subgraph,
  [sym_node_stmt] = sym_node_stmt,
  [sym_edge_stmt] = sym_edge_stmt,
  [sym_attr_stmt] = sym_attr_stmt,
  [sym_node_id] = sym_node_id,
  [sym_port] = sym_port,
  [sym_attr_list] = sym_attr_list,
  [aux_sym__a_list] = aux_sym__a_list,
  [sym_attribute] = sym_attribute,
  [sym_id] = sym_id,
  [sym_string_literal] = sym_string_literal,
  [sym_html_string] = sym_html_string,
  [aux_sym__html_internal] = aux_sym__html_internal,
  [sym_edgeop] = sym_edgeop,
  [sym_preproc] = sym_preproc,
  [aux_sym_stmt_list_repeat1] = aux_sym_stmt_list_repeat1,
  [aux_sym_edge_stmt_repeat1] = aux_sym_edge_stmt_repeat1,
  [aux_sym_attr_list_repeat1] = aux_sym_attr_list_repeat1,
  [aux_sym_id_repeat1] = aux_sym_id_repeat1,
  [alias_sym_html_internal] = alias_sym_html_internal,
};

static const TSSymbolMetadata ts_symbol_metadata[] = {
  [ts_builtin_sym_end] = {
    .visible = false,
    .named = true,
  },
  [sym_identifier] = {
    .visible = true,
    .named = true,
  },
  [aux_sym_source_file_token1] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_source_file_token2] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_source_file_token3] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LBRACE] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_RBRACE] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_SEMI] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_subgraph_token1] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_attr_stmt_token1] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_attr_stmt_token2] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_COLON] = {
    .visible = true,
    .named = true,
  },
  [anon_sym_LBRACK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_RBRACK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_COMMA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_EQ] = {
    .visible = true,
    .named = true,
  },
  [anon_sym_PLUS] = {
    .visible = true,
    .named = true,
  },
  [sym_number_literal] = {
    .visible = true,
    .named = true,
  },
  [anon_sym_DQUOTE] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_string_literal_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_LT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_GT] = {
    .visible = true,
    .named = false,
  },
  [aux_sym__html_internal_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_DASH_GT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_DASH_DASH] = {
    .visible = true,
    .named = false,
  },
  [sym_comment] = {
    .visible = true,
    .named = true,
  },
  [anon_sym_POUND] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_preproc_token1] = {
    .visible = false,
    .named = false,
  },
  [sym_source_file] = {
    .visible = true,
    .named = true,
  },
  [sym_block] = {
    .visible = true,
    .named = true,
  },
  [sym_stmt_list] = {
    .visible = true,
    .named = true,
  },
  [sym__stmt] = {
    .visible = false,
    .named = true,
  },
  [sym_subgraph] = {
    .visible = true,
    .named = true,
  },
  [sym_node_stmt] = {
    .visible = true,
    .named = true,
  },
  [sym_edge_stmt] = {
    .visible = true,
    .named = true,
  },
  [sym_attr_stmt] = {
    .visible = true,
    .named = true,
  },
  [sym_node_id] = {
    .visible = true,
    .named = true,
  },
  [sym_port] = {
    .visible = true,
    .named = true,
  },
  [sym_attr_list] = {
    .visible = true,
    .named = true,
  },
  [aux_sym__a_list] = {
    .visible = false,
    .named = false,
  },
  [sym_attribute] = {
    .visible = true,
    .named = true,
  },
  [sym_id] = {
    .visible = true,
    .named = true,
  },
  [sym_string_literal] = {
    .visible = true,
    .named = true,
  },
  [sym_html_string] = {
    .visible = true,
    .named = true,
  },
  [aux_sym__html_internal] = {
    .visible = false,
    .named = false,
  },
  [sym_edgeop] = {
    .visible = true,
    .named = true,
  },
  [sym_preproc] = {
    .visible = true,
    .named = true,
  },
  [aux_sym_stmt_list_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_edge_stmt_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_attr_list_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_id_repeat1] = {
    .visible = false,
    .named = false,
  },
  [alias_sym_html_internal] = {
    .visible = true,
    .named = true,
  },
};

enum {
  field_block = 1,
  field_id = 2,
  field_name = 3,
  field_value = 4,
};

static const char * const ts_field_names[] = {
  [0] = NULL,
  [field_block] = "block",
  [field_id] = "id",
  [field_name] = "name",
  [field_value] = "value",
};

static const TSFieldMapSlice ts_field_map_slices[PRODUCTION_ID_COUNT] = {
  [1] = {.index = 0, .length = 1},
  [2] = {.index = 1, .length = 1},
  [3] = {.index = 2, .length = 1},
  [4] = {.index = 3, .length = 2},
  [5] = {.index = 5, .length = 2},
  [7] = {.index = 7, .length = 2},
};

static const TSFieldMapEntry ts_field_map_entries[] = {
  [0] =
    {field_block, 1},
  [1] =
    {field_block, 2},
  [2] =
    {field_block, 0},
  [3] =
    {field_block, 2},
    {field_id, 1},
  [5] =
    {field_block, 3},
    {field_id, 2},
  [7] =
    {field_name, 0},
    {field_value, 2},
};

static const TSSymbol ts_alias_sequences[PRODUCTION_ID_COUNT][MAX_ALIAS_SEQUENCE_LENGTH] = {
  [0] = {0},
  [6] = {
    [1] = alias_sym_html_internal,
  },
};

static const uint16_t ts_non_terminal_alias_map[] = {
  aux_sym__html_internal, 2,
    aux_sym__html_internal,
    alias_sym_html_internal,
  0,
};

static inline bool sym_identifier_character_set_1(int32_t c) {
  return (c < 43514
    ? (c < 4193
      ? (c < 2707
        ? (c < 1994
          ? (c < 910
            ? (c < 736
              ? (c < 186
                ? (c < 'a'
                  ? (c < '_'
                    ? (c >= 'A' && c <= 'Z')
                    : c <= '_')
                  : (c <= 'z' || (c < 181
                    ? c == 170
                    : c <= 181)))
                : (c <= 186 || (c < 248
                  ? (c < 216
                    ? (c >= 192 && c <= 214)
                    : c <= 246)
                  : (c <= 705 || (c >= 710 && c <= 721)))))
              : (c <= 740 || (c < 891
                ? (c < 880
                  ? (c < 750
                    ? c == 748
                    : c <= 750)
                  : (c <= 884 || (c >= 886 && c <= 887)))
                : (c <= 893 || (c < 904
                  ? (c < 902
                    ? c == 895
                    : c <= 902)
                  : (c <= 906 || c == 908))))))
            : (c <= 929 || (c < 1649
              ? (c < 1376
                ? (c < 1162
                  ? (c < 1015
                    ? (c >= 931 && c <= 1013)
                    : c <= 1153)
                  : (c <= 1327 || (c < 1369
                    ? (c >= 1329 && c <= 1366)
                    : c <= 1369)))
                : (c <= 1416 || (c < 1568
                  ? (c < 1519
                    ? (c >= 1488 && c <= 1514)
                    : c <= 1522)
                  : (c <= 1610 || (c >= 1646 && c <= 1647)))))
              : (c <= 1747 || (c < 1791
                ? (c < 1774
                  ? (c < 1765
                    ? c == 1749
                    : c <= 1766)
                  : (c <= 1775 || (c >= 1786 && c <= 1788)))
                : (c <= 1791 || (c < 1869
                  ? (c < 1810
                    ? c == 1808
                    : c <= 1839)
                  : (c <= 1957 || c == 1969))))))))
          : (c <= 2026 || (c < 2482
            ? (c < 2208
              ? (c < 2088
                ? (c < 2048
                  ? (c < 2042
                    ? (c >= 2036 && c <= 2037)
                    : c <= 2042)
                  : (c <= 2069 || (c < 2084
                    ? c == 2074
                    : c <= 2084)))
                : (c <= 2088 || (c < 2160
                  ? (c < 2144
                    ? (c >= 2112 && c <= 2136)
                    : c <= 2154)
                  : (c <= 2183 || (c >= 2185 && c <= 2190)))))
              : (c <= 2249 || (c < 2417
                ? (c < 2384
                  ? (c < 2365
                    ? (c >= 2308 && c <= 2361)
                    : c <= 2365)
                  : (c <= 2384 || (c >= 2392 && c <= 2401)))
                : (c <= 2432 || (c < 2451
                  ? (c < 2447
                    ? (c >= 2437 && c <= 2444)
                    : c <= 2448)
                  : (c <= 2472 || (c >= 2474 && c <= 2480)))))))
            : (c <= 2482 || (c < 2579
              ? (c < 2527
                ? (c < 2510
                  ? (c < 2493
                    ? (c >= 2486 && c <= 2489)
                    : c <= 2493)
                  : (c <= 2510 || (c >= 2524 && c <= 2525)))
                : (c <= 2529 || (c < 2565
                  ? (c < 2556
                    ? (c >= 2544 && c <= 2545)
                    : c <= 2556)
                  : (c <= 2570 || (c >= 2575 && c <= 2576)))))
              : (c <= 2600 || (c < 2649
                ? (c < 2613
                  ? (c < 2610
                    ? (c >= 2602 && c <= 2608)
                    : c <= 2611)
                  : (c <= 2614 || (c >= 2616 && c <= 2617)))
                : (c <= 2652 || (c < 2693
                  ? (c < 2674
                    ? c == 2654
                    : c <= 2676)
                  : (c <= 2701 || (c >= 2703 && c <= 2705)))))))))))
        : (c <= 2728 || (c < 3242
          ? (c < 2962
            ? (c < 2858
              ? (c < 2784
                ? (c < 2741
                  ? (c < 2738
                    ? (c >= 2730 && c <= 2736)
                    : c <= 2739)
                  : (c <= 2745 || (c < 2768
                    ? c == 2749
                    : c <= 2768)))
                : (c <= 2785 || (c < 2831
                  ? (c < 2821
                    ? c == 2809
                    : c <= 2828)
                  : (c <= 2832 || (c >= 2835 && c <= 2856)))))
              : (c <= 2864 || (c < 2911
                ? (c < 2877
                  ? (c < 2869
                    ? (c >= 2866 && c <= 2867)
                    : c <= 2873)
                  : (c <= 2877 || (c >= 2908 && c <= 2909)))
                : (c <= 2913 || (c < 2949
                  ? (c < 2947
                    ? c == 2929
                    : c <= 2947)
                  : (c <= 2954 || (c >= 2958 && c <= 2960)))))))
            : (c <= 2965 || (c < 3090
              ? (c < 2984
                ? (c < 2974
                  ? (c < 2972
                    ? (c >= 2969 && c <= 2970)
                    : c <= 2972)
                  : (c <= 2975 || (c >= 2979 && c <= 2980)))
                : (c <= 2986 || (c < 3077
                  ? (c < 3024
                    ? (c >= 2990 && c <= 3001)
                    : c <= 3024)
                  : (c <= 3084 || (c >= 3086 && c <= 3088)))))
              : (c <= 3112 || (c < 3168
                ? (c < 3160
                  ? (c < 3133
                    ? (c >= 3114 && c <= 3129)
                    : c <= 3133)
                  : (c <= 3162 || c == 3165))
                : (c <= 3169 || (c < 3214
                  ? (c < 3205
                    ? c == 3200
                    : c <= 3212)
                  : (c <= 3216 || (c >= 3218 && c <= 3240)))))))))
          : (c <= 3251 || (c < 3648
            ? (c < 3412
              ? (c < 3332
                ? (c < 3293
                  ? (c < 3261
                    ? (c >= 3253 && c <= 3257)
                    : c <= 3261)
                  : (c <= 3294 || (c < 3313
                    ? (c >= 3296 && c <= 3297)
                    : c <= 3314)))
                : (c <= 3340 || (c < 3389
                  ? (c < 3346
                    ? (c >= 3342 && c <= 3344)
                    : c <= 3386)
                  : (c <= 3389 || c == 3406))))
              : (c <= 3414 || (c < 3507
                ? (c < 3461
                  ? (c < 3450
                    ? (c >= 3423 && c <= 3425)
                    : c <= 3455)
                  : (c <= 3478 || (c >= 3482 && c <= 3505)))
                : (c <= 3515 || (c < 3585
                  ? (c < 3520
                    ? c == 3517
                    : c <= 3526)
                  : (c <= 3632 || c == 3634))))))
            : (c <= 3654 || (c < 3782
              ? (c < 3749
                ? (c < 3718
                  ? (c < 3716
                    ? (c >= 3713 && c <= 3714)
                    : c <= 3716)
                  : (c <= 3722 || (c >= 3724 && c <= 3747)))
                : (c <= 3749 || (c < 3773
                  ? (c < 3762
                    ? (c >= 3751 && c <= 3760)
                    : c <= 3762)
                  : (c <= 3773 || (c >= 3776 && c <= 3780)))))
              : (c <= 3782 || (c < 3976
                ? (c < 3904
                  ? (c < 3840
                    ? (c >= 3804 && c <= 3807)
                    : c <= 3840)
                  : (c <= 3911 || (c >= 3913 && c <= 3948)))
                : (c <= 3980 || (c < 4176
                  ? (c < 4159
                    ? (c >= 4096 && c <= 4138)
                    : c <= 4159)
                  : (c <= 4181 || (c >= 4186 && c <= 4189)))))))))))))
      : (c <= 4193 || (c < 8134
        ? (c < 6176
          ? (c < 4808
            ? (c < 4688
              ? (c < 4295
                ? (c < 4213
                  ? (c < 4206
                    ? (c >= 4197 && c <= 4198)
                    : c <= 4208)
                  : (c <= 4225 || (c < 4256
                    ? c == 4238
                    : c <= 4293)))
                : (c <= 4295 || (c < 4348
                  ? (c < 4304
                    ? c == 4301
                    : c <= 4346)
                  : (c <= 4680 || (c >= 4682 && c <= 4685)))))
              : (c <= 4694 || (c < 4752
                ? (c < 4704
                  ? (c < 4698
                    ? c == 4696
                    : c <= 4701)
                  : (c <= 4744 || (c >= 4746 && c <= 4749)))
                : (c <= 4784 || (c < 4800
                  ? (c < 4792
                    ? (c >= 4786 && c <= 4789)
                    : c <= 4798)
                  : (c <= 4800 || (c >= 4802 && c <= 4805)))))))
            : (c <= 4822 || (c < 5792
              ? (c < 5024
                ? (c < 4888
                  ? (c < 4882
                    ? (c >= 4824 && c <= 4880)
                    : c <= 4885)
                  : (c <= 4954 || (c >= 4992 && c <= 5007)))
                : (c <= 5109 || (c < 5743
                  ? (c < 5121
                    ? (c >= 5112 && c <= 5117)
                    : c <= 5740)
                  : (c <= 5759 || (c >= 5761 && c <= 5786)))))
              : (c <= 5866 || (c < 5984
                ? (c < 5919
                  ? (c < 5888
                    ? (c >= 5870 && c <= 5880)
                    : c <= 5905)
                  : (c <= 5937 || (c >= 5952 && c <= 5969)))
                : (c <= 5996 || (c < 6103
                  ? (c < 6016
                    ? (c >= 5998 && c <= 6000)
                    : c <= 6067)
                  : (c <= 6103 || c == 6108))))))))
          : (c <= 6264 || (c < 7312
            ? (c < 6823
              ? (c < 6512
                ? (c < 6320
                  ? (c < 6314
                    ? (c >= 6272 && c <= 6312)
                    : c <= 6314)
                  : (c <= 6389 || (c < 6480
                    ? (c >= 6400 && c <= 6430)
                    : c <= 6509)))
                : (c <= 6516 || (c < 6656
                  ? (c < 6576
                    ? (c >= 6528 && c <= 6571)
                    : c <= 6601)
                  : (c <= 6678 || (c >= 6688 && c <= 6740)))))
              : (c <= 6823 || (c < 7098
                ? (c < 7043
                  ? (c < 6981
                    ? (c >= 6917 && c <= 6963)
                    : c <= 6988)
                  : (c <= 7072 || (c >= 7086 && c <= 7087)))
                : (c <= 7141 || (c < 7258
                  ? (c < 7245
                    ? (c >= 7168 && c <= 7203)
                    : c <= 7247)
                  : (c <= 7293 || (c >= 7296 && c <= 7304)))))))
            : (c <= 7354 || (c < 8008
              ? (c < 7418
                ? (c < 7406
                  ? (c < 7401
                    ? (c >= 7357 && c <= 7359)
                    : c <= 7404)
                  : (c <= 7411 || (c >= 7413 && c <= 7414)))
                : (c <= 7418 || (c < 7960
                  ? (c < 7680
                    ? (c >= 7424 && c <= 7615)
                    : c <= 7957)
                  : (c <= 7965 || (c >= 7968 && c <= 8005)))))
              : (c <= 8013 || (c < 8031
                ? (c < 8027
                  ? (c < 8025
                    ? (c >= 8016 && c <= 8023)
                    : c <= 8025)
                  : (c <= 8027 || c == 8029))
                : (c <= 8061 || (c < 8126
                  ? (c < 8118
                    ? (c >= 8064 && c <= 8116)
                    : c <= 8124)
                  : (c <= 8126 || (c >= 8130 && c <= 8132)))))))))))
        : (c <= 8140 || (c < 12337
          ? (c < 8544
            ? (c < 8458
              ? (c < 8305
                ? (c < 8160
                  ? (c < 8150
                    ? (c >= 8144 && c <= 8147)
                    : c <= 8155)
                  : (c <= 8172 || (c < 8182
                    ? (c >= 8178 && c <= 8180)
                    : c <= 8188)))
                : (c <= 8305 || (c < 8450
                  ? (c < 8336
                    ? c == 8319
                    : c <= 8348)
                  : (c <= 8450 || c == 8455))))
              : (c <= 8467 || (c < 8488
                ? (c < 8484
                  ? (c < 8472
                    ? c == 8469
                    : c <= 8477)
                  : (c <= 8484 || c == 8486))
                : (c <= 8488 || (c < 8517
                  ? (c < 8508
                    ? (c >= 8490 && c <= 8505)
                    : c <= 8511)
                  : (c <= 8521 || c == 8526))))))
            : (c <= 8584 || (c < 11680
              ? (c < 11559
                ? (c < 11506
                  ? (c < 11499
                    ? (c >= 11264 && c <= 11492)
                    : c <= 11502)
                  : (c <= 11507 || (c >= 11520 && c <= 11557)))
                : (c <= 11559 || (c < 11631
                  ? (c < 11568
                    ? c == 11565
                    : c <= 11623)
                  : (c <= 11631 || (c >= 11648 && c <= 11670)))))
              : (c <= 11686 || (c < 11720
                ? (c < 11704
                  ? (c < 11696
                    ? (c >= 11688 && c <= 11694)
                    : c <= 11702)
                  : (c <= 11710 || (c >= 11712 && c <= 11718)))
                : (c <= 11726 || (c < 12293
                  ? (c < 11736
                    ? (c >= 11728 && c <= 11734)
                    : c <= 11742)
                  : (c <= 12295 || (c >= 12321 && c <= 12329)))))))))
          : (c <= 12341 || (c < 42891
            ? (c < 19968
              ? (c < 12549
                ? (c < 12445
                  ? (c < 12353
                    ? (c >= 12344 && c <= 12348)
                    : c <= 12438)
                  : (c <= 12447 || (c < 12540
                    ? (c >= 12449 && c <= 12538)
                    : c <= 12543)))
                : (c <= 12591 || (c < 12784
                  ? (c < 12704
                    ? (c >= 12593 && c <= 12686)
                    : c <= 12735)
                  : (c <= 12799 || (c >= 13312 && c <= 19903)))))
              : (c <= 42124 || (c < 42560
                ? (c < 42512
                  ? (c < 42240
                    ? (c >= 42192 && c <= 42237)
                    : c <= 42508)
                  : (c <= 42527 || (c >= 42538 && c <= 42539)))
                : (c <= 42606 || (c < 42775
                  ? (c < 42656
                    ? (c >= 42623 && c <= 42653)
                    : c <= 42735)
                  : (c <= 42783 || (c >= 42786 && c <= 42888)))))))
            : (c <= 42954 || (c < 43250
              ? (c < 43011
                ? (c < 42965
                  ? (c < 42963
                    ? (c >= 42960 && c <= 42961)
                    : c <= 42963)
                  : (c <= 42969 || (c >= 42994 && c <= 43009)))
                : (c <= 43013 || (c < 43072
                  ? (c < 43020
                    ? (c >= 43015 && c <= 43018)
                    : c <= 43042)
                  : (c <= 43123 || (c >= 43138 && c <= 43187)))))
              : (c <= 43255 || (c < 43360
                ? (c < 43274
                  ? (c < 43261
                    ? c == 43259
                    : c <= 43262)
                  : (c <= 43301 || (c >= 43312 && c <= 43334)))
                : (c <= 43388 || (c < 43488
                  ? (c < 43471
                    ? (c >= 43396 && c <= 43442)
                    : c <= 43471)
                  : (c <= 43492 || (c >= 43494 && c <= 43503)))))))))))))))
    : (c <= 43518 || (c < 70727
      ? (c < 66956
        ? (c < 64914
          ? (c < 43868
            ? (c < 43714
              ? (c < 43646
                ? (c < 43588
                  ? (c < 43584
                    ? (c >= 43520 && c <= 43560)
                    : c <= 43586)
                  : (c <= 43595 || (c < 43642
                    ? (c >= 43616 && c <= 43638)
                    : c <= 43642)))
                : (c <= 43695 || (c < 43705
                  ? (c < 43701
                    ? c == 43697
                    : c <= 43702)
                  : (c <= 43709 || c == 43712))))
              : (c <= 43714 || (c < 43785
                ? (c < 43762
                  ? (c < 43744
                    ? (c >= 43739 && c <= 43741)
                    : c <= 43754)
                  : (c <= 43764 || (c >= 43777 && c <= 43782)))
                : (c <= 43790 || (c < 43816
                  ? (c < 43808
                    ? (c >= 43793 && c <= 43798)
                    : c <= 43814)
                  : (c <= 43822 || (c >= 43824 && c <= 43866)))))))
            : (c <= 43881 || (c < 64287
              ? (c < 63744
                ? (c < 55216
                  ? (c < 44032
                    ? (c >= 43888 && c <= 44002)
                    : c <= 55203)
                  : (c <= 55238 || (c >= 55243 && c <= 55291)))
                : (c <= 64109 || (c < 64275
                  ? (c < 64256
                    ? (c >= 64112 && c <= 64217)
                    : c <= 64262)
                  : (c <= 64279 || c == 64285))))
              : (c <= 64296 || (c < 64323
                ? (c < 64318
                  ? (c < 64312
                    ? (c >= 64298 && c <= 64310)
                    : c <= 64316)
                  : (c <= 64318 || (c >= 64320 && c <= 64321)))
                : (c <= 64324 || (c < 64612
                  ? (c < 64467
                    ? (c >= 64326 && c <= 64433)
                    : c <= 64605)
                  : (c <= 64829 || (c >= 64848 && c <= 64911)))))))))
          : (c <= 64967 || (c < 65599
            ? (c < 65382
              ? (c < 65147
                ? (c < 65139
                  ? (c < 65137
                    ? (c >= 65008 && c <= 65017)
                    : c <= 65137)
                  : (c <= 65139 || (c < 65145
                    ? c == 65143
                    : c <= 65145)))
                : (c <= 65147 || (c < 65313
                  ? (c < 65151
                    ? c == 65149
                    : c <= 65276)
                  : (c <= 65338 || (c >= 65345 && c <= 65370)))))
              : (c <= 65437 || (c < 65498
                ? (c < 65482
                  ? (c < 65474
                    ? (c >= 65440 && c <= 65470)
                    : c <= 65479)
                  : (c <= 65487 || (c >= 65490 && c <= 65495)))
                : (c <= 65500 || (c < 65576
                  ? (c < 65549
                    ? (c >= 65536 && c <= 65547)
                    : c <= 65574)
                  : (c <= 65594 || (c >= 65596 && c <= 65597)))))))
            : (c <= 65613 || (c < 66464
              ? (c < 66208
                ? (c < 65856
                  ? (c < 65664
                    ? (c >= 65616 && c <= 65629)
                    : c <= 65786)
                  : (c <= 65908 || (c >= 66176 && c <= 66204)))
                : (c <= 66256 || (c < 66384
                  ? (c < 66349
                    ? (c >= 66304 && c <= 66335)
                    : c <= 66378)
                  : (c <= 66421 || (c >= 66432 && c <= 66461)))))
              : (c <= 66499 || (c < 66776
                ? (c < 66560
                  ? (c < 66513
                    ? (c >= 66504 && c <= 66511)
                    : c <= 66517)
                  : (c <= 66717 || (c >= 66736 && c <= 66771)))
                : (c <= 66811 || (c < 66928
                  ? (c < 66864
                    ? (c >= 66816 && c <= 66855)
                    : c <= 66915)
                  : (c <= 66938 || (c >= 66940 && c <= 66954)))))))))))
        : (c <= 66962 || (c < 68864
          ? (c < 67828
            ? (c < 67506
              ? (c < 67072
                ? (c < 66979
                  ? (c < 66967
                    ? (c >= 66964 && c <= 66965)
                    : c <= 66977)
                  : (c <= 66993 || (c < 67003
                    ? (c >= 66995 && c <= 67001)
                    : c <= 67004)))
                : (c <= 67382 || (c < 67456
                  ? (c < 67424
                    ? (c >= 67392 && c <= 67413)
                    : c <= 67431)
                  : (c <= 67461 || (c >= 67463 && c <= 67504)))))
              : (c <= 67514 || (c < 67644
                ? (c < 67594
                  ? (c < 67592
                    ? (c >= 67584 && c <= 67589)
                    : c <= 67592)
                  : (c <= 67637 || (c >= 67639 && c <= 67640)))
                : (c <= 67644 || (c < 67712
                  ? (c < 67680
                    ? (c >= 67647 && c <= 67669)
                    : c <= 67702)
                  : (c <= 67742 || (c >= 67808 && c <= 67826)))))))
            : (c <= 67829 || (c < 68224
              ? (c < 68096
                ? (c < 67968
                  ? (c < 67872
                    ? (c >= 67840 && c <= 67861)
                    : c <= 67897)
                  : (c <= 68023 || (c >= 68030 && c <= 68031)))
                : (c <= 68096 || (c < 68121
                  ? (c < 68117
                    ? (c >= 68112 && c <= 68115)
                    : c <= 68119)
                  : (c <= 68149 || (c >= 68192 && c <= 68220)))))
              : (c <= 68252 || (c < 68448
                ? (c < 68352
                  ? (c < 68297
                    ? (c >= 68288 && c <= 68295)
                    : c <= 68324)
                  : (c <= 68405 || (c >= 68416 && c <= 68437)))
                : (c <= 68466 || (c < 68736
                  ? (c < 68608
                    ? (c >= 68480 && c <= 68497)
                    : c <= 68680)
                  : (c <= 68786 || (c >= 68800 && c <= 68850)))))))))
          : (c <= 68899 || (c < 70106
            ? (c < 69749
              ? (c < 69488
                ? (c < 69376
                  ? (c < 69296
                    ? (c >= 69248 && c <= 69289)
                    : c <= 69297)
                  : (c <= 69404 || (c < 69424
                    ? c == 69415
                    : c <= 69445)))
                : (c <= 69505 || (c < 69635
                  ? (c < 69600
                    ? (c >= 69552 && c <= 69572)
                    : c <= 69622)
                  : (c <= 69687 || (c >= 69745 && c <= 69746)))))
              : (c <= 69749 || (c < 69959
                ? (c < 69891
                  ? (c < 69840
                    ? (c >= 69763 && c <= 69807)
                    : c <= 69864)
                  : (c <= 69926 || c == 69956))
                : (c <= 69959 || (c < 70019
                  ? (c < 70006
                    ? (c >= 69968 && c <= 70002)
                    : c <= 70006)
                  : (c <= 70066 || (c >= 70081 && c <= 70084)))))))
            : (c <= 70106 || (c < 70405
              ? (c < 70280
                ? (c < 70163
                  ? (c < 70144
                    ? c == 70108
                    : c <= 70161)
                  : (c <= 70187 || (c >= 70272 && c <= 70278)))
                : (c <= 70280 || (c < 70303
                  ? (c < 70287
                    ? (c >= 70282 && c <= 70285)
                    : c <= 70301)
                  : (c <= 70312 || (c >= 70320 && c <= 70366)))))
              : (c <= 70412 || (c < 70453
                ? (c < 70442
                  ? (c < 70419
                    ? (c >= 70415 && c <= 70416)
                    : c <= 70440)
                  : (c <= 70448 || (c >= 70450 && c <= 70451)))
                : (c <= 70457 || (c < 70493
                  ? (c < 70480
                    ? c == 70461
                    : c <= 70480)
                  : (c <= 70497 || (c >= 70656 && c <= 70708)))))))))))))
      : (c <= 70730 || (c < 119894
        ? (c < 73056
          ? (c < 72001
            ? (c < 71424
              ? (c < 71128
                ? (c < 70852
                  ? (c < 70784
                    ? (c >= 70751 && c <= 70753)
                    : c <= 70831)
                  : (c <= 70853 || (c < 71040
                    ? c == 70855
                    : c <= 71086)))
                : (c <= 71131 || (c < 71296
                  ? (c < 71236
                    ? (c >= 71168 && c <= 71215)
                    : c <= 71236)
                  : (c <= 71338 || c == 71352))))
              : (c <= 71450 || (c < 71945
                ? (c < 71840
                  ? (c < 71680
                    ? (c >= 71488 && c <= 71494)
                    : c <= 71723)
                  : (c <= 71903 || (c >= 71935 && c <= 71942)))
                : (c <= 71945 || (c < 71960
                  ? (c < 71957
                    ? (c >= 71948 && c <= 71955)
                    : c <= 71958)
                  : (c <= 71983 || c == 71999))))))
            : (c <= 72001 || (c < 72349
              ? (c < 72192
                ? (c < 72161
                  ? (c < 72106
                    ? (c >= 72096 && c <= 72103)
                    : c <= 72144)
                  : (c <= 72161 || c == 72163))
                : (c <= 72192 || (c < 72272
                  ? (c < 72250
                    ? (c >= 72203 && c <= 72242)
                    : c <= 72250)
                  : (c <= 72272 || (c >= 72284 && c <= 72329)))))
              : (c <= 72349 || (c < 72818
                ? (c < 72714
                  ? (c < 72704
                    ? (c >= 72368 && c <= 72440)
                    : c <= 72712)
                  : (c <= 72750 || c == 72768))
                : (c <= 72847 || (c < 72971
                  ? (c < 72968
                    ? (c >= 72960 && c <= 72966)
                    : c <= 72969)
                  : (c <= 73008 || c == 73030))))))))
          : (c <= 73061 || (c < 93952
            ? (c < 82944
              ? (c < 73728
                ? (c < 73112
                  ? (c < 73066
                    ? (c >= 73063 && c <= 73064)
                    : c <= 73097)
                  : (c <= 73112 || (c < 73648
                    ? (c >= 73440 && c <= 73458)
                    : c <= 73648)))
                : (c <= 74649 || (c < 77712
                  ? (c < 74880
                    ? (c >= 74752 && c <= 74862)
                    : c <= 75075)
                  : (c <= 77808 || (c >= 77824 && c <= 78894)))))
              : (c <= 83526 || (c < 92928
                ? (c < 92784
                  ? (c < 92736
                    ? (c >= 92160 && c <= 92728)
                    : c <= 92766)
                  : (c <= 92862 || (c >= 92880 && c <= 92909)))
                : (c <= 92975 || (c < 93053
                  ? (c < 93027
                    ? (c >= 92992 && c <= 92995)
                    : c <= 93047)
                  : (c <= 93071 || (c >= 93760 && c <= 93823)))))))
            : (c <= 94026 || (c < 110589
              ? (c < 94208
                ? (c < 94176
                  ? (c < 94099
                    ? c == 94032
                    : c <= 94111)
                  : (c <= 94177 || c == 94179))
                : (c <= 100343 || (c < 110576
                  ? (c < 101632
                    ? (c >= 100352 && c <= 101589)
                    : c <= 101640)
                  : (c <= 110579 || (c >= 110581 && c <= 110587)))))
              : (c <= 110590 || (c < 113664
                ? (c < 110948
                  ? (c < 110928
                    ? (c >= 110592 && c <= 110882)
                    : c <= 110930)
                  : (c <= 110951 || (c >= 110960 && c <= 111355)))
                : (c <= 113770 || (c < 113808
                  ? (c < 113792
                    ? (c >= 113776 && c <= 113788)
                    : c <= 113800)
                  : (c <= 113817 || (c >= 119808 && c <= 119892)))))))))))
        : (c <= 119964 || (c < 125259
          ? (c < 120572
            ? (c < 120086
              ? (c < 119995
                ? (c < 119973
                  ? (c < 119970
                    ? (c >= 119966 && c <= 119967)
                    : c <= 119970)
                  : (c <= 119974 || (c < 119982
                    ? (c >= 119977 && c <= 119980)
                    : c <= 119993)))
                : (c <= 119995 || (c < 120071
                  ? (c < 120005
                    ? (c >= 119997 && c <= 120003)
                    : c <= 120069)
                  : (c <= 120074 || (c >= 120077 && c <= 120084)))))
              : (c <= 120092 || (c < 120138
                ? (c < 120128
                  ? (c < 120123
                    ? (c >= 120094 && c <= 120121)
                    : c <= 120126)
                  : (c <= 120132 || c == 120134))
                : (c <= 120144 || (c < 120514
                  ? (c < 120488
                    ? (c >= 120146 && c <= 120485)
                    : c <= 120512)
                  : (c <= 120538 || (c >= 120540 && c <= 120570)))))))
            : (c <= 120596 || (c < 123191
              ? (c < 120714
                ? (c < 120656
                  ? (c < 120630
                    ? (c >= 120598 && c <= 120628)
                    : c <= 120654)
                  : (c <= 120686 || (c >= 120688 && c <= 120712)))
                : (c <= 120744 || (c < 122624
                  ? (c < 120772
                    ? (c >= 120746 && c <= 120770)
                    : c <= 120779)
                  : (c <= 122654 || (c >= 123136 && c <= 123180)))))
              : (c <= 123197 || (c < 124904
                ? (c < 123584
                  ? (c < 123536
                    ? c == 123214
                    : c <= 123565)
                  : (c <= 123627 || (c >= 124896 && c <= 124902)))
                : (c <= 124907 || (c < 124928
                  ? (c < 124912
                    ? (c >= 124909 && c <= 124910)
                    : c <= 124926)
                  : (c <= 125124 || (c >= 125184 && c <= 125251)))))))))
          : (c <= 125259 || (c < 126559
            ? (c < 126535
              ? (c < 126505
                ? (c < 126497
                  ? (c < 126469
                    ? (c >= 126464 && c <= 126467)
                    : c <= 126495)
                  : (c <= 126498 || (c < 126503
                    ? c == 126500
                    : c <= 126503)))
                : (c <= 126514 || (c < 126523
                  ? (c < 126521
                    ? (c >= 126516 && c <= 126519)
                    : c <= 126521)
                  : (c <= 126523 || c == 126530))))
              : (c <= 126535 || (c < 126548
                ? (c < 126541
                  ? (c < 126539
                    ? c == 126537
                    : c <= 126539)
                  : (c <= 126543 || (c >= 126545 && c <= 126546)))
                : (c <= 126548 || (c < 126555
                  ? (c < 126553
                    ? c == 126551
                    : c <= 126553)
                  : (c <= 126555 || c == 126557))))))
            : (c <= 126559 || (c < 126625
              ? (c < 126580
                ? (c < 126567
                  ? (c < 126564
                    ? (c >= 126561 && c <= 126562)
                    : c <= 126564)
                  : (c <= 126570 || (c >= 126572 && c <= 126578)))
                : (c <= 126583 || (c < 126592
                  ? (c < 126590
                    ? (c >= 126585 && c <= 126588)
                    : c <= 126590)
                  : (c <= 126601 || (c >= 126603 && c <= 126619)))))
              : (c <= 126627 || (c < 177984
                ? (c < 131072
                  ? (c < 126635
                    ? (c >= 126629 && c <= 126633)
                    : c <= 126651)
                  : (c <= 173791 || (c >= 173824 && c <= 177976)))
                : (c <= 178205 || (c < 194560
                  ? (c < 183984
                    ? (c >= 178208 && c <= 183969)
                    : c <= 191456)
                  : (c <= 195101 || (c >= 196608 && c <= 201546)))))))))))))))));
}

static inline bool sym_identifier_character_set_2(int32_t c) {
  return (c < 43616
    ? (c < 3782
      ? (c < 2748
        ? (c < 2045
          ? (c < 1015
            ? (c < 710
              ? (c < 181
                ? (c < '_'
                  ? (c < 'A'
                    ? (c >= '0' && c <= '9')
                    : c <= 'Z')
                  : (c <= '_' || (c < 170
                    ? (c >= 'a' && c <= 'z')
                    : c <= 170)))
                : (c <= 181 || (c < 192
                  ? (c < 186
                    ? c == 183
                    : c <= 186)
                  : (c <= 214 || (c < 248
                    ? (c >= 216 && c <= 246)
                    : c <= 705)))))
              : (c <= 721 || (c < 891
                ? (c < 750
                  ? (c < 748
                    ? (c >= 736 && c <= 740)
                    : c <= 748)
                  : (c <= 750 || (c < 886
                    ? (c >= 768 && c <= 884)
                    : c <= 887)))
                : (c <= 893 || (c < 908
                  ? (c < 902
                    ? c == 895
                    : c <= 906)
                  : (c <= 908 || (c < 931
                    ? (c >= 910 && c <= 929)
                    : c <= 1013)))))))
            : (c <= 1153 || (c < 1519
              ? (c < 1425
                ? (c < 1329
                  ? (c < 1162
                    ? (c >= 1155 && c <= 1159)
                    : c <= 1327)
                  : (c <= 1366 || (c < 1376
                    ? c == 1369
                    : c <= 1416)))
                : (c <= 1469 || (c < 1476
                  ? (c < 1473
                    ? c == 1471
                    : c <= 1474)
                  : (c <= 1477 || (c < 1488
                    ? c == 1479
                    : c <= 1514)))))
              : (c <= 1522 || (c < 1770
                ? (c < 1646
                  ? (c < 1568
                    ? (c >= 1552 && c <= 1562)
                    : c <= 1641)
                  : (c <= 1747 || (c < 1759
                    ? (c >= 1749 && c <= 1756)
                    : c <= 1768)))
                : (c <= 1788 || (c < 1869
                  ? (c < 1808
                    ? c == 1791
                    : c <= 1866)
                  : (c <= 1969 || (c < 2042
                    ? (c >= 1984 && c <= 2037)
                    : c <= 2042)))))))))
          : (c <= 2045 || (c < 2558
            ? (c < 2451
              ? (c < 2200
                ? (c < 2144
                  ? (c < 2112
                    ? (c >= 2048 && c <= 2093)
                    : c <= 2139)
                  : (c <= 2154 || (c < 2185
                    ? (c >= 2160 && c <= 2183)
                    : c <= 2190)))
                : (c <= 2273 || (c < 2417
                  ? (c < 2406
                    ? (c >= 2275 && c <= 2403)
                    : c <= 2415)
                  : (c <= 2435 || (c < 2447
                    ? (c >= 2437 && c <= 2444)
                    : c <= 2448)))))
              : (c <= 2472 || (c < 2507
                ? (c < 2486
                  ? (c < 2482
                    ? (c >= 2474 && c <= 2480)
                    : c <= 2482)
                  : (c <= 2489 || (c < 2503
                    ? (c >= 2492 && c <= 2500)
                    : c <= 2504)))
                : (c <= 2510 || (c < 2527
                  ? (c < 2524
                    ? c == 2519
                    : c <= 2525)
                  : (c <= 2531 || (c < 2556
                    ? (c >= 2534 && c <= 2545)
                    : c <= 2556)))))))
            : (c <= 2558 || (c < 2635
              ? (c < 2610
                ? (c < 2575
                  ? (c < 2565
                    ? (c >= 2561 && c <= 2563)
                    : c <= 2570)
                  : (c <= 2576 || (c < 2602
                    ? (c >= 2579 && c <= 2600)
                    : c <= 2608)))
                : (c <= 2611 || (c < 2620
                  ? (c < 2616
                    ? (c >= 2613 && c <= 2614)
                    : c <= 2617)
                  : (c <= 2620 || (c < 2631
                    ? (c >= 2622 && c <= 2626)
                    : c <= 2632)))))
              : (c <= 2637 || (c < 2693
                ? (c < 2654
                  ? (c < 2649
                    ? c == 2641
                    : c <= 2652)
                  : (c <= 2654 || (c < 2689
                    ? (c >= 2662 && c <= 2677)
                    : c <= 2691)))
                : (c <= 2701 || (c < 2730
                  ? (c < 2707
                    ? (c >= 2703 && c <= 2705)
                    : c <= 2728)
                  : (c <= 2736 || (c < 2741
                    ? (c >= 2738 && c <= 2739)
                    : c <= 2745)))))))))))
        : (c <= 2757 || (c < 3168
          ? (c < 2958
            ? (c < 2866
              ? (c < 2809
                ? (c < 2768
                  ? (c < 2763
                    ? (c >= 2759 && c <= 2761)
                    : c <= 2765)
                  : (c <= 2768 || (c < 2790
                    ? (c >= 2784 && c <= 2787)
                    : c <= 2799)))
                : (c <= 2815 || (c < 2831
                  ? (c < 2821
                    ? (c >= 2817 && c <= 2819)
                    : c <= 2828)
                  : (c <= 2832 || (c < 2858
                    ? (c >= 2835 && c <= 2856)
                    : c <= 2864)))))
              : (c <= 2867 || (c < 2908
                ? (c < 2887
                  ? (c < 2876
                    ? (c >= 2869 && c <= 2873)
                    : c <= 2884)
                  : (c <= 2888 || (c < 2901
                    ? (c >= 2891 && c <= 2893)
                    : c <= 2903)))
                : (c <= 2909 || (c < 2929
                  ? (c < 2918
                    ? (c >= 2911 && c <= 2915)
                    : c <= 2927)
                  : (c <= 2929 || (c < 2949
                    ? (c >= 2946 && c <= 2947)
                    : c <= 2954)))))))
            : (c <= 2960 || (c < 3031
              ? (c < 2984
                ? (c < 2972
                  ? (c < 2969
                    ? (c >= 2962 && c <= 2965)
                    : c <= 2970)
                  : (c <= 2972 || (c < 2979
                    ? (c >= 2974 && c <= 2975)
                    : c <= 2980)))
                : (c <= 2986 || (c < 3014
                  ? (c < 3006
                    ? (c >= 2990 && c <= 3001)
                    : c <= 3010)
                  : (c <= 3016 || (c < 3024
                    ? (c >= 3018 && c <= 3021)
                    : c <= 3024)))))
              : (c <= 3031 || (c < 3132
                ? (c < 3086
                  ? (c < 3072
                    ? (c >= 3046 && c <= 3055)
                    : c <= 3084)
                  : (c <= 3088 || (c < 3114
                    ? (c >= 3090 && c <= 3112)
                    : c <= 3129)))
                : (c <= 3140 || (c < 3157
                  ? (c < 3146
                    ? (c >= 3142 && c <= 3144)
                    : c <= 3149)
                  : (c <= 3158 || (c < 3165
                    ? (c >= 3160 && c <= 3162)
                    : c <= 3165)))))))))
          : (c <= 3171 || (c < 3450
            ? (c < 3293
              ? (c < 3242
                ? (c < 3205
                  ? (c < 3200
                    ? (c >= 3174 && c <= 3183)
                    : c <= 3203)
                  : (c <= 3212 || (c < 3218
                    ? (c >= 3214 && c <= 3216)
                    : c <= 3240)))
                : (c <= 3251 || (c < 3270
                  ? (c < 3260
                    ? (c >= 3253 && c <= 3257)
                    : c <= 3268)
                  : (c <= 3272 || (c < 3285
                    ? (c >= 3274 && c <= 3277)
                    : c <= 3286)))))
              : (c <= 3294 || (c < 3346
                ? (c < 3313
                  ? (c < 3302
                    ? (c >= 3296 && c <= 3299)
                    : c <= 3311)
                  : (c <= 3314 || (c < 3342
                    ? (c >= 3328 && c <= 3340)
                    : c <= 3344)))
                : (c <= 3396 || (c < 3412
                  ? (c < 3402
                    ? (c >= 3398 && c <= 3400)
                    : c <= 3406)
                  : (c <= 3415 || (c < 3430
                    ? (c >= 3423 && c <= 3427)
                    : c <= 3439)))))))
            : (c <= 3455 || (c < 3570
              ? (c < 3520
                ? (c < 3482
                  ? (c < 3461
                    ? (c >= 3457 && c <= 3459)
                    : c <= 3478)
                  : (c <= 3505 || (c < 3517
                    ? (c >= 3507 && c <= 3515)
                    : c <= 3517)))
                : (c <= 3526 || (c < 3542
                  ? (c < 3535
                    ? c == 3530
                    : c <= 3540)
                  : (c <= 3542 || (c < 3558
                    ? (c >= 3544 && c <= 3551)
                    : c <= 3567)))))
              : (c <= 3571 || (c < 3718
                ? (c < 3664
                  ? (c < 3648
                    ? (c >= 3585 && c <= 3642)
                    : c <= 3662)
                  : (c <= 3673 || (c < 3716
                    ? (c >= 3713 && c <= 3714)
                    : c <= 3716)))
                : (c <= 3722 || (c < 3751
                  ? (c < 3749
                    ? (c >= 3724 && c <= 3747)
                    : c <= 3749)
                  : (c <= 3773 || (c >= 3776 && c <= 3780)))))))))))))
      : (c <= 3782 || (c < 8025
        ? (c < 5888
          ? (c < 4688
            ? (c < 3953
              ? (c < 3872
                ? (c < 3804
                  ? (c < 3792
                    ? (c >= 3784 && c <= 3789)
                    : c <= 3801)
                  : (c <= 3807 || (c < 3864
                    ? c == 3840
                    : c <= 3865)))
                : (c <= 3881 || (c < 3897
                  ? (c < 3895
                    ? c == 3893
                    : c <= 3895)
                  : (c <= 3897 || (c < 3913
                    ? (c >= 3902 && c <= 3911)
                    : c <= 3948)))))
              : (c <= 3972 || (c < 4256
                ? (c < 4038
                  ? (c < 3993
                    ? (c >= 3974 && c <= 3991)
                    : c <= 4028)
                  : (c <= 4038 || (c < 4176
                    ? (c >= 4096 && c <= 4169)
                    : c <= 4253)))
                : (c <= 4293 || (c < 4304
                  ? (c < 4301
                    ? c == 4295
                    : c <= 4301)
                  : (c <= 4346 || (c < 4682
                    ? (c >= 4348 && c <= 4680)
                    : c <= 4685)))))))
            : (c <= 4694 || (c < 4882
              ? (c < 4786
                ? (c < 4704
                  ? (c < 4698
                    ? c == 4696
                    : c <= 4701)
                  : (c <= 4744 || (c < 4752
                    ? (c >= 4746 && c <= 4749)
                    : c <= 4784)))
                : (c <= 4789 || (c < 4802
                  ? (c < 4800
                    ? (c >= 4792 && c <= 4798)
                    : c <= 4800)
                  : (c <= 4805 || (c < 4824
                    ? (c >= 4808 && c <= 4822)
                    : c <= 4880)))))
              : (c <= 4885 || (c < 5112
                ? (c < 4969
                  ? (c < 4957
                    ? (c >= 4888 && c <= 4954)
                    : c <= 4959)
                  : (c <= 4977 || (c < 5024
                    ? (c >= 4992 && c <= 5007)
                    : c <= 5109)))
                : (c <= 5117 || (c < 5761
                  ? (c < 5743
                    ? (c >= 5121 && c <= 5740)
                    : c <= 5759)
                  : (c <= 5786 || (c < 5870
                    ? (c >= 5792 && c <= 5866)
                    : c <= 5880)))))))))
          : (c <= 5909 || (c < 6688
            ? (c < 6176
              ? (c < 6016
                ? (c < 5984
                  ? (c < 5952
                    ? (c >= 5919 && c <= 5940)
                    : c <= 5971)
                  : (c <= 5996 || (c < 6002
                    ? (c >= 5998 && c <= 6000)
                    : c <= 6003)))
                : (c <= 6099 || (c < 6112
                  ? (c < 6108
                    ? c == 6103
                    : c <= 6109)
                  : (c <= 6121 || (c < 6159
                    ? (c >= 6155 && c <= 6157)
                    : c <= 6169)))))
              : (c <= 6264 || (c < 6470
                ? (c < 6400
                  ? (c < 6320
                    ? (c >= 6272 && c <= 6314)
                    : c <= 6389)
                  : (c <= 6430 || (c < 6448
                    ? (c >= 6432 && c <= 6443)
                    : c <= 6459)))
                : (c <= 6509 || (c < 6576
                  ? (c < 6528
                    ? (c >= 6512 && c <= 6516)
                    : c <= 6571)
                  : (c <= 6601 || (c < 6656
                    ? (c >= 6608 && c <= 6618)
                    : c <= 6683)))))))
            : (c <= 6750 || (c < 7232
              ? (c < 6847
                ? (c < 6800
                  ? (c < 6783
                    ? (c >= 6752 && c <= 6780)
                    : c <= 6793)
                  : (c <= 6809 || (c < 6832
                    ? c == 6823
                    : c <= 6845)))
                : (c <= 6862 || (c < 7019
                  ? (c < 6992
                    ? (c >= 6912 && c <= 6988)
                    : c <= 7001)
                  : (c <= 7027 || (c < 7168
                    ? (c >= 7040 && c <= 7155)
                    : c <= 7223)))))
              : (c <= 7241 || (c < 7380
                ? (c < 7312
                  ? (c < 7296
                    ? (c >= 7245 && c <= 7293)
                    : c <= 7304)
                  : (c <= 7354 || (c < 7376
                    ? (c >= 7357 && c <= 7359)
                    : c <= 7378)))
                : (c <= 7418 || (c < 7968
                  ? (c < 7960
                    ? (c >= 7424 && c <= 7957)
                    : c <= 7965)
                  : (c <= 8005 || (c < 8016
                    ? (c >= 8008 && c <= 8013)
                    : c <= 8023)))))))))))
        : (c <= 8025 || (c < 11720
          ? (c < 8458
            ? (c < 8178
              ? (c < 8126
                ? (c < 8031
                  ? (c < 8029
                    ? c == 8027
                    : c <= 8029)
                  : (c <= 8061 || (c < 8118
                    ? (c >= 8064 && c <= 8116)
                    : c <= 8124)))
                : (c <= 8126 || (c < 8144
                  ? (c < 8134
                    ? (c >= 8130 && c <= 8132)
                    : c <= 8140)
                  : (c <= 8147 || (c < 8160
                    ? (c >= 8150 && c <= 8155)
                    : c <= 8172)))))
              : (c <= 8180 || (c < 8336
                ? (c < 8276
                  ? (c < 8255
                    ? (c >= 8182 && c <= 8188)
                    : c <= 8256)
                  : (c <= 8276 || (c < 8319
                    ? c == 8305
                    : c <= 8319)))
                : (c <= 8348 || (c < 8421
                  ? (c < 8417
                    ? (c >= 8400 && c <= 8412)
                    : c <= 8417)
                  : (c <= 8432 || (c < 8455
                    ? c == 8450
                    : c <= 8455)))))))
            : (c <= 8467 || (c < 11499
              ? (c < 8490
                ? (c < 8484
                  ? (c < 8472
                    ? c == 8469
                    : c <= 8477)
                  : (c <= 8484 || (c < 8488
                    ? c == 8486
                    : c <= 8488)))
                : (c <= 8505 || (c < 8526
                  ? (c < 8517
                    ? (c >= 8508 && c <= 8511)
                    : c <= 8521)
                  : (c <= 8526 || (c < 11264
                    ? (c >= 8544 && c <= 8584)
                    : c <= 11492)))))
              : (c <= 11507 || (c < 11647
                ? (c < 11565
                  ? (c < 11559
                    ? (c >= 11520 && c <= 11557)
                    : c <= 11559)
                  : (c <= 11565 || (c < 11631
                    ? (c >= 11568 && c <= 11623)
                    : c <= 11631)))
                : (c <= 11670 || (c < 11696
                  ? (c < 11688
                    ? (c >= 11680 && c <= 11686)
                    : c <= 11694)
                  : (c <= 11702 || (c < 11712
                    ? (c >= 11704 && c <= 11710)
                    : c <= 11718)))))))))
          : (c <= 11726 || (c < 42623
            ? (c < 12540
              ? (c < 12337
                ? (c < 11744
                  ? (c < 11736
                    ? (c >= 11728 && c <= 11734)
                    : c <= 11742)
                  : (c <= 11775 || (c < 12321
                    ? (c >= 12293 && c <= 12295)
                    : c <= 12335)))
                : (c <= 12341 || (c < 12441
                  ? (c < 12353
                    ? (c >= 12344 && c <= 12348)
                    : c <= 12438)
                  : (c <= 12442 || (c < 12449
                    ? (c >= 12445 && c <= 12447)
                    : c <= 12538)))))
              : (c <= 12543 || (c < 19968
                ? (c < 12704
                  ? (c < 12593
                    ? (c >= 12549 && c <= 12591)
                    : c <= 12686)
                  : (c <= 12735 || (c < 13312
                    ? (c >= 12784 && c <= 12799)
                    : c <= 19903)))
                : (c <= 42124 || (c < 42512
                  ? (c < 42240
                    ? (c >= 42192 && c <= 42237)
                    : c <= 42508)
                  : (c <= 42539 || (c < 42612
                    ? (c >= 42560 && c <= 42607)
                    : c <= 42621)))))))
            : (c <= 42737 || (c < 43232
              ? (c < 42965
                ? (c < 42891
                  ? (c < 42786
                    ? (c >= 42775 && c <= 42783)
                    : c <= 42888)
                  : (c <= 42954 || (c < 42963
                    ? (c >= 42960 && c <= 42961)
                    : c <= 42963)))
                : (c <= 42969 || (c < 43072
                  ? (c < 43052
                    ? (c >= 42994 && c <= 43047)
                    : c <= 43052)
                  : (c <= 43123 || (c < 43216
                    ? (c >= 43136 && c <= 43205)
                    : c <= 43225)))))
              : (c <= 43255 || (c < 43471
                ? (c < 43312
                  ? (c < 43261
                    ? c == 43259
                    : c <= 43309)
                  : (c <= 43347 || (c < 43392
                    ? (c >= 43360 && c <= 43388)
                    : c <= 43456)))
                : (c <= 43481 || (c < 43584
                  ? (c < 43520
                    ? (c >= 43488 && c <= 43518)
                    : c <= 43574)
                  : (c <= 43597 || (c >= 43600 && c <= 43609)))))))))))))))
    : (c <= 43638 || (c < 71453
      ? (c < 67639
        ? (c < 65345
          ? (c < 64312
            ? (c < 43888
              ? (c < 43785
                ? (c < 43744
                  ? (c < 43739
                    ? (c >= 43642 && c <= 43714)
                    : c <= 43741)
                  : (c <= 43759 || (c < 43777
                    ? (c >= 43762 && c <= 43766)
                    : c <= 43782)))
                : (c <= 43790 || (c < 43816
                  ? (c < 43808
                    ? (c >= 43793 && c <= 43798)
                    : c <= 43814)
                  : (c <= 43822 || (c < 43868
                    ? (c >= 43824 && c <= 43866)
                    : c <= 43881)))))
              : (c <= 44010 || (c < 63744
                ? (c < 44032
                  ? (c < 44016
                    ? (c >= 44012 && c <= 44013)
                    : c <= 44025)
                  : (c <= 55203 || (c < 55243
                    ? (c >= 55216 && c <= 55238)
                    : c <= 55291)))
                : (c <= 64109 || (c < 64275
                  ? (c < 64256
                    ? (c >= 64112 && c <= 64217)
                    : c <= 64262)
                  : (c <= 64279 || (c < 64298
                    ? (c >= 64285 && c <= 64296)
                    : c <= 64310)))))))
            : (c <= 64316 || (c < 65075
              ? (c < 64612
                ? (c < 64323
                  ? (c < 64320
                    ? c == 64318
                    : c <= 64321)
                  : (c <= 64324 || (c < 64467
                    ? (c >= 64326 && c <= 64433)
                    : c <= 64605)))
                : (c <= 64829 || (c < 65008
                  ? (c < 64914
                    ? (c >= 64848 && c <= 64911)
                    : c <= 64967)
                  : (c <= 65017 || (c < 65056
                    ? (c >= 65024 && c <= 65039)
                    : c <= 65071)))))
              : (c <= 65076 || (c < 65147
                ? (c < 65139
                  ? (c < 65137
                    ? (c >= 65101 && c <= 65103)
                    : c <= 65137)
                  : (c <= 65139 || (c < 65145
                    ? c == 65143
                    : c <= 65145)))
                : (c <= 65147 || (c < 65296
                  ? (c < 65151
                    ? c == 65149
                    : c <= 65276)
                  : (c <= 65305 || (c < 65343
                    ? (c >= 65313 && c <= 65338)
                    : c <= 65343)))))))))
          : (c <= 65370 || (c < 66513
            ? (c < 65664
              ? (c < 65536
                ? (c < 65482
                  ? (c < 65474
                    ? (c >= 65382 && c <= 65470)
                    : c <= 65479)
                  : (c <= 65487 || (c < 65498
                    ? (c >= 65490 && c <= 65495)
                    : c <= 65500)))
                : (c <= 65547 || (c < 65596
                  ? (c < 65576
                    ? (c >= 65549 && c <= 65574)
                    : c <= 65594)
                  : (c <= 65597 || (c < 65616
                    ? (c >= 65599 && c <= 65613)
                    : c <= 65629)))))
              : (c <= 65786 || (c < 66304
                ? (c < 66176
                  ? (c < 66045
                    ? (c >= 65856 && c <= 65908)
                    : c <= 66045)
                  : (c <= 66204 || (c < 66272
                    ? (c >= 66208 && c <= 66256)
                    : c <= 66272)))
                : (c <= 66335 || (c < 66432
                  ? (c < 66384
                    ? (c >= 66349 && c <= 66378)
                    : c <= 66426)
                  : (c <= 66461 || (c < 66504
                    ? (c >= 66464 && c <= 66499)
                    : c <= 66511)))))))
            : (c <= 66517 || (c < 66979
              ? (c < 66864
                ? (c < 66736
                  ? (c < 66720
                    ? (c >= 66560 && c <= 66717)
                    : c <= 66729)
                  : (c <= 66771 || (c < 66816
                    ? (c >= 66776 && c <= 66811)
                    : c <= 66855)))
                : (c <= 66915 || (c < 66956
                  ? (c < 66940
                    ? (c >= 66928 && c <= 66938)
                    : c <= 66954)
                  : (c <= 66962 || (c < 66967
                    ? (c >= 66964 && c <= 66965)
                    : c <= 66977)))))
              : (c <= 66993 || (c < 67456
                ? (c < 67072
                  ? (c < 67003
                    ? (c >= 66995 && c <= 67001)
                    : c <= 67004)
                  : (c <= 67382 || (c < 67424
                    ? (c >= 67392 && c <= 67413)
                    : c <= 67431)))
                : (c <= 67461 || (c < 67584
                  ? (c < 67506
                    ? (c >= 67463 && c <= 67504)
                    : c <= 67514)
                  : (c <= 67589 || (c < 67594
                    ? c == 67592
                    : c <= 67637)))))))))))
        : (c <= 67640 || (c < 69956
          ? (c < 68448
            ? (c < 68101
              ? (c < 67828
                ? (c < 67680
                  ? (c < 67647
                    ? c == 67644
                    : c <= 67669)
                  : (c <= 67702 || (c < 67808
                    ? (c >= 67712 && c <= 67742)
                    : c <= 67826)))
                : (c <= 67829 || (c < 67968
                  ? (c < 67872
                    ? (c >= 67840 && c <= 67861)
                    : c <= 67897)
                  : (c <= 68023 || (c < 68096
                    ? (c >= 68030 && c <= 68031)
                    : c <= 68099)))))
              : (c <= 68102 || (c < 68192
                ? (c < 68121
                  ? (c < 68117
                    ? (c >= 68108 && c <= 68115)
                    : c <= 68119)
                  : (c <= 68149 || (c < 68159
                    ? (c >= 68152 && c <= 68154)
                    : c <= 68159)))
                : (c <= 68220 || (c < 68297
                  ? (c < 68288
                    ? (c >= 68224 && c <= 68252)
                    : c <= 68295)
                  : (c <= 68326 || (c < 68416
                    ? (c >= 68352 && c <= 68405)
                    : c <= 68437)))))))
            : (c <= 68466 || (c < 69424
              ? (c < 68912
                ? (c < 68736
                  ? (c < 68608
                    ? (c >= 68480 && c <= 68497)
                    : c <= 68680)
                  : (c <= 68786 || (c < 68864
                    ? (c >= 68800 && c <= 68850)
                    : c <= 68903)))
                : (c <= 68921 || (c < 69296
                  ? (c < 69291
                    ? (c >= 69248 && c <= 69289)
                    : c <= 69292)
                  : (c <= 69297 || (c < 69415
                    ? (c >= 69376 && c <= 69404)
                    : c <= 69415)))))
              : (c <= 69456 || (c < 69759
                ? (c < 69600
                  ? (c < 69552
                    ? (c >= 69488 && c <= 69509)
                    : c <= 69572)
                  : (c <= 69622 || (c < 69734
                    ? (c >= 69632 && c <= 69702)
                    : c <= 69749)))
                : (c <= 69818 || (c < 69872
                  ? (c < 69840
                    ? c == 69826
                    : c <= 69864)
                  : (c <= 69881 || (c < 69942
                    ? (c >= 69888 && c <= 69940)
                    : c <= 69951)))))))))
          : (c <= 69959 || (c < 70459
            ? (c < 70282
              ? (c < 70108
                ? (c < 70016
                  ? (c < 70006
                    ? (c >= 69968 && c <= 70003)
                    : c <= 70006)
                  : (c <= 70084 || (c < 70094
                    ? (c >= 70089 && c <= 70092)
                    : c <= 70106)))
                : (c <= 70108 || (c < 70206
                  ? (c < 70163
                    ? (c >= 70144 && c <= 70161)
                    : c <= 70199)
                  : (c <= 70206 || (c < 70280
                    ? (c >= 70272 && c <= 70278)
                    : c <= 70280)))))
              : (c <= 70285 || (c < 70405
                ? (c < 70320
                  ? (c < 70303
                    ? (c >= 70287 && c <= 70301)
                    : c <= 70312)
                  : (c <= 70378 || (c < 70400
                    ? (c >= 70384 && c <= 70393)
                    : c <= 70403)))
                : (c <= 70412 || (c < 70442
                  ? (c < 70419
                    ? (c >= 70415 && c <= 70416)
                    : c <= 70440)
                  : (c <= 70448 || (c < 70453
                    ? (c >= 70450 && c <= 70451)
                    : c <= 70457)))))))
            : (c <= 70468 || (c < 70855
              ? (c < 70502
                ? (c < 70480
                  ? (c < 70475
                    ? (c >= 70471 && c <= 70472)
                    : c <= 70477)
                  : (c <= 70480 || (c < 70493
                    ? c == 70487
                    : c <= 70499)))
                : (c <= 70508 || (c < 70736
                  ? (c < 70656
                    ? (c >= 70512 && c <= 70516)
                    : c <= 70730)
                  : (c <= 70745 || (c < 70784
                    ? (c >= 70750 && c <= 70753)
                    : c <= 70853)))))
              : (c <= 70855 || (c < 71236
                ? (c < 71096
                  ? (c < 71040
                    ? (c >= 70864 && c <= 70873)
                    : c <= 71093)
                  : (c <= 71104 || (c < 71168
                    ? (c >= 71128 && c <= 71133)
                    : c <= 71232)))
                : (c <= 71236 || (c < 71360
                  ? (c < 71296
                    ? (c >= 71248 && c <= 71257)
                    : c <= 71352)
                  : (c <= 71369 || (c >= 71424 && c <= 71450)))))))))))))
      : (c <= 71467 || (c < 119973
        ? (c < 77824
          ? (c < 72760
            ? (c < 72016
              ? (c < 71945
                ? (c < 71680
                  ? (c < 71488
                    ? (c >= 71472 && c <= 71481)
                    : c <= 71494)
                  : (c <= 71738 || (c < 71935
                    ? (c >= 71840 && c <= 71913)
                    : c <= 71942)))
                : (c <= 71945 || (c < 71960
                  ? (c < 71957
                    ? (c >= 71948 && c <= 71955)
                    : c <= 71958)
                  : (c <= 71989 || (c < 71995
                    ? (c >= 71991 && c <= 71992)
                    : c <= 72003)))))
              : (c <= 72025 || (c < 72263
                ? (c < 72154
                  ? (c < 72106
                    ? (c >= 72096 && c <= 72103)
                    : c <= 72151)
                  : (c <= 72161 || (c < 72192
                    ? (c >= 72163 && c <= 72164)
                    : c <= 72254)))
                : (c <= 72263 || (c < 72368
                  ? (c < 72349
                    ? (c >= 72272 && c <= 72345)
                    : c <= 72349)
                  : (c <= 72440 || (c < 72714
                    ? (c >= 72704 && c <= 72712)
                    : c <= 72758)))))))
            : (c <= 72768 || (c < 73056
              ? (c < 72968
                ? (c < 72850
                  ? (c < 72818
                    ? (c >= 72784 && c <= 72793)
                    : c <= 72847)
                  : (c <= 72871 || (c < 72960
                    ? (c >= 72873 && c <= 72886)
                    : c <= 72966)))
                : (c <= 72969 || (c < 73020
                  ? (c < 73018
                    ? (c >= 72971 && c <= 73014)
                    : c <= 73018)
                  : (c <= 73021 || (c < 73040
                    ? (c >= 73023 && c <= 73031)
                    : c <= 73049)))))
              : (c <= 73061 || (c < 73440
                ? (c < 73104
                  ? (c < 73066
                    ? (c >= 73063 && c <= 73064)
                    : c <= 73102)
                  : (c <= 73105 || (c < 73120
                    ? (c >= 73107 && c <= 73112)
                    : c <= 73129)))
                : (c <= 73462 || (c < 74752
                  ? (c < 73728
                    ? c == 73648
                    : c <= 74649)
                  : (c <= 74862 || (c < 77712
                    ? (c >= 74880 && c <= 75075)
                    : c <= 77808)))))))))
          : (c <= 78894 || (c < 110576
            ? (c < 93027
              ? (c < 92864
                ? (c < 92736
                  ? (c < 92160
                    ? (c >= 82944 && c <= 83526)
                    : c <= 92728)
                  : (c <= 92766 || (c < 92784
                    ? (c >= 92768 && c <= 92777)
                    : c <= 92862)))
                : (c <= 92873 || (c < 92928
                  ? (c < 92912
                    ? (c >= 92880 && c <= 92909)
                    : c <= 92916)
                  : (c <= 92982 || (c < 93008
                    ? (c >= 92992 && c <= 92995)
                    : c <= 93017)))))
              : (c <= 93047 || (c < 94176
                ? (c < 93952
                  ? (c < 93760
                    ? (c >= 93053 && c <= 93071)
                    : c <= 93823)
                  : (c <= 94026 || (c < 94095
                    ? (c >= 94031 && c <= 94087)
                    : c <= 94111)))
                : (c <= 94177 || (c < 94208
                  ? (c < 94192
                    ? (c >= 94179 && c <= 94180)
                    : c <= 94193)
                  : (c <= 100343 || (c < 101632
                    ? (c >= 100352 && c <= 101589)
                    : c <= 101640)))))))
            : (c <= 110579 || (c < 118528
              ? (c < 110960
                ? (c < 110592
                  ? (c < 110589
                    ? (c >= 110581 && c <= 110587)
                    : c <= 110590)
                  : (c <= 110882 || (c < 110948
                    ? (c >= 110928 && c <= 110930)
                    : c <= 110951)))
                : (c <= 111355 || (c < 113792
                  ? (c < 113776
                    ? (c >= 113664 && c <= 113770)
                    : c <= 113788)
                  : (c <= 113800 || (c < 113821
                    ? (c >= 113808 && c <= 113817)
                    : c <= 113822)))))
              : (c <= 118573 || (c < 119210
                ? (c < 119149
                  ? (c < 119141
                    ? (c >= 118576 && c <= 118598)
                    : c <= 119145)
                  : (c <= 119154 || (c < 119173
                    ? (c >= 119163 && c <= 119170)
                    : c <= 119179)))
                : (c <= 119213 || (c < 119894
                  ? (c < 119808
                    ? (c >= 119362 && c <= 119364)
                    : c <= 119892)
                  : (c <= 119964 || (c < 119970
                    ? (c >= 119966 && c <= 119967)
                    : c <= 119970)))))))))))
        : (c <= 119974 || (c < 124912
          ? (c < 120746
            ? (c < 120134
              ? (c < 120071
                ? (c < 119995
                  ? (c < 119982
                    ? (c >= 119977 && c <= 119980)
                    : c <= 119993)
                  : (c <= 119995 || (c < 120005
                    ? (c >= 119997 && c <= 120003)
                    : c <= 120069)))
                : (c <= 120074 || (c < 120094
                  ? (c < 120086
                    ? (c >= 120077 && c <= 120084)
                    : c <= 120092)
                  : (c <= 120121 || (c < 120128
                    ? (c >= 120123 && c <= 120126)
                    : c <= 120132)))))
              : (c <= 120134 || (c < 120572
                ? (c < 120488
                  ? (c < 120146
                    ? (c >= 120138 && c <= 120144)
                    : c <= 120485)
                  : (c <= 120512 || (c < 120540
                    ? (c >= 120514 && c <= 120538)
                    : c <= 120570)))
                : (c <= 120596 || (c < 120656
                  ? (c < 120630
                    ? (c >= 120598 && c <= 120628)
                    : c <= 120654)
                  : (c <= 120686 || (c < 120714
                    ? (c >= 120688 && c <= 120712)
                    : c <= 120744)))))))
            : (c <= 120770 || (c < 122907
              ? (c < 121476
                ? (c < 121344
                  ? (c < 120782
                    ? (c >= 120772 && c <= 120779)
                    : c <= 120831)
                  : (c <= 121398 || (c < 121461
                    ? (c >= 121403 && c <= 121452)
                    : c <= 121461)))
                : (c <= 121476 || (c < 122624
                  ? (c < 121505
                    ? (c >= 121499 && c <= 121503)
                    : c <= 121519)
                  : (c <= 122654 || (c < 122888
                    ? (c >= 122880 && c <= 122886)
                    : c <= 122904)))))
              : (c <= 122913 || (c < 123214
                ? (c < 123136
                  ? (c < 122918
                    ? (c >= 122915 && c <= 122916)
                    : c <= 122922)
                  : (c <= 123180 || (c < 123200
                    ? (c >= 123184 && c <= 123197)
                    : c <= 123209)))
                : (c <= 123214 || (c < 124896
                  ? (c < 123584
                    ? (c >= 123536 && c <= 123566)
                    : c <= 123641)
                  : (c <= 124902 || (c < 124909
                    ? (c >= 124904 && c <= 124907)
                    : c <= 124910)))))))))
          : (c <= 124926 || (c < 126557
            ? (c < 126521
              ? (c < 126469
                ? (c < 125184
                  ? (c < 125136
                    ? (c >= 124928 && c <= 125124)
                    : c <= 125142)
                  : (c <= 125259 || (c < 126464
                    ? (c >= 125264 && c <= 125273)
                    : c <= 126467)))
                : (c <= 126495 || (c < 126503
                  ? (c < 126500
                    ? (c >= 126497 && c <= 126498)
                    : c <= 126500)
                  : (c <= 126503 || (c < 126516
                    ? (c >= 126505 && c <= 126514)
                    : c <= 126519)))))
              : (c <= 126521 || (c < 126541
                ? (c < 126535
                  ? (c < 126530
                    ? c == 126523
                    : c <= 126530)
                  : (c <= 126535 || (c < 126539
                    ? c == 126537
                    : c <= 126539)))
                : (c <= 126543 || (c < 126551
                  ? (c < 126548
                    ? (c >= 126545 && c <= 126546)
                    : c <= 126548)
                  : (c <= 126551 || (c < 126555
                    ? c == 126553
                    : c <= 126555)))))))
            : (c <= 126557 || (c < 126629
              ? (c < 126580
                ? (c < 126564
                  ? (c < 126561
                    ? c == 126559
                    : c <= 126562)
                  : (c <= 126564 || (c < 126572
                    ? (c >= 126567 && c <= 126570)
                    : c <= 126578)))
                : (c <= 126583 || (c < 126592
                  ? (c < 126590
                    ? (c >= 126585 && c <= 126588)
                    : c <= 126590)
                  : (c <= 126601 || (c < 126625
                    ? (c >= 126603 && c <= 126619)
                    : c <= 126627)))))
              : (c <= 126633 || (c < 178208
                ? (c < 131072
                  ? (c < 130032
                    ? (c >= 126635 && c <= 126651)
                    : c <= 130041)
                  : (c <= 173791 || (c < 177984
                    ? (c >= 173824 && c <= 177976)
                    : c <= 178205)))
                : (c <= 183969 || (c < 196608
                  ? (c < 194560
                    ? (c >= 183984 && c <= 191456)
                    : c <= 195101)
                  : (c <= 201546 || (c >= 917760 && c <= 917999)))))))))))))))));
}

static bool ts_lex(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (eof) ADVANCE(14);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == ' ') SKIP(0)
      if (lookahead == '\r') SKIP(0)
      if (lookahead == '"') ADVANCE(27);
      if (lookahead == '#') ADVANCE(47);
      if (lookahead == '+') ADVANCE(23);
      if (lookahead == ',') ADVANCE(21);
      if (lookahead == '-') ADVANCE(9);
      if (lookahead == '.') ADVANCE(12);
      if (lookahead == '/') ADVANCE(6);
      if (lookahead == ':') ADVANCE(18);
      if (lookahead == ';') ADVANCE(17);
      if (lookahead == '<') ADVANCE(31);
      if (lookahead == '=') ADVANCE(22);
      if (lookahead == '>') ADVANCE(32);
      if (lookahead == '[') ADVANCE(19);
      if (lookahead == ']') ADVANCE(20);
      if (lookahead == '{') ADVANCE(15);
      if (lookahead == '}') ADVANCE(16);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(25);
      if (sym_identifier_character_set_1(lookahead)) ADVANCE(24);
      END_STATE();
    case 1:
      if (lookahead == '\n') ADVANCE(8);
      if (lookahead == '*') ADVANCE(4);
      if (lookahead != 0) ADVANCE(5);
      END_STATE();
    case 2:
      if (lookahead == '"') ADVANCE(28);
      if (lookahead == '*') ADVANCE(5);
      if (lookahead == '/') ADVANCE(42);
      if (lookahead == '\\') ADVANCE(13);
      if (lookahead != 0) ADVANCE(3);
      END_STATE();
    case 3:
      if (lookahead == '"') ADVANCE(28);
      if (lookahead == '\\') ADVANCE(13);
      if (lookahead != 0) ADVANCE(3);
      END_STATE();
    case 4:
      if (lookahead == '"') ADVANCE(29);
      if (lookahead == '*') ADVANCE(4);
      if (lookahead == '/') ADVANCE(43);
      if (lookahead == '\\') ADVANCE(1);
      if (lookahead != 0) ADVANCE(5);
      END_STATE();
    case 5:
      if (lookahead == '"') ADVANCE(29);
      if (lookahead == '*') ADVANCE(4);
      if (lookahead == '\\') ADVANCE(1);
      if (lookahead != 0) ADVANCE(5);
      END_STATE();
    case 6:
      if (lookahead == '*') ADVANCE(8);
      if (lookahead == '/') ADVANCE(44);
      END_STATE();
    case 7:
      if (lookahead == '*') ADVANCE(7);
      if (lookahead == '/') ADVANCE(41);
      if (lookahead != 0) ADVANCE(8);
      END_STATE();
    case 8:
      if (lookahead == '*') ADVANCE(7);
      if (lookahead != 0) ADVANCE(8);
      END_STATE();
    case 9:
      if (lookahead == '-') ADVANCE(40);
      if (lookahead == '.') ADVANCE(12);
      if (lookahead == '>') ADVANCE(39);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(25);
      END_STATE();
    case 10:
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == ' ') ADVANCE(37);
      if (lookahead == '\r') ADVANCE(37);
      if (lookahead == '#') ADVANCE(49);
      if (lookahead == '/') ADVANCE(34);
      if (lookahead == '<') ADVANCE(31);
      if (lookahead == '>') ADVANCE(32);
      if (lookahead != 0) ADVANCE(38);
      END_STATE();
    case 11:
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == ' ') ADVANCE(11);
      if (lookahead == '\r') ADVANCE(11);
      if (lookahead == '"') ADVANCE(28);
      if (lookahead == '#') ADVANCE(48);
      if (lookahead == '/') ADVANCE(2);
      if (lookahead == '\\') ADVANCE(13);
      if (lookahead != 0) ADVANCE(3);
      END_STATE();
    case 12:
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(26);
      END_STATE();
    case 13:
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(3);
      END_STATE();
    case 14:
      ACCEPT_TOKEN(ts_builtin_sym_end);
      END_STATE();
    case 15:
      ACCEPT_TOKEN(anon_sym_LBRACE);
      END_STATE();
    case 16:
      ACCEPT_TOKEN(anon_sym_RBRACE);
      END_STATE();
    case 17:
      ACCEPT_TOKEN(anon_sym_SEMI);
      END_STATE();
    case 18:
      ACCEPT_TOKEN(anon_sym_COLON);
      END_STATE();
    case 19:
      ACCEPT_TOKEN(anon_sym_LBRACK);
      END_STATE();
    case 20:
      ACCEPT_TOKEN(anon_sym_RBRACK);
      END_STATE();
    case 21:
      ACCEPT_TOKEN(anon_sym_COMMA);
      END_STATE();
    case 22:
      ACCEPT_TOKEN(anon_sym_EQ);
      END_STATE();
    case 23:
      ACCEPT_TOKEN(anon_sym_PLUS);
      END_STATE();
    case 24:
      ACCEPT_TOKEN(sym_identifier);
      if (sym_identifier_character_set_2(lookahead)) ADVANCE(24);
      END_STATE();
    case 25:
      ACCEPT_TOKEN(sym_number_literal);
      if (lookahead == '.') ADVANCE(26);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(25);
      END_STATE();
    case 26:
      ACCEPT_TOKEN(sym_number_literal);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(26);
      END_STATE();
    case 27:
      ACCEPT_TOKEN(anon_sym_DQUOTE);
      END_STATE();
    case 28:
      ACCEPT_TOKEN(aux_sym_string_literal_token1);
      END_STATE();
    case 29:
      ACCEPT_TOKEN(aux_sym_string_literal_token1);
      if (lookahead == '*') ADVANCE(7);
      if (lookahead != 0) ADVANCE(8);
      END_STATE();
    case 30:
      ACCEPT_TOKEN(aux_sym_string_literal_token1);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(44);
      END_STATE();
    case 31:
      ACCEPT_TOKEN(anon_sym_LT);
      END_STATE();
    case 32:
      ACCEPT_TOKEN(anon_sym_GT);
      END_STATE();
    case 33:
      ACCEPT_TOKEN(aux_sym__html_internal_token1);
      if (lookahead == '\n') ADVANCE(38);
      if (lookahead == '<' ||
          lookahead == '>') ADVANCE(44);
      if (lookahead != 0) ADVANCE(33);
      END_STATE();
    case 34:
      ACCEPT_TOKEN(aux_sym__html_internal_token1);
      if (lookahead == '*') ADVANCE(36);
      if (lookahead == '/') ADVANCE(33);
      if (lookahead != 0 &&
          lookahead != '<' &&
          lookahead != '>') ADVANCE(38);
      END_STATE();
    case 35:
      ACCEPT_TOKEN(aux_sym__html_internal_token1);
      if (lookahead == '*') ADVANCE(35);
      if (lookahead == '/') ADVANCE(38);
      if (lookahead == '<' ||
          lookahead == '>') ADVANCE(8);
      if (lookahead != 0) ADVANCE(36);
      END_STATE();
    case 36:
      ACCEPT_TOKEN(aux_sym__html_internal_token1);
      if (lookahead == '*') ADVANCE(35);
      if (lookahead == '<' ||
          lookahead == '>') ADVANCE(8);
      if (lookahead != 0) ADVANCE(36);
      END_STATE();
    case 37:
      ACCEPT_TOKEN(aux_sym__html_internal_token1);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == ' ') ADVANCE(37);
      if (lookahead == '\r') ADVANCE(37);
      if (lookahead == '#') ADVANCE(49);
      if (lookahead == '/') ADVANCE(34);
      if (lookahead != 0 &&
          lookahead != '<' &&
          lookahead != '>') ADVANCE(38);
      END_STATE();
    case 38:
      ACCEPT_TOKEN(aux_sym__html_internal_token1);
      if (lookahead != 0 &&
          lookahead != '<' &&
          lookahead != '>') ADVANCE(38);
      END_STATE();
    case 39:
      ACCEPT_TOKEN(anon_sym_DASH_GT);
      END_STATE();
    case 40:
      ACCEPT_TOKEN(anon_sym_DASH_DASH);
      END_STATE();
    case 41:
      ACCEPT_TOKEN(sym_comment);
      END_STATE();
    case 42:
      ACCEPT_TOKEN(sym_comment);
      if (lookahead == '\n') ADVANCE(3);
      if (lookahead == '"') ADVANCE(30);
      if (lookahead == '\\') ADVANCE(45);
      if (lookahead != 0) ADVANCE(42);
      END_STATE();
    case 43:
      ACCEPT_TOKEN(sym_comment);
      if (lookahead == '"') ADVANCE(28);
      if (lookahead == '\\') ADVANCE(13);
      if (lookahead != 0) ADVANCE(3);
      END_STATE();
    case 44:
      ACCEPT_TOKEN(sym_comment);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(44);
      END_STATE();
    case 45:
      ACCEPT_TOKEN(sym_comment);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(42);
      END_STATE();
    case 46:
      ACCEPT_TOKEN(sym_comment);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(55);
      END_STATE();
    case 47:
      ACCEPT_TOKEN(anon_sym_POUND);
      END_STATE();
    case 48:
      ACCEPT_TOKEN(anon_sym_POUND);
      if (lookahead == '"') ADVANCE(28);
      if (lookahead == '\\') ADVANCE(13);
      if (lookahead != 0) ADVANCE(3);
      END_STATE();
    case 49:
      ACCEPT_TOKEN(anon_sym_POUND);
      if (lookahead != 0 &&
          lookahead != '<' &&
          lookahead != '>') ADVANCE(38);
      END_STATE();
    case 50:
      ACCEPT_TOKEN(anon_sym_POUND);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(55);
      END_STATE();
    case 51:
      ACCEPT_TOKEN(aux_sym_preproc_token1);
      if (lookahead == '\n') ADVANCE(8);
      if (lookahead == '*') ADVANCE(51);
      if (lookahead == '/') ADVANCE(46);
      if (lookahead != 0) ADVANCE(52);
      END_STATE();
    case 52:
      ACCEPT_TOKEN(aux_sym_preproc_token1);
      if (lookahead == '\n') ADVANCE(8);
      if (lookahead == '*') ADVANCE(51);
      if (lookahead != 0) ADVANCE(52);
      END_STATE();
    case 53:
      ACCEPT_TOKEN(aux_sym_preproc_token1);
      if (lookahead == '\r') ADVANCE(53);
      if (lookahead == '#') ADVANCE(50);
      if (lookahead == '/') ADVANCE(54);
      if (lookahead == '\t' ||
          lookahead == ' ') ADVANCE(53);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(55);
      END_STATE();
    case 54:
      ACCEPT_TOKEN(aux_sym_preproc_token1);
      if (lookahead == '*') ADVANCE(52);
      if (lookahead == '/') ADVANCE(44);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(55);
      END_STATE();
    case 55:
      ACCEPT_TOKEN(aux_sym_preproc_token1);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(55);
      END_STATE();
    default:
      return false;
  }
}

static bool ts_lex_keywords(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == ' ') SKIP(0)
      if (lookahead == '\r') SKIP(0)
      if (lookahead == 'D' ||
          lookahead == 'd') ADVANCE(1);
      if (lookahead == 'E' ||
          lookahead == 'e') ADVANCE(2);
      if (lookahead == 'G' ||
          lookahead == 'g') ADVANCE(3);
      if (lookahead == 'N' ||
          lookahead == 'n') ADVANCE(4);
      if (lookahead == 'S' ||
          lookahead == 's') ADVANCE(5);
      END_STATE();
    case 1:
      if (lookahead == 'I' ||
          lookahead == 'i') ADVANCE(6);
      END_STATE();
    case 2:
      if (lookahead == 'D' ||
          lookahead == 'd') ADVANCE(7);
      END_STATE();
    case 3:
      if (lookahead == 'R' ||
          lookahead == 'r') ADVANCE(8);
      END_STATE();
    case 4:
      if (lookahead == 'O' ||
          lookahead == 'o') ADVANCE(9);
      END_STATE();
    case 5:
      if (lookahead == 'T' ||
          lookahead == 't') ADVANCE(10);
      if (lookahead == 'U' ||
          lookahead == 'u') ADVANCE(11);
      END_STATE();
    case 6:
      if (lookahead == 'G' ||
          lookahead == 'g') ADVANCE(12);
      END_STATE();
    case 7:
      if (lookahead == 'G' ||
          lookahead == 'g') ADVANCE(13);
      END_STATE();
    case 8:
      if (lookahead == 'A' ||
          lookahead == 'a') ADVANCE(14);
      END_STATE();
    case 9:
      if (lookahead == 'D' ||
          lookahead == 'd') ADVANCE(15);
      END_STATE();
    case 10:
      if (lookahead == 'R' ||
          lookahead == 'r') ADVANCE(16);
      END_STATE();
    case 11:
      if (lookahead == 'B' ||
          lookahead == 'b') ADVANCE(17);
      END_STATE();
    case 12:
      if (lookahead == 'R' ||
          lookahead == 'r') ADVANCE(18);
      END_STATE();
    case 13:
      if (lookahead == 'E' ||
          lookahead == 'e') ADVANCE(19);
      END_STATE();
    case 14:
      if (lookahead == 'P' ||
          lookahead == 'p') ADVANCE(20);
      END_STATE();
    case 15:
      if (lookahead == 'E' ||
          lookahead == 'e') ADVANCE(21);
      END_STATE();
    case 16:
      if (lookahead == 'I' ||
          lookahead == 'i') ADVANCE(22);
      END_STATE();
    case 17:
      if (lookahead == 'G' ||
          lookahead == 'g') ADVANCE(23);
      END_STATE();
    case 18:
      if (lookahead == 'A' ||
          lookahead == 'a') ADVANCE(24);
      END_STATE();
    case 19:
      ACCEPT_TOKEN(aux_sym_attr_stmt_token2);
      END_STATE();
    case 20:
      if (lookahead == 'H' ||
          lookahead == 'h') ADVANCE(25);
      END_STATE();
    case 21:
      ACCEPT_TOKEN(aux_sym_attr_stmt_token1);
      END_STATE();
    case 22:
      if (lookahead == 'C' ||
          lookahead == 'c') ADVANCE(26);
      END_STATE();
    case 23:
      if (lookahead == 'R' ||
          lookahead == 'r') ADVANCE(27);
      END_STATE();
    case 24:
      if (lookahead == 'P' ||
          lookahead == 'p') ADVANCE(28);
      END_STATE();
    case 25:
      ACCEPT_TOKEN(aux_sym_source_file_token2);
      END_STATE();
    case 26:
      if (lookahead == 'T' ||
          lookahead == 't') ADVANCE(29);
      END_STATE();
    case 27:
      if (lookahead == 'A' ||
          lookahead == 'a') ADVANCE(30);
      END_STATE();
    case 28:
      if (lookahead == 'H' ||
          lookahead == 'h') ADVANCE(31);
      END_STATE();
    case 29:
      ACCEPT_TOKEN(aux_sym_source_file_token1);
      END_STATE();
    case 30:
      if (lookahead == 'P' ||
          lookahead == 'p') ADVANCE(32);
      END_STATE();
    case 31:
      ACCEPT_TOKEN(aux_sym_source_file_token3);
      END_STATE();
    case 32:
      if (lookahead == 'H' ||
          lookahead == 'h') ADVANCE(33);
      END_STATE();
    case 33:
      ACCEPT_TOKEN(aux_sym_subgraph_token1);
      END_STATE();
    default:
      return false;
  }
}

static const TSLexMode ts_lex_modes[STATE_COUNT] = {
  [0] = {.lex_state = 0},
  [1] = {.lex_state = 0},
  [2] = {.lex_state = 0},
  [3] = {.lex_state = 0},
  [4] = {.lex_state = 0},
  [5] = {.lex_state = 0},
  [6] = {.lex_state = 0},
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
  [22] = {.lex_state = 0},
  [23] = {.lex_state = 0},
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
  [34] = {.lex_state = 0},
  [35] = {.lex_state = 0},
  [36] = {.lex_state = 0},
  [37] = {.lex_state = 0},
  [38] = {.lex_state = 0},
  [39] = {.lex_state = 0},
  [40] = {.lex_state = 0},
  [41] = {.lex_state = 0},
  [42] = {.lex_state = 0},
  [43] = {.lex_state = 0},
  [44] = {.lex_state = 0},
  [45] = {.lex_state = 0},
  [46] = {.lex_state = 0},
  [47] = {.lex_state = 0},
  [48] = {.lex_state = 0},
  [49] = {.lex_state = 0},
  [50] = {.lex_state = 0},
  [51] = {.lex_state = 0},
  [52] = {.lex_state = 0},
  [53] = {.lex_state = 10},
  [54] = {.lex_state = 10},
  [55] = {.lex_state = 10},
  [56] = {.lex_state = 10},
  [57] = {.lex_state = 10},
  [58] = {.lex_state = 0},
  [59] = {.lex_state = 10},
  [60] = {.lex_state = 10},
  [61] = {.lex_state = 10},
  [62] = {.lex_state = 0},
  [63] = {.lex_state = 0},
  [64] = {.lex_state = 0},
  [65] = {.lex_state = 0},
  [66] = {.lex_state = 0},
  [67] = {.lex_state = 0},
  [68] = {.lex_state = 0},
  [69] = {.lex_state = 0},
  [70] = {.lex_state = 0},
  [71] = {.lex_state = 0},
  [72] = {.lex_state = 11},
  [73] = {.lex_state = 0},
  [74] = {.lex_state = 0},
  [75] = {.lex_state = 0},
  [76] = {.lex_state = 0},
  [77] = {.lex_state = 53},
  [78] = {.lex_state = 0},
  [79] = {(TSStateId)(-1)},
};

static const uint16_t ts_parse_table[LARGE_STATE_COUNT][SYMBOL_COUNT] = {
  [0] = {
    [sym_preproc] = STATE(0),
    [ts_builtin_sym_end] = ACTIONS(1),
    [sym_identifier] = ACTIONS(1),
    [aux_sym_source_file_token1] = ACTIONS(1),
    [aux_sym_source_file_token2] = ACTIONS(1),
    [aux_sym_source_file_token3] = ACTIONS(1),
    [anon_sym_LBRACE] = ACTIONS(1),
    [anon_sym_RBRACE] = ACTIONS(1),
    [anon_sym_SEMI] = ACTIONS(1),
    [aux_sym_subgraph_token1] = ACTIONS(1),
    [aux_sym_attr_stmt_token1] = ACTIONS(1),
    [aux_sym_attr_stmt_token2] = ACTIONS(1),
    [anon_sym_COLON] = ACTIONS(1),
    [anon_sym_LBRACK] = ACTIONS(1),
    [anon_sym_RBRACK] = ACTIONS(1),
    [anon_sym_COMMA] = ACTIONS(1),
    [anon_sym_EQ] = ACTIONS(1),
    [anon_sym_PLUS] = ACTIONS(1),
    [sym_number_literal] = ACTIONS(1),
    [anon_sym_DQUOTE] = ACTIONS(1),
    [anon_sym_LT] = ACTIONS(1),
    [anon_sym_GT] = ACTIONS(1),
    [anon_sym_DASH_GT] = ACTIONS(1),
    [anon_sym_DASH_DASH] = ACTIONS(1),
    [sym_comment] = ACTIONS(3),
    [anon_sym_POUND] = ACTIONS(5),
  },
  [1] = {
    [sym_source_file] = STATE(76),
    [sym_preproc] = STATE(1),
    [aux_sym_source_file_token1] = ACTIONS(7),
    [aux_sym_source_file_token2] = ACTIONS(9),
    [aux_sym_source_file_token3] = ACTIONS(9),
    [sym_comment] = ACTIONS(3),
    [anon_sym_POUND] = ACTIONS(5),
  },
  [2] = {
    [sym_block] = STATE(21),
    [sym_stmt_list] = STATE(78),
    [sym__stmt] = STATE(39),
    [sym_subgraph] = STATE(20),
    [sym_node_stmt] = STATE(38),
    [sym_edge_stmt] = STATE(38),
    [sym_attr_stmt] = STATE(38),
    [sym_node_id] = STATE(15),
    [sym_attribute] = STATE(38),
    [sym_id] = STATE(16),
    [sym_string_literal] = STATE(8),
    [sym_html_string] = STATE(13),
    [sym_preproc] = STATE(2),
    [aux_sym_stmt_list_repeat1] = STATE(5),
    [sym_identifier] = ACTIONS(11),
    [aux_sym_source_file_token2] = ACTIONS(13),
    [anon_sym_LBRACE] = ACTIONS(15),
    [anon_sym_RBRACE] = ACTIONS(17),
    [aux_sym_subgraph_token1] = ACTIONS(19),
    [aux_sym_attr_stmt_token1] = ACTIONS(13),
    [aux_sym_attr_stmt_token2] = ACTIONS(13),
    [sym_number_literal] = ACTIONS(21),
    [anon_sym_DQUOTE] = ACTIONS(23),
    [anon_sym_LT] = ACTIONS(25),
    [sym_comment] = ACTIONS(3),
    [anon_sym_POUND] = ACTIONS(5),
  },
  [3] = {
    [sym_block] = STATE(21),
    [sym_stmt_list] = STATE(71),
    [sym__stmt] = STATE(39),
    [sym_subgraph] = STATE(20),
    [sym_node_stmt] = STATE(38),
    [sym_edge_stmt] = STATE(38),
    [sym_attr_stmt] = STATE(38),
    [sym_node_id] = STATE(15),
    [sym_attribute] = STATE(38),
    [sym_id] = STATE(16),
    [sym_string_literal] = STATE(8),
    [sym_html_string] = STATE(13),
    [sym_preproc] = STATE(3),
    [aux_sym_stmt_list_repeat1] = STATE(5),
    [sym_identifier] = ACTIONS(11),
    [aux_sym_source_file_token2] = ACTIONS(13),
    [anon_sym_LBRACE] = ACTIONS(15),
    [anon_sym_RBRACE] = ACTIONS(27),
    [aux_sym_subgraph_token1] = ACTIONS(19),
    [aux_sym_attr_stmt_token1] = ACTIONS(13),
    [aux_sym_attr_stmt_token2] = ACTIONS(13),
    [sym_number_literal] = ACTIONS(21),
    [anon_sym_DQUOTE] = ACTIONS(23),
    [anon_sym_LT] = ACTIONS(25),
    [sym_comment] = ACTIONS(3),
    [anon_sym_POUND] = ACTIONS(5),
  },
};

static const uint16_t ts_small_parse_table[] = {
  [0] = 19,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(29), 1,
      sym_identifier,
    ACTIONS(35), 1,
      anon_sym_LBRACE,
    ACTIONS(38), 1,
      anon_sym_RBRACE,
    ACTIONS(40), 1,
      aux_sym_subgraph_token1,
    ACTIONS(43), 1,
      sym_number_literal,
    ACTIONS(46), 1,
      anon_sym_DQUOTE,
    ACTIONS(49), 1,
      anon_sym_LT,
    STATE(8), 1,
      sym_string_literal,
    STATE(13), 1,
      sym_html_string,
    STATE(15), 1,
      sym_node_id,
    STATE(16), 1,
      sym_id,
    STATE(20), 1,
      sym_subgraph,
    STATE(21), 1,
      sym_block,
    STATE(39), 1,
      sym__stmt,
    STATE(4), 2,
      sym_preproc,
      aux_sym_stmt_list_repeat1,
    ACTIONS(32), 3,
      aux_sym_source_file_token2,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
    STATE(38), 4,
      sym_node_stmt,
      sym_edge_stmt,
      sym_attr_stmt,
      sym_attribute,
  [64] = 20,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(11), 1,
      sym_identifier,
    ACTIONS(15), 1,
      anon_sym_LBRACE,
    ACTIONS(19), 1,
      aux_sym_subgraph_token1,
    ACTIONS(21), 1,
      sym_number_literal,
    ACTIONS(23), 1,
      anon_sym_DQUOTE,
    ACTIONS(25), 1,
      anon_sym_LT,
    ACTIONS(52), 1,
      anon_sym_RBRACE,
    STATE(4), 1,
      aux_sym_stmt_list_repeat1,
    STATE(5), 1,
      sym_preproc,
    STATE(8), 1,
      sym_string_literal,
    STATE(13), 1,
      sym_html_string,
    STATE(15), 1,
      sym_node_id,
    STATE(16), 1,
      sym_id,
    STATE(20), 1,
      sym_subgraph,
    STATE(21), 1,
      sym_block,
    STATE(39), 1,
      sym__stmt,
    ACTIONS(13), 3,
      aux_sym_source_file_token2,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
    STATE(38), 4,
      sym_node_stmt,
      sym_edge_stmt,
      sym_attr_stmt,
      sym_attribute,
  [130] = 7,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(58), 1,
      anon_sym_PLUS,
    STATE(6), 1,
      sym_preproc,
    STATE(7), 1,
      aux_sym_id_repeat1,
    ACTIONS(54), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(56), 13,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_COLON,
      anon_sym_LBRACK,
      anon_sym_RBRACK,
      anon_sym_COMMA,
      anon_sym_EQ,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [168] = 6,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(64), 1,
      anon_sym_PLUS,
    STATE(7), 2,
      sym_preproc,
      aux_sym_id_repeat1,
    ACTIONS(60), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(62), 13,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_COLON,
      anon_sym_LBRACK,
      anon_sym_RBRACK,
      anon_sym_COMMA,
      anon_sym_EQ,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [204] = 7,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(58), 1,
      anon_sym_PLUS,
    STATE(6), 1,
      aux_sym_id_repeat1,
    STATE(8), 1,
      sym_preproc,
    ACTIONS(67), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(69), 13,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_COLON,
      anon_sym_LBRACK,
      anon_sym_RBRACK,
      anon_sym_COMMA,
      anon_sym_EQ,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [242] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(9), 1,
      sym_preproc,
    ACTIONS(60), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(62), 14,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_COLON,
      anon_sym_LBRACK,
      anon_sym_RBRACK,
      anon_sym_COMMA,
      anon_sym_EQ,
      anon_sym_PLUS,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [275] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(10), 1,
      sym_preproc,
    ACTIONS(71), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(73), 14,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_COLON,
      anon_sym_LBRACK,
      anon_sym_RBRACK,
      anon_sym_COMMA,
      anon_sym_EQ,
      anon_sym_PLUS,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [308] = 11,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(79), 1,
      anon_sym_LBRACK,
    STATE(11), 1,
      sym_preproc,
    STATE(17), 1,
      aux_sym_edge_stmt_repeat1,
    STATE(31), 1,
      aux_sym_attr_list_repeat1,
    STATE(34), 1,
      sym_edgeop,
    STATE(35), 1,
      sym_attr_list,
    ACTIONS(81), 2,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
    ACTIONS(75), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(77), 6,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
  [352] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(12), 1,
      sym_preproc,
    ACTIONS(83), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(85), 13,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_COLON,
      anon_sym_LBRACK,
      anon_sym_RBRACK,
      anon_sym_COMMA,
      anon_sym_EQ,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [384] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(13), 1,
      sym_preproc,
    ACTIONS(67), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(69), 13,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_COLON,
      anon_sym_LBRACK,
      anon_sym_RBRACK,
      anon_sym_COMMA,
      anon_sym_EQ,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [416] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(14), 1,
      sym_preproc,
    ACTIONS(87), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(89), 13,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_COLON,
      anon_sym_LBRACK,
      anon_sym_RBRACK,
      anon_sym_COMMA,
      anon_sym_EQ,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [448] = 11,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(79), 1,
      anon_sym_LBRACK,
    STATE(11), 1,
      aux_sym_edge_stmt_repeat1,
    STATE(15), 1,
      sym_preproc,
    STATE(31), 1,
      aux_sym_attr_list_repeat1,
    STATE(34), 1,
      sym_edgeop,
    STATE(36), 1,
      sym_attr_list,
    ACTIONS(81), 2,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
    ACTIONS(91), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(93), 6,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
  [492] = 8,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(99), 1,
      anon_sym_COLON,
    ACTIONS(101), 1,
      anon_sym_EQ,
    STATE(16), 1,
      sym_preproc,
    STATE(24), 1,
      sym_port,
    ACTIONS(95), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(97), 9,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_LBRACK,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [529] = 7,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(34), 1,
      sym_edgeop,
    ACTIONS(107), 2,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
    STATE(17), 2,
      sym_preproc,
      aux_sym_edge_stmt_repeat1,
    ACTIONS(103), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(105), 7,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_LBRACK,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
  [563] = 7,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(99), 1,
      anon_sym_COLON,
    STATE(18), 1,
      sym_preproc,
    STATE(24), 1,
      sym_port,
    ACTIONS(95), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(97), 9,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_LBRACK,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [597] = 6,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(114), 1,
      anon_sym_COLON,
    STATE(19), 1,
      sym_preproc,
    ACTIONS(110), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(112), 9,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_LBRACK,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [628] = 8,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(11), 1,
      aux_sym_edge_stmt_repeat1,
    STATE(20), 1,
      sym_preproc,
    STATE(34), 1,
      sym_edgeop,
    ACTIONS(81), 2,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
    ACTIONS(116), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(118), 6,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
  [663] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(21), 1,
      sym_preproc,
    ACTIONS(120), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(122), 9,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_LBRACK,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [691] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(22), 1,
      sym_preproc,
    ACTIONS(124), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(126), 9,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_LBRACK,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [719] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(23), 1,
      sym_preproc,
    ACTIONS(128), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(130), 9,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_LBRACK,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [747] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(24), 1,
      sym_preproc,
    ACTIONS(132), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(134), 9,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_LBRACK,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [775] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(25), 1,
      sym_preproc,
    ACTIONS(136), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(138), 9,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_LBRACK,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [803] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(26), 1,
      sym_preproc,
    ACTIONS(140), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(142), 9,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_LBRACK,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [831] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(27), 1,
      sym_preproc,
    ACTIONS(144), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(146), 9,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_LBRACK,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [859] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(28), 1,
      sym_preproc,
    ACTIONS(103), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(105), 9,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_LBRACK,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
      anon_sym_DASH_GT,
      anon_sym_DASH_DASH,
  [887] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(29), 1,
      sym_preproc,
    ACTIONS(148), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(150), 8,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_RBRACK,
      anon_sym_COMMA,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
  [914] = 6,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(156), 1,
      anon_sym_LBRACK,
    STATE(30), 2,
      sym_preproc,
      aux_sym_attr_list_repeat1,
    ACTIONS(152), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(154), 6,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
  [943] = 7,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(79), 1,
      anon_sym_LBRACK,
    STATE(30), 1,
      aux_sym_attr_list_repeat1,
    STATE(31), 1,
      sym_preproc,
    ACTIONS(159), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(161), 6,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
  [974] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(32), 1,
      sym_preproc,
    ACTIONS(163), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(165), 7,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_LBRACK,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
  [1000] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(33), 1,
      sym_preproc,
    ACTIONS(152), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(154), 7,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      anon_sym_LBRACK,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
  [1026] = 14,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(11), 1,
      sym_identifier,
    ACTIONS(15), 1,
      anon_sym_LBRACE,
    ACTIONS(19), 1,
      aux_sym_subgraph_token1,
    ACTIONS(21), 1,
      sym_number_literal,
    ACTIONS(23), 1,
      anon_sym_DQUOTE,
    ACTIONS(25), 1,
      anon_sym_LT,
    STATE(8), 1,
      sym_string_literal,
    STATE(13), 1,
      sym_html_string,
    STATE(18), 1,
      sym_id,
    STATE(21), 1,
      sym_block,
    STATE(34), 1,
      sym_preproc,
    STATE(28), 2,
      sym_subgraph,
      sym_node_id,
  [1070] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(35), 1,
      sym_preproc,
    ACTIONS(167), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(169), 6,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
  [1095] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(36), 1,
      sym_preproc,
    ACTIONS(171), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(173), 6,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
  [1120] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(37), 1,
      sym_preproc,
    ACTIONS(175), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(177), 6,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
  [1145] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(38), 1,
      sym_preproc,
    ACTIONS(116), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(118), 6,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      anon_sym_SEMI,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
  [1170] = 6,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(183), 1,
      anon_sym_SEMI,
    STATE(39), 1,
      sym_preproc,
    ACTIONS(179), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
    ACTIONS(181), 5,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
  [1197] = 12,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(23), 1,
      anon_sym_DQUOTE,
    ACTIONS(25), 1,
      anon_sym_LT,
    ACTIONS(185), 1,
      anon_sym_RBRACK,
    STATE(8), 1,
      sym_string_literal,
    STATE(13), 1,
      sym_html_string,
    STATE(40), 1,
      sym_preproc,
    STATE(41), 1,
      aux_sym__a_list,
    STATE(47), 1,
      sym_attribute,
    STATE(73), 1,
      sym_id,
    ACTIONS(21), 2,
      sym_identifier,
      sym_number_literal,
  [1235] = 11,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(190), 1,
      anon_sym_RBRACK,
    ACTIONS(192), 1,
      anon_sym_DQUOTE,
    ACTIONS(195), 1,
      anon_sym_LT,
    STATE(8), 1,
      sym_string_literal,
    STATE(13), 1,
      sym_html_string,
    STATE(47), 1,
      sym_attribute,
    STATE(73), 1,
      sym_id,
    ACTIONS(187), 2,
      sym_identifier,
      sym_number_literal,
    STATE(41), 2,
      aux_sym__a_list,
      sym_preproc,
  [1271] = 12,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(23), 1,
      anon_sym_DQUOTE,
    ACTIONS(25), 1,
      anon_sym_LT,
    ACTIONS(198), 1,
      anon_sym_RBRACK,
    STATE(8), 1,
      sym_string_literal,
    STATE(13), 1,
      sym_html_string,
    STATE(40), 1,
      aux_sym__a_list,
    STATE(42), 1,
      sym_preproc,
    STATE(47), 1,
      sym_attribute,
    STATE(73), 1,
      sym_id,
    ACTIONS(21), 2,
      sym_identifier,
      sym_number_literal,
  [1309] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(43), 1,
      sym_preproc,
    ACTIONS(38), 5,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
    ACTIONS(200), 5,
      aux_sym_source_file_token2,
      aux_sym_subgraph_token1,
      aux_sym_attr_stmt_token1,
      aux_sym_attr_stmt_token2,
      sym_identifier,
  [1333] = 11,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(15), 1,
      anon_sym_LBRACE,
    ACTIONS(23), 1,
      anon_sym_DQUOTE,
    ACTIONS(25), 1,
      anon_sym_LT,
    STATE(8), 1,
      sym_string_literal,
    STATE(13), 1,
      sym_html_string,
    STATE(23), 1,
      sym_block,
    STATE(44), 1,
      sym_preproc,
    STATE(62), 1,
      sym_id,
    ACTIONS(21), 2,
      sym_identifier,
      sym_number_literal,
  [1368] = 11,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(23), 1,
      anon_sym_DQUOTE,
    ACTIONS(25), 1,
      anon_sym_LT,
    ACTIONS(202), 1,
      anon_sym_LBRACE,
    STATE(8), 1,
      sym_string_literal,
    STATE(13), 1,
      sym_html_string,
    STATE(45), 1,
      sym_preproc,
    STATE(65), 1,
      sym_id,
    STATE(69), 1,
      sym_block,
    ACTIONS(21), 2,
      sym_identifier,
      sym_number_literal,
  [1403] = 11,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(23), 1,
      anon_sym_DQUOTE,
    ACTIONS(25), 1,
      anon_sym_LT,
    ACTIONS(202), 1,
      anon_sym_LBRACE,
    STATE(8), 1,
      sym_string_literal,
    STATE(13), 1,
      sym_html_string,
    STATE(46), 1,
      sym_preproc,
    STATE(64), 1,
      sym_id,
    STATE(68), 1,
      sym_block,
    ACTIONS(21), 2,
      sym_identifier,
      sym_number_literal,
  [1438] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(47), 1,
      sym_preproc,
    ACTIONS(206), 2,
      anon_sym_SEMI,
      anon_sym_COMMA,
    ACTIONS(204), 5,
      anon_sym_RBRACK,
      sym_identifier,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
  [1459] = 9,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(23), 1,
      anon_sym_DQUOTE,
    ACTIONS(25), 1,
      anon_sym_LT,
    STATE(8), 1,
      sym_string_literal,
    STATE(13), 1,
      sym_html_string,
    STATE(19), 1,
      sym_id,
    STATE(48), 1,
      sym_preproc,
    ACTIONS(21), 2,
      sym_identifier,
      sym_number_literal,
  [1488] = 9,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(23), 1,
      anon_sym_DQUOTE,
    ACTIONS(25), 1,
      anon_sym_LT,
    STATE(8), 1,
      sym_string_literal,
    STATE(13), 1,
      sym_html_string,
    STATE(29), 1,
      sym_id,
    STATE(49), 1,
      sym_preproc,
    ACTIONS(21), 2,
      sym_identifier,
      sym_number_literal,
  [1517] = 9,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(23), 1,
      anon_sym_DQUOTE,
    ACTIONS(25), 1,
      anon_sym_LT,
    STATE(8), 1,
      sym_string_literal,
    STATE(13), 1,
      sym_html_string,
    STATE(26), 1,
      sym_id,
    STATE(50), 1,
      sym_preproc,
    ACTIONS(21), 2,
      sym_identifier,
      sym_number_literal,
  [1546] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(51), 1,
      sym_preproc,
    ACTIONS(208), 2,
      aux_sym_subgraph_token1,
      sym_identifier,
    ACTIONS(210), 4,
      anon_sym_LBRACE,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
  [1566] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(52), 1,
      sym_preproc,
    ACTIONS(190), 5,
      anon_sym_RBRACK,
      sym_identifier,
      sym_number_literal,
      anon_sym_DQUOTE,
      anon_sym_LT,
  [1583] = 7,
    ACTIONS(212), 1,
      anon_sym_LT,
    ACTIONS(214), 1,
      anon_sym_GT,
    ACTIONS(216), 1,
      aux_sym__html_internal_token1,
    ACTIONS(218), 1,
      sym_comment,
    ACTIONS(220), 1,
      anon_sym_POUND,
    STATE(53), 1,
      sym_preproc,
    STATE(56), 1,
      aux_sym__html_internal,
  [1605] = 6,
    ACTIONS(218), 1,
      sym_comment,
    ACTIONS(220), 1,
      anon_sym_POUND,
    ACTIONS(222), 1,
      anon_sym_LT,
    ACTIONS(225), 1,
      anon_sym_GT,
    ACTIONS(227), 1,
      aux_sym__html_internal_token1,
    STATE(54), 2,
      aux_sym__html_internal,
      sym_preproc,
  [1625] = 7,
    ACTIONS(212), 1,
      anon_sym_LT,
    ACTIONS(216), 1,
      aux_sym__html_internal_token1,
    ACTIONS(218), 1,
      sym_comment,
    ACTIONS(220), 1,
      anon_sym_POUND,
    ACTIONS(230), 1,
      anon_sym_GT,
    STATE(54), 1,
      aux_sym__html_internal,
    STATE(55), 1,
      sym_preproc,
  [1647] = 7,
    ACTIONS(212), 1,
      anon_sym_LT,
    ACTIONS(216), 1,
      aux_sym__html_internal_token1,
    ACTIONS(218), 1,
      sym_comment,
    ACTIONS(220), 1,
      anon_sym_POUND,
    ACTIONS(232), 1,
      anon_sym_GT,
    STATE(54), 1,
      aux_sym__html_internal,
    STATE(56), 1,
      sym_preproc,
  [1669] = 7,
    ACTIONS(212), 1,
      anon_sym_LT,
    ACTIONS(216), 1,
      aux_sym__html_internal_token1,
    ACTIONS(218), 1,
      sym_comment,
    ACTIONS(220), 1,
      anon_sym_POUND,
    ACTIONS(234), 1,
      anon_sym_GT,
    STATE(55), 1,
      aux_sym__html_internal,
    STATE(57), 1,
      sym_preproc,
  [1691] = 6,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(79), 1,
      anon_sym_LBRACK,
    STATE(31), 1,
      aux_sym_attr_list_repeat1,
    STATE(37), 1,
      sym_attr_list,
    STATE(58), 1,
      sym_preproc,
  [1710] = 4,
    ACTIONS(218), 1,
      sym_comment,
    ACTIONS(220), 1,
      anon_sym_POUND,
    STATE(59), 1,
      sym_preproc,
    ACTIONS(225), 3,
      anon_sym_LT,
      anon_sym_GT,
      aux_sym__html_internal_token1,
  [1725] = 4,
    ACTIONS(218), 1,
      sym_comment,
    ACTIONS(220), 1,
      anon_sym_POUND,
    STATE(60), 1,
      sym_preproc,
    ACTIONS(236), 3,
      anon_sym_LT,
      anon_sym_GT,
      aux_sym__html_internal_token1,
  [1740] = 4,
    ACTIONS(218), 1,
      sym_comment,
    ACTIONS(220), 1,
      anon_sym_POUND,
    STATE(61), 1,
      sym_preproc,
    ACTIONS(238), 3,
      anon_sym_LT,
      anon_sym_GT,
      aux_sym__html_internal_token1,
  [1755] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(15), 1,
      anon_sym_LBRACE,
    STATE(27), 1,
      sym_block,
    STATE(62), 1,
      sym_preproc,
  [1771] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(23), 1,
      anon_sym_DQUOTE,
    STATE(9), 1,
      sym_string_literal,
    STATE(63), 1,
      sym_preproc,
  [1787] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(202), 1,
      anon_sym_LBRACE,
    STATE(64), 1,
      sym_preproc,
    STATE(75), 1,
      sym_block,
  [1803] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(202), 1,
      anon_sym_LBRACE,
    STATE(65), 1,
      sym_preproc,
    STATE(74), 1,
      sym_block,
  [1819] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    STATE(66), 1,
      sym_preproc,
    ACTIONS(240), 2,
      aux_sym_source_file_token2,
      aux_sym_source_file_token3,
  [1833] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(126), 1,
      ts_builtin_sym_end,
    STATE(67), 1,
      sym_preproc,
  [1846] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(242), 1,
      ts_builtin_sym_end,
    STATE(68), 1,
      sym_preproc,
  [1859] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(244), 1,
      ts_builtin_sym_end,
    STATE(69), 1,
      sym_preproc,
  [1872] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(138), 1,
      ts_builtin_sym_end,
    STATE(70), 1,
      sym_preproc,
  [1885] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(246), 1,
      anon_sym_RBRACE,
    STATE(71), 1,
      sym_preproc,
  [1898] = 4,
    ACTIONS(218), 1,
      sym_comment,
    ACTIONS(220), 1,
      anon_sym_POUND,
    ACTIONS(248), 1,
      aux_sym_string_literal_token1,
    STATE(72), 1,
      sym_preproc,
  [1911] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(101), 1,
      anon_sym_EQ,
    STATE(73), 1,
      sym_preproc,
  [1924] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(250), 1,
      ts_builtin_sym_end,
    STATE(74), 1,
      sym_preproc,
  [1937] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(252), 1,
      ts_builtin_sym_end,
    STATE(75), 1,
      sym_preproc,
  [1950] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(254), 1,
      ts_builtin_sym_end,
    STATE(76), 1,
      sym_preproc,
  [1963] = 4,
    ACTIONS(218), 1,
      sym_comment,
    ACTIONS(220), 1,
      anon_sym_POUND,
    ACTIONS(256), 1,
      aux_sym_preproc_token1,
    STATE(77), 1,
      sym_preproc,
  [1976] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(5), 1,
      anon_sym_POUND,
    ACTIONS(258), 1,
      anon_sym_RBRACE,
    STATE(78), 1,
      sym_preproc,
  [1989] = 1,
    ACTIONS(260), 1,
      ts_builtin_sym_end,
};

static const uint32_t ts_small_parse_table_map[] = {
  [SMALL_STATE(4)] = 0,
  [SMALL_STATE(5)] = 64,
  [SMALL_STATE(6)] = 130,
  [SMALL_STATE(7)] = 168,
  [SMALL_STATE(8)] = 204,
  [SMALL_STATE(9)] = 242,
  [SMALL_STATE(10)] = 275,
  [SMALL_STATE(11)] = 308,
  [SMALL_STATE(12)] = 352,
  [SMALL_STATE(13)] = 384,
  [SMALL_STATE(14)] = 416,
  [SMALL_STATE(15)] = 448,
  [SMALL_STATE(16)] = 492,
  [SMALL_STATE(17)] = 529,
  [SMALL_STATE(18)] = 563,
  [SMALL_STATE(19)] = 597,
  [SMALL_STATE(20)] = 628,
  [SMALL_STATE(21)] = 663,
  [SMALL_STATE(22)] = 691,
  [SMALL_STATE(23)] = 719,
  [SMALL_STATE(24)] = 747,
  [SMALL_STATE(25)] = 775,
  [SMALL_STATE(26)] = 803,
  [SMALL_STATE(27)] = 831,
  [SMALL_STATE(28)] = 859,
  [SMALL_STATE(29)] = 887,
  [SMALL_STATE(30)] = 914,
  [SMALL_STATE(31)] = 943,
  [SMALL_STATE(32)] = 974,
  [SMALL_STATE(33)] = 1000,
  [SMALL_STATE(34)] = 1026,
  [SMALL_STATE(35)] = 1070,
  [SMALL_STATE(36)] = 1095,
  [SMALL_STATE(37)] = 1120,
  [SMALL_STATE(38)] = 1145,
  [SMALL_STATE(39)] = 1170,
  [SMALL_STATE(40)] = 1197,
  [SMALL_STATE(41)] = 1235,
  [SMALL_STATE(42)] = 1271,
  [SMALL_STATE(43)] = 1309,
  [SMALL_STATE(44)] = 1333,
  [SMALL_STATE(45)] = 1368,
  [SMALL_STATE(46)] = 1403,
  [SMALL_STATE(47)] = 1438,
  [SMALL_STATE(48)] = 1459,
  [SMALL_STATE(49)] = 1488,
  [SMALL_STATE(50)] = 1517,
  [SMALL_STATE(51)] = 1546,
  [SMALL_STATE(52)] = 1566,
  [SMALL_STATE(53)] = 1583,
  [SMALL_STATE(54)] = 1605,
  [SMALL_STATE(55)] = 1625,
  [SMALL_STATE(56)] = 1647,
  [SMALL_STATE(57)] = 1669,
  [SMALL_STATE(58)] = 1691,
  [SMALL_STATE(59)] = 1710,
  [SMALL_STATE(60)] = 1725,
  [SMALL_STATE(61)] = 1740,
  [SMALL_STATE(62)] = 1755,
  [SMALL_STATE(63)] = 1771,
  [SMALL_STATE(64)] = 1787,
  [SMALL_STATE(65)] = 1803,
  [SMALL_STATE(66)] = 1819,
  [SMALL_STATE(67)] = 1833,
  [SMALL_STATE(68)] = 1846,
  [SMALL_STATE(69)] = 1859,
  [SMALL_STATE(70)] = 1872,
  [SMALL_STATE(71)] = 1885,
  [SMALL_STATE(72)] = 1898,
  [SMALL_STATE(73)] = 1911,
  [SMALL_STATE(74)] = 1924,
  [SMALL_STATE(75)] = 1937,
  [SMALL_STATE(76)] = 1950,
  [SMALL_STATE(77)] = 1963,
  [SMALL_STATE(78)] = 1976,
  [SMALL_STATE(79)] = 1989,
};

static const TSParseActionEntry ts_parse_actions[] = {
  [0] = {.entry = {.count = 0, .reusable = false}},
  [1] = {.entry = {.count = 1, .reusable = false}}, RECOVER(),
  [3] = {.entry = {.count = 1, .reusable = true}}, SHIFT_EXTRA(),
  [5] = {.entry = {.count = 1, .reusable = true}}, SHIFT(77),
  [7] = {.entry = {.count = 1, .reusable = true}}, SHIFT(66),
  [9] = {.entry = {.count = 1, .reusable = true}}, SHIFT(45),
  [11] = {.entry = {.count = 1, .reusable = false}}, SHIFT(13),
  [13] = {.entry = {.count = 1, .reusable = false}}, SHIFT(58),
  [15] = {.entry = {.count = 1, .reusable = true}}, SHIFT(2),
  [17] = {.entry = {.count = 1, .reusable = true}}, SHIFT(22),
  [19] = {.entry = {.count = 1, .reusable = false}}, SHIFT(44),
  [21] = {.entry = {.count = 1, .reusable = true}}, SHIFT(13),
  [23] = {.entry = {.count = 1, .reusable = true}}, SHIFT(72),
  [25] = {.entry = {.count = 1, .reusable = true}}, SHIFT(53),
  [27] = {.entry = {.count = 1, .reusable = true}}, SHIFT(67),
  [29] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_stmt_list_repeat1, 2), SHIFT_REPEAT(13),
  [32] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_stmt_list_repeat1, 2), SHIFT_REPEAT(58),
  [35] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_stmt_list_repeat1, 2), SHIFT_REPEAT(2),
  [38] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_stmt_list_repeat1, 2),
  [40] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_stmt_list_repeat1, 2), SHIFT_REPEAT(44),
  [43] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_stmt_list_repeat1, 2), SHIFT_REPEAT(13),
  [46] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_stmt_list_repeat1, 2), SHIFT_REPEAT(72),
  [49] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_stmt_list_repeat1, 2), SHIFT_REPEAT(53),
  [52] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_stmt_list, 1),
  [54] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_id, 2),
  [56] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_id, 2),
  [58] = {.entry = {.count = 1, .reusable = true}}, SHIFT(63),
  [60] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_id_repeat1, 2),
  [62] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_id_repeat1, 2),
  [64] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_id_repeat1, 2), SHIFT_REPEAT(63),
  [67] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_id, 1),
  [69] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_id, 1),
  [71] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_string_literal, 2),
  [73] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_string_literal, 2),
  [75] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_edge_stmt, 2),
  [77] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_edge_stmt, 2),
  [79] = {.entry = {.count = 1, .reusable = true}}, SHIFT(42),
  [81] = {.entry = {.count = 1, .reusable = true}}, SHIFT(51),
  [83] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_html_string, 3, .production_id = 6),
  [85] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_html_string, 3, .production_id = 6),
  [87] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_html_string, 2),
  [89] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_html_string, 2),
  [91] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_node_stmt, 1),
  [93] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_node_stmt, 1),
  [95] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_node_id, 1),
  [97] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_node_id, 1),
  [99] = {.entry = {.count = 1, .reusable = true}}, SHIFT(48),
  [101] = {.entry = {.count = 1, .reusable = true}}, SHIFT(49),
  [103] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_edge_stmt_repeat1, 2),
  [105] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_edge_stmt_repeat1, 2),
  [107] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_edge_stmt_repeat1, 2), SHIFT_REPEAT(51),
  [110] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_port, 2),
  [112] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_port, 2),
  [114] = {.entry = {.count = 1, .reusable = true}}, SHIFT(50),
  [116] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym__stmt, 1),
  [118] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__stmt, 1),
  [120] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_subgraph, 1, .production_id = 3),
  [122] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_subgraph, 1, .production_id = 3),
  [124] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_block, 2),
  [126] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_block, 2),
  [128] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_subgraph, 2, .production_id = 1),
  [130] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_subgraph, 2, .production_id = 1),
  [132] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_node_id, 2),
  [134] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_node_id, 2),
  [136] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_block, 3),
  [138] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_block, 3),
  [140] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_port, 4),
  [142] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_port, 4),
  [144] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_subgraph, 3, .production_id = 4),
  [146] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_subgraph, 3, .production_id = 4),
  [148] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_attribute, 3, .production_id = 7),
  [150] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_attribute, 3, .production_id = 7),
  [152] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_attr_list_repeat1, 2),
  [154] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_attr_list_repeat1, 2),
  [156] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_attr_list_repeat1, 2), SHIFT_REPEAT(42),
  [159] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_attr_list, 1),
  [161] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_attr_list, 1),
  [163] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_attr_list_repeat1, 3),
  [165] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_attr_list_repeat1, 3),
  [167] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_edge_stmt, 3),
  [169] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_edge_stmt, 3),
  [171] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_node_stmt, 2),
  [173] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_node_stmt, 2),
  [175] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_attr_stmt, 2),
  [177] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_attr_stmt, 2),
  [179] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_stmt_list_repeat1, 1),
  [181] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_stmt_list_repeat1, 1),
  [183] = {.entry = {.count = 1, .reusable = true}}, SHIFT(43),
  [185] = {.entry = {.count = 1, .reusable = true}}, SHIFT(32),
  [187] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym__a_list, 2), SHIFT_REPEAT(13),
  [190] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym__a_list, 2),
  [192] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym__a_list, 2), SHIFT_REPEAT(72),
  [195] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym__a_list, 2), SHIFT_REPEAT(53),
  [198] = {.entry = {.count = 1, .reusable = true}}, SHIFT(33),
  [200] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_stmt_list_repeat1, 2),
  [202] = {.entry = {.count = 1, .reusable = true}}, SHIFT(3),
  [204] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym__a_list, 1),
  [206] = {.entry = {.count = 1, .reusable = true}}, SHIFT(52),
  [208] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_edgeop, 1),
  [210] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_edgeop, 1),
  [212] = {.entry = {.count = 1, .reusable = false}}, SHIFT(57),
  [214] = {.entry = {.count = 1, .reusable = false}}, SHIFT(14),
  [216] = {.entry = {.count = 1, .reusable = false}}, SHIFT(60),
  [218] = {.entry = {.count = 1, .reusable = false}}, SHIFT_EXTRA(),
  [220] = {.entry = {.count = 1, .reusable = false}}, SHIFT(77),
  [222] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym__html_internal, 2), SHIFT_REPEAT(57),
  [225] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym__html_internal, 2),
  [227] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym__html_internal, 2), SHIFT_REPEAT(60),
  [230] = {.entry = {.count = 1, .reusable = false}}, SHIFT(61),
  [232] = {.entry = {.count = 1, .reusable = false}}, SHIFT(12),
  [234] = {.entry = {.count = 1, .reusable = false}}, SHIFT(59),
  [236] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym__html_internal, 1),
  [238] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym__html_internal, 3),
  [240] = {.entry = {.count = 1, .reusable = true}}, SHIFT(46),
  [242] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 3, .production_id = 2),
  [244] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 2, .production_id = 1),
  [246] = {.entry = {.count = 1, .reusable = true}}, SHIFT(70),
  [248] = {.entry = {.count = 1, .reusable = false}}, SHIFT(10),
  [250] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 3, .production_id = 4),
  [252] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 4, .production_id = 5),
  [254] = {.entry = {.count = 1, .reusable = true}},  ACCEPT_INPUT(),
  [256] = {.entry = {.count = 1, .reusable = false}}, SHIFT(79),
  [258] = {.entry = {.count = 1, .reusable = true}}, SHIFT(25),
  [260] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_preproc, 2),
};

#ifdef __cplusplus
extern "C" {
#endif
#ifdef _WIN32
#define extern __declspec(dllexport)
#endif

extern const TSLanguage *tree_sitter_dot(void) {
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
    .field_names = ts_field_names,
    .field_map_slices = ts_field_map_slices,
    .field_map_entries = ts_field_map_entries,
    .symbol_metadata = ts_symbol_metadata,
    .public_symbol_map = ts_symbol_map,
    .alias_map = ts_non_terminal_alias_map,
    .alias_sequences = &ts_alias_sequences[0][0],
    .lex_modes = ts_lex_modes,
    .lex_fn = ts_lex,
    .keyword_lex_fn = ts_lex_keywords,
    .keyword_capture_token = sym_identifier,
  };
  return &language;
}
#ifdef __cplusplus
}
#endif

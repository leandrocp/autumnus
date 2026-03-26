#include <tree_sitter/parser.h>

#if defined(__GNUC__) || defined(__clang__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wmissing-field-initializers"
#endif

#define LANGUAGE_VERSION 13
#define STATE_COUNT 101
#define LARGE_STATE_COUNT 2
#define SYMBOL_COUNT 83
#define ALIAS_COUNT 0
#define TOKEN_COUNT 41
#define EXTERNAL_TOKEN_COUNT 0
#define FIELD_COUNT 6
#define MAX_ALIAS_SEQUENCE_LENGTH 5
#define PRODUCTION_ID_COUNT 19

enum {
  sym_identifier = 1,
  anon_sym_datasource = 2,
  anon_sym_generator = 3,
  anon_sym_LBRACE = 4,
  anon_sym_RBRACE = 5,
  anon_sym_EQ = 6,
  anon_sym_model = 7,
  anon_sym_enum = 8,
  anon_sym_AT = 9,
  anon_sym_AT_AT = 10,
  anon_sym_LPAREN = 11,
  anon_sym_RPAREN = 12,
  anon_sym_DOT = 13,
  anon_sym_COMMA = 14,
  anon_sym_COLON = 15,
  anon_sym_QMARK = 16,
  anon_sym_LBRACK = 17,
  anon_sym_RBRACK = 18,
  anon_sym_String = 19,
  anon_sym_Boolean = 20,
  anon_sym_Int = 21,
  anon_sym_DateTime = 22,
  anon_sym_BigInt = 23,
  anon_sym_Decimal = 24,
  anon_sym_Float = 25,
  anon_sym_Json = 26,
  anon_sym_Bytes = 27,
  sym_document_comment = 28,
  sym_comment = 29,
  anon_sym_DQUOTE = 30,
  aux_sym_string_token1 = 31,
  anon_sym_DASH = 32,
  aux_sym_integer_token1 = 33,
  anon_sym_true = 34,
  anon_sym_false = 35,
  anon_sym_BSLASH_DQUOTE = 36,
  anon_sym_BSLASH_BSLASH = 37,
  anon_sym_BSLASHn = 38,
  anon_sym_BSLASHr = 39,
  sym_special_constant = 40,
  sym_source_file = 41,
  sym__block = 42,
  sym_key_value_block = 43,
  aux_sym__key_value_block_content = 44,
  sym_key_value = 45,
  sym_key = 46,
  sym_value = 47,
  sym_model_block = 48,
  aux_sym__model_block_content = 49,
  sym_model_field = 50,
  sym_enum_block = 51,
  aux_sym__enum_block_content = 52,
  sym_model_single_attribute = 53,
  sym_model_multi_attribute = 54,
  sym__model_attribute_args = 55,
  sym_attribute_specifier = 56,
  sym__model_attribute_arg_separated = 57,
  sym__model_attribute_arg = 58,
  sym__model_attribute_arg_labeled = 59,
  sym__model_attribute_arg_no_label = 60,
  sym__identifier_separated = 61,
  sym_field_type = 62,
  sym_nullable_type = 63,
  sym_array_type = 64,
  sym_non_null_type = 65,
  sym_prisma_type = 66,
  sym__field_array = 67,
  sym__expression = 68,
  sym_string = 69,
  sym_integer = 70,
  sym_boolean = 71,
  sym_string_char_escape = 72,
  sym_apply_function = 73,
  sym__expression_separated = 74,
  sym__array = 75,
  aux_sym_source_file_repeat1 = 76,
  aux_sym_model_field_repeat1 = 77,
  aux_sym_attribute_specifier_repeat1 = 78,
  aux_sym__model_attribute_arg_separated_repeat1 = 79,
  aux_sym__identifier_separated_repeat1 = 80,
  aux_sym_string_repeat1 = 81,
  aux_sym__expression_separated_repeat1 = 82,
};

static const char * const ts_symbol_names[] = {
  [ts_builtin_sym_end] = "end",
  [sym_identifier] = "identifier",
  [anon_sym_datasource] = "datasource",
  [anon_sym_generator] = "generator",
  [anon_sym_LBRACE] = "{",
  [anon_sym_RBRACE] = "}",
  [anon_sym_EQ] = "=",
  [anon_sym_model] = "model",
  [anon_sym_enum] = "enum",
  [anon_sym_AT] = "@",
  [anon_sym_AT_AT] = "@@",
  [anon_sym_LPAREN] = "(",
  [anon_sym_RPAREN] = ")",
  [anon_sym_DOT] = ".",
  [anon_sym_COMMA] = ",",
  [anon_sym_COLON] = ":",
  [anon_sym_QMARK] = "\?",
  [anon_sym_LBRACK] = "[",
  [anon_sym_RBRACK] = "]",
  [anon_sym_String] = "String",
  [anon_sym_Boolean] = "Boolean",
  [anon_sym_Int] = "Int",
  [anon_sym_DateTime] = "DateTime",
  [anon_sym_BigInt] = "BigInt",
  [anon_sym_Decimal] = "Decimal",
  [anon_sym_Float] = "Float",
  [anon_sym_Json] = "Json",
  [anon_sym_Bytes] = "Bytes",
  [sym_document_comment] = "document_comment",
  [sym_comment] = "comment",
  [anon_sym_DQUOTE] = "\"",
  [aux_sym_string_token1] = "string_token1",
  [anon_sym_DASH] = "-",
  [aux_sym_integer_token1] = "integer_token1",
  [anon_sym_true] = "true",
  [anon_sym_false] = "false",
  [anon_sym_BSLASH_DQUOTE] = "\\\"",
  [anon_sym_BSLASH_BSLASH] = "\\\\",
  [anon_sym_BSLASHn] = "\\n",
  [anon_sym_BSLASHr] = "\\r",
  [sym_special_constant] = "special_constant",
  [sym_source_file] = "source_file",
  [sym__block] = "_block",
  [sym_key_value_block] = "key_value_block",
  [aux_sym__key_value_block_content] = "_key_value_block_content",
  [sym_key_value] = "key_value",
  [sym_key] = "key",
  [sym_value] = "value",
  [sym_model_block] = "model_block",
  [aux_sym__model_block_content] = "_model_block_content",
  [sym_model_field] = "model_field",
  [sym_enum_block] = "enum_block",
  [aux_sym__enum_block_content] = "_enum_block_content",
  [sym_model_single_attribute] = "model_single_attribute",
  [sym_model_multi_attribute] = "model_multi_attribute",
  [sym__model_attribute_args] = "_model_attribute_args",
  [sym_attribute_specifier] = "attribute_specifier",
  [sym__model_attribute_arg_separated] = "_model_attribute_arg_separated",
  [sym__model_attribute_arg] = "_model_attribute_arg",
  [sym__model_attribute_arg_labeled] = "_model_attribute_arg_labeled",
  [sym__model_attribute_arg_no_label] = "_model_attribute_arg_no_label",
  [sym__identifier_separated] = "_identifier_separated",
  [sym_field_type] = "field_type",
  [sym_nullable_type] = "nullable_type",
  [sym_array_type] = "array_type",
  [sym_non_null_type] = "non_null_type",
  [sym_prisma_type] = "prisma_type",
  [sym__field_array] = "_field_array",
  [sym__expression] = "_expression",
  [sym_string] = "string",
  [sym_integer] = "integer",
  [sym_boolean] = "boolean",
  [sym_string_char_escape] = "string_char_escape",
  [sym_apply_function] = "apply_function",
  [sym__expression_separated] = "_expression_separated",
  [sym__array] = "_array",
  [aux_sym_source_file_repeat1] = "source_file_repeat1",
  [aux_sym_model_field_repeat1] = "model_field_repeat1",
  [aux_sym_attribute_specifier_repeat1] = "attribute_specifier_repeat1",
  [aux_sym__model_attribute_arg_separated_repeat1] = "_model_attribute_arg_separated_repeat1",
  [aux_sym__identifier_separated_repeat1] = "_identifier_separated_repeat1",
  [aux_sym_string_repeat1] = "string_repeat1",
  [aux_sym__expression_separated_repeat1] = "_expression_separated_repeat1",
};

static const TSSymbol ts_symbol_map[] = {
  [ts_builtin_sym_end] = ts_builtin_sym_end,
  [sym_identifier] = sym_identifier,
  [anon_sym_datasource] = anon_sym_datasource,
  [anon_sym_generator] = anon_sym_generator,
  [anon_sym_LBRACE] = anon_sym_LBRACE,
  [anon_sym_RBRACE] = anon_sym_RBRACE,
  [anon_sym_EQ] = anon_sym_EQ,
  [anon_sym_model] = anon_sym_model,
  [anon_sym_enum] = anon_sym_enum,
  [anon_sym_AT] = anon_sym_AT,
  [anon_sym_AT_AT] = anon_sym_AT_AT,
  [anon_sym_LPAREN] = anon_sym_LPAREN,
  [anon_sym_RPAREN] = anon_sym_RPAREN,
  [anon_sym_DOT] = anon_sym_DOT,
  [anon_sym_COMMA] = anon_sym_COMMA,
  [anon_sym_COLON] = anon_sym_COLON,
  [anon_sym_QMARK] = anon_sym_QMARK,
  [anon_sym_LBRACK] = anon_sym_LBRACK,
  [anon_sym_RBRACK] = anon_sym_RBRACK,
  [anon_sym_String] = anon_sym_String,
  [anon_sym_Boolean] = anon_sym_Boolean,
  [anon_sym_Int] = anon_sym_Int,
  [anon_sym_DateTime] = anon_sym_DateTime,
  [anon_sym_BigInt] = anon_sym_BigInt,
  [anon_sym_Decimal] = anon_sym_Decimal,
  [anon_sym_Float] = anon_sym_Float,
  [anon_sym_Json] = anon_sym_Json,
  [anon_sym_Bytes] = anon_sym_Bytes,
  [sym_document_comment] = sym_document_comment,
  [sym_comment] = sym_comment,
  [anon_sym_DQUOTE] = anon_sym_DQUOTE,
  [aux_sym_string_token1] = aux_sym_string_token1,
  [anon_sym_DASH] = anon_sym_DASH,
  [aux_sym_integer_token1] = aux_sym_integer_token1,
  [anon_sym_true] = anon_sym_true,
  [anon_sym_false] = anon_sym_false,
  [anon_sym_BSLASH_DQUOTE] = anon_sym_BSLASH_DQUOTE,
  [anon_sym_BSLASH_BSLASH] = anon_sym_BSLASH_BSLASH,
  [anon_sym_BSLASHn] = anon_sym_BSLASHn,
  [anon_sym_BSLASHr] = anon_sym_BSLASHr,
  [sym_special_constant] = sym_special_constant,
  [sym_source_file] = sym_source_file,
  [sym__block] = sym__block,
  [sym_key_value_block] = sym_key_value_block,
  [aux_sym__key_value_block_content] = aux_sym__key_value_block_content,
  [sym_key_value] = sym_key_value,
  [sym_key] = sym_key,
  [sym_value] = sym_value,
  [sym_model_block] = sym_model_block,
  [aux_sym__model_block_content] = aux_sym__model_block_content,
  [sym_model_field] = sym_model_field,
  [sym_enum_block] = sym_enum_block,
  [aux_sym__enum_block_content] = aux_sym__enum_block_content,
  [sym_model_single_attribute] = sym_model_single_attribute,
  [sym_model_multi_attribute] = sym_model_multi_attribute,
  [sym__model_attribute_args] = sym__model_attribute_args,
  [sym_attribute_specifier] = sym_attribute_specifier,
  [sym__model_attribute_arg_separated] = sym__model_attribute_arg_separated,
  [sym__model_attribute_arg] = sym__model_attribute_arg,
  [sym__model_attribute_arg_labeled] = sym__model_attribute_arg_labeled,
  [sym__model_attribute_arg_no_label] = sym__model_attribute_arg_no_label,
  [sym__identifier_separated] = sym__identifier_separated,
  [sym_field_type] = sym_field_type,
  [sym_nullable_type] = sym_nullable_type,
  [sym_array_type] = sym_array_type,
  [sym_non_null_type] = sym_non_null_type,
  [sym_prisma_type] = sym_prisma_type,
  [sym__field_array] = sym__field_array,
  [sym__expression] = sym__expression,
  [sym_string] = sym_string,
  [sym_integer] = sym_integer,
  [sym_boolean] = sym_boolean,
  [sym_string_char_escape] = sym_string_char_escape,
  [sym_apply_function] = sym_apply_function,
  [sym__expression_separated] = sym__expression_separated,
  [sym__array] = sym__array,
  [aux_sym_source_file_repeat1] = aux_sym_source_file_repeat1,
  [aux_sym_model_field_repeat1] = aux_sym_model_field_repeat1,
  [aux_sym_attribute_specifier_repeat1] = aux_sym_attribute_specifier_repeat1,
  [aux_sym__model_attribute_arg_separated_repeat1] = aux_sym__model_attribute_arg_separated_repeat1,
  [aux_sym__identifier_separated_repeat1] = aux_sym__identifier_separated_repeat1,
  [aux_sym_string_repeat1] = aux_sym_string_repeat1,
  [aux_sym__expression_separated_repeat1] = aux_sym__expression_separated_repeat1,
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
  [anon_sym_datasource] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_generator] = {
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
  [anon_sym_EQ] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_model] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_enum] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_AT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_AT_AT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LPAREN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_RPAREN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_DOT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_COMMA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_COLON] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_QMARK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LBRACK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_RBRACK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_String] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_Boolean] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_Int] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_DateTime] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_BigInt] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_Decimal] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_Float] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_Json] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_Bytes] = {
    .visible = true,
    .named = false,
  },
  [sym_document_comment] = {
    .visible = true,
    .named = true,
  },
  [sym_comment] = {
    .visible = true,
    .named = true,
  },
  [anon_sym_DQUOTE] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_string_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_DASH] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_integer_token1] = {
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
  [anon_sym_BSLASH_DQUOTE] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_BSLASH_BSLASH] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_BSLASHn] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_BSLASHr] = {
    .visible = true,
    .named = false,
  },
  [sym_special_constant] = {
    .visible = true,
    .named = true,
  },
  [sym_source_file] = {
    .visible = true,
    .named = true,
  },
  [sym__block] = {
    .visible = false,
    .named = true,
  },
  [sym_key_value_block] = {
    .visible = true,
    .named = true,
  },
  [aux_sym__key_value_block_content] = {
    .visible = false,
    .named = false,
  },
  [sym_key_value] = {
    .visible = true,
    .named = true,
  },
  [sym_key] = {
    .visible = true,
    .named = true,
  },
  [sym_value] = {
    .visible = true,
    .named = true,
  },
  [sym_model_block] = {
    .visible = true,
    .named = true,
  },
  [aux_sym__model_block_content] = {
    .visible = false,
    .named = false,
  },
  [sym_model_field] = {
    .visible = true,
    .named = true,
  },
  [sym_enum_block] = {
    .visible = true,
    .named = true,
  },
  [aux_sym__enum_block_content] = {
    .visible = false,
    .named = false,
  },
  [sym_model_single_attribute] = {
    .visible = true,
    .named = true,
  },
  [sym_model_multi_attribute] = {
    .visible = true,
    .named = true,
  },
  [sym__model_attribute_args] = {
    .visible = false,
    .named = true,
  },
  [sym_attribute_specifier] = {
    .visible = true,
    .named = true,
  },
  [sym__model_attribute_arg_separated] = {
    .visible = false,
    .named = true,
  },
  [sym__model_attribute_arg] = {
    .visible = false,
    .named = true,
  },
  [sym__model_attribute_arg_labeled] = {
    .visible = false,
    .named = true,
  },
  [sym__model_attribute_arg_no_label] = {
    .visible = false,
    .named = true,
  },
  [sym__identifier_separated] = {
    .visible = false,
    .named = true,
  },
  [sym_field_type] = {
    .visible = true,
    .named = true,
  },
  [sym_nullable_type] = {
    .visible = true,
    .named = true,
  },
  [sym_array_type] = {
    .visible = true,
    .named = true,
  },
  [sym_non_null_type] = {
    .visible = true,
    .named = true,
  },
  [sym_prisma_type] = {
    .visible = true,
    .named = true,
  },
  [sym__field_array] = {
    .visible = false,
    .named = true,
  },
  [sym__expression] = {
    .visible = false,
    .named = true,
  },
  [sym_string] = {
    .visible = true,
    .named = true,
  },
  [sym_integer] = {
    .visible = true,
    .named = true,
  },
  [sym_boolean] = {
    .visible = true,
    .named = true,
  },
  [sym_string_char_escape] = {
    .visible = true,
    .named = true,
  },
  [sym_apply_function] = {
    .visible = true,
    .named = true,
  },
  [sym__expression_separated] = {
    .visible = false,
    .named = true,
  },
  [sym__array] = {
    .visible = false,
    .named = true,
  },
  [aux_sym_source_file_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_model_field_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_attribute_specifier_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym__model_attribute_arg_separated_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym__identifier_separated_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_string_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym__expression_separated_repeat1] = {
    .visible = false,
    .named = false,
  },
};

enum {
  field_argument = 1,
  field_enum_value = 2,
  field_field_name = 3,
  field_fields = 4,
  field_label = 5,
  field_name = 6,
};

static const char * const ts_field_names[] = {
  [0] = NULL,
  [field_argument] = "argument",
  [field_enum_value] = "enum_value",
  [field_field_name] = "field_name",
  [field_fields] = "fields",
  [field_label] = "label",
  [field_name] = "name",
};

static const TSFieldMapSlice ts_field_map_slices[PRODUCTION_ID_COUNT] = {
  [1] = {.index = 0, .length = 1},
  [2] = {.index = 1, .length = 1},
  [3] = {.index = 2, .length = 2},
  [4] = {.index = 4, .length = 4},
  [5] = {.index = 8, .length = 3},
  [6] = {.index = 11, .length = 4},
  [7] = {.index = 15, .length = 3},
  [8] = {.index = 18, .length = 1},
  [9] = {.index = 19, .length = 5},
  [10] = {.index = 24, .length = 2},
  [11] = {.index = 26, .length = 1},
  [12] = {.index = 27, .length = 4},
  [13] = {.index = 31, .length = 8},
  [14] = {.index = 39, .length = 3},
  [15] = {.index = 42, .length = 4},
  [16] = {.index = 46, .length = 3},
  [17] = {.index = 49, .length = 1},
  [18] = {.index = 50, .length = 4},
};

static const TSFieldMapEntry ts_field_map_entries[] = {
  [0] =
    {field_field_name, 0},
  [1] =
    {field_enum_value, 0},
  [2] =
    {field_argument, 0, .inherited = true},
    {field_enum_value, 0, .inherited = true},
  [4] =
    {field_argument, 2, .inherited = true},
    {field_enum_value, 2, .inherited = true},
    {field_fields, 2, .inherited = true},
    {field_label, 2, .inherited = true},
  [8] =
    {field_argument, 0},
    {field_argument, 0, .inherited = true},
    {field_enum_value, 0, .inherited = true},
  [11] =
    {field_argument, 0, .inherited = true},
    {field_enum_value, 0, .inherited = true},
    {field_fields, 0, .inherited = true},
    {field_label, 0, .inherited = true},
  [15] =
    {field_argument, 0, .inherited = true},
    {field_enum_value, 0, .inherited = true},
    {field_fields, 0, .inherited = true},
  [18] =
    {field_fields, 0, .inherited = true},
  [19] =
    {field_argument, 0},
    {field_argument, 0, .inherited = true},
    {field_argument, 1, .inherited = true},
    {field_enum_value, 0, .inherited = true},
    {field_enum_value, 1, .inherited = true},
  [24] =
    {field_argument, 1, .inherited = true},
    {field_enum_value, 1, .inherited = true},
  [26] =
    {field_name, 0},
  [27] =
    {field_argument, 1, .inherited = true},
    {field_enum_value, 1, .inherited = true},
    {field_fields, 1, .inherited = true},
    {field_label, 1, .inherited = true},
  [31] =
    {field_argument, 0, .inherited = true},
    {field_argument, 1, .inherited = true},
    {field_enum_value, 0, .inherited = true},
    {field_enum_value, 1, .inherited = true},
    {field_fields, 0, .inherited = true},
    {field_fields, 1, .inherited = true},
    {field_label, 0, .inherited = true},
    {field_label, 1, .inherited = true},
  [39] =
    {field_argument, 1},
    {field_argument, 1, .inherited = true},
    {field_enum_value, 1, .inherited = true},
  [42] =
    {field_argument, 0, .inherited = true},
    {field_argument, 1, .inherited = true},
    {field_enum_value, 0, .inherited = true},
    {field_enum_value, 1, .inherited = true},
  [46] =
    {field_argument, 2, .inherited = true},
    {field_enum_value, 2, .inherited = true},
    {field_name, 0},
  [49] =
    {field_fields, 1},
  [50] =
    {field_argument, 2, .inherited = true},
    {field_enum_value, 2, .inherited = true},
    {field_fields, 2, .inherited = true},
    {field_label, 0},
};

static const TSSymbol ts_alias_sequences[PRODUCTION_ID_COUNT][MAX_ALIAS_SEQUENCE_LENGTH] = {
  [0] = {0},
};

static const uint16_t ts_non_terminal_alias_map[] = {
  0,
};

static bool ts_lex(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (eof) ADVANCE(4);
      if (lookahead == '"') ADVANCE(21);
      if (lookahead == '(') ADVANCE(10);
      if (lookahead == ')') ADVANCE(11);
      if (lookahead == ',') ADVANCE(13);
      if (lookahead == '-') ADVANCE(25);
      if (lookahead == '.') ADVANCE(12);
      if (lookahead == '/') ADVANCE(3);
      if (lookahead == '0') ADVANCE(26);
      if (lookahead == ':') ADVANCE(14);
      if (lookahead == '=') ADVANCE(7);
      if (lookahead == '?') ADVANCE(15);
      if (lookahead == '@') ADVANCE(8);
      if (lookahead == '[') ADVANCE(16);
      if (lookahead == '\\') ADVANCE(2);
      if (lookahead == ']') ADVANCE(17);
      if (lookahead == '{') ADVANCE(5);
      if (lookahead == '}') ADVANCE(6);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') SKIP(0)
      if (('1' <= lookahead && lookahead <= '9')) ADVANCE(27);
      if (('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(32);
      END_STATE();
    case 1:
      if (lookahead == '\n') SKIP(1)
      if (lookahead == '"') ADVANCE(21);
      if (lookahead == '/') ADVANCE(23);
      if (lookahead == '\\') ADVANCE(2);
      if (lookahead == '\t' ||
          lookahead == '\r' ||
          lookahead == ' ') ADVANCE(24);
      if (lookahead != 0) ADVANCE(22);
      END_STATE();
    case 2:
      if (lookahead == '"') ADVANCE(28);
      if (lookahead == '\\') ADVANCE(29);
      if (lookahead == 'n') ADVANCE(30);
      if (lookahead == 'r') ADVANCE(31);
      END_STATE();
    case 3:
      if (lookahead == '/') ADVANCE(19);
      END_STATE();
    case 4:
      ACCEPT_TOKEN(ts_builtin_sym_end);
      END_STATE();
    case 5:
      ACCEPT_TOKEN(anon_sym_LBRACE);
      END_STATE();
    case 6:
      ACCEPT_TOKEN(anon_sym_RBRACE);
      END_STATE();
    case 7:
      ACCEPT_TOKEN(anon_sym_EQ);
      END_STATE();
    case 8:
      ACCEPT_TOKEN(anon_sym_AT);
      if (lookahead == '@') ADVANCE(9);
      END_STATE();
    case 9:
      ACCEPT_TOKEN(anon_sym_AT_AT);
      END_STATE();
    case 10:
      ACCEPT_TOKEN(anon_sym_LPAREN);
      END_STATE();
    case 11:
      ACCEPT_TOKEN(anon_sym_RPAREN);
      END_STATE();
    case 12:
      ACCEPT_TOKEN(anon_sym_DOT);
      END_STATE();
    case 13:
      ACCEPT_TOKEN(anon_sym_COMMA);
      END_STATE();
    case 14:
      ACCEPT_TOKEN(anon_sym_COLON);
      END_STATE();
    case 15:
      ACCEPT_TOKEN(anon_sym_QMARK);
      END_STATE();
    case 16:
      ACCEPT_TOKEN(anon_sym_LBRACK);
      END_STATE();
    case 17:
      ACCEPT_TOKEN(anon_sym_RBRACK);
      END_STATE();
    case 18:
      ACCEPT_TOKEN(sym_document_comment);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(18);
      END_STATE();
    case 19:
      ACCEPT_TOKEN(sym_comment);
      if (lookahead == '/') ADVANCE(18);
      if (lookahead != 0) ADVANCE(20);
      END_STATE();
    case 20:
      ACCEPT_TOKEN(sym_comment);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(20);
      END_STATE();
    case 21:
      ACCEPT_TOKEN(anon_sym_DQUOTE);
      END_STATE();
    case 22:
      ACCEPT_TOKEN(aux_sym_string_token1);
      END_STATE();
    case 23:
      ACCEPT_TOKEN(aux_sym_string_token1);
      if (lookahead == '/') ADVANCE(19);
      END_STATE();
    case 24:
      ACCEPT_TOKEN(aux_sym_string_token1);
      if (lookahead == '/') ADVANCE(23);
      if (lookahead == '\t' ||
          lookahead == '\r' ||
          lookahead == ' ') ADVANCE(24);
      if (lookahead != 0 &&
          lookahead != '\n' &&
          lookahead != '"' &&
          lookahead != '\\') ADVANCE(22);
      END_STATE();
    case 25:
      ACCEPT_TOKEN(anon_sym_DASH);
      END_STATE();
    case 26:
      ACCEPT_TOKEN(aux_sym_integer_token1);
      END_STATE();
    case 27:
      ACCEPT_TOKEN(aux_sym_integer_token1);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(27);
      END_STATE();
    case 28:
      ACCEPT_TOKEN(anon_sym_BSLASH_DQUOTE);
      END_STATE();
    case 29:
      ACCEPT_TOKEN(anon_sym_BSLASH_BSLASH);
      END_STATE();
    case 30:
      ACCEPT_TOKEN(anon_sym_BSLASHn);
      END_STATE();
    case 31:
      ACCEPT_TOKEN(anon_sym_BSLASHr);
      END_STATE();
    case 32:
      ACCEPT_TOKEN(sym_identifier);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(32);
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
      if (lookahead == 'B') ADVANCE(1);
      if (lookahead == 'D') ADVANCE(2);
      if (lookahead == 'F') ADVANCE(3);
      if (lookahead == 'I') ADVANCE(4);
      if (lookahead == 'J') ADVANCE(5);
      if (lookahead == 'M') ADVANCE(6);
      if (lookahead == 'S') ADVANCE(7);
      if (lookahead == 'd') ADVANCE(8);
      if (lookahead == 'e') ADVANCE(9);
      if (lookahead == 'f') ADVANCE(10);
      if (lookahead == 'g') ADVANCE(11);
      if (lookahead == 'm') ADVANCE(12);
      if (lookahead == 't') ADVANCE(13);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') SKIP(0)
      END_STATE();
    case 1:
      if (lookahead == 'i') ADVANCE(14);
      if (lookahead == 'o') ADVANCE(15);
      if (lookahead == 'y') ADVANCE(16);
      END_STATE();
    case 2:
      if (lookahead == 'a') ADVANCE(17);
      if (lookahead == 'e') ADVANCE(18);
      END_STATE();
    case 3:
      if (lookahead == 'l') ADVANCE(19);
      END_STATE();
    case 4:
      if (lookahead == 'n') ADVANCE(20);
      END_STATE();
    case 5:
      if (lookahead == 's') ADVANCE(21);
      END_STATE();
    case 6:
      if (lookahead == 'a') ADVANCE(22);
      END_STATE();
    case 7:
      if (lookahead == 't') ADVANCE(23);
      END_STATE();
    case 8:
      if (lookahead == 'a') ADVANCE(24);
      END_STATE();
    case 9:
      if (lookahead == 'n') ADVANCE(25);
      END_STATE();
    case 10:
      if (lookahead == 'a') ADVANCE(26);
      END_STATE();
    case 11:
      if (lookahead == 'e') ADVANCE(27);
      END_STATE();
    case 12:
      if (lookahead == 'o') ADVANCE(28);
      END_STATE();
    case 13:
      if (lookahead == 'r') ADVANCE(29);
      END_STATE();
    case 14:
      if (lookahead == 'g') ADVANCE(30);
      END_STATE();
    case 15:
      if (lookahead == 'o') ADVANCE(31);
      END_STATE();
    case 16:
      if (lookahead == 't') ADVANCE(32);
      END_STATE();
    case 17:
      if (lookahead == 't') ADVANCE(33);
      END_STATE();
    case 18:
      if (lookahead == 'c') ADVANCE(34);
      END_STATE();
    case 19:
      if (lookahead == 'o') ADVANCE(35);
      END_STATE();
    case 20:
      if (lookahead == 't') ADVANCE(36);
      END_STATE();
    case 21:
      if (lookahead == 'o') ADVANCE(37);
      END_STATE();
    case 22:
      if (lookahead == 'x') ADVANCE(38);
      END_STATE();
    case 23:
      if (lookahead == 'r') ADVANCE(39);
      END_STATE();
    case 24:
      if (lookahead == 't') ADVANCE(40);
      END_STATE();
    case 25:
      if (lookahead == 'u') ADVANCE(41);
      END_STATE();
    case 26:
      if (lookahead == 'l') ADVANCE(42);
      END_STATE();
    case 27:
      if (lookahead == 'n') ADVANCE(43);
      END_STATE();
    case 28:
      if (lookahead == 'd') ADVANCE(44);
      END_STATE();
    case 29:
      if (lookahead == 'u') ADVANCE(45);
      END_STATE();
    case 30:
      if (lookahead == 'I') ADVANCE(46);
      END_STATE();
    case 31:
      if (lookahead == 'l') ADVANCE(47);
      END_STATE();
    case 32:
      if (lookahead == 'e') ADVANCE(48);
      END_STATE();
    case 33:
      if (lookahead == 'e') ADVANCE(49);
      END_STATE();
    case 34:
      if (lookahead == 'i') ADVANCE(50);
      END_STATE();
    case 35:
      if (lookahead == 'a') ADVANCE(51);
      END_STATE();
    case 36:
      ACCEPT_TOKEN(anon_sym_Int);
      END_STATE();
    case 37:
      if (lookahead == 'n') ADVANCE(52);
      END_STATE();
    case 38:
      ACCEPT_TOKEN(sym_special_constant);
      END_STATE();
    case 39:
      if (lookahead == 'i') ADVANCE(53);
      END_STATE();
    case 40:
      if (lookahead == 'a') ADVANCE(54);
      END_STATE();
    case 41:
      if (lookahead == 'm') ADVANCE(55);
      END_STATE();
    case 42:
      if (lookahead == 's') ADVANCE(56);
      END_STATE();
    case 43:
      if (lookahead == 'e') ADVANCE(57);
      END_STATE();
    case 44:
      if (lookahead == 'e') ADVANCE(58);
      END_STATE();
    case 45:
      if (lookahead == 'e') ADVANCE(59);
      END_STATE();
    case 46:
      if (lookahead == 'n') ADVANCE(60);
      END_STATE();
    case 47:
      if (lookahead == 'e') ADVANCE(61);
      END_STATE();
    case 48:
      if (lookahead == 's') ADVANCE(62);
      END_STATE();
    case 49:
      if (lookahead == 'T') ADVANCE(63);
      END_STATE();
    case 50:
      if (lookahead == 'm') ADVANCE(64);
      END_STATE();
    case 51:
      if (lookahead == 't') ADVANCE(65);
      END_STATE();
    case 52:
      ACCEPT_TOKEN(anon_sym_Json);
      END_STATE();
    case 53:
      if (lookahead == 'n') ADVANCE(66);
      END_STATE();
    case 54:
      if (lookahead == 's') ADVANCE(67);
      END_STATE();
    case 55:
      ACCEPT_TOKEN(anon_sym_enum);
      END_STATE();
    case 56:
      if (lookahead == 'e') ADVANCE(68);
      END_STATE();
    case 57:
      if (lookahead == 'r') ADVANCE(69);
      END_STATE();
    case 58:
      if (lookahead == 'l') ADVANCE(70);
      END_STATE();
    case 59:
      ACCEPT_TOKEN(anon_sym_true);
      END_STATE();
    case 60:
      if (lookahead == 't') ADVANCE(71);
      END_STATE();
    case 61:
      if (lookahead == 'a') ADVANCE(72);
      END_STATE();
    case 62:
      ACCEPT_TOKEN(anon_sym_Bytes);
      END_STATE();
    case 63:
      if (lookahead == 'i') ADVANCE(73);
      END_STATE();
    case 64:
      if (lookahead == 'a') ADVANCE(74);
      END_STATE();
    case 65:
      ACCEPT_TOKEN(anon_sym_Float);
      END_STATE();
    case 66:
      if (lookahead == 'g') ADVANCE(75);
      END_STATE();
    case 67:
      if (lookahead == 'o') ADVANCE(76);
      END_STATE();
    case 68:
      ACCEPT_TOKEN(anon_sym_false);
      END_STATE();
    case 69:
      if (lookahead == 'a') ADVANCE(77);
      END_STATE();
    case 70:
      ACCEPT_TOKEN(anon_sym_model);
      END_STATE();
    case 71:
      ACCEPT_TOKEN(anon_sym_BigInt);
      END_STATE();
    case 72:
      if (lookahead == 'n') ADVANCE(78);
      END_STATE();
    case 73:
      if (lookahead == 'm') ADVANCE(79);
      END_STATE();
    case 74:
      if (lookahead == 'l') ADVANCE(80);
      END_STATE();
    case 75:
      ACCEPT_TOKEN(anon_sym_String);
      END_STATE();
    case 76:
      if (lookahead == 'u') ADVANCE(81);
      END_STATE();
    case 77:
      if (lookahead == 't') ADVANCE(82);
      END_STATE();
    case 78:
      ACCEPT_TOKEN(anon_sym_Boolean);
      END_STATE();
    case 79:
      if (lookahead == 'e') ADVANCE(83);
      END_STATE();
    case 80:
      ACCEPT_TOKEN(anon_sym_Decimal);
      END_STATE();
    case 81:
      if (lookahead == 'r') ADVANCE(84);
      END_STATE();
    case 82:
      if (lookahead == 'o') ADVANCE(85);
      END_STATE();
    case 83:
      ACCEPT_TOKEN(anon_sym_DateTime);
      END_STATE();
    case 84:
      if (lookahead == 'c') ADVANCE(86);
      END_STATE();
    case 85:
      if (lookahead == 'r') ADVANCE(87);
      END_STATE();
    case 86:
      if (lookahead == 'e') ADVANCE(88);
      END_STATE();
    case 87:
      ACCEPT_TOKEN(anon_sym_generator);
      END_STATE();
    case 88:
      ACCEPT_TOKEN(anon_sym_datasource);
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
  [13] = {.lex_state = 1},
  [14] = {.lex_state = 1},
  [15] = {.lex_state = 1},
  [16] = {.lex_state = 0},
  [17] = {.lex_state = 0},
  [18] = {.lex_state = 0},
  [19] = {.lex_state = 0},
  [20] = {.lex_state = 1},
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
  [53] = {.lex_state = 0},
  [54] = {.lex_state = 0},
  [55] = {.lex_state = 0},
  [56] = {.lex_state = 0},
  [57] = {.lex_state = 0},
  [58] = {.lex_state = 0},
  [59] = {.lex_state = 0},
  [60] = {.lex_state = 0},
  [61] = {.lex_state = 0},
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
  [72] = {.lex_state = 0},
  [73] = {.lex_state = 0},
  [74] = {.lex_state = 0},
  [75] = {.lex_state = 0},
  [76] = {.lex_state = 0},
  [77] = {.lex_state = 0},
  [78] = {.lex_state = 0},
  [79] = {.lex_state = 0},
  [80] = {.lex_state = 0},
  [81] = {.lex_state = 0},
  [82] = {.lex_state = 0},
  [83] = {.lex_state = 0},
  [84] = {.lex_state = 0},
  [85] = {.lex_state = 0},
  [86] = {.lex_state = 0},
  [87] = {.lex_state = 0},
  [88] = {.lex_state = 0},
  [89] = {.lex_state = 0},
  [90] = {.lex_state = 0},
  [91] = {.lex_state = 0},
  [92] = {.lex_state = 0},
  [93] = {.lex_state = 0},
  [94] = {.lex_state = 0},
  [95] = {.lex_state = 0},
  [96] = {.lex_state = 0},
  [97] = {.lex_state = 0},
  [98] = {.lex_state = 0},
  [99] = {.lex_state = 0},
  [100] = {.lex_state = 0},
};

static const uint16_t ts_parse_table[LARGE_STATE_COUNT][SYMBOL_COUNT] = {
  [0] = {
    [ts_builtin_sym_end] = ACTIONS(1),
    [sym_identifier] = ACTIONS(1),
    [anon_sym_datasource] = ACTIONS(1),
    [anon_sym_generator] = ACTIONS(1),
    [anon_sym_LBRACE] = ACTIONS(1),
    [anon_sym_RBRACE] = ACTIONS(1),
    [anon_sym_EQ] = ACTIONS(1),
    [anon_sym_model] = ACTIONS(1),
    [anon_sym_enum] = ACTIONS(1),
    [anon_sym_AT] = ACTIONS(1),
    [anon_sym_AT_AT] = ACTIONS(1),
    [anon_sym_LPAREN] = ACTIONS(1),
    [anon_sym_RPAREN] = ACTIONS(1),
    [anon_sym_DOT] = ACTIONS(1),
    [anon_sym_COMMA] = ACTIONS(1),
    [anon_sym_COLON] = ACTIONS(1),
    [anon_sym_QMARK] = ACTIONS(1),
    [anon_sym_LBRACK] = ACTIONS(1),
    [anon_sym_RBRACK] = ACTIONS(1),
    [anon_sym_String] = ACTIONS(1),
    [anon_sym_Boolean] = ACTIONS(1),
    [anon_sym_Int] = ACTIONS(1),
    [anon_sym_DateTime] = ACTIONS(1),
    [anon_sym_BigInt] = ACTIONS(1),
    [anon_sym_Decimal] = ACTIONS(1),
    [anon_sym_Float] = ACTIONS(1),
    [anon_sym_Json] = ACTIONS(1),
    [anon_sym_Bytes] = ACTIONS(1),
    [sym_document_comment] = ACTIONS(3),
    [sym_comment] = ACTIONS(5),
    [anon_sym_DQUOTE] = ACTIONS(1),
    [anon_sym_DASH] = ACTIONS(1),
    [aux_sym_integer_token1] = ACTIONS(1),
    [anon_sym_true] = ACTIONS(1),
    [anon_sym_false] = ACTIONS(1),
    [anon_sym_BSLASH_DQUOTE] = ACTIONS(1),
    [anon_sym_BSLASH_BSLASH] = ACTIONS(1),
    [anon_sym_BSLASHn] = ACTIONS(1),
    [anon_sym_BSLASHr] = ACTIONS(1),
    [sym_special_constant] = ACTIONS(1),
  },
  [1] = {
    [sym_source_file] = STATE(97),
    [sym__block] = STATE(12),
    [sym_key_value_block] = STATE(12),
    [sym_model_block] = STATE(12),
    [sym_enum_block] = STATE(12),
    [aux_sym_source_file_repeat1] = STATE(12),
    [anon_sym_datasource] = ACTIONS(7),
    [anon_sym_generator] = ACTIONS(7),
    [anon_sym_model] = ACTIONS(9),
    [anon_sym_enum] = ACTIONS(11),
    [sym_document_comment] = ACTIONS(3),
    [sym_comment] = ACTIONS(5),
  },
};

static const uint16_t ts_small_parse_table[] = {
  [0] = 17,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(13), 1,
      sym_identifier,
    ACTIONS(15), 1,
      anon_sym_RPAREN,
    ACTIONS(17), 1,
      anon_sym_LBRACK,
    ACTIONS(19), 1,
      anon_sym_DQUOTE,
    ACTIONS(21), 1,
      anon_sym_DASH,
    ACTIONS(23), 1,
      aux_sym_integer_token1,
    ACTIONS(27), 1,
      sym_special_constant,
    STATE(43), 1,
      sym__array,
    STATE(66), 1,
      sym__model_attribute_arg,
    STATE(70), 1,
      sym__model_attribute_arg_labeled,
    STATE(71), 1,
      sym__field_array,
    STATE(77), 1,
      sym__model_attribute_arg_no_label,
    STATE(96), 1,
      sym__model_attribute_arg_separated,
    ACTIONS(25), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(73), 5,
      sym__expression,
      sym_string,
      sym_integer,
      sym_boolean,
      sym_apply_function,
  [57] = 15,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(13), 1,
      sym_identifier,
    ACTIONS(17), 1,
      anon_sym_LBRACK,
    ACTIONS(19), 1,
      anon_sym_DQUOTE,
    ACTIONS(21), 1,
      anon_sym_DASH,
    ACTIONS(23), 1,
      aux_sym_integer_token1,
    ACTIONS(27), 1,
      sym_special_constant,
    STATE(43), 1,
      sym__array,
    STATE(70), 1,
      sym__model_attribute_arg_labeled,
    STATE(71), 1,
      sym__field_array,
    STATE(76), 1,
      sym__model_attribute_arg,
    STATE(77), 1,
      sym__model_attribute_arg_no_label,
    ACTIONS(25), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(73), 5,
      sym__expression,
      sym_string,
      sym_integer,
      sym_boolean,
      sym_apply_function,
  [108] = 14,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(19), 1,
      anon_sym_DQUOTE,
    ACTIONS(21), 1,
      anon_sym_DASH,
    ACTIONS(23), 1,
      aux_sym_integer_token1,
    ACTIONS(29), 1,
      sym_identifier,
    ACTIONS(31), 1,
      anon_sym_LBRACK,
    ACTIONS(33), 1,
      anon_sym_RBRACK,
    ACTIONS(35), 1,
      sym_special_constant,
    STATE(43), 1,
      sym__array,
    STATE(89), 1,
      sym__expression_separated,
    STATE(91), 1,
      sym__identifier_separated,
    ACTIONS(25), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(53), 5,
      sym__expression,
      sym_string,
      sym_integer,
      sym_boolean,
      sym_apply_function,
  [156] = 13,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(17), 1,
      anon_sym_LBRACK,
    ACTIONS(19), 1,
      anon_sym_DQUOTE,
    ACTIONS(21), 1,
      anon_sym_DASH,
    ACTIONS(23), 1,
      aux_sym_integer_token1,
    ACTIONS(27), 1,
      sym_special_constant,
    ACTIONS(37), 1,
      sym_identifier,
    STATE(43), 1,
      sym__array,
    STATE(71), 1,
      sym__field_array,
    STATE(78), 1,
      sym__model_attribute_arg_no_label,
    ACTIONS(25), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(73), 5,
      sym__expression,
      sym_string,
      sym_integer,
      sym_boolean,
      sym_apply_function,
  [201] = 13,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(19), 1,
      anon_sym_DQUOTE,
    ACTIONS(21), 1,
      anon_sym_DASH,
    ACTIONS(23), 1,
      aux_sym_integer_token1,
    ACTIONS(31), 1,
      anon_sym_LBRACK,
    ACTIONS(35), 1,
      sym_special_constant,
    ACTIONS(39), 1,
      sym_identifier,
    ACTIONS(41), 1,
      anon_sym_RBRACK,
    STATE(43), 1,
      sym__array,
    STATE(89), 1,
      sym__expression_separated,
    ACTIONS(25), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(53), 5,
      sym__expression,
      sym_string,
      sym_integer,
      sym_boolean,
      sym_apply_function,
  [246] = 13,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(19), 1,
      anon_sym_DQUOTE,
    ACTIONS(21), 1,
      anon_sym_DASH,
    ACTIONS(23), 1,
      aux_sym_integer_token1,
    ACTIONS(31), 1,
      anon_sym_LBRACK,
    ACTIONS(35), 1,
      sym_special_constant,
    ACTIONS(39), 1,
      sym_identifier,
    ACTIONS(43), 1,
      anon_sym_RPAREN,
    STATE(43), 1,
      sym__array,
    STATE(94), 1,
      sym__expression_separated,
    ACTIONS(25), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(53), 5,
      sym__expression,
      sym_string,
      sym_integer,
      sym_boolean,
      sym_apply_function,
  [291] = 12,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(19), 1,
      anon_sym_DQUOTE,
    ACTIONS(21), 1,
      anon_sym_DASH,
    ACTIONS(23), 1,
      aux_sym_integer_token1,
    ACTIONS(31), 1,
      anon_sym_LBRACK,
    ACTIONS(39), 1,
      sym_identifier,
    ACTIONS(45), 1,
      sym_special_constant,
    STATE(43), 1,
      sym__array,
    STATE(72), 1,
      sym_value,
    ACTIONS(25), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(75), 5,
      sym__expression,
      sym_string,
      sym_integer,
      sym_boolean,
      sym_apply_function,
  [333] = 8,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(47), 1,
      sym_identifier,
    STATE(27), 1,
      sym_prisma_type,
    STATE(28), 1,
      sym_field_type,
    STATE(30), 1,
      sym_non_null_type,
    STATE(52), 2,
      sym_nullable_type,
      sym_array_type,
    ACTIONS(49), 9,
      anon_sym_String,
      anon_sym_Boolean,
      anon_sym_Int,
      anon_sym_DateTime,
      anon_sym_BigInt,
      anon_sym_Decimal,
      anon_sym_Float,
      anon_sym_Json,
      anon_sym_Bytes,
  [367] = 11,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(19), 1,
      anon_sym_DQUOTE,
    ACTIONS(21), 1,
      anon_sym_DASH,
    ACTIONS(23), 1,
      aux_sym_integer_token1,
    ACTIONS(31), 1,
      anon_sym_LBRACK,
    ACTIONS(39), 1,
      sym_identifier,
    ACTIONS(51), 1,
      sym_special_constant,
    STATE(43), 1,
      sym__array,
    ACTIONS(25), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(69), 5,
      sym__expression,
      sym_string,
      sym_integer,
      sym_boolean,
      sym_apply_function,
  [406] = 7,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(53), 1,
      ts_builtin_sym_end,
    ACTIONS(58), 1,
      anon_sym_model,
    ACTIONS(61), 1,
      anon_sym_enum,
    ACTIONS(55), 2,
      anon_sym_datasource,
      anon_sym_generator,
    STATE(11), 5,
      sym__block,
      sym_key_value_block,
      sym_model_block,
      sym_enum_block,
      aux_sym_source_file_repeat1,
  [433] = 7,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(9), 1,
      anon_sym_model,
    ACTIONS(11), 1,
      anon_sym_enum,
    ACTIONS(64), 1,
      ts_builtin_sym_end,
    ACTIONS(7), 2,
      anon_sym_datasource,
      anon_sym_generator,
    STATE(11), 5,
      sym__block,
      sym_key_value_block,
      sym_model_block,
      sym_enum_block,
      aux_sym_source_file_repeat1,
  [460] = 5,
    ACTIONS(66), 1,
      anon_sym_DQUOTE,
    ACTIONS(68), 1,
      aux_sym_string_token1,
    ACTIONS(5), 2,
      sym_document_comment,
      sym_comment,
    STATE(13), 2,
      sym_string_char_escape,
      aux_sym_string_repeat1,
    ACTIONS(71), 4,
      anon_sym_BSLASH_DQUOTE,
      anon_sym_BSLASH_BSLASH,
      anon_sym_BSLASHn,
      anon_sym_BSLASHr,
  [481] = 5,
    ACTIONS(74), 1,
      anon_sym_DQUOTE,
    ACTIONS(76), 1,
      aux_sym_string_token1,
    ACTIONS(5), 2,
      sym_document_comment,
      sym_comment,
    STATE(13), 2,
      sym_string_char_escape,
      aux_sym_string_repeat1,
    ACTIONS(78), 4,
      anon_sym_BSLASH_DQUOTE,
      anon_sym_BSLASH_BSLASH,
      anon_sym_BSLASHn,
      anon_sym_BSLASHr,
  [502] = 5,
    ACTIONS(80), 1,
      anon_sym_DQUOTE,
    ACTIONS(82), 1,
      aux_sym_string_token1,
    ACTIONS(5), 2,
      sym_document_comment,
      sym_comment,
    STATE(14), 2,
      sym_string_char_escape,
      aux_sym_string_repeat1,
    ACTIONS(78), 4,
      anon_sym_BSLASH_DQUOTE,
      anon_sym_BSLASH_BSLASH,
      anon_sym_BSLASHn,
      anon_sym_BSLASHr,
  [523] = 6,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(86), 1,
      anon_sym_AT,
    ACTIONS(88), 1,
      anon_sym_DOT,
    STATE(16), 1,
      aux_sym_attribute_specifier_repeat1,
    ACTIONS(84), 4,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      anon_sym_LPAREN,
      sym_identifier,
  [545] = 6,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(93), 1,
      anon_sym_AT,
    ACTIONS(95), 1,
      anon_sym_DOT,
    STATE(16), 1,
      aux_sym_attribute_specifier_repeat1,
    ACTIONS(91), 4,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      anon_sym_LPAREN,
      sym_identifier,
  [567] = 6,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(95), 1,
      anon_sym_DOT,
    ACTIONS(99), 1,
      anon_sym_AT,
    STATE(17), 1,
      aux_sym_attribute_specifier_repeat1,
    ACTIONS(97), 4,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      anon_sym_LPAREN,
      sym_identifier,
  [589] = 4,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(86), 1,
      anon_sym_AT,
    ACTIONS(84), 5,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      anon_sym_LPAREN,
      anon_sym_DOT,
      sym_identifier,
  [606] = 2,
    ACTIONS(5), 2,
      sym_document_comment,
      sym_comment,
    ACTIONS(101), 6,
      anon_sym_DQUOTE,
      aux_sym_string_token1,
      anon_sym_BSLASH_DQUOTE,
      anon_sym_BSLASH_BSLASH,
      anon_sym_BSLASHn,
      anon_sym_BSLASHr,
  [619] = 5,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(105), 1,
      anon_sym_AT,
    STATE(24), 2,
      sym_model_single_attribute,
      aux_sym_model_field_repeat1,
    ACTIONS(103), 3,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      sym_identifier,
  [638] = 6,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(109), 1,
      anon_sym_AT,
    ACTIONS(111), 1,
      anon_sym_LPAREN,
    STATE(54), 1,
      sym__model_attribute_args,
    ACTIONS(107), 3,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      sym_identifier,
  [659] = 6,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(113), 1,
      sym_identifier,
    ACTIONS(115), 1,
      anon_sym_RBRACE,
    ACTIONS(117), 1,
      anon_sym_AT_AT,
    STATE(25), 3,
      aux_sym__model_block_content,
      sym_model_field,
      sym_model_multi_attribute,
  [680] = 5,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(121), 1,
      anon_sym_AT,
    STATE(24), 2,
      sym_model_single_attribute,
      aux_sym_model_field_repeat1,
    ACTIONS(119), 3,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      sym_identifier,
  [699] = 6,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(124), 1,
      sym_identifier,
    ACTIONS(127), 1,
      anon_sym_RBRACE,
    ACTIONS(129), 1,
      anon_sym_AT_AT,
    STATE(25), 3,
      aux_sym__model_block_content,
      sym_model_field,
      sym_model_multi_attribute,
  [720] = 4,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(134), 1,
      anon_sym_AT,
    ACTIONS(132), 5,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      anon_sym_QMARK,
      anon_sym_LBRACK,
      sym_identifier,
  [737] = 4,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(138), 1,
      anon_sym_AT,
    ACTIONS(136), 5,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      anon_sym_QMARK,
      anon_sym_LBRACK,
      sym_identifier,
  [754] = 5,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(105), 1,
      anon_sym_AT,
    STATE(21), 2,
      sym_model_single_attribute,
      aux_sym_model_field_repeat1,
    ACTIONS(140), 3,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      sym_identifier,
  [773] = 4,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(144), 1,
      anon_sym_LPAREN,
    ACTIONS(142), 5,
      anon_sym_RBRACE,
      anon_sym_RPAREN,
      anon_sym_COMMA,
      anon_sym_RBRACK,
      sym_identifier,
  [790] = 6,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(148), 1,
      anon_sym_AT,
    ACTIONS(150), 1,
      anon_sym_QMARK,
    ACTIONS(152), 1,
      anon_sym_LBRACK,
    ACTIONS(146), 3,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      sym_identifier,
  [811] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(154), 5,
      anon_sym_RBRACE,
      anon_sym_RPAREN,
      anon_sym_COMMA,
      anon_sym_RBRACK,
      sym_identifier,
  [825] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(156), 5,
      anon_sym_RBRACE,
      anon_sym_RPAREN,
      anon_sym_COMMA,
      anon_sym_RBRACK,
      sym_identifier,
  [839] = 5,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(111), 1,
      anon_sym_LPAREN,
    STATE(62), 1,
      sym__model_attribute_args,
    ACTIONS(158), 3,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      sym_identifier,
  [857] = 6,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(160), 1,
      sym_identifier,
    ACTIONS(163), 1,
      anon_sym_RBRACE,
    STATE(87), 1,
      sym_key,
    STATE(34), 2,
      aux_sym__key_value_block_content,
      sym_key_value,
  [877] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(165), 5,
      ts_builtin_sym_end,
      anon_sym_datasource,
      anon_sym_generator,
      anon_sym_model,
      anon_sym_enum,
  [891] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(167), 5,
      ts_builtin_sym_end,
      anon_sym_datasource,
      anon_sym_generator,
      anon_sym_model,
      anon_sym_enum,
  [905] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(169), 5,
      anon_sym_RBRACE,
      anon_sym_RPAREN,
      anon_sym_COMMA,
      anon_sym_RBRACK,
      sym_identifier,
  [919] = 5,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(113), 1,
      sym_identifier,
    ACTIONS(117), 1,
      anon_sym_AT_AT,
    STATE(23), 3,
      aux_sym__model_block_content,
      sym_model_field,
      sym_model_multi_attribute,
  [937] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(171), 5,
      anon_sym_RBRACE,
      anon_sym_RPAREN,
      anon_sym_COMMA,
      anon_sym_RBRACK,
      sym_identifier,
  [951] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(173), 5,
      anon_sym_RBRACE,
      anon_sym_RPAREN,
      anon_sym_COMMA,
      anon_sym_RBRACK,
      sym_identifier,
  [965] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(175), 5,
      anon_sym_RBRACE,
      anon_sym_RPAREN,
      anon_sym_COMMA,
      anon_sym_RBRACK,
      sym_identifier,
  [979] = 6,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(177), 1,
      sym_identifier,
    ACTIONS(179), 1,
      anon_sym_RBRACE,
    STATE(87), 1,
      sym_key,
    STATE(34), 2,
      aux_sym__key_value_block_content,
      sym_key_value,
  [999] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(181), 5,
      anon_sym_RBRACE,
      anon_sym_RPAREN,
      anon_sym_COMMA,
      anon_sym_RBRACK,
      sym_identifier,
  [1013] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(183), 5,
      anon_sym_RBRACE,
      anon_sym_RPAREN,
      anon_sym_COMMA,
      anon_sym_RBRACK,
      sym_identifier,
  [1027] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(185), 5,
      anon_sym_RBRACE,
      anon_sym_RPAREN,
      anon_sym_COMMA,
      anon_sym_RBRACK,
      sym_identifier,
  [1041] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(187), 5,
      ts_builtin_sym_end,
      anon_sym_datasource,
      anon_sym_generator,
      anon_sym_model,
      anon_sym_enum,
  [1055] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(189), 5,
      anon_sym_RBRACE,
      anon_sym_RPAREN,
      anon_sym_COMMA,
      anon_sym_RBRACK,
      sym_identifier,
  [1069] = 4,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(193), 1,
      anon_sym_AT,
    ACTIONS(191), 3,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      sym_identifier,
  [1084] = 5,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(144), 1,
      anon_sym_LPAREN,
    ACTIONS(198), 1,
      anon_sym_COLON,
    ACTIONS(195), 2,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [1101] = 4,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(202), 1,
      anon_sym_AT,
    ACTIONS(200), 3,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      sym_identifier,
  [1116] = 5,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(177), 1,
      sym_identifier,
    STATE(87), 1,
      sym_key,
    STATE(42), 2,
      aux_sym__key_value_block_content,
      sym_key_value,
  [1133] = 4,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(148), 1,
      anon_sym_AT,
    ACTIONS(146), 3,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      sym_identifier,
  [1148] = 5,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(206), 1,
      anon_sym_COMMA,
    STATE(56), 1,
      aux_sym__expression_separated_repeat1,
    ACTIONS(204), 2,
      anon_sym_RPAREN,
      anon_sym_RBRACK,
  [1165] = 4,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(210), 1,
      anon_sym_AT,
    ACTIONS(208), 3,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      sym_identifier,
  [1180] = 5,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(214), 1,
      anon_sym_COMMA,
    STATE(55), 1,
      aux_sym__expression_separated_repeat1,
    ACTIONS(212), 2,
      anon_sym_RPAREN,
      anon_sym_RBRACK,
  [1197] = 5,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(206), 1,
      anon_sym_COMMA,
    STATE(55), 1,
      aux_sym__expression_separated_repeat1,
    ACTIONS(217), 2,
      anon_sym_RPAREN,
      anon_sym_RBRACK,
  [1214] = 4,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(221), 1,
      anon_sym_AT,
    ACTIONS(219), 3,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      sym_identifier,
  [1229] = 4,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(225), 1,
      anon_sym_AT,
    ACTIONS(223), 3,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      sym_identifier,
  [1244] = 6,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(144), 1,
      anon_sym_LPAREN,
    ACTIONS(227), 1,
      anon_sym_COMMA,
    ACTIONS(230), 1,
      anon_sym_RBRACK,
    STATE(60), 1,
      aux_sym__identifier_separated_repeat1,
  [1263] = 5,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(233), 1,
      anon_sym_COMMA,
    ACTIONS(235), 1,
      anon_sym_RBRACK,
    STATE(65), 1,
      aux_sym__identifier_separated_repeat1,
  [1279] = 4,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(144), 1,
      anon_sym_LPAREN,
    ACTIONS(195), 2,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [1293] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(237), 3,
      anon_sym_RBRACE,
      anon_sym_AT_AT,
      sym_identifier,
  [1305] = 5,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(239), 1,
      anon_sym_RPAREN,
    ACTIONS(241), 1,
      anon_sym_COMMA,
    STATE(63), 1,
      aux_sym__model_attribute_arg_separated_repeat1,
  [1321] = 5,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(244), 1,
      sym_identifier,
    ACTIONS(246), 1,
      anon_sym_RBRACE,
    STATE(67), 1,
      aux_sym__enum_block_content,
  [1337] = 5,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(248), 1,
      anon_sym_COMMA,
    ACTIONS(251), 1,
      anon_sym_RBRACK,
    STATE(65), 1,
      aux_sym__identifier_separated_repeat1,
  [1353] = 5,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(253), 1,
      anon_sym_RPAREN,
    ACTIONS(255), 1,
      anon_sym_COMMA,
    STATE(68), 1,
      aux_sym__model_attribute_arg_separated_repeat1,
  [1369] = 5,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(257), 1,
      sym_identifier,
    ACTIONS(260), 1,
      anon_sym_RBRACE,
    STATE(67), 1,
      aux_sym__enum_block_content,
  [1385] = 5,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(255), 1,
      anon_sym_COMMA,
    ACTIONS(262), 1,
      anon_sym_RPAREN,
    STATE(63), 1,
      aux_sym__model_attribute_arg_separated_repeat1,
  [1401] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(264), 3,
      anon_sym_RPAREN,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [1413] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(266), 2,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [1424] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(268), 2,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [1435] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(270), 2,
      anon_sym_RBRACE,
      sym_identifier,
  [1446] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(272), 2,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [1457] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(251), 2,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [1468] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(274), 2,
      anon_sym_RBRACE,
      sym_identifier,
  [1479] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(276), 2,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [1490] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(278), 2,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [1501] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(280), 2,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [1512] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(282), 2,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [1523] = 4,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(284), 1,
      sym_identifier,
    STATE(22), 1,
      sym_attribute_specifier,
  [1536] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(286), 2,
      anon_sym_RPAREN,
      anon_sym_COMMA,
  [1547] = 4,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(289), 1,
      sym_identifier,
    STATE(64), 1,
      aux_sym__enum_block_content,
  [1560] = 4,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(284), 1,
      sym_identifier,
    STATE(33), 1,
      sym_attribute_specifier,
  [1573] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(291), 1,
      anon_sym_EQ,
  [1583] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(293), 1,
      sym_identifier,
  [1593] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(295), 1,
      sym_identifier,
  [1603] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(297), 1,
      anon_sym_EQ,
  [1613] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(299), 1,
      anon_sym_LBRACE,
  [1623] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(301), 1,
      anon_sym_RBRACK,
  [1633] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(303), 1,
      anon_sym_RBRACK,
  [1643] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(305), 1,
      anon_sym_RBRACK,
  [1653] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(307), 1,
      sym_identifier,
  [1663] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(309), 1,
      sym_identifier,
  [1673] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(311), 1,
      anon_sym_RPAREN,
  [1683] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(313), 1,
      sym_identifier,
  [1693] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(315), 1,
      anon_sym_RPAREN,
  [1703] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(317), 1,
      ts_builtin_sym_end,
  [1713] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(319), 1,
      anon_sym_LBRACE,
  [1723] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(321), 1,
      aux_sym_integer_token1,
  [1733] = 3,
    ACTIONS(3), 1,
      sym_document_comment,
    ACTIONS(5), 1,
      sym_comment,
    ACTIONS(323), 1,
      anon_sym_LBRACE,
};

static const uint32_t ts_small_parse_table_map[] = {
  [SMALL_STATE(2)] = 0,
  [SMALL_STATE(3)] = 57,
  [SMALL_STATE(4)] = 108,
  [SMALL_STATE(5)] = 156,
  [SMALL_STATE(6)] = 201,
  [SMALL_STATE(7)] = 246,
  [SMALL_STATE(8)] = 291,
  [SMALL_STATE(9)] = 333,
  [SMALL_STATE(10)] = 367,
  [SMALL_STATE(11)] = 406,
  [SMALL_STATE(12)] = 433,
  [SMALL_STATE(13)] = 460,
  [SMALL_STATE(14)] = 481,
  [SMALL_STATE(15)] = 502,
  [SMALL_STATE(16)] = 523,
  [SMALL_STATE(17)] = 545,
  [SMALL_STATE(18)] = 567,
  [SMALL_STATE(19)] = 589,
  [SMALL_STATE(20)] = 606,
  [SMALL_STATE(21)] = 619,
  [SMALL_STATE(22)] = 638,
  [SMALL_STATE(23)] = 659,
  [SMALL_STATE(24)] = 680,
  [SMALL_STATE(25)] = 699,
  [SMALL_STATE(26)] = 720,
  [SMALL_STATE(27)] = 737,
  [SMALL_STATE(28)] = 754,
  [SMALL_STATE(29)] = 773,
  [SMALL_STATE(30)] = 790,
  [SMALL_STATE(31)] = 811,
  [SMALL_STATE(32)] = 825,
  [SMALL_STATE(33)] = 839,
  [SMALL_STATE(34)] = 857,
  [SMALL_STATE(35)] = 877,
  [SMALL_STATE(36)] = 891,
  [SMALL_STATE(37)] = 905,
  [SMALL_STATE(38)] = 919,
  [SMALL_STATE(39)] = 937,
  [SMALL_STATE(40)] = 951,
  [SMALL_STATE(41)] = 965,
  [SMALL_STATE(42)] = 979,
  [SMALL_STATE(43)] = 999,
  [SMALL_STATE(44)] = 1013,
  [SMALL_STATE(45)] = 1027,
  [SMALL_STATE(46)] = 1041,
  [SMALL_STATE(47)] = 1055,
  [SMALL_STATE(48)] = 1069,
  [SMALL_STATE(49)] = 1084,
  [SMALL_STATE(50)] = 1101,
  [SMALL_STATE(51)] = 1116,
  [SMALL_STATE(52)] = 1133,
  [SMALL_STATE(53)] = 1148,
  [SMALL_STATE(54)] = 1165,
  [SMALL_STATE(55)] = 1180,
  [SMALL_STATE(56)] = 1197,
  [SMALL_STATE(57)] = 1214,
  [SMALL_STATE(58)] = 1229,
  [SMALL_STATE(59)] = 1244,
  [SMALL_STATE(60)] = 1263,
  [SMALL_STATE(61)] = 1279,
  [SMALL_STATE(62)] = 1293,
  [SMALL_STATE(63)] = 1305,
  [SMALL_STATE(64)] = 1321,
  [SMALL_STATE(65)] = 1337,
  [SMALL_STATE(66)] = 1353,
  [SMALL_STATE(67)] = 1369,
  [SMALL_STATE(68)] = 1385,
  [SMALL_STATE(69)] = 1401,
  [SMALL_STATE(70)] = 1413,
  [SMALL_STATE(71)] = 1424,
  [SMALL_STATE(72)] = 1435,
  [SMALL_STATE(73)] = 1446,
  [SMALL_STATE(74)] = 1457,
  [SMALL_STATE(75)] = 1468,
  [SMALL_STATE(76)] = 1479,
  [SMALL_STATE(77)] = 1490,
  [SMALL_STATE(78)] = 1501,
  [SMALL_STATE(79)] = 1512,
  [SMALL_STATE(80)] = 1523,
  [SMALL_STATE(81)] = 1536,
  [SMALL_STATE(82)] = 1547,
  [SMALL_STATE(83)] = 1560,
  [SMALL_STATE(84)] = 1573,
  [SMALL_STATE(85)] = 1583,
  [SMALL_STATE(86)] = 1593,
  [SMALL_STATE(87)] = 1603,
  [SMALL_STATE(88)] = 1613,
  [SMALL_STATE(89)] = 1623,
  [SMALL_STATE(90)] = 1633,
  [SMALL_STATE(91)] = 1643,
  [SMALL_STATE(92)] = 1653,
  [SMALL_STATE(93)] = 1663,
  [SMALL_STATE(94)] = 1673,
  [SMALL_STATE(95)] = 1683,
  [SMALL_STATE(96)] = 1693,
  [SMALL_STATE(97)] = 1703,
  [SMALL_STATE(98)] = 1713,
  [SMALL_STATE(99)] = 1723,
  [SMALL_STATE(100)] = 1733,
};

static const TSParseActionEntry ts_parse_actions[] = {
  [0] = {.entry = {.count = 0, .reusable = false}},
  [1] = {.entry = {.count = 1, .reusable = false}}, RECOVER(),
  [3] = {.entry = {.count = 1, .reusable = true}}, SHIFT_EXTRA(),
  [5] = {.entry = {.count = 1, .reusable = false}}, SHIFT_EXTRA(),
  [7] = {.entry = {.count = 1, .reusable = true}}, SHIFT(93),
  [9] = {.entry = {.count = 1, .reusable = true}}, SHIFT(86),
  [11] = {.entry = {.count = 1, .reusable = true}}, SHIFT(85),
  [13] = {.entry = {.count = 1, .reusable = false}}, SHIFT(49),
  [15] = {.entry = {.count = 1, .reusable = true}}, SHIFT(58),
  [17] = {.entry = {.count = 1, .reusable = true}}, SHIFT(4),
  [19] = {.entry = {.count = 1, .reusable = true}}, SHIFT(15),
  [21] = {.entry = {.count = 1, .reusable = true}}, SHIFT(99),
  [23] = {.entry = {.count = 1, .reusable = true}}, SHIFT(39),
  [25] = {.entry = {.count = 1, .reusable = false}}, SHIFT(40),
  [27] = {.entry = {.count = 1, .reusable = false}}, SHIFT(73),
  [29] = {.entry = {.count = 1, .reusable = false}}, SHIFT(59),
  [31] = {.entry = {.count = 1, .reusable = true}}, SHIFT(6),
  [33] = {.entry = {.count = 1, .reusable = true}}, SHIFT(81),
  [35] = {.entry = {.count = 1, .reusable = false}}, SHIFT(53),
  [37] = {.entry = {.count = 1, .reusable = false}}, SHIFT(61),
  [39] = {.entry = {.count = 1, .reusable = false}}, SHIFT(29),
  [41] = {.entry = {.count = 1, .reusable = true}}, SHIFT(32),
  [43] = {.entry = {.count = 1, .reusable = true}}, SHIFT(41),
  [45] = {.entry = {.count = 1, .reusable = false}}, SHIFT(75),
  [47] = {.entry = {.count = 1, .reusable = false}}, SHIFT(27),
  [49] = {.entry = {.count = 1, .reusable = false}}, SHIFT(26),
  [51] = {.entry = {.count = 1, .reusable = false}}, SHIFT(69),
  [53] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2),
  [55] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2), SHIFT_REPEAT(93),
  [58] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2), SHIFT_REPEAT(86),
  [61] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2), SHIFT_REPEAT(85),
  [64] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 1),
  [66] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_string_repeat1, 2),
  [68] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_string_repeat1, 2), SHIFT_REPEAT(13),
  [71] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_string_repeat1, 2), SHIFT_REPEAT(20),
  [74] = {.entry = {.count = 1, .reusable = false}}, SHIFT(37),
  [76] = {.entry = {.count = 1, .reusable = false}}, SHIFT(13),
  [78] = {.entry = {.count = 1, .reusable = false}}, SHIFT(20),
  [80] = {.entry = {.count = 1, .reusable = false}}, SHIFT(47),
  [82] = {.entry = {.count = 1, .reusable = false}}, SHIFT(14),
  [84] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_attribute_specifier_repeat1, 2),
  [86] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_attribute_specifier_repeat1, 2),
  [88] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_attribute_specifier_repeat1, 2), SHIFT_REPEAT(95),
  [91] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_attribute_specifier, 2),
  [93] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_attribute_specifier, 2),
  [95] = {.entry = {.count = 1, .reusable = true}}, SHIFT(95),
  [97] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_attribute_specifier, 1),
  [99] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_attribute_specifier, 1),
  [101] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_string_char_escape, 1),
  [103] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_model_field, 3, .production_id = 1),
  [105] = {.entry = {.count = 1, .reusable = false}}, SHIFT(80),
  [107] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_model_single_attribute, 2),
  [109] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_model_single_attribute, 2),
  [111] = {.entry = {.count = 1, .reusable = true}}, SHIFT(2),
  [113] = {.entry = {.count = 1, .reusable = true}}, SHIFT(9),
  [115] = {.entry = {.count = 1, .reusable = true}}, SHIFT(35),
  [117] = {.entry = {.count = 1, .reusable = true}}, SHIFT(83),
  [119] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_model_field_repeat1, 2),
  [121] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_model_field_repeat1, 2), SHIFT_REPEAT(80),
  [124] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym__model_block_content, 2), SHIFT_REPEAT(9),
  [127] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym__model_block_content, 2),
  [129] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym__model_block_content, 2), SHIFT_REPEAT(83),
  [132] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_prisma_type, 1),
  [134] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_prisma_type, 1),
  [136] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_non_null_type, 1),
  [138] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_non_null_type, 1),
  [140] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_model_field, 2, .production_id = 1),
  [142] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__expression, 1, .production_id = 2),
  [144] = {.entry = {.count = 1, .reusable = true}}, SHIFT(7),
  [146] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_field_type, 1),
  [148] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_field_type, 1),
  [150] = {.entry = {.count = 1, .reusable = true}}, SHIFT(48),
  [152] = {.entry = {.count = 1, .reusable = true}}, SHIFT(90),
  [154] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__array, 3, .production_id = 10),
  [156] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__array, 2),
  [158] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_model_multi_attribute, 2),
  [160] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym__key_value_block_content, 2), SHIFT_REPEAT(84),
  [163] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym__key_value_block_content, 2),
  [165] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_model_block, 5),
  [167] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_enum_block, 5),
  [169] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_string, 3),
  [171] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_integer, 1),
  [173] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_boolean, 1),
  [175] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_apply_function, 3, .production_id = 11),
  [177] = {.entry = {.count = 1, .reusable = true}}, SHIFT(84),
  [179] = {.entry = {.count = 1, .reusable = true}}, SHIFT(46),
  [181] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__expression, 1, .production_id = 3),
  [183] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_integer, 2),
  [185] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_apply_function, 4, .production_id = 16),
  [187] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_key_value_block, 5),
  [189] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_string, 2),
  [191] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_nullable_type, 2),
  [193] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_nullable_type, 2),
  [195] = {.entry = {.count = 2, .reusable = true}}, REDUCE(sym__model_attribute_arg_no_label, 1), REDUCE(sym__expression, 1, .production_id = 2),
  [198] = {.entry = {.count = 1, .reusable = true}}, SHIFT(5),
  [200] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_array_type, 3),
  [202] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_array_type, 3),
  [204] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__expression_separated, 1, .production_id = 5),
  [206] = {.entry = {.count = 1, .reusable = true}}, SHIFT(10),
  [208] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_model_single_attribute, 3, .production_id = 4),
  [210] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_model_single_attribute, 3, .production_id = 4),
  [212] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym__expression_separated_repeat1, 2, .production_id = 15),
  [214] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym__expression_separated_repeat1, 2, .production_id = 15), SHIFT_REPEAT(10),
  [217] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__expression_separated, 2, .production_id = 9),
  [219] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__model_attribute_args, 3, .production_id = 12),
  [221] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym__model_attribute_args, 3, .production_id = 12),
  [223] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__model_attribute_args, 2),
  [225] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym__model_attribute_args, 2),
  [227] = {.entry = {.count = 2, .reusable = true}}, REDUCE(sym__expression, 1, .production_id = 2), SHIFT(92),
  [230] = {.entry = {.count = 2, .reusable = true}}, REDUCE(sym__identifier_separated, 1), REDUCE(sym__expression, 1, .production_id = 2),
  [233] = {.entry = {.count = 1, .reusable = true}}, SHIFT(92),
  [235] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__identifier_separated, 2),
  [237] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_model_multi_attribute, 3, .production_id = 4),
  [239] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym__model_attribute_arg_separated_repeat1, 2, .production_id = 13),
  [241] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym__model_attribute_arg_separated_repeat1, 2, .production_id = 13), SHIFT_REPEAT(3),
  [244] = {.entry = {.count = 1, .reusable = true}}, SHIFT(67),
  [246] = {.entry = {.count = 1, .reusable = true}}, SHIFT(36),
  [248] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym__identifier_separated_repeat1, 2), SHIFT_REPEAT(92),
  [251] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym__identifier_separated_repeat1, 2),
  [253] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__model_attribute_arg_separated, 1, .production_id = 6),
  [255] = {.entry = {.count = 1, .reusable = true}}, SHIFT(3),
  [257] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym__enum_block_content, 2), SHIFT_REPEAT(67),
  [260] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym__enum_block_content, 2),
  [262] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__model_attribute_arg_separated, 2, .production_id = 13),
  [264] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym__expression_separated_repeat1, 2, .production_id = 14),
  [266] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__model_attribute_arg, 1, .production_id = 6),
  [268] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__model_attribute_arg_no_label, 1, .production_id = 8),
  [270] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_key_value, 3),
  [272] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__model_attribute_arg_no_label, 1, .production_id = 3),
  [274] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_value, 1, .production_id = 3),
  [276] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym__model_attribute_arg_separated_repeat1, 2, .production_id = 12),
  [278] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__model_attribute_arg, 1, .production_id = 7),
  [280] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__model_attribute_arg_labeled, 3, .production_id = 18),
  [282] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__field_array, 3, .production_id = 17),
  [284] = {.entry = {.count = 1, .reusable = true}}, SHIFT(18),
  [286] = {.entry = {.count = 2, .reusable = true}}, REDUCE(sym__field_array, 2), REDUCE(sym__array, 2),
  [289] = {.entry = {.count = 1, .reusable = true}}, SHIFT(64),
  [291] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_key, 1),
  [293] = {.entry = {.count = 1, .reusable = true}}, SHIFT(88),
  [295] = {.entry = {.count = 1, .reusable = true}}, SHIFT(100),
  [297] = {.entry = {.count = 1, .reusable = true}}, SHIFT(8),
  [299] = {.entry = {.count = 1, .reusable = true}}, SHIFT(82),
  [301] = {.entry = {.count = 1, .reusable = true}}, SHIFT(31),
  [303] = {.entry = {.count = 1, .reusable = true}}, SHIFT(50),
  [305] = {.entry = {.count = 1, .reusable = true}}, SHIFT(79),
  [307] = {.entry = {.count = 1, .reusable = true}}, SHIFT(74),
  [309] = {.entry = {.count = 1, .reusable = true}}, SHIFT(98),
  [311] = {.entry = {.count = 1, .reusable = true}}, SHIFT(45),
  [313] = {.entry = {.count = 1, .reusable = true}}, SHIFT(19),
  [315] = {.entry = {.count = 1, .reusable = true}}, SHIFT(57),
  [317] = {.entry = {.count = 1, .reusable = true}},  ACCEPT_INPUT(),
  [319] = {.entry = {.count = 1, .reusable = true}}, SHIFT(51),
  [321] = {.entry = {.count = 1, .reusable = true}}, SHIFT(44),
  [323] = {.entry = {.count = 1, .reusable = true}}, SHIFT(38),
};

#ifdef __cplusplus
extern "C" {
#endif
#ifdef _WIN32
#define extern __declspec(dllexport)
#endif

extern const TSLanguage *tree_sitter_prisma(void) {
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

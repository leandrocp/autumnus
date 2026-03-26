#include "tree_sitter/parser.h"

#if defined(__GNUC__) || defined(__clang__)
#pragma GCC diagnostic ignored "-Wmissing-field-initializers"
#endif

#ifdef _MSC_VER
#pragma optimize("", off)
#elif defined(__clang__)
#pragma clang optimize off
#elif defined(__GNUC__)
#pragma GCC optimize ("O0")
#endif

#define LANGUAGE_VERSION 14
#define STATE_COUNT 600
#define LARGE_STATE_COUNT 19
#define SYMBOL_COUNT 372
#define ALIAS_COUNT 1
#define TOKEN_COUNT 199
#define EXTERNAL_TOKEN_COUNT 0
#define FIELD_COUNT 6
#define MAX_ALIAS_SEQUENCE_LENGTH 6
#define PRODUCTION_ID_COUNT 8

enum ts_symbol_identifiers {
  anon_sym_LF = 1,
  anon_sym_GET = 2,
  anon_sym_HEAD = 3,
  anon_sym_POST = 4,
  anon_sym_PUT = 5,
  anon_sym_DELETE = 6,
  anon_sym_CONNECT = 7,
  anon_sym_OPTIONS = 8,
  anon_sym_TRACE = 9,
  anon_sym_PATCH = 10,
  anon_sym_LINK = 11,
  anon_sym_UNLINK = 12,
  anon_sym_PURGE = 13,
  anon_sym_LOCK = 14,
  anon_sym_UNLOCK = 15,
  anon_sym_PROPFIND = 16,
  anon_sym_VIEW = 17,
  aux_sym_method_token1 = 18,
  anon_sym_HTTP_SLASH1_DOT0 = 19,
  anon_sym_HTTP_SLASH1_DOT1 = 20,
  anon_sym_HTTP_SLASH2 = 21,
  anon_sym_HTTP_SLASH3 = 22,
  anon_sym_HTTP_SLASH_STAR = 23,
  anon_sym_HTTP = 24,
  aux_sym_status_token1 = 25,
  anon_sym_STAR = 26,
  anon_sym_LBRACKBasicAuth_RBRACK = 27,
  anon_sym_LBRACKQuery_RBRACK = 28,
  anon_sym_LBRACKQueryStringParams_RBRACK = 29,
  anon_sym_LBRACKForm_RBRACK = 30,
  anon_sym_LBRACKFormParams_RBRACK = 31,
  anon_sym_LBRACKMultipart_RBRACK = 32,
  anon_sym_LBRACKMultipartFormData_RBRACK = 33,
  anon_sym_LBRACKCookies_RBRACK = 34,
  anon_sym_LBRACKCaptures_RBRACK = 35,
  anon_sym_LBRACKAsserts_RBRACK = 36,
  anon_sym_LBRACKOptions_RBRACK = 37,
  anon_sym_COLON = 38,
  anon_sym_null = 39,
  anon_sym_file_COMMA = 40,
  anon_sym_SEMI = 41,
  aux_sym_file_value_token1 = 42,
  anon_sym_cacert = 43,
  anon_sym_cert = 44,
  sym_filename_password_text = 45,
  anon_sym_BSLASH = 46,
  anon_sym_b = 47,
  anon_sym_f = 48,
  anon_sym_n = 49,
  anon_sym_r = 50,
  anon_sym_t = 51,
  anon_sym_u = 52,
  anon_sym_POUND = 53,
  anon_sym_LBRACE = 54,
  anon_sym_RBRACE = 55,
  anon_sym_compressed = 56,
  anon_sym_location = 57,
  anon_sym_location_DASHtrusted = 58,
  anon_sym_http1_DOT0 = 59,
  anon_sym_http2 = 60,
  anon_sym_http3 = 61,
  anon_sym_insecure = 62,
  anon_sym_ipv4 = 63,
  anon_sym_ipv6 = 64,
  anon_sym_netrc = 65,
  anon_sym_netrc_DASHoptional = 66,
  anon_sym_path_DASHas_DASHis = 67,
  anon_sym_skip = 68,
  anon_sym_verbose = 69,
  anon_sym_very_DASHverbose = 70,
  anon_sym_max_DASHredirs = 71,
  anon_sym_retry_DASHmax_DASHcount = 72,
  anon_sym_limit_DASHrate = 73,
  anon_sym_max_DASHtime = 74,
  anon_sym_repeat = 75,
  anon_sym_retry = 76,
  anon_sym_connect_DASHtimeout = 77,
  anon_sym_delay = 78,
  anon_sym_retry_DASHinterval = 79,
  anon_sym_ms = 80,
  anon_sym_s = 81,
  anon_sym_m = 82,
  anon_sym_aws_DASHsigv4 = 83,
  anon_sym_key = 84,
  anon_sym_connect_DASHto = 85,
  anon_sym_header = 86,
  anon_sym_netrc_DASHfile = 87,
  anon_sym_output = 88,
  anon_sym_pinnedpubkey = 89,
  anon_sym_proxy = 90,
  anon_sym_unix_DASHsocket = 91,
  anon_sym_user = 92,
  anon_sym_variable = 93,
  anon_sym_EQ = 94,
  anon_sym_status = 95,
  anon_sym_url = 96,
  anon_sym_body = 97,
  anon_sym_duration = 98,
  anon_sym_bytes = 99,
  anon_sym_sha256 = 100,
  anon_sym_md5 = 101,
  anon_sym_cookie = 102,
  anon_sym_xpath = 103,
  anon_sym_jsonpath = 104,
  anon_sym_regex = 105,
  anon_sym_not = 106,
  anon_sym_exists = 107,
  anon_sym_isInteger = 108,
  anon_sym_isFloat = 109,
  anon_sym_isBoolean = 110,
  anon_sym_isString = 111,
  anon_sym_isCollection = 112,
  anon_sym_isNumber = 113,
  anon_sym_isIsoDate = 114,
  anon_sym_isEmpty = 115,
  anon_sym_isIpv4 = 116,
  anon_sym_isIpv6 = 117,
  anon_sym_isUuid = 118,
  anon_sym_equals = 119,
  anon_sym_EQ_EQ = 120,
  anon_sym_notEquals = 121,
  anon_sym_BANG_EQ = 122,
  anon_sym_greaterThan = 123,
  anon_sym_GT = 124,
  anon_sym_greaterThanOrEquals = 125,
  anon_sym_GT_EQ = 126,
  anon_sym_lessThan = 127,
  anon_sym_LT = 128,
  anon_sym_lessThanOrEquals = 129,
  anon_sym_LT_EQ = 130,
  anon_sym_startsWith = 131,
  anon_sym_endsWith = 132,
  anon_sym_contains = 133,
  anon_sym_matches = 134,
  anon_sym_includes = 135,
  anon_sym_LT_QMARK = 136,
  aux_sym_xml_prolog_tag_token1 = 137,
  anon_sym_QMARK_GT = 138,
  aux_sym_xml_open_tag_token1 = 139,
  anon_sym_LT_SLASH = 140,
  aux_sym_xml_close_tag_token1 = 141,
  anon_sym_base64_COMMA = 142,
  aux_sym_oneline_base64_token1 = 143,
  anon_sym_hex_COMMA = 144,
  anon_sym_DQUOTE = 145,
  sym_quoted_string_text = 146,
  aux_sym_invalid_quoted_string_escaped_char_token1 = 147,
  sym_key_string_text = 148,
  aux_sym_value_string_text_token1 = 149,
  aux_sym_oneline_string_token1 = 150,
  anon_sym_BQUOTE = 151,
  aux_sym_oneline_string_text_token1 = 152,
  anon_sym_BQUOTE_BQUOTE_BQUOTE = 153,
  anon_sym_base64 = 154,
  anon_sym_hex = 155,
  anon_sym_json = 156,
  anon_sym_xml = 157,
  anon_sym_graphql = 158,
  aux_sym_multiline_string_type_token1 = 159,
  aux_sym__multiline_string_text_token1 = 160,
  sym_filename_text = 161,
  aux_sym_filename_escaped_char_token1 = 162,
  anon_sym_COMMA = 163,
  anon_sym_LBRACK = 164,
  anon_sym_RBRACK = 165,
  aux_sym_json_string_text_token1 = 166,
  anon_sym_true = 167,
  anon_sym_false = 168,
  anon_sym_LBRACE_LBRACE = 169,
  anon_sym_RBRACE_RBRACE = 170,
  aux_sym_variable_name_token1 = 171,
  aux_sym_variable_name_token2 = 172,
  anon_sym_count = 173,
  anon_sym_urlEncode = 174,
  anon_sym_urlDecode = 175,
  anon_sym_toInt = 176,
  anon_sym_htmlEscape = 177,
  anon_sym_htmlUnescape = 178,
  anon_sym_daysAfterNow = 179,
  anon_sym_daysBeforeNow = 180,
  anon_sym_decode = 181,
  anon_sym_format = 182,
  anon_sym_toDate = 183,
  anon_sym_nth = 184,
  anon_sym_replace = 185,
  anon_sym_split = 186,
  sym__alphanum = 187,
  aux_sym_digit_token1 = 188,
  aux_sym_hexdigit_token1 = 189,
  anon_sym_DOT = 190,
  anon_sym_e = 191,
  anon_sym_E = 192,
  anon_sym_PLUS = 193,
  anon_sym_DASH = 194,
  sym_comment = 195,
  anon_sym_SLASH = 196,
  sym_regex_text = 197,
  aux_sym_regex_escaped_char_token1 = 198,
  sym_hurl_file = 199,
  sym_entry = 200,
  sym__comment_or_new_line = 201,
  sym_request = 202,
  sym_response = 203,
  sym_method = 204,
  sym_version = 205,
  sym_status = 206,
  sym_header = 207,
  sym_body = 208,
  sym_request_section = 209,
  sym_response_section = 210,
  sym_basic_auth_section = 211,
  sym_query_string_params_section = 212,
  sym_form_params_section = 213,
  sym_multipart_form_data_section = 214,
  sym_cookies_section = 215,
  sym_captures_section = 216,
  sym_asserts_section = 217,
  sym_options_section = 218,
  sym_key_value = 219,
  sym_multipart_form_data_param = 220,
  sym_file_param = 221,
  sym_file_value = 222,
  sym_capture = 223,
  sym_assert = 224,
  sym_option = 225,
  sym_ca_certificate_option = 226,
  sym_cert_option = 227,
  sym_filename_password = 228,
  sym_filename_password_escaped_char = 229,
  sym_boolean_option = 230,
  sym_boolean_option_key = 231,
  sym_integer_option = 232,
  sym_integer_option_key = 233,
  sym_duration_option = 234,
  sym_duration_option_key = 235,
  sym_duration_unit = 236,
  sym_string_option = 237,
  sym_string_option_key = 238,
  sym_variable_option = 239,
  sym_variable_definition = 240,
  sym_variable_value = 241,
  sym_query = 242,
  sym_simple_query = 243,
  sym_header_query = 244,
  sym_cookie_query = 245,
  sym_xpath_query = 246,
  sym_jsonpath_query = 247,
  sym_regex_query = 248,
  sym_variable_query = 249,
  sym_predicate = 250,
  sym_predicate_func = 251,
  sym_simple_predicate = 252,
  sym_equal_predicate = 253,
  sym_not_equal_predicate = 254,
  sym_greater_predicate = 255,
  sym_greater_or_equal_predicate = 256,
  sym_less_predicate = 257,
  sym_less_or_equal_predicate = 258,
  sym_start_with_predicate = 259,
  sym_end_with_predicate = 260,
  sym_contain_predicate = 261,
  sym_match_predicate = 262,
  sym_include_predicate = 263,
  sym_predicate_value = 264,
  sym_bytes = 265,
  sym_xml = 266,
  sym_xml_prolog_tag = 267,
  sym_xml_tag = 268,
  sym_xml_open_tag = 269,
  sym_xml_close_tag = 270,
  sym_oneline_base64 = 271,
  sym_oneline_file = 272,
  sym_oneline_hex = 273,
  sym_quoted_string = 274,
  sym_quoted_string_content = 275,
  sym_invalid_quoted_string_escaped_char = 276,
  sym_quoted_string_escaped_char = 277,
  sym_key_string = 278,
  sym_key_string_content = 279,
  sym_key_string_escaped_char = 280,
  sym_xml_value_string = 281,
  sym_value_string = 282,
  sym_value_string_content = 283,
  sym_value_string_text = 284,
  sym_value_string_escaped_char = 285,
  sym_oneline_string = 286,
  sym_oneline_string_content = 287,
  sym_oneline_string_text = 288,
  sym_oneline_string_escaped_char = 289,
  sym_multiline_string = 290,
  sym_multiline_string_type = 291,
  sym_multiline_string_content = 292,
  sym__multiline_string_text = 293,
  sym_multiline_string_escaped_char = 294,
  sym_filename = 295,
  sym_filename_content = 296,
  sym_filename_escaped_char = 297,
  sym_unicode_char = 298,
  sym_json_value = 299,
  sym_json_object = 300,
  sym_json_key_value = 301,
  sym_json_key_string = 302,
  sym_json_array = 303,
  sym_json_string = 304,
  sym_json_string_content = 305,
  sym_json_string_text = 306,
  sym_json_string_escaped_char = 307,
  sym_json_number = 308,
  sym_json_boolean = 309,
  sym_template = 310,
  sym_expr = 311,
  sym_variable_name = 312,
  sym_filter = 313,
  sym_simple_filter_key = 314,
  sym_regex_filter = 315,
  sym_nth_filter = 316,
  sym_replace_filter = 317,
  sym_split_filter = 318,
  sym_xpath_filter = 319,
  sym_boolean = 320,
  sym_integer = 321,
  sym_json_integer = 322,
  sym_float = 323,
  sym_digit = 324,
  sym_json_digit = 325,
  sym_hexdigit = 326,
  sym_json_hexdigit = 327,
  sym_fraction = 328,
  sym_json_fraction = 329,
  sym_json_exponent = 330,
  sym_regex = 331,
  sym_regex_content = 332,
  sym_regex_escaped_char = 333,
  aux_sym_hurl_file_repeat1 = 334,
  aux_sym_hurl_file_repeat2 = 335,
  aux_sym__comment_or_new_line_repeat1 = 336,
  aux_sym_request_repeat1 = 337,
  aux_sym_request_repeat2 = 338,
  aux_sym_response_repeat1 = 339,
  aux_sym_query_string_params_section_repeat1 = 340,
  aux_sym_multipart_form_data_section_repeat1 = 341,
  aux_sym_captures_section_repeat1 = 342,
  aux_sym_asserts_section_repeat1 = 343,
  aux_sym_options_section_repeat1 = 344,
  aux_sym_capture_repeat1 = 345,
  aux_sym_filename_password_repeat1 = 346,
  aux_sym_xml_repeat1 = 347,
  aux_sym_xml_tag_repeat1 = 348,
  aux_sym_oneline_hex_repeat1 = 349,
  aux_sym_quoted_string_repeat1 = 350,
  aux_sym_quoted_string_content_repeat1 = 351,
  aux_sym_key_string_repeat1 = 352,
  aux_sym_key_string_content_repeat1 = 353,
  aux_sym_xml_value_string_repeat1 = 354,
  aux_sym_value_string_repeat1 = 355,
  aux_sym_value_string_content_repeat1 = 356,
  aux_sym_value_string_text_repeat1 = 357,
  aux_sym_oneline_string_repeat1 = 358,
  aux_sym_oneline_string_content_repeat1 = 359,
  aux_sym_multiline_string_repeat1 = 360,
  aux_sym_multiline_string_content_repeat1 = 361,
  aux_sym__multiline_string_text_repeat1 = 362,
  aux_sym_filename_repeat1 = 363,
  aux_sym_filename_content_repeat1 = 364,
  aux_sym_json_object_repeat1 = 365,
  aux_sym_json_array_repeat1 = 366,
  aux_sym_json_string_repeat1 = 367,
  aux_sym_json_string_text_repeat1 = 368,
  aux_sym_integer_repeat1 = 369,
  aux_sym_json_integer_repeat1 = 370,
  aux_sym_regex_content_repeat1 = 371,
  anon_alias_sym_json_key_string = 372,
};

static const char * const ts_symbol_names[] = {
  [ts_builtin_sym_end] = "end",
  [anon_sym_LF] = "\n",
  [anon_sym_GET] = "GET",
  [anon_sym_HEAD] = "HEAD",
  [anon_sym_POST] = "POST",
  [anon_sym_PUT] = "PUT",
  [anon_sym_DELETE] = "DELETE",
  [anon_sym_CONNECT] = "CONNECT",
  [anon_sym_OPTIONS] = "OPTIONS",
  [anon_sym_TRACE] = "TRACE",
  [anon_sym_PATCH] = "PATCH",
  [anon_sym_LINK] = "LINK",
  [anon_sym_UNLINK] = "UNLINK",
  [anon_sym_PURGE] = "PURGE",
  [anon_sym_LOCK] = "LOCK",
  [anon_sym_UNLOCK] = "UNLOCK",
  [anon_sym_PROPFIND] = "PROPFIND",
  [anon_sym_VIEW] = "VIEW",
  [aux_sym_method_token1] = "method_token1",
  [anon_sym_HTTP_SLASH1_DOT0] = "HTTP/1.0",
  [anon_sym_HTTP_SLASH1_DOT1] = "HTTP/1.1",
  [anon_sym_HTTP_SLASH2] = "HTTP/2",
  [anon_sym_HTTP_SLASH3] = "HTTP/3",
  [anon_sym_HTTP_SLASH_STAR] = "HTTP/*",
  [anon_sym_HTTP] = "HTTP",
  [aux_sym_status_token1] = "status_token1",
  [anon_sym_STAR] = "*",
  [anon_sym_LBRACKBasicAuth_RBRACK] = "[BasicAuth]",
  [anon_sym_LBRACKQuery_RBRACK] = "[Query]",
  [anon_sym_LBRACKQueryStringParams_RBRACK] = "[QueryStringParams]",
  [anon_sym_LBRACKForm_RBRACK] = "[Form]",
  [anon_sym_LBRACKFormParams_RBRACK] = "[FormParams]",
  [anon_sym_LBRACKMultipart_RBRACK] = "[Multipart]",
  [anon_sym_LBRACKMultipartFormData_RBRACK] = "[MultipartFormData]",
  [anon_sym_LBRACKCookies_RBRACK] = "[Cookies]",
  [anon_sym_LBRACKCaptures_RBRACK] = "[Captures]",
  [anon_sym_LBRACKAsserts_RBRACK] = "[Asserts]",
  [anon_sym_LBRACKOptions_RBRACK] = "[Options]",
  [anon_sym_COLON] = ":",
  [anon_sym_null] = "null",
  [anon_sym_file_COMMA] = "file,",
  [anon_sym_SEMI] = ";",
  [aux_sym_file_value_token1] = "file_value_token1",
  [anon_sym_cacert] = "cacert",
  [anon_sym_cert] = "cert",
  [sym_filename_password_text] = "filename_password_text",
  [anon_sym_BSLASH] = "\\",
  [anon_sym_b] = "b",
  [anon_sym_f] = "f",
  [anon_sym_n] = "n",
  [anon_sym_r] = "r",
  [anon_sym_t] = "t",
  [anon_sym_u] = "u",
  [anon_sym_POUND] = "#",
  [anon_sym_LBRACE] = "{",
  [anon_sym_RBRACE] = "}",
  [anon_sym_compressed] = "compressed",
  [anon_sym_location] = "location",
  [anon_sym_location_DASHtrusted] = "location-trusted",
  [anon_sym_http1_DOT0] = "http1.0",
  [anon_sym_http2] = "http2",
  [anon_sym_http3] = "http3",
  [anon_sym_insecure] = "insecure",
  [anon_sym_ipv4] = "ipv4",
  [anon_sym_ipv6] = "ipv6",
  [anon_sym_netrc] = "netrc",
  [anon_sym_netrc_DASHoptional] = "netrc-optional",
  [anon_sym_path_DASHas_DASHis] = "path-as-is",
  [anon_sym_skip] = "skip",
  [anon_sym_verbose] = "verbose",
  [anon_sym_very_DASHverbose] = "very-verbose",
  [anon_sym_max_DASHredirs] = "max-redirs",
  [anon_sym_retry_DASHmax_DASHcount] = "retry-max-count",
  [anon_sym_limit_DASHrate] = "limit-rate",
  [anon_sym_max_DASHtime] = "max-time",
  [anon_sym_repeat] = "repeat",
  [anon_sym_retry] = "retry",
  [anon_sym_connect_DASHtimeout] = "connect-timeout",
  [anon_sym_delay] = "delay",
  [anon_sym_retry_DASHinterval] = "retry-interval",
  [anon_sym_ms] = "ms",
  [anon_sym_s] = "s",
  [anon_sym_m] = "m",
  [anon_sym_aws_DASHsigv4] = "aws-sigv4",
  [anon_sym_key] = "key",
  [anon_sym_connect_DASHto] = "connect-to",
  [anon_sym_header] = "header",
  [anon_sym_netrc_DASHfile] = "netrc-file",
  [anon_sym_output] = "output",
  [anon_sym_pinnedpubkey] = "pinnedpubkey",
  [anon_sym_proxy] = "proxy",
  [anon_sym_unix_DASHsocket] = "unix-socket",
  [anon_sym_user] = "user",
  [anon_sym_variable] = "variable",
  [anon_sym_EQ] = "=",
  [anon_sym_status] = "status",
  [anon_sym_url] = "url",
  [anon_sym_body] = "body",
  [anon_sym_duration] = "duration",
  [anon_sym_bytes] = "bytes",
  [anon_sym_sha256] = "sha256",
  [anon_sym_md5] = "md5",
  [anon_sym_cookie] = "cookie",
  [anon_sym_xpath] = "xpath",
  [anon_sym_jsonpath] = "jsonpath",
  [anon_sym_regex] = "regex",
  [anon_sym_not] = "not",
  [anon_sym_exists] = "exists",
  [anon_sym_isInteger] = "isInteger",
  [anon_sym_isFloat] = "isFloat",
  [anon_sym_isBoolean] = "isBoolean",
  [anon_sym_isString] = "isString",
  [anon_sym_isCollection] = "isCollection",
  [anon_sym_isNumber] = "isNumber",
  [anon_sym_isIsoDate] = "isIsoDate",
  [anon_sym_isEmpty] = "isEmpty",
  [anon_sym_isIpv4] = "isIpv4",
  [anon_sym_isIpv6] = "isIpv6",
  [anon_sym_isUuid] = "isUuid",
  [anon_sym_equals] = "equals",
  [anon_sym_EQ_EQ] = "==",
  [anon_sym_notEquals] = "notEquals",
  [anon_sym_BANG_EQ] = "!=",
  [anon_sym_greaterThan] = "greaterThan",
  [anon_sym_GT] = ">",
  [anon_sym_greaterThanOrEquals] = "greaterThanOrEquals",
  [anon_sym_GT_EQ] = ">=",
  [anon_sym_lessThan] = "lessThan",
  [anon_sym_LT] = "<",
  [anon_sym_lessThanOrEquals] = "lessThanOrEquals",
  [anon_sym_LT_EQ] = "<=",
  [anon_sym_startsWith] = "startsWith",
  [anon_sym_endsWith] = "endsWith",
  [anon_sym_contains] = "contains",
  [anon_sym_matches] = "matches",
  [anon_sym_includes] = "includes",
  [anon_sym_LT_QMARK] = "<\?",
  [aux_sym_xml_prolog_tag_token1] = "xml_prolog_tag_token1",
  [anon_sym_QMARK_GT] = "\?>",
  [aux_sym_xml_open_tag_token1] = "xml_open_tag_token1",
  [anon_sym_LT_SLASH] = "</",
  [aux_sym_xml_close_tag_token1] = "xml_close_tag_token1",
  [anon_sym_base64_COMMA] = "base64,",
  [aux_sym_oneline_base64_token1] = "oneline_base64_token1",
  [anon_sym_hex_COMMA] = "hex,",
  [anon_sym_DQUOTE] = "\"",
  [sym_quoted_string_text] = "quoted_string_text",
  [aux_sym_invalid_quoted_string_escaped_char_token1] = "invalid_quoted_string_escaped_char_token1",
  [sym_key_string_text] = "key_string_text",
  [aux_sym_value_string_text_token1] = "value_string_text_token1",
  [aux_sym_oneline_string_token1] = "oneline_string_token1",
  [anon_sym_BQUOTE] = "`",
  [aux_sym_oneline_string_text_token1] = "oneline_string_text_token1",
  [anon_sym_BQUOTE_BQUOTE_BQUOTE] = "```",
  [anon_sym_base64] = "base64",
  [anon_sym_hex] = "hex",
  [anon_sym_json] = "json",
  [anon_sym_xml] = "xml",
  [anon_sym_graphql] = "graphql",
  [aux_sym_multiline_string_type_token1] = "multiline_string_type_token1",
  [aux_sym__multiline_string_text_token1] = "_multiline_string_text_token1",
  [sym_filename_text] = "filename_text",
  [aux_sym_filename_escaped_char_token1] = "filename_escaped_char_token1",
  [anon_sym_COMMA] = ",",
  [anon_sym_LBRACK] = "[",
  [anon_sym_RBRACK] = "]",
  [aux_sym_json_string_text_token1] = "json_string_text_token1",
  [anon_sym_true] = "true",
  [anon_sym_false] = "false",
  [anon_sym_LBRACE_LBRACE] = "{{",
  [anon_sym_RBRACE_RBRACE] = "}}",
  [aux_sym_variable_name_token1] = "variable_name_token1",
  [aux_sym_variable_name_token2] = "variable_name_token2",
  [anon_sym_count] = "count",
  [anon_sym_urlEncode] = "urlEncode",
  [anon_sym_urlDecode] = "urlDecode",
  [anon_sym_toInt] = "toInt",
  [anon_sym_htmlEscape] = "htmlEscape",
  [anon_sym_htmlUnescape] = "htmlUnescape",
  [anon_sym_daysAfterNow] = "daysAfterNow",
  [anon_sym_daysBeforeNow] = "daysBeforeNow",
  [anon_sym_decode] = "decode",
  [anon_sym_format] = "format",
  [anon_sym_toDate] = "toDate",
  [anon_sym_nth] = "nth",
  [anon_sym_replace] = "replace",
  [anon_sym_split] = "split",
  [sym__alphanum] = "_alphanum",
  [aux_sym_digit_token1] = "digit_token1",
  [aux_sym_hexdigit_token1] = "hexdigit_token1",
  [anon_sym_DOT] = ".",
  [anon_sym_e] = "e",
  [anon_sym_E] = "E",
  [anon_sym_PLUS] = "+",
  [anon_sym_DASH] = "-",
  [sym_comment] = "comment",
  [anon_sym_SLASH] = "/",
  [sym_regex_text] = "regex_text",
  [aux_sym_regex_escaped_char_token1] = "regex_escaped_char_token1",
  [sym_hurl_file] = "hurl_file",
  [sym_entry] = "entry",
  [sym__comment_or_new_line] = "_comment_or_new_line",
  [sym_request] = "request",
  [sym_response] = "response",
  [sym_method] = "method",
  [sym_version] = "version",
  [sym_status] = "status",
  [sym_header] = "header",
  [sym_body] = "body",
  [sym_request_section] = "request_section",
  [sym_response_section] = "response_section",
  [sym_basic_auth_section] = "basic_auth_section",
  [sym_query_string_params_section] = "query_string_params_section",
  [sym_form_params_section] = "form_params_section",
  [sym_multipart_form_data_section] = "multipart_form_data_section",
  [sym_cookies_section] = "cookies_section",
  [sym_captures_section] = "captures_section",
  [sym_asserts_section] = "asserts_section",
  [sym_options_section] = "options_section",
  [sym_key_value] = "key_value",
  [sym_multipart_form_data_param] = "multipart_form_data_param",
  [sym_file_param] = "file_param",
  [sym_file_value] = "file_value",
  [sym_capture] = "capture",
  [sym_assert] = "assert",
  [sym_option] = "option",
  [sym_ca_certificate_option] = "ca_certificate_option",
  [sym_cert_option] = "cert_option",
  [sym_filename_password] = "filename_password",
  [sym_filename_password_escaped_char] = "filename_password_escaped_char",
  [sym_boolean_option] = "boolean_option",
  [sym_boolean_option_key] = "boolean_option_key",
  [sym_integer_option] = "integer_option",
  [sym_integer_option_key] = "integer_option_key",
  [sym_duration_option] = "duration_option",
  [sym_duration_option_key] = "duration_option_key",
  [sym_duration_unit] = "duration_unit",
  [sym_string_option] = "string_option",
  [sym_string_option_key] = "string_option_key",
  [sym_variable_option] = "variable_option",
  [sym_variable_definition] = "variable_definition",
  [sym_variable_value] = "variable_value",
  [sym_query] = "query",
  [sym_simple_query] = "simple_query",
  [sym_header_query] = "header_query",
  [sym_cookie_query] = "cookie_query",
  [sym_xpath_query] = "xpath_query",
  [sym_jsonpath_query] = "jsonpath_query",
  [sym_regex_query] = "regex_query",
  [sym_variable_query] = "variable_query",
  [sym_predicate] = "predicate",
  [sym_predicate_func] = "predicate_func",
  [sym_simple_predicate] = "simple_predicate",
  [sym_equal_predicate] = "equal_predicate",
  [sym_not_equal_predicate] = "not_equal_predicate",
  [sym_greater_predicate] = "greater_predicate",
  [sym_greater_or_equal_predicate] = "greater_or_equal_predicate",
  [sym_less_predicate] = "less_predicate",
  [sym_less_or_equal_predicate] = "less_or_equal_predicate",
  [sym_start_with_predicate] = "start_with_predicate",
  [sym_end_with_predicate] = "end_with_predicate",
  [sym_contain_predicate] = "contain_predicate",
  [sym_match_predicate] = "match_predicate",
  [sym_include_predicate] = "include_predicate",
  [sym_predicate_value] = "predicate_value",
  [sym_bytes] = "bytes",
  [sym_xml] = "xml",
  [sym_xml_prolog_tag] = "xml_prolog_tag",
  [sym_xml_tag] = "xml_tag",
  [sym_xml_open_tag] = "xml_open_tag",
  [sym_xml_close_tag] = "xml_close_tag",
  [sym_oneline_base64] = "oneline_base64",
  [sym_oneline_file] = "oneline_file",
  [sym_oneline_hex] = "oneline_hex",
  [sym_quoted_string] = "quoted_string",
  [sym_quoted_string_content] = "quoted_string_content",
  [sym_invalid_quoted_string_escaped_char] = "invalid_quoted_string_escaped_char",
  [sym_quoted_string_escaped_char] = "quoted_string_escaped_char",
  [sym_key_string] = "key_string",
  [sym_key_string_content] = "key_string_content",
  [sym_key_string_escaped_char] = "key_string_escaped_char",
  [sym_xml_value_string] = "xml_value_string",
  [sym_value_string] = "value_string",
  [sym_value_string_content] = "value_string_content",
  [sym_value_string_text] = "value_string_text",
  [sym_value_string_escaped_char] = "value_string_escaped_char",
  [sym_oneline_string] = "oneline_string",
  [sym_oneline_string_content] = "oneline_string_content",
  [sym_oneline_string_text] = "oneline_string_text",
  [sym_oneline_string_escaped_char] = "oneline_string_escaped_char",
  [sym_multiline_string] = "multiline_string",
  [sym_multiline_string_type] = "multiline_string_type",
  [sym_multiline_string_content] = "multiline_string_content",
  [sym__multiline_string_text] = "_multiline_string_text",
  [sym_multiline_string_escaped_char] = "multiline_string_escaped_char",
  [sym_filename] = "filename",
  [sym_filename_content] = "filename_content",
  [sym_filename_escaped_char] = "filename_escaped_char",
  [sym_unicode_char] = "unicode_char",
  [sym_json_value] = "json_value",
  [sym_json_object] = "json_object",
  [sym_json_key_value] = "json_key_value",
  [sym_json_key_string] = "json_key_string",
  [sym_json_array] = "json_array",
  [sym_json_string] = "json_string",
  [sym_json_string_content] = "json_string_content",
  [sym_json_string_text] = "json_string_text",
  [sym_json_string_escaped_char] = "json_string_escaped_char",
  [sym_json_number] = "json_number",
  [sym_json_boolean] = "json_boolean",
  [sym_template] = "template",
  [sym_expr] = "expr",
  [sym_variable_name] = "variable_name",
  [sym_filter] = "filter",
  [sym_simple_filter_key] = "simple_filter_key",
  [sym_regex_filter] = "regex_filter",
  [sym_nth_filter] = "nth_filter",
  [sym_replace_filter] = "replace_filter",
  [sym_split_filter] = "split_filter",
  [sym_xpath_filter] = "xpath_filter",
  [sym_boolean] = "boolean",
  [sym_integer] = "integer",
  [sym_json_integer] = "json_integer",
  [sym_float] = "float",
  [sym_digit] = "digit",
  [sym_json_digit] = "json_digit",
  [sym_hexdigit] = "hexdigit",
  [sym_json_hexdigit] = "json_hexdigit",
  [sym_fraction] = "fraction",
  [sym_json_fraction] = "json_fraction",
  [sym_json_exponent] = "json_exponent",
  [sym_regex] = "regex",
  [sym_regex_content] = "regex_content",
  [sym_regex_escaped_char] = "regex_escaped_char",
  [aux_sym_hurl_file_repeat1] = "hurl_file_repeat1",
  [aux_sym_hurl_file_repeat2] = "hurl_file_repeat2",
  [aux_sym__comment_or_new_line_repeat1] = "_comment_or_new_line_repeat1",
  [aux_sym_request_repeat1] = "request_repeat1",
  [aux_sym_request_repeat2] = "request_repeat2",
  [aux_sym_response_repeat1] = "response_repeat1",
  [aux_sym_query_string_params_section_repeat1] = "query_string_params_section_repeat1",
  [aux_sym_multipart_form_data_section_repeat1] = "multipart_form_data_section_repeat1",
  [aux_sym_captures_section_repeat1] = "captures_section_repeat1",
  [aux_sym_asserts_section_repeat1] = "asserts_section_repeat1",
  [aux_sym_options_section_repeat1] = "options_section_repeat1",
  [aux_sym_capture_repeat1] = "capture_repeat1",
  [aux_sym_filename_password_repeat1] = "filename_password_repeat1",
  [aux_sym_xml_repeat1] = "xml_repeat1",
  [aux_sym_xml_tag_repeat1] = "xml_tag_repeat1",
  [aux_sym_oneline_hex_repeat1] = "oneline_hex_repeat1",
  [aux_sym_quoted_string_repeat1] = "quoted_string_repeat1",
  [aux_sym_quoted_string_content_repeat1] = "quoted_string_content_repeat1",
  [aux_sym_key_string_repeat1] = "key_string_repeat1",
  [aux_sym_key_string_content_repeat1] = "key_string_content_repeat1",
  [aux_sym_xml_value_string_repeat1] = "xml_value_string_repeat1",
  [aux_sym_value_string_repeat1] = "value_string_repeat1",
  [aux_sym_value_string_content_repeat1] = "value_string_content_repeat1",
  [aux_sym_value_string_text_repeat1] = "value_string_text_repeat1",
  [aux_sym_oneline_string_repeat1] = "oneline_string_repeat1",
  [aux_sym_oneline_string_content_repeat1] = "oneline_string_content_repeat1",
  [aux_sym_multiline_string_repeat1] = "multiline_string_repeat1",
  [aux_sym_multiline_string_content_repeat1] = "multiline_string_content_repeat1",
  [aux_sym__multiline_string_text_repeat1] = "_multiline_string_text_repeat1",
  [aux_sym_filename_repeat1] = "filename_repeat1",
  [aux_sym_filename_content_repeat1] = "filename_content_repeat1",
  [aux_sym_json_object_repeat1] = "json_object_repeat1",
  [aux_sym_json_array_repeat1] = "json_array_repeat1",
  [aux_sym_json_string_repeat1] = "json_string_repeat1",
  [aux_sym_json_string_text_repeat1] = "json_string_text_repeat1",
  [aux_sym_integer_repeat1] = "integer_repeat1",
  [aux_sym_json_integer_repeat1] = "json_integer_repeat1",
  [aux_sym_regex_content_repeat1] = "regex_content_repeat1",
  [anon_alias_sym_json_key_string] = "json_key_string",
};

static const TSSymbol ts_symbol_map[] = {
  [ts_builtin_sym_end] = ts_builtin_sym_end,
  [anon_sym_LF] = anon_sym_LF,
  [anon_sym_GET] = anon_sym_GET,
  [anon_sym_HEAD] = anon_sym_HEAD,
  [anon_sym_POST] = anon_sym_POST,
  [anon_sym_PUT] = anon_sym_PUT,
  [anon_sym_DELETE] = anon_sym_DELETE,
  [anon_sym_CONNECT] = anon_sym_CONNECT,
  [anon_sym_OPTIONS] = anon_sym_OPTIONS,
  [anon_sym_TRACE] = anon_sym_TRACE,
  [anon_sym_PATCH] = anon_sym_PATCH,
  [anon_sym_LINK] = anon_sym_LINK,
  [anon_sym_UNLINK] = anon_sym_UNLINK,
  [anon_sym_PURGE] = anon_sym_PURGE,
  [anon_sym_LOCK] = anon_sym_LOCK,
  [anon_sym_UNLOCK] = anon_sym_UNLOCK,
  [anon_sym_PROPFIND] = anon_sym_PROPFIND,
  [anon_sym_VIEW] = anon_sym_VIEW,
  [aux_sym_method_token1] = aux_sym_method_token1,
  [anon_sym_HTTP_SLASH1_DOT0] = anon_sym_HTTP_SLASH1_DOT0,
  [anon_sym_HTTP_SLASH1_DOT1] = anon_sym_HTTP_SLASH1_DOT1,
  [anon_sym_HTTP_SLASH2] = anon_sym_HTTP_SLASH2,
  [anon_sym_HTTP_SLASH3] = anon_sym_HTTP_SLASH3,
  [anon_sym_HTTP_SLASH_STAR] = anon_sym_HTTP_SLASH_STAR,
  [anon_sym_HTTP] = anon_sym_HTTP,
  [aux_sym_status_token1] = aux_sym_status_token1,
  [anon_sym_STAR] = anon_sym_STAR,
  [anon_sym_LBRACKBasicAuth_RBRACK] = anon_sym_LBRACKBasicAuth_RBRACK,
  [anon_sym_LBRACKQuery_RBRACK] = anon_sym_LBRACKQuery_RBRACK,
  [anon_sym_LBRACKQueryStringParams_RBRACK] = anon_sym_LBRACKQueryStringParams_RBRACK,
  [anon_sym_LBRACKForm_RBRACK] = anon_sym_LBRACKForm_RBRACK,
  [anon_sym_LBRACKFormParams_RBRACK] = anon_sym_LBRACKFormParams_RBRACK,
  [anon_sym_LBRACKMultipart_RBRACK] = anon_sym_LBRACKMultipart_RBRACK,
  [anon_sym_LBRACKMultipartFormData_RBRACK] = anon_sym_LBRACKMultipartFormData_RBRACK,
  [anon_sym_LBRACKCookies_RBRACK] = anon_sym_LBRACKCookies_RBRACK,
  [anon_sym_LBRACKCaptures_RBRACK] = anon_sym_LBRACKCaptures_RBRACK,
  [anon_sym_LBRACKAsserts_RBRACK] = anon_sym_LBRACKAsserts_RBRACK,
  [anon_sym_LBRACKOptions_RBRACK] = anon_sym_LBRACKOptions_RBRACK,
  [anon_sym_COLON] = anon_sym_COLON,
  [anon_sym_null] = anon_sym_null,
  [anon_sym_file_COMMA] = anon_sym_file_COMMA,
  [anon_sym_SEMI] = anon_sym_SEMI,
  [aux_sym_file_value_token1] = aux_sym_file_value_token1,
  [anon_sym_cacert] = anon_sym_cacert,
  [anon_sym_cert] = anon_sym_cert,
  [sym_filename_password_text] = sym_filename_password_text,
  [anon_sym_BSLASH] = anon_sym_BSLASH,
  [anon_sym_b] = anon_sym_b,
  [anon_sym_f] = anon_sym_f,
  [anon_sym_n] = anon_sym_n,
  [anon_sym_r] = anon_sym_r,
  [anon_sym_t] = anon_sym_t,
  [anon_sym_u] = anon_sym_u,
  [anon_sym_POUND] = anon_sym_POUND,
  [anon_sym_LBRACE] = anon_sym_LBRACE,
  [anon_sym_RBRACE] = anon_sym_RBRACE,
  [anon_sym_compressed] = anon_sym_compressed,
  [anon_sym_location] = anon_sym_location,
  [anon_sym_location_DASHtrusted] = anon_sym_location_DASHtrusted,
  [anon_sym_http1_DOT0] = anon_sym_http1_DOT0,
  [anon_sym_http2] = anon_sym_http2,
  [anon_sym_http3] = anon_sym_http3,
  [anon_sym_insecure] = anon_sym_insecure,
  [anon_sym_ipv4] = anon_sym_ipv4,
  [anon_sym_ipv6] = anon_sym_ipv6,
  [anon_sym_netrc] = anon_sym_netrc,
  [anon_sym_netrc_DASHoptional] = anon_sym_netrc_DASHoptional,
  [anon_sym_path_DASHas_DASHis] = anon_sym_path_DASHas_DASHis,
  [anon_sym_skip] = anon_sym_skip,
  [anon_sym_verbose] = anon_sym_verbose,
  [anon_sym_very_DASHverbose] = anon_sym_very_DASHverbose,
  [anon_sym_max_DASHredirs] = anon_sym_max_DASHredirs,
  [anon_sym_retry_DASHmax_DASHcount] = anon_sym_retry_DASHmax_DASHcount,
  [anon_sym_limit_DASHrate] = anon_sym_limit_DASHrate,
  [anon_sym_max_DASHtime] = anon_sym_max_DASHtime,
  [anon_sym_repeat] = anon_sym_repeat,
  [anon_sym_retry] = anon_sym_retry,
  [anon_sym_connect_DASHtimeout] = anon_sym_connect_DASHtimeout,
  [anon_sym_delay] = anon_sym_delay,
  [anon_sym_retry_DASHinterval] = anon_sym_retry_DASHinterval,
  [anon_sym_ms] = anon_sym_ms,
  [anon_sym_s] = anon_sym_s,
  [anon_sym_m] = anon_sym_m,
  [anon_sym_aws_DASHsigv4] = anon_sym_aws_DASHsigv4,
  [anon_sym_key] = anon_sym_key,
  [anon_sym_connect_DASHto] = anon_sym_connect_DASHto,
  [anon_sym_header] = anon_sym_header,
  [anon_sym_netrc_DASHfile] = anon_sym_netrc_DASHfile,
  [anon_sym_output] = anon_sym_output,
  [anon_sym_pinnedpubkey] = anon_sym_pinnedpubkey,
  [anon_sym_proxy] = anon_sym_proxy,
  [anon_sym_unix_DASHsocket] = anon_sym_unix_DASHsocket,
  [anon_sym_user] = anon_sym_user,
  [anon_sym_variable] = anon_sym_variable,
  [anon_sym_EQ] = anon_sym_EQ,
  [anon_sym_status] = anon_sym_status,
  [anon_sym_url] = anon_sym_url,
  [anon_sym_body] = anon_sym_body,
  [anon_sym_duration] = anon_sym_duration,
  [anon_sym_bytes] = anon_sym_bytes,
  [anon_sym_sha256] = anon_sym_sha256,
  [anon_sym_md5] = anon_sym_md5,
  [anon_sym_cookie] = anon_sym_cookie,
  [anon_sym_xpath] = anon_sym_xpath,
  [anon_sym_jsonpath] = anon_sym_jsonpath,
  [anon_sym_regex] = anon_sym_regex,
  [anon_sym_not] = anon_sym_not,
  [anon_sym_exists] = anon_sym_exists,
  [anon_sym_isInteger] = anon_sym_isInteger,
  [anon_sym_isFloat] = anon_sym_isFloat,
  [anon_sym_isBoolean] = anon_sym_isBoolean,
  [anon_sym_isString] = anon_sym_isString,
  [anon_sym_isCollection] = anon_sym_isCollection,
  [anon_sym_isNumber] = anon_sym_isNumber,
  [anon_sym_isIsoDate] = anon_sym_isIsoDate,
  [anon_sym_isEmpty] = anon_sym_isEmpty,
  [anon_sym_isIpv4] = anon_sym_isIpv4,
  [anon_sym_isIpv6] = anon_sym_isIpv6,
  [anon_sym_isUuid] = anon_sym_isUuid,
  [anon_sym_equals] = anon_sym_equals,
  [anon_sym_EQ_EQ] = anon_sym_EQ_EQ,
  [anon_sym_notEquals] = anon_sym_notEquals,
  [anon_sym_BANG_EQ] = anon_sym_BANG_EQ,
  [anon_sym_greaterThan] = anon_sym_greaterThan,
  [anon_sym_GT] = anon_sym_GT,
  [anon_sym_greaterThanOrEquals] = anon_sym_greaterThanOrEquals,
  [anon_sym_GT_EQ] = anon_sym_GT_EQ,
  [anon_sym_lessThan] = anon_sym_lessThan,
  [anon_sym_LT] = anon_sym_LT,
  [anon_sym_lessThanOrEquals] = anon_sym_lessThanOrEquals,
  [anon_sym_LT_EQ] = anon_sym_LT_EQ,
  [anon_sym_startsWith] = anon_sym_startsWith,
  [anon_sym_endsWith] = anon_sym_endsWith,
  [anon_sym_contains] = anon_sym_contains,
  [anon_sym_matches] = anon_sym_matches,
  [anon_sym_includes] = anon_sym_includes,
  [anon_sym_LT_QMARK] = anon_sym_LT_QMARK,
  [aux_sym_xml_prolog_tag_token1] = aux_sym_xml_prolog_tag_token1,
  [anon_sym_QMARK_GT] = anon_sym_QMARK_GT,
  [aux_sym_xml_open_tag_token1] = aux_sym_xml_open_tag_token1,
  [anon_sym_LT_SLASH] = anon_sym_LT_SLASH,
  [aux_sym_xml_close_tag_token1] = aux_sym_xml_close_tag_token1,
  [anon_sym_base64_COMMA] = anon_sym_base64_COMMA,
  [aux_sym_oneline_base64_token1] = aux_sym_oneline_base64_token1,
  [anon_sym_hex_COMMA] = anon_sym_hex_COMMA,
  [anon_sym_DQUOTE] = anon_sym_DQUOTE,
  [sym_quoted_string_text] = sym_quoted_string_text,
  [aux_sym_invalid_quoted_string_escaped_char_token1] = aux_sym_invalid_quoted_string_escaped_char_token1,
  [sym_key_string_text] = sym_key_string_text,
  [aux_sym_value_string_text_token1] = aux_sym_value_string_text_token1,
  [aux_sym_oneline_string_token1] = aux_sym_oneline_string_token1,
  [anon_sym_BQUOTE] = anon_sym_BQUOTE,
  [aux_sym_oneline_string_text_token1] = aux_sym_oneline_string_text_token1,
  [anon_sym_BQUOTE_BQUOTE_BQUOTE] = anon_sym_BQUOTE_BQUOTE_BQUOTE,
  [anon_sym_base64] = anon_sym_base64,
  [anon_sym_hex] = anon_sym_hex,
  [anon_sym_json] = anon_sym_json,
  [anon_sym_xml] = anon_sym_xml,
  [anon_sym_graphql] = anon_sym_graphql,
  [aux_sym_multiline_string_type_token1] = aux_sym_multiline_string_type_token1,
  [aux_sym__multiline_string_text_token1] = aux_sym__multiline_string_text_token1,
  [sym_filename_text] = sym_filename_text,
  [aux_sym_filename_escaped_char_token1] = aux_sym_filename_escaped_char_token1,
  [anon_sym_COMMA] = anon_sym_COMMA,
  [anon_sym_LBRACK] = anon_sym_LBRACK,
  [anon_sym_RBRACK] = anon_sym_RBRACK,
  [aux_sym_json_string_text_token1] = aux_sym_json_string_text_token1,
  [anon_sym_true] = anon_sym_true,
  [anon_sym_false] = anon_sym_false,
  [anon_sym_LBRACE_LBRACE] = anon_sym_LBRACE_LBRACE,
  [anon_sym_RBRACE_RBRACE] = anon_sym_RBRACE_RBRACE,
  [aux_sym_variable_name_token1] = aux_sym_variable_name_token1,
  [aux_sym_variable_name_token2] = aux_sym_variable_name_token2,
  [anon_sym_count] = anon_sym_count,
  [anon_sym_urlEncode] = anon_sym_urlEncode,
  [anon_sym_urlDecode] = anon_sym_urlDecode,
  [anon_sym_toInt] = anon_sym_toInt,
  [anon_sym_htmlEscape] = anon_sym_htmlEscape,
  [anon_sym_htmlUnescape] = anon_sym_htmlUnescape,
  [anon_sym_daysAfterNow] = anon_sym_daysAfterNow,
  [anon_sym_daysBeforeNow] = anon_sym_daysBeforeNow,
  [anon_sym_decode] = anon_sym_decode,
  [anon_sym_format] = anon_sym_format,
  [anon_sym_toDate] = anon_sym_toDate,
  [anon_sym_nth] = anon_sym_nth,
  [anon_sym_replace] = anon_sym_replace,
  [anon_sym_split] = anon_sym_split,
  [sym__alphanum] = sym__alphanum,
  [aux_sym_digit_token1] = aux_sym_digit_token1,
  [aux_sym_hexdigit_token1] = aux_sym_hexdigit_token1,
  [anon_sym_DOT] = anon_sym_DOT,
  [anon_sym_e] = anon_sym_e,
  [anon_sym_E] = anon_sym_E,
  [anon_sym_PLUS] = anon_sym_PLUS,
  [anon_sym_DASH] = anon_sym_DASH,
  [sym_comment] = sym_comment,
  [anon_sym_SLASH] = anon_sym_SLASH,
  [sym_regex_text] = sym_regex_text,
  [aux_sym_regex_escaped_char_token1] = aux_sym_regex_escaped_char_token1,
  [sym_hurl_file] = sym_hurl_file,
  [sym_entry] = sym_entry,
  [sym__comment_or_new_line] = sym__comment_or_new_line,
  [sym_request] = sym_request,
  [sym_response] = sym_response,
  [sym_method] = sym_method,
  [sym_version] = sym_version,
  [sym_status] = sym_status,
  [sym_header] = sym_header,
  [sym_body] = sym_body,
  [sym_request_section] = sym_request_section,
  [sym_response_section] = sym_response_section,
  [sym_basic_auth_section] = sym_basic_auth_section,
  [sym_query_string_params_section] = sym_query_string_params_section,
  [sym_form_params_section] = sym_form_params_section,
  [sym_multipart_form_data_section] = sym_multipart_form_data_section,
  [sym_cookies_section] = sym_cookies_section,
  [sym_captures_section] = sym_captures_section,
  [sym_asserts_section] = sym_asserts_section,
  [sym_options_section] = sym_options_section,
  [sym_key_value] = sym_key_value,
  [sym_multipart_form_data_param] = sym_multipart_form_data_param,
  [sym_file_param] = sym_file_param,
  [sym_file_value] = sym_file_value,
  [sym_capture] = sym_capture,
  [sym_assert] = sym_assert,
  [sym_option] = sym_option,
  [sym_ca_certificate_option] = sym_ca_certificate_option,
  [sym_cert_option] = sym_cert_option,
  [sym_filename_password] = sym_filename_password,
  [sym_filename_password_escaped_char] = sym_filename_password_escaped_char,
  [sym_boolean_option] = sym_boolean_option,
  [sym_boolean_option_key] = sym_boolean_option_key,
  [sym_integer_option] = sym_integer_option,
  [sym_integer_option_key] = sym_integer_option_key,
  [sym_duration_option] = sym_duration_option,
  [sym_duration_option_key] = sym_duration_option_key,
  [sym_duration_unit] = sym_duration_unit,
  [sym_string_option] = sym_string_option,
  [sym_string_option_key] = sym_string_option_key,
  [sym_variable_option] = sym_variable_option,
  [sym_variable_definition] = sym_variable_definition,
  [sym_variable_value] = sym_variable_value,
  [sym_query] = sym_query,
  [sym_simple_query] = sym_simple_query,
  [sym_header_query] = sym_header_query,
  [sym_cookie_query] = sym_cookie_query,
  [sym_xpath_query] = sym_xpath_query,
  [sym_jsonpath_query] = sym_jsonpath_query,
  [sym_regex_query] = sym_regex_query,
  [sym_variable_query] = sym_variable_query,
  [sym_predicate] = sym_predicate,
  [sym_predicate_func] = sym_predicate_func,
  [sym_simple_predicate] = sym_simple_predicate,
  [sym_equal_predicate] = sym_equal_predicate,
  [sym_not_equal_predicate] = sym_not_equal_predicate,
  [sym_greater_predicate] = sym_greater_predicate,
  [sym_greater_or_equal_predicate] = sym_greater_or_equal_predicate,
  [sym_less_predicate] = sym_less_predicate,
  [sym_less_or_equal_predicate] = sym_less_or_equal_predicate,
  [sym_start_with_predicate] = sym_start_with_predicate,
  [sym_end_with_predicate] = sym_end_with_predicate,
  [sym_contain_predicate] = sym_contain_predicate,
  [sym_match_predicate] = sym_match_predicate,
  [sym_include_predicate] = sym_include_predicate,
  [sym_predicate_value] = sym_predicate_value,
  [sym_bytes] = sym_bytes,
  [sym_xml] = sym_xml,
  [sym_xml_prolog_tag] = sym_xml_prolog_tag,
  [sym_xml_tag] = sym_xml_tag,
  [sym_xml_open_tag] = sym_xml_open_tag,
  [sym_xml_close_tag] = sym_xml_close_tag,
  [sym_oneline_base64] = sym_oneline_base64,
  [sym_oneline_file] = sym_oneline_file,
  [sym_oneline_hex] = sym_oneline_hex,
  [sym_quoted_string] = sym_quoted_string,
  [sym_quoted_string_content] = sym_quoted_string_content,
  [sym_invalid_quoted_string_escaped_char] = sym_invalid_quoted_string_escaped_char,
  [sym_quoted_string_escaped_char] = sym_quoted_string_escaped_char,
  [sym_key_string] = sym_key_string,
  [sym_key_string_content] = sym_key_string_content,
  [sym_key_string_escaped_char] = sym_key_string_escaped_char,
  [sym_xml_value_string] = sym_xml_value_string,
  [sym_value_string] = sym_value_string,
  [sym_value_string_content] = sym_value_string_content,
  [sym_value_string_text] = sym_value_string_text,
  [sym_value_string_escaped_char] = sym_value_string_escaped_char,
  [sym_oneline_string] = sym_oneline_string,
  [sym_oneline_string_content] = sym_oneline_string_content,
  [sym_oneline_string_text] = sym_oneline_string_text,
  [sym_oneline_string_escaped_char] = sym_oneline_string_escaped_char,
  [sym_multiline_string] = sym_multiline_string,
  [sym_multiline_string_type] = sym_multiline_string_type,
  [sym_multiline_string_content] = sym_multiline_string_content,
  [sym__multiline_string_text] = sym__multiline_string_text,
  [sym_multiline_string_escaped_char] = sym_multiline_string_escaped_char,
  [sym_filename] = sym_filename,
  [sym_filename_content] = sym_filename_content,
  [sym_filename_escaped_char] = sym_filename_escaped_char,
  [sym_unicode_char] = sym_unicode_char,
  [sym_json_value] = sym_json_value,
  [sym_json_object] = sym_json_object,
  [sym_json_key_value] = sym_json_key_value,
  [sym_json_key_string] = sym_json_key_string,
  [sym_json_array] = sym_json_array,
  [sym_json_string] = sym_json_string,
  [sym_json_string_content] = sym_json_string_content,
  [sym_json_string_text] = sym_json_string_text,
  [sym_json_string_escaped_char] = sym_json_string_escaped_char,
  [sym_json_number] = sym_json_number,
  [sym_json_boolean] = sym_json_boolean,
  [sym_template] = sym_template,
  [sym_expr] = sym_expr,
  [sym_variable_name] = sym_variable_name,
  [sym_filter] = sym_filter,
  [sym_simple_filter_key] = sym_simple_filter_key,
  [sym_regex_filter] = sym_regex_filter,
  [sym_nth_filter] = sym_nth_filter,
  [sym_replace_filter] = sym_replace_filter,
  [sym_split_filter] = sym_split_filter,
  [sym_xpath_filter] = sym_xpath_filter,
  [sym_boolean] = sym_boolean,
  [sym_integer] = sym_integer,
  [sym_json_integer] = sym_json_integer,
  [sym_float] = sym_float,
  [sym_digit] = sym_digit,
  [sym_json_digit] = sym_json_digit,
  [sym_hexdigit] = sym_hexdigit,
  [sym_json_hexdigit] = sym_json_hexdigit,
  [sym_fraction] = sym_fraction,
  [sym_json_fraction] = sym_json_fraction,
  [sym_json_exponent] = sym_json_exponent,
  [sym_regex] = sym_regex,
  [sym_regex_content] = sym_regex_content,
  [sym_regex_escaped_char] = sym_regex_escaped_char,
  [aux_sym_hurl_file_repeat1] = aux_sym_hurl_file_repeat1,
  [aux_sym_hurl_file_repeat2] = aux_sym_hurl_file_repeat2,
  [aux_sym__comment_or_new_line_repeat1] = aux_sym__comment_or_new_line_repeat1,
  [aux_sym_request_repeat1] = aux_sym_request_repeat1,
  [aux_sym_request_repeat2] = aux_sym_request_repeat2,
  [aux_sym_response_repeat1] = aux_sym_response_repeat1,
  [aux_sym_query_string_params_section_repeat1] = aux_sym_query_string_params_section_repeat1,
  [aux_sym_multipart_form_data_section_repeat1] = aux_sym_multipart_form_data_section_repeat1,
  [aux_sym_captures_section_repeat1] = aux_sym_captures_section_repeat1,
  [aux_sym_asserts_section_repeat1] = aux_sym_asserts_section_repeat1,
  [aux_sym_options_section_repeat1] = aux_sym_options_section_repeat1,
  [aux_sym_capture_repeat1] = aux_sym_capture_repeat1,
  [aux_sym_filename_password_repeat1] = aux_sym_filename_password_repeat1,
  [aux_sym_xml_repeat1] = aux_sym_xml_repeat1,
  [aux_sym_xml_tag_repeat1] = aux_sym_xml_tag_repeat1,
  [aux_sym_oneline_hex_repeat1] = aux_sym_oneline_hex_repeat1,
  [aux_sym_quoted_string_repeat1] = aux_sym_quoted_string_repeat1,
  [aux_sym_quoted_string_content_repeat1] = aux_sym_quoted_string_content_repeat1,
  [aux_sym_key_string_repeat1] = aux_sym_key_string_repeat1,
  [aux_sym_key_string_content_repeat1] = aux_sym_key_string_content_repeat1,
  [aux_sym_xml_value_string_repeat1] = aux_sym_xml_value_string_repeat1,
  [aux_sym_value_string_repeat1] = aux_sym_value_string_repeat1,
  [aux_sym_value_string_content_repeat1] = aux_sym_value_string_content_repeat1,
  [aux_sym_value_string_text_repeat1] = aux_sym_value_string_text_repeat1,
  [aux_sym_oneline_string_repeat1] = aux_sym_oneline_string_repeat1,
  [aux_sym_oneline_string_content_repeat1] = aux_sym_oneline_string_content_repeat1,
  [aux_sym_multiline_string_repeat1] = aux_sym_multiline_string_repeat1,
  [aux_sym_multiline_string_content_repeat1] = aux_sym_multiline_string_content_repeat1,
  [aux_sym__multiline_string_text_repeat1] = aux_sym__multiline_string_text_repeat1,
  [aux_sym_filename_repeat1] = aux_sym_filename_repeat1,
  [aux_sym_filename_content_repeat1] = aux_sym_filename_content_repeat1,
  [aux_sym_json_object_repeat1] = aux_sym_json_object_repeat1,
  [aux_sym_json_array_repeat1] = aux_sym_json_array_repeat1,
  [aux_sym_json_string_repeat1] = aux_sym_json_string_repeat1,
  [aux_sym_json_string_text_repeat1] = aux_sym_json_string_text_repeat1,
  [aux_sym_integer_repeat1] = aux_sym_integer_repeat1,
  [aux_sym_json_integer_repeat1] = aux_sym_json_integer_repeat1,
  [aux_sym_regex_content_repeat1] = aux_sym_regex_content_repeat1,
  [anon_alias_sym_json_key_string] = anon_alias_sym_json_key_string,
};

static const TSSymbolMetadata ts_symbol_metadata[] = {
  [ts_builtin_sym_end] = {
    .visible = false,
    .named = true,
  },
  [anon_sym_LF] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_GET] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_HEAD] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_POST] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_PUT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_DELETE] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_CONNECT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_OPTIONS] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_TRACE] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_PATCH] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LINK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_UNLINK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_PURGE] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LOCK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_UNLOCK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_PROPFIND] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_VIEW] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_method_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_HTTP_SLASH1_DOT0] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_HTTP_SLASH1_DOT1] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_HTTP_SLASH2] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_HTTP_SLASH3] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_HTTP_SLASH_STAR] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_HTTP] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_status_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_STAR] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LBRACKBasicAuth_RBRACK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LBRACKQuery_RBRACK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LBRACKQueryStringParams_RBRACK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LBRACKForm_RBRACK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LBRACKFormParams_RBRACK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LBRACKMultipart_RBRACK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LBRACKMultipartFormData_RBRACK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LBRACKCookies_RBRACK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LBRACKCaptures_RBRACK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LBRACKAsserts_RBRACK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LBRACKOptions_RBRACK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_COLON] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_null] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_file_COMMA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_SEMI] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_file_value_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_cacert] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_cert] = {
    .visible = true,
    .named = false,
  },
  [sym_filename_password_text] = {
    .visible = true,
    .named = true,
  },
  [anon_sym_BSLASH] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_b] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_f] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_n] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_r] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_t] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_u] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_POUND] = {
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
  [anon_sym_compressed] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_location] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_location_DASHtrusted] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_http1_DOT0] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_http2] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_http3] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_insecure] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_ipv4] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_ipv6] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_netrc] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_netrc_DASHoptional] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_path_DASHas_DASHis] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_skip] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_verbose] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_very_DASHverbose] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_max_DASHredirs] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_retry_DASHmax_DASHcount] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_limit_DASHrate] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_max_DASHtime] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_repeat] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_retry] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_connect_DASHtimeout] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_delay] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_retry_DASHinterval] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_ms] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_s] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_m] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_aws_DASHsigv4] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_key] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_connect_DASHto] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_header] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_netrc_DASHfile] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_output] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_pinnedpubkey] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_proxy] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_unix_DASHsocket] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_user] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_variable] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_EQ] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_status] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_url] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_body] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_duration] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_bytes] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_sha256] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_md5] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_cookie] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_xpath] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_jsonpath] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_regex] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_not] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_exists] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_isInteger] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_isFloat] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_isBoolean] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_isString] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_isCollection] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_isNumber] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_isIsoDate] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_isEmpty] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_isIpv4] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_isIpv6] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_isUuid] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_equals] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_EQ_EQ] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_notEquals] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_BANG_EQ] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_greaterThan] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_GT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_greaterThanOrEquals] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_GT_EQ] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_lessThan] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_lessThanOrEquals] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LT_EQ] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_startsWith] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_endsWith] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_contains] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_matches] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_includes] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LT_QMARK] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_xml_prolog_tag_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_QMARK_GT] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_xml_open_tag_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_LT_SLASH] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_xml_close_tag_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_base64_COMMA] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_oneline_base64_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_hex_COMMA] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_DQUOTE] = {
    .visible = true,
    .named = false,
  },
  [sym_quoted_string_text] = {
    .visible = true,
    .named = true,
  },
  [aux_sym_invalid_quoted_string_escaped_char_token1] = {
    .visible = false,
    .named = false,
  },
  [sym_key_string_text] = {
    .visible = true,
    .named = true,
  },
  [aux_sym_value_string_text_token1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_oneline_string_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_BQUOTE] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_oneline_string_text_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_BQUOTE_BQUOTE_BQUOTE] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_base64] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_hex] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_json] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_xml] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_graphql] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_multiline_string_type_token1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym__multiline_string_text_token1] = {
    .visible = false,
    .named = false,
  },
  [sym_filename_text] = {
    .visible = true,
    .named = true,
  },
  [aux_sym_filename_escaped_char_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_COMMA] = {
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
  [aux_sym_json_string_text_token1] = {
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
  [anon_sym_LBRACE_LBRACE] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_RBRACE_RBRACE] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_variable_name_token1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_variable_name_token2] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_count] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_urlEncode] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_urlDecode] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_toInt] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_htmlEscape] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_htmlUnescape] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_daysAfterNow] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_daysBeforeNow] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_decode] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_format] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_toDate] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_nth] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_replace] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_split] = {
    .visible = true,
    .named = false,
  },
  [sym__alphanum] = {
    .visible = false,
    .named = true,
  },
  [aux_sym_digit_token1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_hexdigit_token1] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_DOT] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_e] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_E] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_PLUS] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_DASH] = {
    .visible = true,
    .named = false,
  },
  [sym_comment] = {
    .visible = true,
    .named = true,
  },
  [anon_sym_SLASH] = {
    .visible = true,
    .named = false,
  },
  [sym_regex_text] = {
    .visible = true,
    .named = true,
  },
  [aux_sym_regex_escaped_char_token1] = {
    .visible = false,
    .named = false,
  },
  [sym_hurl_file] = {
    .visible = true,
    .named = true,
  },
  [sym_entry] = {
    .visible = true,
    .named = true,
  },
  [sym__comment_or_new_line] = {
    .visible = false,
    .named = true,
  },
  [sym_request] = {
    .visible = true,
    .named = true,
  },
  [sym_response] = {
    .visible = true,
    .named = true,
  },
  [sym_method] = {
    .visible = true,
    .named = true,
  },
  [sym_version] = {
    .visible = true,
    .named = true,
  },
  [sym_status] = {
    .visible = true,
    .named = true,
  },
  [sym_header] = {
    .visible = true,
    .named = true,
  },
  [sym_body] = {
    .visible = true,
    .named = true,
  },
  [sym_request_section] = {
    .visible = true,
    .named = true,
  },
  [sym_response_section] = {
    .visible = true,
    .named = true,
  },
  [sym_basic_auth_section] = {
    .visible = true,
    .named = true,
  },
  [sym_query_string_params_section] = {
    .visible = true,
    .named = true,
  },
  [sym_form_params_section] = {
    .visible = true,
    .named = true,
  },
  [sym_multipart_form_data_section] = {
    .visible = true,
    .named = true,
  },
  [sym_cookies_section] = {
    .visible = true,
    .named = true,
  },
  [sym_captures_section] = {
    .visible = true,
    .named = true,
  },
  [sym_asserts_section] = {
    .visible = true,
    .named = true,
  },
  [sym_options_section] = {
    .visible = true,
    .named = true,
  },
  [sym_key_value] = {
    .visible = true,
    .named = true,
  },
  [sym_multipart_form_data_param] = {
    .visible = true,
    .named = true,
  },
  [sym_file_param] = {
    .visible = true,
    .named = true,
  },
  [sym_file_value] = {
    .visible = true,
    .named = true,
  },
  [sym_capture] = {
    .visible = true,
    .named = true,
  },
  [sym_assert] = {
    .visible = true,
    .named = true,
  },
  [sym_option] = {
    .visible = true,
    .named = true,
  },
  [sym_ca_certificate_option] = {
    .visible = true,
    .named = true,
  },
  [sym_cert_option] = {
    .visible = true,
    .named = true,
  },
  [sym_filename_password] = {
    .visible = true,
    .named = true,
  },
  [sym_filename_password_escaped_char] = {
    .visible = true,
    .named = true,
  },
  [sym_boolean_option] = {
    .visible = true,
    .named = true,
  },
  [sym_boolean_option_key] = {
    .visible = true,
    .named = true,
  },
  [sym_integer_option] = {
    .visible = true,
    .named = true,
  },
  [sym_integer_option_key] = {
    .visible = true,
    .named = true,
  },
  [sym_duration_option] = {
    .visible = true,
    .named = true,
  },
  [sym_duration_option_key] = {
    .visible = true,
    .named = true,
  },
  [sym_duration_unit] = {
    .visible = true,
    .named = true,
  },
  [sym_string_option] = {
    .visible = true,
    .named = true,
  },
  [sym_string_option_key] = {
    .visible = true,
    .named = true,
  },
  [sym_variable_option] = {
    .visible = true,
    .named = true,
  },
  [sym_variable_definition] = {
    .visible = true,
    .named = true,
  },
  [sym_variable_value] = {
    .visible = true,
    .named = true,
  },
  [sym_query] = {
    .visible = true,
    .named = true,
  },
  [sym_simple_query] = {
    .visible = true,
    .named = true,
  },
  [sym_header_query] = {
    .visible = true,
    .named = true,
  },
  [sym_cookie_query] = {
    .visible = true,
    .named = true,
  },
  [sym_xpath_query] = {
    .visible = true,
    .named = true,
  },
  [sym_jsonpath_query] = {
    .visible = true,
    .named = true,
  },
  [sym_regex_query] = {
    .visible = true,
    .named = true,
  },
  [sym_variable_query] = {
    .visible = true,
    .named = true,
  },
  [sym_predicate] = {
    .visible = true,
    .named = true,
  },
  [sym_predicate_func] = {
    .visible = true,
    .named = true,
  },
  [sym_simple_predicate] = {
    .visible = true,
    .named = true,
  },
  [sym_equal_predicate] = {
    .visible = true,
    .named = true,
  },
  [sym_not_equal_predicate] = {
    .visible = true,
    .named = true,
  },
  [sym_greater_predicate] = {
    .visible = true,
    .named = true,
  },
  [sym_greater_or_equal_predicate] = {
    .visible = true,
    .named = true,
  },
  [sym_less_predicate] = {
    .visible = true,
    .named = true,
  },
  [sym_less_or_equal_predicate] = {
    .visible = true,
    .named = true,
  },
  [sym_start_with_predicate] = {
    .visible = true,
    .named = true,
  },
  [sym_end_with_predicate] = {
    .visible = true,
    .named = true,
  },
  [sym_contain_predicate] = {
    .visible = true,
    .named = true,
  },
  [sym_match_predicate] = {
    .visible = true,
    .named = true,
  },
  [sym_include_predicate] = {
    .visible = true,
    .named = true,
  },
  [sym_predicate_value] = {
    .visible = true,
    .named = true,
  },
  [sym_bytes] = {
    .visible = true,
    .named = true,
  },
  [sym_xml] = {
    .visible = true,
    .named = true,
  },
  [sym_xml_prolog_tag] = {
    .visible = true,
    .named = true,
  },
  [sym_xml_tag] = {
    .visible = true,
    .named = true,
  },
  [sym_xml_open_tag] = {
    .visible = true,
    .named = true,
  },
  [sym_xml_close_tag] = {
    .visible = true,
    .named = true,
  },
  [sym_oneline_base64] = {
    .visible = true,
    .named = true,
  },
  [sym_oneline_file] = {
    .visible = true,
    .named = true,
  },
  [sym_oneline_hex] = {
    .visible = true,
    .named = true,
  },
  [sym_quoted_string] = {
    .visible = true,
    .named = true,
  },
  [sym_quoted_string_content] = {
    .visible = true,
    .named = true,
  },
  [sym_invalid_quoted_string_escaped_char] = {
    .visible = true,
    .named = true,
  },
  [sym_quoted_string_escaped_char] = {
    .visible = true,
    .named = true,
  },
  [sym_key_string] = {
    .visible = true,
    .named = true,
  },
  [sym_key_string_content] = {
    .visible = true,
    .named = true,
  },
  [sym_key_string_escaped_char] = {
    .visible = true,
    .named = true,
  },
  [sym_xml_value_string] = {
    .visible = true,
    .named = true,
  },
  [sym_value_string] = {
    .visible = true,
    .named = true,
  },
  [sym_value_string_content] = {
    .visible = true,
    .named = true,
  },
  [sym_value_string_text] = {
    .visible = true,
    .named = true,
  },
  [sym_value_string_escaped_char] = {
    .visible = true,
    .named = true,
  },
  [sym_oneline_string] = {
    .visible = true,
    .named = true,
  },
  [sym_oneline_string_content] = {
    .visible = true,
    .named = true,
  },
  [sym_oneline_string_text] = {
    .visible = true,
    .named = true,
  },
  [sym_oneline_string_escaped_char] = {
    .visible = true,
    .named = true,
  },
  [sym_multiline_string] = {
    .visible = true,
    .named = true,
  },
  [sym_multiline_string_type] = {
    .visible = true,
    .named = true,
  },
  [sym_multiline_string_content] = {
    .visible = true,
    .named = true,
  },
  [sym__multiline_string_text] = {
    .visible = false,
    .named = true,
  },
  [sym_multiline_string_escaped_char] = {
    .visible = true,
    .named = true,
  },
  [sym_filename] = {
    .visible = true,
    .named = true,
  },
  [sym_filename_content] = {
    .visible = true,
    .named = true,
  },
  [sym_filename_escaped_char] = {
    .visible = true,
    .named = true,
  },
  [sym_unicode_char] = {
    .visible = true,
    .named = true,
  },
  [sym_json_value] = {
    .visible = true,
    .named = true,
  },
  [sym_json_object] = {
    .visible = true,
    .named = true,
  },
  [sym_json_key_value] = {
    .visible = true,
    .named = true,
  },
  [sym_json_key_string] = {
    .visible = true,
    .named = true,
  },
  [sym_json_array] = {
    .visible = true,
    .named = true,
  },
  [sym_json_string] = {
    .visible = true,
    .named = true,
  },
  [sym_json_string_content] = {
    .visible = true,
    .named = true,
  },
  [sym_json_string_text] = {
    .visible = true,
    .named = true,
  },
  [sym_json_string_escaped_char] = {
    .visible = true,
    .named = true,
  },
  [sym_json_number] = {
    .visible = true,
    .named = true,
  },
  [sym_json_boolean] = {
    .visible = true,
    .named = true,
  },
  [sym_template] = {
    .visible = true,
    .named = true,
  },
  [sym_expr] = {
    .visible = true,
    .named = true,
  },
  [sym_variable_name] = {
    .visible = true,
    .named = true,
  },
  [sym_filter] = {
    .visible = true,
    .named = true,
  },
  [sym_simple_filter_key] = {
    .visible = true,
    .named = true,
  },
  [sym_regex_filter] = {
    .visible = true,
    .named = true,
  },
  [sym_nth_filter] = {
    .visible = true,
    .named = true,
  },
  [sym_replace_filter] = {
    .visible = true,
    .named = true,
  },
  [sym_split_filter] = {
    .visible = true,
    .named = true,
  },
  [sym_xpath_filter] = {
    .visible = true,
    .named = true,
  },
  [sym_boolean] = {
    .visible = true,
    .named = true,
  },
  [sym_integer] = {
    .visible = true,
    .named = true,
  },
  [sym_json_integer] = {
    .visible = true,
    .named = true,
  },
  [sym_float] = {
    .visible = true,
    .named = true,
  },
  [sym_digit] = {
    .visible = true,
    .named = true,
  },
  [sym_json_digit] = {
    .visible = true,
    .named = true,
  },
  [sym_hexdigit] = {
    .visible = true,
    .named = true,
  },
  [sym_json_hexdigit] = {
    .visible = true,
    .named = true,
  },
  [sym_fraction] = {
    .visible = true,
    .named = true,
  },
  [sym_json_fraction] = {
    .visible = true,
    .named = true,
  },
  [sym_json_exponent] = {
    .visible = true,
    .named = true,
  },
  [sym_regex] = {
    .visible = true,
    .named = true,
  },
  [sym_regex_content] = {
    .visible = true,
    .named = true,
  },
  [sym_regex_escaped_char] = {
    .visible = true,
    .named = true,
  },
  [aux_sym_hurl_file_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_hurl_file_repeat2] = {
    .visible = false,
    .named = false,
  },
  [aux_sym__comment_or_new_line_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_request_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_request_repeat2] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_response_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_query_string_params_section_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_multipart_form_data_section_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_captures_section_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_asserts_section_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_options_section_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_capture_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_filename_password_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_xml_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_xml_tag_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_oneline_hex_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_quoted_string_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_quoted_string_content_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_key_string_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_key_string_content_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_xml_value_string_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_value_string_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_value_string_content_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_value_string_text_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_oneline_string_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_oneline_string_content_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_multiline_string_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_multiline_string_content_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym__multiline_string_text_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_filename_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_filename_content_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_json_object_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_json_array_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_json_string_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_json_string_text_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_integer_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_json_integer_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_regex_content_repeat1] = {
    .visible = false,
    .named = false,
  },
  [anon_alias_sym_json_key_string] = {
    .visible = true,
    .named = false,
  },
};

enum ts_field_identifiers {
  field_filter_key = 1,
  field_option_key = 2,
  field_predicate_name = 3,
  field_query_name = 4,
  field_section_header = 5,
  field_template = 6,
};

static const char * const ts_field_names[] = {
  [0] = NULL,
  [field_filter_key] = "filter_key",
  [field_option_key] = "option_key",
  [field_predicate_name] = "predicate_name",
  [field_query_name] = "query_name",
  [field_section_header] = "section_header",
  [field_template] = "template",
};

static const TSFieldMapSlice ts_field_map_slices[PRODUCTION_ID_COUNT] = {
  [1] = {.index = 0, .length = 3},
  [2] = {.index = 3, .length = 1},
  [3] = {.index = 4, .length = 1},
  [5] = {.index = 5, .length = 1},
  [6] = {.index = 6, .length = 1},
  [7] = {.index = 7, .length = 1},
};

static const TSFieldMapEntry ts_field_map_entries[] = {
  [0] =
    {field_template, 0},
    {field_template, 1},
    {field_template, 2},
  [3] =
    {field_filter_key, 0},
  [4] =
    {field_section_header, 0},
  [5] =
    {field_query_name, 0},
  [6] =
    {field_option_key, 0},
  [7] =
    {field_predicate_name, 0},
};

static const TSSymbol ts_alias_sequences[PRODUCTION_ID_COUNT][MAX_ALIAS_SEQUENCE_LENGTH] = {
  [0] = {0},
  [4] = {
    [0] = anon_alias_sym_json_key_string,
  },
};

static const uint16_t ts_non_terminal_alias_map[] = {
  sym_json_string, 2,
    sym_json_string,
    anon_alias_sym_json_key_string,
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
  [10] = 10,
  [11] = 11,
  [12] = 12,
  [13] = 13,
  [14] = 14,
  [15] = 15,
  [16] = 16,
  [17] = 17,
  [18] = 18,
  [19] = 19,
  [20] = 20,
  [21] = 21,
  [22] = 22,
  [23] = 23,
  [24] = 24,
  [25] = 25,
  [26] = 26,
  [27] = 27,
  [28] = 28,
  [29] = 29,
  [30] = 30,
  [31] = 31,
  [32] = 32,
  [33] = 33,
  [34] = 34,
  [35] = 35,
  [36] = 36,
  [37] = 37,
  [38] = 38,
  [39] = 39,
  [40] = 9,
  [41] = 10,
  [42] = 42,
  [43] = 43,
  [44] = 44,
  [45] = 45,
  [46] = 10,
  [47] = 9,
  [48] = 48,
  [49] = 49,
  [50] = 50,
  [51] = 51,
  [52] = 52,
  [53] = 53,
  [54] = 54,
  [55] = 55,
  [56] = 56,
  [57] = 57,
  [58] = 58,
  [59] = 59,
  [60] = 60,
  [61] = 24,
  [62] = 62,
  [63] = 63,
  [64] = 64,
  [65] = 65,
  [66] = 66,
  [67] = 67,
  [68] = 68,
  [69] = 69,
  [70] = 70,
  [71] = 71,
  [72] = 72,
  [73] = 73,
  [74] = 74,
  [75] = 75,
  [76] = 76,
  [77] = 77,
  [78] = 9,
  [79] = 10,
  [80] = 80,
  [81] = 81,
  [82] = 43,
  [83] = 83,
  [84] = 84,
  [85] = 85,
  [86] = 86,
  [87] = 87,
  [88] = 88,
  [89] = 89,
  [90] = 90,
  [91] = 91,
  [92] = 38,
  [93] = 93,
  [94] = 94,
  [95] = 95,
  [96] = 96,
  [97] = 97,
  [98] = 44,
  [99] = 99,
  [100] = 45,
  [101] = 101,
  [102] = 102,
  [103] = 103,
  [104] = 104,
  [105] = 105,
  [106] = 106,
  [107] = 107,
  [108] = 52,
  [109] = 109,
  [110] = 39,
  [111] = 111,
  [112] = 112,
  [113] = 113,
  [114] = 39,
  [115] = 115,
  [116] = 116,
  [117] = 95,
  [118] = 118,
  [119] = 9,
  [120] = 120,
  [121] = 10,
  [122] = 122,
  [123] = 123,
  [124] = 124,
  [125] = 125,
  [126] = 126,
  [127] = 127,
  [128] = 128,
  [129] = 129,
  [130] = 126,
  [131] = 53,
  [132] = 68,
  [133] = 64,
  [134] = 58,
  [135] = 59,
  [136] = 63,
  [137] = 70,
  [138] = 71,
  [139] = 65,
  [140] = 73,
  [141] = 67,
  [142] = 62,
  [143] = 55,
  [144] = 54,
  [145] = 72,
  [146] = 74,
  [147] = 60,
  [148] = 56,
  [149] = 57,
  [150] = 150,
  [151] = 150,
  [152] = 152,
  [153] = 153,
  [154] = 152,
  [155] = 155,
  [156] = 156,
  [157] = 157,
  [158] = 158,
  [159] = 159,
  [160] = 160,
  [161] = 161,
  [162] = 162,
  [163] = 163,
  [164] = 164,
  [165] = 165,
  [166] = 166,
  [167] = 167,
  [168] = 168,
  [169] = 169,
  [170] = 170,
  [171] = 171,
  [172] = 172,
  [173] = 173,
  [174] = 174,
  [175] = 175,
  [176] = 176,
  [177] = 172,
  [178] = 175,
  [179] = 170,
  [180] = 180,
  [181] = 181,
  [182] = 182,
  [183] = 183,
  [184] = 174,
  [185] = 185,
  [186] = 186,
  [187] = 187,
  [188] = 188,
  [189] = 189,
  [190] = 190,
  [191] = 191,
  [192] = 190,
  [193] = 193,
  [194] = 186,
  [195] = 195,
  [196] = 196,
  [197] = 196,
  [198] = 185,
  [199] = 199,
  [200] = 200,
  [201] = 201,
  [202] = 202,
  [203] = 203,
  [204] = 204,
  [205] = 205,
  [206] = 206,
  [207] = 207,
  [208] = 208,
  [209] = 209,
  [210] = 210,
  [211] = 211,
  [212] = 191,
  [213] = 213,
  [214] = 214,
  [215] = 215,
  [216] = 216,
  [217] = 217,
  [218] = 218,
  [219] = 219,
  [220] = 214,
  [221] = 221,
  [222] = 222,
  [223] = 223,
  [224] = 224,
  [225] = 225,
  [226] = 226,
  [227] = 195,
  [228] = 228,
  [229] = 229,
  [230] = 230,
  [231] = 231,
  [232] = 232,
  [233] = 233,
  [234] = 232,
  [235] = 235,
  [236] = 236,
  [237] = 209,
  [238] = 238,
  [239] = 239,
  [240] = 240,
  [241] = 235,
  [242] = 242,
  [243] = 243,
  [244] = 240,
  [245] = 245,
  [246] = 207,
  [247] = 231,
  [248] = 248,
  [249] = 249,
  [250] = 250,
  [251] = 251,
  [252] = 243,
  [253] = 10,
  [254] = 254,
  [255] = 255,
  [256] = 256,
  [257] = 257,
  [258] = 228,
  [259] = 259,
  [260] = 260,
  [261] = 261,
  [262] = 262,
  [263] = 257,
  [264] = 264,
  [265] = 265,
  [266] = 266,
  [267] = 251,
  [268] = 233,
  [269] = 269,
  [270] = 270,
  [271] = 271,
  [272] = 272,
  [273] = 273,
  [274] = 274,
  [275] = 275,
  [276] = 9,
  [277] = 277,
  [278] = 278,
  [279] = 257,
  [280] = 280,
  [281] = 281,
  [282] = 270,
  [283] = 283,
  [284] = 284,
  [285] = 285,
  [286] = 286,
  [287] = 242,
  [288] = 254,
  [289] = 257,
  [290] = 290,
  [291] = 291,
  [292] = 292,
  [293] = 257,
  [294] = 254,
  [295] = 257,
  [296] = 296,
  [297] = 297,
  [298] = 298,
  [299] = 230,
  [300] = 300,
  [301] = 301,
  [302] = 302,
  [303] = 303,
  [304] = 304,
  [305] = 305,
  [306] = 306,
  [307] = 307,
  [308] = 308,
  [309] = 286,
  [310] = 310,
  [311] = 311,
  [312] = 312,
  [313] = 313,
  [314] = 314,
  [315] = 315,
  [316] = 316,
  [317] = 296,
  [318] = 248,
  [319] = 300,
  [320] = 320,
  [321] = 257,
  [322] = 254,
  [323] = 323,
  [324] = 324,
  [325] = 325,
  [326] = 326,
  [327] = 327,
  [328] = 305,
  [329] = 329,
  [330] = 330,
  [331] = 331,
  [332] = 332,
  [333] = 257,
  [334] = 307,
  [335] = 257,
  [336] = 336,
  [337] = 308,
  [338] = 338,
  [339] = 339,
  [340] = 340,
  [341] = 257,
  [342] = 342,
  [343] = 343,
  [344] = 344,
  [345] = 345,
  [346] = 346,
  [347] = 347,
  [348] = 348,
  [349] = 349,
  [350] = 350,
  [351] = 351,
  [352] = 352,
  [353] = 353,
  [354] = 354,
  [355] = 343,
  [356] = 354,
  [357] = 357,
  [358] = 358,
  [359] = 359,
  [360] = 360,
  [361] = 361,
  [362] = 362,
  [363] = 360,
  [364] = 345,
  [365] = 360,
  [366] = 366,
  [367] = 360,
  [368] = 368,
  [369] = 369,
  [370] = 370,
  [371] = 360,
  [372] = 372,
  [373] = 373,
  [374] = 374,
  [375] = 375,
  [376] = 375,
  [377] = 377,
  [378] = 378,
  [379] = 379,
  [380] = 380,
  [381] = 353,
  [382] = 382,
  [383] = 360,
  [384] = 384,
  [385] = 385,
  [386] = 370,
  [387] = 387,
  [388] = 350,
  [389] = 360,
  [390] = 368,
  [391] = 360,
  [392] = 360,
  [393] = 393,
  [394] = 394,
  [395] = 361,
  [396] = 396,
  [397] = 397,
  [398] = 360,
  [399] = 399,
  [400] = 400,
  [401] = 401,
  [402] = 402,
  [403] = 403,
  [404] = 404,
  [405] = 405,
  [406] = 406,
  [407] = 407,
  [408] = 254,
  [409] = 409,
  [410] = 257,
  [411] = 411,
  [412] = 360,
  [413] = 413,
  [414] = 414,
  [415] = 346,
  [416] = 416,
  [417] = 417,
  [418] = 418,
  [419] = 419,
  [420] = 420,
  [421] = 420,
  [422] = 420,
  [423] = 420,
  [424] = 424,
  [425] = 424,
  [426] = 424,
  [427] = 424,
  [428] = 428,
  [429] = 428,
  [430] = 428,
  [431] = 428,
  [432] = 432,
  [433] = 432,
  [434] = 434,
  [435] = 432,
  [436] = 432,
  [437] = 437,
  [438] = 259,
  [439] = 439,
  [440] = 440,
  [441] = 441,
  [442] = 420,
  [443] = 443,
  [444] = 444,
  [445] = 445,
  [446] = 446,
  [447] = 447,
  [448] = 448,
  [449] = 449,
  [450] = 450,
  [451] = 451,
  [452] = 450,
  [453] = 453,
  [454] = 440,
  [455] = 418,
  [456] = 428,
  [457] = 448,
  [458] = 424,
  [459] = 459,
  [460] = 460,
  [461] = 461,
  [462] = 462,
  [463] = 463,
  [464] = 464,
  [465] = 444,
  [466] = 443,
  [467] = 441,
  [468] = 419,
  [469] = 439,
  [470] = 432,
  [471] = 471,
  [472] = 472,
  [473] = 404,
  [474] = 474,
  [475] = 475,
  [476] = 476,
  [477] = 477,
  [478] = 478,
  [479] = 479,
  [480] = 480,
  [481] = 481,
  [482] = 482,
  [483] = 298,
  [484] = 484,
  [485] = 485,
  [486] = 486,
  [487] = 487,
  [488] = 488,
  [489] = 489,
  [490] = 490,
  [491] = 491,
  [492] = 492,
  [493] = 493,
  [494] = 494,
  [495] = 495,
  [496] = 496,
  [497] = 402,
  [498] = 498,
  [499] = 499,
  [500] = 274,
  [501] = 501,
  [502] = 502,
  [503] = 273,
  [504] = 369,
  [505] = 505,
  [506] = 506,
  [507] = 507,
  [508] = 508,
  [509] = 509,
  [510] = 510,
  [511] = 511,
  [512] = 306,
  [513] = 513,
  [514] = 366,
  [515] = 352,
  [516] = 516,
  [517] = 517,
  [518] = 518,
  [519] = 519,
  [520] = 520,
  [521] = 521,
  [522] = 522,
  [523] = 523,
  [524] = 524,
  [525] = 525,
  [526] = 505,
  [527] = 527,
  [528] = 362,
  [529] = 529,
  [530] = 530,
  [531] = 262,
  [532] = 532,
  [533] = 533,
  [534] = 349,
  [535] = 535,
  [536] = 536,
  [537] = 537,
  [538] = 538,
  [539] = 499,
  [540] = 540,
  [541] = 541,
  [542] = 542,
  [543] = 543,
  [544] = 332,
  [545] = 545,
  [546] = 546,
  [547] = 547,
  [548] = 533,
  [549] = 549,
  [550] = 521,
  [551] = 551,
  [552] = 378,
  [553] = 553,
  [554] = 554,
  [555] = 555,
  [556] = 556,
  [557] = 532,
  [558] = 505,
  [559] = 532,
  [560] = 505,
  [561] = 532,
  [562] = 505,
  [563] = 532,
  [564] = 505,
  [565] = 505,
  [566] = 505,
  [567] = 505,
  [568] = 505,
  [569] = 505,
  [570] = 570,
  [571] = 488,
  [572] = 572,
  [573] = 573,
  [574] = 574,
  [575] = 575,
  [576] = 348,
  [577] = 577,
  [578] = 578,
  [579] = 579,
  [580] = 580,
  [581] = 581,
  [582] = 574,
  [583] = 583,
  [584] = 584,
  [585] = 585,
  [586] = 586,
  [587] = 587,
  [588] = 588,
  [589] = 589,
  [590] = 590,
  [591] = 591,
  [592] = 592,
  [593] = 593,
  [594] = 594,
  [595] = 595,
  [596] = 596,
  [597] = 597,
  [598] = 598,
  [599] = 599,
};

static TSCharacterRange extras_character_set_1[] = {
  {'\t', '\t'}, {0x0b, '\r'}, {' ', ' '}, {0xa0, 0xa0}, {0x1680, 0x1680}, {0x2000, 0x200b}, {0x202f, 0x202f}, {0x205f, 0x2060},
  {0x3000, 0x3000}, {0xfeff, 0xfeff},
};

static TSCharacterRange extras_character_set_2[] = {
  {'\t', '\r'}, {' ', ' '}, {0xa0, 0xa0}, {0x1680, 0x1680}, {0x2000, 0x200b}, {0x202f, 0x202f}, {0x205f, 0x2060}, {0x3000, 0x3000},
  {0xfeff, 0xfeff},
};

static bool ts_lex(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (eof) ADVANCE(622);
      ADVANCE_MAP(
        '!', 65,
        '"', 879,
        '#', 772,
        '*', 731,
        '+', 1147,
        ',', 1105,
        '-', 1148,
        '.', 1143,
        '/', 1151,
        ':', 754,
        ';', 758,
        '<', 852,
        '=', 817,
        '>', 848,
        '?', 67,
        'E', 1146,
        '[', 1107,
        '\\', 765,
        ']', 1112,
        '`', 1067,
        'b', 766,
        'e', 1144,
        'f', 767,
        'm', 803,
        'n', 768,
        'r', 769,
        's', 801,
        't', 770,
        'u', 771,
        '{', 774,
        '}', 775,
        'a', 1125,
        'c', 1125,
        'd', 1125,
      );
      if (('A' <= lookahead && lookahead <= 'F')) ADVANCE(722);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(730);
      if (('g' <= lookahead && lookahead <= 'z')) ADVANCE(1125);
      if (('G' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(0);
      END_STATE();
    case 1:
      ADVANCE_MAP(
        '\n', 623,
        '#', 1150,
        '.', 1143,
        'E', 1145,
        'c', 403,
        'd', 109,
        'e', 1144,
        'f', 404,
        'h', 543,
        'm', 804,
        'n', 535,
        'r', 213,
        's', 802,
        't', 379,
        'u', 453,
        'x', 424,
      );
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(1141);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(1);
      END_STATE();
    case 2:
      if (lookahead == '\n') ADVANCE(623);
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == ':') ADVANCE(754);
      if (lookahead == '\\') ADVANCE(765);
      if (lookahead == '{') ADVANCE(613);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(2);
      END_STATE();
    case 3:
      if (lookahead == '\n') ADVANCE(623);
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == ':') ADVANCE(754);
      if (lookahead == '\\') ADVANCE(765);
      if (lookahead == '{') ADVANCE(613);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(2);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= ']') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 4:
      if (lookahead == '\n') ADVANCE(623);
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == 'm') ADVANCE(804);
      if (lookahead == 's') ADVANCE(801);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(4);
      END_STATE();
    case 5:
      if (lookahead == '\n') ADVANCE(623);
      if (lookahead == '#') ADVANCE(1150);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(5);
      if (lookahead == '+' ||
          lookahead == '-' ||
          ('/' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(759);
      END_STATE();
    case 6:
      if (lookahead == '\n') ADVANCE(624);
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == '\\') ADVANCE(765);
      if (lookahead == 'f') ADVANCE(1060);
      if (lookahead == 'n') ADVANCE(1062);
      if (lookahead == 't') ADVANCE(1061);
      if (lookahead == '{') ADVANCE(1063);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(1053);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1054);
      if (lookahead != 0) ADVANCE(1053);
      END_STATE();
    case 7:
      if (lookahead == '\n') SKIP(7);
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == '<') ADVANCE(853);
      if (lookahead == '{') ADVANCE(1063);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1057);
      if (lookahead != 0 &&
          lookahead != '\\') ADVANCE(1053);
      END_STATE();
    case 8:
      if (lookahead == '\n') SKIP(8);
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == '\\') ADVANCE(765);
      if (lookahead == '{') ADVANCE(1063);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1064);
      if (lookahead != 0) ADVANCE(1053);
      END_STATE();
    case 9:
      if (lookahead == '\n') SKIP(9);
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == '\\') ADVANCE(765);
      if (lookahead == '`') ADVANCE(1066);
      if (lookahead == '{') ADVANCE(1063);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1058);
      if (lookahead != 0) ADVANCE(1053);
      END_STATE();
    case 10:
      if (lookahead == '\n') ADVANCE(625);
      if (lookahead == ' ') SKIP(10);
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == '\\') ADVANCE(765);
      if (lookahead == '{') ADVANCE(1102);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1100);
      if (lookahead != 0 &&
          lookahead != ';') ADVANCE(1103);
      END_STATE();
    case 11:
      if (lookahead == '\n') SKIP(11);
      if (lookahead == '#') ADVANCE(1149);
      if (lookahead == '/') ADVANCE(1151);
      if (lookahead == '\\') ADVANCE(765);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1152);
      if (lookahead != 0) ADVANCE(1153);
      END_STATE();
    case 12:
      if (lookahead == '\n') ADVANCE(626);
      if (lookahead == '\r') SKIP(12);
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == '\\') ADVANCE(765);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(762);
      if (lookahead != 0 &&
          lookahead != ';' &&
          lookahead != '{' &&
          lookahead != '}') ADVANCE(764);
      END_STATE();
    case 13:
      if (lookahead == '\n') ADVANCE(876);
      if (lookahead == '#') ADVANCE(1150);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(13);
      if (('+' <= lookahead && lookahead <= '-') ||
          ('0' <= lookahead && lookahead <= '9') ||
          lookahead == '=' ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(877);
      END_STATE();
    case 14:
      if (lookahead == '\n') SKIP(14);
      if (lookahead == '#') ADVANCE(1150);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1155);
      if (lookahead != 0) ADVANCE(1154);
      END_STATE();
    case 15:
      if (lookahead == '\n') ADVANCE(627);
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == '\\') ADVANCE(765);
      if (lookahead == '{') ADVANCE(1063);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1055);
      if (lookahead != 0) ADVANCE(1053);
      END_STATE();
    case 16:
      if (lookahead == '\n') ADVANCE(628);
      if (lookahead == '#') ADVANCE(1098);
      if (lookahead == '\\') ADVANCE(765);
      if (lookahead == '`') ADVANCE(1067);
      if (lookahead == '{') ADVANCE(774);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1097);
      if (lookahead != 0) ADVANCE(1099);
      END_STATE();
    case 17:
      if (lookahead == '\n') ADVANCE(629);
      if (lookahead == '#') ADVANCE(1096);
      if (lookahead == 'b') ADVANCE(1081);
      if (lookahead == 'g') ADVANCE(1092);
      if (lookahead == 'h') ADVANCE(1082);
      if (lookahead == 'j') ADVANCE(1093);
      if (lookahead == 'x') ADVANCE(1087);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1077);
      if (lookahead != 0) ADVANCE(1096);
      END_STATE();
    case 18:
      if (lookahead == '\n') ADVANCE(630);
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == '\\') ADVANCE(765);
      if (lookahead == 'f') ADVANCE(1059);
      if (lookahead == 'n') ADVANCE(1062);
      if (lookahead == 't') ADVANCE(1061);
      if (lookahead == '{') ADVANCE(1063);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(1053);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1056);
      if (lookahead != 0) ADVANCE(1053);
      END_STATE();
    case 19:
      ADVANCE_MAP(
        '"', 879,
        '#', 1150,
        ',', 1105,
        '.', 1143,
        ':', 754,
        '<', 855,
        '=', 816,
        '>', 847,
        'E', 1145,
        ']', 1112,
        'b', 383,
        'c', 401,
        'd', 575,
        'e', 1144,
        'h', 242,
        'j', 493,
        'm', 178,
        'r', 216,
        's', 275,
        'u', 446,
        'v', 119,
        'x', 424,
        '{', 773,
        '}', 775,
      );
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(1141);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(19);
      END_STATE();
    case 20:
      ADVANCE_MAP(
        '"', 879,
        '#', 1150,
        '\\', 765,
        '`', 1066,
        'b', 766,
        'f', 767,
        'n', 768,
        'r', 769,
        't', 770,
        'u', 771,
      );
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(20);
      END_STATE();
    case 21:
      if (lookahead == '"') ADVANCE(879);
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == '\\') ADVANCE(765);
      if (lookahead == 'f') ADVANCE(967);
      if (lookahead == 'n') ADVANCE(1044);
      if (lookahead == 't') ADVANCE(1017);
      if (lookahead == '{') ADVANCE(613);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(1052);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(22);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('@' <= lookahead && lookahead <= ']') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 22:
      if (lookahead == '"') ADVANCE(879);
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == '\\') ADVANCE(765);
      if (lookahead == 'f') ADVANCE(101);
      if (lookahead == 'n') ADVANCE(571);
      if (lookahead == 't') ADVANCE(445);
      if (lookahead == '{') ADVANCE(613);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(1141);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(22);
      END_STATE();
    case 23:
      if (lookahead == '"') ADVANCE(879);
      if (lookahead == '#') ADVANCE(880);
      if (lookahead == '\\') ADVANCE(765);
      if (lookahead == '{') ADVANCE(882);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(881);
      if (lookahead != 0) ADVANCE(883);
      END_STATE();
    case 24:
      if (lookahead == '"') ADVANCE(879);
      if (lookahead == '#') ADVANCE(1116);
      if (lookahead == '\\') ADVANCE(765);
      if (lookahead == '{') ADVANCE(1115);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1114);
      if (lookahead != 0) ADVANCE(1113);
      END_STATE();
    case 25:
      ADVANCE_MAP(
        '"', 879,
        '#', 886,
        '\\', 765,
        'b', 766,
        'f', 767,
        'n', 768,
        'r', 769,
        't', 770,
        'u', 771,
      );
      if (lookahead == '\t' ||
          lookahead == '\f' ||
          lookahead == '\r') SKIP(25);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(885);
      if (lookahead != 0) ADVANCE(884);
      END_STATE();
    case 26:
      ADVANCE_MAP(
        '#', 772,
        ',', 1104,
        ':', 754,
        ';', 758,
        '\\', 765,
        '`', 1066,
        'b', 766,
        'f', 767,
        'n', 768,
        'r', 769,
        't', 770,
        'u', 771,
        '{', 773,
        '}', 775,
      );
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(26);
      END_STATE();
    case 27:
      ADVANCE_MAP(
        '#', 1150,
        '*', 731,
        '=', 816,
        'c', 403,
        'd', 109,
        'f', 404,
        'h', 543,
        'n', 535,
        'r', 213,
        's', 417,
        't', 379,
        'u', 453,
        'x', 424,
        '}', 614,
      );
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(730);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(27);
      END_STATE();
    case 28:
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == ':') ADVANCE(754);
      if (lookahead == '\\') ADVANCE(765);
      if (lookahead == '{') ADVANCE(613);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(28);
      END_STATE();
    case 29:
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == ':') ADVANCE(754);
      if (lookahead == '\\') ADVANCE(765);
      if (lookahead == '{') ADVANCE(613);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(28);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= ']') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 30:
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == ';') ADVANCE(758);
      if (lookahead == '\\') ADVANCE(765);
      if (lookahead == '{') ADVANCE(1102);
      if (lookahead == '\n' ||
          lookahead == ' ') SKIP(30);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1101);
      if (lookahead != 0) ADVANCE(1103);
      END_STATE();
    case 31:
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == ';') ADVANCE(758);
      if (lookahead == '}') ADVANCE(775);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'F') ||
          ('a' <= lookahead && lookahead <= 'f')) ADVANCE(1142);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(31);
      END_STATE();
    case 32:
      if (lookahead == '#') ADVANCE(1150);
      if (lookahead == '\\') ADVANCE(765);
      if (lookahead == '{') ADVANCE(613);
      if (lookahead == '\n' ||
          lookahead == '\r') SKIP(32);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(763);
      if (lookahead != 0 &&
          lookahead != ';' &&
          lookahead != '}') ADVANCE(764);
      END_STATE();
    case 33:
      if (lookahead == '#') ADVANCE(1150);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(33);
      if (('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1125);
      END_STATE();
    case 34:
      if (lookahead == '#') ADVANCE(864);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(865);
      if (lookahead != 0 &&
          lookahead != '?') ADVANCE(866);
      END_STATE();
    case 35:
      if (lookahead == '#') ADVANCE(868);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(869);
      if (lookahead != 0 &&
          lookahead != '/' &&
          lookahead != '?') ADVANCE(870);
      END_STATE();
    case 36:
      if (lookahead == '#') ADVANCE(1070);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1069);
      if (lookahead != 0 &&
          lookahead != '`') ADVANCE(1068);
      END_STATE();
    case 37:
      if (lookahead == '#') ADVANCE(872);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(873);
      if (lookahead != 0 &&
          lookahead != '/' &&
          lookahead != '>') ADVANCE(874);
      END_STATE();
    case 38:
      if (lookahead == '*') ADVANCE(727);
      if (lookahead == '1') ADVANCE(52);
      if (lookahead == '2') ADVANCE(725);
      if (lookahead == '3') ADVANCE(726);
      END_STATE();
    case 39:
      if (lookahead == ',') ADVANCE(878);
      END_STATE();
    case 40:
      if (lookahead == ',') ADVANCE(757);
      END_STATE();
    case 41:
      if (lookahead == ',') ADVANCE(875);
      END_STATE();
    case 42:
      if (lookahead == '-') ADVANCE(459);
      END_STATE();
    case 43:
      if (lookahead == '-') ADVANCE(594);
      END_STATE();
    case 44:
      if (lookahead == '-') ADVANCE(168);
      END_STATE();
    case 45:
      if (lookahead == '-') ADVANCE(298);
      END_STATE();
    case 46:
      if (lookahead == '-') ADVANCE(468);
      END_STATE();
    case 47:
      if (lookahead == '-') ADVANCE(500);
      END_STATE();
    case 48:
      if (lookahead == '-') ADVANCE(499);
      END_STATE();
    case 49:
      if (lookahead == '-') ADVANCE(530);
      END_STATE();
    case 50:
      if (lookahead == '-') ADVANCE(133);
      END_STATE();
    case 51:
      if (lookahead == '.') ADVANCE(53);
      END_STATE();
    case 52:
      if (lookahead == '.') ADVANCE(54);
      END_STATE();
    case 53:
      if (lookahead == '0') ADVANCE(779);
      END_STATE();
    case 54:
      if (lookahead == '0') ADVANCE(723);
      if (lookahead == '1') ADVANCE(724);
      END_STATE();
    case 55:
      if (lookahead == '1') ADVANCE(51);
      if (lookahead == '2') ADVANCE(780);
      if (lookahead == '3') ADVANCE(781);
      END_STATE();
    case 56:
      if (lookahead == '2') ADVANCE(62);
      END_STATE();
    case 57:
      if (lookahead == '4') ADVANCE(783);
      if (lookahead == '6') ADVANCE(784);
      END_STATE();
    case 58:
      if (lookahead == '4') ADVANCE(805);
      END_STATE();
    case 59:
      if (lookahead == '4') ADVANCE(839);
      if (lookahead == '6') ADVANCE(840);
      END_STATE();
    case 60:
      if (lookahead == '4') ADVANCE(41);
      END_STATE();
    case 61:
      if (lookahead == '5') ADVANCE(824);
      END_STATE();
    case 62:
      if (lookahead == '5') ADVANCE(64);
      END_STATE();
    case 63:
      if (lookahead == '6') ADVANCE(60);
      END_STATE();
    case 64:
      if (lookahead == '6') ADVANCE(823);
      END_STATE();
    case 65:
      if (lookahead == '=') ADVANCE(845);
      END_STATE();
    case 66:
      if (lookahead == '=') ADVANCE(843);
      END_STATE();
    case 67:
      if (lookahead == '>') ADVANCE(867);
      END_STATE();
    case 68:
      if (lookahead == 'A') ADVANCE(259);
      if (lookahead == 'B') ADVANCE(218);
      END_STATE();
    case 69:
      if (lookahead == 'A') ADVANCE(572);
      END_STATE();
    case 70:
      ADVANCE_MAP(
        'B', 396,
        'C', 394,
        'E', 347,
        'F', 325,
        'I', 372,
        'N', 576,
        'S', 552,
        'U', 580,
      );
      END_STATE();
    case 71:
      if (lookahead == 'D') ADVANCE(114);
      END_STATE();
    case 72:
      if (lookahead == 'D') ADVANCE(231);
      if (lookahead == 'E') ADVANCE(374);
      END_STATE();
    case 73:
      if (lookahead == 'D') ADVANCE(130);
      if (lookahead == 'I') ADVANCE(366);
      END_STATE();
    case 74:
      if (lookahead == 'D') ADVANCE(150);
      END_STATE();
    case 75:
      if (lookahead == 'E') ADVANCE(508);
      if (lookahead == 'U') ADVANCE(371);
      END_STATE();
    case 76:
      if (lookahead == 'E') ADVANCE(429);
      END_STATE();
    case 77:
      if (lookahead == 'E') ADVANCE(430);
      END_STATE();
    case 78:
      if (lookahead == 'F') ADVANCE(399);
      if (lookahead == ']') ADVANCE(742);
      END_STATE();
    case 79:
      if (lookahead == 'N') ADVANCE(384);
      END_STATE();
    case 80:
      if (lookahead == 'N') ADVANCE(387);
      END_STATE();
    case 81:
      if (lookahead == 'P') ADVANCE(112);
      if (lookahead == ']') ADVANCE(738);
      END_STATE();
    case 82:
      if (lookahead == 'P') ADVANCE(144);
      END_STATE();
    case 83:
      if (lookahead == 'S') ADVANCE(541);
      if (lookahead == ']') ADVANCE(734);
      END_STATE();
    case 84:
      if (lookahead == 'T') ADVANCE(276);
      END_STATE();
    case 85:
      if (lookahead == 'T') ADVANCE(277);
      END_STATE();
    case 86:
      if (lookahead == 'W') ADVANCE(300);
      END_STATE();
    case 87:
      if (lookahead == 'W') ADVANCE(301);
      END_STATE();
    case 88:
      if (lookahead == ']') ADVANCE(750);
      END_STATE();
    case 89:
      if (lookahead == ']') ADVANCE(746);
      END_STATE();
    case 90:
      if (lookahead == ']') ADVANCE(752);
      END_STATE();
    case 91:
      if (lookahead == ']') ADVANCE(748);
      END_STATE();
    case 92:
      if (lookahead == ']') ADVANCE(732);
      END_STATE();
    case 93:
      if (lookahead == ']') ADVANCE(740);
      END_STATE();
    case 94:
      if (lookahead == ']') ADVANCE(744);
      END_STATE();
    case 95:
      if (lookahead == ']') ADVANCE(736);
      END_STATE();
    case 96:
      if (lookahead == '`') ADVANCE(98);
      END_STATE();
    case 97:
      if (lookahead == '`') ADVANCE(98);
      if (lookahead != 0) ADVANCE(1065);
      END_STATE();
    case 98:
      if (lookahead == '`') ADVANCE(1071);
      END_STATE();
    case 99:
      if (lookahead == 'a') ADVANCE(56);
      END_STATE();
    case 100:
      if (lookahead == 'a') ADVANCE(157);
      END_STATE();
    case 101:
      if (lookahead == 'a') ADVANCE(322);
      END_STATE();
    case 102:
      if (lookahead == 'a') ADVANCE(322);
      if (lookahead == 'i') ADVANCE(320);
      END_STATE();
    case 103:
      if (lookahead == 'a') ADVANCE(322);
      if (lookahead == 'i') ADVANCE(320);
      if (lookahead == 'o') ADVANCE(448);
      END_STATE();
    case 104:
      if (lookahead == 'a') ADVANCE(340);
      END_STATE();
    case 105:
      if (lookahead == 'a') ADVANCE(175);
      if (lookahead == 'e') ADVANCE(455);
      if (lookahead == 'o') ADVANCE(338);
      END_STATE();
    case 106:
      if (lookahead == 'a') ADVANCE(600);
      END_STATE();
    case 107:
      if (lookahead == 'a') ADVANCE(471);
      END_STATE();
    case 108:
      if (lookahead == 'a') ADVANCE(612);
      if (lookahead == 'e') ADVANCE(165);
      END_STATE();
    case 109:
      if (lookahead == 'a') ADVANCE(612);
      if (lookahead == 'e') ADVANCE(164);
      END_STATE();
    case 110:
      if (lookahead == 'a') ADVANCE(189);
      END_STATE();
    case 111:
      if (lookahead == 'a') ADVANCE(189);
      if (lookahead == 'x') ADVANCE(39);
      END_STATE();
    case 112:
      if (lookahead == 'a') ADVANCE(440);
      END_STATE();
    case 113:
      if (lookahead == 'a') ADVANCE(607);
      END_STATE();
    case 114:
      if (lookahead == 'a') ADVANCE(536);
      END_STATE();
    case 115:
      if (lookahead == 'a') ADVANCE(170);
      END_STATE();
    case 116:
      if (lookahead == 'a') ADVANCE(94);
      END_STATE();
    case 117:
      if (lookahead == 'a') ADVANCE(420);
      END_STATE();
    case 118:
      if (lookahead == 'a') ADVANCE(529);
      END_STATE();
    case 119:
      if (lookahead == 'a') ADVANCE(451);
      END_STATE();
    case 120:
      if (lookahead == 'a') ADVANCE(451);
      if (lookahead == 'e') ADVANCE(434);
      END_STATE();
    case 121:
      if (lookahead == 'a') ADVANCE(317);
      END_STATE();
    case 122:
      if (lookahead == 'a') ADVANCE(532);
      END_STATE();
    case 123:
      if (lookahead == 'a') ADVANCE(494);
      END_STATE();
    case 124:
      if (lookahead == 'a') ADVANCE(494);
      if (lookahead == 'o') ADVANCE(182);
      if (lookahead == 'y') ADVANCE(559);
      END_STATE();
    case 125:
      if (lookahead == 'a') ADVANCE(318);
      END_STATE();
    case 126:
      if (lookahead == 'a') ADVANCE(537);
      if (lookahead == 'i') ADVANCE(370);
      if (lookahead == 'r') ADVANCE(386);
      END_STATE();
    case 127:
      if (lookahead == 'a') ADVANCE(352);
      END_STATE();
    case 128:
      if (lookahead == 'a') ADVANCE(353);
      END_STATE();
    case 129:
      if (lookahead == 'a') ADVANCE(354);
      END_STATE();
    case 130:
      if (lookahead == 'a') ADVANCE(551);
      END_STATE();
    case 131:
      if (lookahead == 'a') ADVANCE(302);
      END_STATE();
    case 132:
      if (lookahead == 'a') ADVANCE(520);
      END_STATE();
    case 133:
      if (lookahead == 'a') ADVANCE(496);
      END_STATE();
    case 134:
      if (lookahead == 'a') ADVANCE(522);
      END_STATE();
    case 135:
      if (lookahead == 'a') ADVANCE(547);
      END_STATE();
    case 136:
      if (lookahead == 'a') ADVANCE(527);
      END_STATE();
    case 137:
      if (lookahead == 'a') ADVANCE(415);
      END_STATE();
    case 138:
      if (lookahead == 'a') ADVANCE(415);
      if (lookahead == 'o') ADVANCE(377);
      END_STATE();
    case 139:
      if (lookahead == 'a') ADVANCE(326);
      END_STATE();
    case 140:
      if (lookahead == 'a') ADVANCE(539);
      END_STATE();
    case 141:
      if (lookahead == 'a') ADVANCE(341);
      END_STATE();
    case 142:
      if (lookahead == 'a') ADVANCE(602);
      END_STATE();
    case 143:
      if (lookahead == 'a') ADVANCE(450);
      END_STATE();
    case 144:
      if (lookahead == 'a') ADVANCE(465);
      END_STATE();
    case 145:
      if (lookahead == 'a') ADVANCE(422);
      END_STATE();
    case 146:
      if (lookahead == 'a') ADVANCE(554);
      END_STATE();
    case 147:
      if (lookahead == 'a') ADVANCE(328);
      END_STATE();
    case 148:
      if (lookahead == 'a') ADVANCE(329);
      END_STATE();
    case 149:
      if (lookahead == 'a') ADVANCE(330);
      END_STATE();
    case 150:
      if (lookahead == 'a') ADVANCE(557);
      END_STATE();
    case 151:
      if (lookahead == 'a') ADVANCE(558);
      END_STATE();
    case 152:
      if (lookahead == 'a') ADVANCE(467);
      END_STATE();
    case 153:
      if (lookahead == 'a') ADVANCE(560);
      END_STATE();
    case 154:
      if (lookahead == 'a') ADVANCE(565);
      END_STATE();
    case 155:
      if (lookahead == 'b') ADVANCE(397);
      if (lookahead == 'y') ADVANCE(43);
      END_STATE();
    case 156:
      if (lookahead == 'b') ADVANCE(312);
      END_STATE();
    case 157:
      if (lookahead == 'b') ADVANCE(321);
      END_STATE();
    case 158:
      if (lookahead == 'b') ADVANCE(245);
      END_STATE();
    case 159:
      if (lookahead == 'b') ADVANCE(407);
      END_STATE();
    case 160:
      if (lookahead == 'c') ADVANCE(69);
      END_STATE();
    case 161:
      if (lookahead == 'c') ADVANCE(785);
      END_STATE();
    case 162:
      if (lookahead == 'c') ADVANCE(311);
      END_STATE();
    case 163:
      if (lookahead == 'c') ADVANCE(278);
      END_STATE();
    case 164:
      if (lookahead == 'c') ADVANCE(389);
      END_STATE();
    case 165:
      if (lookahead == 'c') ADVANCE(389);
      if (lookahead == 'l') ADVANCE(113);
      END_STATE();
    case 166:
      if (lookahead == 'c') ADVANCE(323);
      END_STATE();
    case 167:
      if (lookahead == 'c') ADVANCE(117);
      END_STATE();
    case 168:
      if (lookahead == 'c') ADVANCE(390);
      END_STATE();
    case 169:
      if (lookahead == 'c') ADVANCE(542);
      END_STATE();
    case 170:
      if (lookahead == 'c') ADVANCE(202);
      END_STATE();
    case 171:
      if (lookahead == 'c') ADVANCE(402);
      END_STATE();
    case 172:
      if (lookahead == 'c') ADVANCE(145);
      END_STATE();
    case 173:
      if (lookahead == 'c') ADVANCE(585);
      END_STATE();
    case 174:
      if (lookahead == 'c') ADVANCE(405);
      END_STATE();
    case 175:
      if (lookahead == 'c') ADVANCE(254);
      END_STATE();
    case 176:
      if (lookahead == 'c') ADVANCE(562);
      END_STATE();
    case 177:
      if (lookahead == 'c') ADVANCE(153);
      END_STATE();
    case 178:
      if (lookahead == 'd') ADVANCE(61);
      END_STATE();
    case 179:
      if (lookahead == 'd') ADVANCE(776);
      END_STATE();
    case 180:
      if (lookahead == 'd') ADVANCE(778);
      END_STATE();
    case 181:
      if (lookahead == 'd') ADVANCE(841);
      END_STATE();
    case 182:
      if (lookahead == 'd') ADVANCE(605);
      END_STATE();
    case 183:
      if (lookahead == 'd') ADVANCE(416);
      END_STATE();
    case 184:
      if (lookahead == 'd') ADVANCE(297);
      END_STATE();
    case 185:
      if (lookahead == 'd') ADVANCE(200);
      END_STATE();
    case 186:
      if (lookahead == 'd') ADVANCE(479);
      END_STATE();
    case 187:
      if (lookahead == 'd') ADVANCE(206);
      END_STATE();
    case 188:
      if (lookahead == 'd') ADVANCE(207);
      END_STATE();
    case 189:
      if (lookahead == 'd') ADVANCE(234);
      END_STATE();
    case 190:
      if (lookahead == 'd') ADVANCE(249);
      END_STATE();
    case 191:
      if (lookahead == 'e') ADVANCE(111);
      END_STATE();
    case 192:
      if (lookahead == 'e') ADVANCE(111);
      if (lookahead == 't') ADVANCE(343);
      END_STATE();
    case 193:
      if (lookahead == 'e') ADVANCE(63);
      END_STATE();
    case 194:
      if (lookahead == 'e') ADVANCE(599);
      END_STATE();
    case 195:
      if (lookahead == 'e') ADVANCE(1117);
      END_STATE();
    case 196:
      if (lookahead == 'e') ADVANCE(1119);
      END_STATE();
    case 197:
      if (lookahead == 'e') ADVANCE(825);
      END_STATE();
    case 198:
      if (lookahead == 'e') ADVANCE(815);
      END_STATE();
    case 199:
      if (lookahead == 'e') ADVANCE(265);
      END_STATE();
    case 200:
      if (lookahead == 'e') ADVANCE(1135);
      END_STATE();
    case 201:
      if (lookahead == 'e') ADVANCE(1137);
      END_STATE();
    case 202:
      if (lookahead == 'e') ADVANCE(1139);
      END_STATE();
    case 203:
      if (lookahead == 'e') ADVANCE(789);
      END_STATE();
    case 204:
      if (lookahead == 'e') ADVANCE(782);
      END_STATE();
    case 205:
      if (lookahead == 'e') ADVANCE(794);
      END_STATE();
    case 206:
      if (lookahead == 'e') ADVANCE(1129);
      END_STATE();
    case 207:
      if (lookahead == 'e') ADVANCE(1128);
      END_STATE();
    case 208:
      if (lookahead == 'e') ADVANCE(1131);
      END_STATE();
    case 209:
      if (lookahead == 'e') ADVANCE(793);
      END_STATE();
    case 210:
      if (lookahead == 'e') ADVANCE(809);
      END_STATE();
    case 211:
      if (lookahead == 'e') ADVANCE(1132);
      END_STATE();
    case 212:
      if (lookahead == 'e') ADVANCE(790);
      END_STATE();
    case 213:
      if (lookahead == 'e') ADVANCE(266);
      END_STATE();
    case 214:
      if (lookahead == 'e') ADVANCE(837);
      END_STATE();
    case 215:
      if (lookahead == 'e') ADVANCE(432);
      END_STATE();
    case 216:
      if (lookahead == 'e') ADVANCE(264);
      END_STATE();
    case 217:
      if (lookahead == 'e') ADVANCE(40);
      END_STATE();
    case 218:
      if (lookahead == 'e') ADVANCE(260);
      END_STATE();
    case 219:
      if (lookahead == 'e') ADVANCE(441);
      END_STATE();
    case 220:
      if (lookahead == 'e') ADVANCE(173);
      END_STATE();
    case 221:
      if (lookahead == 'e') ADVANCE(606);
      END_STATE();
    case 222:
      if (lookahead == 'e') ADVANCE(267);
      END_STATE();
    case 223:
      if (lookahead == 'e') ADVANCE(490);
      END_STATE();
    case 224:
      if (lookahead == 'e') ADVANCE(183);
      END_STATE();
    case 225:
      if (lookahead == 'e') ADVANCE(598);
      END_STATE();
    case 226:
      if (lookahead == 'e') ADVANCE(598);
      if (lookahead == 't') ADVANCE(342);
      END_STATE();
    case 227:
      if (lookahead == 'e') ADVANCE(169);
      END_STATE();
    case 228:
      if (lookahead == 'e') ADVANCE(184);
      END_STATE();
    case 229:
      if (lookahead == 'e') ADVANCE(492);
      END_STATE();
    case 230:
      if (lookahead == 'e') ADVANCE(179);
      END_STATE();
    case 231:
      if (lookahead == 'e') ADVANCE(171);
      END_STATE();
    case 232:
      if (lookahead == 'e') ADVANCE(610);
      END_STATE();
    case 233:
      if (lookahead == 'e') ADVANCE(180);
      END_STATE();
    case 234:
      if (lookahead == 'e') ADVANCE(433);
      END_STATE();
    case 235:
      if (lookahead == 'e') ADVANCE(473);
      END_STATE();
    case 236:
      if (lookahead == 'e') ADVANCE(176);
      END_STATE();
    case 237:
      if (lookahead == 'e') ADVANCE(409);
      END_STATE();
    case 238:
      if (lookahead == 'e') ADVANCE(435);
      END_STATE();
    case 239:
      if (lookahead == 'e') ADVANCE(443);
      END_STATE();
    case 240:
      if (lookahead == 'e') ADVANCE(436);
      END_STATE();
    case 241:
      if (lookahead == 'e') ADVANCE(128);
      END_STATE();
    case 242:
      if (lookahead == 'e') ADVANCE(110);
      END_STATE();
    case 243:
      if (lookahead == 'e') ADVANCE(444);
      END_STATE();
    case 244:
      if (lookahead == 'e') ADVANCE(469);
      END_STATE();
    case 245:
      if (lookahead == 'e') ADVANCE(437);
      END_STATE();
    case 246:
      if (lookahead == 'e') ADVANCE(523);
      END_STATE();
    case 247:
      if (lookahead == 'e') ADVANCE(438);
      END_STATE();
    case 248:
      if (lookahead == 'e') ADVANCE(483);
      END_STATE();
    case 249:
      if (lookahead == 'e') ADVANCE(485);
      END_STATE();
    case 250:
      if (lookahead == 'e') ADVANCE(509);
      END_STATE();
    case 251:
      if (lookahead == 'e') ADVANCE(80);
      END_STATE();
    case 252:
      if (lookahead == 'e') ADVANCE(548);
      if (lookahead == 't') ADVANCE(270);
      if (lookahead == 'u') ADVANCE(319);
      END_STATE();
    case 253:
      if (lookahead == 'e') ADVANCE(504);
      END_STATE();
    case 254:
      if (lookahead == 'e') ADVANCE(458);
      END_STATE();
    case 255:
      if (lookahead == 'e') ADVANCE(134);
      if (lookahead == 'l') ADVANCE(115);
      END_STATE();
    case 256:
      if (lookahead == 'e') ADVANCE(154);
      END_STATE();
    case 257:
      if (lookahead == 'e') ADVANCE(510);
      END_STATE();
    case 258:
      if (lookahead == 'f') ADVANCE(305);
      if (lookahead == 'o') ADVANCE(427);
      END_STATE();
    case 259:
      if (lookahead == 'f') ADVANCE(563);
      END_STATE();
    case 260:
      if (lookahead == 'f') ADVANCE(406);
      END_STATE();
    case 261:
      if (lookahead == 'g') ADVANCE(82);
      END_STATE();
    case 262:
      if (lookahead == 'g') ADVANCE(834);
      END_STATE();
    case 263:
      if (lookahead == 'g') ADVANCE(591);
      END_STATE();
    case 264:
      if (lookahead == 'g') ADVANCE(194);
      END_STATE();
    case 265:
      if (lookahead == 'g') ADVANCE(194);
      if (lookahead == 'p') ADVANCE(255);
      if (lookahead == 't') ADVANCE(452);
      END_STATE();
    case 266:
      if (lookahead == 'g') ADVANCE(194);
      if (lookahead == 'p') ADVANCE(324);
      END_STATE();
    case 267:
      if (lookahead == 'g') ADVANCE(247);
      END_STATE();
    case 268:
      if (lookahead == 'h') ADVANCE(826);
      END_STATE();
    case 269:
      if (lookahead == 'h') ADVANCE(827);
      END_STATE();
    case 270:
      if (lookahead == 'h') ADVANCE(1138);
      END_STATE();
    case 271:
      if (lookahead == 'h') ADVANCE(859);
      END_STATE();
    case 272:
      if (lookahead == 'h') ADVANCE(858);
      END_STATE();
    case 273:
      if (lookahead == 'h') ADVANCE(50);
      END_STATE();
    case 274:
      if (lookahead == 'h') ADVANCE(92);
      END_STATE();
    case 275:
      if (lookahead == 'h') ADVANCE(99);
      if (lookahead == 't') ADVANCE(140);
      END_STATE();
    case 276:
      if (lookahead == 'h') ADVANCE(127);
      END_STATE();
    case 277:
      if (lookahead == 'h') ADVANCE(129);
      END_STATE();
    case 278:
      if (lookahead == 'h') ADVANCE(248);
      END_STATE();
    case 279:
      if (lookahead == 'i') ADVANCE(160);
      END_STATE();
    case 280:
      if (lookahead == 'i') ADVANCE(423);
      END_STATE();
    case 281:
      if (lookahead == 'i') ADVANCE(223);
      END_STATE();
    case 282:
      if (lookahead == 'i') ADVANCE(349);
      END_STATE();
    case 283:
      if (lookahead == 'i') ADVANCE(378);
      END_STATE();
    case 284:
      if (lookahead == 'i') ADVANCE(263);
      END_STATE();
    case 285:
      if (lookahead == 'i') ADVANCE(344);
      if (lookahead == 'o') ADVANCE(177);
      END_STATE();
    case 286:
      if (lookahead == 'i') ADVANCE(603);
      END_STATE();
    case 287:
      if (lookahead == 'i') ADVANCE(388);
      END_STATE();
    case 288:
      if (lookahead == 'i') ADVANCE(345);
      END_STATE();
    case 289:
      if (lookahead == 'i') ADVANCE(414);
      END_STATE();
    case 290:
      if (lookahead == 'i') ADVANCE(100);
      END_STATE();
    case 291:
      if (lookahead == 'i') ADVANCE(392);
      END_STATE();
    case 292:
      if (lookahead == 'i') ADVANCE(197);
      END_STATE();
    case 293:
      if (lookahead == 'i') ADVANCE(181);
      END_STATE();
    case 294:
      if (lookahead == 'i') ADVANCE(356);
      END_STATE();
    case 295:
      if (lookahead == 'i') ADVANCE(538);
      END_STATE();
    case 296:
      if (lookahead == 'i') ADVANCE(517);
      END_STATE();
    case 297:
      if (lookahead == 'i') ADVANCE(460);
      END_STATE();
    case 298:
      if (lookahead == 'i') ADVANCE(478);
      END_STATE();
    case 299:
      if (lookahead == 'i') ADVANCE(507);
      END_STATE();
    case 300:
      if (lookahead == 'i') ADVANCE(544);
      END_STATE();
    case 301:
      if (lookahead == 'i') ADVANCE(546);
      END_STATE();
    case 302:
      if (lookahead == 'i') ADVANCE(369);
      END_STATE();
    case 303:
      if (lookahead == 'i') ADVANCE(346);
      if (lookahead == 'o') ADVANCE(807);
      END_STATE();
    case 304:
      if (lookahead == 'i') ADVANCE(393);
      END_STATE();
    case 305:
      if (lookahead == 'i') ADVANCE(327);
      END_STATE();
    case 306:
      if (lookahead == 'i') ADVANCE(375);
      if (lookahead == 'm') ADVANCE(142);
      END_STATE();
    case 307:
      if (lookahead == 'i') ADVANCE(395);
      END_STATE();
    case 308:
      if (lookahead == 'k') ADVANCE(281);
      END_STATE();
    case 309:
      if (lookahead == 'k') ADVANCE(292);
      END_STATE();
    case 310:
      if (lookahead == 'k') ADVANCE(289);
      if (lookahead == 'p') ADVANCE(334);
      END_STATE();
    case 311:
      if (lookahead == 'k') ADVANCE(246);
      END_STATE();
    case 312:
      if (lookahead == 'k') ADVANCE(232);
      END_STATE();
    case 313:
      if (lookahead == 'l') ADVANCE(819);
      END_STATE();
    case 314:
      if (lookahead == 'l') ADVANCE(755);
      END_STATE();
    case 315:
      if (lookahead == 'l') ADVANCE(72);
      END_STATE();
    case 316:
      if (lookahead == 'l') ADVANCE(75);
      END_STATE();
    case 317:
      if (lookahead == 'l') ADVANCE(786);
      END_STATE();
    case 318:
      if (lookahead == 'l') ADVANCE(799);
      END_STATE();
    case 319:
      if (lookahead == 'l') ADVANCE(314);
      END_STATE();
    case 320:
      if (lookahead == 'l') ADVANCE(217);
      END_STATE();
    case 321:
      if (lookahead == 'l') ADVANCE(198);
      END_STATE();
    case 322:
      if (lookahead == 'l') ADVANCE(498);
      END_STATE();
    case 323:
      if (lookahead == 'l') ADVANCE(577);
      END_STATE();
    case 324:
      if (lookahead == 'l') ADVANCE(115);
      END_STATE();
    case 325:
      if (lookahead == 'l') ADVANCE(410);
      END_STATE();
    case 326:
      if (lookahead == 'l') ADVANCE(481);
      END_STATE();
    case 327:
      if (lookahead == 'l') ADVANCE(210);
      END_STATE();
    case 328:
      if (lookahead == 'l') ADVANCE(486);
      END_STATE();
    case 329:
      if (lookahead == 'l') ADVANCE(487);
      END_STATE();
    case 330:
      if (lookahead == 'l') ADVANCE(488);
      END_STATE();
    case 331:
      if (lookahead == 'l') ADVANCE(241);
      END_STATE();
    case 332:
      if (lookahead == 'l') ADVANCE(236);
      END_STATE();
    case 333:
      if (lookahead == 'l') ADVANCE(534);
      END_STATE();
    case 334:
      if (lookahead == 'l') ADVANCE(296);
      END_STATE();
    case 335:
      if (lookahead == 'l') ADVANCE(332);
      END_STATE();
    case 336:
      if (lookahead == 'm') ADVANCE(81);
      END_STATE();
    case 337:
      if (lookahead == 'm') ADVANCE(71);
      END_STATE();
    case 338:
      if (lookahead == 'm') ADVANCE(419);
      if (lookahead == 'n') ADVANCE(363);
      if (lookahead == 'u') ADVANCE(361);
      END_STATE();
    case 339:
      if (lookahead == 'm') ADVANCE(158);
      END_STATE();
    case 340:
      if (lookahead == 'm') ADVANCE(495);
      END_STATE();
    case 341:
      if (lookahead == 'm') ADVANCE(497);
      END_STATE();
    case 342:
      if (lookahead == 'm') ADVANCE(316);
      END_STATE();
    case 343:
      if (lookahead == 'm') ADVANCE(316);
      if (lookahead == 't') ADVANCE(413);
      END_STATE();
    case 344:
      if (lookahead == 'm') ADVANCE(295);
      END_STATE();
    case 345:
      if (lookahead == 'm') ADVANCE(205);
      END_STATE();
    case 346:
      if (lookahead == 'm') ADVANCE(237);
      END_STATE();
    case 347:
      if (lookahead == 'm') ADVANCE(421);
      END_STATE();
    case 348:
      if (lookahead == 'm') ADVANCE(132);
      END_STATE();
    case 349:
      if (lookahead == 'n') ADVANCE(261);
      END_STATE();
    case 350:
      if (lookahead == 'n') ADVANCE(821);
      END_STATE();
    case 351:
      if (lookahead == 'n') ADVANCE(777);
      END_STATE();
    case 352:
      if (lookahead == 'n') ADVANCE(851);
      END_STATE();
    case 353:
      if (lookahead == 'n') ADVANCE(833);
      END_STATE();
    case 354:
      if (lookahead == 'n') ADVANCE(846);
      END_STATE();
    case 355:
      if (lookahead == 'n') ADVANCE(835);
      END_STATE();
    case 356:
      if (lookahead == 'n') ADVANCE(262);
      END_STATE();
    case 357:
      if (lookahead == 'n') ADVANCE(491);
      END_STATE();
    case 358:
      if (lookahead == 'n') ADVANCE(286);
      if (lookahead == 'r') ADVANCE(315);
      if (lookahead == 's') ADVANCE(238);
      END_STATE();
    case 359:
      if (lookahead == 'n') ADVANCE(186);
      if (lookahead == 'q') ADVANCE(581);
      if (lookahead == 'x') ADVANCE(299);
      END_STATE();
    case 360:
      if (lookahead == 'n') ADVANCE(166);
      if (lookahead == 's') ADVANCE(70);
      END_STATE();
    case 361:
      if (lookahead == 'n') ADVANCE(516);
      END_STATE();
    case 362:
      if (lookahead == 'n') ADVANCE(121);
      END_STATE();
    case 363:
      if (lookahead == 'n') ADVANCE(227);
      END_STATE();
    case 364:
      if (lookahead == 'n') ADVANCE(501);
      if (lookahead == 'p') ADVANCE(590);
      END_STATE();
    case 365:
      if (lookahead == 'n') ADVANCE(224);
      END_STATE();
    case 366:
      if (lookahead == 'n') ADVANCE(518);
      END_STATE();
    case 367:
      if (lookahead == 'n') ADVANCE(525);
      END_STATE();
    case 368:
      if (lookahead == 'n') ADVANCE(549);
      if (lookahead == 'u') ADVANCE(361);
      END_STATE();
    case 369:
      if (lookahead == 'n') ADVANCE(484);
      END_STATE();
    case 370:
      if (lookahead == 'n') ADVANCE(365);
      END_STATE();
    case 371:
      if (lookahead == 'n') ADVANCE(257);
      END_STATE();
    case 372:
      if (lookahead == 'n') ADVANCE(556);
      if (lookahead == 'p') ADVANCE(592);
      if (lookahead == 's') ADVANCE(411);
      END_STATE();
    case 373:
      if (lookahead == 'n') ADVANCE(425);
      END_STATE();
    case 374:
      if (lookahead == 'n') ADVANCE(174);
      END_STATE();
    case 375:
      if (lookahead == 'n') ADVANCE(564);
      END_STATE();
    case 376:
      if (lookahead == 'o') ADVANCE(431);
      END_STATE();
    case 377:
      if (lookahead == 'o') ADVANCE(308);
      END_STATE();
    case 378:
      if (lookahead == 'o') ADVANCE(357);
      END_STATE();
    case 379:
      if (lookahead == 'o') ADVANCE(73);
      END_STATE();
    case 380:
      if (lookahead == 'o') ADVANCE(73);
      if (lookahead == 'r') ADVANCE(574);
      END_STATE();
    case 381:
      if (lookahead == 'o') ADVANCE(368);
      END_STATE();
    case 382:
      if (lookahead == 'o') ADVANCE(377);
      END_STATE();
    case 383:
      if (lookahead == 'o') ADVANCE(182);
      if (lookahead == 'y') ADVANCE(559);
      END_STATE();
    case 384:
      if (lookahead == 'o') ADVANCE(595);
      END_STATE();
    case 385:
      if (lookahead == 'o') ADVANCE(373);
      END_STATE();
    case 386:
      if (lookahead == 'o') ADVANCE(601);
      END_STATE();
    case 387:
      if (lookahead == 'o') ADVANCE(596);
      END_STATE();
    case 388:
      if (lookahead == 'o') ADVANCE(350);
      END_STATE();
    case 389:
      if (lookahead == 'o') ADVANCE(185);
      END_STATE();
    case 390:
      if (lookahead == 'o') ADVANCE(586);
      END_STATE();
    case 391:
      if (lookahead == 'o') ADVANCE(162);
      END_STATE();
    case 392:
      if (lookahead == 'o') ADVANCE(351);
      END_STATE();
    case 393:
      if (lookahead == 'o') ADVANCE(362);
      END_STATE();
    case 394:
      if (lookahead == 'o') ADVANCE(335);
      END_STATE();
    case 395:
      if (lookahead == 'o') ADVANCE(355);
      END_STATE();
    case 396:
      if (lookahead == 'o') ADVANCE(408);
      END_STATE();
    case 397:
      if (lookahead == 'o') ADVANCE(502);
      END_STATE();
    case 398:
      if (lookahead == 'o') ADVANCE(526);
      if (lookahead == 't') ADVANCE(270);
      if (lookahead == 'u') ADVANCE(319);
      END_STATE();
    case 399:
      if (lookahead == 'o') ADVANCE(442);
      END_STATE();
    case 400:
      if (lookahead == 'o') ADVANCE(309);
      END_STATE();
    case 401:
      if (lookahead == 'o') ADVANCE(400);
      END_STATE();
    case 402:
      if (lookahead == 'o') ADVANCE(187);
      END_STATE();
    case 403:
      if (lookahead == 'o') ADVANCE(573);
      END_STATE();
    case 404:
      if (lookahead == 'o') ADVANCE(448);
      END_STATE();
    case 405:
      if (lookahead == 'o') ADVANCE(188);
      END_STATE();
    case 406:
      if (lookahead == 'o') ADVANCE(462);
      END_STATE();
    case 407:
      if (lookahead == 'o') ADVANCE(505);
      END_STATE();
    case 408:
      if (lookahead == 'o') ADVANCE(331);
      END_STATE();
    case 409:
      if (lookahead == 'o') ADVANCE(584);
      END_STATE();
    case 410:
      if (lookahead == 'o') ADVANCE(136);
      END_STATE();
    case 411:
      if (lookahead == 'o') ADVANCE(74);
      END_STATE();
    case 412:
      if (lookahead == 'p') ADVANCE(528);
      END_STATE();
    case 413:
      if (lookahead == 'p') ADVANCE(55);
      END_STATE();
    case 414:
      if (lookahead == 'p') ADVANCE(788);
      END_STATE();
    case 415:
      if (lookahead == 'p') ADVANCE(531);
      END_STATE();
    case 416:
      if (lookahead == 'p') ADVANCE(569);
      END_STATE();
    case 417:
      if (lookahead == 'p') ADVANCE(334);
      END_STATE();
    case 418:
      if (lookahead == 'p') ADVANCE(334);
      if (lookahead == 't') ADVANCE(152);
      END_STATE();
    case 419:
      if (lookahead == 'p') ADVANCE(456);
      END_STATE();
    case 420:
      if (lookahead == 'p') ADVANCE(208);
      END_STATE();
    case 421:
      if (lookahead == 'p') ADVANCE(545);
      END_STATE();
    case 422:
      if (lookahead == 'p') ADVANCE(211);
      END_STATE();
    case 423:
      if (lookahead == 'p') ADVANCE(143);
      END_STATE();
    case 424:
      if (lookahead == 'p') ADVANCE(118);
      END_STATE();
    case 425:
      if (lookahead == 'p') ADVANCE(122);
      END_STATE();
    case 426:
      if (lookahead == 'p') ADVANCE(582);
      END_STATE();
    case 427:
      if (lookahead == 'p') ADVANCE(561);
      END_STATE();
    case 428:
      if (lookahead == 'q') ADVANCE(587);
      END_STATE();
    case 429:
      if (lookahead == 'q') ADVANCE(588);
      END_STATE();
    case 430:
      if (lookahead == 'q') ADVANCE(589);
      END_STATE();
    case 431:
      if (lookahead == 'r') ADVANCE(336);
      END_STATE();
    case 432:
      if (lookahead == 'r') ADVANCE(604);
      END_STATE();
    case 433:
      if (lookahead == 'r') ADVANCE(808);
      END_STATE();
    case 434:
      if (lookahead == 'r') ADVANCE(155);
      END_STATE();
    case 435:
      if (lookahead == 'r') ADVANCE(814);
      END_STATE();
    case 436:
      if (lookahead == 'r') ADVANCE(79);
      END_STATE();
    case 437:
      if (lookahead == 'r') ADVANCE(836);
      END_STATE();
    case 438:
      if (lookahead == 'r') ADVANCE(831);
      END_STATE();
    case 439:
      if (lookahead == 'r') ADVANCE(76);
      END_STATE();
    case 440:
      if (lookahead == 'r') ADVANCE(104);
      END_STATE();
    case 441:
      if (lookahead == 'r') ADVANCE(533);
      END_STATE();
    case 442:
      if (lookahead == 'r') ADVANCE(337);
      END_STATE();
    case 443:
      if (lookahead == 'r') ADVANCE(159);
      END_STATE();
    case 444:
      if (lookahead == 'r') ADVANCE(593);
      END_STATE();
    case 445:
      if (lookahead == 'r') ADVANCE(574);
      END_STATE();
    case 446:
      if (lookahead == 'r') ADVANCE(313);
      END_STATE();
    case 447:
      if (lookahead == 'r') ADVANCE(282);
      END_STATE();
    case 448:
      if (lookahead == 'r') ADVANCE(348);
      END_STATE();
    case 449:
      if (lookahead == 'r') ADVANCE(161);
      END_STATE();
    case 450:
      if (lookahead == 'r') ADVANCE(514);
      END_STATE();
    case 451:
      if (lookahead == 'r') ADVANCE(290);
      END_STATE();
    case 452:
      if (lookahead == 'r') ADVANCE(609);
      END_STATE();
    case 453:
      if (lookahead == 'r') ADVANCE(315);
      END_STATE();
    case 454:
      if (lookahead == 'r') ADVANCE(151);
      END_STATE();
    case 455:
      if (lookahead == 'r') ADVANCE(515);
      END_STATE();
    case 456:
      if (lookahead == 'r') ADVANCE(250);
      END_STATE();
    case 457:
      if (lookahead == 'r') ADVANCE(294);
      END_STATE();
    case 458:
      if (lookahead == 'r') ADVANCE(519);
      END_STATE();
    case 459:
      if (lookahead == 'r') ADVANCE(228);
      if (lookahead == 't') ADVANCE(288);
      END_STATE();
    case 460:
      if (lookahead == 'r') ADVANCE(477);
      END_STATE();
    case 461:
      if (lookahead == 'r') ADVANCE(204);
      END_STATE();
    case 462:
      if (lookahead == 'r') ADVANCE(251);
      END_STATE();
    case 463:
      if (lookahead == 'r') ADVANCE(256);
      END_STATE();
    case 464:
      if (lookahead == 'r') ADVANCE(229);
      END_STATE();
    case 465:
      if (lookahead == 'r') ADVANCE(141);
      END_STATE();
    case 466:
      if (lookahead == 'r') ADVANCE(583);
      END_STATE();
    case 467:
      if (lookahead == 'r') ADVANCE(566);
      END_STATE();
    case 468:
      if (lookahead == 'r') ADVANCE(146);
      END_STATE();
    case 469:
      if (lookahead == 'r') ADVANCE(85);
      END_STATE();
    case 470:
      if (lookahead == 'r') ADVANCE(77);
      END_STATE();
    case 471:
      if (lookahead == 's') ADVANCE(279);
      END_STATE();
    case 472:
      if (lookahead == 's') ADVANCE(88);
      END_STATE();
    case 473:
      if (lookahead == 's') ADVANCE(822);
      END_STATE();
    case 474:
      if (lookahead == 's') ADVANCE(818);
      END_STATE();
    case 475:
      if (lookahead == 's') ADVANCE(47);
      END_STATE();
    case 476:
      if (lookahead == 's') ADVANCE(68);
      END_STATE();
    case 477:
      if (lookahead == 's') ADVANCE(791);
      END_STATE();
    case 478:
      if (lookahead == 's') ADVANCE(787);
      END_STATE();
    case 479:
      if (lookahead == 's') ADVANCE(86);
      END_STATE();
    case 480:
      if (lookahead == 's') ADVANCE(84);
      END_STATE();
    case 481:
      if (lookahead == 's') ADVANCE(842);
      END_STATE();
    case 482:
      if (lookahead == 's') ADVANCE(830);
      END_STATE();
    case 483:
      if (lookahead == 's') ADVANCE(861);
      END_STATE();
    case 484:
      if (lookahead == 's') ADVANCE(860);
      END_STATE();
    case 485:
      if (lookahead == 's') ADVANCE(862);
      END_STATE();
    case 486:
      if (lookahead == 's') ADVANCE(844);
      END_STATE();
    case 487:
      if (lookahead == 's') ADVANCE(856);
      END_STATE();
    case 488:
      if (lookahead == 's') ADVANCE(849);
      END_STATE();
    case 489:
      if (lookahead == 's') ADVANCE(506);
      END_STATE();
    case 490:
      if (lookahead == 's') ADVANCE(89);
      END_STATE();
    case 491:
      if (lookahead == 's') ADVANCE(90);
      END_STATE();
    case 492:
      if (lookahead == 's') ADVANCE(91);
      END_STATE();
    case 493:
      if (lookahead == 's') ADVANCE(385);
      END_STATE();
    case 494:
      if (lookahead == 's') ADVANCE(193);
      END_STATE();
    case 495:
      if (lookahead == 's') ADVANCE(93);
      END_STATE();
    case 496:
      if (lookahead == 's') ADVANCE(45);
      END_STATE();
    case 497:
      if (lookahead == 's') ADVANCE(95);
      END_STATE();
    case 498:
      if (lookahead == 's') ADVANCE(196);
      END_STATE();
    case 499:
      if (lookahead == 's') ADVANCE(391);
      END_STATE();
    case 500:
      if (lookahead == 's') ADVANCE(284);
      END_STATE();
    case 501:
      if (lookahead == 's') ADVANCE(220);
      END_STATE();
    case 502:
      if (lookahead == 's') ADVANCE(203);
      END_STATE();
    case 503:
      if (lookahead == 's') ADVANCE(230);
      END_STATE();
    case 504:
      if (lookahead == 's') ADVANCE(480);
      END_STATE();
    case 505:
      if (lookahead == 's') ADVANCE(212);
      END_STATE();
    case 506:
      if (lookahead == 's') ADVANCE(219);
      END_STATE();
    case 507:
      if (lookahead == 's') ADVANCE(553);
      END_STATE();
    case 508:
      if (lookahead == 's') ADVANCE(167);
      END_STATE();
    case 509:
      if (lookahead == 's') ADVANCE(503);
      END_STATE();
    case 510:
      if (lookahead == 's') ADVANCE(172);
      END_STATE();
    case 511:
      if (lookahead == 's') ADVANCE(555);
      END_STATE();
    case 512:
      if (lookahead == 's') ADVANCE(87);
      END_STATE();
    case 513:
      if (lookahead == 't') ADVANCE(274);
      END_STATE();
    case 514:
      if (lookahead == 't') ADVANCE(78);
      END_STATE();
    case 515:
      if (lookahead == 't') ADVANCE(761);
      END_STATE();
    case 516:
      if (lookahead == 't') ADVANCE(1127);
      END_STATE();
    case 517:
      if (lookahead == 't') ADVANCE(1140);
      END_STATE();
    case 518:
      if (lookahead == 't') ADVANCE(1130);
      END_STATE();
    case 519:
      if (lookahead == 't') ADVANCE(760);
      END_STATE();
    case 520:
      if (lookahead == 't') ADVANCE(1136);
      END_STATE();
    case 521:
      if (lookahead == 't') ADVANCE(810);
      END_STATE();
    case 522:
      if (lookahead == 't') ADVANCE(795);
      END_STATE();
    case 523:
      if (lookahead == 't') ADVANCE(813);
      END_STATE();
    case 524:
      if (lookahead == 't') ADVANCE(797);
      END_STATE();
    case 525:
      if (lookahead == 't') ADVANCE(792);
      END_STATE();
    case 526:
      if (lookahead == 't') ADVANCE(829);
      END_STATE();
    case 527:
      if (lookahead == 't') ADVANCE(832);
      END_STATE();
    case 528:
      if (lookahead == 't') ADVANCE(283);
      END_STATE();
    case 529:
      if (lookahead == 't') ADVANCE(268);
      END_STATE();
    case 530:
      if (lookahead == 't') ADVANCE(303);
      END_STATE();
    case 531:
      if (lookahead == 't') ADVANCE(570);
      END_STATE();
    case 532:
      if (lookahead == 't') ADVANCE(269);
      END_STATE();
    case 533:
      if (lookahead == 't') ADVANCE(472);
      END_STATE();
    case 534:
      if (lookahead == 't') ADVANCE(280);
      END_STATE();
    case 535:
      if (lookahead == 't') ADVANCE(270);
      END_STATE();
    case 536:
      if (lookahead == 't') ADVANCE(116);
      END_STATE();
    case 537:
      if (lookahead == 't') ADVANCE(273);
      END_STATE();
    case 538:
      if (lookahead == 't') ADVANCE(46);
      END_STATE();
    case 539:
      if (lookahead == 't') ADVANCE(579);
      END_STATE();
    case 540:
      if (lookahead == 't') ADVANCE(426);
      END_STATE();
    case 541:
      if (lookahead == 't') ADVANCE(447);
      END_STATE();
    case 542:
      if (lookahead == 't') ADVANCE(49);
      END_STATE();
    case 543:
      if (lookahead == 't') ADVANCE(342);
      END_STATE();
    case 544:
      if (lookahead == 't') ADVANCE(271);
      END_STATE();
    case 545:
      if (lookahead == 't') ADVANCE(611);
      END_STATE();
    case 546:
      if (lookahead == 't') ADVANCE(272);
      END_STATE();
    case 547:
      if (lookahead == 't') ADVANCE(163);
      END_STATE();
    case 548:
      if (lookahead == 't') ADVANCE(449);
      END_STATE();
    case 549:
      if (lookahead == 't') ADVANCE(131);
      END_STATE();
    case 550:
      if (lookahead == 't') ADVANCE(466);
      END_STATE();
    case 551:
      if (lookahead == 't') ADVANCE(201);
      END_STATE();
    case 552:
      if (lookahead == 't') ADVANCE(457);
      END_STATE();
    case 553:
      if (lookahead == 't') ADVANCE(482);
      END_STATE();
    case 554:
      if (lookahead == 't') ADVANCE(209);
      END_STATE();
    case 555:
      if (lookahead == 't') ADVANCE(233);
      END_STATE();
    case 556:
      if (lookahead == 't') ADVANCE(222);
      END_STATE();
    case 557:
      if (lookahead == 't') ADVANCE(214);
      END_STATE();
    case 558:
      if (lookahead == 't') ADVANCE(287);
      END_STATE();
    case 559:
      if (lookahead == 't') ADVANCE(235);
      END_STATE();
    case 560:
      if (lookahead == 't') ADVANCE(291);
      END_STATE();
    case 561:
      if (lookahead == 't') ADVANCE(304);
      END_STATE();
    case 562:
      if (lookahead == 't') ADVANCE(307);
      END_STATE();
    case 563:
      if (lookahead == 't') ADVANCE(240);
      END_STATE();
    case 564:
      if (lookahead == 't') ADVANCE(243);
      END_STATE();
    case 565:
      if (lookahead == 't') ADVANCE(244);
      END_STATE();
    case 566:
      if (lookahead == 't') ADVANCE(512);
      END_STATE();
    case 567:
      if (lookahead == 'u') ADVANCE(333);
      END_STATE();
    case 568:
      if (lookahead == 'u') ADVANCE(215);
      END_STATE();
    case 569:
      if (lookahead == 'u') ADVANCE(156);
      END_STATE();
    case 570:
      if (lookahead == 'u') ADVANCE(464);
      END_STATE();
    case 571:
      if (lookahead == 'u') ADVANCE(319);
      END_STATE();
    case 572:
      if (lookahead == 'u') ADVANCE(513);
      END_STATE();
    case 573:
      if (lookahead == 'u') ADVANCE(361);
      END_STATE();
    case 574:
      if (lookahead == 'u') ADVANCE(195);
      END_STATE();
    case 575:
      if (lookahead == 'u') ADVANCE(454);
      END_STATE();
    case 576:
      if (lookahead == 'u') ADVANCE(339);
      END_STATE();
    case 577:
      if (lookahead == 'u') ADVANCE(190);
      END_STATE();
    case 578:
      if (lookahead == 'u') ADVANCE(540);
      END_STATE();
    case 579:
      if (lookahead == 'u') ADVANCE(474);
      END_STATE();
    case 580:
      if (lookahead == 'u') ADVANCE(293);
      END_STATE();
    case 581:
      if (lookahead == 'u') ADVANCE(139);
      END_STATE();
    case 582:
      if (lookahead == 'u') ADVANCE(521);
      END_STATE();
    case 583:
      if (lookahead == 'u') ADVANCE(511);
      END_STATE();
    case 584:
      if (lookahead == 'u') ADVANCE(524);
      END_STATE();
    case 585:
      if (lookahead == 'u') ADVANCE(461);
      END_STATE();
    case 586:
      if (lookahead == 'u') ADVANCE(367);
      END_STATE();
    case 587:
      if (lookahead == 'u') ADVANCE(147);
      END_STATE();
    case 588:
      if (lookahead == 'u') ADVANCE(148);
      END_STATE();
    case 589:
      if (lookahead == 'u') ADVANCE(149);
      END_STATE();
    case 590:
      if (lookahead == 'v') ADVANCE(57);
      END_STATE();
    case 591:
      if (lookahead == 'v') ADVANCE(58);
      END_STATE();
    case 592:
      if (lookahead == 'v') ADVANCE(59);
      END_STATE();
    case 593:
      if (lookahead == 'v') ADVANCE(125);
      END_STATE();
    case 594:
      if (lookahead == 'v') ADVANCE(239);
      END_STATE();
    case 595:
      if (lookahead == 'w') ADVANCE(1133);
      END_STATE();
    case 596:
      if (lookahead == 'w') ADVANCE(1134);
      END_STATE();
    case 597:
      if (lookahead == 'w') ADVANCE(475);
      END_STATE();
    case 598:
      if (lookahead == 'x') ADVANCE(39);
      END_STATE();
    case 599:
      if (lookahead == 'x') ADVANCE(828);
      END_STATE();
    case 600:
      if (lookahead == 'x') ADVANCE(42);
      END_STATE();
    case 601:
      if (lookahead == 'x') ADVANCE(608);
      END_STATE();
    case 602:
      if (lookahead == 'x') ADVANCE(44);
      END_STATE();
    case 603:
      if (lookahead == 'x') ADVANCE(48);
      END_STATE();
    case 604:
      if (lookahead == 'y') ADVANCE(83);
      END_STATE();
    case 605:
      if (lookahead == 'y') ADVANCE(820);
      END_STATE();
    case 606:
      if (lookahead == 'y') ADVANCE(806);
      END_STATE();
    case 607:
      if (lookahead == 'y') ADVANCE(798);
      END_STATE();
    case 608:
      if (lookahead == 'y') ADVANCE(812);
      END_STATE();
    case 609:
      if (lookahead == 'y') ADVANCE(796);
      END_STATE();
    case 610:
      if (lookahead == 'y') ADVANCE(811);
      END_STATE();
    case 611:
      if (lookahead == 'y') ADVANCE(838);
      END_STATE();
    case 612:
      if (lookahead == 'y') ADVANCE(476);
      END_STATE();
    case 613:
      if (lookahead == '{') ADVANCE(1121);
      END_STATE();
    case 614:
      if (lookahead == '}') ADVANCE(1124);
      END_STATE();
    case 615:
      if (eof) ADVANCE(622);
      ADVANCE_MAP(
        '\n', 623,
        '"', 879,
        '#', 1150,
        '.', 1143,
        '<', 855,
        'C', 705,
        'D', 673,
        'G', 674,
        'H', 676,
        'L', 686,
        'O', 709,
        'P', 664,
        'T', 711,
        'U', 698,
        'V', 687,
        '[', 1108,
        '`', 97,
        'b', 124,
        'c', 401,
        'd', 575,
        'f', 102,
        'h', 191,
        'j', 493,
        'm', 178,
        'n', 571,
        'r', 216,
        's', 275,
        't', 445,
        'u', 446,
        'v', 119,
        'x', 424,
        '{', 774,
      );
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(1141);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(615);
      END_STATE();
    case 616:
      if (eof) ADVANCE(622);
      ADVANCE_MAP(
        '\n', 623,
        '"', 879,
        '#', 1150,
        '<', 855,
        'C', 705,
        'D', 673,
        'G', 674,
        'H', 675,
        'L', 686,
        'O', 709,
        'P', 664,
        'T', 711,
        'U', 698,
        'V', 687,
        '[', 1110,
        '\\', 765,
        '`', 97,
        'b', 123,
        'f', 102,
        'h', 225,
        'n', 571,
        't', 445,
        '{', 774,
      );
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(1141);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(616);
      END_STATE();
    case 617:
      if (eof) ADVANCE(622);
      ADVANCE_MAP(
        '\n', 623,
        '"', 879,
        '#', 1150,
        '<', 855,
        'C', 705,
        'D', 673,
        'G', 674,
        'H', 675,
        'L', 686,
        'O', 709,
        'P', 664,
        'T', 711,
        'U', 698,
        'V', 687,
        '[', 1110,
        '`', 97,
        'a', 597,
        'b', 123,
        'c', 105,
        'd', 108,
        'f', 103,
        'h', 192,
        'i', 364,
        'k', 221,
        'l', 285,
        'm', 106,
        'n', 252,
        'o', 578,
        'p', 126,
        'r', 199,
        's', 310,
        't', 380,
        'u', 358,
        'v', 120,
        'x', 424,
        '{', 774,
      );
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(1141);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(617);
      END_STATE();
    case 618:
      if (eof) ADVANCE(622);
      ADVANCE_MAP(
        '\n', 623,
        '"', 879,
        '#', 1150,
        '<', 855,
        'C', 705,
        'D', 673,
        'G', 674,
        'H', 676,
        'L', 686,
        'O', 709,
        'P', 664,
        'T', 711,
        'U', 698,
        'V', 687,
        '[', 1108,
        '\\', 765,
        '`', 97,
        'b', 123,
        'f', 102,
        'h', 225,
        'n', 571,
        't', 445,
        '{', 774,
      );
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(1141);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(618);
      END_STATE();
    case 619:
      if (eof) ADVANCE(622);
      ADVANCE_MAP(
        '\n', 623,
        '"', 879,
        '#', 1150,
        '<', 855,
        'C', 936,
        'D', 904,
        'G', 905,
        'H', 906,
        'L', 919,
        'O', 942,
        'P', 895,
        'T', 945,
        'U', 930,
        'V', 918,
        '[', 1111,
        '\\', 765,
        '`', 97,
        'b', 965,
        'f', 966,
        'h', 978,
        'n', 1044,
        't', 1017,
        '{', 774,
      );
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(1052);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(616);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('@' <= lookahead && lookahead <= ']') ||
          ('_' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 620:
      if (eof) ADVANCE(622);
      ADVANCE_MAP(
        '\n', 623,
        '"', 879,
        '#', 1150,
        '<', 855,
        'C', 936,
        'D', 904,
        'G', 905,
        'H', 907,
        'L', 919,
        'O', 942,
        'P', 895,
        'T', 945,
        'U', 930,
        'V', 918,
        '[', 1109,
        '\\', 765,
        '`', 97,
        'b', 965,
        'f', 966,
        'h', 978,
        'n', 1044,
        't', 1017,
        '{', 774,
      );
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(1052);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(618);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('@' <= lookahead && lookahead <= ']') ||
          ('_' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 621:
      if (eof) ADVANCE(622);
      ADVANCE_MAP(
        '!', 65,
        '"', 879,
        '#', 1150,
        '+', 1147,
        ',', 1105,
        '-', 1148,
        '/', 1151,
        ':', 754,
        ';', 758,
        '<', 854,
        '=', 66,
        '>', 848,
        '?', 67,
        '[', 1106,
        ']', 1112,
        '`', 96,
        'b', 123,
        'c', 381,
        'd', 109,
        'e', 359,
        'f', 103,
        'g', 463,
        'h', 226,
        'i', 360,
        'l', 253,
        'm', 135,
        'n', 398,
        'r', 213,
        's', 418,
        't', 380,
        'u', 453,
        'x', 424,
        '{', 774,
        '}', 614,
      );
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(1141);
      if (set_contains(extras_character_set_2, 9, lookahead)) SKIP(621);
      END_STATE();
    case 622:
      ACCEPT_TOKEN(ts_builtin_sym_end);
      END_STATE();
    case 623:
      ACCEPT_TOKEN(anon_sym_LF);
      if (lookahead == '\n') ADVANCE(623);
      END_STATE();
    case 624:
      ACCEPT_TOKEN(anon_sym_LF);
      if (lookahead == '\n') ADVANCE(624);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1054);
      END_STATE();
    case 625:
      ACCEPT_TOKEN(anon_sym_LF);
      if (lookahead == '\n') ADVANCE(625);
      if ((set_contains(extras_character_set_2, 9, lookahead)) &&
          lookahead != ' ') ADVANCE(1100);
      END_STATE();
    case 626:
      ACCEPT_TOKEN(anon_sym_LF);
      if (lookahead == '\n') ADVANCE(626);
      if ((set_contains(extras_character_set_2, 9, lookahead)) &&
          lookahead != '\r') ADVANCE(762);
      END_STATE();
    case 627:
      ACCEPT_TOKEN(anon_sym_LF);
      if (lookahead == '\n') ADVANCE(627);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1055);
      END_STATE();
    case 628:
      ACCEPT_TOKEN(anon_sym_LF);
      if (lookahead == '\n') ADVANCE(628);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1097);
      END_STATE();
    case 629:
      ACCEPT_TOKEN(anon_sym_LF);
      if (lookahead == '\n') ADVANCE(629);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1077);
      END_STATE();
    case 630:
      ACCEPT_TOKEN(anon_sym_LF);
      if (lookahead == '\n') ADVANCE(630);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1056);
      END_STATE();
    case 631:
      ACCEPT_TOKEN(anon_sym_GET);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 632:
      ACCEPT_TOKEN(anon_sym_GET);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 633:
      ACCEPT_TOKEN(anon_sym_HEAD);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 634:
      ACCEPT_TOKEN(anon_sym_HEAD);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 635:
      ACCEPT_TOKEN(anon_sym_POST);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 636:
      ACCEPT_TOKEN(anon_sym_POST);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 637:
      ACCEPT_TOKEN(anon_sym_PUT);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 638:
      ACCEPT_TOKEN(anon_sym_PUT);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 639:
      ACCEPT_TOKEN(anon_sym_DELETE);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 640:
      ACCEPT_TOKEN(anon_sym_DELETE);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 641:
      ACCEPT_TOKEN(anon_sym_CONNECT);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 642:
      ACCEPT_TOKEN(anon_sym_CONNECT);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 643:
      ACCEPT_TOKEN(anon_sym_OPTIONS);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 644:
      ACCEPT_TOKEN(anon_sym_OPTIONS);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 645:
      ACCEPT_TOKEN(anon_sym_TRACE);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 646:
      ACCEPT_TOKEN(anon_sym_TRACE);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 647:
      ACCEPT_TOKEN(anon_sym_PATCH);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 648:
      ACCEPT_TOKEN(anon_sym_PATCH);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 649:
      ACCEPT_TOKEN(anon_sym_LINK);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 650:
      ACCEPT_TOKEN(anon_sym_LINK);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 651:
      ACCEPT_TOKEN(anon_sym_UNLINK);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 652:
      ACCEPT_TOKEN(anon_sym_UNLINK);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 653:
      ACCEPT_TOKEN(anon_sym_PURGE);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 654:
      ACCEPT_TOKEN(anon_sym_PURGE);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 655:
      ACCEPT_TOKEN(anon_sym_LOCK);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 656:
      ACCEPT_TOKEN(anon_sym_LOCK);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 657:
      ACCEPT_TOKEN(anon_sym_UNLOCK);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 658:
      ACCEPT_TOKEN(anon_sym_UNLOCK);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 659:
      ACCEPT_TOKEN(anon_sym_PROPFIND);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 660:
      ACCEPT_TOKEN(anon_sym_PROPFIND);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 661:
      ACCEPT_TOKEN(anon_sym_VIEW);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 662:
      ACCEPT_TOKEN(anon_sym_VIEW);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 663:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'A') ADVANCE(671);
      if (('B' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 664:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'A') ADVANCE(718);
      if (lookahead == 'O') ADVANCE(713);
      if (lookahead == 'R') ADVANCE(704);
      if (lookahead == 'U') ADVANCE(710);
      if (('B' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 665:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'A') ADVANCE(670);
      if (('B' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 666:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'C') ADVANCE(685);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 667:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'C') ADVANCE(692);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 668:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'C') ADVANCE(694);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 669:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'C') ADVANCE(716);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 670:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'C') ADVANCE(679);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 671:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'D') ADVANCE(633);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 672:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'D') ADVANCE(659);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 673:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'E') ADVANCE(695);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 674:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'E') ADVANCE(714);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 675:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'E') ADVANCE(663);
      if (lookahead == 'T') ADVANCE(719);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 676:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'E') ADVANCE(663);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 677:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'E') ADVANCE(721);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 678:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'E') ADVANCE(653);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 679:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'E') ADVANCE(645);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 680:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'E') ADVANCE(639);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 681:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'E') ADVANCE(669);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 682:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'E') ADVANCE(720);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 683:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'F') ADVANCE(689);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 684:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'G') ADVANCE(678);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 685:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'H') ADVANCE(647);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 686:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'I') ADVANCE(697);
      if (lookahead == 'O') ADVANCE(667);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 687:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'I') ADVANCE(677);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 688:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'I') ADVANCE(701);
      if (lookahead == 'O') ADVANCE(668);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 689:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'I') ADVANCE(700);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 690:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'I') ADVANCE(706);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 691:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'K') ADVANCE(649);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 692:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'K') ADVANCE(655);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 693:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'K') ADVANCE(651);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 694:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'K') ADVANCE(657);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 695:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'L') ADVANCE(682);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 696:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'L') ADVANCE(688);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 697:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'N') ADVANCE(691);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 698:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'N') ADVANCE(696);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 699:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'N') ADVANCE(712);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 700:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'N') ADVANCE(672);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 701:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'N') ADVANCE(693);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 702:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'N') ADVANCE(703);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 703:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'N') ADVANCE(681);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 704:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'O') ADVANCE(707);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 705:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'O') ADVANCE(702);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 706:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'O') ADVANCE(699);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 707:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'P') ADVANCE(683);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 708:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'P') ADVANCE(728);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 709:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'P') ADVANCE(717);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 710:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'R') ADVANCE(684);
      if (lookahead == 'T') ADVANCE(637);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 711:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'R') ADVANCE(665);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 712:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'S') ADVANCE(643);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 713:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'S') ADVANCE(715);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 714:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'T') ADVANCE(631);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 715:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'T') ADVANCE(635);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 716:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'T') ADVANCE(641);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 717:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'T') ADVANCE(690);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 718:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'T') ADVANCE(666);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 719:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'T') ADVANCE(708);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 720:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'T') ADVANCE(680);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 721:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (lookahead == 'W') ADVANCE(661);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 722:
      ACCEPT_TOKEN(aux_sym_method_token1);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 723:
      ACCEPT_TOKEN(anon_sym_HTTP_SLASH1_DOT0);
      END_STATE();
    case 724:
      ACCEPT_TOKEN(anon_sym_HTTP_SLASH1_DOT1);
      END_STATE();
    case 725:
      ACCEPT_TOKEN(anon_sym_HTTP_SLASH2);
      END_STATE();
    case 726:
      ACCEPT_TOKEN(anon_sym_HTTP_SLASH3);
      END_STATE();
    case 727:
      ACCEPT_TOKEN(anon_sym_HTTP_SLASH_STAR);
      END_STATE();
    case 728:
      ACCEPT_TOKEN(anon_sym_HTTP);
      if (lookahead == '/') ADVANCE(38);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 729:
      ACCEPT_TOKEN(anon_sym_HTTP);
      if (lookahead == '/') ADVANCE(38);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          ('-' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 730:
      ACCEPT_TOKEN(aux_sym_status_token1);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(730);
      END_STATE();
    case 731:
      ACCEPT_TOKEN(anon_sym_STAR);
      END_STATE();
    case 732:
      ACCEPT_TOKEN(anon_sym_LBRACKBasicAuth_RBRACK);
      END_STATE();
    case 733:
      ACCEPT_TOKEN(anon_sym_LBRACKBasicAuth_RBRACK);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 734:
      ACCEPT_TOKEN(anon_sym_LBRACKQuery_RBRACK);
      END_STATE();
    case 735:
      ACCEPT_TOKEN(anon_sym_LBRACKQuery_RBRACK);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 736:
      ACCEPT_TOKEN(anon_sym_LBRACKQueryStringParams_RBRACK);
      END_STATE();
    case 737:
      ACCEPT_TOKEN(anon_sym_LBRACKQueryStringParams_RBRACK);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 738:
      ACCEPT_TOKEN(anon_sym_LBRACKForm_RBRACK);
      END_STATE();
    case 739:
      ACCEPT_TOKEN(anon_sym_LBRACKForm_RBRACK);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 740:
      ACCEPT_TOKEN(anon_sym_LBRACKFormParams_RBRACK);
      END_STATE();
    case 741:
      ACCEPT_TOKEN(anon_sym_LBRACKFormParams_RBRACK);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 742:
      ACCEPT_TOKEN(anon_sym_LBRACKMultipart_RBRACK);
      END_STATE();
    case 743:
      ACCEPT_TOKEN(anon_sym_LBRACKMultipart_RBRACK);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 744:
      ACCEPT_TOKEN(anon_sym_LBRACKMultipartFormData_RBRACK);
      END_STATE();
    case 745:
      ACCEPT_TOKEN(anon_sym_LBRACKMultipartFormData_RBRACK);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 746:
      ACCEPT_TOKEN(anon_sym_LBRACKCookies_RBRACK);
      END_STATE();
    case 747:
      ACCEPT_TOKEN(anon_sym_LBRACKCookies_RBRACK);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 748:
      ACCEPT_TOKEN(anon_sym_LBRACKCaptures_RBRACK);
      END_STATE();
    case 749:
      ACCEPT_TOKEN(anon_sym_LBRACKCaptures_RBRACK);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 750:
      ACCEPT_TOKEN(anon_sym_LBRACKAsserts_RBRACK);
      END_STATE();
    case 751:
      ACCEPT_TOKEN(anon_sym_LBRACKAsserts_RBRACK);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 752:
      ACCEPT_TOKEN(anon_sym_LBRACKOptions_RBRACK);
      END_STATE();
    case 753:
      ACCEPT_TOKEN(anon_sym_LBRACKOptions_RBRACK);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 754:
      ACCEPT_TOKEN(anon_sym_COLON);
      END_STATE();
    case 755:
      ACCEPT_TOKEN(anon_sym_null);
      END_STATE();
    case 756:
      ACCEPT_TOKEN(anon_sym_null);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 757:
      ACCEPT_TOKEN(anon_sym_file_COMMA);
      END_STATE();
    case 758:
      ACCEPT_TOKEN(anon_sym_SEMI);
      END_STATE();
    case 759:
      ACCEPT_TOKEN(aux_sym_file_value_token1);
      if (lookahead == '+' ||
          lookahead == '-' ||
          ('/' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(759);
      END_STATE();
    case 760:
      ACCEPT_TOKEN(anon_sym_cacert);
      END_STATE();
    case 761:
      ACCEPT_TOKEN(anon_sym_cert);
      END_STATE();
    case 762:
      ACCEPT_TOKEN(sym_filename_password_text);
      if (lookahead == '\n') ADVANCE(626);
      if ((set_contains(extras_character_set_2, 9, lookahead)) &&
          lookahead != '\r') ADVANCE(762);
      if (lookahead != 0 &&
          (lookahead < '\t' || '\r' < lookahead) &&
          lookahead != '#' &&
          lookahead != ';' &&
          lookahead != '\\' &&
          lookahead != '{' &&
          lookahead != '}') ADVANCE(764);
      END_STATE();
    case 763:
      ACCEPT_TOKEN(sym_filename_password_text);
      if ((set_contains(extras_character_set_1, 10, lookahead)) &&
          lookahead != '\r') ADVANCE(763);
      if (lookahead != 0 &&
          (lookahead < '\t' || '\r' < lookahead) &&
          lookahead != '#' &&
          lookahead != ';' &&
          lookahead != '\\' &&
          lookahead != '{' &&
          lookahead != '}') ADVANCE(764);
      END_STATE();
    case 764:
      ACCEPT_TOKEN(sym_filename_password_text);
      if (lookahead != 0 &&
          lookahead != '\n' &&
          lookahead != '\r' &&
          lookahead != '#' &&
          lookahead != ';' &&
          lookahead != '\\' &&
          lookahead != '{' &&
          lookahead != '}') ADVANCE(764);
      END_STATE();
    case 765:
      ACCEPT_TOKEN(anon_sym_BSLASH);
      END_STATE();
    case 766:
      ACCEPT_TOKEN(anon_sym_b);
      END_STATE();
    case 767:
      ACCEPT_TOKEN(anon_sym_f);
      END_STATE();
    case 768:
      ACCEPT_TOKEN(anon_sym_n);
      END_STATE();
    case 769:
      ACCEPT_TOKEN(anon_sym_r);
      END_STATE();
    case 770:
      ACCEPT_TOKEN(anon_sym_t);
      END_STATE();
    case 771:
      ACCEPT_TOKEN(anon_sym_u);
      END_STATE();
    case 772:
      ACCEPT_TOKEN(anon_sym_POUND);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1150);
      END_STATE();
    case 773:
      ACCEPT_TOKEN(anon_sym_LBRACE);
      END_STATE();
    case 774:
      ACCEPT_TOKEN(anon_sym_LBRACE);
      if (lookahead == '{') ADVANCE(1121);
      END_STATE();
    case 775:
      ACCEPT_TOKEN(anon_sym_RBRACE);
      END_STATE();
    case 776:
      ACCEPT_TOKEN(anon_sym_compressed);
      END_STATE();
    case 777:
      ACCEPT_TOKEN(anon_sym_location);
      if (lookahead == '-') ADVANCE(550);
      END_STATE();
    case 778:
      ACCEPT_TOKEN(anon_sym_location_DASHtrusted);
      END_STATE();
    case 779:
      ACCEPT_TOKEN(anon_sym_http1_DOT0);
      END_STATE();
    case 780:
      ACCEPT_TOKEN(anon_sym_http2);
      END_STATE();
    case 781:
      ACCEPT_TOKEN(anon_sym_http3);
      END_STATE();
    case 782:
      ACCEPT_TOKEN(anon_sym_insecure);
      END_STATE();
    case 783:
      ACCEPT_TOKEN(anon_sym_ipv4);
      END_STATE();
    case 784:
      ACCEPT_TOKEN(anon_sym_ipv6);
      END_STATE();
    case 785:
      ACCEPT_TOKEN(anon_sym_netrc);
      if (lookahead == '-') ADVANCE(258);
      END_STATE();
    case 786:
      ACCEPT_TOKEN(anon_sym_netrc_DASHoptional);
      END_STATE();
    case 787:
      ACCEPT_TOKEN(anon_sym_path_DASHas_DASHis);
      END_STATE();
    case 788:
      ACCEPT_TOKEN(anon_sym_skip);
      END_STATE();
    case 789:
      ACCEPT_TOKEN(anon_sym_verbose);
      END_STATE();
    case 790:
      ACCEPT_TOKEN(anon_sym_very_DASHverbose);
      END_STATE();
    case 791:
      ACCEPT_TOKEN(anon_sym_max_DASHredirs);
      END_STATE();
    case 792:
      ACCEPT_TOKEN(anon_sym_retry_DASHmax_DASHcount);
      END_STATE();
    case 793:
      ACCEPT_TOKEN(anon_sym_limit_DASHrate);
      END_STATE();
    case 794:
      ACCEPT_TOKEN(anon_sym_max_DASHtime);
      END_STATE();
    case 795:
      ACCEPT_TOKEN(anon_sym_repeat);
      END_STATE();
    case 796:
      ACCEPT_TOKEN(anon_sym_retry);
      if (lookahead == '-') ADVANCE(306);
      END_STATE();
    case 797:
      ACCEPT_TOKEN(anon_sym_connect_DASHtimeout);
      END_STATE();
    case 798:
      ACCEPT_TOKEN(anon_sym_delay);
      END_STATE();
    case 799:
      ACCEPT_TOKEN(anon_sym_retry_DASHinterval);
      END_STATE();
    case 800:
      ACCEPT_TOKEN(anon_sym_ms);
      END_STATE();
    case 801:
      ACCEPT_TOKEN(anon_sym_s);
      END_STATE();
    case 802:
      ACCEPT_TOKEN(anon_sym_s);
      if (lookahead == 'p') ADVANCE(334);
      END_STATE();
    case 803:
      ACCEPT_TOKEN(anon_sym_m);
      END_STATE();
    case 804:
      ACCEPT_TOKEN(anon_sym_m);
      if (lookahead == 's') ADVANCE(800);
      END_STATE();
    case 805:
      ACCEPT_TOKEN(anon_sym_aws_DASHsigv4);
      END_STATE();
    case 806:
      ACCEPT_TOKEN(anon_sym_key);
      END_STATE();
    case 807:
      ACCEPT_TOKEN(anon_sym_connect_DASHto);
      END_STATE();
    case 808:
      ACCEPT_TOKEN(anon_sym_header);
      END_STATE();
    case 809:
      ACCEPT_TOKEN(anon_sym_netrc_DASHfile);
      END_STATE();
    case 810:
      ACCEPT_TOKEN(anon_sym_output);
      END_STATE();
    case 811:
      ACCEPT_TOKEN(anon_sym_pinnedpubkey);
      END_STATE();
    case 812:
      ACCEPT_TOKEN(anon_sym_proxy);
      END_STATE();
    case 813:
      ACCEPT_TOKEN(anon_sym_unix_DASHsocket);
      END_STATE();
    case 814:
      ACCEPT_TOKEN(anon_sym_user);
      END_STATE();
    case 815:
      ACCEPT_TOKEN(anon_sym_variable);
      END_STATE();
    case 816:
      ACCEPT_TOKEN(anon_sym_EQ);
      END_STATE();
    case 817:
      ACCEPT_TOKEN(anon_sym_EQ);
      if (lookahead == '=') ADVANCE(843);
      END_STATE();
    case 818:
      ACCEPT_TOKEN(anon_sym_status);
      END_STATE();
    case 819:
      ACCEPT_TOKEN(anon_sym_url);
      END_STATE();
    case 820:
      ACCEPT_TOKEN(anon_sym_body);
      END_STATE();
    case 821:
      ACCEPT_TOKEN(anon_sym_duration);
      END_STATE();
    case 822:
      ACCEPT_TOKEN(anon_sym_bytes);
      END_STATE();
    case 823:
      ACCEPT_TOKEN(anon_sym_sha256);
      END_STATE();
    case 824:
      ACCEPT_TOKEN(anon_sym_md5);
      END_STATE();
    case 825:
      ACCEPT_TOKEN(anon_sym_cookie);
      END_STATE();
    case 826:
      ACCEPT_TOKEN(anon_sym_xpath);
      END_STATE();
    case 827:
      ACCEPT_TOKEN(anon_sym_jsonpath);
      END_STATE();
    case 828:
      ACCEPT_TOKEN(anon_sym_regex);
      END_STATE();
    case 829:
      ACCEPT_TOKEN(anon_sym_not);
      if (lookahead == 'E') ADVANCE(428);
      END_STATE();
    case 830:
      ACCEPT_TOKEN(anon_sym_exists);
      END_STATE();
    case 831:
      ACCEPT_TOKEN(anon_sym_isInteger);
      END_STATE();
    case 832:
      ACCEPT_TOKEN(anon_sym_isFloat);
      END_STATE();
    case 833:
      ACCEPT_TOKEN(anon_sym_isBoolean);
      END_STATE();
    case 834:
      ACCEPT_TOKEN(anon_sym_isString);
      END_STATE();
    case 835:
      ACCEPT_TOKEN(anon_sym_isCollection);
      END_STATE();
    case 836:
      ACCEPT_TOKEN(anon_sym_isNumber);
      END_STATE();
    case 837:
      ACCEPT_TOKEN(anon_sym_isIsoDate);
      END_STATE();
    case 838:
      ACCEPT_TOKEN(anon_sym_isEmpty);
      END_STATE();
    case 839:
      ACCEPT_TOKEN(anon_sym_isIpv4);
      END_STATE();
    case 840:
      ACCEPT_TOKEN(anon_sym_isIpv6);
      END_STATE();
    case 841:
      ACCEPT_TOKEN(anon_sym_isUuid);
      END_STATE();
    case 842:
      ACCEPT_TOKEN(anon_sym_equals);
      END_STATE();
    case 843:
      ACCEPT_TOKEN(anon_sym_EQ_EQ);
      END_STATE();
    case 844:
      ACCEPT_TOKEN(anon_sym_notEquals);
      END_STATE();
    case 845:
      ACCEPT_TOKEN(anon_sym_BANG_EQ);
      END_STATE();
    case 846:
      ACCEPT_TOKEN(anon_sym_greaterThan);
      if (lookahead == 'O') ADVANCE(470);
      END_STATE();
    case 847:
      ACCEPT_TOKEN(anon_sym_GT);
      END_STATE();
    case 848:
      ACCEPT_TOKEN(anon_sym_GT);
      if (lookahead == '=') ADVANCE(850);
      END_STATE();
    case 849:
      ACCEPT_TOKEN(anon_sym_greaterThanOrEquals);
      END_STATE();
    case 850:
      ACCEPT_TOKEN(anon_sym_GT_EQ);
      END_STATE();
    case 851:
      ACCEPT_TOKEN(anon_sym_lessThan);
      if (lookahead == 'O') ADVANCE(439);
      END_STATE();
    case 852:
      ACCEPT_TOKEN(anon_sym_LT);
      if (lookahead == '/') ADVANCE(871);
      if (lookahead == '=') ADVANCE(857);
      if (lookahead == '?') ADVANCE(863);
      END_STATE();
    case 853:
      ACCEPT_TOKEN(anon_sym_LT);
      if (lookahead == '/') ADVANCE(871);
      if (lookahead == '?') ADVANCE(863);
      END_STATE();
    case 854:
      ACCEPT_TOKEN(anon_sym_LT);
      if (lookahead == '=') ADVANCE(857);
      END_STATE();
    case 855:
      ACCEPT_TOKEN(anon_sym_LT);
      if (lookahead == '?') ADVANCE(863);
      END_STATE();
    case 856:
      ACCEPT_TOKEN(anon_sym_lessThanOrEquals);
      END_STATE();
    case 857:
      ACCEPT_TOKEN(anon_sym_LT_EQ);
      END_STATE();
    case 858:
      ACCEPT_TOKEN(anon_sym_startsWith);
      END_STATE();
    case 859:
      ACCEPT_TOKEN(anon_sym_endsWith);
      END_STATE();
    case 860:
      ACCEPT_TOKEN(anon_sym_contains);
      END_STATE();
    case 861:
      ACCEPT_TOKEN(anon_sym_matches);
      END_STATE();
    case 862:
      ACCEPT_TOKEN(anon_sym_includes);
      END_STATE();
    case 863:
      ACCEPT_TOKEN(anon_sym_LT_QMARK);
      END_STATE();
    case 864:
      ACCEPT_TOKEN(aux_sym_xml_prolog_tag_token1);
      if (lookahead == '\n') ADVANCE(866);
      if (lookahead == '?') ADVANCE(1150);
      if (lookahead != 0) ADVANCE(864);
      END_STATE();
    case 865:
      ACCEPT_TOKEN(aux_sym_xml_prolog_tag_token1);
      if (lookahead == '#') ADVANCE(864);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(865);
      if (lookahead != 0 &&
          lookahead != '?') ADVANCE(866);
      END_STATE();
    case 866:
      ACCEPT_TOKEN(aux_sym_xml_prolog_tag_token1);
      if (lookahead != 0 &&
          lookahead != '?') ADVANCE(866);
      END_STATE();
    case 867:
      ACCEPT_TOKEN(anon_sym_QMARK_GT);
      END_STATE();
    case 868:
      ACCEPT_TOKEN(aux_sym_xml_open_tag_token1);
      if (lookahead == '\n') ADVANCE(870);
      if (lookahead == '>') ADVANCE(1150);
      if (lookahead != 0) ADVANCE(868);
      END_STATE();
    case 869:
      ACCEPT_TOKEN(aux_sym_xml_open_tag_token1);
      if (lookahead == '#') ADVANCE(868);
      if (lookahead == '>') ADVANCE(870);
      if (lookahead == '/' ||
          lookahead == '?') ADVANCE(870);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(869);
      if (lookahead != 0) ADVANCE(870);
      END_STATE();
    case 870:
      ACCEPT_TOKEN(aux_sym_xml_open_tag_token1);
      if (lookahead != 0 &&
          lookahead != '>') ADVANCE(870);
      END_STATE();
    case 871:
      ACCEPT_TOKEN(anon_sym_LT_SLASH);
      END_STATE();
    case 872:
      ACCEPT_TOKEN(aux_sym_xml_close_tag_token1);
      if (lookahead == '\n') ADVANCE(874);
      if (lookahead == '/' ||
          lookahead == '>') ADVANCE(1150);
      if (lookahead != 0) ADVANCE(872);
      END_STATE();
    case 873:
      ACCEPT_TOKEN(aux_sym_xml_close_tag_token1);
      if (lookahead == '#') ADVANCE(872);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(873);
      if (lookahead != 0 &&
          lookahead != '/' &&
          lookahead != '>') ADVANCE(874);
      END_STATE();
    case 874:
      ACCEPT_TOKEN(aux_sym_xml_close_tag_token1);
      if (lookahead != 0 &&
          lookahead != '/' &&
          lookahead != '>') ADVANCE(874);
      END_STATE();
    case 875:
      ACCEPT_TOKEN(anon_sym_base64_COMMA);
      END_STATE();
    case 876:
      ACCEPT_TOKEN(aux_sym_oneline_base64_token1);
      if (lookahead == '\n') ADVANCE(876);
      if (('+' <= lookahead && lookahead <= '-') ||
          ('0' <= lookahead && lookahead <= '9') ||
          lookahead == '=' ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(877);
      END_STATE();
    case 877:
      ACCEPT_TOKEN(aux_sym_oneline_base64_token1);
      if (lookahead == '\n' ||
          ('+' <= lookahead && lookahead <= '-') ||
          ('0' <= lookahead && lookahead <= '9') ||
          lookahead == '=' ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(877);
      END_STATE();
    case 878:
      ACCEPT_TOKEN(anon_sym_hex_COMMA);
      END_STATE();
    case 879:
      ACCEPT_TOKEN(anon_sym_DQUOTE);
      END_STATE();
    case 880:
      ACCEPT_TOKEN(sym_quoted_string_text);
      if (lookahead == '\n') ADVANCE(883);
      if (lookahead == '"' ||
          lookahead == '\\') ADVANCE(1150);
      if (lookahead != 0) ADVANCE(880);
      END_STATE();
    case 881:
      ACCEPT_TOKEN(sym_quoted_string_text);
      if (lookahead == '#') ADVANCE(880);
      if (lookahead == '{') ADVANCE(882);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(881);
      if (lookahead != 0 &&
          lookahead != '"' &&
          lookahead != '#' &&
          lookahead != '\\') ADVANCE(883);
      END_STATE();
    case 882:
      ACCEPT_TOKEN(sym_quoted_string_text);
      if (lookahead == '{') ADVANCE(1123);
      if (lookahead != 0 &&
          lookahead != '"' &&
          lookahead != '\\') ADVANCE(883);
      END_STATE();
    case 883:
      ACCEPT_TOKEN(sym_quoted_string_text);
      if (lookahead != 0 &&
          lookahead != '"' &&
          lookahead != '\\') ADVANCE(883);
      END_STATE();
    case 884:
      ACCEPT_TOKEN(aux_sym_invalid_quoted_string_escaped_char_token1);
      END_STATE();
    case 885:
      ACCEPT_TOKEN(aux_sym_invalid_quoted_string_escaped_char_token1);
      if (lookahead == '#') ADVANCE(886);
      if (lookahead == 'b') ADVANCE(766);
      if (lookahead == 'f') ADVANCE(767);
      if (lookahead == 'n') ADVANCE(768);
      if (lookahead == 'r') ADVANCE(769);
      if (lookahead == 't') ADVANCE(770);
      if ((set_contains(extras_character_set_2, 9, lookahead)) &&
          lookahead != '\t' &&
          lookahead != '\f' &&
          lookahead != '\r') ADVANCE(885);
      if (lookahead != 0 &&
          (lookahead < '\t' || '\r' < lookahead) &&
          lookahead != '"' &&
          lookahead != '#' &&
          lookahead != '\\' &&
          lookahead != 't' &&
          lookahead != 'u') ADVANCE(884);
      END_STATE();
    case 886:
      ACCEPT_TOKEN(aux_sym_invalid_quoted_string_escaped_char_token1);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1150);
      END_STATE();
    case 887:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == ',') ADVANCE(878);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 888:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == ',') ADVANCE(757);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 889:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == ',') ADVANCE(875);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 890:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == '4') ADVANCE(889);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 891:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == '6') ADVANCE(890);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 892:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'A') ADVANCE(901);
      if (('B' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 893:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'A') ADVANCE(899);
      if (('B' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 894:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'A') ADVANCE(1045);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 895:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'A') ADVANCE(954);
      if (lookahead == 'O') ADVANCE(948);
      if (lookahead == 'R') ADVANCE(937);
      if (lookahead == 'U') ADVANCE(944);
      if (('B' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 896:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'C') ADVANCE(917);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 897:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'C') ADVANCE(924);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 898:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'C') ADVANCE(926);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 899:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'C') ADVANCE(910);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 900:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'C') ADVANCE(951);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 901:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'D') ADVANCE(634);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 902:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'D') ADVANCE(660);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 903:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'D') ADVANCE(972);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 904:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'E') ADVANCE(927);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 905:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'E') ADVANCE(949);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 906:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'E') ADVANCE(892);
      if (lookahead == 'T') ADVANCE(952);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 907:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'E') ADVANCE(892);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 908:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'E') ADVANCE(956);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 909:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'E') ADVANCE(654);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 910:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'E') ADVANCE(646);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 911:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'E') ADVANCE(640);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 912:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'E') ADVANCE(900);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 913:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'E') ADVANCE(955);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 914:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'F') ADVANCE(921);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 915:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'F') ADVANCE(1010);
      if (lookahead == ']') ADVANCE(743);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 916:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'G') ADVANCE(909);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 917:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'H') ADVANCE(648);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 918:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'I') ADVANCE(908);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 919:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'I') ADVANCE(929);
      if (lookahead == 'O') ADVANCE(897);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 920:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'I') ADVANCE(933);
      if (lookahead == 'O') ADVANCE(898);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 921:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'I') ADVANCE(932);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 922:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'I') ADVANCE(938);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 923:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'K') ADVANCE(650);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 924:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'K') ADVANCE(656);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 925:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'K') ADVANCE(652);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 926:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'K') ADVANCE(658);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 927:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'L') ADVANCE(913);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 928:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'L') ADVANCE(920);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 929:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'N') ADVANCE(923);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 930:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'N') ADVANCE(928);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 931:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'N') ADVANCE(946);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 932:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'N') ADVANCE(902);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 933:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'N') ADVANCE(925);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 934:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'N') ADVANCE(935);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 935:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'N') ADVANCE(912);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 936:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'O') ADVANCE(934);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 937:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'O') ADVANCE(940);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 938:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'O') ADVANCE(931);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 939:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'P') ADVANCE(729);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 940:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'P') ADVANCE(914);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 941:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'P') ADVANCE(970);
      if (lookahead == ']') ADVANCE(739);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 942:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'P') ADVANCE(953);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 943:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'P') ADVANCE(976);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 944:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'R') ADVANCE(916);
      if (lookahead == 'T') ADVANCE(638);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 945:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'R') ADVANCE(893);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 946:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'S') ADVANCE(644);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 947:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'S') ADVANCE(1041);
      if (lookahead == ']') ADVANCE(735);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 948:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'S') ADVANCE(950);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 949:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'T') ADVANCE(632);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 950:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'T') ADVANCE(636);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 951:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'T') ADVANCE(642);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 952:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'T') ADVANCE(939);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 953:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'T') ADVANCE(922);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 954:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'T') ADVANCE(896);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 955:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'T') ADVANCE(911);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 956:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'W') ADVANCE(662);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 957:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == ']') ADVANCE(747);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 958:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == ']') ADVANCE(753);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 959:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == ']') ADVANCE(733);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 960:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == ']') ADVANCE(741);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 961:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == ']') ADVANCE(745);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 962:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == ']') ADVANCE(737);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 963:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == ']') ADVANCE(751);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 964:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == ']') ADVANCE(749);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 965:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'a') ADVANCE(1027);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('b' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 966:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'a') ADVANCE(998);
      if (lookahead == 'i') ADVANCE(996);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('b' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 967:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'a') ADVANCE(998);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('b' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 968:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'a') ADVANCE(1024);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('b' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 969:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'a') ADVANCE(1002);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('b' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 970:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'a') ADVANCE(1016);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('b' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 971:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'a') ADVANCE(1019);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('b' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 972:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'a') ADVANCE(1039);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('b' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 973:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'a') ADVANCE(961);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('b' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 974:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'a') ADVANCE(1012);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('b' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 975:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'a') ADVANCE(1003);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('b' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 976:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'a') ADVANCE(1023);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('b' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 977:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'c') ADVANCE(894);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 978:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'e') ADVANCE(1049);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 979:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'e') ADVANCE(891);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 980:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'e') ADVANCE(1118);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 981:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'e') ADVANCE(1120);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 982:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'e') ADVANCE(888);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 983:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'e') ADVANCE(1015);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 984:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'e') ADVANCE(1025);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 985:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'e') ADVANCE(1021);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 986:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'e') ADVANCE(1032);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 987:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'g') ADVANCE(943);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 988:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'h') ADVANCE(959);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 989:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'i') ADVANCE(977);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 990:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'i') ADVANCE(1013);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 991:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'i') ADVANCE(1004);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 992:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'i') ADVANCE(1007);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 993:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'i') ADVANCE(984);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 994:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'k') ADVANCE(993);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 995:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'l') ADVANCE(756);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 996:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'l') ADVANCE(982);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 997:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'l') ADVANCE(995);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 998:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'l') ADVANCE(1029);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 999:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'l') ADVANCE(1038);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1000:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'm') ADVANCE(941);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1001:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'm') ADVANCE(903);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1002:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'm') ADVANCE(1028);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1003:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'm') ADVANCE(1030);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1004:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'n') ADVANCE(987);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1005:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'n') ADVANCE(1026);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1006:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'o') ADVANCE(994);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1007:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'o') ADVANCE(1005);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1008:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'o') ADVANCE(1014);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1009:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'o') ADVANCE(1006);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1010:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'o') ADVANCE(1018);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1011:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'p') ADVANCE(1037);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1012:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'p') ADVANCE(1040);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1013:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'p') ADVANCE(971);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1014:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'r') ADVANCE(1000);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1015:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'r') ADVANCE(1050);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1016:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'r') ADVANCE(969);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1017:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'r') ADVANCE(1047);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1018:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'r') ADVANCE(1001);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1019:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'r') ADVANCE(1036);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1020:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'r') ADVANCE(991);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1021:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'r') ADVANCE(1042);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1022:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'r') ADVANCE(986);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1023:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'r') ADVANCE(975);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1024:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 's') ADVANCE(989);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1025:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 's') ADVANCE(957);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1026:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 's') ADVANCE(958);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1027:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 's') ADVANCE(979);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1028:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 's') ADVANCE(960);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1029:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 's') ADVANCE(981);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1030:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 's') ADVANCE(962);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1031:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 's') ADVANCE(963);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1032:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 's') ADVANCE(964);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1033:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 's') ADVANCE(985);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1034:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 's') ADVANCE(1033);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1035:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 't') ADVANCE(988);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1036:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 't') ADVANCE(915);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1037:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 't') ADVANCE(992);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1038:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 't') ADVANCE(990);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1039:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 't') ADVANCE(973);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1040:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 't') ADVANCE(1048);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1041:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 't') ADVANCE(1020);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1042:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 't') ADVANCE(1031);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1043:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'u') ADVANCE(983);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1044:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'u') ADVANCE(997);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1045:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'u') ADVANCE(1035);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1046:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'u') ADVANCE(999);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1047:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'u') ADVANCE(980);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1048:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'u') ADVANCE(1022);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1049:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'x') ADVANCE(887);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1050:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == 'y') ADVANCE(947);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1051:
      ACCEPT_TOKEN(sym_key_string_text);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(1051);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1052:
      ACCEPT_TOKEN(sym_key_string_text);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1053:
      ACCEPT_TOKEN(aux_sym_value_string_text_token1);
      END_STATE();
    case 1054:
      ACCEPT_TOKEN(aux_sym_value_string_text_token1);
      if (lookahead == '\n') ADVANCE(624);
      if (lookahead == 'f') ADVANCE(1060);
      if (lookahead == 'n') ADVANCE(1062);
      if (lookahead == 't') ADVANCE(1061);
      if (lookahead == '{') ADVANCE(1063);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(1053);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1054);
      if (lookahead != 0 &&
          lookahead != '#' &&
          lookahead != '\\') ADVANCE(1053);
      END_STATE();
    case 1055:
      ACCEPT_TOKEN(aux_sym_value_string_text_token1);
      if (lookahead == '\n') ADVANCE(627);
      if (lookahead == '{') ADVANCE(1063);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1055);
      if (lookahead != 0 &&
          lookahead != '#' &&
          lookahead != '\\') ADVANCE(1053);
      END_STATE();
    case 1056:
      ACCEPT_TOKEN(aux_sym_value_string_text_token1);
      if (lookahead == '\n') ADVANCE(630);
      if (lookahead == 'f') ADVANCE(1059);
      if (lookahead == 'n') ADVANCE(1062);
      if (lookahead == 't') ADVANCE(1061);
      if (lookahead == '{') ADVANCE(1063);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(1053);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1056);
      if (lookahead != 0 &&
          lookahead != '#' &&
          lookahead != '\\') ADVANCE(1053);
      END_STATE();
    case 1057:
      ACCEPT_TOKEN(aux_sym_value_string_text_token1);
      if (lookahead == '<') ADVANCE(853);
      if (lookahead == '{') ADVANCE(1063);
      if (set_contains(extras_character_set_1, 10, lookahead)) ADVANCE(1057);
      if (lookahead != 0 &&
          (lookahead < '\t' || '\r' < lookahead) &&
          lookahead != '#' &&
          lookahead != '\\') ADVANCE(1053);
      END_STATE();
    case 1058:
      ACCEPT_TOKEN(aux_sym_value_string_text_token1);
      if (lookahead == '`') ADVANCE(1066);
      if (lookahead == '{') ADVANCE(1063);
      if (set_contains(extras_character_set_1, 10, lookahead)) ADVANCE(1058);
      if (lookahead != 0 &&
          (lookahead < '\t' || '\r' < lookahead) &&
          lookahead != '#' &&
          lookahead != '\\') ADVANCE(1053);
      END_STATE();
    case 1059:
      ACCEPT_TOKEN(aux_sym_value_string_text_token1);
      if (lookahead == 'a') ADVANCE(322);
      END_STATE();
    case 1060:
      ACCEPT_TOKEN(aux_sym_value_string_text_token1);
      if (lookahead == 'a') ADVANCE(322);
      if (lookahead == 'i') ADVANCE(320);
      END_STATE();
    case 1061:
      ACCEPT_TOKEN(aux_sym_value_string_text_token1);
      if (lookahead == 'r') ADVANCE(574);
      END_STATE();
    case 1062:
      ACCEPT_TOKEN(aux_sym_value_string_text_token1);
      if (lookahead == 'u') ADVANCE(319);
      END_STATE();
    case 1063:
      ACCEPT_TOKEN(aux_sym_value_string_text_token1);
      if (lookahead == '{') ADVANCE(1121);
      END_STATE();
    case 1064:
      ACCEPT_TOKEN(aux_sym_value_string_text_token1);
      if (lookahead == '{') ADVANCE(1063);
      if (set_contains(extras_character_set_1, 10, lookahead)) ADVANCE(1064);
      if (lookahead != 0 &&
          (lookahead < '\t' || '\r' < lookahead) &&
          lookahead != '#' &&
          lookahead != '\\') ADVANCE(1053);
      END_STATE();
    case 1065:
      ACCEPT_TOKEN(aux_sym_oneline_string_token1);
      END_STATE();
    case 1066:
      ACCEPT_TOKEN(anon_sym_BQUOTE);
      END_STATE();
    case 1067:
      ACCEPT_TOKEN(anon_sym_BQUOTE);
      if (lookahead == '`') ADVANCE(98);
      END_STATE();
    case 1068:
      ACCEPT_TOKEN(aux_sym_oneline_string_text_token1);
      END_STATE();
    case 1069:
      ACCEPT_TOKEN(aux_sym_oneline_string_text_token1);
      if (lookahead == '#') ADVANCE(1070);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1069);
      if (lookahead != 0 &&
          lookahead != '`') ADVANCE(1068);
      END_STATE();
    case 1070:
      ACCEPT_TOKEN(aux_sym_oneline_string_text_token1);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1150);
      END_STATE();
    case 1071:
      ACCEPT_TOKEN(anon_sym_BQUOTE_BQUOTE_BQUOTE);
      END_STATE();
    case 1072:
      ACCEPT_TOKEN(anon_sym_base64);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1073:
      ACCEPT_TOKEN(anon_sym_hex);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1074:
      ACCEPT_TOKEN(anon_sym_json);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1075:
      ACCEPT_TOKEN(anon_sym_xml);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1076:
      ACCEPT_TOKEN(anon_sym_graphql);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1077:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == '\n') ADVANCE(629);
      if (lookahead == '#') ADVANCE(1096);
      if (lookahead == 'b') ADVANCE(1081);
      if (lookahead == 'g') ADVANCE(1092);
      if (lookahead == 'h') ADVANCE(1082);
      if (lookahead == 'j') ADVANCE(1093);
      if (lookahead == 'x') ADVANCE(1087);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1077);
      if (lookahead != 0) ADVANCE(1096);
      END_STATE();
    case 1078:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == '4') ADVANCE(1072);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1079:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == '6') ADVANCE(1078);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1080:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == 'a') ADVANCE(1090);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1081:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == 'a') ADVANCE(1094);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1082:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == 'e') ADVANCE(1095);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1083:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == 'e') ADVANCE(1079);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1084:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == 'h') ADVANCE(1091);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1085:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == 'l') ADVANCE(1075);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1086:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == 'l') ADVANCE(1076);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1087:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == 'm') ADVANCE(1085);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1088:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == 'n') ADVANCE(1074);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1089:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == 'o') ADVANCE(1088);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1090:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == 'p') ADVANCE(1084);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1091:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == 'q') ADVANCE(1086);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1092:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == 'r') ADVANCE(1080);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1093:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == 's') ADVANCE(1089);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1094:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == 's') ADVANCE(1083);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1095:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead == 'x') ADVANCE(1073);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1096:
      ACCEPT_TOKEN(aux_sym_multiline_string_type_token1);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1096);
      END_STATE();
    case 1097:
      ACCEPT_TOKEN(aux_sym__multiline_string_text_token1);
      if (lookahead == '\n') ADVANCE(628);
      if (lookahead == '#') ADVANCE(1098);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1097);
      if (lookahead != 0 &&
          lookahead != '\\' &&
          lookahead != '`' &&
          lookahead != '{') ADVANCE(1099);
      END_STATE();
    case 1098:
      ACCEPT_TOKEN(aux_sym__multiline_string_text_token1);
      if (lookahead == '\\' ||
          lookahead == '`' ||
          lookahead == '{') ADVANCE(1150);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1098);
      END_STATE();
    case 1099:
      ACCEPT_TOKEN(aux_sym__multiline_string_text_token1);
      if (lookahead != 0 &&
          lookahead != '\n' &&
          lookahead != '\\' &&
          lookahead != '`' &&
          lookahead != '{') ADVANCE(1099);
      END_STATE();
    case 1100:
      ACCEPT_TOKEN(sym_filename_text);
      if (lookahead == '\n') ADVANCE(625);
      if (lookahead == '{') ADVANCE(1102);
      if ((set_contains(extras_character_set_2, 9, lookahead)) &&
          lookahead != ' ') ADVANCE(1100);
      if (lookahead != 0 &&
          lookahead != ' ' &&
          lookahead != '#' &&
          lookahead != ';' &&
          lookahead != '\\') ADVANCE(1103);
      END_STATE();
    case 1101:
      ACCEPT_TOKEN(sym_filename_text);
      if (lookahead == '{') ADVANCE(1102);
      if ((set_contains(extras_character_set_1, 10, lookahead)) &&
          lookahead != ' ') ADVANCE(1101);
      if (lookahead != 0 &&
          (lookahead < '\t' || '\r' < lookahead) &&
          lookahead != ' ' &&
          lookahead != '#' &&
          lookahead != ';' &&
          lookahead != '\\') ADVANCE(1103);
      END_STATE();
    case 1102:
      ACCEPT_TOKEN(sym_filename_text);
      if (lookahead == '{') ADVANCE(1122);
      if (lookahead != 0 &&
          lookahead != '\n' &&
          lookahead != ' ' &&
          lookahead != '#' &&
          lookahead != ';' &&
          lookahead != '\\') ADVANCE(1103);
      END_STATE();
    case 1103:
      ACCEPT_TOKEN(sym_filename_text);
      if (lookahead != 0 &&
          lookahead != '\n' &&
          lookahead != ' ' &&
          lookahead != '#' &&
          lookahead != ';' &&
          lookahead != '\\') ADVANCE(1103);
      END_STATE();
    case 1104:
      ACCEPT_TOKEN(aux_sym_filename_escaped_char_token1);
      END_STATE();
    case 1105:
      ACCEPT_TOKEN(anon_sym_COMMA);
      END_STATE();
    case 1106:
      ACCEPT_TOKEN(anon_sym_LBRACK);
      END_STATE();
    case 1107:
      ACCEPT_TOKEN(anon_sym_LBRACK);
      if (lookahead == 'A') ADVANCE(489);
      if (lookahead == 'B') ADVANCE(107);
      if (lookahead == 'C') ADVANCE(138);
      if (lookahead == 'F') ADVANCE(376);
      if (lookahead == 'M') ADVANCE(567);
      if (lookahead == 'O') ADVANCE(412);
      if (lookahead == 'Q') ADVANCE(568);
      END_STATE();
    case 1108:
      ACCEPT_TOKEN(anon_sym_LBRACK);
      if (lookahead == 'A') ADVANCE(489);
      if (lookahead == 'C') ADVANCE(137);
      END_STATE();
    case 1109:
      ACCEPT_TOKEN(anon_sym_LBRACK);
      if (lookahead == 'A') ADVANCE(1034);
      if (lookahead == 'C') ADVANCE(974);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1110:
      ACCEPT_TOKEN(anon_sym_LBRACK);
      if (lookahead == 'B') ADVANCE(107);
      if (lookahead == 'C') ADVANCE(382);
      if (lookahead == 'F') ADVANCE(376);
      if (lookahead == 'M') ADVANCE(567);
      if (lookahead == 'O') ADVANCE(412);
      if (lookahead == 'Q') ADVANCE(568);
      END_STATE();
    case 1111:
      ACCEPT_TOKEN(anon_sym_LBRACK);
      if (lookahead == 'B') ADVANCE(968);
      if (lookahead == 'C') ADVANCE(1009);
      if (lookahead == 'F') ADVANCE(1008);
      if (lookahead == 'M') ADVANCE(1046);
      if (lookahead == 'O') ADVANCE(1011);
      if (lookahead == 'Q') ADVANCE(1043);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1112:
      ACCEPT_TOKEN(anon_sym_RBRACK);
      END_STATE();
    case 1113:
      ACCEPT_TOKEN(aux_sym_json_string_text_token1);
      END_STATE();
    case 1114:
      ACCEPT_TOKEN(aux_sym_json_string_text_token1);
      if (lookahead == '#') ADVANCE(1116);
      if (lookahead == '{') ADVANCE(1115);
      if (set_contains(extras_character_set_2, 9, lookahead)) ADVANCE(1114);
      if (lookahead != 0 &&
          lookahead != '"' &&
          lookahead != '#' &&
          lookahead != '\\') ADVANCE(1113);
      END_STATE();
    case 1115:
      ACCEPT_TOKEN(aux_sym_json_string_text_token1);
      if (lookahead == '{') ADVANCE(1121);
      END_STATE();
    case 1116:
      ACCEPT_TOKEN(aux_sym_json_string_text_token1);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1150);
      END_STATE();
    case 1117:
      ACCEPT_TOKEN(anon_sym_true);
      END_STATE();
    case 1118:
      ACCEPT_TOKEN(anon_sym_true);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1119:
      ACCEPT_TOKEN(anon_sym_false);
      END_STATE();
    case 1120:
      ACCEPT_TOKEN(anon_sym_false);
      if (lookahead == '$' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('@' <= lookahead && lookahead <= '[') ||
          lookahead == ']' ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1052);
      END_STATE();
    case 1121:
      ACCEPT_TOKEN(anon_sym_LBRACE_LBRACE);
      END_STATE();
    case 1122:
      ACCEPT_TOKEN(anon_sym_LBRACE_LBRACE);
      if (lookahead != 0 &&
          lookahead != '\n' &&
          lookahead != ' ' &&
          lookahead != '#' &&
          lookahead != ';' &&
          lookahead != '\\') ADVANCE(1103);
      END_STATE();
    case 1123:
      ACCEPT_TOKEN(anon_sym_LBRACE_LBRACE);
      if (lookahead != 0 &&
          lookahead != '"' &&
          lookahead != '\\') ADVANCE(883);
      END_STATE();
    case 1124:
      ACCEPT_TOKEN(anon_sym_RBRACE_RBRACE);
      END_STATE();
    case 1125:
      ACCEPT_TOKEN(aux_sym_variable_name_token1);
      END_STATE();
    case 1126:
      ACCEPT_TOKEN(aux_sym_variable_name_token2);
      if (lookahead == '-' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(1126);
      END_STATE();
    case 1127:
      ACCEPT_TOKEN(anon_sym_count);
      END_STATE();
    case 1128:
      ACCEPT_TOKEN(anon_sym_urlEncode);
      END_STATE();
    case 1129:
      ACCEPT_TOKEN(anon_sym_urlDecode);
      END_STATE();
    case 1130:
      ACCEPT_TOKEN(anon_sym_toInt);
      END_STATE();
    case 1131:
      ACCEPT_TOKEN(anon_sym_htmlEscape);
      END_STATE();
    case 1132:
      ACCEPT_TOKEN(anon_sym_htmlUnescape);
      END_STATE();
    case 1133:
      ACCEPT_TOKEN(anon_sym_daysAfterNow);
      END_STATE();
    case 1134:
      ACCEPT_TOKEN(anon_sym_daysBeforeNow);
      END_STATE();
    case 1135:
      ACCEPT_TOKEN(anon_sym_decode);
      END_STATE();
    case 1136:
      ACCEPT_TOKEN(anon_sym_format);
      END_STATE();
    case 1137:
      ACCEPT_TOKEN(anon_sym_toDate);
      END_STATE();
    case 1138:
      ACCEPT_TOKEN(anon_sym_nth);
      END_STATE();
    case 1139:
      ACCEPT_TOKEN(anon_sym_replace);
      END_STATE();
    case 1140:
      ACCEPT_TOKEN(anon_sym_split);
      END_STATE();
    case 1141:
      ACCEPT_TOKEN(aux_sym_digit_token1);
      END_STATE();
    case 1142:
      ACCEPT_TOKEN(aux_sym_hexdigit_token1);
      END_STATE();
    case 1143:
      ACCEPT_TOKEN(anon_sym_DOT);
      END_STATE();
    case 1144:
      ACCEPT_TOKEN(anon_sym_e);
      END_STATE();
    case 1145:
      ACCEPT_TOKEN(anon_sym_E);
      END_STATE();
    case 1146:
      ACCEPT_TOKEN(anon_sym_E);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(722);
      END_STATE();
    case 1147:
      ACCEPT_TOKEN(anon_sym_PLUS);
      END_STATE();
    case 1148:
      ACCEPT_TOKEN(anon_sym_DASH);
      END_STATE();
    case 1149:
      ACCEPT_TOKEN(sym_comment);
      if (lookahead == '/' ||
          lookahead == '\\') ADVANCE(1150);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1149);
      END_STATE();
    case 1150:
      ACCEPT_TOKEN(sym_comment);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(1150);
      END_STATE();
    case 1151:
      ACCEPT_TOKEN(anon_sym_SLASH);
      END_STATE();
    case 1152:
      ACCEPT_TOKEN(sym_regex_text);
      if (lookahead == '#') ADVANCE(1149);
      if (set_contains(extras_character_set_1, 10, lookahead)) ADVANCE(1152);
      if (lookahead != 0 &&
          (lookahead < '\t' || '\r' < lookahead) &&
          lookahead != '/' &&
          lookahead != '\\') ADVANCE(1153);
      END_STATE();
    case 1153:
      ACCEPT_TOKEN(sym_regex_text);
      if (lookahead != 0 &&
          lookahead != '\n' &&
          lookahead != '/' &&
          lookahead != '\\') ADVANCE(1153);
      END_STATE();
    case 1154:
      ACCEPT_TOKEN(aux_sym_regex_escaped_char_token1);
      END_STATE();
    case 1155:
      ACCEPT_TOKEN(aux_sym_regex_escaped_char_token1);
      if (lookahead == '#') ADVANCE(1150);
      if (set_contains(extras_character_set_1, 10, lookahead)) ADVANCE(1155);
      if (lookahead != 0 &&
          (lookahead < '\t' || '\r' < lookahead)) ADVANCE(1154);
      END_STATE();
    default:
      return false;
  }
}

static const TSLexMode ts_lex_modes[STATE_COUNT] = {
  [0] = {.lex_state = 0},
  [1] = {.lex_state = 615},
  [2] = {.lex_state = 617},
  [3] = {.lex_state = 617},
  [4] = {.lex_state = 617},
  [5] = {.lex_state = 619},
  [6] = {.lex_state = 619},
  [7] = {.lex_state = 619},
  [8] = {.lex_state = 619},
  [9] = {.lex_state = 617},
  [10] = {.lex_state = 617},
  [11] = {.lex_state = 617},
  [12] = {.lex_state = 617},
  [13] = {.lex_state = 617},
  [14] = {.lex_state = 617},
  [15] = {.lex_state = 620},
  [16] = {.lex_state = 620},
  [17] = {.lex_state = 621},
  [18] = {.lex_state = 621},
  [19] = {.lex_state = 615},
  [20] = {.lex_state = 615},
  [21] = {.lex_state = 619},
  [22] = {.lex_state = 619},
  [23] = {.lex_state = 619},
  [24] = {.lex_state = 619},
  [25] = {.lex_state = 615},
  [26] = {.lex_state = 615},
  [27] = {.lex_state = 615},
  [28] = {.lex_state = 619},
  [29] = {.lex_state = 619},
  [30] = {.lex_state = 619},
  [31] = {.lex_state = 619},
  [32] = {.lex_state = 619},
  [33] = {.lex_state = 619},
  [34] = {.lex_state = 619},
  [35] = {.lex_state = 619},
  [36] = {.lex_state = 619},
  [37] = {.lex_state = 617},
  [38] = {.lex_state = 621},
  [39] = {.lex_state = 619},
  [40] = {.lex_state = 619},
  [41] = {.lex_state = 619},
  [42] = {.lex_state = 619},
  [43] = {.lex_state = 619},
  [44] = {.lex_state = 621},
  [45] = {.lex_state = 621},
  [46] = {.lex_state = 615},
  [47] = {.lex_state = 615},
  [48] = {.lex_state = 617},
  [49] = {.lex_state = 615},
  [50] = {.lex_state = 615},
  [51] = {.lex_state = 617},
  [52] = {.lex_state = 621},
  [53] = {.lex_state = 621},
  [54] = {.lex_state = 621},
  [55] = {.lex_state = 621},
  [56] = {.lex_state = 621},
  [57] = {.lex_state = 621},
  [58] = {.lex_state = 621},
  [59] = {.lex_state = 621},
  [60] = {.lex_state = 621},
  [61] = {.lex_state = 620},
  [62] = {.lex_state = 621},
  [63] = {.lex_state = 621},
  [64] = {.lex_state = 621},
  [65] = {.lex_state = 621},
  [66] = {.lex_state = 620},
  [67] = {.lex_state = 621},
  [68] = {.lex_state = 621},
  [69] = {.lex_state = 620},
  [70] = {.lex_state = 621},
  [71] = {.lex_state = 621},
  [72] = {.lex_state = 621},
  [73] = {.lex_state = 621},
  [74] = {.lex_state = 621},
  [75] = {.lex_state = 620},
  [76] = {.lex_state = 621},
  [77] = {.lex_state = 615},
  [78] = {.lex_state = 620},
  [79] = {.lex_state = 620},
  [80] = {.lex_state = 620},
  [81] = {.lex_state = 620},
  [82] = {.lex_state = 620},
  [83] = {.lex_state = 615},
  [84] = {.lex_state = 617},
  [85] = {.lex_state = 617},
  [86] = {.lex_state = 617},
  [87] = {.lex_state = 617},
  [88] = {.lex_state = 615},
  [89] = {.lex_state = 615},
  [90] = {.lex_state = 621},
  [91] = {.lex_state = 617},
  [92] = {.lex_state = 617},
  [93] = {.lex_state = 621},
  [94] = {.lex_state = 617},
  [95] = {.lex_state = 617},
  [96] = {.lex_state = 617},
  [97] = {.lex_state = 617},
  [98] = {.lex_state = 1},
  [99] = {.lex_state = 615},
  [100] = {.lex_state = 1},
  [101] = {.lex_state = 615},
  [102] = {.lex_state = 6},
  [103] = {.lex_state = 615},
  [104] = {.lex_state = 621},
  [105] = {.lex_state = 621},
  [106] = {.lex_state = 621},
  [107] = {.lex_state = 621},
  [108] = {.lex_state = 1},
  [109] = {.lex_state = 621},
  [110] = {.lex_state = 615},
  [111] = {.lex_state = 615},
  [112] = {.lex_state = 19},
  [113] = {.lex_state = 18},
  [114] = {.lex_state = 615},
  [115] = {.lex_state = 21},
  [116] = {.lex_state = 615},
  [117] = {.lex_state = 615},
  [118] = {.lex_state = 615},
  [119] = {.lex_state = 615},
  [120] = {.lex_state = 615},
  [121] = {.lex_state = 615},
  [122] = {.lex_state = 615},
  [123] = {.lex_state = 615},
  [124] = {.lex_state = 615},
  [125] = {.lex_state = 615},
  [126] = {.lex_state = 621},
  [127] = {.lex_state = 27},
  [128] = {.lex_state = 621},
  [129] = {.lex_state = 621},
  [130] = {.lex_state = 621},
  [131] = {.lex_state = 617},
  [132] = {.lex_state = 617},
  [133] = {.lex_state = 617},
  [134] = {.lex_state = 617},
  [135] = {.lex_state = 617},
  [136] = {.lex_state = 617},
  [137] = {.lex_state = 617},
  [138] = {.lex_state = 617},
  [139] = {.lex_state = 617},
  [140] = {.lex_state = 617},
  [141] = {.lex_state = 617},
  [142] = {.lex_state = 617},
  [143] = {.lex_state = 617},
  [144] = {.lex_state = 617},
  [145] = {.lex_state = 617},
  [146] = {.lex_state = 617},
  [147] = {.lex_state = 617},
  [148] = {.lex_state = 617},
  [149] = {.lex_state = 617},
  [150] = {.lex_state = 7},
  [151] = {.lex_state = 7},
  [152] = {.lex_state = 7},
  [153] = {.lex_state = 15},
  [154] = {.lex_state = 7},
  [155] = {.lex_state = 3},
  [156] = {.lex_state = 3},
  [157] = {.lex_state = 3},
  [158] = {.lex_state = 7},
  [159] = {.lex_state = 26},
  [160] = {.lex_state = 16},
  [161] = {.lex_state = 16},
  [162] = {.lex_state = 15},
  [163] = {.lex_state = 16},
  [164] = {.lex_state = 16},
  [165] = {.lex_state = 16},
  [166] = {.lex_state = 8},
  [167] = {.lex_state = 15},
  [168] = {.lex_state = 23},
  [169] = {.lex_state = 29},
  [170] = {.lex_state = 23},
  [171] = {.lex_state = 30},
  [172] = {.lex_state = 24},
  [173] = {.lex_state = 9},
  [174] = {.lex_state = 24},
  [175] = {.lex_state = 23},
  [176] = {.lex_state = 9},
  [177] = {.lex_state = 24},
  [178] = {.lex_state = 23},
  [179] = {.lex_state = 23},
  [180] = {.lex_state = 30},
  [181] = {.lex_state = 29},
  [182] = {.lex_state = 9},
  [183] = {.lex_state = 24},
  [184] = {.lex_state = 24},
  [185] = {.lex_state = 10},
  [186] = {.lex_state = 3},
  [187] = {.lex_state = 30},
  [188] = {.lex_state = 25},
  [189] = {.lex_state = 7},
  [190] = {.lex_state = 3},
  [191] = {.lex_state = 19},
  [192] = {.lex_state = 29},
  [193] = {.lex_state = 7},
  [194] = {.lex_state = 29},
  [195] = {.lex_state = 19},
  [196] = {.lex_state = 10},
  [197] = {.lex_state = 30},
  [198] = {.lex_state = 30},
  [199] = {.lex_state = 20},
  [200] = {.lex_state = 20},
  [201] = {.lex_state = 15},
  [202] = {.lex_state = 16},
  [203] = {.lex_state = 16},
  [204] = {.lex_state = 16},
  [205] = {.lex_state = 15},
  [206] = {.lex_state = 16},
  [207] = {.lex_state = 19},
  [208] = {.lex_state = 16},
  [209] = {.lex_state = 19},
  [210] = {.lex_state = 26},
  [211] = {.lex_state = 17},
  [212] = {.lex_state = 1},
  [213] = {.lex_state = 9},
  [214] = {.lex_state = 19},
  [215] = {.lex_state = 23},
  [216] = {.lex_state = 32},
  [217] = {.lex_state = 621},
  [218] = {.lex_state = 621},
  [219] = {.lex_state = 9},
  [220] = {.lex_state = 19},
  [221] = {.lex_state = 621},
  [222] = {.lex_state = 621},
  [223] = {.lex_state = 621},
  [224] = {.lex_state = 621},
  [225] = {.lex_state = 621},
  [226] = {.lex_state = 621},
  [227] = {.lex_state = 1},
  [228] = {.lex_state = 19},
  [229] = {.lex_state = 23},
  [230] = {.lex_state = 19},
  [231] = {.lex_state = 11},
  [232] = {.lex_state = 3},
  [233] = {.lex_state = 7},
  [234] = {.lex_state = 29},
  [235] = {.lex_state = 10},
  [236] = {.lex_state = 19},
  [237] = {.lex_state = 1},
  [238] = {.lex_state = 621},
  [239] = {.lex_state = 621},
  [240] = {.lex_state = 30},
  [241] = {.lex_state = 30},
  [242] = {.lex_state = 19},
  [243] = {.lex_state = 3},
  [244] = {.lex_state = 10},
  [245] = {.lex_state = 26},
  [246] = {.lex_state = 1},
  [247] = {.lex_state = 11},
  [248] = {.lex_state = 19},
  [249] = {.lex_state = 621},
  [250] = {.lex_state = 621},
  [251] = {.lex_state = 7},
  [252] = {.lex_state = 29},
  [253] = {.lex_state = 3},
  [254] = {.lex_state = 16},
  [255] = {.lex_state = 16},
  [256] = {.lex_state = 16},
  [257] = {.lex_state = 16},
  [258] = {.lex_state = 1},
  [259] = {.lex_state = 7},
  [260] = {.lex_state = 12},
  [261] = {.lex_state = 7},
  [262] = {.lex_state = 7},
  [263] = {.lex_state = 7},
  [264] = {.lex_state = 3},
  [265] = {.lex_state = 24},
  [266] = {.lex_state = 11},
  [267] = {.lex_state = 15},
  [268] = {.lex_state = 15},
  [269] = {.lex_state = 11},
  [270] = {.lex_state = 621},
  [271] = {.lex_state = 4},
  [272] = {.lex_state = 24},
  [273] = {.lex_state = 7},
  [274] = {.lex_state = 7},
  [275] = {.lex_state = 16},
  [276] = {.lex_state = 3},
  [277] = {.lex_state = 12},
  [278] = {.lex_state = 16},
  [279] = {.lex_state = 3},
  [280] = {.lex_state = 621},
  [281] = {.lex_state = 16},
  [282] = {.lex_state = 621},
  [283] = {.lex_state = 19},
  [284] = {.lex_state = 615},
  [285] = {.lex_state = 615},
  [286] = {.lex_state = 621},
  [287] = {.lex_state = 1},
  [288] = {.lex_state = 23},
  [289] = {.lex_state = 24},
  [290] = {.lex_state = 15},
  [291] = {.lex_state = 15},
  [292] = {.lex_state = 9},
  [293] = {.lex_state = 30},
  [294] = {.lex_state = 9},
  [295] = {.lex_state = 10},
  [296] = {.lex_state = 3},
  [297] = {.lex_state = 23},
  [298] = {.lex_state = 19},
  [299] = {.lex_state = 615},
  [300] = {.lex_state = 621},
  [301] = {.lex_state = 15},
  [302] = {.lex_state = 621},
  [303] = {.lex_state = 615},
  [304] = {.lex_state = 615},
  [305] = {.lex_state = 621},
  [306] = {.lex_state = 24},
  [307] = {.lex_state = 621},
  [308] = {.lex_state = 30},
  [309] = {.lex_state = 621},
  [310] = {.lex_state = 31},
  [311] = {.lex_state = 9},
  [312] = {.lex_state = 615},
  [313] = {.lex_state = 23},
  [314] = {.lex_state = 615},
  [315] = {.lex_state = 23},
  [316] = {.lex_state = 9},
  [317] = {.lex_state = 29},
  [318] = {.lex_state = 615},
  [319] = {.lex_state = 621},
  [320] = {.lex_state = 621},
  [321] = {.lex_state = 9},
  [322] = {.lex_state = 15},
  [323] = {.lex_state = 24},
  [324] = {.lex_state = 24},
  [325] = {.lex_state = 24},
  [326] = {.lex_state = 31},
  [327] = {.lex_state = 31},
  [328] = {.lex_state = 621},
  [329] = {.lex_state = 615},
  [330] = {.lex_state = 615},
  [331] = {.lex_state = 615},
  [332] = {.lex_state = 19},
  [333] = {.lex_state = 29},
  [334] = {.lex_state = 621},
  [335] = {.lex_state = 23},
  [336] = {.lex_state = 615},
  [337] = {.lex_state = 10},
  [338] = {.lex_state = 15},
  [339] = {.lex_state = 615},
  [340] = {.lex_state = 615},
  [341] = {.lex_state = 15},
  [342] = {.lex_state = 621},
  [343] = {.lex_state = 615},
  [344] = {.lex_state = 615},
  [345] = {.lex_state = 621},
  [346] = {.lex_state = 615},
  [347] = {.lex_state = 615},
  [348] = {.lex_state = 19},
  [349] = {.lex_state = 19},
  [350] = {.lex_state = 19},
  [351] = {.lex_state = 31},
  [352] = {.lex_state = 19},
  [353] = {.lex_state = 19},
  [354] = {.lex_state = 621},
  [355] = {.lex_state = 615},
  [356] = {.lex_state = 621},
  [357] = {.lex_state = 11},
  [358] = {.lex_state = 27},
  [359] = {.lex_state = 19},
  [360] = {.lex_state = 33},
  [361] = {.lex_state = 19},
  [362] = {.lex_state = 19},
  [363] = {.lex_state = 33},
  [364] = {.lex_state = 621},
  [365] = {.lex_state = 33},
  [366] = {.lex_state = 19},
  [367] = {.lex_state = 33},
  [368] = {.lex_state = 621},
  [369] = {.lex_state = 19},
  [370] = {.lex_state = 621},
  [371] = {.lex_state = 33},
  [372] = {.lex_state = 615},
  [373] = {.lex_state = 615},
  [374] = {.lex_state = 615},
  [375] = {.lex_state = 26},
  [376] = {.lex_state = 26},
  [377] = {.lex_state = 615},
  [378] = {.lex_state = 19},
  [379] = {.lex_state = 615},
  [380] = {.lex_state = 621},
  [381] = {.lex_state = 19},
  [382] = {.lex_state = 12},
  [383] = {.lex_state = 33},
  [384] = {.lex_state = 615},
  [385] = {.lex_state = 615},
  [386] = {.lex_state = 621},
  [387] = {.lex_state = 615},
  [388] = {.lex_state = 19},
  [389] = {.lex_state = 33},
  [390] = {.lex_state = 621},
  [391] = {.lex_state = 33},
  [392] = {.lex_state = 33},
  [393] = {.lex_state = 33},
  [394] = {.lex_state = 615},
  [395] = {.lex_state = 19},
  [396] = {.lex_state = 615},
  [397] = {.lex_state = 615},
  [398] = {.lex_state = 33},
  [399] = {.lex_state = 615},
  [400] = {.lex_state = 12},
  [401] = {.lex_state = 615},
  [402] = {.lex_state = 19},
  [403] = {.lex_state = 615},
  [404] = {.lex_state = 19},
  [405] = {.lex_state = 615},
  [406] = {.lex_state = 615},
  [407] = {.lex_state = 615},
  [408] = {.lex_state = 12},
  [409] = {.lex_state = 615},
  [410] = {.lex_state = 19},
  [411] = {.lex_state = 615},
  [412] = {.lex_state = 33},
  [413] = {.lex_state = 615},
  [414] = {.lex_state = 615},
  [415] = {.lex_state = 615},
  [416] = {.lex_state = 615},
  [417] = {.lex_state = 615},
  [418] = {.lex_state = 0},
  [419] = {.lex_state = 621},
  [420] = {.lex_state = 31},
  [421] = {.lex_state = 31},
  [422] = {.lex_state = 31},
  [423] = {.lex_state = 31},
  [424] = {.lex_state = 31},
  [425] = {.lex_state = 31},
  [426] = {.lex_state = 31},
  [427] = {.lex_state = 31},
  [428] = {.lex_state = 31},
  [429] = {.lex_state = 31},
  [430] = {.lex_state = 31},
  [431] = {.lex_state = 31},
  [432] = {.lex_state = 31},
  [433] = {.lex_state = 31},
  [434] = {.lex_state = 19},
  [435] = {.lex_state = 31},
  [436] = {.lex_state = 31},
  [437] = {.lex_state = 5},
  [438] = {.lex_state = 19},
  [439] = {.lex_state = 621},
  [440] = {.lex_state = 621},
  [441] = {.lex_state = 621},
  [442] = {.lex_state = 31},
  [443] = {.lex_state = 621},
  [444] = {.lex_state = 621},
  [445] = {.lex_state = 27},
  [446] = {.lex_state = 31},
  [447] = {.lex_state = 31},
  [448] = {.lex_state = 621},
  [449] = {.lex_state = 19},
  [450] = {.lex_state = 621},
  [451] = {.lex_state = 19},
  [452] = {.lex_state = 621},
  [453] = {.lex_state = 5},
  [454] = {.lex_state = 621},
  [455] = {.lex_state = 0},
  [456] = {.lex_state = 31},
  [457] = {.lex_state = 621},
  [458] = {.lex_state = 31},
  [459] = {.lex_state = 621},
  [460] = {.lex_state = 19},
  [461] = {.lex_state = 31},
  [462] = {.lex_state = 19},
  [463] = {.lex_state = 621},
  [464] = {.lex_state = 19},
  [465] = {.lex_state = 621},
  [466] = {.lex_state = 621},
  [467] = {.lex_state = 621},
  [468] = {.lex_state = 621},
  [469] = {.lex_state = 621},
  [470] = {.lex_state = 31},
  [471] = {.lex_state = 19},
  [472] = {.lex_state = 31},
  [473] = {.lex_state = 615},
  [474] = {.lex_state = 615},
  [475] = {.lex_state = 615},
  [476] = {.lex_state = 615},
  [477] = {.lex_state = 615},
  [478] = {.lex_state = 19},
  [479] = {.lex_state = 615},
  [480] = {.lex_state = 615},
  [481] = {.lex_state = 615},
  [482] = {.lex_state = 615},
  [483] = {.lex_state = 615},
  [484] = {.lex_state = 621},
  [485] = {.lex_state = 615},
  [486] = {.lex_state = 615},
  [487] = {.lex_state = 13},
  [488] = {.lex_state = 34},
  [489] = {.lex_state = 615},
  [490] = {.lex_state = 615},
  [491] = {.lex_state = 621},
  [492] = {.lex_state = 615},
  [493] = {.lex_state = 615},
  [494] = {.lex_state = 35},
  [495] = {.lex_state = 36},
  [496] = {.lex_state = 621},
  [497] = {.lex_state = 615},
  [498] = {.lex_state = 621},
  [499] = {.lex_state = 621},
  [500] = {.lex_state = 615},
  [501] = {.lex_state = 621},
  [502] = {.lex_state = 615},
  [503] = {.lex_state = 615},
  [504] = {.lex_state = 615},
  [505] = {.lex_state = 621},
  [506] = {.lex_state = 1126},
  [507] = {.lex_state = 19},
  [508] = {.lex_state = 621},
  [509] = {.lex_state = 621},
  [510] = {.lex_state = 615},
  [511] = {.lex_state = 615},
  [512] = {.lex_state = 31},
  [513] = {.lex_state = 615},
  [514] = {.lex_state = 615},
  [515] = {.lex_state = 615},
  [516] = {.lex_state = 615},
  [517] = {.lex_state = 615},
  [518] = {.lex_state = 615},
  [519] = {.lex_state = 621},
  [520] = {.lex_state = 615},
  [521] = {.lex_state = 621},
  [522] = {.lex_state = 14},
  [523] = {.lex_state = 615},
  [524] = {.lex_state = 615},
  [525] = {.lex_state = 621},
  [526] = {.lex_state = 621},
  [527] = {.lex_state = 615},
  [528] = {.lex_state = 615},
  [529] = {.lex_state = 615},
  [530] = {.lex_state = 615},
  [531] = {.lex_state = 615},
  [532] = {.lex_state = 19},
  [533] = {.lex_state = 19},
  [534] = {.lex_state = 615},
  [535] = {.lex_state = 621},
  [536] = {.lex_state = 621},
  [537] = {.lex_state = 621},
  [538] = {.lex_state = 615},
  [539] = {.lex_state = 621},
  [540] = {.lex_state = 621},
  [541] = {.lex_state = 615},
  [542] = {.lex_state = 615},
  [543] = {.lex_state = 621},
  [544] = {.lex_state = 615},
  [545] = {.lex_state = 615},
  [546] = {.lex_state = 615},
  [547] = {.lex_state = 615},
  [548] = {.lex_state = 19},
  [549] = {.lex_state = 615},
  [550] = {.lex_state = 621},
  [551] = {.lex_state = 615},
  [552] = {.lex_state = 615},
  [553] = {.lex_state = 615},
  [554] = {.lex_state = 615},
  [555] = {.lex_state = 615},
  [556] = {.lex_state = 615},
  [557] = {.lex_state = 19},
  [558] = {.lex_state = 621},
  [559] = {.lex_state = 19},
  [560] = {.lex_state = 621},
  [561] = {.lex_state = 19},
  [562] = {.lex_state = 621},
  [563] = {.lex_state = 19},
  [564] = {.lex_state = 621},
  [565] = {.lex_state = 621},
  [566] = {.lex_state = 621},
  [567] = {.lex_state = 621},
  [568] = {.lex_state = 621},
  [569] = {.lex_state = 621},
  [570] = {.lex_state = 615},
  [571] = {.lex_state = 34},
  [572] = {.lex_state = 621},
  [573] = {.lex_state = 621},
  [574] = {.lex_state = 37},
  [575] = {.lex_state = 615},
  [576] = {.lex_state = 615},
  [577] = {.lex_state = 615},
  [578] = {.lex_state = 615},
  [579] = {.lex_state = 615},
  [580] = {.lex_state = 615},
  [581] = {.lex_state = 615},
  [582] = {.lex_state = 37},
  [583] = {.lex_state = 621},
  [584] = {.lex_state = 621},
  [585] = {.lex_state = 621},
  [586] = {.lex_state = 621},
  [587] = {.lex_state = 615},
  [588] = {.lex_state = 615},
  [589] = {.lex_state = 615},
  [590] = {.lex_state = 615},
  [591] = {.lex_state = 615},
  [592] = {.lex_state = 615},
  [593] = {.lex_state = 615},
  [594] = {.lex_state = 615},
  [595] = {.lex_state = 615},
  [596] = {.lex_state = 615},
  [597] = {.lex_state = 615},
  [598] = {.lex_state = 615},
  [599] = {.lex_state = 615},
};

static const uint16_t ts_parse_table[LARGE_STATE_COUNT][SYMBOL_COUNT] = {
  [0] = {
    [ts_builtin_sym_end] = ACTIONS(1),
    [aux_sym_method_token1] = ACTIONS(1),
    [aux_sym_status_token1] = ACTIONS(1),
    [anon_sym_STAR] = ACTIONS(1),
    [anon_sym_LBRACKBasicAuth_RBRACK] = ACTIONS(1),
    [anon_sym_LBRACKQuery_RBRACK] = ACTIONS(1),
    [anon_sym_LBRACKQueryStringParams_RBRACK] = ACTIONS(1),
    [anon_sym_LBRACKForm_RBRACK] = ACTIONS(1),
    [anon_sym_LBRACKFormParams_RBRACK] = ACTIONS(1),
    [anon_sym_LBRACKMultipart_RBRACK] = ACTIONS(1),
    [anon_sym_LBRACKMultipartFormData_RBRACK] = ACTIONS(1),
    [anon_sym_LBRACKCookies_RBRACK] = ACTIONS(1),
    [anon_sym_LBRACKCaptures_RBRACK] = ACTIONS(1),
    [anon_sym_LBRACKAsserts_RBRACK] = ACTIONS(1),
    [anon_sym_LBRACKOptions_RBRACK] = ACTIONS(1),
    [anon_sym_COLON] = ACTIONS(1),
    [anon_sym_SEMI] = ACTIONS(1),
    [anon_sym_BSLASH] = ACTIONS(1),
    [anon_sym_b] = ACTIONS(1),
    [anon_sym_f] = ACTIONS(1),
    [anon_sym_n] = ACTIONS(1),
    [anon_sym_r] = ACTIONS(1),
    [anon_sym_t] = ACTIONS(1),
    [anon_sym_u] = ACTIONS(1),
    [anon_sym_POUND] = ACTIONS(1),
    [anon_sym_LBRACE] = ACTIONS(1),
    [anon_sym_RBRACE] = ACTIONS(1),
    [anon_sym_s] = ACTIONS(1),
    [anon_sym_m] = ACTIONS(1),
    [anon_sym_EQ] = ACTIONS(1),
    [anon_sym_EQ_EQ] = ACTIONS(1),
    [anon_sym_BANG_EQ] = ACTIONS(1),
    [anon_sym_GT] = ACTIONS(1),
    [anon_sym_GT_EQ] = ACTIONS(1),
    [anon_sym_LT] = ACTIONS(1),
    [anon_sym_LT_EQ] = ACTIONS(1),
    [anon_sym_LT_QMARK] = ACTIONS(1),
    [anon_sym_QMARK_GT] = ACTIONS(1),
    [anon_sym_LT_SLASH] = ACTIONS(1),
    [anon_sym_DQUOTE] = ACTIONS(1),
    [anon_sym_BQUOTE] = ACTIONS(1),
    [anon_sym_BQUOTE_BQUOTE_BQUOTE] = ACTIONS(1),
    [aux_sym_filename_escaped_char_token1] = ACTIONS(1),
    [anon_sym_COMMA] = ACTIONS(1),
    [anon_sym_LBRACK] = ACTIONS(1),
    [anon_sym_RBRACK] = ACTIONS(1),
    [anon_sym_LBRACE_LBRACE] = ACTIONS(1),
    [aux_sym_variable_name_token1] = ACTIONS(1),
    [sym__alphanum] = ACTIONS(1),
    [aux_sym_digit_token1] = ACTIONS(1),
    [aux_sym_hexdigit_token1] = ACTIONS(1),
    [anon_sym_DOT] = ACTIONS(1),
    [anon_sym_e] = ACTIONS(1),
    [anon_sym_E] = ACTIONS(1),
    [anon_sym_PLUS] = ACTIONS(1),
    [anon_sym_DASH] = ACTIONS(1),
    [sym_comment] = ACTIONS(3),
    [anon_sym_SLASH] = ACTIONS(1),
  },
  [1] = {
    [sym_hurl_file] = STATE(572),
    [sym_entry] = STATE(88),
    [sym__comment_or_new_line] = STATE(101),
    [sym_request] = STATE(85),
    [sym_method] = STATE(153),
    [aux_sym_hurl_file_repeat1] = STATE(88),
    [aux_sym_hurl_file_repeat2] = STATE(101),
    [aux_sym__comment_or_new_line_repeat1] = STATE(46),
    [ts_builtin_sym_end] = ACTIONS(5),
    [anon_sym_LF] = ACTIONS(7),
    [anon_sym_GET] = ACTIONS(9),
    [anon_sym_HEAD] = ACTIONS(9),
    [anon_sym_POST] = ACTIONS(9),
    [anon_sym_PUT] = ACTIONS(9),
    [anon_sym_DELETE] = ACTIONS(9),
    [anon_sym_CONNECT] = ACTIONS(9),
    [anon_sym_OPTIONS] = ACTIONS(9),
    [anon_sym_TRACE] = ACTIONS(9),
    [anon_sym_PATCH] = ACTIONS(9),
    [anon_sym_LINK] = ACTIONS(9),
    [anon_sym_UNLINK] = ACTIONS(9),
    [anon_sym_PURGE] = ACTIONS(9),
    [anon_sym_LOCK] = ACTIONS(9),
    [anon_sym_UNLOCK] = ACTIONS(9),
    [anon_sym_PROPFIND] = ACTIONS(9),
    [anon_sym_VIEW] = ACTIONS(9),
    [aux_sym_method_token1] = ACTIONS(9),
    [sym_comment] = ACTIONS(11),
  },
  [2] = {
    [sym_option] = STATE(417),
    [sym_ca_certificate_option] = STATE(587),
    [sym_cert_option] = STATE(587),
    [sym_boolean_option] = STATE(587),
    [sym_boolean_option_key] = STATE(586),
    [sym_integer_option] = STATE(587),
    [sym_integer_option_key] = STATE(585),
    [sym_duration_option] = STATE(587),
    [sym_duration_option_key] = STATE(584),
    [sym_string_option] = STATE(587),
    [sym_string_option_key] = STATE(583),
    [sym_variable_option] = STATE(587),
    [aux_sym_options_section_repeat1] = STATE(3),
    [ts_builtin_sym_end] = ACTIONS(13),
    [anon_sym_LF] = ACTIONS(13),
    [anon_sym_GET] = ACTIONS(15),
    [anon_sym_HEAD] = ACTIONS(15),
    [anon_sym_POST] = ACTIONS(15),
    [anon_sym_PUT] = ACTIONS(15),
    [anon_sym_DELETE] = ACTIONS(15),
    [anon_sym_CONNECT] = ACTIONS(15),
    [anon_sym_OPTIONS] = ACTIONS(15),
    [anon_sym_TRACE] = ACTIONS(15),
    [anon_sym_PATCH] = ACTIONS(15),
    [anon_sym_LINK] = ACTIONS(15),
    [anon_sym_UNLINK] = ACTIONS(15),
    [anon_sym_PURGE] = ACTIONS(15),
    [anon_sym_LOCK] = ACTIONS(15),
    [anon_sym_UNLOCK] = ACTIONS(15),
    [anon_sym_PROPFIND] = ACTIONS(15),
    [anon_sym_VIEW] = ACTIONS(15),
    [aux_sym_method_token1] = ACTIONS(15),
    [anon_sym_HTTP_SLASH1_DOT0] = ACTIONS(15),
    [anon_sym_HTTP_SLASH1_DOT1] = ACTIONS(15),
    [anon_sym_HTTP_SLASH2] = ACTIONS(15),
    [anon_sym_HTTP_SLASH3] = ACTIONS(15),
    [anon_sym_HTTP_SLASH_STAR] = ACTIONS(15),
    [anon_sym_HTTP] = ACTIONS(15),
    [anon_sym_LBRACKBasicAuth_RBRACK] = ACTIONS(15),
    [anon_sym_LBRACKQuery_RBRACK] = ACTIONS(15),
    [anon_sym_LBRACKQueryStringParams_RBRACK] = ACTIONS(15),
    [anon_sym_LBRACKForm_RBRACK] = ACTIONS(15),
    [anon_sym_LBRACKFormParams_RBRACK] = ACTIONS(15),
    [anon_sym_LBRACKMultipart_RBRACK] = ACTIONS(15),
    [anon_sym_LBRACKMultipartFormData_RBRACK] = ACTIONS(15),
    [anon_sym_LBRACKCookies_RBRACK] = ACTIONS(15),
    [anon_sym_LBRACKOptions_RBRACK] = ACTIONS(15),
    [anon_sym_null] = ACTIONS(15),
    [anon_sym_file_COMMA] = ACTIONS(15),
    [anon_sym_cacert] = ACTIONS(17),
    [anon_sym_cert] = ACTIONS(19),
    [anon_sym_LBRACE] = ACTIONS(15),
    [anon_sym_compressed] = ACTIONS(21),
    [anon_sym_location] = ACTIONS(21),
    [anon_sym_location_DASHtrusted] = ACTIONS(21),
    [anon_sym_http1_DOT0] = ACTIONS(21),
    [anon_sym_http2] = ACTIONS(21),
    [anon_sym_http3] = ACTIONS(21),
    [anon_sym_insecure] = ACTIONS(21),
    [anon_sym_ipv4] = ACTIONS(21),
    [anon_sym_ipv6] = ACTIONS(21),
    [anon_sym_netrc] = ACTIONS(21),
    [anon_sym_netrc_DASHoptional] = ACTIONS(21),
    [anon_sym_path_DASHas_DASHis] = ACTIONS(21),
    [anon_sym_skip] = ACTIONS(21),
    [anon_sym_verbose] = ACTIONS(21),
    [anon_sym_very_DASHverbose] = ACTIONS(21),
    [anon_sym_max_DASHredirs] = ACTIONS(23),
    [anon_sym_retry_DASHmax_DASHcount] = ACTIONS(23),
    [anon_sym_limit_DASHrate] = ACTIONS(23),
    [anon_sym_max_DASHtime] = ACTIONS(23),
    [anon_sym_repeat] = ACTIONS(23),
    [anon_sym_retry] = ACTIONS(23),
    [anon_sym_connect_DASHtimeout] = ACTIONS(25),
    [anon_sym_delay] = ACTIONS(25),
    [anon_sym_retry_DASHinterval] = ACTIONS(25),
    [anon_sym_aws_DASHsigv4] = ACTIONS(27),
    [anon_sym_key] = ACTIONS(27),
    [anon_sym_connect_DASHto] = ACTIONS(27),
    [anon_sym_header] = ACTIONS(27),
    [anon_sym_netrc_DASHfile] = ACTIONS(27),
    [anon_sym_output] = ACTIONS(27),
    [anon_sym_pinnedpubkey] = ACTIONS(27),
    [anon_sym_proxy] = ACTIONS(27),
    [anon_sym_unix_DASHsocket] = ACTIONS(27),
    [anon_sym_user] = ACTIONS(27),
    [anon_sym_variable] = ACTIONS(29),
    [anon_sym_LT] = ACTIONS(15),
    [anon_sym_LT_QMARK] = ACTIONS(15),
    [anon_sym_base64_COMMA] = ACTIONS(15),
    [anon_sym_hex_COMMA] = ACTIONS(15),
    [anon_sym_DQUOTE] = ACTIONS(15),
    [aux_sym_oneline_string_token1] = ACTIONS(15),
    [anon_sym_BQUOTE_BQUOTE_BQUOTE] = ACTIONS(15),
    [anon_sym_LBRACK] = ACTIONS(15),
    [anon_sym_true] = ACTIONS(15),
    [anon_sym_false] = ACTIONS(15),
    [anon_sym_LBRACE_LBRACE] = ACTIONS(15),
    [aux_sym_digit_token1] = ACTIONS(15),
    [sym_comment] = ACTIONS(15),
  },
  [3] = {
    [sym_option] = STATE(417),
    [sym_ca_certificate_option] = STATE(587),
    [sym_cert_option] = STATE(587),
    [sym_boolean_option] = STATE(587),
    [sym_boolean_option_key] = STATE(586),
    [sym_integer_option] = STATE(587),
    [sym_integer_option_key] = STATE(585),
    [sym_duration_option] = STATE(587),
    [sym_duration_option_key] = STATE(584),
    [sym_string_option] = STATE(587),
    [sym_string_option_key] = STATE(583),
    [sym_variable_option] = STATE(587),
    [aux_sym_options_section_repeat1] = STATE(3),
    [ts_builtin_sym_end] = ACTIONS(31),
    [anon_sym_LF] = ACTIONS(31),
    [anon_sym_GET] = ACTIONS(33),
    [anon_sym_HEAD] = ACTIONS(33),
    [anon_sym_POST] = ACTIONS(33),
    [anon_sym_PUT] = ACTIONS(33),
    [anon_sym_DELETE] = ACTIONS(33),
    [anon_sym_CONNECT] = ACTIONS(33),
    [anon_sym_OPTIONS] = ACTIONS(33),
    [anon_sym_TRACE] = ACTIONS(33),
    [anon_sym_PATCH] = ACTIONS(33),
    [anon_sym_LINK] = ACTIONS(33),
    [anon_sym_UNLINK] = ACTIONS(33),
    [anon_sym_PURGE] = ACTIONS(33),
    [anon_sym_LOCK] = ACTIONS(33),
    [anon_sym_UNLOCK] = ACTIONS(33),
    [anon_sym_PROPFIND] = ACTIONS(33),
    [anon_sym_VIEW] = ACTIONS(33),
    [aux_sym_method_token1] = ACTIONS(33),
    [anon_sym_HTTP_SLASH1_DOT0] = ACTIONS(33),
    [anon_sym_HTTP_SLASH1_DOT1] = ACTIONS(33),
    [anon_sym_HTTP_SLASH2] = ACTIONS(33),
    [anon_sym_HTTP_SLASH3] = ACTIONS(33),
    [anon_sym_HTTP_SLASH_STAR] = ACTIONS(33),
    [anon_sym_HTTP] = ACTIONS(33),
    [anon_sym_LBRACKBasicAuth_RBRACK] = ACTIONS(33),
    [anon_sym_LBRACKQuery_RBRACK] = ACTIONS(33),
    [anon_sym_LBRACKQueryStringParams_RBRACK] = ACTIONS(33),
    [anon_sym_LBRACKForm_RBRACK] = ACTIONS(33),
    [anon_sym_LBRACKFormParams_RBRACK] = ACTIONS(33),
    [anon_sym_LBRACKMultipart_RBRACK] = ACTIONS(33),
    [anon_sym_LBRACKMultipartFormData_RBRACK] = ACTIONS(33),
    [anon_sym_LBRACKCookies_RBRACK] = ACTIONS(33),
    [anon_sym_LBRACKOptions_RBRACK] = ACTIONS(33),
    [anon_sym_null] = ACTIONS(33),
    [anon_sym_file_COMMA] = ACTIONS(33),
    [anon_sym_cacert] = ACTIONS(35),
    [anon_sym_cert] = ACTIONS(38),
    [anon_sym_LBRACE] = ACTIONS(33),
    [anon_sym_compressed] = ACTIONS(41),
    [anon_sym_location] = ACTIONS(41),
    [anon_sym_location_DASHtrusted] = ACTIONS(41),
    [anon_sym_http1_DOT0] = ACTIONS(41),
    [anon_sym_http2] = ACTIONS(41),
    [anon_sym_http3] = ACTIONS(41),
    [anon_sym_insecure] = ACTIONS(41),
    [anon_sym_ipv4] = ACTIONS(41),
    [anon_sym_ipv6] = ACTIONS(41),
    [anon_sym_netrc] = ACTIONS(41),
    [anon_sym_netrc_DASHoptional] = ACTIONS(41),
    [anon_sym_path_DASHas_DASHis] = ACTIONS(41),
    [anon_sym_skip] = ACTIONS(41),
    [anon_sym_verbose] = ACTIONS(41),
    [anon_sym_very_DASHverbose] = ACTIONS(41),
    [anon_sym_max_DASHredirs] = ACTIONS(44),
    [anon_sym_retry_DASHmax_DASHcount] = ACTIONS(44),
    [anon_sym_limit_DASHrate] = ACTIONS(44),
    [anon_sym_max_DASHtime] = ACTIONS(44),
    [anon_sym_repeat] = ACTIONS(44),
    [anon_sym_retry] = ACTIONS(44),
    [anon_sym_connect_DASHtimeout] = ACTIONS(47),
    [anon_sym_delay] = ACTIONS(47),
    [anon_sym_retry_DASHinterval] = ACTIONS(47),
    [anon_sym_aws_DASHsigv4] = ACTIONS(50),
    [anon_sym_key] = ACTIONS(50),
    [anon_sym_connect_DASHto] = ACTIONS(50),
    [anon_sym_header] = ACTIONS(50),
    [anon_sym_netrc_DASHfile] = ACTIONS(50),
    [anon_sym_output] = ACTIONS(50),
    [anon_sym_pinnedpubkey] = ACTIONS(50),
    [anon_sym_proxy] = ACTIONS(50),
    [anon_sym_unix_DASHsocket] = ACTIONS(50),
    [anon_sym_user] = ACTIONS(50),
    [anon_sym_variable] = ACTIONS(53),
    [anon_sym_LT] = ACTIONS(33),
    [anon_sym_LT_QMARK] = ACTIONS(33),
    [anon_sym_base64_COMMA] = ACTIONS(33),
    [anon_sym_hex_COMMA] = ACTIONS(33),
    [anon_sym_DQUOTE] = ACTIONS(33),
    [aux_sym_oneline_string_token1] = ACTIONS(33),
    [anon_sym_BQUOTE_BQUOTE_BQUOTE] = ACTIONS(33),
    [anon_sym_LBRACK] = ACTIONS(33),
    [anon_sym_true] = ACTIONS(33),
    [anon_sym_false] = ACTIONS(33),
    [anon_sym_LBRACE_LBRACE] = ACTIONS(33),
    [aux_sym_digit_token1] = ACTIONS(33),
    [sym_comment] = ACTIONS(33),
  },
  [4] = {
    [sym_option] = STATE(417),
    [sym_ca_certificate_option] = STATE(587),
    [sym_cert_option] = STATE(587),
    [sym_boolean_option] = STATE(587),
    [sym_boolean_option_key] = STATE(586),
    [sym_integer_option] = STATE(587),
    [sym_integer_option_key] = STATE(585),
    [sym_duration_option] = STATE(587),
    [sym_duration_option_key] = STATE(584),
    [sym_string_option] = STATE(587),
    [sym_string_option_key] = STATE(583),
    [sym_variable_option] = STATE(587),
    [aux_sym_options_section_repeat1] = STATE(2),
    [ts_builtin_sym_end] = ACTIONS(56),
    [anon_sym_LF] = ACTIONS(56),
    [anon_sym_GET] = ACTIONS(58),
    [anon_sym_HEAD] = ACTIONS(58),
    [anon_sym_POST] = ACTIONS(58),
    [anon_sym_PUT] = ACTIONS(58),
    [anon_sym_DELETE] = ACTIONS(58),
    [anon_sym_CONNECT] = ACTIONS(58),
    [anon_sym_OPTIONS] = ACTIONS(58),
    [anon_sym_TRACE] = ACTIONS(58),
    [anon_sym_PATCH] = ACTIONS(58),
    [anon_sym_LINK] = ACTIONS(58),
    [anon_sym_UNLINK] = ACTIONS(58),
    [anon_sym_PURGE] = ACTIONS(58),
    [anon_sym_LOCK] = ACTIONS(58),
    [anon_sym_UNLOCK] = ACTIONS(58),
    [anon_sym_PROPFIND] = ACTIONS(58),
    [anon_sym_VIEW] = ACTIONS(58),
    [aux_sym_method_token1] = ACTIONS(58),
    [anon_sym_HTTP_SLASH1_DOT0] = ACTIONS(58),
    [anon_sym_HTTP_SLASH1_DOT1] = ACTIONS(58),
    [anon_sym_HTTP_SLASH2] = ACTIONS(58),
    [anon_sym_HTTP_SLASH3] = ACTIONS(58),
    [anon_sym_HTTP_SLASH_STAR] = ACTIONS(58),
    [anon_sym_HTTP] = ACTIONS(58),
    [anon_sym_LBRACKBasicAuth_RBRACK] = ACTIONS(58),
    [anon_sym_LBRACKQuery_RBRACK] = ACTIONS(58),
    [anon_sym_LBRACKQueryStringParams_RBRACK] = ACTIONS(58),
    [anon_sym_LBRACKForm_RBRACK] = ACTIONS(58),
    [anon_sym_LBRACKFormParams_RBRACK] = ACTIONS(58),
    [anon_sym_LBRACKMultipart_RBRACK] = ACTIONS(58),
    [anon_sym_LBRACKMultipartFormData_RBRACK] = ACTIONS(58),
    [anon_sym_LBRACKCookies_RBRACK] = ACTIONS(58),
    [anon_sym_LBRACKOptions_RBRACK] = ACTIONS(58),
    [anon_sym_null] = ACTIONS(58),
    [anon_sym_file_COMMA] = ACTIONS(58),
    [anon_sym_cacert] = ACTIONS(17),
    [anon_sym_cert] = ACTIONS(19),
    [anon_sym_LBRACE] = ACTIONS(58),
    [anon_sym_compressed] = ACTIONS(21),
    [anon_sym_location] = ACTIONS(21),
    [anon_sym_location_DASHtrusted] = ACTIONS(21),
    [anon_sym_http1_DOT0] = ACTIONS(21),
    [anon_sym_http2] = ACTIONS(21),
    [anon_sym_http3] = ACTIONS(21),
    [anon_sym_insecure] = ACTIONS(21),
    [anon_sym_ipv4] = ACTIONS(21),
    [anon_sym_ipv6] = ACTIONS(21),
    [anon_sym_netrc] = ACTIONS(21),
    [anon_sym_netrc_DASHoptional] = ACTIONS(21),
    [anon_sym_path_DASHas_DASHis] = ACTIONS(21),
    [anon_sym_skip] = ACTIONS(21),
    [anon_sym_verbose] = ACTIONS(21),
    [anon_sym_very_DASHverbose] = ACTIONS(21),
    [anon_sym_max_DASHredirs] = ACTIONS(23),
    [anon_sym_retry_DASHmax_DASHcount] = ACTIONS(23),
    [anon_sym_limit_DASHrate] = ACTIONS(23),
    [anon_sym_max_DASHtime] = ACTIONS(23),
    [anon_sym_repeat] = ACTIONS(23),
    [anon_sym_retry] = ACTIONS(23),
    [anon_sym_connect_DASHtimeout] = ACTIONS(25),
    [anon_sym_delay] = ACTIONS(25),
    [anon_sym_retry_DASHinterval] = ACTIONS(25),
    [anon_sym_aws_DASHsigv4] = ACTIONS(27),
    [anon_sym_key] = ACTIONS(27),
    [anon_sym_connect_DASHto] = ACTIONS(27),
    [anon_sym_header] = ACTIONS(27),
    [anon_sym_netrc_DASHfile] = ACTIONS(27),
    [anon_sym_output] = ACTIONS(27),
    [anon_sym_pinnedpubkey] = ACTIONS(27),
    [anon_sym_proxy] = ACTIONS(27),
    [anon_sym_unix_DASHsocket] = ACTIONS(27),
    [anon_sym_user] = ACTIONS(27),
    [anon_sym_variable] = ACTIONS(29),
    [anon_sym_LT] = ACTIONS(58),
    [anon_sym_LT_QMARK] = ACTIONS(58),
    [anon_sym_base64_COMMA] = ACTIONS(58),
    [anon_sym_hex_COMMA] = ACTIONS(58),
    [anon_sym_DQUOTE] = ACTIONS(58),
    [aux_sym_oneline_string_token1] = ACTIONS(58),
    [anon_sym_BQUOTE_BQUOTE_BQUOTE] = ACTIONS(58),
    [anon_sym_LBRACK] = ACTIONS(58),
    [anon_sym_true] = ACTIONS(58),
    [anon_sym_false] = ACTIONS(58),
    [anon_sym_LBRACE_LBRACE] = ACTIONS(58),
    [aux_sym_digit_token1] = ACTIONS(58),
    [sym_comment] = ACTIONS(58),
  },
  [5] = {
    [sym__comment_or_new_line] = STATE(39),
    [sym_header] = STATE(7),
    [sym_body] = STATE(97),
    [sym_request_section] = STATE(12),
    [sym_basic_auth_section] = STATE(51),
    [sym_query_string_params_section] = STATE(51),
    [sym_form_params_section] = STATE(51),
    [sym_multipart_form_data_section] = STATE(51),
    [sym_cookies_section] = STATE(51),
    [sym_options_section] = STATE(51),
    [sym_key_value] = STATE(343),
    [sym_bytes] = STATE(346),
    [sym_xml] = STATE(492),
    [sym_xml_prolog_tag] = STATE(236),
    [sym_xml_tag] = STATE(493),
    [sym_xml_open_tag] = STATE(151),
    [sym_oneline_base64] = STATE(492),
    [sym_oneline_file] = STATE(492),
    [sym_oneline_hex] = STATE(492),
    [sym_key_string] = STATE(498),
    [sym_key_string_content] = STATE(192),
    [sym_key_string_escaped_char] = STATE(234),
    [sym_oneline_string] = STATE(492),
    [sym_multiline_string] = STATE(492),
    [sym_json_value] = STATE(492),
    [sym_json_object] = STATE(497),
    [sym_json_array] = STATE(497),
    [sym_json_string] = STATE(497),
    [sym_json_number] = STATE(497),
    [sym_json_boolean] = STATE(497),
    [sym_template] = STATE(264),
    [sym_json_integer] = STATE(237),
    [sym_json_digit] = STATE(212),
    [aux_sym_hurl_file_repeat2] = STATE(39),
    [aux_sym__comment_or_new_line_repeat1] = STATE(41),
    [aux_sym_request_repeat1] = STATE(7),
    [aux_sym_request_repeat2] = STATE(12),
    [aux_sym_xml_repeat1] = STATE(236),
    [aux_sym_key_string_repeat1] = STATE(192),
    [aux_sym_key_string_content_repeat1] = STATE(234),
    [aux_sym_json_integer_repeat1] = STATE(212),
    [ts_builtin_sym_end] = ACTIONS(60),
    [anon_sym_LF] = ACTIONS(60),
    [anon_sym_GET] = ACTIONS(62),
    [anon_sym_HEAD] = ACTIONS(62),
    [anon_sym_POST] = ACTIONS(62),
    [anon_sym_PUT] = ACTIONS(62),
    [anon_sym_DELETE] = ACTIONS(62),
    [anon_sym_CONNECT] = ACTIONS(62),
    [anon_sym_OPTIONS] = ACTIONS(62),
    [anon_sym_TRACE] = ACTIONS(62),
    [anon_sym_PATCH] = ACTIONS(62),
    [anon_sym_LINK] = ACTIONS(62),
    [anon_sym_UNLINK] = ACTIONS(62),
    [anon_sym_PURGE] = ACTIONS(62),
    [anon_sym_LOCK] = ACTIONS(62),
    [anon_sym_UNLOCK] = ACTIONS(62),
    [anon_sym_PROPFIND] = ACTIONS(62),
    [anon_sym_VIEW] = ACTIONS(62),
    [aux_sym_method_token1] = ACTIONS(62),
    [anon_sym_HTTP_SLASH1_DOT0] = ACTIONS(62),
    [anon_sym_HTTP_SLASH1_DOT1] = ACTIONS(62),
    [anon_sym_HTTP_SLASH2] = ACTIONS(62),
    [anon_sym_HTTP_SLASH3] = ACTIONS(62),
    [anon_sym_HTTP_SLASH_STAR] = ACTIONS(62),
    [anon_sym_HTTP] = ACTIONS(62),
    [anon_sym_LBRACKBasicAuth_RBRACK] = ACTIONS(64),
    [anon_sym_LBRACKQuery_RBRACK] = ACTIONS(66),
    [anon_sym_LBRACKQueryStringParams_RBRACK] = ACTIONS(66),
    [anon_sym_LBRACKForm_RBRACK] = ACTIONS(68),
    [anon_sym_LBRACKFormParams_RBRACK] = ACTIONS(68),
    [anon_sym_LBRACKMultipart_RBRACK] = ACTIONS(70),
    [anon_sym_LBRACKMultipartFormData_RBRACK] = ACTIONS(70),
    [anon_sym_LBRACKCookies_RBRACK] = ACTIONS(72),
    [anon_sym_LBRACKOptions_RBRACK] = ACTIONS(74),
    [anon_sym_null] = ACTIONS(76),
    [anon_sym_file_COMMA] = ACTIONS(78),
    [anon_sym_BSLASH] = ACTIONS(80),
    [anon_sym_LBRACE] = ACTIONS(82),
    [anon_sym_LT] = ACTIONS(84),
    [anon_sym_LT_QMARK] = ACTIONS(86),
    [anon_sym_base64_COMMA] = ACTIONS(88),
    [anon_sym_hex_COMMA] = ACTIONS(90),
    [anon_sym_DQUOTE] = ACTIONS(92),
    [sym_key_string_text] = ACTIONS(94),
    [aux_sym_oneline_string_token1] = ACTIONS(96),
    [anon_sym_BQUOTE_BQUOTE_BQUOTE] = ACTIONS(98),
    [anon_sym_LBRACK] = ACTIONS(100),
    [anon_sym_true] = ACTIONS(102),
    [anon_sym_false] = ACTIONS(102),
    [anon_sym_LBRACE_LBRACE] = ACTIONS(104),
    [aux_sym_digit_token1] = ACTIONS(106),
    [sym_comment] = ACTIONS(62),
  },
  [6] = {
    [sym__comment_or_new_line] = STATE(39),
    [sym_header] = STATE(8),
    [sym_body] = STATE(96),
    [sym_request_section] = STATE(13),
    [sym_basic_auth_section] = STATE(51),
    [sym_query_string_params_section] = STATE(51),
    [sym_form_params_section] = STATE(51),
    [sym_multipart_form_data_section] = STATE(51),
    [sym_cookies_section] = STATE(51),
    [sym_options_section] = STATE(51),
    [sym_key_value] = STATE(343),
    [sym_bytes] = STATE(346),
    [sym_xml] = STATE(492),
    [sym_xml_prolog_tag] = STATE(236),
    [sym_xml_tag] = STATE(493),
    [sym_xml_open_tag] = STATE(151),
    [sym_oneline_base64] = STATE(492),
    [sym_oneline_file] = STATE(492),
    [sym_oneline_hex] = STATE(492),
    [sym_key_string] = STATE(498),
    [sym_key_string_content] = STATE(192),
    [sym_key_string_escaped_char] = STATE(234),
    [sym_oneline_string] = STATE(492),
    [sym_multiline_string] = STATE(492),
    [sym_json_value] = STATE(492),
    [sym_json_object] = STATE(497),
    [sym_json_array] = STATE(497),
    [sym_json_string] = STATE(497),
    [sym_json_number] = STATE(497),
    [sym_json_boolean] = STATE(497),
    [sym_template] = STATE(264),
    [sym_json_integer] = STATE(237),
    [sym_json_digit] = STATE(212),
    [aux_sym_hurl_file_repeat2] = STATE(39),
    [aux_sym__comment_or_new_line_repeat1] = STATE(41),
    [aux_sym_request_repeat1] = STATE(8),
    [aux_sym_request_repeat2] = STATE(13),
    [aux_sym_xml_repeat1] = STATE(236),
    [aux_sym_key_string_repeat1] = STATE(192),
    [aux_sym_key_string_content_repeat1] = STATE(234),
    [aux_sym_json_integer_repeat1] = STATE(212),
    [ts_builtin_sym_end] = ACTIONS(108),
    [anon_sym_LF] = ACTIONS(108),
    [anon_sym_GET] = ACTIONS(110),
    [anon_sym_HEAD] = ACTIONS(110),
    [anon_sym_POST] = ACTIONS(110),
    [anon_sym_PUT] = ACTIONS(110),
    [anon_sym_DELETE] = ACTIONS(110),
    [anon_sym_CONNECT] = ACTIONS(110),
    [anon_sym_OPTIONS] = ACTIONS(110),
    [anon_sym_TRACE] = ACTIONS(110),
    [anon_sym_PATCH] = ACTIONS(110),
    [anon_sym_LINK] = ACTIONS(110),
    [anon_sym_UNLINK] = ACTIONS(110),
    [anon_sym_PURGE] = ACTIONS(110),
    [anon_sym_LOCK] = ACTIONS(110),
    [anon_sym_UNLOCK] = ACTIONS(110),
    [anon_sym_PROPFIND] = ACTIONS(110),
    [anon_sym_VIEW] = ACTIONS(110),
    [aux_sym_method_token1] = ACTIONS(110),
    [anon_sym_HTTP_SLASH1_DOT0] = ACTIONS(110),
    [anon_sym_HTTP_SLASH1_DOT1] = ACTIONS(110),
    [anon_sym_HTTP_SLASH2] = ACTIONS(110),
    [anon_sym_HTTP_SLASH3] = ACTIONS(110),
    [anon_sym_HTTP_SLASH_STAR] = ACTIONS(110),
    [anon_sym_HTTP] = ACTIONS(110),
    [anon_sym_LBRACKBasicAuth_RBRACK] = ACTIONS(64),
    [anon_sym_LBRACKQuery_RBRACK] = ACTIONS(66),
    [anon_sym_LBRACKQueryStringParams_RBRACK] = ACTIONS(66),
    [anon_sym_LBRACKForm_RBRACK] = ACTIONS(68),
    [anon_sym_LBRACKFormParams_RBRACK] = ACTIONS(68),
    [anon_sym_LBRACKMultipart_RBRACK] = ACTIONS(70),
    [anon_sym_LBRACKMultipartFormData_RBRACK] = ACTIONS(70),
    [anon_sym_LBRACKCookies_RBRACK] = ACTIONS(72),
    [anon_sym_LBRACKOptions_RBRACK] = ACTIONS(74),
    [anon_sym_null] = ACTIONS(76),
    [anon_sym_file_COMMA] = ACTIONS(78),
    [anon_sym_BSLASH] = ACTIONS(80),
    [anon_sym_LBRACE] = ACTIONS(82),
    [anon_sym_LT] = ACTIONS(84),
    [anon_sym_LT_QMARK] = ACTIONS(86),
    [anon_sym_base64_COMMA] = ACTIONS(88),
    [anon_sym_hex_COMMA] = ACTIONS(90),
    [anon_sym_DQUOTE] = ACTIONS(92),
    [sym_key_string_text] = ACTIONS(94),
    [aux_sym_oneline_string_token1] = ACTIONS(96),
    [anon_sym_BQUOTE_BQUOTE_BQUOTE] = ACTIONS(98),
    [anon_sym_LBRACK] = ACTIONS(100),
    [anon_sym_true] = ACTIONS(102),
    [anon_sym_false] = ACTIONS(102),
    [anon_sym_LBRACE_LBRACE] = ACTIONS(104),
    [aux_sym_digit_token1] = ACTIONS(106),
    [sym_comment] = ACTIONS(110),
  },
  [7] = {
    [sym_header] = STATE(24),
    [sym_body] = STATE(94),
    [sym_request_section] = STATE(14),
    [sym_basic_auth_section] = STATE(51),
    [sym_query_string_params_section] = STATE(51),
    [sym_form_params_section] = STATE(51),
    [sym_multipart_form_data_section] = STATE(51),
    [sym_cookies_section] = STATE(51),
    [sym_options_section] = STATE(51),
    [sym_key_value] = STATE(343),
    [sym_bytes] = STATE(346),
    [sym_xml] = STATE(492),
    [sym_xml_prolog_tag] = STATE(236),
    [sym_xml_tag] = STATE(493),
    [sym_xml_open_tag] = STATE(151),
    [sym_oneline_base64] = STATE(492),
    [sym_oneline_file] = STATE(492),
    [sym_oneline_hex] = STATE(492),
    [sym_key_string] = STATE(498),
    [sym_key_string_content] = STATE(192),
    [sym_key_string_escaped_char] = STATE(234),
    [sym_oneline_string] = STATE(492),
    [sym_multiline_string] = STATE(492),
    [sym_json_value] = STATE(492),
    [sym_json_object] = STATE(497),
    [sym_json_array] = STATE(497),
    [sym_json_string] = STATE(497),
    [sym_json_number] = STATE(497),
    [sym_json_boolean] = STATE(497),
    [sym_template] = STATE(264),
    [sym_json_integer] = STATE(237),
    [sym_json_digit] = STATE(212),
    [aux_sym_request_repeat1] = STATE(24),
    [aux_sym_request_repeat2] = STATE(14),
    [aux_sym_xml_repeat1] = STATE(236),
    [aux_sym_key_string_repeat1] = STATE(192),
    [aux_sym_key_string_content_repeat1] = STATE(234),
    [aux_sym_json_integer_repeat1] = STATE(212),
    [ts_builtin_sym_end] = ACTIONS(112),
    [anon_sym_LF] = ACTIONS(112),
    [anon_sym_GET] = ACTIONS(114),
    [anon_sym_HEAD] = ACTIONS(114),
    [anon_sym_POST] = ACTIONS(114),
    [anon_sym_PUT] = ACTIONS(114),
    [anon_sym_DELETE] = ACTIONS(114),
    [anon_sym_CONNECT] = ACTIONS(114),
    [anon_sym_OPTIONS] = ACTIONS(114),
    [anon_sym_TRACE] = ACTIONS(114),
    [anon_sym_PATCH] = ACTIONS(114),
    [anon_sym_LINK] = ACTIONS(114),
    [anon_sym_UNLINK] = ACTIONS(114),
    [anon_sym_PURGE] = ACTIONS(114),
    [anon_sym_LOCK] = ACTIONS(114),
    [anon_sym_UNLOCK] = ACTIONS(114),
    [anon_sym_PROPFIND] = ACTIONS(114),
    [anon_sym_VIEW] = ACTIONS(114),
    [aux_sym_method_token1] = ACTIONS(114),
    [anon_sym_HTTP_SLASH1_DOT0] = ACTIONS(114),
    [anon_sym_HTTP_SLASH1_DOT1] = ACTIONS(114),
    [anon_sym_HTTP_SLASH2] = ACTIONS(114),
    [anon_sym_HTTP_SLASH3] = ACTIONS(114),
    [anon_sym_HTTP_SLASH_STAR] = ACTIONS(114),
    [anon_sym_HTTP] = ACTIONS(114),
    [anon_sym_LBRACKBasicAuth_RBRACK] = ACTIONS(64),
    [anon_sym_LBRACKQuery_RBRACK] = ACTIONS(66),
    [anon_sym_LBRACKQueryStringParams_RBRACK] = ACTIONS(66),
    [anon_sym_LBRACKForm_RBRACK] = ACTIONS(68),
    [anon_sym_LBRACKFormParams_RBRACK] = ACTIONS(68),
    [anon_sym_LBRACKMultipart_RBRACK] = ACTIONS(70),
    [anon_sym_LBRACKMultipartFormData_RBRACK] = ACTIONS(70),
    [anon_sym_LBRACKCookies_RBRACK] = ACTIONS(72),
    [anon_sym_LBRACKOptions_RBRACK] = ACTIONS(74),
    [anon_sym_null] = ACTIONS(76),
    [anon_sym_file_COMMA] = ACTIONS(78),
    [anon_sym_BSLASH] = ACTIONS(80),
    [anon_sym_LBRACE] = ACTIONS(82),
    [anon_sym_LT] = ACTIONS(84),
    [anon_sym_LT_QMARK] = ACTIONS(86),
    [anon_sym_base64_COMMA] = ACTIONS(88),
    [anon_sym_hex_COMMA] = ACTIONS(90),
    [anon_sym_DQUOTE] = ACTIONS(92),
    [sym_key_string_text] = ACTIONS(94),
    [aux_sym_oneline_string_token1] = ACTIONS(96),
    [anon_sym_BQUOTE_BQUOTE_BQUOTE] = ACTIONS(98),
    [anon_sym_LBRACK] = ACTIONS(100),
    [anon_sym_true] = ACTIONS(102),
    [anon_sym_false] = ACTIONS(102),
    [anon_sym_LBRACE_LBRACE] = ACTIONS(104),
    [aux_sym_digit_token1] = ACTIONS(106),
    [sym_comment] = ACTIONS(114),
  },
  [8] = {
    [sym_header] = STATE(24),
    [sym_body] = STATE(97),
    [sym_request_section] = STATE(12),
    [sym_basic_auth_section] = STATE(51),
    [sym_query_string_params_section] = STATE(51),
    [sym_form_params_section] = STATE(51),
    [sym_multipart_form_data_section] = STATE(51),
    [sym_cookies_section] = STATE(51),
    [sym_options_section] = STATE(51),
    [sym_key_value] = STATE(343),
    [sym_bytes] = STATE(346),
    [sym_xml] = STATE(492),
    [sym_xml_prolog_tag] = STATE(236),
    [sym_xml_tag] = STATE(493),
    [sym_xml_open_tag] = STATE(151),
    [sym_oneline_base64] = STATE(492),
    [sym_oneline_file] = STATE(492),
    [sym_oneline_hex] = STATE(492),
    [sym_key_string] = STATE(498),
    [sym_key_string_content] = STATE(192),
    [sym_key_string_escaped_char] = STATE(234),
    [sym_oneline_string] = STATE(492),
    [sym_multiline_string] = STATE(492),
    [sym_json_value] = STATE(492),
    [sym_json_object] = STATE(497),
    [sym_json_array] = STATE(497),
    [sym_json_string] = STATE(497),
    [sym_json_number] = STATE(497),
    [sym_json_boolean] = STATE(497),
    [sym_template] = STATE(264),
    [sym_json_integer] = STATE(237),
    [sym_json_digit] = STATE(212),
    [aux_sym_request_repeat1] = STATE(24),
    [aux_sym_request_repeat2] = STATE(12),
    [aux_sym_xml_repeat1] = STATE(236),
    [aux_sym_key_string_repeat1] = STATE(192),
    [aux_sym_key_string_content_repeat1] = STATE(234),
    [aux_sym_json_integer_repeat1] = STATE(212),
    [ts_builtin_sym_end] = ACTIONS(60),
    [anon_sym_LF] = ACTIONS(60),
    [anon_sym_GET] = ACTIONS(62),
    [anon_sym_HEAD] = ACTIONS(62),
    [anon_sym_POST] = ACTIONS(62),
    [anon_sym_PUT] = ACTIONS(62),
    [anon_sym_DELETE] = ACTIONS(62),
    [anon_sym_CONNECT] = ACTIONS(62),
    [anon_sym_OPTIONS] = ACTIONS(62),
    [anon_sym_TRACE] = ACTIONS(62),
    [anon_sym_PATCH] = ACTIONS(62),
    [anon_sym_LINK] = ACTIONS(62),
    [anon_sym_UNLINK] = ACTIONS(62),
    [anon_sym_PURGE] = ACTIONS(62),
    [anon_sym_LOCK] = ACTIONS(62),
    [anon_sym_UNLOCK] = ACTIONS(62),
    [anon_sym_PROPFIND] = ACTIONS(62),
    [anon_sym_VIEW] = ACTIONS(62),
    [aux_sym_method_token1] = ACTIONS(62),
    [anon_sym_HTTP_SLASH1_DOT0] = ACTIONS(62),
    [anon_sym_HTTP_SLASH1_DOT1] = ACTIONS(62),
    [anon_sym_HTTP_SLASH2] = ACTIONS(62),
    [anon_sym_HTTP_SLASH3] = ACTIONS(62),
    [anon_sym_HTTP_SLASH_STAR] = ACTIONS(62),
    [anon_sym_HTTP] = ACTIONS(62),
    [anon_sym_LBRACKBasicAuth_RBRACK] = ACTIONS(64),
    [anon_sym_LBRACKQuery_RBRACK] = ACTIONS(66),
    [anon_sym_LBRACKQueryStringParams_RBRACK] = ACTIONS(66),
    [anon_sym_LBRACKForm_RBRACK] = ACTIONS(68),
    [anon_sym_LBRACKFormParams_RBRACK] = ACTIONS(68),
    [anon_sym_LBRACKMultipart_RBRACK] = ACTIONS(70),
    [anon_sym_LBRACKMultipartFormData_RBRACK] = ACTIONS(70),
    [anon_sym_LBRACKCookies_RBRACK] = ACTIONS(72),
    [anon_sym_LBRACKOptions_RBRACK] = ACTIONS(74),
    [anon_sym_null] = ACTIONS(76),
    [anon_sym_file_COMMA] = ACTIONS(78),
    [anon_sym_BSLASH] = ACTIONS(80),
    [anon_sym_LBRACE] = ACTIONS(82),
    [anon_sym_LT] = ACTIONS(84),
    [anon_sym_LT_QMARK] = ACTIONS(86),
    [anon_sym_base64_COMMA] = ACTIONS(88),
    [anon_sym_hex_COMMA] = ACTIONS(90),
    [anon_sym_DQUOTE] = ACTIONS(92),
    [sym_key_string_text] = ACTIONS(94),
    [aux_sym_oneline_string_token1] = ACTIONS(96),
    [anon_sym_BQUOTE_BQUOTE_BQUOTE] = ACTIONS(98),
    [anon_sym_LBRACK] = ACTIONS(100),
    [anon_sym_true] = ACTIONS(102),
    [anon_sym_false] = ACTIONS(102),
    [anon_sym_LBRACE_LBRACE] = ACTIONS(104),
    [aux_sym_digit_token1] = ACTIONS(106),
    [sym_comment] = ACTIONS(62),
  },
  [9] = {
    [aux_sym__comment_or_new_line_repeat1] = STATE(9),
    [ts_builtin_sym_end] = ACTIONS(116),
    [anon_sym_LF] = ACTIONS(118),
    [anon_sym_GET] = ACTIONS(121),
    [anon_sym_HEAD] = ACTIONS(121),
    [anon_sym_POST] = ACTIONS(121),
    [anon_sym_PUT] = ACTIONS(121),
    [anon_sym_DELETE] = ACTIONS(121),
    [anon_sym_CONNECT] = ACTIONS(121),
    [anon_sym_OPTIONS] = ACTIONS(121),
    [anon_sym_TRACE] = ACTIONS(121),
    [anon_sym_PATCH] = ACTIONS(121),
    [anon_sym_LINK] = ACTIONS(121),
    [anon_sym_UNLINK] = ACTIONS(121),
    [anon_sym_PURGE] = ACTIONS(121),
    [anon_sym_LOCK] = ACTIONS(121),
    [anon_sym_UNLOCK] = ACTIONS(121),
    [anon_sym_PROPFIND] = ACTIONS(121),
    [anon_sym_VIEW] = ACTIONS(121),
    [aux_sym_method_token1] = ACTIONS(121),
    [anon_sym_HTTP_SLASH1_DOT0] = ACTIONS(121),
    [anon_sym_HTTP_SLASH1_DOT1] = ACTIONS(121),
    [anon_sym_HTTP_SLASH2] = ACTIONS(121),
    [anon_sym_HTTP_SLASH3] = ACTIONS(121),
    [anon_sym_HTTP_SLASH_STAR] = ACTIONS(121),
    [anon_sym_HTTP] = ACTIONS(121),
    [anon_sym_LBRACKBasicAuth_RBRACK] = ACTIONS(121),
    [anon_sym_LBRACKQuery_RBRACK] = ACTIONS(121),
    [anon_sym_LBRACKQueryStringParams_RBRACK] = ACTIONS(121),
    [anon_sym_LBRACKForm_RBRACK] = ACTIONS(121),
    [anon_sym_LBRACKFormParams_RBRACK] = ACTIONS(121),
    [anon_sym_LBRACKMultipart_RBRACK] = ACTIONS(121),
    [anon_sym_LBRACKMultipartFormData_RBRACK] = ACTIONS(121),
    [anon_sym_LBRACKCookies_RBRACK] = ACTIONS(121),
    [anon_sym_LBRACKOptions_RBRACK] = ACTIONS(121),
    [anon_sym_null] = ACTIONS(121),
    [anon_sym_file_COMMA] = ACTIONS(121),
    [anon_sym_cacert] = ACTIONS(121),
    [anon_sym_cert] = ACTIONS(121),
    [anon_sym_LBRACE] = ACTIONS(121),
    [anon_sym_compressed] = ACTIONS(121),
    [anon_sym_location] = ACTIONS(121),
    [anon_sym_location_DASHtrusted] = ACTIONS(121),
    [anon_sym_http1_DOT0] = ACTIONS(121),
    [anon_sym_http2] = ACTIONS(121),
    [anon_sym_http3] = ACTIONS(121),
    [anon_sym_insecure] = ACTIONS(121),
    [anon_sym_ipv4] = ACTIONS(121),
    [anon_sym_ipv6] = ACTIONS(121),
    [anon_sym_netrc] = ACTIONS(121),
    [anon_sym_netrc_DASHoptional] = ACTIONS(121),
    [anon_sym_path_DASHas_DASHis] = ACTIONS(121),
    [anon_sym_skip] = ACTIONS(121),
    [anon_sym_verbose] = ACTIONS(121),
    [anon_sym_very_DASHverbose] = ACTIONS(121),
    [anon_sym_max_DASHredirs] = ACTIONS(121),
    [anon_sym_retry_DASHmax_DASHcount] = ACTIONS(121),
    [anon_sym_limit_DASHrate] = ACTIONS(121),
    [anon_sym_max_DASHtime] = ACTIONS(121),
    [anon_sym_repeat] = ACTIONS(121),
    [anon_sym_retry] = ACTIONS(121),
    [anon_sym_connect_DASHtimeout] = ACTIONS(121),
    [anon_sym_delay] = ACTIONS(121),
    [anon_sym_retry_DASHinterval] = ACTIONS(121),
    [anon_sym_aws_DASHsigv4] = ACTIONS(121),
    [anon_sym_key] = ACTIONS(121),
    [anon_sym_connect_DASHto] = ACTIONS(121),
    [anon_sym_header] = ACTIONS(121),
    [anon_sym_netrc_DASHfile] = ACTIONS(121),
    [anon_sym_output] = ACTIONS(121),
    [anon_sym_pinnedpubkey] = ACTIONS(121),
    [anon_sym_proxy] = ACTIONS(121),
    [anon_sym_unix_DASHsocket] = ACTIONS(121),
    [anon_sym_user] = ACTIONS(121),
    [anon_sym_variable] = ACTIONS(121),
    [anon_sym_LT] = ACTIONS(121),
    [anon_sym_LT_QMARK] = ACTIONS(121),
    [anon_sym_base64_COMMA] = ACTIONS(121),
    [anon_sym_hex_COMMA] = ACTIONS(121),
    [anon_sym_DQUOTE] = ACTIONS(121),
    [aux_sym_oneline_string_token1] = ACTIONS(121),
    [anon_sym_BQUOTE_BQUOTE_BQUOTE] = ACTIONS(121),
    [anon_sym_LBRACK] = ACTIONS(121),
    [anon_sym_true] = ACTIONS(121),
    [anon_sym_false] = ACTIONS(121),
    [anon_sym_LBRACE_LBRACE] = ACTIONS(121),
    [aux_sym_digit_token1] = ACTIONS(121),
    [sym_comment] = ACTIONS(123),
  },
  [10] = {
    [aux_sym__comment_or_new_line_repeat1] = STATE(9),
    [ts_builtin_sym_end] = ACTIONS(126),
    [anon_sym_LF] = ACTIONS(128),
    [anon_sym_GET] = ACTIONS(130),
    [anon_sym_HEAD] = ACTIONS(130),
    [anon_sym_POST] = ACTIONS(130),
    [anon_sym_PUT] = ACTIONS(130),
    [anon_sym_DELETE] = ACTIONS(130),
    [anon_sym_CONNECT] = ACTIONS(130),
    [anon_sym_OPTIONS] = ACTIONS(130),
    [anon_sym_TRACE] = ACTIONS(130),
    [anon_sym_PATCH] = ACTIONS(130),
    [anon_sym_LINK] = ACTIONS(130),
    [anon_sym_UNLINK] = ACTIONS(130),
    [anon_sym_PURGE] = ACTIONS(130),
    [anon_sym_LOCK] = ACTIONS(130),
    [anon_sym_UNLOCK] = ACTIONS(130),
    [anon_sym_PROPFIND] = ACTIONS(130),
    [anon_sym_VIEW] = ACTIONS(130),
    [aux_sym_method_token1] = ACTIONS(130),
    [anon_sym_HTTP_SLASH1_DOT0] = ACTIONS(130),
    [anon_sym_HTTP_SLASH1_DOT1] = ACTIONS(130),
    [anon_sym_HTTP_SLASH2] = ACTIONS(130),
    [anon_sym_HTTP_SLASH3] = ACTIONS(130),
    [anon_sym_HTTP_SLASH_STAR] = ACTIONS(130),
    [anon_sym_HTTP] = ACTIONS(130),
    [anon_sym_LBRACKBasicAuth_RBRACK] = ACTIONS(130),
    [anon_sym_LBRACKQuery_RBRACK] = ACTIONS(130),
    [anon_sym_LBRACKQueryStringParams_RBRACK] = ACTIONS(130),
    [anon_sym_LBRACKForm_RBRACK] = ACTIONS(130),
    [anon_sym_LBRACKFormParams_RBRACK] = ACTIONS(130),
    [anon_sym_LBRACKMultipart_RBRACK] = ACTIONS(130),
    [anon_sym_LBRACKMultipartFormData_RBRACK] = ACTIONS(130),
    [anon_sym_LBRACKCookies_RBRACK] = ACTIONS(130),
    [anon_sym_LBRACKOptions_RBRACK] = ACTIONS(130),
    [anon_sym_null] = ACTIONS(130),
    [anon_sym_file_COMMA] = ACTIONS(130),
    [anon_sym_cacert] = ACTIONS(130),
    [anon_sym_cert] = ACTIONS(130),
    [anon_sym_LBRACE] = ACTIONS(130),
    [anon_sym_compressed] = ACTIONS(130),
    [anon_sym_location] = ACTIONS(130),
    [anon_sym_location_DASHtrusted] = ACTIONS(130),
    [anon_sym_http1_DOT0] = ACTIONS(130),
    [anon_sym_http2] = ACTIONS(130),
    [anon_sym_http3] = ACTIONS(130),
    [anon_sym_insecure] = ACTIONS(130),
    [anon_sym_ipv4] = ACTIONS(130),
    [anon_sym_ipv6] = ACTIONS(130),
    [anon_sym_netrc] = ACTIONS(130),
    [anon_sym_netrc_DASHoptional] = ACTIONS(130),
    [anon_sym_path_DASHas_DASHis] = ACTIONS(130),
    [anon_sym_skip] = ACTIONS(130),
    [anon_sym_verbose] = ACTIONS(130),
    [anon_sym_very_DASHverbose] = ACTIONS(130),
    [anon_sym_max_DASHredirs] = ACTIONS(130),
    [anon_sym_retry_DASHmax_DASHcount] = ACTIONS(130),
    [anon_sym_limit_DASHrate] = ACTIONS(130),
    [anon_sym_max_DASHtime] = ACTIONS(130),
    [anon_sym_repeat] = ACTIONS(130),
    [anon_sym_retry] = ACTIONS(130),
    [anon_sym_connect_DASHtimeout] = ACTIONS(130),
    [anon_sym_delay] = ACTIONS(130),
    [anon_sym_retry_DASHinterval] = ACTIONS(130),
    [anon_sym_aws_DASHsigv4] = ACTIONS(130),
    [anon_sym_key] = ACTIONS(130),
    [anon_sym_connect_DASHto] = ACTIONS(130),
    [anon_sym_header] = ACTIONS(130),
    [anon_sym_netrc_DASHfile] = ACTIONS(130),
    [anon_sym_output] = ACTIONS(130),
    [anon_sym_pinnedpubkey] = ACTIONS(130),
    [anon_sym_proxy] = ACTIONS(130),
    [anon_sym_unix_DASHsocket] = ACTIONS(130),
    [anon_sym_user] = ACTIONS(130),
    [anon_sym_variable] = ACTIONS(130),
    [anon_sym_LT] = ACTIONS(130),
    [anon_sym_LT_QMARK] = ACTIONS(130),
    [anon_sym_base64_COMMA] = ACTIONS(130),
    [anon_sym_hex_COMMA] = ACTIONS(130),
    [anon_sym_DQUOTE] = ACTIONS(130),
    [aux_sym_oneline_string_token1] = ACTIONS(130),
    [anon_sym_BQUOTE_BQUOTE_BQUOTE] = ACTIONS(130),
    [anon_sym_LBRACK] = ACTIONS(130),
    [anon_sym_true] = ACTIONS(130),
    [anon_sym_false] = ACTIONS(130),
    [anon_sym_LBRACE_LBRACE] = ACTIONS(130),
    [aux_sym_digit_token1] = ACTIONS(130),
    [sym_comment] = ACTIONS(132),
  },
  [11] = {
    [ts_builtin_sym_end] = ACTIONS(31),
    [anon_sym_LF] = ACTIONS(31),
    [anon_sym_GET] = ACTIONS(33),
    [anon_sym_HEAD] = ACTIONS(33),
    [anon_sym_POST] = ACTIONS(33),
    [anon_sym_PUT] = ACTIONS(33),
    [anon_sym_DELETE] = ACTIONS(33),
    [anon_sym_CONNECT] = ACTIONS(33),
    [anon_sym_OPTIONS] = ACTIONS(33),
    [anon_sym_TRACE] = ACTIONS(33),
    [anon_sym_PATCH] = ACTIONS(33),
    [anon_sym_LINK] = ACTIONS(33),
    [anon_sym_UNLINK] = ACTIONS(33),
    [anon_sym_PURGE] = ACTIONS(33),
    [anon_sym_LOCK] = ACTIONS(33),
    [anon_sym_UNLOCK] = ACTIONS(33),
    [anon_sym_PROPFIND] = ACTIONS(33),
    [anon_sym_VIEW] = ACTIONS(33),
    [aux_sym_method_token1] = ACTIONS(33),
    [anon_sym_HTTP_SLASH1_DOT0] = ACTIONS(33),
    [anon_sym_HTTP_SLASH1_DOT1] = ACTIONS(33),
    [anon_sym_HTTP_SLASH2] = ACTIONS(33),
    [anon_sym_HTTP_SLASH3] = ACTIONS(33),
    [anon_sym_HTTP_SLASH_STAR] = ACTIONS(33),
    [anon_sym_HTTP] = ACTIONS(33),
    [anon_sym_LBRACKBasicAuth_RBRACK] = ACTIONS(33),
    [anon_sym_LBRACKQuery_RBRACK] = ACTIONS(33),
    [anon_sym_LBRACKQueryStringParams_RBRACK] = ACTIONS(33),
    [anon_sym_LBRACKForm_RBRACK] = ACTIONS(33),
    [anon_sym_LBRACKFormParams_RBRACK] = ACTIONS(33),
    [anon_sym_LBRACKMultipart_RBRACK] = ACTIONS(33),
    [anon_sym_LBRACKMultipartFormData_RBRACK] = ACTIONS(33),
    [anon_sym_LBRACKCookies_RBRACK] = ACTIONS(33),
    [anon_sym_LBRACKOptions_RBRACK] = ACTIONS(33),
    [anon_sym_null] = ACTIONS(33),
    [anon_sym_file_COMMA] = ACTIONS(33),
    [anon_sym_cacert] = ACTIONS(33),
    [anon_sym_cert] = ACTIONS(33),
    [anon_sym_LBRACE] = ACTIONS(33),
    [anon_sym_compressed] = ACTIONS(33),
    [anon_sym_location] = ACTIONS(33),
    [anon_sym_location_DASHtrusted] = ACTIONS(33),
    [anon_sym_http1_DOT0] = ACTIONS(33),
    [anon_sym_http2] = ACTIONS(33),
    [anon_sym_http3] = ACTIONS(33),
    [anon_sym_insecure] = ACTIONS(33),
    [anon_sym_ipv4] = ACTIONS(33),
    [anon_sym_ipv6] = ACTIONS(33),
    [anon_sym_netrc] = ACTIONS(33),
    [anon_sym_netrc_DASHoptional] = ACTIONS(33),
    [anon_sym_path_DASHas_DASHis] = ACTIONS(33),
    [anon_sym_skip] = ACTIONS(33),
    [anon_sym_verbose] = ACTIONS(33),
    [anon_sym_very_DASHverbose] = ACTIONS(33),
    [anon_sym_max_DASHredirs] = ACTIONS(33),
    [anon_sym_retry_DASHmax_DASHcount] = ACTIONS(33),
    [anon_sym_limit_DASHrate] = ACTIONS(33),
    [anon_sym_max_DASHtime] = ACTIONS(33),
    [anon_sym_repeat] = ACTIONS(33),
    [anon_sym_retry] = ACTIONS(33),
    [anon_sym_connect_DASHtimeout] = ACTIONS(33),
    [anon_sym_delay] = ACTIONS(33),
    [anon_sym_retry_DASHinterval] = ACTIONS(33),
    [anon_sym_aws_DASHsigv4] = ACTIONS(33),
    [anon_sym_key] = ACTIONS(33),
    [anon_sym_connect_DASHto] = ACTIONS(33),
    [anon_sym_header] = ACTIONS(33),
    [anon_sym_netrc_DASHfile] = ACTIONS(33),
    [anon_sym_output] = ACTIONS(33),
    [anon_sym_pinnedpubkey] = ACTIONS(33),
    [anon_sym_proxy] = ACTIONS(33),
    [anon_sym_unix_DASHsocket] = ACTIONS(33),
    [anon_sym_user] = ACTIONS(33),
    [anon_sym_variable] = ACTIONS(33),
    [anon_sym_LT] = ACTIONS(33),
    [anon_sym_LT_QMARK] = ACTIONS(33),
    [anon_sym_base64_COMMA] = ACTIONS(33),
    [anon_sym_hex_COMMA] = ACTIONS(33),
    [anon_sym_DQUOTE] = ACTIONS(33),
    [aux_sym_oneline_string_token1] = ACTIONS(33),
    [anon_sym_BQUOTE_BQUOTE_BQUOTE] = ACTIONS(33),
    [anon_sym_LBRACK] = ACTIONS(33),
    [anon_sym_true] = ACTIONS(33),
    [anon_sym_false] = ACTIONS(33),
    [anon_sym_LBRACE_LBRACE] = ACTIONS(33),
    [aux_sym_digit_token1] = ACTIONS(33),
    [sym_comment] = ACTIONS(33),
  },
  [12] = {
    [sym_body] = STATE(94),
    [sym_request_section] = STATE(37),
    [sym_basic_auth_section] = STATE(51),
    [sym_query_string_params_section] = STATE(51),
    [sym_form_params_section] = STATE(51),
    [sym_multipart_form_data_section] = STATE(51),
    [sym_cookies_section] = STATE(51),
    [sym_options_section] = STATE(51),
    [sym_bytes] = STATE(346),
    [sym_xml] = STATE(492),
    [sym_xml_prolog_tag] = STATE(236),
    [sym_xml_tag] = STATE(493),
    [sym_xml_open_tag] = STATE(151),
    [sym_oneline_base64] = STATE(492),
    [sym_oneline_file] = STATE(492),
    [sym_oneline_hex] = STATE(492),
    [sym_oneline_string] = STATE(492),
    [sym_multiline_string] = STATE(492),
    [sym_json_value] = STATE(492),
    [sym_json_object] = STATE(497),
    [sym_json_array] = STATE(497),
    [sym_json_string] = STATE(497),
    [sym_json_number] = STATE(497),
    [sym_json_boolean] = STATE(497),
    [sym_template] = STATE(497),
    [sym_json_integer] = STATE(237),
    [sym_json_digit] = STATE(212),
    [aux_sym_request_repeat2] = STATE(37),
    [aux_sym_xml_repeat1] = STATE(236),
    [aux_sym_json_integer_repeat1] = STATE(212),
    [ts_builtin_sym_end] = ACTIONS(112),
    [anon_sym_LF] = ACTIONS(112),
    [anon_sym_GET] = ACTIONS(114),
    [anon_sym_HEAD] = ACTIONS(114),
    [anon_sym_POST] = ACTIONS(114),
    [anon_sym_PUT] = ACTIONS(114),
    [anon_sym_DELETE] = ACTIONS(114),
    [anon_sym_CONNECT] = ACTIONS(114),
    [anon_sym_OPTIONS] = ACTIONS(114),
    [anon_sym_TRACE] = ACTIONS(114),
    [anon_sym_PATCH] = ACTIONS(114),
    [anon_sym_LINK] = ACTIONS(114),
    [anon_sym_UNLINK] = ACTIONS(114),
    [anon_sym_PURGE] = ACTIONS(114),
    [anon_sym_LOCK] = ACTIONS(114),
    [anon_sym_UNLOCK] = ACTIONS(114),
    [anon_sym_PROPFIND] = ACTIONS(114),
    [anon_sym_VIEW] = ACTIONS(114),
    [aux_sym_method_token1] = ACTIONS(114),
    [anon_sym_HTTP_SLASH1_DOT0] = ACTIONS(114),
    [anon_sym_HTTP_SLASH1_DOT1] = ACTIONS(114),
    [anon_sym_HTTP_SLASH2] = ACTIONS(114),
    [anon_sym_HTTP_SLASH3] = ACTIONS(114),
    [anon_sym_HTTP_SLASH_STAR] = ACTIONS(114),
    [anon_sym_HTTP] = ACTIONS(114),
    [anon_sym_LBRACKBasicAuth_RBRACK] = ACTIONS(64),
    [anon_sym_LBRACKQuery_RBRACK] = ACTIONS(66),
    [anon_sym_LBRACKQueryStringParams_RBRACK] = ACTIONS(66),
    [anon_sym_LBRACKForm_RBRACK] = ACTIONS(68),
    [anon_sym_LBRACKFormParams_RBRACK] = ACTIONS(68),
    [anon_sym_LBRACKMultipart_RBRACK] = ACTIONS(70),
    [anon_sym_LBRACKMultipartFormData_RBRACK] = ACTIONS(70),
    [anon_sym_LBRACKCookies_RBRACK] = ACTIONS(72),
    [anon_sym_LBRACKOptions_RBRACK] = ACTIONS(74),
    [anon_sym_null] = ACTIONS(76),
    [anon_sym_file_COMMA] = ACTIONS(78),
    [anon_sym_LBRACE] = ACTIONS(82),
    [anon_sym_LT] = ACTIONS(84),
    [anon_sym_LT_QMARK] = ACTIONS(86),
    [anon_sym_base64_COMMA] = ACTIONS(88),
    [anon_sym_hex_COMMA] = ACTIONS(90),
    [anon_sym_DQUOTE] = ACTIONS(92),
    [aux_sym_oneline_string_token1] = ACTIONS(96),
    [anon_sym_BQUOTE_BQUOTE_BQUOTE] = ACTIONS(98),
    [anon_sym_LBRACK] = ACTIONS(100),
    [anon_sym_true] = ACTIONS(102),
    [anon_sym_false] = ACTIONS(102),
    [anon_sym_LBRACE_LBRACE] = ACTIONS(104),
    [aux_sym_digit_token1] = ACTIONS(106),
    [sym_comment] = ACTIONS(114),
  },
  [13] = {
    [sym_body] = STATE(97),
    [sym_request_section] = STATE(37),
    [sym_basic_auth_section] = STATE(51),
    [sym_query_string_params_section] = STATE(51),
    [sym_form_params_section] = STATE(51),
    [sym_multipart_form_data_section] = STATE(51),
    [sym_cookies_section] = STATE(51),
    [sym_options_section] = STATE(51),
    [sym_bytes] = STATE(346),
    [sym_xml] = STATE(492),
    [sym_xml_prolog_tag] = STATE(236),
    [sym_xml_tag] = STATE(493),
    [sym_xml_open_tag] = STATE(151),
    [sym_oneline_base64] = STATE(492),
    [sym_oneline_file] = STATE(492),
    [sym_oneline_hex] = STATE(492),
    [sym_oneline_string] = STATE(492),
    [sym_multiline_string] = STATE(492),
    [sym_json_value] = STATE(492),
    [sym_json_object] = STATE(497),
    [sym_json_array] = STATE(497),
    [sym_json_string] = STATE(497),
    [sym_json_number] = STATE(497),
    [sym_json_boolean] = STATE(497),
    [sym_template] = STATE(497),
    [sym_json_integer] = STATE(237),
    [sym_json_digit] = STATE(212),
    [aux_sym_request_repeat2] = STATE(37),
    [aux_sym_xml_repeat1] = STATE(236),
    [aux_sym_json_integer_repeat1] = STATE(212),
    [ts_builtin_sym_end] = ACTIONS(60),
    [anon_sym_LF] = ACTIONS(60),
    [anon_sym_GET] = ACTIONS(62),
    [anon_sym_HEAD] = ACTIONS(62),
    [anon_sym_POST] = ACTIONS(62),
    [anon_sym_PUT] = ACTIONS(62),
    [anon_sym_DELETE] = ACTIONS(62),
    [anon_sym_CONNECT] = ACTIONS(62),
    [anon_sym_OPTIONS] = ACTIONS(62),
    [anon_sym_TRACE] = ACTIONS(62),
    [anon_sym_PATCH] = ACTIONS(62),
    [anon_sym_LINK] = ACTIONS(62),
    [anon_sym_UNLINK] = ACTIONS(62),
    [anon_sym_PURGE] = ACTIONS(62),
    [anon_sym_LOCK] = ACTIONS(62),
    [anon_sym_UNLOCK] = ACTIONS(62),
    [anon_sym_PROPFIND] = ACTIONS(62),
    [anon_sym_VIEW] = ACTIONS(62),
    [aux_sym_method_token1] = ACTIONS(62),
    [anon_sym_HTTP_SLASH1_DOT0] = ACTIONS(62),
    [anon_sym_HTTP_SLASH1_DOT1] = ACTIONS(62),
    [anon_sym_HTTP_SLASH2] = ACTIONS(62),
    [anon_sym_HTTP_SLASH3] = ACTIONS(62),
    [anon_sym_HTTP_SLASH_STAR] = ACTIONS(62),
    [anon_sym_HTTP] = ACTIONS(62),
    [anon_sym_LBRACKBasicAuth_RBRACK] = ACTIONS(64),
    [anon_sym_LBRACKQuery_RBRACK] = ACTIONS(66),
    [anon_sym_LBRACKQueryStringParams_RBRACK] = ACTIONS(66),
    [anon_sym_LBRACKForm_RBRACK] = ACTIONS(68),
    [anon_sym_LBRACKFormParams_RBRACK] = ACTIONS(68),
    [anon_sym_LBRACKMultipart_RBRACK] = ACTIONS(70),
    [anon_sym_LBRACKMultipartFormData_RBRACK] = ACTIONS(70),
    [anon_sym_LBRACKCookies_RBRACK] = ACTIONS(72),
    [anon_sym_LBRACKOptions_RBRACK] = ACTIONS(74),
    [anon_sym_null] = ACTIONS(76),
    [anon_sym_file_COMMA] = ACTIONS(78),
    [anon_sym_LBRACE] = ACTIONS(82),
    [anon_sym_LT] = ACTIONS(84),
    [anon_sym_LT_QMARK] = ACTIONS(86),
    [anon_sym_base64_COMMA] = ACTIONS(88),
    [anon_sym_hex_COMMA] = ACTIONS(90),
    [anon_sym_DQUOTE] = ACTIONS(92),
    [aux_sym_oneline_string_token1] = ACTIONS(96),
    [anon_sym_BQUOTE_BQUOTE_BQUOTE] = ACTIONS(98),
    [anon_sym_LBRACK] = ACTIONS(100),
    [anon_sym_true] = ACTIONS(102),
    [anon_sym_false] = ACTIONS(102),
    [anon_sym_LBRACE_LBRACE] = ACTIONS(104),
    [aux_sym_digit_token1] = ACTIONS(106),
    [sym_comment] = ACTIONS(62),
  },
  [14] = {
    [sym_body] = STATE(91),
    [sym_request_section] = STATE(37),
    [sym_basic_auth_section] = STATE(51),
    [sym_query_string_params_section] = STATE(51),
    [sym_form_params_section] = STATE(51),
    [sym_multipart_form_data_section] = STATE(51),
    [sym_cookies_section] = STATE(51),
    [sym_options_section] = STATE(51),
    [sym_bytes] = STATE(346),
    [sym_xml] = STATE(492),
    [sym_xml_prolog_tag] = STATE(236),
    [sym_xml_tag] = STATE(493),
    [sym_xml_open_tag] = STATE(151),
    [sym_oneline_base64] = STATE(492),
    [sym_oneline_file] = STATE(492),
    [sym_oneline_hex] = STATE(492),
    [sym_oneline_string] = STATE(492),
    [sym_multiline_string] = STATE(492),
    [sym_json_value] = STATE(492),
    [sym_json_object] = STATE(497),
    [sym_json_array] = STATE(497),
    [sym_json_string] = STATE(497),
    [sym_json_number] = STATE(497),
    [sym_json_boolean] = STATE(497),
    [sym_template] = STATE(497),
    [sym_json_integer] = STATE(237),
    [sym_json_digit] = STATE(212),
    [aux_sym_request_repeat2] = STATE(37),
    [aux_sym_xml_repeat1] = STATE(236),
    [aux_sym_json_integer_repeat1] = STATE(212),
    [ts_builtin_sym_end] = ACTIONS(134),
    [anon_sym_LF] = ACTIONS(134),
    [anon_sym_GET] = ACTIONS(136),
    [anon_sym_HEAD] = ACTIONS(136),
    [anon_sym_POST] = ACTIONS(136),
    [anon_sym_PUT] = ACTIONS(136),
    [anon_sym_DELETE] = ACTIONS(136),
    [anon_sym_CONNECT] = ACTIONS(136),
    [anon_sym_OPTIONS] = ACTIONS(136),
    [anon_sym_TRACE] = ACTIONS(136),
    [anon_sym_PATCH] = ACTIONS(136),
    [anon_sym_LINK] = ACTIONS(136),
    [anon_sym_UNLINK] = ACTIONS(136),
    [anon_sym_PURGE] = ACTIONS(136),
    [anon_sym_LOCK] = ACTIONS(136),
    [anon_sym_UNLOCK] = ACTIONS(136),
    [anon_sym_PROPFIND] = ACTIONS(136),
    [anon_sym_VIEW] = ACTIONS(136),
    [aux_sym_method_token1] = ACTIONS(136),
    [anon_sym_HTTP_SLASH1_DOT0] = ACTIONS(136),
    [anon_sym_HTTP_SLASH1_DOT1] = ACTIONS(136),
    [anon_sym_HTTP_SLASH2] = ACTIONS(136),
    [anon_sym_HTTP_SLASH3] = ACTIONS(136),
    [anon_sym_HTTP_SLASH_STAR] = ACTIONS(136),
    [anon_sym_HTTP] = ACTIONS(136),
    [anon_sym_LBRACKBasicAuth_RBRACK] = ACTIONS(64),
    [anon_sym_LBRACKQuery_RBRACK] = ACTIONS(66),
    [anon_sym_LBRACKQueryStringParams_RBRACK] = ACTIONS(66),
    [anon_sym_LBRACKForm_RBRACK] = ACTIONS(68),
    [anon_sym_LBRACKFormParams_RBRACK] = ACTIONS(68),
    [anon_sym_LBRACKMultipart_RBRACK] = ACTIONS(70),
    [anon_sym_LBRACKMultipartFormData_RBRACK] = ACTIONS(70),
    [anon_sym_LBRACKCookies_RBRACK] = ACTIONS(72),
    [anon_sym_LBRACKOptions_RBRACK] = ACTIONS(74),
    [anon_sym_null] = ACTIONS(76),
    [anon_sym_file_COMMA] = ACTIONS(78),
    [anon_sym_LBRACE] = ACTIONS(82),
    [anon_sym_LT] = ACTIONS(84),
    [anon_sym_LT_QMARK] = ACTIONS(86),
    [anon_sym_base64_COMMA] = ACTIONS(88),
    [anon_sym_hex_COMMA] = ACTIONS(90),
    [anon_sym_DQUOTE] = ACTIONS(92),
    [aux_sym_oneline_string_token1] = ACTIONS(96),
    [anon_sym_BQUOTE_BQUOTE_BQUOTE] = ACTIONS(98),
    [anon_sym_LBRACK] = ACTIONS(100),
    [anon_sym_true] = ACTIONS(102),
    [anon_sym_false] = ACTIONS(102),
    [anon_sym_LBRACE_LBRACE] = ACTIONS(104),
    [aux_sym_digit_token1] = ACTIONS(106),
    [sym_comment] = ACTIONS(136),
  },
  [15] = {
    [sym_header] = STATE(16),
    [sym_body] = STATE(118),
    [sym_response_section] = STATE(20),
    [sym_captures_section] = STATE(83),
    [sym_asserts_section] = STATE(83),
    [sym_key_value] = STATE(355),
    [sym_bytes] = STATE(415),
    [sym_xml] = STATE(492),
    [sym_xml_prolog_tag] = STATE(236),
    [sym_xml_tag] = STATE(493),
    [sym_xml_open_tag] = STATE(151),
    [sym_oneline_base64] = STATE(492),
    [sym_oneline_file] = STATE(492),
    [sym_oneline_hex] = STATE(492),
    [sym_key_string] = STATE(498),
    [sym_key_string_content] = STATE(192),
    [sym_key_string_escaped_char] = STATE(234),
    [sym_oneline_string] = STATE(492),
    [sym_multiline_string] = STATE(492),
    [sym_json_value] = STATE(492),
    [sym_json_object] = STATE(497),
    [sym_json_array] = STATE(497),
    [sym_json_string] = STATE(497),
    [sym_json_number] = STATE(497),
    [sym_json_boolean] = STATE(497),
    [sym_template] = STATE(264),
    [sym_json_integer] = STATE(237),
    [sym_json_digit] = STATE(212),
    [aux_sym_request_repeat1] = STATE(16),
    [aux_sym_response_repeat1] = STATE(20),
    [aux_sym_xml_repeat1] = STATE(236),
    [aux_sym_key_string_repeat1] = STATE(192),
    [aux_sym_key_string_content_repeat1] = STATE(234),
    [aux_sym_json_integer_repeat1] = STATE(212),
    [ts_builtin_sym_end] = ACTIONS(138),
    [anon_sym_LF] = ACTIONS(138),
    [anon_sym_GET] = ACTIONS(140),
    [anon_sym_HEAD] = ACTIONS(140),
    [anon_sym_POST] = ACTIONS(140),
    [anon_sym_PUT] = ACTIONS(140),
    [anon_sym_DELETE] = ACTIONS(140),
    [anon_sym_CONNECT] = ACTIONS(140),
    [anon_sym_OPTIONS] = ACTIONS(140),
    [anon_sym_TRACE] = ACTIONS(140),
    [anon_sym_PATCH] = ACTIONS(140),
    [anon_sym_LINK] = ACTIONS(140),
    [anon_sym_UNLINK] = ACTIONS(140),
    [anon_sym_PURGE] = ACTIONS(140),
    [anon_sym_LOCK] = ACTIONS(140),
    [anon_sym_UNLOCK] = ACTIONS(140),
    [anon_sym_PROPFIND] = ACTIONS(140),
    [anon_sym_VIEW] = ACTIONS(140),
    [aux_sym_method_token1] = ACTIONS(140),
    [anon_sym_LBRACKCaptures_RBRACK] = ACTIONS(142),
    [anon_sym_LBRACKAsserts_RBRACK] = ACTIONS(144),
    [anon_sym_null] = ACTIONS(76),
    [anon_sym_file_COMMA] = ACTIONS(78),
    [anon_sym_BSLASH] = ACTIONS(80),
    [anon_sym_LBRACE] = ACTIONS(82),
    [anon_sym_LT] = ACTIONS(84),
    [anon_sym_LT_QMARK] = ACTIONS(86),
    [anon_sym_base64_COMMA] = ACTIONS(88),
    [anon_sym_hex_COMMA] = ACTIONS(90),
    [anon_sym_DQUOTE] = ACTIONS(92),
    [sym_key_string_text] = ACTIONS(94),
    [aux_sym_oneline_string_token1] = ACTIONS(96),
    [anon_sym_BQUOTE_BQUOTE_BQUOTE] = ACTIONS(98),
    [anon_sym_LBRACK] = ACTIONS(100),
    [anon_sym_true] = ACTIONS(102),
    [anon_sym_false] = ACTIONS(102),
    [anon_sym_LBRACE_LBRACE] = ACTIONS(104),
    [aux_sym_digit_token1] = ACTIONS(106),
    [sym_comment] = ACTIONS(140),
  },
  [16] = {
    [sym_header] = STATE(61),
    [sym_body] = STATE(125),
    [sym_response_section] = STATE(19),
    [sym_captures_section] = STATE(83),
    [sym_asserts_section] = STATE(83),
    [sym_key_value] = STATE(355),
    [sym_bytes] = STATE(415),
    [sym_xml] = STATE(492),
    [sym_xml_prolog_tag] = STATE(236),
    [sym_xml_tag] = STATE(493),
    [sym_xml_open_tag] = STATE(151),
    [sym_oneline_base64] = STATE(492),
    [sym_oneline_file] = STATE(492),
    [sym_oneline_hex] = STATE(492),
    [sym_key_string] = STATE(498),
    [sym_key_string_content] = STATE(192),
    [sym_key_string_escaped_char] = STATE(234),
    [sym_oneline_string] = STATE(492),
    [sym_multiline_string] = STATE(492),
    [sym_json_value] = STATE(492),
    [sym_json_object] = STATE(497),
    [sym_json_array] = STATE(497),
    [sym_json_string] = STATE(497),
    [sym_json_number] = STATE(497),
    [sym_json_boolean] = STATE(497),
    [sym_template] = STATE(264),
    [sym_json_integer] = STATE(237),
    [sym_json_digit] = STATE(212),
    [aux_sym_request_repeat1] = STATE(61),
    [aux_sym_response_repeat1] = STATE(19),
    [aux_sym_xml_repeat1] = STATE(236),
    [aux_sym_key_string_repeat1] = STATE(192),
    [aux_sym_key_string_content_repeat1] = STATE(234),
    [aux_sym_json_integer_repeat1] = STATE(212),
    [ts_builtin_sym_end] = ACTIONS(146),
    [anon_sym_LF] = ACTIONS(146),
    [anon_sym_GET] = ACTIONS(148),
    [anon_sym_HEAD] = ACTIONS(148),
    [anon_sym_POST] = ACTIONS(148),
    [anon_sym_PUT] = ACTIONS(148),
    [anon_sym_DELETE] = ACTIONS(148),
    [anon_sym_CONNECT] = ACTIONS(148),
    [anon_sym_OPTIONS] = ACTIONS(148),
    [anon_sym_TRACE] = ACTIONS(148),
    [anon_sym_PATCH] = ACTIONS(148),
    [anon_sym_LINK] = ACTIONS(148),
    [anon_sym_UNLINK] = ACTIONS(148),
    [anon_sym_PURGE] = ACTIONS(148),
    [anon_sym_LOCK] = ACTIONS(148),
    [anon_sym_UNLOCK] = ACTIONS(148),
    [anon_sym_PROPFIND] = ACTIONS(148),
    [anon_sym_VIEW] = ACTIONS(148),
    [aux_sym_method_token1] = ACTIONS(148),
    [anon_sym_LBRACKCaptures_RBRACK] = ACTIONS(142),
    [anon_sym_LBRACKAsserts_RBRACK] = ACTIONS(144),
    [anon_sym_null] = ACTIONS(76),
    [anon_sym_file_COMMA] = ACTIONS(78),
    [anon_sym_BSLASH] = ACTIONS(80),
    [anon_sym_LBRACE] = ACTIONS(82),
    [anon_sym_LT] = ACTIONS(84),
    [anon_sym_LT_QMARK] = ACTIONS(86),
    [anon_sym_base64_COMMA] = ACTIONS(88),
    [anon_sym_hex_COMMA] = ACTIONS(90),
    [anon_sym_DQUOTE] = ACTIONS(92),
    [sym_key_string_text] = ACTIONS(94),
    [aux_sym_oneline_string_token1] = ACTIONS(96),
    [anon_sym_BQUOTE_BQUOTE_BQUOTE] = ACTIONS(98),
    [anon_sym_LBRACK] = ACTIONS(100),
    [anon_sym_true] = ACTIONS(102),
    [anon_sym_false] = ACTIONS(102),
    [anon_sym_LBRACE_LBRACE] = ACTIONS(104),
    [aux_sym_digit_token1] = ACTIONS(106),
    [sym_comment] = ACTIONS(148),
  },
  [17] = {
    [sym_predicate] = STATE(344),
    [sym_predicate_func] = STATE(520),
    [sym_simple_predicate] = STATE(523),
    [sym_equal_predicate] = STATE(523),
    [sym_not_equal_predicate] = STATE(523),
    [sym_greater_predicate] = STATE(523),
    [sym_greater_or_equal_predicate] = STATE(523),
    [sym_less_predicate] = STATE(523),
    [sym_less_or_equal_predicate] = STATE(523),
    [sym_start_with_predicate] = STATE(523),
    [sym_end_with_predicate] = STATE(523),
    [sym_contain_predicate] = STATE(523),
    [sym_match_predicate] = STATE(523),
    [sym_include_predicate] = STATE(523),
    [sym_filter] = STATE(38),
    [sym_simple_filter_key] = STATE(63),
    [sym_regex_filter] = STATE(63),
    [sym_nth_filter] = STATE(63),
    [sym_replace_filter] = STATE(63),
    [sym_split_filter] = STATE(63),
    [sym_xpath_filter] = STATE(63),
    [aux_sym_capture_repeat1] = STATE(38),
    [anon_sym_xpath] = ACTIONS(150),
    [anon_sym_regex] = ACTIONS(152),
    [anon_sym_not] = ACTIONS(154),
    [anon_sym_exists] = ACTIONS(156),
    [anon_sym_isInteger] = ACTIONS(156),
    [anon_sym_isFloat] = ACTIONS(156),
    [anon_sym_isBoolean] = ACTIONS(156),
    [anon_sym_isString] = ACTIONS(156),
    [anon_sym_isCollection] = ACTIONS(156),
    [anon_sym_isNumber] = ACTIONS(156),
    [anon_sym_isIsoDate] = ACTIONS(156),
    [anon_sym_isEmpty] = ACTIONS(156),
    [anon_sym_isIpv4] = ACTIONS(156),
    [anon_sym_isIpv6] = ACTIONS(156),
    [anon_sym_isUuid] = ACTIONS(156),
    [anon_sym_equals] = ACTIONS(158),
    [anon_sym_EQ_EQ] = ACTIONS(160),
    [anon_sym_notEquals] = ACTIONS(162),
    [anon_sym_BANG_EQ] = ACTIONS(164),
    [anon_sym_greaterThan] = ACTIONS(166),
    [anon_sym_GT] = ACTIONS(168),
    [anon_sym_greaterThanOrEquals] = ACTIONS(170),
    [anon_sym_GT_EQ] = ACTIONS(172),
    [anon_sym_lessThan] = ACTIONS(174),
    [anon_sym_LT] = ACTIONS(176),
    [anon_sym_lessThanOrEquals] = ACTIONS(178),
    [anon_sym_LT_EQ] = ACTIONS(180),
    [anon_sym_startsWith] = ACTIONS(182),
    [anon_sym_endsWith] = ACTIONS(184),
    [anon_sym_contains] = ACTIONS(186),
    [anon_sym_matches] = ACTIONS(188),
    [anon_sym_includes] = ACTIONS(190),
    [anon_sym_count] = ACTIONS(192),
    [anon_sym_urlEncode] = ACTIONS(192),
    [anon_sym_urlDecode] = ACTIONS(192),
    [anon_sym_toInt] = ACTIONS(192),
    [anon_sym_htmlEscape] = ACTIONS(192),
    [anon_sym_htmlUnescape] = ACTIONS(192),
    [anon_sym_daysAfterNow] = ACTIONS(192),
    [anon_sym_daysBeforeNow] = ACTIONS(192),
    [anon_sym_decode] = ACTIONS(192),
    [anon_sym_format] = ACTIONS(192),
    [anon_sym_toDate] = ACTIONS(192),
    [anon_sym_nth] = ACTIONS(194),
    [anon_sym_replace] = ACTIONS(196),
    [anon_sym_split] = ACTIONS(198),
    [sym_comment] = ACTIONS(200),
  },
  [18] = {
    [sym_predicate] = STATE(373),
    [sym_predicate_func] = STATE(520),
    [sym_simple_predicate] = STATE(523),
    [sym_equal_predicate] = STATE(523),
    [sym_not_equal_predicate] = STATE(523),
    [sym_greater_predicate] = STATE(523),
    [sym_greater_or_equal_predicate] = STATE(523),
    [sym_less_predicate] = STATE(523),
    [sym_less_or_equal_predicate] = STATE(523),
    [sym_start_with_predicate] = STATE(523),
    [sym_end_with_predicate] = STATE(523),
    [sym_contain_predicate] = STATE(523),
    [sym_match_predicate] = STATE(523),
    [sym_include_predicate] = STATE(523),
    [sym_filter] = STATE(17),
    [sym_simple_filter_key] = STATE(63),
    [sym_regex_filter] = STATE(63),
    [sym_nth_filter] = STATE(63),
    [sym_replace_filter] = STATE(63),
    [sym_split_filter] = STATE(63),
    [sym_xpath_filter] = STATE(63),
    [aux_sym_capture_repeat1] = STATE(17),
    [anon_sym_xpath] = ACTIONS(150),
    [anon_sym_regex] = ACTIONS(152),
    [anon_sym_not] = ACTIONS(154),
    [anon_sym_exists] = ACTIONS(156),
    [anon_sym_isInteger] = ACTIONS(156),
    [anon_sym_isFloat] = ACTIONS(156),
    [anon_sym_isBoolean] = ACTIONS(156),
    [anon_sym_isString] = ACTIONS(156),
    [anon_sym_isCollection] = ACTIONS(156),
    [anon_sym_isNumber] = ACTIONS(156),
    [anon_sym_isIsoDate] = ACTIONS(156),
    [anon_sym_isEmpty] = ACTIONS(156),
    [anon_sym_isIpv4] = ACTIONS(156),
    [anon_sym_isIpv6] = ACTIONS(156),
    [anon_sym_isUuid] = ACTIONS(156),
    [anon_sym_equals] = ACTIONS(158),
    [anon_sym_EQ_EQ] = ACTIONS(160),
    [anon_sym_notEquals] = ACTIONS(162),
    [anon_sym_BANG_EQ] = ACTIONS(164),
    [anon_sym_greaterThan] = ACTIONS(166),
    [anon_sym_GT] = ACTIONS(168),
    [anon_sym_greaterThanOrEquals] = ACTIONS(170),
    [anon_sym_GT_EQ] = ACTIONS(172),
    [anon_sym_lessThan] = ACTIONS(174),
    [anon_sym_LT] = ACTIONS(176),
    [anon_sym_lessThanOrEquals] = ACTIONS(178),
    [anon_sym_LT_EQ] = ACTIONS(180),
    [anon_sym_startsWith] = ACTIONS(182),
    [anon_sym_endsWith] = ACTIONS(184),
    [anon_sym_contains] = ACTIONS(186),
    [anon_sym_matches] = ACTIONS(188),
    [anon_sym_includes] = ACTIONS(190),
    [anon_sym_count] = ACTIONS(192),
    [anon_sym_urlEncode] = ACTIONS(192),
    [anon_sym_urlDecode] = ACTIONS(192),
    [anon_sym_toInt] = ACTIONS(192),
    [anon_sym_htmlEscape] = ACTIONS(192),
    [anon_sym_htmlUnescape] = ACTIONS(192),
    [anon_sym_daysAfterNow] = ACTIONS(192),
    [anon_sym_daysBeforeNow] = ACTIONS(192),
    [anon_sym_decode] = ACTIONS(192),
    [anon_sym_format] = ACTIONS(192),
    [anon_sym_toDate] = ACTIONS(192),
    [anon_sym_nth] = ACTIONS(194),
    [anon_sym_replace] = ACTIONS(196),
    [anon_sym_split] = ACTIONS(198),
    [sym_comment] = ACTIONS(200),
  },
};

static const uint16_t ts_small_parse_table[] = {
  [0] = 29,
    ACTIONS(76), 1,
      anon_sym_null,
    ACTIONS(78), 1,
      anon_sym_file_COMMA,
    ACTIONS(82), 1,
      anon_sym_LBRACE,
    ACTIONS(84), 1,
      anon_sym_LT,
    ACTIONS(86), 1,
      anon_sym_LT_QMARK,
    ACTIONS(88), 1,
      anon_sym_base64_COMMA,
    ACTIONS(90), 1,
      anon_sym_hex_COMMA,
    ACTIONS(92), 1,
      anon_sym_DQUOTE,
    ACTIONS(96), 1,
      aux_sym_oneline_string_token1,
    ACTIONS(98), 1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
    ACTIONS(100), 1,
      anon_sym_LBRACK,
    ACTIONS(104), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(106), 1,
      aux_sym_digit_token1,
    ACTIONS(142), 1,
      anon_sym_LBRACKCaptures_RBRACK,
    ACTIONS(144), 1,
      anon_sym_LBRACKAsserts_RBRACK,
    STATE(120), 1,
      sym_body,
    STATE(151), 1,
      sym_xml_open_tag,
    STATE(237), 1,
      sym_json_integer,
    STATE(415), 1,
      sym_bytes,
    STATE(493), 1,
      sym_xml_tag,
    ACTIONS(102), 2,
      anon_sym_true,
      anon_sym_false,
    ACTIONS(202), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(77), 2,
      sym_response_section,
      aux_sym_response_repeat1,
    STATE(83), 2,
      sym_captures_section,
      sym_asserts_section,
    STATE(212), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
    STATE(236), 2,
      sym_xml_prolog_tag,
      aux_sym_xml_repeat1,
    STATE(497), 6,
      sym_json_object,
      sym_json_array,
      sym_json_string,
      sym_json_number,
      sym_json_boolean,
      sym_template,
    STATE(492), 7,
      sym_xml,
      sym_oneline_base64,
      sym_oneline_file,
      sym_oneline_hex,
      sym_oneline_string,
      sym_multiline_string,
      sym_json_value,
    ACTIONS(204), 18,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      sym_comment,
  [122] = 29,
    ACTIONS(76), 1,
      anon_sym_null,
    ACTIONS(78), 1,
      anon_sym_file_COMMA,
    ACTIONS(82), 1,
      anon_sym_LBRACE,
    ACTIONS(84), 1,
      anon_sym_LT,
    ACTIONS(86), 1,
      anon_sym_LT_QMARK,
    ACTIONS(88), 1,
      anon_sym_base64_COMMA,
    ACTIONS(90), 1,
      anon_sym_hex_COMMA,
    ACTIONS(92), 1,
      anon_sym_DQUOTE,
    ACTIONS(96), 1,
      aux_sym_oneline_string_token1,
    ACTIONS(98), 1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
    ACTIONS(100), 1,
      anon_sym_LBRACK,
    ACTIONS(104), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(106), 1,
      aux_sym_digit_token1,
    ACTIONS(142), 1,
      anon_sym_LBRACKCaptures_RBRACK,
    ACTIONS(144), 1,
      anon_sym_LBRACKAsserts_RBRACK,
    STATE(125), 1,
      sym_body,
    STATE(151), 1,
      sym_xml_open_tag,
    STATE(237), 1,
      sym_json_integer,
    STATE(415), 1,
      sym_bytes,
    STATE(493), 1,
      sym_xml_tag,
    ACTIONS(102), 2,
      anon_sym_true,
      anon_sym_false,
    ACTIONS(146), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(77), 2,
      sym_response_section,
      aux_sym_response_repeat1,
    STATE(83), 2,
      sym_captures_section,
      sym_asserts_section,
    STATE(212), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
    STATE(236), 2,
      sym_xml_prolog_tag,
      aux_sym_xml_repeat1,
    STATE(497), 6,
      sym_json_object,
      sym_json_array,
      sym_json_string,
      sym_json_number,
      sym_json_boolean,
      sym_template,
    STATE(492), 7,
      sym_xml,
      sym_oneline_base64,
      sym_oneline_file,
      sym_oneline_hex,
      sym_oneline_string,
      sym_multiline_string,
      sym_json_value,
    ACTIONS(148), 18,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      sym_comment,
  [244] = 10,
    ACTIONS(80), 1,
      anon_sym_BSLASH,
    ACTIONS(94), 1,
      sym_key_string_text,
    STATE(23), 1,
      aux_sym_multipart_form_data_section_repeat1,
    STATE(416), 1,
      sym_multipart_form_data_param,
    STATE(525), 1,
      sym_key_string,
    ACTIONS(206), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(524), 2,
      sym_key_value,
      sym_file_param,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    ACTIONS(208), 48,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
      sym_comment,
  [327] = 10,
    ACTIONS(80), 1,
      anon_sym_BSLASH,
    ACTIONS(94), 1,
      sym_key_string_text,
    STATE(21), 1,
      aux_sym_multipart_form_data_section_repeat1,
    STATE(416), 1,
      sym_multipart_form_data_param,
    STATE(525), 1,
      sym_key_string,
    ACTIONS(210), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(524), 2,
      sym_key_value,
      sym_file_param,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    ACTIONS(212), 48,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
      sym_comment,
  [410] = 11,
    ACTIONS(218), 1,
      anon_sym_BSLASH,
    ACTIONS(221), 1,
      sym_key_string_text,
    ACTIONS(224), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(23), 1,
      aux_sym_multipart_form_data_section_repeat1,
    STATE(416), 1,
      sym_multipart_form_data_param,
    STATE(525), 1,
      sym_key_string,
    ACTIONS(214), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(524), 2,
      sym_key_value,
      sym_file_param,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    ACTIONS(216), 47,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      aux_sym_digit_token1,
      sym_comment,
  [495] = 10,
    ACTIONS(231), 1,
      anon_sym_BSLASH,
    ACTIONS(234), 1,
      sym_key_string_text,
    ACTIONS(237), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(343), 1,
      sym_key_value,
    STATE(498), 1,
      sym_key_string,
    ACTIONS(227), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(24), 2,
      sym_header,
      aux_sym_request_repeat1,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    ACTIONS(229), 47,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      aux_sym_digit_token1,
      sym_comment,
  [577] = 12,
    ACTIONS(244), 1,
      anon_sym_header,
    ACTIONS(246), 1,
      anon_sym_variable,
    ACTIONS(250), 1,
      anon_sym_cookie,
    ACTIONS(252), 1,
      anon_sym_xpath,
    ACTIONS(254), 1,
      anon_sym_jsonpath,
    ACTIONS(256), 1,
      anon_sym_regex,
    STATE(18), 1,
      sym_query,
    ACTIONS(240), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(27), 2,
      sym_assert,
      aux_sym_asserts_section_repeat1,
    ACTIONS(248), 7,
      anon_sym_status,
      anon_sym_url,
      anon_sym_body,
      anon_sym_duration,
      anon_sym_bytes,
      anon_sym_sha256,
      anon_sym_md5,
    STATE(72), 7,
      sym_simple_query,
      sym_header_query,
      sym_cookie_query,
      sym_xpath_query,
      sym_jsonpath_query,
      sym_regex_query,
      sym_variable_query,
    ACTIONS(242), 35,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_LBRACKCaptures_RBRACK,
      anon_sym_LBRACKAsserts_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
      sym_comment,
  [662] = 12,
    ACTIONS(262), 1,
      anon_sym_header,
    ACTIONS(265), 1,
      anon_sym_variable,
    ACTIONS(271), 1,
      anon_sym_cookie,
    ACTIONS(274), 1,
      anon_sym_xpath,
    ACTIONS(277), 1,
      anon_sym_jsonpath,
    ACTIONS(280), 1,
      anon_sym_regex,
    STATE(18), 1,
      sym_query,
    ACTIONS(258), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(26), 2,
      sym_assert,
      aux_sym_asserts_section_repeat1,
    ACTIONS(268), 7,
      anon_sym_status,
      anon_sym_url,
      anon_sym_body,
      anon_sym_duration,
      anon_sym_bytes,
      anon_sym_sha256,
      anon_sym_md5,
    STATE(72), 7,
      sym_simple_query,
      sym_header_query,
      sym_cookie_query,
      sym_xpath_query,
      sym_jsonpath_query,
      sym_regex_query,
      sym_variable_query,
    ACTIONS(260), 35,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_LBRACKCaptures_RBRACK,
      anon_sym_LBRACKAsserts_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
      sym_comment,
  [747] = 12,
    ACTIONS(244), 1,
      anon_sym_header,
    ACTIONS(246), 1,
      anon_sym_variable,
    ACTIONS(250), 1,
      anon_sym_cookie,
    ACTIONS(252), 1,
      anon_sym_xpath,
    ACTIONS(254), 1,
      anon_sym_jsonpath,
    ACTIONS(256), 1,
      anon_sym_regex,
    STATE(18), 1,
      sym_query,
    ACTIONS(283), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(26), 2,
      sym_assert,
      aux_sym_asserts_section_repeat1,
    ACTIONS(248), 7,
      anon_sym_status,
      anon_sym_url,
      anon_sym_body,
      anon_sym_duration,
      anon_sym_bytes,
      anon_sym_sha256,
      anon_sym_md5,
    STATE(72), 7,
      sym_simple_query,
      sym_header_query,
      sym_cookie_query,
      sym_xpath_query,
      sym_jsonpath_query,
      sym_regex_query,
      sym_variable_query,
    ACTIONS(285), 35,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_LBRACKCaptures_RBRACK,
      anon_sym_LBRACKAsserts_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
      sym_comment,
  [832] = 9,
    ACTIONS(80), 1,
      anon_sym_BSLASH,
    ACTIONS(94), 1,
      sym_key_string_text,
    ACTIONS(291), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(498), 1,
      sym_key_string,
    STATE(517), 1,
      sym_key_value,
    ACTIONS(287), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    ACTIONS(289), 47,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      aux_sym_digit_token1,
      sym_comment,
  [910] = 9,
    ACTIONS(80), 1,
      anon_sym_BSLASH,
    ACTIONS(94), 1,
      sym_key_string_text,
    ACTIONS(291), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(498), 1,
      sym_key_string,
    STATE(517), 1,
      sym_key_value,
    ACTIONS(293), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    ACTIONS(295), 47,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      aux_sym_digit_token1,
      sym_comment,
  [988] = 9,
    ACTIONS(80), 1,
      anon_sym_BSLASH,
    ACTIONS(94), 1,
      sym_key_string_text,
    ACTIONS(291), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(498), 1,
      sym_key_string,
    STATE(517), 1,
      sym_key_value,
    ACTIONS(297), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    ACTIONS(299), 47,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      aux_sym_digit_token1,
      sym_comment,
  [1066] = 9,
    ACTIONS(80), 1,
      anon_sym_BSLASH,
    ACTIONS(94), 1,
      sym_key_string_text,
    ACTIONS(291), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(498), 1,
      sym_key_string,
    STATE(517), 1,
      sym_key_value,
    ACTIONS(301), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    ACTIONS(303), 47,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      aux_sym_digit_token1,
      sym_comment,
  [1144] = 9,
    ACTIONS(80), 1,
      anon_sym_BSLASH,
    ACTIONS(94), 1,
      sym_key_string_text,
    ACTIONS(291), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(498), 1,
      sym_key_string,
    STATE(517), 1,
      sym_key_value,
    ACTIONS(305), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    ACTIONS(307), 47,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      aux_sym_digit_token1,
      sym_comment,
  [1222] = 9,
    ACTIONS(80), 1,
      anon_sym_BSLASH,
    ACTIONS(94), 1,
      sym_key_string_text,
    ACTIONS(291), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(498), 1,
      sym_key_string,
    STATE(517), 1,
      sym_key_value,
    ACTIONS(309), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    ACTIONS(311), 47,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      aux_sym_digit_token1,
      sym_comment,
  [1300] = 9,
    ACTIONS(80), 1,
      anon_sym_BSLASH,
    ACTIONS(94), 1,
      sym_key_string_text,
    ACTIONS(291), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(498), 1,
      sym_key_string,
    STATE(517), 1,
      sym_key_value,
    ACTIONS(313), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    ACTIONS(315), 47,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      aux_sym_digit_token1,
      sym_comment,
  [1378] = 9,
    ACTIONS(80), 1,
      anon_sym_BSLASH,
    ACTIONS(94), 1,
      sym_key_string_text,
    ACTIONS(291), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(498), 1,
      sym_key_string,
    STATE(517), 1,
      sym_key_value,
    ACTIONS(317), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    ACTIONS(319), 47,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      aux_sym_digit_token1,
      sym_comment,
  [1456] = 9,
    ACTIONS(80), 1,
      anon_sym_BSLASH,
    ACTIONS(94), 1,
      sym_key_string_text,
    ACTIONS(291), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(498), 1,
      sym_key_string,
    STATE(517), 1,
      sym_key_value,
    ACTIONS(321), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    ACTIONS(323), 47,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      aux_sym_digit_token1,
      sym_comment,
  [1534] = 10,
    ACTIONS(329), 1,
      anon_sym_LBRACKBasicAuth_RBRACK,
    ACTIONS(341), 1,
      anon_sym_LBRACKCookies_RBRACK,
    ACTIONS(344), 1,
      anon_sym_LBRACKOptions_RBRACK,
    ACTIONS(325), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(332), 2,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
    ACTIONS(335), 2,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
    ACTIONS(338), 2,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
    STATE(37), 2,
      sym_request_section,
      aux_sym_request_repeat2,
    STATE(51), 6,
      sym_basic_auth_section,
      sym_query_string_params_section,
      sym_form_params_section,
      sym_multipart_form_data_section,
      sym_cookies_section,
      sym_options_section,
    ACTIONS(327), 39,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
      sym_comment,
  [1613] = 11,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(347), 1,
      anon_sym_xpath,
    ACTIONS(350), 1,
      anon_sym_regex,
    ACTIONS(360), 1,
      anon_sym_nth,
    ACTIONS(363), 1,
      anon_sym_replace,
    ACTIONS(366), 1,
      anon_sym_split,
    STATE(38), 2,
      sym_filter,
      aux_sym_capture_repeat1,
    ACTIONS(353), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    STATE(63), 6,
      sym_simple_filter_key,
      sym_regex_filter,
      sym_nth_filter,
      sym_replace_filter,
      sym_split_filter,
      sym_xpath_filter,
    ACTIONS(357), 11,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
    ACTIONS(355), 26,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_RBRACE_RBRACE,
  [1692] = 6,
    ACTIONS(369), 1,
      ts_builtin_sym_end,
    ACTIONS(371), 1,
      anon_sym_LF,
    ACTIONS(376), 1,
      sym_comment,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(39), 2,
      sym__comment_or_new_line,
      aux_sym_hurl_file_repeat2,
    ACTIONS(374), 49,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_BSLASH,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      sym_key_string_text,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
  [1760] = 5,
    ACTIONS(116), 1,
      ts_builtin_sym_end,
    ACTIONS(379), 1,
      anon_sym_LF,
    ACTIONS(382), 1,
      sym_comment,
    STATE(40), 1,
      aux_sym__comment_or_new_line_repeat1,
    ACTIONS(121), 49,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_BSLASH,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      sym_key_string_text,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
  [1824] = 5,
    ACTIONS(126), 1,
      ts_builtin_sym_end,
    ACTIONS(385), 1,
      anon_sym_LF,
    ACTIONS(387), 1,
      sym_comment,
    STATE(40), 1,
      aux_sym__comment_or_new_line_repeat1,
    ACTIONS(130), 49,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_BSLASH,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      sym_key_string_text,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
  [1888] = 2,
    ACTIONS(214), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(216), 50,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_BSLASH,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      sym_key_string_text,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
      sym_comment,
  [1945] = 2,
    ACTIONS(389), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(391), 50,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_BSLASH,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      sym_key_string_text,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
      sym_comment,
  [2002] = 5,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(397), 1,
      aux_sym_digit_token1,
    STATE(45), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    ACTIONS(395), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(393), 42,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_RBRACE_RBRACE,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [2064] = 5,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(403), 1,
      aux_sym_digit_token1,
    STATE(45), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    ACTIONS(401), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(399), 42,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_RBRACE_RBRACE,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [2126] = 5,
    ACTIONS(126), 1,
      ts_builtin_sym_end,
    ACTIONS(406), 1,
      anon_sym_LF,
    ACTIONS(408), 1,
      sym_comment,
    STATE(47), 1,
      aux_sym__comment_or_new_line_repeat1,
    ACTIONS(130), 47,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_LBRACKCaptures_RBRACK,
      anon_sym_LBRACKAsserts_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_header,
      anon_sym_variable,
      anon_sym_status,
      anon_sym_url,
      anon_sym_body,
      anon_sym_duration,
      anon_sym_bytes,
      anon_sym_sha256,
      anon_sym_md5,
      anon_sym_cookie,
      anon_sym_xpath,
      anon_sym_jsonpath,
      anon_sym_regex,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
  [2188] = 5,
    ACTIONS(116), 1,
      ts_builtin_sym_end,
    ACTIONS(410), 1,
      anon_sym_LF,
    ACTIONS(413), 1,
      sym_comment,
    STATE(47), 1,
      aux_sym__comment_or_new_line_repeat1,
    ACTIONS(121), 47,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_LBRACKCaptures_RBRACK,
      anon_sym_LBRACKAsserts_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_header,
      anon_sym_variable,
      anon_sym_status,
      anon_sym_url,
      anon_sym_body,
      anon_sym_duration,
      anon_sym_bytes,
      anon_sym_sha256,
      anon_sym_md5,
      anon_sym_cookie,
      anon_sym_xpath,
      anon_sym_jsonpath,
      anon_sym_regex,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
  [2250] = 2,
    ACTIONS(416), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(418), 48,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
      sym_comment,
  [2305] = 2,
    ACTIONS(420), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(422), 48,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_LBRACKCaptures_RBRACK,
      anon_sym_LBRACKAsserts_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_header,
      anon_sym_variable,
      anon_sym_status,
      anon_sym_url,
      anon_sym_body,
      anon_sym_duration,
      anon_sym_bytes,
      anon_sym_sha256,
      anon_sym_md5,
      anon_sym_cookie,
      anon_sym_xpath,
      anon_sym_jsonpath,
      anon_sym_regex,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
      sym_comment,
  [2360] = 2,
    ACTIONS(424), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(426), 48,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_LBRACKCaptures_RBRACK,
      anon_sym_LBRACKAsserts_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_header,
      anon_sym_variable,
      anon_sym_status,
      anon_sym_url,
      anon_sym_body,
      anon_sym_duration,
      anon_sym_bytes,
      anon_sym_sha256,
      anon_sym_md5,
      anon_sym_cookie,
      anon_sym_xpath,
      anon_sym_jsonpath,
      anon_sym_regex,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
      sym_comment,
  [2415] = 2,
    ACTIONS(428), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(430), 48,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      anon_sym_LBRACKBasicAuth_RBRACK,
      anon_sym_LBRACKQuery_RBRACK,
      anon_sym_LBRACKQueryStringParams_RBRACK,
      anon_sym_LBRACKForm_RBRACK,
      anon_sym_LBRACKFormParams_RBRACK,
      anon_sym_LBRACKMultipart_RBRACK,
      anon_sym_LBRACKMultipartFormData_RBRACK,
      anon_sym_LBRACKCookies_RBRACK,
      anon_sym_LBRACKOptions_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
      sym_comment,
  [2470] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(434), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(432), 43,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_RBRACE_RBRACE,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      aux_sym_digit_token1,
  [2526] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(438), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(436), 43,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_DQUOTE,
      anon_sym_RBRACE_RBRACE,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [2582] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(442), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(440), 43,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_DQUOTE,
      anon_sym_RBRACE_RBRACE,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [2638] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(446), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(444), 43,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_DQUOTE,
      anon_sym_RBRACE_RBRACE,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [2694] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(450), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(448), 43,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_DQUOTE,
      anon_sym_RBRACE_RBRACE,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [2750] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(454), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(452), 42,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_RBRACE_RBRACE,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [2805] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(458), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(456), 42,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_RBRACE_RBRACE,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [2860] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(462), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(460), 42,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_RBRACE_RBRACE,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [2915] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(466), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(464), 42,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_RBRACE_RBRACE,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [2970] = 10,
    ACTIONS(231), 1,
      anon_sym_BSLASH,
    ACTIONS(234), 1,
      sym_key_string_text,
    ACTIONS(237), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(355), 1,
      sym_key_value,
    STATE(498), 1,
      sym_key_string,
    ACTIONS(227), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(61), 2,
      sym_header,
      aux_sym_request_repeat1,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    ACTIONS(229), 34,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_LBRACKCaptures_RBRACK,
      anon_sym_LBRACKAsserts_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      aux_sym_digit_token1,
      sym_comment,
  [3039] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(470), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(468), 42,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_RBRACE_RBRACE,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [3094] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(474), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(472), 42,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_RBRACE_RBRACE,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [3149] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(478), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(476), 42,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_RBRACE_RBRACE,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [3204] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(482), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(480), 41,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [3258] = 9,
    ACTIONS(80), 1,
      anon_sym_BSLASH,
    ACTIONS(94), 1,
      sym_key_string_text,
    ACTIONS(291), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(501), 1,
      sym_key_string,
    ACTIONS(484), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(75), 2,
      sym_capture,
      aux_sym_captures_section_repeat1,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    ACTIONS(486), 34,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_LBRACKCaptures_RBRACK,
      anon_sym_LBRACKAsserts_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      aux_sym_digit_token1,
      sym_comment,
  [3324] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(490), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(488), 41,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [3378] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(494), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(492), 41,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [3432] = 9,
    ACTIONS(500), 1,
      anon_sym_BSLASH,
    ACTIONS(503), 1,
      sym_key_string_text,
    ACTIONS(506), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(501), 1,
      sym_key_string,
    ACTIONS(496), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(69), 2,
      sym_capture,
      aux_sym_captures_section_repeat1,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    ACTIONS(498), 34,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_LBRACKCaptures_RBRACK,
      anon_sym_LBRACKAsserts_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      aux_sym_digit_token1,
      sym_comment,
  [3498] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(511), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(509), 41,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [3552] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(515), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(513), 41,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [3606] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(519), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(517), 41,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [3660] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(523), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(521), 41,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [3714] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(527), 5,
      anon_sym_not,
      anon_sym_greaterThan,
      anon_sym_GT,
      anon_sym_lessThan,
      anon_sym_LT,
    ACTIONS(525), 41,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
      anon_sym_equals,
      anon_sym_EQ_EQ,
      anon_sym_notEquals,
      anon_sym_BANG_EQ,
      anon_sym_greaterThanOrEquals,
      anon_sym_GT_EQ,
      anon_sym_lessThanOrEquals,
      anon_sym_LT_EQ,
      anon_sym_startsWith,
      anon_sym_endsWith,
      anon_sym_contains,
      anon_sym_matches,
      anon_sym_includes,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [3768] = 9,
    ACTIONS(80), 1,
      anon_sym_BSLASH,
    ACTIONS(94), 1,
      sym_key_string_text,
    ACTIONS(291), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(501), 1,
      sym_key_string,
    ACTIONS(529), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(69), 2,
      sym_capture,
      aux_sym_captures_section_repeat1,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    ACTIONS(531), 34,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_LBRACKCaptures_RBRACK,
      anon_sym_LBRACKAsserts_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      aux_sym_digit_token1,
      sym_comment,
  [3834] = 21,
    ACTIONS(158), 1,
      anon_sym_equals,
    ACTIONS(160), 1,
      anon_sym_EQ_EQ,
    ACTIONS(162), 1,
      anon_sym_notEquals,
    ACTIONS(164), 1,
      anon_sym_BANG_EQ,
    ACTIONS(166), 1,
      anon_sym_greaterThan,
    ACTIONS(168), 1,
      anon_sym_GT,
    ACTIONS(170), 1,
      anon_sym_greaterThanOrEquals,
    ACTIONS(172), 1,
      anon_sym_GT_EQ,
    ACTIONS(174), 1,
      anon_sym_lessThan,
    ACTIONS(176), 1,
      anon_sym_LT,
    ACTIONS(178), 1,
      anon_sym_lessThanOrEquals,
    ACTIONS(180), 1,
      anon_sym_LT_EQ,
    ACTIONS(182), 1,
      anon_sym_startsWith,
    ACTIONS(184), 1,
      anon_sym_endsWith,
    ACTIONS(186), 1,
      anon_sym_contains,
    ACTIONS(188), 1,
      anon_sym_matches,
    ACTIONS(190), 1,
      anon_sym_includes,
    ACTIONS(200), 1,
      sym_comment,
    STATE(549), 1,
      sym_predicate_func,
    ACTIONS(156), 12,
      anon_sym_exists,
      anon_sym_isInteger,
      anon_sym_isFloat,
      anon_sym_isBoolean,
      anon_sym_isString,
      anon_sym_isCollection,
      anon_sym_isNumber,
      anon_sym_isIsoDate,
      anon_sym_isEmpty,
      anon_sym_isIpv4,
      anon_sym_isIpv6,
      anon_sym_isUuid,
    STATE(523), 12,
      sym_simple_predicate,
      sym_equal_predicate,
      sym_not_equal_predicate,
      sym_greater_predicate,
      sym_greater_or_equal_predicate,
      sym_less_predicate,
      sym_less_or_equal_predicate,
      sym_start_with_predicate,
      sym_end_with_predicate,
      sym_contain_predicate,
      sym_match_predicate,
      sym_include_predicate,
  [3920] = 6,
    ACTIONS(537), 1,
      anon_sym_LBRACKCaptures_RBRACK,
    ACTIONS(540), 1,
      anon_sym_LBRACKAsserts_RBRACK,
    ACTIONS(533), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    STATE(77), 2,
      sym_response_section,
      aux_sym_response_repeat1,
    STATE(83), 2,
      sym_captures_section,
      sym_asserts_section,
    ACTIONS(535), 33,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
      sym_comment,
  [3974] = 5,
    ACTIONS(116), 1,
      ts_builtin_sym_end,
    ACTIONS(543), 1,
      anon_sym_LF,
    ACTIONS(546), 1,
      sym_comment,
    STATE(78), 1,
      aux_sym__comment_or_new_line_repeat1,
    ACTIONS(121), 36,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_LBRACKCaptures_RBRACK,
      anon_sym_LBRACKAsserts_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_BSLASH,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      sym_key_string_text,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
  [4025] = 5,
    ACTIONS(126), 1,
      ts_builtin_sym_end,
    ACTIONS(549), 1,
      anon_sym_LF,
    ACTIONS(551), 1,
      sym_comment,
    STATE(78), 1,
      aux_sym__comment_or_new_line_repeat1,
    ACTIONS(130), 36,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_LBRACKCaptures_RBRACK,
      anon_sym_LBRACKAsserts_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_BSLASH,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      sym_key_string_text,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
  [4076] = 2,
    ACTIONS(553), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(555), 37,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_LBRACKCaptures_RBRACK,
      anon_sym_LBRACKAsserts_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_BSLASH,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      sym_key_string_text,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
      sym_comment,
  [4120] = 2,
    ACTIONS(557), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(559), 37,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_LBRACKCaptures_RBRACK,
      anon_sym_LBRACKAsserts_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_BSLASH,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      sym_key_string_text,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
      sym_comment,
  [4164] = 2,
    ACTIONS(389), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(391), 37,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_LBRACKCaptures_RBRACK,
      anon_sym_LBRACKAsserts_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_BSLASH,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      sym_key_string_text,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
      sym_comment,
  [4208] = 2,
    ACTIONS(561), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(563), 35,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_LBRACKCaptures_RBRACK,
      anon_sym_LBRACKAsserts_RBRACK,
      anon_sym_null,
      anon_sym_file_COMMA,
      anon_sym_LBRACE,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_base64_COMMA,
      anon_sym_hex_COMMA,
      anon_sym_DQUOTE,
      aux_sym_oneline_string_token1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACK,
      anon_sym_true,
      anon_sym_false,
      anon_sym_LBRACE_LBRACE,
      aux_sym_digit_token1,
      sym_comment,
  [4250] = 9,
    ACTIONS(7), 1,
      anon_sym_LF,
    ACTIONS(11), 1,
      sym_comment,
    ACTIONS(565), 1,
      ts_builtin_sym_end,
    STATE(46), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(116), 1,
      sym_response,
    STATE(122), 1,
      sym__comment_or_new_line,
    STATE(358), 1,
      sym_version,
    ACTIONS(569), 6,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
    ACTIONS(567), 17,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
  [4299] = 9,
    ACTIONS(7), 1,
      anon_sym_LF,
    ACTIONS(11), 1,
      sym_comment,
    ACTIONS(571), 1,
      ts_builtin_sym_end,
    STATE(46), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(111), 1,
      sym_response,
    STATE(123), 1,
      sym__comment_or_new_line,
    STATE(358), 1,
      sym_version,
    ACTIONS(569), 6,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
    ACTIONS(573), 17,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
  [4348] = 12,
    ACTIONS(575), 1,
      anon_sym_LF,
    ACTIONS(577), 1,
      anon_sym_xpath,
    ACTIONS(579), 1,
      anon_sym_regex,
    ACTIONS(583), 1,
      anon_sym_nth,
    ACTIONS(585), 1,
      anon_sym_replace,
    ACTIONS(587), 1,
      anon_sym_split,
    ACTIONS(589), 1,
      sym_comment,
    STATE(79), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(81), 1,
      sym__comment_or_new_line,
    STATE(92), 2,
      sym_filter,
      aux_sym_capture_repeat1,
    STATE(136), 6,
      sym_simple_filter_key,
      sym_regex_filter,
      sym_nth_filter,
      sym_replace_filter,
      sym_split_filter,
      sym_xpath_filter,
    ACTIONS(581), 11,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
  [4401] = 12,
    ACTIONS(575), 1,
      anon_sym_LF,
    ACTIONS(577), 1,
      anon_sym_xpath,
    ACTIONS(579), 1,
      anon_sym_regex,
    ACTIONS(583), 1,
      anon_sym_nth,
    ACTIONS(585), 1,
      anon_sym_replace,
    ACTIONS(587), 1,
      anon_sym_split,
    ACTIONS(589), 1,
      sym_comment,
    STATE(79), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(80), 1,
      sym__comment_or_new_line,
    STATE(86), 2,
      sym_filter,
      aux_sym_capture_repeat1,
    STATE(136), 6,
      sym_simple_filter_key,
      sym_regex_filter,
      sym_nth_filter,
      sym_replace_filter,
      sym_split_filter,
      sym_xpath_filter,
    ACTIONS(581), 11,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
  [4454] = 9,
    ACTIONS(7), 1,
      anon_sym_LF,
    ACTIONS(11), 1,
      sym_comment,
    ACTIONS(591), 1,
      ts_builtin_sym_end,
    STATE(46), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(85), 1,
      sym_request,
    STATE(153), 1,
      sym_method,
    STATE(89), 2,
      sym_entry,
      aux_sym_hurl_file_repeat1,
    STATE(99), 2,
      sym__comment_or_new_line,
      aux_sym_hurl_file_repeat2,
    ACTIONS(9), 17,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
  [4500] = 9,
    ACTIONS(593), 1,
      ts_builtin_sym_end,
    ACTIONS(595), 1,
      anon_sym_LF,
    ACTIONS(601), 1,
      sym_comment,
    STATE(85), 1,
      sym_request,
    STATE(121), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(153), 1,
      sym_method,
    STATE(89), 2,
      sym_entry,
      aux_sym_hurl_file_repeat1,
    STATE(103), 2,
      sym__comment_or_new_line,
      aux_sym_hurl_file_repeat2,
    ACTIONS(598), 17,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
  [4546] = 10,
    ACTIONS(150), 1,
      anon_sym_xpath,
    ACTIONS(152), 1,
      anon_sym_regex,
    ACTIONS(194), 1,
      anon_sym_nth,
    ACTIONS(196), 1,
      anon_sym_replace,
    ACTIONS(198), 1,
      anon_sym_split,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(604), 1,
      anon_sym_RBRACE_RBRACE,
    STATE(38), 2,
      sym_filter,
      aux_sym_capture_repeat1,
    STATE(63), 6,
      sym_simple_filter_key,
      sym_regex_filter,
      sym_nth_filter,
      sym_replace_filter,
      sym_split_filter,
      sym_xpath_filter,
    ACTIONS(192), 11,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
  [4593] = 2,
    ACTIONS(606), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(608), 24,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      sym_comment,
  [4624] = 10,
    ACTIONS(353), 1,
      sym_comment,
    ACTIONS(355), 1,
      anon_sym_LF,
    ACTIONS(610), 1,
      anon_sym_xpath,
    ACTIONS(613), 1,
      anon_sym_regex,
    ACTIONS(619), 1,
      anon_sym_nth,
    ACTIONS(622), 1,
      anon_sym_replace,
    ACTIONS(625), 1,
      anon_sym_split,
    STATE(92), 2,
      sym_filter,
      aux_sym_capture_repeat1,
    STATE(136), 6,
      sym_simple_filter_key,
      sym_regex_filter,
      sym_nth_filter,
      sym_replace_filter,
      sym_split_filter,
      sym_xpath_filter,
    ACTIONS(616), 11,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
  [4671] = 10,
    ACTIONS(150), 1,
      anon_sym_xpath,
    ACTIONS(152), 1,
      anon_sym_regex,
    ACTIONS(194), 1,
      anon_sym_nth,
    ACTIONS(196), 1,
      anon_sym_replace,
    ACTIONS(198), 1,
      anon_sym_split,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(628), 1,
      anon_sym_RBRACE_RBRACE,
    STATE(90), 2,
      sym_filter,
      aux_sym_capture_repeat1,
    STATE(63), 6,
      sym_simple_filter_key,
      sym_regex_filter,
      sym_nth_filter,
      sym_replace_filter,
      sym_split_filter,
      sym_xpath_filter,
    ACTIONS(192), 11,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
  [4718] = 2,
    ACTIONS(134), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(136), 24,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      sym_comment,
  [4749] = 2,
    ACTIONS(630), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(632), 24,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      sym_comment,
  [4780] = 2,
    ACTIONS(60), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(62), 24,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      sym_comment,
  [4811] = 2,
    ACTIONS(112), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(114), 24,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      anon_sym_HTTP_SLASH1_DOT0,
      anon_sym_HTTP_SLASH1_DOT1,
      anon_sym_HTTP_SLASH2,
      anon_sym_HTTP_SLASH3,
      anon_sym_HTTP_SLASH_STAR,
      anon_sym_HTTP,
      sym_comment,
  [4842] = 4,
    ACTIONS(393), 1,
      anon_sym_LF,
    ACTIONS(634), 1,
      aux_sym_digit_token1,
    STATE(100), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    ACTIONS(395), 21,
      anon_sym_ms,
      anon_sym_s,
      anon_sym_m,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      anon_sym_DOT,
      sym_comment,
  [4876] = 8,
    ACTIONS(7), 1,
      anon_sym_LF,
    ACTIONS(11), 1,
      sym_comment,
    ACTIONS(636), 1,
      ts_builtin_sym_end,
    STATE(46), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(84), 1,
      sym_request,
    STATE(153), 1,
      sym_method,
    STATE(110), 2,
      sym__comment_or_new_line,
      aux_sym_hurl_file_repeat2,
    ACTIONS(9), 17,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
  [4918] = 4,
    ACTIONS(399), 1,
      anon_sym_LF,
    ACTIONS(638), 1,
      aux_sym_digit_token1,
    STATE(100), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    ACTIONS(401), 21,
      anon_sym_ms,
      anon_sym_s,
      anon_sym_m,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      anon_sym_DOT,
      sym_comment,
  [4952] = 8,
    ACTIONS(7), 1,
      anon_sym_LF,
    ACTIONS(11), 1,
      sym_comment,
    ACTIONS(591), 1,
      ts_builtin_sym_end,
    STATE(46), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(84), 1,
      sym_request,
    STATE(153), 1,
      sym_method,
    STATE(110), 2,
      sym__comment_or_new_line,
      aux_sym_hurl_file_repeat2,
    ACTIONS(9), 17,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
  [4994] = 15,
    ACTIONS(634), 1,
      aux_sym_digit_token1,
    ACTIONS(643), 1,
      anon_sym_null,
    ACTIONS(645), 1,
      anon_sym_file_COMMA,
    ACTIONS(647), 1,
      anon_sym_BSLASH,
    ACTIONS(649), 1,
      aux_sym_value_string_text_token1,
    ACTIONS(653), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(267), 1,
      aux_sym_value_string_text_repeat1,
    STATE(347), 1,
      sym_integer,
    STATE(482), 1,
      sym_file_value,
    ACTIONS(641), 2,
      anon_sym_LF,
      sym_comment,
    ACTIONS(651), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    STATE(167), 3,
      sym_value_string_content,
      sym_template,
      aux_sym_value_string_repeat1,
    STATE(205), 3,
      sym_value_string_text,
      sym_value_string_escaped_char,
      aux_sym_value_string_content_repeat1,
    STATE(530), 3,
      sym_value_string,
      sym_boolean,
      sym_float,
  [5049] = 7,
    ACTIONS(655), 1,
      anon_sym_LF,
    ACTIONS(657), 1,
      sym_comment,
    STATE(84), 1,
      sym_request,
    STATE(121), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(153), 1,
      sym_method,
    STATE(114), 2,
      sym__comment_or_new_line,
      aux_sym_hurl_file_repeat2,
    ACTIONS(9), 17,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
  [5088] = 14,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(659), 1,
      anon_sym_null,
    ACTIONS(661), 1,
      anon_sym_file_COMMA,
    ACTIONS(663), 1,
      anon_sym_base64_COMMA,
    ACTIONS(665), 1,
      anon_sym_hex_COMMA,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    ACTIONS(669), 1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
    ACTIONS(673), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(675), 1,
      aux_sym_digit_token1,
    STATE(394), 1,
      sym_integer,
    STATE(598), 1,
      sym_predicate_value,
    ACTIONS(671), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    STATE(551), 8,
      sym_oneline_base64,
      sym_oneline_file,
      sym_oneline_hex,
      sym_quoted_string,
      sym_multiline_string,
      sym_template,
      sym_boolean,
      sym_float,
  [5140] = 14,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(659), 1,
      anon_sym_null,
    ACTIONS(661), 1,
      anon_sym_file_COMMA,
    ACTIONS(663), 1,
      anon_sym_base64_COMMA,
    ACTIONS(665), 1,
      anon_sym_hex_COMMA,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    ACTIONS(669), 1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
    ACTIONS(673), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(675), 1,
      aux_sym_digit_token1,
    STATE(394), 1,
      sym_integer,
    STATE(599), 1,
      sym_predicate_value,
    ACTIONS(671), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    STATE(551), 8,
      sym_oneline_base64,
      sym_oneline_file,
      sym_oneline_hex,
      sym_quoted_string,
      sym_multiline_string,
      sym_template,
      sym_boolean,
      sym_float,
  [5192] = 14,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(659), 1,
      anon_sym_null,
    ACTIONS(661), 1,
      anon_sym_file_COMMA,
    ACTIONS(663), 1,
      anon_sym_base64_COMMA,
    ACTIONS(665), 1,
      anon_sym_hex_COMMA,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    ACTIONS(669), 1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
    ACTIONS(673), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(675), 1,
      aux_sym_digit_token1,
    STATE(394), 1,
      sym_integer,
    STATE(554), 1,
      sym_predicate_value,
    ACTIONS(671), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    STATE(551), 8,
      sym_oneline_base64,
      sym_oneline_file,
      sym_oneline_hex,
      sym_quoted_string,
      sym_multiline_string,
      sym_template,
      sym_boolean,
      sym_float,
  [5244] = 14,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(659), 1,
      anon_sym_null,
    ACTIONS(661), 1,
      anon_sym_file_COMMA,
    ACTIONS(663), 1,
      anon_sym_base64_COMMA,
    ACTIONS(665), 1,
      anon_sym_hex_COMMA,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    ACTIONS(669), 1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
    ACTIONS(673), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(675), 1,
      aux_sym_digit_token1,
    STATE(394), 1,
      sym_integer,
    STATE(597), 1,
      sym_predicate_value,
    ACTIONS(671), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    STATE(551), 8,
      sym_oneline_base64,
      sym_oneline_file,
      sym_oneline_hex,
      sym_quoted_string,
      sym_multiline_string,
      sym_template,
      sym_boolean,
      sym_float,
  [5296] = 2,
    ACTIONS(432), 1,
      anon_sym_LF,
    ACTIONS(434), 22,
      anon_sym_ms,
      anon_sym_s,
      anon_sym_m,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      aux_sym_digit_token1,
      anon_sym_DOT,
      sym_comment,
  [5324] = 14,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(659), 1,
      anon_sym_null,
    ACTIONS(661), 1,
      anon_sym_file_COMMA,
    ACTIONS(663), 1,
      anon_sym_base64_COMMA,
    ACTIONS(665), 1,
      anon_sym_hex_COMMA,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    ACTIONS(669), 1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
    ACTIONS(673), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(675), 1,
      aux_sym_digit_token1,
    STATE(394), 1,
      sym_integer,
    STATE(577), 1,
      sym_predicate_value,
    ACTIONS(671), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    STATE(551), 8,
      sym_oneline_base64,
      sym_oneline_file,
      sym_oneline_hex,
      sym_quoted_string,
      sym_multiline_string,
      sym_template,
      sym_boolean,
      sym_float,
  [5376] = 6,
    ACTIONS(369), 1,
      ts_builtin_sym_end,
    ACTIONS(677), 1,
      anon_sym_LF,
    ACTIONS(680), 1,
      sym_comment,
    STATE(46), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(110), 2,
      sym__comment_or_new_line,
      aux_sym_hurl_file_repeat2,
    ACTIONS(374), 17,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
  [5412] = 6,
    ACTIONS(7), 1,
      anon_sym_LF,
    ACTIONS(11), 1,
      sym_comment,
    ACTIONS(565), 1,
      ts_builtin_sym_end,
    STATE(46), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(122), 1,
      sym__comment_or_new_line,
    ACTIONS(567), 17,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
  [5447] = 10,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(683), 1,
      anon_sym_header,
    ACTIONS(685), 1,
      anon_sym_variable,
    ACTIONS(689), 1,
      anon_sym_cookie,
    ACTIONS(691), 1,
      anon_sym_xpath,
    ACTIONS(693), 1,
      anon_sym_jsonpath,
    ACTIONS(695), 1,
      anon_sym_regex,
    STATE(87), 1,
      sym_query,
    ACTIONS(687), 7,
      anon_sym_status,
      anon_sym_url,
      anon_sym_body,
      anon_sym_duration,
      anon_sym_bytes,
      anon_sym_sha256,
      anon_sym_md5,
    STATE(145), 7,
      sym_simple_query,
      sym_header_query,
      sym_cookie_query,
      sym_xpath_query,
      sym_jsonpath_query,
      sym_regex_query,
      sym_variable_query,
  [5490] = 13,
    ACTIONS(634), 1,
      aux_sym_digit_token1,
    ACTIONS(643), 1,
      anon_sym_null,
    ACTIONS(647), 1,
      anon_sym_BSLASH,
    ACTIONS(649), 1,
      aux_sym_value_string_text_token1,
    ACTIONS(653), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(267), 1,
      aux_sym_value_string_text_repeat1,
    STATE(347), 1,
      sym_integer,
    ACTIONS(641), 2,
      anon_sym_LF,
      sym_comment,
    ACTIONS(651), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    STATE(167), 3,
      sym_value_string_content,
      sym_template,
      aux_sym_value_string_repeat1,
    STATE(205), 3,
      sym_value_string_text,
      sym_value_string_escaped_char,
      aux_sym_value_string_content_repeat1,
    STATE(530), 3,
      sym_value_string,
      sym_boolean,
      sym_float,
  [5539] = 5,
    ACTIONS(697), 1,
      anon_sym_LF,
    ACTIONS(700), 1,
      sym_comment,
    STATE(121), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(114), 2,
      sym__comment_or_new_line,
      aux_sym_hurl_file_repeat2,
    ACTIONS(374), 17,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
  [5572] = 14,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(634), 1,
      aux_sym_digit_token1,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    ACTIONS(673), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(703), 1,
      anon_sym_null,
    ACTIONS(705), 1,
      anon_sym_BSLASH,
    ACTIONS(707), 1,
      sym_key_string_text,
    STATE(406), 1,
      sym_integer,
    STATE(555), 1,
      sym_variable_value,
    ACTIONS(651), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    STATE(232), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(190), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
    STATE(570), 4,
      sym_quoted_string,
      sym_key_string,
      sym_boolean,
      sym_float,
  [5623] = 6,
    ACTIONS(7), 1,
      anon_sym_LF,
    ACTIONS(11), 1,
      sym_comment,
    ACTIONS(709), 1,
      ts_builtin_sym_end,
    STATE(46), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(124), 1,
      sym__comment_or_new_line,
    ACTIONS(711), 17,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
  [5658] = 2,
    ACTIONS(630), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(632), 18,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      sym_comment,
  [5683] = 2,
    ACTIONS(146), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(148), 18,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      sym_comment,
  [5708] = 4,
    ACTIONS(713), 1,
      anon_sym_LF,
    ACTIONS(716), 1,
      sym_comment,
    STATE(119), 1,
      aux_sym__comment_or_new_line_repeat1,
    ACTIONS(121), 17,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
  [5737] = 2,
    ACTIONS(719), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(721), 18,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      sym_comment,
  [5762] = 4,
    ACTIONS(723), 1,
      anon_sym_LF,
    ACTIONS(725), 1,
      sym_comment,
    STATE(119), 1,
      aux_sym__comment_or_new_line_repeat1,
    ACTIONS(130), 17,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
  [5791] = 2,
    ACTIONS(709), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(711), 18,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      sym_comment,
  [5816] = 2,
    ACTIONS(565), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(567), 18,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      sym_comment,
  [5841] = 2,
    ACTIONS(727), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(729), 18,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      sym_comment,
  [5866] = 2,
    ACTIONS(202), 2,
      ts_builtin_sym_end,
      anon_sym_LF,
    ACTIONS(204), 18,
      anon_sym_GET,
      anon_sym_HEAD,
      anon_sym_POST,
      anon_sym_PUT,
      anon_sym_DELETE,
      anon_sym_CONNECT,
      anon_sym_OPTIONS,
      anon_sym_TRACE,
      anon_sym_PATCH,
      anon_sym_LINK,
      anon_sym_UNLINK,
      anon_sym_PURGE,
      anon_sym_LOCK,
      anon_sym_UNLOCK,
      anon_sym_PROPFIND,
      anon_sym_VIEW,
      aux_sym_method_token1,
      sym_comment,
  [5891] = 12,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(731), 1,
      anon_sym_null,
    ACTIONS(733), 1,
      anon_sym_LBRACE,
    ACTIONS(735), 1,
      anon_sym_DQUOTE,
    ACTIONS(737), 1,
      anon_sym_LBRACK,
    ACTIONS(741), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(743), 1,
      aux_sym_digit_token1,
    STATE(209), 1,
      sym_json_integer,
    STATE(368), 1,
      sym_json_value,
    ACTIONS(739), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(191), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
    STATE(402), 6,
      sym_json_object,
      sym_json_array,
      sym_json_string,
      sym_json_number,
      sym_json_boolean,
      sym_template,
  [5935] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(745), 18,
      anon_sym_EQ,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_RBRACE_RBRACE,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
  [5959] = 12,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(731), 1,
      anon_sym_null,
    ACTIONS(733), 1,
      anon_sym_LBRACE,
    ACTIONS(735), 1,
      anon_sym_DQUOTE,
    ACTIONS(737), 1,
      anon_sym_LBRACK,
    ACTIONS(741), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(743), 1,
      aux_sym_digit_token1,
    STATE(209), 1,
      sym_json_integer,
    STATE(463), 1,
      sym_json_value,
    ACTIONS(739), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(191), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
    STATE(402), 6,
      sym_json_object,
      sym_json_array,
      sym_json_string,
      sym_json_number,
      sym_json_boolean,
      sym_template,
  [6003] = 12,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(731), 1,
      anon_sym_null,
    ACTIONS(733), 1,
      anon_sym_LBRACE,
    ACTIONS(735), 1,
      anon_sym_DQUOTE,
    ACTIONS(737), 1,
      anon_sym_LBRACK,
    ACTIONS(741), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(743), 1,
      aux_sym_digit_token1,
    STATE(209), 1,
      sym_json_integer,
    STATE(460), 1,
      sym_json_value,
    ACTIONS(739), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(191), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
    STATE(402), 6,
      sym_json_object,
      sym_json_array,
      sym_json_string,
      sym_json_number,
      sym_json_boolean,
      sym_template,
  [6047] = 12,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(731), 1,
      anon_sym_null,
    ACTIONS(733), 1,
      anon_sym_LBRACE,
    ACTIONS(735), 1,
      anon_sym_DQUOTE,
    ACTIONS(737), 1,
      anon_sym_LBRACK,
    ACTIONS(741), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(743), 1,
      aux_sym_digit_token1,
    STATE(209), 1,
      sym_json_integer,
    STATE(390), 1,
      sym_json_value,
    ACTIONS(739), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(191), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
    STATE(402), 6,
      sym_json_object,
      sym_json_array,
      sym_json_string,
      sym_json_number,
      sym_json_boolean,
      sym_template,
  [6091] = 2,
    ACTIONS(436), 1,
      anon_sym_LF,
    ACTIONS(438), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6114] = 2,
    ACTIONS(492), 1,
      anon_sym_LF,
    ACTIONS(494), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6137] = 2,
    ACTIONS(476), 1,
      anon_sym_LF,
    ACTIONS(478), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6160] = 2,
    ACTIONS(456), 1,
      anon_sym_LF,
    ACTIONS(458), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6183] = 2,
    ACTIONS(460), 1,
      anon_sym_LF,
    ACTIONS(462), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6206] = 2,
    ACTIONS(472), 1,
      anon_sym_LF,
    ACTIONS(474), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6229] = 2,
    ACTIONS(509), 1,
      anon_sym_LF,
    ACTIONS(511), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6252] = 2,
    ACTIONS(513), 1,
      anon_sym_LF,
    ACTIONS(515), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6275] = 2,
    ACTIONS(480), 1,
      anon_sym_LF,
    ACTIONS(482), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6298] = 2,
    ACTIONS(521), 1,
      anon_sym_LF,
    ACTIONS(523), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6321] = 2,
    ACTIONS(488), 1,
      anon_sym_LF,
    ACTIONS(490), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6344] = 2,
    ACTIONS(468), 1,
      anon_sym_LF,
    ACTIONS(470), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6367] = 2,
    ACTIONS(444), 1,
      anon_sym_LF,
    ACTIONS(446), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6390] = 2,
    ACTIONS(440), 1,
      anon_sym_LF,
    ACTIONS(442), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6413] = 2,
    ACTIONS(517), 1,
      anon_sym_LF,
    ACTIONS(519), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6436] = 2,
    ACTIONS(525), 1,
      anon_sym_LF,
    ACTIONS(527), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6459] = 2,
    ACTIONS(464), 1,
      anon_sym_LF,
    ACTIONS(466), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6482] = 2,
    ACTIONS(448), 1,
      anon_sym_LF,
    ACTIONS(450), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6505] = 2,
    ACTIONS(452), 1,
      anon_sym_LF,
    ACTIONS(454), 17,
      anon_sym_xpath,
      anon_sym_regex,
      anon_sym_count,
      anon_sym_urlEncode,
      anon_sym_urlDecode,
      anon_sym_toInt,
      anon_sym_htmlEscape,
      anon_sym_htmlUnescape,
      anon_sym_daysAfterNow,
      anon_sym_daysBeforeNow,
      anon_sym_decode,
      anon_sym_format,
      anon_sym_toDate,
      anon_sym_nth,
      anon_sym_replace,
      anon_sym_split,
      sym_comment,
  [6528] = 11,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(84), 1,
      anon_sym_LT,
    ACTIONS(747), 1,
      anon_sym_LT_QMARK,
    ACTIONS(749), 1,
      anon_sym_LT_SLASH,
    ACTIONS(751), 1,
      aux_sym_value_string_text_token1,
    ACTIONS(753), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(150), 1,
      sym_xml_open_tag,
    STATE(251), 1,
      aux_sym_value_string_text_repeat1,
    STATE(274), 1,
      sym_xml_close_tag,
    STATE(189), 3,
      sym_value_string_text,
      sym_template,
      aux_sym_xml_value_string_repeat1,
    STATE(152), 4,
      sym_xml_prolog_tag,
      sym_xml_tag,
      sym_xml_value_string,
      aux_sym_xml_tag_repeat1,
  [6567] = 11,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(84), 1,
      anon_sym_LT,
    ACTIONS(747), 1,
      anon_sym_LT_QMARK,
    ACTIONS(751), 1,
      aux_sym_value_string_text_token1,
    ACTIONS(753), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(755), 1,
      anon_sym_LT_SLASH,
    STATE(150), 1,
      sym_xml_open_tag,
    STATE(251), 1,
      aux_sym_value_string_text_repeat1,
    STATE(500), 1,
      sym_xml_close_tag,
    STATE(189), 3,
      sym_value_string_text,
      sym_template,
      aux_sym_xml_value_string_repeat1,
    STATE(154), 4,
      sym_xml_prolog_tag,
      sym_xml_tag,
      sym_xml_value_string,
      aux_sym_xml_tag_repeat1,
  [6606] = 11,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(84), 1,
      anon_sym_LT,
    ACTIONS(747), 1,
      anon_sym_LT_QMARK,
    ACTIONS(749), 1,
      anon_sym_LT_SLASH,
    ACTIONS(751), 1,
      aux_sym_value_string_text_token1,
    ACTIONS(753), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(150), 1,
      sym_xml_open_tag,
    STATE(251), 1,
      aux_sym_value_string_text_repeat1,
    STATE(262), 1,
      sym_xml_close_tag,
    STATE(189), 3,
      sym_value_string_text,
      sym_template,
      aux_sym_xml_value_string_repeat1,
    STATE(158), 4,
      sym_xml_prolog_tag,
      sym_xml_tag,
      sym_xml_value_string,
      aux_sym_xml_tag_repeat1,
  [6645] = 10,
    ACTIONS(647), 1,
      anon_sym_BSLASH,
    ACTIONS(649), 1,
      aux_sym_value_string_text_token1,
    ACTIONS(653), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(267), 1,
      aux_sym_value_string_text_repeat1,
    STATE(314), 1,
      sym_value_string,
    ACTIONS(757), 2,
      anon_sym_LF,
      sym_comment,
    STATE(6), 2,
      sym__comment_or_new_line,
      aux_sym_hurl_file_repeat2,
    STATE(167), 3,
      sym_value_string_content,
      sym_template,
      aux_sym_value_string_repeat1,
    STATE(205), 3,
      sym_value_string_text,
      sym_value_string_escaped_char,
      aux_sym_value_string_content_repeat1,
  [6682] = 11,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(84), 1,
      anon_sym_LT,
    ACTIONS(747), 1,
      anon_sym_LT_QMARK,
    ACTIONS(751), 1,
      aux_sym_value_string_text_token1,
    ACTIONS(753), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(755), 1,
      anon_sym_LT_SLASH,
    STATE(150), 1,
      sym_xml_open_tag,
    STATE(251), 1,
      aux_sym_value_string_text_repeat1,
    STATE(531), 1,
      sym_xml_close_tag,
    STATE(189), 3,
      sym_value_string_text,
      sym_template,
      aux_sym_xml_value_string_repeat1,
    STATE(158), 4,
      sym_xml_prolog_tag,
      sym_xml_tag,
      sym_xml_value_string,
      aux_sym_xml_tag_repeat1,
  [6721] = 12,
    ACTIONS(80), 1,
      anon_sym_BSLASH,
    ACTIONS(291), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(757), 1,
      sym_comment,
    ACTIONS(759), 1,
      anon_sym_LF,
    ACTIONS(761), 1,
      sym_key_string_text,
    STATE(29), 1,
      sym__comment_or_new_line,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(329), 1,
      sym_key_value,
    STATE(331), 1,
      aux_sym_query_string_params_section_repeat1,
    STATE(498), 1,
      sym_key_string,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
  [6761] = 12,
    ACTIONS(80), 1,
      anon_sym_BSLASH,
    ACTIONS(291), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(757), 1,
      sym_comment,
    ACTIONS(759), 1,
      anon_sym_LF,
    ACTIONS(761), 1,
      sym_key_string_text,
    STATE(33), 1,
      sym__comment_or_new_line,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(303), 1,
      aux_sym_query_string_params_section_repeat1,
    STATE(330), 1,
      sym_key_value,
    STATE(498), 1,
      sym_key_string,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
  [6801] = 12,
    ACTIONS(80), 1,
      anon_sym_BSLASH,
    ACTIONS(291), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(757), 1,
      sym_comment,
    ACTIONS(759), 1,
      anon_sym_LF,
    ACTIONS(761), 1,
      sym_key_string_text,
    STATE(34), 1,
      sym__comment_or_new_line,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(339), 1,
      sym_key_value,
    STATE(340), 1,
      aux_sym_query_string_params_section_repeat1,
    STATE(498), 1,
      sym_key_string,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
  [6841] = 10,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(763), 1,
      anon_sym_LT,
    ACTIONS(766), 1,
      anon_sym_LT_QMARK,
    ACTIONS(769), 1,
      anon_sym_LT_SLASH,
    ACTIONS(771), 1,
      aux_sym_value_string_text_token1,
    ACTIONS(774), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(150), 1,
      sym_xml_open_tag,
    STATE(251), 1,
      aux_sym_value_string_text_repeat1,
    STATE(189), 3,
      sym_value_string_text,
      sym_template,
      aux_sym_xml_value_string_repeat1,
    STATE(158), 4,
      sym_xml_prolog_tag,
      sym_xml_tag,
      sym_xml_value_string,
      aux_sym_xml_tag_repeat1,
  [6877] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(779), 1,
      anon_sym_u,
    ACTIONS(781), 1,
      anon_sym_POUND,
    ACTIONS(777), 10,
      anon_sym_COLON,
      anon_sym_SEMI,
      anon_sym_BSLASH,
      anon_sym_b,
      anon_sym_f,
      anon_sym_n,
      anon_sym_r,
      anon_sym_t,
      anon_sym_LBRACE,
      anon_sym_RBRACE,
  [6899] = 8,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(783), 1,
      anon_sym_LF,
    ACTIONS(785), 1,
      anon_sym_BSLASH,
    ACTIONS(787), 1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
    ACTIONS(789), 1,
      aux_sym__multiline_string_text_token1,
    ACTIONS(791), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(161), 3,
      sym_multiline_string_content,
      sym_template,
      aux_sym_multiline_string_repeat1,
    STATE(202), 3,
      sym__multiline_string_text,
      sym_multiline_string_escaped_char,
      aux_sym_multiline_string_content_repeat1,
  [6928] = 8,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(793), 1,
      anon_sym_LF,
    ACTIONS(796), 1,
      anon_sym_BSLASH,
    ACTIONS(799), 1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
    ACTIONS(801), 1,
      aux_sym__multiline_string_text_token1,
    ACTIONS(804), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(161), 3,
      sym_multiline_string_content,
      sym_template,
      aux_sym_multiline_string_repeat1,
    STATE(202), 3,
      sym__multiline_string_text,
      sym_multiline_string_escaped_char,
      aux_sym_multiline_string_content_repeat1,
  [6957] = 7,
    ACTIONS(809), 1,
      anon_sym_BSLASH,
    ACTIONS(812), 1,
      aux_sym_value_string_text_token1,
    ACTIONS(815), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(267), 1,
      aux_sym_value_string_text_repeat1,
    ACTIONS(807), 2,
      anon_sym_LF,
      sym_comment,
    STATE(162), 3,
      sym_value_string_content,
      sym_template,
      aux_sym_value_string_repeat1,
    STATE(205), 3,
      sym_value_string_text,
      sym_value_string_escaped_char,
      aux_sym_value_string_content_repeat1,
  [6984] = 8,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(783), 1,
      anon_sym_LF,
    ACTIONS(785), 1,
      anon_sym_BSLASH,
    ACTIONS(787), 1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
    ACTIONS(789), 1,
      aux_sym__multiline_string_text_token1,
    ACTIONS(791), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(164), 3,
      sym_multiline_string_content,
      sym_template,
      aux_sym_multiline_string_repeat1,
    STATE(202), 3,
      sym__multiline_string_text,
      sym_multiline_string_escaped_char,
      aux_sym_multiline_string_content_repeat1,
  [7013] = 8,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(785), 1,
      anon_sym_BSLASH,
    ACTIONS(789), 1,
      aux_sym__multiline_string_text_token1,
    ACTIONS(791), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(818), 1,
      anon_sym_LF,
    ACTIONS(820), 1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
    STATE(161), 3,
      sym_multiline_string_content,
      sym_template,
      aux_sym_multiline_string_repeat1,
    STATE(202), 3,
      sym__multiline_string_text,
      sym_multiline_string_escaped_char,
      aux_sym_multiline_string_content_repeat1,
  [7042] = 8,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(785), 1,
      anon_sym_BSLASH,
    ACTIONS(789), 1,
      aux_sym__multiline_string_text_token1,
    ACTIONS(791), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(822), 1,
      anon_sym_LF,
    ACTIONS(824), 1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
    STATE(160), 3,
      sym_multiline_string_content,
      sym_template,
      aux_sym_multiline_string_repeat1,
    STATE(202), 3,
      sym__multiline_string_text,
      sym_multiline_string_escaped_char,
      aux_sym_multiline_string_content_repeat1,
  [7071] = 9,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(647), 1,
      anon_sym_BSLASH,
    ACTIONS(649), 1,
      aux_sym_value_string_text_token1,
    ACTIONS(653), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(267), 1,
      aux_sym_value_string_text_repeat1,
    STATE(338), 1,
      sym_template,
    STATE(474), 1,
      sym_value_string,
    STATE(167), 2,
      sym_value_string_content,
      aux_sym_value_string_repeat1,
    STATE(205), 3,
      sym_value_string_text,
      sym_value_string_escaped_char,
      aux_sym_value_string_content_repeat1,
  [7102] = 7,
    ACTIONS(647), 1,
      anon_sym_BSLASH,
    ACTIONS(649), 1,
      aux_sym_value_string_text_token1,
    ACTIONS(653), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(267), 1,
      aux_sym_value_string_text_repeat1,
    ACTIONS(826), 2,
      anon_sym_LF,
      sym_comment,
    STATE(162), 3,
      sym_value_string_content,
      sym_template,
      aux_sym_value_string_repeat1,
    STATE(205), 3,
      sym_value_string_text,
      sym_value_string_escaped_char,
      aux_sym_value_string_content_repeat1,
  [7129] = 7,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(828), 1,
      anon_sym_BSLASH,
    ACTIONS(831), 1,
      anon_sym_DQUOTE,
    ACTIONS(833), 1,
      sym_quoted_string_text,
    ACTIONS(836), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(168), 3,
      sym_quoted_string_content,
      sym_template,
      aux_sym_quoted_string_repeat1,
    STATE(229), 3,
      sym_invalid_quoted_string_escaped_char,
      sym_quoted_string_escaped_char,
      aux_sym_quoted_string_content_repeat1,
  [7155] = 8,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(761), 1,
      sym_key_string_text,
    ACTIONS(839), 1,
      anon_sym_BSLASH,
    ACTIONS(841), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(498), 1,
      sym_key_string,
    STATE(517), 1,
      sym_key_value,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
  [7183] = 7,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(843), 1,
      anon_sym_BSLASH,
    ACTIONS(845), 1,
      anon_sym_DQUOTE,
    ACTIONS(847), 1,
      sym_quoted_string_text,
    ACTIONS(849), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(175), 3,
      sym_quoted_string_content,
      sym_template,
      aux_sym_quoted_string_repeat1,
    STATE(229), 3,
      sym_invalid_quoted_string_escaped_char,
      sym_quoted_string_escaped_char,
      aux_sym_quoted_string_content_repeat1,
  [7209] = 8,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(851), 1,
      anon_sym_SEMI,
    ACTIONS(853), 1,
      anon_sym_BSLASH,
    ACTIONS(855), 1,
      sym_filename_text,
    ACTIONS(857), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(535), 1,
      sym_filename,
    STATE(241), 2,
      sym_filename_escaped_char,
      aux_sym_filename_content_repeat1,
    STATE(198), 3,
      sym_filename_content,
      sym_template,
      aux_sym_filename_repeat1,
  [7237] = 8,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(859), 1,
      anon_sym_BSLASH,
    ACTIONS(861), 1,
      anon_sym_DQUOTE,
    ACTIONS(863), 1,
      aux_sym_json_string_text_token1,
    ACTIONS(865), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(265), 1,
      aux_sym_json_string_text_repeat1,
    STATE(183), 2,
      sym_json_string_content,
      aux_sym_json_string_repeat1,
    STATE(323), 3,
      sym_json_string_text,
      sym_json_string_escaped_char,
      sym_template,
  [7265] = 7,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(867), 1,
      anon_sym_BSLASH,
    ACTIONS(869), 1,
      aux_sym_value_string_text_token1,
    ACTIONS(871), 1,
      anon_sym_BQUOTE,
    ACTIONS(873), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(176), 3,
      sym_oneline_string_content,
      sym_template,
      aux_sym_oneline_string_repeat1,
    STATE(213), 3,
      sym_oneline_string_text,
      sym_oneline_string_escaped_char,
      aux_sym_oneline_string_content_repeat1,
  [7291] = 8,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(859), 1,
      anon_sym_BSLASH,
    ACTIONS(863), 1,
      aux_sym_json_string_text_token1,
    ACTIONS(865), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(875), 1,
      anon_sym_DQUOTE,
    STATE(265), 1,
      aux_sym_json_string_text_repeat1,
    STATE(177), 2,
      sym_json_string_content,
      aux_sym_json_string_repeat1,
    STATE(323), 3,
      sym_json_string_text,
      sym_json_string_escaped_char,
      sym_template,
  [7319] = 7,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(843), 1,
      anon_sym_BSLASH,
    ACTIONS(847), 1,
      sym_quoted_string_text,
    ACTIONS(849), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(877), 1,
      anon_sym_DQUOTE,
    STATE(168), 3,
      sym_quoted_string_content,
      sym_template,
      aux_sym_quoted_string_repeat1,
    STATE(229), 3,
      sym_invalid_quoted_string_escaped_char,
      sym_quoted_string_escaped_char,
      aux_sym_quoted_string_content_repeat1,
  [7345] = 7,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(867), 1,
      anon_sym_BSLASH,
    ACTIONS(869), 1,
      aux_sym_value_string_text_token1,
    ACTIONS(873), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(879), 1,
      anon_sym_BQUOTE,
    STATE(182), 3,
      sym_oneline_string_content,
      sym_template,
      aux_sym_oneline_string_repeat1,
    STATE(213), 3,
      sym_oneline_string_text,
      sym_oneline_string_escaped_char,
      aux_sym_oneline_string_content_repeat1,
  [7371] = 8,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(859), 1,
      anon_sym_BSLASH,
    ACTIONS(863), 1,
      aux_sym_json_string_text_token1,
    ACTIONS(865), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(881), 1,
      anon_sym_DQUOTE,
    STATE(265), 1,
      aux_sym_json_string_text_repeat1,
    STATE(183), 2,
      sym_json_string_content,
      aux_sym_json_string_repeat1,
    STATE(323), 3,
      sym_json_string_text,
      sym_json_string_escaped_char,
      sym_template,
  [7399] = 7,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(843), 1,
      anon_sym_BSLASH,
    ACTIONS(847), 1,
      sym_quoted_string_text,
    ACTIONS(849), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(883), 1,
      anon_sym_DQUOTE,
    STATE(168), 3,
      sym_quoted_string_content,
      sym_template,
      aux_sym_quoted_string_repeat1,
    STATE(229), 3,
      sym_invalid_quoted_string_escaped_char,
      sym_quoted_string_escaped_char,
      aux_sym_quoted_string_content_repeat1,
  [7425] = 7,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(843), 1,
      anon_sym_BSLASH,
    ACTIONS(847), 1,
      sym_quoted_string_text,
    ACTIONS(849), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(885), 1,
      anon_sym_DQUOTE,
    STATE(178), 3,
      sym_quoted_string_content,
      sym_template,
      aux_sym_quoted_string_repeat1,
    STATE(229), 3,
      sym_invalid_quoted_string_escaped_char,
      sym_quoted_string_escaped_char,
      aux_sym_quoted_string_content_repeat1,
  [7451] = 8,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(853), 1,
      anon_sym_BSLASH,
    ACTIONS(855), 1,
      sym_filename_text,
    ACTIONS(857), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(887), 1,
      anon_sym_SEMI,
    STATE(519), 1,
      sym_filename,
    STATE(241), 2,
      sym_filename_escaped_char,
      aux_sym_filename_content_repeat1,
    STATE(198), 3,
      sym_filename_content,
      sym_template,
      aux_sym_filename_repeat1,
  [7479] = 8,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(761), 1,
      sym_key_string_text,
    ACTIONS(839), 1,
      anon_sym_BSLASH,
    ACTIONS(841), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(414), 1,
      sym_key_value,
    STATE(498), 1,
      sym_key_string,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(192), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
  [7507] = 7,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(889), 1,
      anon_sym_BSLASH,
    ACTIONS(892), 1,
      aux_sym_value_string_text_token1,
    ACTIONS(895), 1,
      anon_sym_BQUOTE,
    ACTIONS(897), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(182), 3,
      sym_oneline_string_content,
      sym_template,
      aux_sym_oneline_string_repeat1,
    STATE(213), 3,
      sym_oneline_string_text,
      sym_oneline_string_escaped_char,
      aux_sym_oneline_string_content_repeat1,
  [7533] = 8,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(900), 1,
      anon_sym_BSLASH,
    ACTIONS(903), 1,
      anon_sym_DQUOTE,
    ACTIONS(905), 1,
      aux_sym_json_string_text_token1,
    ACTIONS(908), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(265), 1,
      aux_sym_json_string_text_repeat1,
    STATE(183), 2,
      sym_json_string_content,
      aux_sym_json_string_repeat1,
    STATE(323), 3,
      sym_json_string_text,
      sym_json_string_escaped_char,
      sym_template,
  [7561] = 8,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(859), 1,
      anon_sym_BSLASH,
    ACTIONS(863), 1,
      aux_sym_json_string_text_token1,
    ACTIONS(865), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(911), 1,
      anon_sym_DQUOTE,
    STATE(265), 1,
      aux_sym_json_string_text_repeat1,
    STATE(172), 2,
      sym_json_string_content,
      aux_sym_json_string_repeat1,
    STATE(323), 3,
      sym_json_string_text,
      sym_json_string_escaped_char,
      sym_template,
  [7589] = 6,
    ACTIONS(915), 1,
      anon_sym_BSLASH,
    ACTIONS(917), 1,
      sym_filename_text,
    ACTIONS(919), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(913), 2,
      anon_sym_LF,
      sym_comment,
    STATE(235), 2,
      sym_filename_escaped_char,
      aux_sym_filename_content_repeat1,
    STATE(196), 3,
      sym_filename_content,
      sym_template,
      aux_sym_filename_repeat1,
  [7612] = 7,
    ACTIONS(921), 1,
      anon_sym_LF,
    ACTIONS(923), 1,
      anon_sym_BSLASH,
    ACTIONS(926), 1,
      sym_key_string_text,
    ACTIONS(929), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(932), 1,
      sym_comment,
    STATE(232), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(186), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
  [7637] = 7,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(915), 1,
      anon_sym_BSLASH,
    ACTIONS(917), 1,
      sym_filename_text,
    ACTIONS(919), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(481), 1,
      sym_filename,
    STATE(235), 2,
      sym_filename_escaped_char,
      aux_sym_filename_content_repeat1,
    STATE(185), 3,
      sym_filename_content,
      sym_template,
      aux_sym_filename_repeat1,
  [7662] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(936), 1,
      anon_sym_u,
    ACTIONS(938), 1,
      aux_sym_invalid_quoted_string_escaped_char_token1,
    ACTIONS(934), 7,
      anon_sym_BSLASH,
      anon_sym_b,
      anon_sym_f,
      anon_sym_n,
      anon_sym_r,
      anon_sym_t,
      anon_sym_DQUOTE,
  [7681] = 6,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(751), 1,
      aux_sym_value_string_text_token1,
    ACTIONS(753), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(251), 1,
      aux_sym_value_string_text_repeat1,
    ACTIONS(940), 3,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_LT_SLASH,
    STATE(193), 3,
      sym_value_string_text,
      sym_template,
      aux_sym_xml_value_string_repeat1,
  [7704] = 7,
    ACTIONS(104), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(942), 1,
      anon_sym_LF,
    ACTIONS(944), 1,
      anon_sym_BSLASH,
    ACTIONS(946), 1,
      sym_key_string_text,
    ACTIONS(948), 1,
      sym_comment,
    STATE(232), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(186), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
  [7729] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(743), 1,
      aux_sym_digit_token1,
    STATE(195), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
    ACTIONS(950), 6,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
      anon_sym_DOT,
      anon_sym_e,
      anon_sym_E,
  [7748] = 7,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(761), 1,
      sym_key_string_text,
    ACTIONS(839), 1,
      anon_sym_BSLASH,
    ACTIONS(841), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(942), 1,
      anon_sym_COLON,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(194), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
  [7773] = 6,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(954), 1,
      aux_sym_value_string_text_token1,
    ACTIONS(957), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(251), 1,
      aux_sym_value_string_text_repeat1,
    ACTIONS(952), 3,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_LT_SLASH,
    STATE(193), 3,
      sym_value_string_text,
      sym_template,
      aux_sym_xml_value_string_repeat1,
  [7796] = 7,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(921), 1,
      anon_sym_COLON,
    ACTIONS(960), 1,
      anon_sym_BSLASH,
    ACTIONS(963), 1,
      sym_key_string_text,
    ACTIONS(966), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(234), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    STATE(194), 3,
      sym_key_string_content,
      sym_template,
      aux_sym_key_string_repeat1,
  [7821] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(971), 1,
      aux_sym_digit_token1,
    STATE(195), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
    ACTIONS(969), 6,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
      anon_sym_DOT,
      anon_sym_e,
      anon_sym_E,
  [7840] = 6,
    ACTIONS(976), 1,
      anon_sym_BSLASH,
    ACTIONS(979), 1,
      sym_filename_text,
    ACTIONS(982), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(974), 2,
      anon_sym_LF,
      sym_comment,
    STATE(235), 2,
      sym_filename_escaped_char,
      aux_sym_filename_content_repeat1,
    STATE(196), 3,
      sym_filename_content,
      sym_template,
      aux_sym_filename_repeat1,
  [7863] = 7,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(974), 1,
      anon_sym_SEMI,
    ACTIONS(985), 1,
      anon_sym_BSLASH,
    ACTIONS(988), 1,
      sym_filename_text,
    ACTIONS(991), 1,
      anon_sym_LBRACE_LBRACE,
    STATE(241), 2,
      sym_filename_escaped_char,
      aux_sym_filename_content_repeat1,
    STATE(197), 3,
      sym_filename_content,
      sym_template,
      aux_sym_filename_repeat1,
  [7888] = 7,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(853), 1,
      anon_sym_BSLASH,
    ACTIONS(855), 1,
      sym_filename_text,
    ACTIONS(857), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(913), 1,
      anon_sym_SEMI,
    STATE(241), 2,
      sym_filename_escaped_char,
      aux_sym_filename_content_repeat1,
    STATE(197), 3,
      sym_filename_content,
      sym_template,
      aux_sym_filename_repeat1,
  [7913] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(996), 1,
      anon_sym_u,
    ACTIONS(994), 7,
      anon_sym_BSLASH,
      anon_sym_b,
      anon_sym_f,
      anon_sym_n,
      anon_sym_r,
      anon_sym_t,
      anon_sym_DQUOTE,
  [7929] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1000), 1,
      anon_sym_u,
    ACTIONS(998), 7,
      anon_sym_BSLASH,
      anon_sym_b,
      anon_sym_f,
      anon_sym_n,
      anon_sym_r,
      anon_sym_t,
      anon_sym_BQUOTE,
  [7945] = 5,
    ACTIONS(1004), 1,
      anon_sym_BSLASH,
    ACTIONS(1007), 1,
      aux_sym_value_string_text_token1,
    STATE(267), 1,
      aux_sym_value_string_text_repeat1,
    ACTIONS(1002), 3,
      anon_sym_LF,
      anon_sym_LBRACE_LBRACE,
      sym_comment,
    STATE(201), 3,
      sym_value_string_text,
      sym_value_string_escaped_char,
      aux_sym_value_string_content_repeat1,
  [7965] = 3,
    ACTIONS(3), 1,
      sym_comment,
    STATE(204), 3,
      sym__multiline_string_text,
      sym_multiline_string_escaped_char,
      aux_sym_multiline_string_content_repeat1,
    ACTIONS(1010), 5,
      anon_sym_LF,
      anon_sym_BSLASH,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      aux_sym__multiline_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [7981] = 4,
    ACTIONS(3), 1,
      sym_comment,
    STATE(208), 1,
      aux_sym__multiline_string_text_repeat1,
    ACTIONS(1014), 2,
      anon_sym_LBRACE,
      anon_sym_BQUOTE,
    ACTIONS(1012), 5,
      anon_sym_LF,
      anon_sym_BSLASH,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      aux_sym__multiline_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [7999] = 6,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1016), 1,
      anon_sym_LF,
    ACTIONS(1019), 1,
      anon_sym_BSLASH,
    ACTIONS(1024), 1,
      aux_sym__multiline_string_text_token1,
    ACTIONS(1022), 2,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      anon_sym_LBRACE_LBRACE,
    STATE(204), 3,
      sym__multiline_string_text,
      sym_multiline_string_escaped_char,
      aux_sym_multiline_string_content_repeat1,
  [8021] = 5,
    ACTIONS(647), 1,
      anon_sym_BSLASH,
    ACTIONS(649), 1,
      aux_sym_value_string_text_token1,
    STATE(267), 1,
      aux_sym_value_string_text_repeat1,
    ACTIONS(1027), 3,
      anon_sym_LF,
      anon_sym_LBRACE_LBRACE,
      sym_comment,
    STATE(201), 3,
      sym_value_string_text,
      sym_value_string_escaped_char,
      aux_sym_value_string_content_repeat1,
  [8041] = 4,
    ACTIONS(3), 1,
      sym_comment,
    STATE(206), 1,
      aux_sym__multiline_string_text_repeat1,
    ACTIONS(1031), 2,
      anon_sym_LBRACE,
      anon_sym_BQUOTE,
    ACTIONS(1029), 5,
      anon_sym_LF,
      anon_sym_BSLASH,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      aux_sym__multiline_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [8059] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(743), 1,
      aux_sym_digit_token1,
    STATE(195), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
    ACTIONS(1034), 5,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
      anon_sym_e,
      anon_sym_E,
  [8077] = 4,
    ACTIONS(3), 1,
      sym_comment,
    STATE(206), 1,
      aux_sym__multiline_string_text_repeat1,
    ACTIONS(1038), 2,
      anon_sym_LBRACE,
      anon_sym_BQUOTE,
    ACTIONS(1036), 5,
      anon_sym_LF,
      anon_sym_BSLASH,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      aux_sym__multiline_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [8095] = 6,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1042), 1,
      anon_sym_DOT,
    STATE(242), 1,
      sym_json_fraction,
    STATE(352), 1,
      sym_json_exponent,
    ACTIONS(1044), 2,
      anon_sym_e,
      anon_sym_E,
    ACTIONS(1040), 3,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [8117] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1048), 1,
      anon_sym_u,
    ACTIONS(1050), 1,
      anon_sym_POUND,
    ACTIONS(1046), 6,
      anon_sym_BSLASH,
      anon_sym_b,
      anon_sym_f,
      anon_sym_n,
      anon_sym_r,
      anon_sym_t,
  [8135] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1052), 1,
      anon_sym_LF,
    STATE(490), 1,
      sym_multiline_string_type,
    ACTIONS(1054), 6,
      anon_sym_base64,
      anon_sym_hex,
      anon_sym_json,
      anon_sym_xml,
      anon_sym_graphql,
      aux_sym_multiline_string_type_token1,
  [8153] = 4,
    ACTIONS(106), 1,
      aux_sym_digit_token1,
    ACTIONS(950), 1,
      anon_sym_LF,
    STATE(227), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
    ACTIONS(1056), 4,
      anon_sym_DOT,
      anon_sym_e,
      anon_sym_E,
      sym_comment,
  [8170] = 3,
    ACTIONS(3), 1,
      sym_comment,
    STATE(219), 3,
      sym_oneline_string_text,
      sym_oneline_string_escaped_char,
      aux_sym_oneline_string_content_repeat1,
    ACTIONS(1058), 4,
      anon_sym_BSLASH,
      aux_sym_value_string_text_token1,
      anon_sym_BQUOTE,
      anon_sym_LBRACE_LBRACE,
  [8185] = 8,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(735), 1,
      anon_sym_DQUOTE,
    ACTIONS(1060), 1,
      anon_sym_RBRACE,
    ACTIONS(1062), 1,
      anon_sym_COMMA,
    STATE(350), 1,
      aux_sym_json_object_repeat1,
    STATE(353), 1,
      sym_json_key_value,
    STATE(508), 1,
      sym_json_string,
    STATE(509), 1,
      sym_json_key_string,
  [8210] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1064), 1,
      anon_sym_BSLASH,
    ACTIONS(1069), 1,
      sym_quoted_string_text,
    ACTIONS(1067), 2,
      anon_sym_DQUOTE,
      anon_sym_LBRACE_LBRACE,
    STATE(215), 3,
      sym_invalid_quoted_string_escaped_char,
      sym_quoted_string_escaped_char,
      aux_sym_quoted_string_content_repeat1,
  [8229] = 6,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(104), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(1072), 1,
      sym_filename_password_text,
    ACTIONS(1074), 1,
      anon_sym_BSLASH,
    STATE(260), 2,
      sym_filename_password_escaped_char,
      aux_sym_filename_password_repeat1,
    STATE(480), 2,
      sym_filename_password,
      sym_template,
  [8250] = 6,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    ACTIONS(675), 1,
      aux_sym_digit_token1,
    STATE(411), 1,
      sym_integer,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    STATE(590), 2,
      sym_quoted_string,
      sym_float,
  [8271] = 6,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    ACTIONS(675), 1,
      aux_sym_digit_token1,
    STATE(399), 1,
      sym_integer,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    STATE(596), 2,
      sym_quoted_string,
      sym_float,
  [8292] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1076), 1,
      anon_sym_BSLASH,
    ACTIONS(1079), 1,
      aux_sym_value_string_text_token1,
    ACTIONS(1082), 2,
      anon_sym_BQUOTE,
      anon_sym_LBRACE_LBRACE,
    STATE(219), 3,
      sym_oneline_string_text,
      sym_oneline_string_escaped_char,
      aux_sym_oneline_string_content_repeat1,
  [8311] = 8,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(735), 1,
      anon_sym_DQUOTE,
    ACTIONS(1062), 1,
      anon_sym_COMMA,
    ACTIONS(1084), 1,
      anon_sym_RBRACE,
    STATE(381), 1,
      sym_json_key_value,
    STATE(388), 1,
      aux_sym_json_object_repeat1,
    STATE(508), 1,
      sym_json_string,
    STATE(509), 1,
      sym_json_key_string,
  [8336] = 6,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    ACTIONS(675), 1,
      aux_sym_digit_token1,
    STATE(409), 1,
      sym_integer,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    STATE(591), 2,
      sym_quoted_string,
      sym_float,
  [8357] = 6,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    ACTIONS(675), 1,
      aux_sym_digit_token1,
    STATE(401), 1,
      sym_integer,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    STATE(595), 2,
      sym_quoted_string,
      sym_float,
  [8378] = 6,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    ACTIONS(675), 1,
      aux_sym_digit_token1,
    STATE(403), 1,
      sym_integer,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    STATE(594), 2,
      sym_quoted_string,
      sym_float,
  [8399] = 6,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    ACTIONS(675), 1,
      aux_sym_digit_token1,
    STATE(413), 1,
      sym_integer,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    STATE(589), 2,
      sym_quoted_string,
      sym_float,
  [8420] = 6,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    ACTIONS(675), 1,
      aux_sym_digit_token1,
    STATE(405), 1,
      sym_integer,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    STATE(593), 2,
      sym_quoted_string,
      sym_float,
  [8441] = 6,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    ACTIONS(675), 1,
      aux_sym_digit_token1,
    STATE(407), 1,
      sym_integer,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    STATE(592), 2,
      sym_quoted_string,
      sym_float,
  [8462] = 4,
    ACTIONS(969), 1,
      anon_sym_LF,
    ACTIONS(1086), 1,
      aux_sym_digit_token1,
    STATE(227), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
    ACTIONS(1089), 4,
      anon_sym_DOT,
      anon_sym_e,
      anon_sym_E,
      sym_comment,
  [8479] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1091), 7,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
      aux_sym_digit_token1,
      anon_sym_DOT,
      anon_sym_e,
      anon_sym_E,
  [8492] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(843), 1,
      anon_sym_BSLASH,
    ACTIONS(1095), 1,
      sym_quoted_string_text,
    ACTIONS(1093), 2,
      anon_sym_DQUOTE,
      anon_sym_LBRACE_LBRACE,
    STATE(215), 3,
      sym_invalid_quoted_string_escaped_char,
      sym_quoted_string_escaped_char,
      aux_sym_quoted_string_content_repeat1,
  [8511] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(743), 1,
      aux_sym_digit_token1,
    STATE(195), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
    ACTIONS(1097), 3,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [8527] = 6,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1099), 1,
      anon_sym_BSLASH,
    ACTIONS(1101), 1,
      anon_sym_SLASH,
    ACTIONS(1103), 1,
      sym_regex_text,
    STATE(521), 1,
      sym_regex_content,
    STATE(266), 2,
      sym_regex_escaped_char,
      aux_sym_regex_content_repeat1,
  [8547] = 3,
    ACTIONS(1105), 2,
      anon_sym_LF,
      sym_key_string_text,
    STATE(243), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    ACTIONS(1107), 3,
      anon_sym_BSLASH,
      anon_sym_LBRACE_LBRACE,
      sym_comment,
  [8561] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1111), 1,
      aux_sym_value_string_text_token1,
    STATE(233), 1,
      aux_sym_value_string_text_repeat1,
    ACTIONS(1109), 4,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_LT_SLASH,
      anon_sym_LBRACE_LBRACE,
  [8577] = 3,
    ACTIONS(200), 1,
      sym_comment,
    STATE(252), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
    ACTIONS(1105), 4,
      anon_sym_COLON,
      anon_sym_BSLASH,
      sym_key_string_text,
      anon_sym_LBRACE_LBRACE,
  [8591] = 2,
    STATE(244), 2,
      sym_filename_escaped_char,
      aux_sym_filename_content_repeat1,
    ACTIONS(1114), 5,
      anon_sym_LF,
      anon_sym_BSLASH,
      sym_filename_text,
      anon_sym_LBRACE_LBRACE,
      sym_comment,
  [8603] = 6,
    ACTIONS(84), 1,
      anon_sym_LT,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1116), 1,
      anon_sym_LT_QMARK,
    STATE(151), 1,
      sym_xml_open_tag,
    STATE(516), 1,
      sym_xml_tag,
    STATE(283), 2,
      sym_xml_prolog_tag,
      aux_sym_xml_repeat1,
  [8623] = 6,
    ACTIONS(1040), 1,
      anon_sym_LF,
    ACTIONS(1118), 1,
      anon_sym_DOT,
    ACTIONS(1122), 1,
      sym_comment,
    STATE(287), 1,
      sym_json_fraction,
    STATE(515), 1,
      sym_json_exponent,
    ACTIONS(1120), 2,
      anon_sym_e,
      anon_sym_E,
  [8643] = 5,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(663), 1,
      anon_sym_base64_COMMA,
    ACTIONS(665), 1,
      anon_sym_hex_COMMA,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    STATE(581), 3,
      sym_oneline_base64,
      sym_oneline_hex,
      sym_quoted_string,
  [8661] = 5,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(663), 1,
      anon_sym_base64_COMMA,
    ACTIONS(665), 1,
      anon_sym_hex_COMMA,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    STATE(588), 3,
      sym_oneline_base64,
      sym_oneline_hex,
      sym_quoted_string,
  [8679] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1126), 1,
      anon_sym_BSLASH,
    ACTIONS(1129), 1,
      sym_filename_text,
    ACTIONS(1124), 2,
      anon_sym_SEMI,
      anon_sym_LBRACE_LBRACE,
    STATE(240), 2,
      sym_filename_escaped_char,
      aux_sym_filename_content_repeat1,
  [8697] = 3,
    ACTIONS(3), 1,
      sym_comment,
    STATE(240), 2,
      sym_filename_escaped_char,
      aux_sym_filename_content_repeat1,
    ACTIONS(1114), 4,
      anon_sym_SEMI,
      anon_sym_BSLASH,
      sym_filename_text,
      anon_sym_LBRACE_LBRACE,
  [8711] = 4,
    ACTIONS(200), 1,
      sym_comment,
    STATE(362), 1,
      sym_json_exponent,
    ACTIONS(1044), 2,
      anon_sym_e,
      anon_sym_E,
    ACTIONS(1132), 3,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [8727] = 5,
    ACTIONS(1134), 1,
      anon_sym_LF,
    ACTIONS(1136), 1,
      anon_sym_BSLASH,
    ACTIONS(1139), 1,
      sym_key_string_text,
    ACTIONS(1142), 2,
      anon_sym_LBRACE_LBRACE,
      sym_comment,
    STATE(243), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
  [8745] = 4,
    ACTIONS(1144), 1,
      anon_sym_BSLASH,
    ACTIONS(1147), 1,
      sym_filename_text,
    STATE(244), 2,
      sym_filename_escaped_char,
      aux_sym_filename_content_repeat1,
    ACTIONS(1124), 3,
      anon_sym_LF,
      anon_sym_LBRACE_LBRACE,
      sym_comment,
  [8761] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1152), 1,
      anon_sym_u,
    ACTIONS(1154), 1,
      anon_sym_POUND,
    ACTIONS(1150), 4,
      anon_sym_BSLASH,
      anon_sym_b,
      anon_sym_f,
      anon_sym_BQUOTE,
  [8777] = 4,
    ACTIONS(106), 1,
      aux_sym_digit_token1,
    ACTIONS(1034), 1,
      anon_sym_LF,
    STATE(227), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
    ACTIONS(1156), 3,
      anon_sym_e,
      anon_sym_E,
      sym_comment,
  [8793] = 6,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1099), 1,
      anon_sym_BSLASH,
    ACTIONS(1103), 1,
      sym_regex_text,
    ACTIONS(1158), 1,
      anon_sym_SLASH,
    STATE(550), 1,
      sym_regex_content,
    STATE(266), 2,
      sym_regex_escaped_char,
      aux_sym_regex_content_repeat1,
  [8813] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(743), 1,
      aux_sym_digit_token1,
    STATE(195), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
    ACTIONS(1160), 3,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [8829] = 5,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(673), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(675), 1,
      aux_sym_digit_token1,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
    STATE(476), 2,
      sym_template,
      sym_integer,
  [8847] = 6,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(673), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(675), 1,
      aux_sym_digit_token1,
    STATE(271), 1,
      sym_integer,
    STATE(475), 1,
      sym_template,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
  [8867] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1164), 1,
      aux_sym_value_string_text_token1,
    STATE(233), 1,
      aux_sym_value_string_text_repeat1,
    ACTIONS(1162), 4,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_LT_SLASH,
      anon_sym_LBRACE_LBRACE,
  [8883] = 5,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1166), 1,
      anon_sym_BSLASH,
    ACTIONS(1169), 1,
      sym_key_string_text,
    ACTIONS(1134), 2,
      anon_sym_COLON,
      anon_sym_LBRACE_LBRACE,
    STATE(252), 2,
      sym_key_string_escaped_char,
      aux_sym_key_string_content_repeat1,
  [8901] = 5,
    ACTIONS(126), 1,
      sym_key_string_text,
    ACTIONS(1172), 1,
      anon_sym_LF,
    ACTIONS(1174), 1,
      sym_comment,
    STATE(276), 1,
      aux_sym__comment_or_new_line_repeat1,
    ACTIONS(130), 2,
      anon_sym_BSLASH,
      anon_sym_LBRACE_LBRACE,
  [8918] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1176), 5,
      anon_sym_LF,
      anon_sym_BSLASH,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      aux_sym__multiline_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [8929] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1180), 1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
    ACTIONS(1178), 4,
      anon_sym_LF,
      anon_sym_BSLASH,
      aux_sym__multiline_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [8942] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1182), 5,
      anon_sym_LF,
      anon_sym_BSLASH,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      aux_sym__multiline_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [8953] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1184), 5,
      anon_sym_LF,
      anon_sym_BSLASH,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      aux_sym__multiline_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [8964] = 2,
    ACTIONS(1091), 1,
      anon_sym_LF,
    ACTIONS(1186), 5,
      aux_sym_digit_token1,
      anon_sym_DOT,
      anon_sym_e,
      anon_sym_E,
      sym_comment,
  [8975] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1188), 5,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_LT_SLASH,
      aux_sym_value_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [8986] = 4,
    ACTIONS(1074), 1,
      anon_sym_BSLASH,
    ACTIONS(1192), 1,
      sym_filename_password_text,
    ACTIONS(1190), 2,
      anon_sym_LF,
      sym_comment,
    STATE(277), 2,
      sym_filename_password_escaped_char,
      aux_sym_filename_password_repeat1,
  [9001] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1194), 5,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_LT_SLASH,
      aux_sym_value_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [9012] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1196), 5,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_LT_SLASH,
      aux_sym_value_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [9023] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1184), 5,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_LT_SLASH,
      aux_sym_value_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [9034] = 4,
    ACTIONS(1198), 1,
      anon_sym_LF,
    ACTIONS(1202), 1,
      sym_key_string_text,
    ACTIONS(1204), 1,
      sym_comment,
    ACTIONS(1200), 3,
      anon_sym_COLON,
      anon_sym_BSLASH,
      anon_sym_LBRACE_LBRACE,
  [9049] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1208), 1,
      aux_sym_json_string_text_token1,
    STATE(272), 1,
      aux_sym_json_string_text_repeat1,
    ACTIONS(1206), 3,
      anon_sym_BSLASH,
      anon_sym_DQUOTE,
      anon_sym_LBRACE_LBRACE,
  [9064] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1099), 1,
      anon_sym_BSLASH,
    ACTIONS(1210), 1,
      anon_sym_SLASH,
    ACTIONS(1212), 1,
      sym_regex_text,
    STATE(269), 2,
      sym_regex_escaped_char,
      aux_sym_regex_content_repeat1,
  [9081] = 3,
    ACTIONS(1214), 1,
      aux_sym_value_string_text_token1,
    STATE(268), 1,
      aux_sym_value_string_text_repeat1,
    ACTIONS(1162), 4,
      anon_sym_LF,
      anon_sym_BSLASH,
      anon_sym_LBRACE_LBRACE,
      sym_comment,
  [9094] = 3,
    ACTIONS(1216), 1,
      aux_sym_value_string_text_token1,
    STATE(268), 1,
      aux_sym_value_string_text_repeat1,
    ACTIONS(1109), 4,
      anon_sym_LF,
      anon_sym_BSLASH,
      anon_sym_LBRACE_LBRACE,
      sym_comment,
  [9107] = 5,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1219), 1,
      anon_sym_BSLASH,
    ACTIONS(1222), 1,
      anon_sym_SLASH,
    ACTIONS(1224), 1,
      sym_regex_text,
    STATE(269), 2,
      sym_regex_escaped_char,
      aux_sym_regex_content_repeat1,
  [9124] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(743), 1,
      aux_sym_digit_token1,
    ACTIONS(1227), 2,
      anon_sym_PLUS,
      anon_sym_DASH,
    STATE(248), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
  [9139] = 4,
    ACTIONS(1229), 1,
      anon_sym_LF,
    ACTIONS(1233), 1,
      sym_comment,
    STATE(545), 1,
      sym_duration_unit,
    ACTIONS(1231), 3,
      anon_sym_ms,
      anon_sym_s,
      anon_sym_m,
  [9154] = 4,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1237), 1,
      aux_sym_json_string_text_token1,
    STATE(272), 1,
      aux_sym_json_string_text_repeat1,
    ACTIONS(1235), 3,
      anon_sym_BSLASH,
      anon_sym_DQUOTE,
      anon_sym_LBRACE_LBRACE,
  [9169] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1240), 5,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_LT_SLASH,
      aux_sym_value_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [9180] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1242), 5,
      anon_sym_LT,
      anon_sym_LT_QMARK,
      anon_sym_LT_SLASH,
      aux_sym_value_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [9191] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1244), 5,
      anon_sym_LF,
      anon_sym_BSLASH,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
      aux_sym__multiline_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [9202] = 5,
    ACTIONS(116), 1,
      sym_key_string_text,
    ACTIONS(1246), 1,
      anon_sym_LF,
    ACTIONS(1249), 1,
      sym_comment,
    STATE(276), 1,
      aux_sym__comment_or_new_line_repeat1,
    ACTIONS(121), 2,
      anon_sym_BSLASH,
      anon_sym_LBRACE_LBRACE,
  [9219] = 4,
    ACTIONS(1254), 1,
      sym_filename_password_text,
    ACTIONS(1257), 1,
      anon_sym_BSLASH,
    ACTIONS(1252), 2,
      anon_sym_LF,
      sym_comment,
    STATE(277), 2,
      sym_filename_password_escaped_char,
      aux_sym_filename_password_repeat1,
  [9234] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(820), 1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
    ACTIONS(1178), 4,
      anon_sym_LF,
      anon_sym_BSLASH,
      aux_sym__multiline_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [9247] = 2,
    ACTIONS(1260), 2,
      anon_sym_LF,
      sym_key_string_text,
    ACTIONS(1184), 4,
      anon_sym_COLON,
      anon_sym_BSLASH,
      anon_sym_LBRACE_LBRACE,
      sym_comment,
  [9258] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(673), 1,
      anon_sym_LBRACE_LBRACE,
    ACTIONS(671), 2,
      anon_sym_true,
      anon_sym_false,
    STATE(477), 2,
      sym_template,
      sym_boolean,
  [9273] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(787), 1,
      anon_sym_BQUOTE_BQUOTE_BQUOTE,
    ACTIONS(1178), 4,
      anon_sym_LF,
      anon_sym_BSLASH,
      aux_sym__multiline_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [9286] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1262), 1,
      aux_sym_digit_token1,
    ACTIONS(1264), 2,
      anon_sym_PLUS,
      anon_sym_DASH,
    STATE(318), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
  [9301] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1266), 1,
      anon_sym_LT,
    ACTIONS(1268), 1,
      anon_sym_LT_QMARK,
    STATE(283), 2,
      sym_xml_prolog_tag,
      aux_sym_xml_repeat1,
  [9315] = 5,
    ACTIONS(1271), 1,
      anon_sym_LF,
    ACTIONS(1274), 1,
      sym_comment,
    STATE(169), 1,
      sym__comment_or_new_line,
    STATE(253), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(284), 1,
      aux_sym_query_string_params_section_repeat1,
  [9331] = 5,
    ACTIONS(757), 1,
      sym_comment,
    ACTIONS(759), 1,
      anon_sym_LF,
    STATE(30), 1,
      sym__comment_or_new_line,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(284), 1,
      aux_sym_query_string_params_section_repeat1,
  [9347] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1277), 1,
      anon_sym_DQUOTE,
    ACTIONS(1279), 1,
      anon_sym_SLASH,
    STATE(457), 2,
      sym_quoted_string,
      sym_regex,
  [9361] = 4,
    ACTIONS(1132), 1,
      anon_sym_LF,
    ACTIONS(1281), 1,
      sym_comment,
    STATE(528), 1,
      sym_json_exponent,
    ACTIONS(1120), 2,
      anon_sym_e,
      anon_sym_E,
  [9375] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1176), 4,
      anon_sym_BSLASH,
      anon_sym_DQUOTE,
      sym_quoted_string_text,
      anon_sym_LBRACE_LBRACE,
  [9385] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1184), 4,
      anon_sym_BSLASH,
      anon_sym_DQUOTE,
      aux_sym_json_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [9395] = 1,
    ACTIONS(1283), 5,
      anon_sym_LF,
      anon_sym_BSLASH,
      aux_sym_value_string_text_token1,
      anon_sym_LBRACE_LBRACE,
      sym_comment,
  [9403] = 1,
    ACTIONS(1285), 5,
      anon_sym_LF,
      anon_sym_BSLASH,
      aux_sym_value_string_text_token1,
      anon_sym_LBRACE_LBRACE,
      sym_comment,
  [9411] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1287), 4,
      anon_sym_BSLASH,
      aux_sym_value_string_text_token1,
      anon_sym_BQUOTE,
      anon_sym_LBRACE_LBRACE,
  [9421] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1184), 4,
      anon_sym_SEMI,
      anon_sym_BSLASH,
      sym_filename_text,
      anon_sym_LBRACE_LBRACE,
  [9431] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1176), 4,
      anon_sym_BSLASH,
      aux_sym_value_string_text_token1,
      anon_sym_BQUOTE,
      anon_sym_LBRACE_LBRACE,
  [9441] = 1,
    ACTIONS(1184), 5,
      anon_sym_LF,
      anon_sym_BSLASH,
      sym_filename_text,
      anon_sym_LBRACE_LBRACE,
      sym_comment,
  [9449] = 2,
    ACTIONS(1289), 2,
      anon_sym_LF,
      sym_key_string_text,
    ACTIONS(1291), 3,
      anon_sym_BSLASH,
      anon_sym_LBRACE_LBRACE,
      sym_comment,
  [9459] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1293), 4,
      anon_sym_BSLASH,
      anon_sym_DQUOTE,
      sym_quoted_string_text,
      anon_sym_LBRACE_LBRACE,
  [9469] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1295), 4,
      anon_sym_COLON,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [9479] = 4,
    ACTIONS(106), 1,
      aux_sym_digit_token1,
    ACTIONS(1097), 1,
      anon_sym_LF,
    ACTIONS(1297), 1,
      sym_comment,
    STATE(227), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
  [9493] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(675), 1,
      aux_sym_digit_token1,
    STATE(133), 1,
      sym_integer,
    STATE(98), 2,
      sym_digit,
      aux_sym_integer_repeat1,
  [9507] = 1,
    ACTIONS(1299), 5,
      anon_sym_LF,
      anon_sym_BSLASH,
      aux_sym_value_string_text_token1,
      anon_sym_LBRACE_LBRACE,
      sym_comment,
  [9515] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    ACTIONS(1301), 1,
      anon_sym_SLASH,
    STATE(578), 2,
      sym_quoted_string,
      sym_regex,
  [9529] = 5,
    ACTIONS(757), 1,
      sym_comment,
    ACTIONS(759), 1,
      anon_sym_LF,
    STATE(28), 1,
      sym__comment_or_new_line,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(284), 1,
      aux_sym_query_string_params_section_repeat1,
  [9545] = 5,
    ACTIONS(757), 1,
      sym_comment,
    ACTIONS(759), 1,
      anon_sym_LF,
    STATE(36), 1,
      sym__comment_or_new_line,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(284), 1,
      aux_sym_query_string_params_section_repeat1,
  [9561] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    ACTIONS(1301), 1,
      anon_sym_SLASH,
    STATE(134), 2,
      sym_quoted_string,
      sym_regex,
  [9575] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1303), 4,
      anon_sym_BSLASH,
      anon_sym_DQUOTE,
      aux_sym_json_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [9585] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1277), 1,
      anon_sym_DQUOTE,
    ACTIONS(1279), 1,
      anon_sym_SLASH,
    STATE(70), 2,
      sym_quoted_string,
      sym_regex,
  [9599] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1305), 4,
      anon_sym_SEMI,
      anon_sym_BSLASH,
      sym_filename_text,
      anon_sym_LBRACE_LBRACE,
  [9609] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1277), 1,
      anon_sym_DQUOTE,
    ACTIONS(1279), 1,
      anon_sym_SLASH,
    STATE(448), 2,
      sym_quoted_string,
      sym_regex,
  [9623] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1307), 1,
      anon_sym_SEMI,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(327), 2,
      sym_hexdigit,
      aux_sym_oneline_hex_repeat1,
  [9637] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1311), 4,
      anon_sym_BSLASH,
      aux_sym_value_string_text_token1,
      anon_sym_BQUOTE,
      anon_sym_LBRACE_LBRACE,
  [9647] = 4,
    ACTIONS(634), 1,
      aux_sym_digit_token1,
    ACTIONS(1313), 1,
      anon_sym_LF,
    ACTIONS(1315), 1,
      sym_comment,
    STATE(100), 2,
      sym_digit,
      aux_sym_integer_repeat1,
  [9661] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1317), 4,
      anon_sym_BSLASH,
      anon_sym_DQUOTE,
      sym_quoted_string_text,
      anon_sym_LBRACE_LBRACE,
  [9671] = 4,
    ACTIONS(757), 1,
      sym_comment,
    ACTIONS(759), 1,
      anon_sym_LF,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(5), 2,
      sym__comment_or_new_line,
      aux_sym_hurl_file_repeat2,
  [9685] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1319), 4,
      anon_sym_BSLASH,
      anon_sym_DQUOTE,
      sym_quoted_string_text,
      anon_sym_LBRACE_LBRACE,
  [9695] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1321), 4,
      anon_sym_BSLASH,
      aux_sym_value_string_text_token1,
      anon_sym_BQUOTE,
      anon_sym_LBRACE_LBRACE,
  [9705] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1289), 4,
      anon_sym_COLON,
      anon_sym_BSLASH,
      sym_key_string_text,
      anon_sym_LBRACE_LBRACE,
  [9715] = 4,
    ACTIONS(106), 1,
      aux_sym_digit_token1,
    ACTIONS(1160), 1,
      anon_sym_LF,
    ACTIONS(1323), 1,
      sym_comment,
    STATE(227), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
  [9729] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(397), 1,
      aux_sym_digit_token1,
    STATE(64), 1,
      sym_integer,
    STATE(44), 2,
      sym_digit,
      aux_sym_integer_repeat1,
  [9743] = 5,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(735), 1,
      anon_sym_DQUOTE,
    STATE(434), 1,
      sym_json_key_value,
    STATE(508), 1,
      sym_json_string,
    STATE(509), 1,
      sym_json_key_string,
  [9759] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1184), 4,
      anon_sym_BSLASH,
      aux_sym_value_string_text_token1,
      anon_sym_BQUOTE,
      anon_sym_LBRACE_LBRACE,
  [9769] = 1,
    ACTIONS(1176), 5,
      anon_sym_LF,
      anon_sym_BSLASH,
      aux_sym_value_string_text_token1,
      anon_sym_LBRACE_LBRACE,
      sym_comment,
  [9777] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1325), 4,
      anon_sym_BSLASH,
      anon_sym_DQUOTE,
      aux_sym_json_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [9787] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1327), 4,
      anon_sym_BSLASH,
      anon_sym_DQUOTE,
      aux_sym_json_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [9797] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1329), 4,
      anon_sym_BSLASH,
      anon_sym_DQUOTE,
      aux_sym_json_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [9807] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1331), 1,
      anon_sym_SEMI,
    ACTIONS(1333), 1,
      aux_sym_hexdigit_token1,
    STATE(326), 2,
      sym_hexdigit,
      aux_sym_oneline_hex_repeat1,
  [9821] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    ACTIONS(1336), 1,
      anon_sym_SEMI,
    STATE(326), 2,
      sym_hexdigit,
      aux_sym_oneline_hex_repeat1,
  [9835] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1277), 1,
      anon_sym_DQUOTE,
    ACTIONS(1279), 1,
      anon_sym_SLASH,
    STATE(58), 2,
      sym_quoted_string,
      sym_regex,
  [9849] = 5,
    ACTIONS(757), 1,
      sym_comment,
    ACTIONS(759), 1,
      anon_sym_LF,
    STATE(32), 1,
      sym__comment_or_new_line,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(336), 1,
      aux_sym_query_string_params_section_repeat1,
  [9865] = 5,
    ACTIONS(757), 1,
      sym_comment,
    ACTIONS(759), 1,
      anon_sym_LF,
    STATE(28), 1,
      sym__comment_or_new_line,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(285), 1,
      aux_sym_query_string_params_section_repeat1,
  [9881] = 5,
    ACTIONS(757), 1,
      sym_comment,
    ACTIONS(759), 1,
      anon_sym_LF,
    STATE(32), 1,
      sym__comment_or_new_line,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(284), 1,
      aux_sym_query_string_params_section_repeat1,
  [9897] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1338), 4,
      anon_sym_COLON,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [9907] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1260), 4,
      anon_sym_COLON,
      anon_sym_BSLASH,
      sym_key_string_text,
      anon_sym_LBRACE_LBRACE,
  [9917] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    ACTIONS(1301), 1,
      anon_sym_SLASH,
    STATE(137), 2,
      sym_quoted_string,
      sym_regex,
  [9931] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1184), 4,
      anon_sym_BSLASH,
      anon_sym_DQUOTE,
      sym_quoted_string_text,
      anon_sym_LBRACE_LBRACE,
  [9941] = 5,
    ACTIONS(757), 1,
      sym_comment,
    ACTIONS(759), 1,
      anon_sym_LF,
    STATE(35), 1,
      sym__comment_or_new_line,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(284), 1,
      aux_sym_query_string_params_section_repeat1,
  [9957] = 1,
    ACTIONS(1305), 5,
      anon_sym_LF,
      anon_sym_BSLASH,
      sym_filename_text,
      anon_sym_LBRACE_LBRACE,
      sym_comment,
  [9965] = 2,
    ACTIONS(1340), 2,
      anon_sym_LF,
      sym_comment,
    ACTIONS(1342), 3,
      anon_sym_BSLASH,
      aux_sym_value_string_text_token1,
      anon_sym_LBRACE_LBRACE,
  [9975] = 5,
    ACTIONS(757), 1,
      sym_comment,
    ACTIONS(759), 1,
      anon_sym_LF,
    STATE(31), 1,
      sym__comment_or_new_line,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(304), 1,
      aux_sym_query_string_params_section_repeat1,
  [9991] = 5,
    ACTIONS(757), 1,
      sym_comment,
    ACTIONS(759), 1,
      anon_sym_LF,
    STATE(31), 1,
      sym__comment_or_new_line,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(284), 1,
      aux_sym_query_string_params_section_repeat1,
  [10007] = 1,
    ACTIONS(1184), 5,
      anon_sym_LF,
      anon_sym_BSLASH,
      aux_sym_value_string_text_token1,
      anon_sym_LBRACE_LBRACE,
      sym_comment,
  [10015] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1344), 1,
      anon_sym_COMMA,
    ACTIONS(1347), 1,
      anon_sym_RBRACK,
    STATE(342), 1,
      aux_sym_json_array_repeat1,
  [10028] = 4,
    ACTIONS(757), 1,
      sym_comment,
    ACTIONS(759), 1,
      anon_sym_LF,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(43), 1,
      sym__comment_or_new_line,
  [10041] = 4,
    ACTIONS(7), 1,
      anon_sym_LF,
    ACTIONS(11), 1,
      sym_comment,
    STATE(46), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(50), 1,
      sym__comment_or_new_line,
  [10054] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1349), 1,
      anon_sym_COMMA,
    ACTIONS(1351), 1,
      anon_sym_RBRACK,
    STATE(342), 1,
      aux_sym_json_array_repeat1,
  [10067] = 4,
    ACTIONS(1353), 1,
      anon_sym_LF,
    ACTIONS(1355), 1,
      sym_comment,
    STATE(10), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(95), 1,
      sym__comment_or_new_line,
  [10080] = 4,
    ACTIONS(1357), 1,
      anon_sym_LF,
    ACTIONS(1359), 1,
      anon_sym_DOT,
    ACTIONS(1361), 1,
      sym_comment,
    STATE(502), 1,
      sym_fraction,
  [10093] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1363), 3,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [10102] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1365), 3,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [10111] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1062), 1,
      anon_sym_COMMA,
    ACTIONS(1367), 1,
      anon_sym_RBRACE,
    STATE(359), 1,
      aux_sym_json_object_repeat1,
  [10124] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1369), 3,
      anon_sym_SEMI,
      anon_sym_RBRACE,
      aux_sym_hexdigit_token1,
  [10133] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1132), 3,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [10142] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1062), 1,
      anon_sym_COMMA,
    ACTIONS(1367), 1,
      anon_sym_RBRACE,
    STATE(361), 1,
      aux_sym_json_object_repeat1,
  [10155] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(743), 1,
      aux_sym_digit_token1,
    STATE(230), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
  [10166] = 4,
    ACTIONS(575), 1,
      anon_sym_LF,
    ACTIONS(589), 1,
      sym_comment,
    STATE(79), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(82), 1,
      sym__comment_or_new_line,
  [10179] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1262), 1,
      aux_sym_digit_token1,
    STATE(299), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
  [10190] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1371), 3,
      anon_sym_BSLASH,
      anon_sym_SLASH,
      sym_regex_text,
  [10199] = 3,
    ACTIONS(200), 1,
      sym_comment,
    STATE(387), 1,
      sym_status,
    ACTIONS(1373), 2,
      aux_sym_status_token1,
      anon_sym_STAR,
  [10210] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1375), 1,
      anon_sym_RBRACE,
    ACTIONS(1377), 1,
      anon_sym_COMMA,
    STATE(359), 1,
      aux_sym_json_object_repeat1,
  [10223] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1380), 1,
      aux_sym_variable_name_token1,
    STATE(93), 1,
      sym_variable_name,
    STATE(526), 1,
      sym_expr,
  [10236] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1062), 1,
      anon_sym_COMMA,
    ACTIONS(1382), 1,
      anon_sym_RBRACE,
    STATE(359), 1,
      aux_sym_json_object_repeat1,
  [10249] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1384), 3,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [10258] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1380), 1,
      aux_sym_variable_name_token1,
    STATE(93), 1,
      sym_variable_name,
    STATE(558), 1,
      sym_expr,
  [10271] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1349), 1,
      anon_sym_COMMA,
    ACTIONS(1386), 1,
      anon_sym_RBRACK,
    STATE(342), 1,
      aux_sym_json_array_repeat1,
  [10284] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1380), 1,
      aux_sym_variable_name_token1,
    STATE(93), 1,
      sym_variable_name,
    STATE(560), 1,
      sym_expr,
  [10297] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1388), 3,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [10306] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1380), 1,
      aux_sym_variable_name_token1,
    STATE(93), 1,
      sym_variable_name,
    STATE(562), 1,
      sym_expr,
  [10319] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1349), 1,
      anon_sym_COMMA,
    ACTIONS(1390), 1,
      anon_sym_RBRACK,
    STATE(364), 1,
      aux_sym_json_array_repeat1,
  [10332] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1392), 3,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [10341] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(743), 1,
      aux_sym_digit_token1,
    STATE(207), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
  [10352] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1380), 1,
      aux_sym_variable_name_token1,
    STATE(93), 1,
      sym_variable_name,
    STATE(569), 1,
      sym_expr,
  [10365] = 4,
    ACTIONS(1353), 1,
      anon_sym_LF,
    ACTIONS(1355), 1,
      sym_comment,
    STATE(4), 1,
      sym__comment_or_new_line,
    STATE(10), 1,
      aux_sym__comment_or_new_line_repeat1,
  [10378] = 4,
    ACTIONS(7), 1,
      anon_sym_LF,
    ACTIONS(11), 1,
      sym_comment,
    STATE(46), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(49), 1,
      sym__comment_or_new_line,
  [10391] = 4,
    ACTIONS(1394), 1,
      anon_sym_LF,
    ACTIONS(1396), 1,
      sym_comment,
    STATE(156), 1,
      sym__comment_or_new_line,
    STATE(253), 1,
      aux_sym__comment_or_new_line_repeat1,
  [10404] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1400), 1,
      anon_sym_POUND,
    ACTIONS(1398), 2,
      anon_sym_SEMI,
      aux_sym_filename_escaped_char_token1,
  [10415] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1404), 1,
      anon_sym_POUND,
    ACTIONS(1402), 2,
      anon_sym_SEMI,
      aux_sym_filename_escaped_char_token1,
  [10426] = 4,
    ACTIONS(757), 1,
      sym_comment,
    ACTIONS(759), 1,
      anon_sym_LF,
    STATE(22), 1,
      sym__comment_or_new_line,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
  [10439] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1406), 3,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [10448] = 4,
    ACTIONS(1394), 1,
      anon_sym_LF,
    ACTIONS(1396), 1,
      sym_comment,
    STATE(157), 1,
      sym__comment_or_new_line,
    STATE(253), 1,
      aux_sym__comment_or_new_line_repeat1,
  [10461] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(675), 1,
      aux_sym_digit_token1,
    STATE(312), 2,
      sym_digit,
      aux_sym_integer_repeat1,
  [10472] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1062), 1,
      anon_sym_COMMA,
    ACTIONS(1408), 1,
      anon_sym_RBRACE,
    STATE(395), 1,
      aux_sym_json_object_repeat1,
  [10485] = 1,
    ACTIONS(1410), 4,
      anon_sym_LF,
      sym_filename_password_text,
      anon_sym_BSLASH,
      sym_comment,
  [10492] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1380), 1,
      aux_sym_variable_name_token1,
    STATE(93), 1,
      sym_variable_name,
    STATE(564), 1,
      sym_expr,
  [10505] = 4,
    ACTIONS(1394), 1,
      anon_sym_LF,
    ACTIONS(1396), 1,
      sym_comment,
    STATE(155), 1,
      sym__comment_or_new_line,
    STATE(253), 1,
      aux_sym__comment_or_new_line_repeat1,
  [10518] = 4,
    ACTIONS(1394), 1,
      anon_sym_LF,
    ACTIONS(1396), 1,
      sym_comment,
    STATE(181), 1,
      sym__comment_or_new_line,
    STATE(253), 1,
      aux_sym__comment_or_new_line_repeat1,
  [10531] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1262), 1,
      aux_sym_digit_token1,
    STATE(246), 2,
      sym_json_digit,
      aux_sym_json_integer_repeat1,
  [10542] = 4,
    ACTIONS(575), 1,
      anon_sym_LF,
    ACTIONS(589), 1,
      sym_comment,
    STATE(15), 1,
      sym__comment_or_new_line,
    STATE(79), 1,
      aux_sym__comment_or_new_line_repeat1,
  [10555] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1062), 1,
      anon_sym_COMMA,
    ACTIONS(1408), 1,
      anon_sym_RBRACE,
    STATE(359), 1,
      aux_sym_json_object_repeat1,
  [10568] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1380), 1,
      aux_sym_variable_name_token1,
    STATE(93), 1,
      sym_variable_name,
    STATE(565), 1,
      sym_expr,
  [10581] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1349), 1,
      anon_sym_COMMA,
    ACTIONS(1412), 1,
      anon_sym_RBRACK,
    STATE(345), 1,
      aux_sym_json_array_repeat1,
  [10594] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1380), 1,
      aux_sym_variable_name_token1,
    STATE(93), 1,
      sym_variable_name,
    STATE(505), 1,
      sym_expr,
  [10607] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1380), 1,
      aux_sym_variable_name_token1,
    STATE(93), 1,
      sym_variable_name,
    STATE(566), 1,
      sym_expr,
  [10620] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1380), 1,
      aux_sym_variable_name_token1,
    STATE(478), 1,
      sym_variable_name,
    STATE(479), 1,
      sym_variable_definition,
  [10633] = 4,
    ACTIONS(1359), 1,
      anon_sym_DOT,
    ACTIONS(1414), 1,
      anon_sym_LF,
    ACTIONS(1416), 1,
      sym_comment,
    STATE(502), 1,
      sym_fraction,
  [10646] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1062), 1,
      anon_sym_COMMA,
    ACTIONS(1418), 1,
      anon_sym_RBRACE,
    STATE(359), 1,
      aux_sym_json_object_repeat1,
  [10659] = 4,
    ACTIONS(575), 1,
      anon_sym_LF,
    ACTIONS(589), 1,
      sym_comment,
    STATE(66), 1,
      sym__comment_or_new_line,
    STATE(79), 1,
      aux_sym__comment_or_new_line_repeat1,
  [10672] = 4,
    ACTIONS(7), 1,
      anon_sym_LF,
    ACTIONS(11), 1,
      sym_comment,
    STATE(25), 1,
      sym__comment_or_new_line,
    STATE(46), 1,
      aux_sym__comment_or_new_line_repeat1,
  [10685] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1380), 1,
      aux_sym_variable_name_token1,
    STATE(93), 1,
      sym_variable_name,
    STATE(567), 1,
      sym_expr,
  [10698] = 4,
    ACTIONS(1359), 1,
      anon_sym_DOT,
    ACTIONS(1420), 1,
      anon_sym_LF,
    ACTIONS(1422), 1,
      sym_comment,
    STATE(502), 1,
      sym_fraction,
  [10711] = 1,
    ACTIONS(1424), 4,
      anon_sym_LF,
      sym_filename_password_text,
      anon_sym_BSLASH,
      sym_comment,
  [10718] = 4,
    ACTIONS(1359), 1,
      anon_sym_DOT,
    ACTIONS(1426), 1,
      anon_sym_LF,
    ACTIONS(1428), 1,
      sym_comment,
    STATE(502), 1,
      sym_fraction,
  [10731] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1198), 3,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [10740] = 4,
    ACTIONS(1359), 1,
      anon_sym_DOT,
    ACTIONS(1430), 1,
      anon_sym_LF,
    ACTIONS(1432), 1,
      sym_comment,
    STATE(502), 1,
      sym_fraction,
  [10753] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1434), 3,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [10762] = 4,
    ACTIONS(1359), 1,
      anon_sym_DOT,
    ACTIONS(1436), 1,
      anon_sym_LF,
    ACTIONS(1438), 1,
      sym_comment,
    STATE(502), 1,
      sym_fraction,
  [10775] = 4,
    ACTIONS(1359), 1,
      anon_sym_DOT,
    ACTIONS(1440), 1,
      anon_sym_LF,
    ACTIONS(1442), 1,
      sym_comment,
    STATE(502), 1,
      sym_fraction,
  [10788] = 4,
    ACTIONS(1359), 1,
      anon_sym_DOT,
    ACTIONS(1444), 1,
      anon_sym_LF,
    ACTIONS(1446), 1,
      sym_comment,
    STATE(502), 1,
      sym_fraction,
  [10801] = 1,
    ACTIONS(1176), 4,
      anon_sym_LF,
      sym_filename_password_text,
      anon_sym_BSLASH,
      sym_comment,
  [10808] = 4,
    ACTIONS(1359), 1,
      anon_sym_DOT,
    ACTIONS(1448), 1,
      anon_sym_LF,
    ACTIONS(1450), 1,
      sym_comment,
    STATE(502), 1,
      sym_fraction,
  [10821] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1260), 3,
      anon_sym_RBRACE,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [10830] = 4,
    ACTIONS(1359), 1,
      anon_sym_DOT,
    ACTIONS(1452), 1,
      anon_sym_LF,
    ACTIONS(1454), 1,
      sym_comment,
    STATE(502), 1,
      sym_fraction,
  [10843] = 4,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1380), 1,
      aux_sym_variable_name_token1,
    STATE(93), 1,
      sym_variable_name,
    STATE(568), 1,
      sym_expr,
  [10856] = 4,
    ACTIONS(1359), 1,
      anon_sym_DOT,
    ACTIONS(1456), 1,
      anon_sym_LF,
    ACTIONS(1458), 1,
      sym_comment,
    STATE(502), 1,
      sym_fraction,
  [10869] = 4,
    ACTIONS(1353), 1,
      anon_sym_LF,
    ACTIONS(1355), 1,
      sym_comment,
    STATE(10), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(48), 1,
      sym__comment_or_new_line,
  [10882] = 4,
    ACTIONS(7), 1,
      anon_sym_LF,
    ACTIONS(11), 1,
      sym_comment,
    STATE(46), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(117), 1,
      sym__comment_or_new_line,
  [10895] = 4,
    ACTIONS(757), 1,
      sym_comment,
    ACTIONS(759), 1,
      anon_sym_LF,
    STATE(41), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(42), 1,
      sym__comment_or_new_line,
  [10908] = 4,
    ACTIONS(1353), 1,
      anon_sym_LF,
    ACTIONS(1355), 1,
      sym_comment,
    STATE(10), 1,
      aux_sym__comment_or_new_line_repeat1,
    STATE(11), 1,
      sym__comment_or_new_line,
  [10921] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1460), 1,
      anon_sym_POUND,
    ACTIONS(1462), 1,
      anon_sym_DQUOTE,
  [10931] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    STATE(139), 1,
      sym_quoted_string,
  [10941] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(424), 1,
      sym_hexdigit,
  [10951] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(425), 1,
      sym_hexdigit,
  [10961] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(426), 1,
      sym_hexdigit,
  [10971] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(427), 1,
      sym_hexdigit,
  [10981] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(428), 1,
      sym_hexdigit,
  [10991] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(429), 1,
      sym_hexdigit,
  [11001] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(430), 1,
      sym_hexdigit,
  [11011] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(431), 1,
      sym_hexdigit,
  [11021] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(432), 1,
      sym_hexdigit,
  [11031] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(433), 1,
      sym_hexdigit,
  [11041] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(435), 1,
      sym_hexdigit,
  [11051] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(436), 1,
      sym_hexdigit,
  [11061] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(563), 1,
      sym_hexdigit,
  [11071] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(561), 1,
      sym_hexdigit,
  [11081] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1375), 2,
      anon_sym_RBRACE,
      anon_sym_COMMA,
  [11089] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(559), 1,
      sym_hexdigit,
  [11099] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(557), 1,
      sym_hexdigit,
  [11109] = 3,
    ACTIONS(1464), 1,
      anon_sym_LF,
    ACTIONS(1466), 1,
      aux_sym_file_value_token1,
    ACTIONS(1468), 1,
      sym_comment,
  [11119] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1188), 1,
      anon_sym_LT,
    ACTIONS(1470), 1,
      anon_sym_LT_QMARK,
  [11129] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    STATE(138), 1,
      sym_quoted_string,
  [11139] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1277), 1,
      anon_sym_DQUOTE,
    STATE(59), 1,
      sym_quoted_string,
  [11149] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    STATE(140), 1,
      sym_quoted_string,
  [11159] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(458), 1,
      sym_hexdigit,
  [11169] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    STATE(141), 1,
      sym_quoted_string,
  [11179] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    STATE(132), 1,
      sym_quoted_string,
  [11189] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1472), 2,
      aux_sym_status_token1,
      anon_sym_STAR,
  [11197] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1474), 1,
      aux_sym_hexdigit_token1,
    STATE(461), 1,
      sym_json_hexdigit,
  [11207] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1476), 1,
      aux_sym_hexdigit_token1,
    STATE(324), 1,
      sym_json_hexdigit,
  [11217] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    STATE(147), 1,
      sym_quoted_string,
  [11227] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1478), 1,
      anon_sym_LBRACE,
    STATE(292), 1,
      sym_unicode_char,
  [11237] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1277), 1,
      anon_sym_DQUOTE,
    STATE(62), 1,
      sym_quoted_string,
  [11247] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1480), 1,
      anon_sym_LBRACE,
    STATE(400), 1,
      sym_unicode_char,
  [11257] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    STATE(142), 1,
      sym_quoted_string,
  [11267] = 3,
    ACTIONS(1482), 1,
      anon_sym_LF,
    ACTIONS(1484), 1,
      aux_sym_file_value_token1,
    ACTIONS(1486), 1,
      sym_comment,
  [11277] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    STATE(135), 1,
      sym_quoted_string,
  [11287] = 3,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1488), 1,
      anon_sym_POUND,
    ACTIONS(1490), 1,
      anon_sym_DQUOTE,
  [11297] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(470), 1,
      sym_hexdigit,
  [11307] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1277), 1,
      anon_sym_DQUOTE,
    STATE(60), 1,
      sym_quoted_string,
  [11317] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(456), 1,
      sym_hexdigit,
  [11327] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(667), 1,
      anon_sym_DQUOTE,
    STATE(579), 1,
      sym_quoted_string,
  [11337] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1492), 2,
      anon_sym_RBRACE,
      anon_sym_COMMA,
  [11345] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1474), 1,
      aux_sym_hexdigit_token1,
    STATE(472), 1,
      sym_json_hexdigit,
  [11355] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1494), 1,
      anon_sym_LBRACE,
    STATE(256), 1,
      sym_unicode_char,
  [11365] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1347), 2,
      anon_sym_COMMA,
      anon_sym_RBRACK,
  [11373] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1496), 1,
      anon_sym_LBRACE,
    STATE(301), 1,
      sym_unicode_char,
  [11383] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1277), 1,
      anon_sym_DQUOTE,
    STATE(68), 1,
      sym_quoted_string,
  [11393] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1277), 1,
      anon_sym_DQUOTE,
    STATE(67), 1,
      sym_quoted_string,
  [11403] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1277), 1,
      anon_sym_DQUOTE,
    STATE(73), 1,
      sym_quoted_string,
  [11413] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1277), 1,
      anon_sym_DQUOTE,
    STATE(65), 1,
      sym_quoted_string,
  [11423] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1277), 1,
      anon_sym_DQUOTE,
    STATE(71), 1,
      sym_quoted_string,
  [11433] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1309), 1,
      aux_sym_hexdigit_token1,
    STATE(532), 1,
      sym_hexdigit,
  [11443] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1498), 1,
      anon_sym_LBRACE,
    STATE(297), 1,
      sym_unicode_char,
  [11453] = 3,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1474), 1,
      aux_sym_hexdigit_token1,
    STATE(447), 1,
      sym_json_hexdigit,
  [11463] = 2,
    ACTIONS(1434), 1,
      anon_sym_LF,
    ACTIONS(1500), 1,
      sym_comment,
  [11470] = 2,
    ACTIONS(1340), 1,
      sym_comment,
    ACTIONS(1502), 1,
      anon_sym_LF,
  [11477] = 2,
    ACTIONS(1229), 1,
      anon_sym_LF,
    ACTIONS(1233), 1,
      sym_comment,
  [11484] = 2,
    ACTIONS(1504), 1,
      anon_sym_LF,
    ACTIONS(1506), 1,
      sym_comment,
  [11491] = 2,
    ACTIONS(1508), 1,
      anon_sym_LF,
    ACTIONS(1510), 1,
      sym_comment,
  [11498] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1512), 1,
      anon_sym_EQ,
  [11505] = 2,
    ACTIONS(1514), 1,
      anon_sym_LF,
    ACTIONS(1516), 1,
      sym_comment,
  [11512] = 2,
    ACTIONS(1518), 1,
      anon_sym_LF,
    ACTIONS(1520), 1,
      sym_comment,
  [11519] = 2,
    ACTIONS(1522), 1,
      anon_sym_LF,
    ACTIONS(1524), 1,
      sym_comment,
  [11526] = 2,
    ACTIONS(1526), 1,
      anon_sym_LF,
    ACTIONS(1528), 1,
      sym_comment,
  [11533] = 2,
    ACTIONS(1295), 1,
      anon_sym_LF,
    ACTIONS(1530), 1,
      sym_comment,
  [11540] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1532), 1,
      anon_sym_COLON,
  [11547] = 2,
    ACTIONS(1534), 1,
      anon_sym_LF,
    ACTIONS(1536), 1,
      sym_comment,
  [11554] = 2,
    ACTIONS(1538), 1,
      anon_sym_LF,
    ACTIONS(1540), 1,
      sym_comment,
  [11561] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1542), 1,
      aux_sym_oneline_base64_token1,
  [11568] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1544), 1,
      aux_sym_xml_prolog_tag_token1,
  [11575] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1546), 1,
      anon_sym_LF,
  [11582] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1548), 1,
      anon_sym_LF,
  [11589] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1550), 1,
      anon_sym_SEMI,
  [11596] = 2,
    ACTIONS(1552), 1,
      anon_sym_LF,
    ACTIONS(1554), 1,
      sym_comment,
  [11603] = 2,
    ACTIONS(1556), 1,
      anon_sym_LF,
    ACTIONS(1558), 1,
      sym_comment,
  [11610] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1560), 1,
      aux_sym_xml_open_tag_token1,
  [11617] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1562), 1,
      aux_sym_oneline_string_text_token1,
  [11624] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1564), 1,
      anon_sym_COLON,
  [11631] = 2,
    ACTIONS(1198), 1,
      anon_sym_LF,
    ACTIONS(1204), 1,
      sym_comment,
  [11638] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1566), 1,
      anon_sym_COLON,
  [11645] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1568), 1,
      anon_sym_QMARK_GT,
  [11652] = 2,
    ACTIONS(1242), 1,
      sym_comment,
    ACTIONS(1570), 1,
      anon_sym_LF,
  [11659] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1572), 1,
      anon_sym_COLON,
  [11666] = 2,
    ACTIONS(1574), 1,
      anon_sym_LF,
    ACTIONS(1576), 1,
      sym_comment,
  [11673] = 2,
    ACTIONS(1240), 1,
      sym_comment,
    ACTIONS(1578), 1,
      anon_sym_LF,
  [11680] = 2,
    ACTIONS(1392), 1,
      anon_sym_LF,
    ACTIONS(1580), 1,
      sym_comment,
  [11687] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1582), 1,
      anon_sym_RBRACE_RBRACE,
  [11694] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1584), 1,
      aux_sym_variable_name_token2,
  [11701] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1586), 1,
      anon_sym_GT,
  [11708] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1588), 1,
      anon_sym_COLON,
  [11715] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1590), 1,
      anon_sym_COLON,
  [11722] = 2,
    ACTIONS(1592), 1,
      anon_sym_LF,
    ACTIONS(1594), 1,
      sym_comment,
  [11729] = 2,
    ACTIONS(1596), 1,
      anon_sym_LF,
    ACTIONS(1598), 1,
      sym_comment,
  [11736] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1600), 1,
      aux_sym_hexdigit_token1,
  [11743] = 2,
    ACTIONS(1602), 1,
      anon_sym_LF,
    ACTIONS(1604), 1,
      sym_comment,
  [11750] = 2,
    ACTIONS(1388), 1,
      anon_sym_LF,
    ACTIONS(1606), 1,
      sym_comment,
  [11757] = 2,
    ACTIONS(1132), 1,
      anon_sym_LF,
    ACTIONS(1281), 1,
      sym_comment,
  [11764] = 2,
    ACTIONS(1608), 1,
      anon_sym_LF,
    ACTIONS(1610), 1,
      sym_comment,
  [11771] = 2,
    ACTIONS(1612), 1,
      anon_sym_LF,
    ACTIONS(1614), 1,
      sym_comment,
  [11778] = 2,
    ACTIONS(1616), 1,
      anon_sym_LF,
    ACTIONS(1618), 1,
      sym_comment,
  [11785] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1620), 1,
      anon_sym_SEMI,
  [11792] = 2,
    ACTIONS(1622), 1,
      anon_sym_LF,
    ACTIONS(1624), 1,
      sym_comment,
  [11799] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1626), 1,
      anon_sym_SLASH,
  [11806] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1628), 1,
      aux_sym_regex_escaped_char_token1,
  [11813] = 2,
    ACTIONS(1630), 1,
      anon_sym_LF,
    ACTIONS(1632), 1,
      sym_comment,
  [11820] = 2,
    ACTIONS(1634), 1,
      anon_sym_LF,
    ACTIONS(1636), 1,
      sym_comment,
  [11827] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1638), 1,
      anon_sym_COLON,
  [11834] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1640), 1,
      anon_sym_RBRACE_RBRACE,
  [11841] = 2,
    ACTIONS(1642), 1,
      anon_sym_LF,
    ACTIONS(1644), 1,
      sym_comment,
  [11848] = 2,
    ACTIONS(1384), 1,
      anon_sym_LF,
    ACTIONS(1646), 1,
      sym_comment,
  [11855] = 2,
    ACTIONS(1648), 1,
      anon_sym_LF,
    ACTIONS(1650), 1,
      sym_comment,
  [11862] = 2,
    ACTIONS(1357), 1,
      anon_sym_LF,
    ACTIONS(1361), 1,
      sym_comment,
  [11869] = 2,
    ACTIONS(1196), 1,
      sym_comment,
    ACTIONS(1652), 1,
      anon_sym_LF,
  [11876] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1654), 1,
      anon_sym_RBRACE,
  [11883] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1656), 1,
      anon_sym_GT,
  [11890] = 2,
    ACTIONS(1365), 1,
      anon_sym_LF,
    ACTIONS(1658), 1,
      sym_comment,
  [11897] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1660), 1,
      anon_sym_SEMI,
  [11904] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1662), 1,
      anon_sym_COLON,
  [11911] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1664), 1,
      anon_sym_COLON,
  [11918] = 2,
    ACTIONS(1666), 1,
      anon_sym_LF,
    ACTIONS(1668), 1,
      sym_comment,
  [11925] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1670), 1,
      anon_sym_QMARK_GT,
  [11932] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1672), 1,
      anon_sym_COLON,
  [11939] = 2,
    ACTIONS(1674), 1,
      anon_sym_LF,
    ACTIONS(1676), 1,
      sym_comment,
  [11946] = 2,
    ACTIONS(1678), 1,
      anon_sym_LF,
    ACTIONS(1680), 1,
      sym_comment,
  [11953] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1682), 1,
      anon_sym_COLON,
  [11960] = 2,
    ACTIONS(1338), 1,
      anon_sym_LF,
    ACTIONS(1684), 1,
      sym_comment,
  [11967] = 2,
    ACTIONS(1686), 1,
      anon_sym_LF,
    ACTIONS(1688), 1,
      sym_comment,
  [11974] = 2,
    ACTIONS(1690), 1,
      anon_sym_LF,
    ACTIONS(1692), 1,
      sym_comment,
  [11981] = 2,
    ACTIONS(1694), 1,
      anon_sym_LF,
    ACTIONS(1696), 1,
      sym_comment,
  [11988] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1698), 1,
      anon_sym_GT,
  [11995] = 2,
    ACTIONS(1700), 1,
      anon_sym_LF,
    ACTIONS(1702), 1,
      sym_comment,
  [12002] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1704), 1,
      anon_sym_SLASH,
  [12009] = 2,
    ACTIONS(1414), 1,
      anon_sym_LF,
    ACTIONS(1416), 1,
      sym_comment,
  [12016] = 2,
    ACTIONS(1406), 1,
      anon_sym_LF,
    ACTIONS(1706), 1,
      sym_comment,
  [12023] = 2,
    ACTIONS(1708), 1,
      anon_sym_LF,
    ACTIONS(1710), 1,
      sym_comment,
  [12030] = 2,
    ACTIONS(1712), 1,
      anon_sym_LF,
    ACTIONS(1714), 1,
      sym_comment,
  [12037] = 2,
    ACTIONS(1716), 1,
      anon_sym_LF,
    ACTIONS(1718), 1,
      sym_comment,
  [12044] = 2,
    ACTIONS(1720), 1,
      anon_sym_LF,
    ACTIONS(1722), 1,
      sym_comment,
  [12051] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1724), 1,
      anon_sym_RBRACE,
  [12058] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1726), 1,
      anon_sym_RBRACE_RBRACE,
  [12065] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1728), 1,
      anon_sym_RBRACE,
  [12072] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1730), 1,
      anon_sym_RBRACE_RBRACE,
  [12079] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1732), 1,
      anon_sym_RBRACE,
  [12086] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1734), 1,
      anon_sym_RBRACE_RBRACE,
  [12093] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1736), 1,
      anon_sym_RBRACE,
  [12100] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1738), 1,
      anon_sym_RBRACE_RBRACE,
  [12107] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1740), 1,
      anon_sym_RBRACE_RBRACE,
  [12114] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1742), 1,
      anon_sym_RBRACE_RBRACE,
  [12121] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1744), 1,
      anon_sym_RBRACE_RBRACE,
  [12128] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1746), 1,
      anon_sym_RBRACE_RBRACE,
  [12135] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1748), 1,
      anon_sym_RBRACE_RBRACE,
  [12142] = 2,
    ACTIONS(1440), 1,
      anon_sym_LF,
    ACTIONS(1442), 1,
      sym_comment,
  [12149] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1750), 1,
      aux_sym_xml_prolog_tag_token1,
  [12156] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1752), 1,
      ts_builtin_sym_end,
  [12163] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1754), 1,
      anon_sym_COLON,
  [12170] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1756), 1,
      aux_sym_xml_close_tag_token1,
  [12177] = 2,
    ACTIONS(1464), 1,
      anon_sym_LF,
    ACTIONS(1468), 1,
      sym_comment,
  [12184] = 2,
    ACTIONS(1363), 1,
      anon_sym_LF,
    ACTIONS(1758), 1,
      sym_comment,
  [12191] = 2,
    ACTIONS(1760), 1,
      anon_sym_LF,
    ACTIONS(1762), 1,
      sym_comment,
  [12198] = 2,
    ACTIONS(1764), 1,
      anon_sym_LF,
    ACTIONS(1766), 1,
      sym_comment,
  [12205] = 2,
    ACTIONS(1768), 1,
      anon_sym_LF,
    ACTIONS(1770), 1,
      sym_comment,
  [12212] = 2,
    ACTIONS(1772), 1,
      anon_sym_LF,
    ACTIONS(1774), 1,
      sym_comment,
  [12219] = 2,
    ACTIONS(1776), 1,
      anon_sym_LF,
    ACTIONS(1778), 1,
      sym_comment,
  [12226] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(1780), 1,
      aux_sym_xml_close_tag_token1,
  [12233] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1782), 1,
      anon_sym_COLON,
  [12240] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1784), 1,
      anon_sym_COLON,
  [12247] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1786), 1,
      anon_sym_COLON,
  [12254] = 2,
    ACTIONS(200), 1,
      sym_comment,
    ACTIONS(1788), 1,
      anon_sym_COLON,
  [12261] = 2,
    ACTIONS(1790), 1,
      anon_sym_LF,
    ACTIONS(1792), 1,
      sym_comment,
  [12268] = 2,
    ACTIONS(1794), 1,
      anon_sym_LF,
    ACTIONS(1796), 1,
      sym_comment,
  [12275] = 2,
    ACTIONS(1456), 1,
      anon_sym_LF,
    ACTIONS(1458), 1,
      sym_comment,
  [12282] = 2,
    ACTIONS(1452), 1,
      anon_sym_LF,
    ACTIONS(1454), 1,
      sym_comment,
  [12289] = 2,
    ACTIONS(1448), 1,
      anon_sym_LF,
    ACTIONS(1450), 1,
      sym_comment,
  [12296] = 2,
    ACTIONS(1444), 1,
      anon_sym_LF,
    ACTIONS(1446), 1,
      sym_comment,
  [12303] = 2,
    ACTIONS(1436), 1,
      anon_sym_LF,
    ACTIONS(1438), 1,
      sym_comment,
  [12310] = 2,
    ACTIONS(1430), 1,
      anon_sym_LF,
    ACTIONS(1432), 1,
      sym_comment,
  [12317] = 2,
    ACTIONS(1426), 1,
      anon_sym_LF,
    ACTIONS(1428), 1,
      sym_comment,
  [12324] = 2,
    ACTIONS(1420), 1,
      anon_sym_LF,
    ACTIONS(1422), 1,
      sym_comment,
  [12331] = 2,
    ACTIONS(1798), 1,
      anon_sym_LF,
    ACTIONS(1800), 1,
      sym_comment,
  [12338] = 2,
    ACTIONS(1802), 1,
      anon_sym_LF,
    ACTIONS(1804), 1,
      sym_comment,
  [12345] = 2,
    ACTIONS(1806), 1,
      anon_sym_LF,
    ACTIONS(1808), 1,
      sym_comment,
};

static const uint32_t ts_small_parse_table_map[] = {
  [SMALL_STATE(19)] = 0,
  [SMALL_STATE(20)] = 122,
  [SMALL_STATE(21)] = 244,
  [SMALL_STATE(22)] = 327,
  [SMALL_STATE(23)] = 410,
  [SMALL_STATE(24)] = 495,
  [SMALL_STATE(25)] = 577,
  [SMALL_STATE(26)] = 662,
  [SMALL_STATE(27)] = 747,
  [SMALL_STATE(28)] = 832,
  [SMALL_STATE(29)] = 910,
  [SMALL_STATE(30)] = 988,
  [SMALL_STATE(31)] = 1066,
  [SMALL_STATE(32)] = 1144,
  [SMALL_STATE(33)] = 1222,
  [SMALL_STATE(34)] = 1300,
  [SMALL_STATE(35)] = 1378,
  [SMALL_STATE(36)] = 1456,
  [SMALL_STATE(37)] = 1534,
  [SMALL_STATE(38)] = 1613,
  [SMALL_STATE(39)] = 1692,
  [SMALL_STATE(40)] = 1760,
  [SMALL_STATE(41)] = 1824,
  [SMALL_STATE(42)] = 1888,
  [SMALL_STATE(43)] = 1945,
  [SMALL_STATE(44)] = 2002,
  [SMALL_STATE(45)] = 2064,
  [SMALL_STATE(46)] = 2126,
  [SMALL_STATE(47)] = 2188,
  [SMALL_STATE(48)] = 2250,
  [SMALL_STATE(49)] = 2305,
  [SMALL_STATE(50)] = 2360,
  [SMALL_STATE(51)] = 2415,
  [SMALL_STATE(52)] = 2470,
  [SMALL_STATE(53)] = 2526,
  [SMALL_STATE(54)] = 2582,
  [SMALL_STATE(55)] = 2638,
  [SMALL_STATE(56)] = 2694,
  [SMALL_STATE(57)] = 2750,
  [SMALL_STATE(58)] = 2805,
  [SMALL_STATE(59)] = 2860,
  [SMALL_STATE(60)] = 2915,
  [SMALL_STATE(61)] = 2970,
  [SMALL_STATE(62)] = 3039,
  [SMALL_STATE(63)] = 3094,
  [SMALL_STATE(64)] = 3149,
  [SMALL_STATE(65)] = 3204,
  [SMALL_STATE(66)] = 3258,
  [SMALL_STATE(67)] = 3324,
  [SMALL_STATE(68)] = 3378,
  [SMALL_STATE(69)] = 3432,
  [SMALL_STATE(70)] = 3498,
  [SMALL_STATE(71)] = 3552,
  [SMALL_STATE(72)] = 3606,
  [SMALL_STATE(73)] = 3660,
  [SMALL_STATE(74)] = 3714,
  [SMALL_STATE(75)] = 3768,
  [SMALL_STATE(76)] = 3834,
  [SMALL_STATE(77)] = 3920,
  [SMALL_STATE(78)] = 3974,
  [SMALL_STATE(79)] = 4025,
  [SMALL_STATE(80)] = 4076,
  [SMALL_STATE(81)] = 4120,
  [SMALL_STATE(82)] = 4164,
  [SMALL_STATE(83)] = 4208,
  [SMALL_STATE(84)] = 4250,
  [SMALL_STATE(85)] = 4299,
  [SMALL_STATE(86)] = 4348,
  [SMALL_STATE(87)] = 4401,
  [SMALL_STATE(88)] = 4454,
  [SMALL_STATE(89)] = 4500,
  [SMALL_STATE(90)] = 4546,
  [SMALL_STATE(91)] = 4593,
  [SMALL_STATE(92)] = 4624,
  [SMALL_STATE(93)] = 4671,
  [SMALL_STATE(94)] = 4718,
  [SMALL_STATE(95)] = 4749,
  [SMALL_STATE(96)] = 4780,
  [SMALL_STATE(97)] = 4811,
  [SMALL_STATE(98)] = 4842,
  [SMALL_STATE(99)] = 4876,
  [SMALL_STATE(100)] = 4918,
  [SMALL_STATE(101)] = 4952,
  [SMALL_STATE(102)] = 4994,
  [SMALL_STATE(103)] = 5049,
  [SMALL_STATE(104)] = 5088,
  [SMALL_STATE(105)] = 5140,
  [SMALL_STATE(106)] = 5192,
  [SMALL_STATE(107)] = 5244,
  [SMALL_STATE(108)] = 5296,
  [SMALL_STATE(109)] = 5324,
  [SMALL_STATE(110)] = 5376,
  [SMALL_STATE(111)] = 5412,
  [SMALL_STATE(112)] = 5447,
  [SMALL_STATE(113)] = 5490,
  [SMALL_STATE(114)] = 5539,
  [SMALL_STATE(115)] = 5572,
  [SMALL_STATE(116)] = 5623,
  [SMALL_STATE(117)] = 5658,
  [SMALL_STATE(118)] = 5683,
  [SMALL_STATE(119)] = 5708,
  [SMALL_STATE(120)] = 5737,
  [SMALL_STATE(121)] = 5762,
  [SMALL_STATE(122)] = 5791,
  [SMALL_STATE(123)] = 5816,
  [SMALL_STATE(124)] = 5841,
  [SMALL_STATE(125)] = 5866,
  [SMALL_STATE(126)] = 5891,
  [SMALL_STATE(127)] = 5935,
  [SMALL_STATE(128)] = 5959,
  [SMALL_STATE(129)] = 6003,
  [SMALL_STATE(130)] = 6047,
  [SMALL_STATE(131)] = 6091,
  [SMALL_STATE(132)] = 6114,
  [SMALL_STATE(133)] = 6137,
  [SMALL_STATE(134)] = 6160,
  [SMALL_STATE(135)] = 6183,
  [SMALL_STATE(136)] = 6206,
  [SMALL_STATE(137)] = 6229,
  [SMALL_STATE(138)] = 6252,
  [SMALL_STATE(139)] = 6275,
  [SMALL_STATE(140)] = 6298,
  [SMALL_STATE(141)] = 6321,
  [SMALL_STATE(142)] = 6344,
  [SMALL_STATE(143)] = 6367,
  [SMALL_STATE(144)] = 6390,
  [SMALL_STATE(145)] = 6413,
  [SMALL_STATE(146)] = 6436,
  [SMALL_STATE(147)] = 6459,
  [SMALL_STATE(148)] = 6482,
  [SMALL_STATE(149)] = 6505,
  [SMALL_STATE(150)] = 6528,
  [SMALL_STATE(151)] = 6567,
  [SMALL_STATE(152)] = 6606,
  [SMALL_STATE(153)] = 6645,
  [SMALL_STATE(154)] = 6682,
  [SMALL_STATE(155)] = 6721,
  [SMALL_STATE(156)] = 6761,
  [SMALL_STATE(157)] = 6801,
  [SMALL_STATE(158)] = 6841,
  [SMALL_STATE(159)] = 6877,
  [SMALL_STATE(160)] = 6899,
  [SMALL_STATE(161)] = 6928,
  [SMALL_STATE(162)] = 6957,
  [SMALL_STATE(163)] = 6984,
  [SMALL_STATE(164)] = 7013,
  [SMALL_STATE(165)] = 7042,
  [SMALL_STATE(166)] = 7071,
  [SMALL_STATE(167)] = 7102,
  [SMALL_STATE(168)] = 7129,
  [SMALL_STATE(169)] = 7155,
  [SMALL_STATE(170)] = 7183,
  [SMALL_STATE(171)] = 7209,
  [SMALL_STATE(172)] = 7237,
  [SMALL_STATE(173)] = 7265,
  [SMALL_STATE(174)] = 7291,
  [SMALL_STATE(175)] = 7319,
  [SMALL_STATE(176)] = 7345,
  [SMALL_STATE(177)] = 7371,
  [SMALL_STATE(178)] = 7399,
  [SMALL_STATE(179)] = 7425,
  [SMALL_STATE(180)] = 7451,
  [SMALL_STATE(181)] = 7479,
  [SMALL_STATE(182)] = 7507,
  [SMALL_STATE(183)] = 7533,
  [SMALL_STATE(184)] = 7561,
  [SMALL_STATE(185)] = 7589,
  [SMALL_STATE(186)] = 7612,
  [SMALL_STATE(187)] = 7637,
  [SMALL_STATE(188)] = 7662,
  [SMALL_STATE(189)] = 7681,
  [SMALL_STATE(190)] = 7704,
  [SMALL_STATE(191)] = 7729,
  [SMALL_STATE(192)] = 7748,
  [SMALL_STATE(193)] = 7773,
  [SMALL_STATE(194)] = 7796,
  [SMALL_STATE(195)] = 7821,
  [SMALL_STATE(196)] = 7840,
  [SMALL_STATE(197)] = 7863,
  [SMALL_STATE(198)] = 7888,
  [SMALL_STATE(199)] = 7913,
  [SMALL_STATE(200)] = 7929,
  [SMALL_STATE(201)] = 7945,
  [SMALL_STATE(202)] = 7965,
  [SMALL_STATE(203)] = 7981,
  [SMALL_STATE(204)] = 7999,
  [SMALL_STATE(205)] = 8021,
  [SMALL_STATE(206)] = 8041,
  [SMALL_STATE(207)] = 8059,
  [SMALL_STATE(208)] = 8077,
  [SMALL_STATE(209)] = 8095,
  [SMALL_STATE(210)] = 8117,
  [SMALL_STATE(211)] = 8135,
  [SMALL_STATE(212)] = 8153,
  [SMALL_STATE(213)] = 8170,
  [SMALL_STATE(214)] = 8185,
  [SMALL_STATE(215)] = 8210,
  [SMALL_STATE(216)] = 8229,
  [SMALL_STATE(217)] = 8250,
  [SMALL_STATE(218)] = 8271,
  [SMALL_STATE(219)] = 8292,
  [SMALL_STATE(220)] = 8311,
  [SMALL_STATE(221)] = 8336,
  [SMALL_STATE(222)] = 8357,
  [SMALL_STATE(223)] = 8378,
  [SMALL_STATE(224)] = 8399,
  [SMALL_STATE(225)] = 8420,
  [SMALL_STATE(226)] = 8441,
  [SMALL_STATE(227)] = 8462,
  [SMALL_STATE(228)] = 8479,
  [SMALL_STATE(229)] = 8492,
  [SMALL_STATE(230)] = 8511,
  [SMALL_STATE(231)] = 8527,
  [SMALL_STATE(232)] = 8547,
  [SMALL_STATE(233)] = 8561,
  [SMALL_STATE(234)] = 8577,
  [SMALL_STATE(235)] = 8591,
  [SMALL_STATE(236)] = 8603,
  [SMALL_STATE(237)] = 8623,
  [SMALL_STATE(238)] = 8643,
  [SMALL_STATE(239)] = 8661,
  [SMALL_STATE(240)] = 8679,
  [SMALL_STATE(241)] = 8697,
  [SMALL_STATE(242)] = 8711,
  [SMALL_STATE(243)] = 8727,
  [SMALL_STATE(244)] = 8745,
  [SMALL_STATE(245)] = 8761,
  [SMALL_STATE(246)] = 8777,
  [SMALL_STATE(247)] = 8793,
  [SMALL_STATE(248)] = 8813,
  [SMALL_STATE(249)] = 8829,
  [SMALL_STATE(250)] = 8847,
  [SMALL_STATE(251)] = 8867,
  [SMALL_STATE(252)] = 8883,
  [SMALL_STATE(253)] = 8901,
  [SMALL_STATE(254)] = 8918,
  [SMALL_STATE(255)] = 8929,
  [SMALL_STATE(256)] = 8942,
  [SMALL_STATE(257)] = 8953,
  [SMALL_STATE(258)] = 8964,
  [SMALL_STATE(259)] = 8975,
  [SMALL_STATE(260)] = 8986,
  [SMALL_STATE(261)] = 9001,
  [SMALL_STATE(262)] = 9012,
  [SMALL_STATE(263)] = 9023,
  [SMALL_STATE(264)] = 9034,
  [SMALL_STATE(265)] = 9049,
  [SMALL_STATE(266)] = 9064,
  [SMALL_STATE(267)] = 9081,
  [SMALL_STATE(268)] = 9094,
  [SMALL_STATE(269)] = 9107,
  [SMALL_STATE(270)] = 9124,
  [SMALL_STATE(271)] = 9139,
  [SMALL_STATE(272)] = 9154,
  [SMALL_STATE(273)] = 9169,
  [SMALL_STATE(274)] = 9180,
  [SMALL_STATE(275)] = 9191,
  [SMALL_STATE(276)] = 9202,
  [SMALL_STATE(277)] = 9219,
  [SMALL_STATE(278)] = 9234,
  [SMALL_STATE(279)] = 9247,
  [SMALL_STATE(280)] = 9258,
  [SMALL_STATE(281)] = 9273,
  [SMALL_STATE(282)] = 9286,
  [SMALL_STATE(283)] = 9301,
  [SMALL_STATE(284)] = 9315,
  [SMALL_STATE(285)] = 9331,
  [SMALL_STATE(286)] = 9347,
  [SMALL_STATE(287)] = 9361,
  [SMALL_STATE(288)] = 9375,
  [SMALL_STATE(289)] = 9385,
  [SMALL_STATE(290)] = 9395,
  [SMALL_STATE(291)] = 9403,
  [SMALL_STATE(292)] = 9411,
  [SMALL_STATE(293)] = 9421,
  [SMALL_STATE(294)] = 9431,
  [SMALL_STATE(295)] = 9441,
  [SMALL_STATE(296)] = 9449,
  [SMALL_STATE(297)] = 9459,
  [SMALL_STATE(298)] = 9469,
  [SMALL_STATE(299)] = 9479,
  [SMALL_STATE(300)] = 9493,
  [SMALL_STATE(301)] = 9507,
  [SMALL_STATE(302)] = 9515,
  [SMALL_STATE(303)] = 9529,
  [SMALL_STATE(304)] = 9545,
  [SMALL_STATE(305)] = 9561,
  [SMALL_STATE(306)] = 9575,
  [SMALL_STATE(307)] = 9585,
  [SMALL_STATE(308)] = 9599,
  [SMALL_STATE(309)] = 9609,
  [SMALL_STATE(310)] = 9623,
  [SMALL_STATE(311)] = 9637,
  [SMALL_STATE(312)] = 9647,
  [SMALL_STATE(313)] = 9661,
  [SMALL_STATE(314)] = 9671,
  [SMALL_STATE(315)] = 9685,
  [SMALL_STATE(316)] = 9695,
  [SMALL_STATE(317)] = 9705,
  [SMALL_STATE(318)] = 9715,
  [SMALL_STATE(319)] = 9729,
  [SMALL_STATE(320)] = 9743,
  [SMALL_STATE(321)] = 9759,
  [SMALL_STATE(322)] = 9769,
  [SMALL_STATE(323)] = 9777,
  [SMALL_STATE(324)] = 9787,
  [SMALL_STATE(325)] = 9797,
  [SMALL_STATE(326)] = 9807,
  [SMALL_STATE(327)] = 9821,
  [SMALL_STATE(328)] = 9835,
  [SMALL_STATE(329)] = 9849,
  [SMALL_STATE(330)] = 9865,
  [SMALL_STATE(331)] = 9881,
  [SMALL_STATE(332)] = 9897,
  [SMALL_STATE(333)] = 9907,
  [SMALL_STATE(334)] = 9917,
  [SMALL_STATE(335)] = 9931,
  [SMALL_STATE(336)] = 9941,
  [SMALL_STATE(337)] = 9957,
  [SMALL_STATE(338)] = 9965,
  [SMALL_STATE(339)] = 9975,
  [SMALL_STATE(340)] = 9991,
  [SMALL_STATE(341)] = 10007,
  [SMALL_STATE(342)] = 10015,
  [SMALL_STATE(343)] = 10028,
  [SMALL_STATE(344)] = 10041,
  [SMALL_STATE(345)] = 10054,
  [SMALL_STATE(346)] = 10067,
  [SMALL_STATE(347)] = 10080,
  [SMALL_STATE(348)] = 10093,
  [SMALL_STATE(349)] = 10102,
  [SMALL_STATE(350)] = 10111,
  [SMALL_STATE(351)] = 10124,
  [SMALL_STATE(352)] = 10133,
  [SMALL_STATE(353)] = 10142,
  [SMALL_STATE(354)] = 10155,
  [SMALL_STATE(355)] = 10166,
  [SMALL_STATE(356)] = 10179,
  [SMALL_STATE(357)] = 10190,
  [SMALL_STATE(358)] = 10199,
  [SMALL_STATE(359)] = 10210,
  [SMALL_STATE(360)] = 10223,
  [SMALL_STATE(361)] = 10236,
  [SMALL_STATE(362)] = 10249,
  [SMALL_STATE(363)] = 10258,
  [SMALL_STATE(364)] = 10271,
  [SMALL_STATE(365)] = 10284,
  [SMALL_STATE(366)] = 10297,
  [SMALL_STATE(367)] = 10306,
  [SMALL_STATE(368)] = 10319,
  [SMALL_STATE(369)] = 10332,
  [SMALL_STATE(370)] = 10341,
  [SMALL_STATE(371)] = 10352,
  [SMALL_STATE(372)] = 10365,
  [SMALL_STATE(373)] = 10378,
  [SMALL_STATE(374)] = 10391,
  [SMALL_STATE(375)] = 10404,
  [SMALL_STATE(376)] = 10415,
  [SMALL_STATE(377)] = 10426,
  [SMALL_STATE(378)] = 10439,
  [SMALL_STATE(379)] = 10448,
  [SMALL_STATE(380)] = 10461,
  [SMALL_STATE(381)] = 10472,
  [SMALL_STATE(382)] = 10485,
  [SMALL_STATE(383)] = 10492,
  [SMALL_STATE(384)] = 10505,
  [SMALL_STATE(385)] = 10518,
  [SMALL_STATE(386)] = 10531,
  [SMALL_STATE(387)] = 10542,
  [SMALL_STATE(388)] = 10555,
  [SMALL_STATE(389)] = 10568,
  [SMALL_STATE(390)] = 10581,
  [SMALL_STATE(391)] = 10594,
  [SMALL_STATE(392)] = 10607,
  [SMALL_STATE(393)] = 10620,
  [SMALL_STATE(394)] = 10633,
  [SMALL_STATE(395)] = 10646,
  [SMALL_STATE(396)] = 10659,
  [SMALL_STATE(397)] = 10672,
  [SMALL_STATE(398)] = 10685,
  [SMALL_STATE(399)] = 10698,
  [SMALL_STATE(400)] = 10711,
  [SMALL_STATE(401)] = 10718,
  [SMALL_STATE(402)] = 10731,
  [SMALL_STATE(403)] = 10740,
  [SMALL_STATE(404)] = 10753,
  [SMALL_STATE(405)] = 10762,
  [SMALL_STATE(406)] = 10775,
  [SMALL_STATE(407)] = 10788,
  [SMALL_STATE(408)] = 10801,
  [SMALL_STATE(409)] = 10808,
  [SMALL_STATE(410)] = 10821,
  [SMALL_STATE(411)] = 10830,
  [SMALL_STATE(412)] = 10843,
  [SMALL_STATE(413)] = 10856,
  [SMALL_STATE(414)] = 10869,
  [SMALL_STATE(415)] = 10882,
  [SMALL_STATE(416)] = 10895,
  [SMALL_STATE(417)] = 10908,
  [SMALL_STATE(418)] = 10921,
  [SMALL_STATE(419)] = 10931,
  [SMALL_STATE(420)] = 10941,
  [SMALL_STATE(421)] = 10951,
  [SMALL_STATE(422)] = 10961,
  [SMALL_STATE(423)] = 10971,
  [SMALL_STATE(424)] = 10981,
  [SMALL_STATE(425)] = 10991,
  [SMALL_STATE(426)] = 11001,
  [SMALL_STATE(427)] = 11011,
  [SMALL_STATE(428)] = 11021,
  [SMALL_STATE(429)] = 11031,
  [SMALL_STATE(430)] = 11041,
  [SMALL_STATE(431)] = 11051,
  [SMALL_STATE(432)] = 11061,
  [SMALL_STATE(433)] = 11071,
  [SMALL_STATE(434)] = 11081,
  [SMALL_STATE(435)] = 11089,
  [SMALL_STATE(436)] = 11099,
  [SMALL_STATE(437)] = 11109,
  [SMALL_STATE(438)] = 11119,
  [SMALL_STATE(439)] = 11129,
  [SMALL_STATE(440)] = 11139,
  [SMALL_STATE(441)] = 11149,
  [SMALL_STATE(442)] = 11159,
  [SMALL_STATE(443)] = 11169,
  [SMALL_STATE(444)] = 11179,
  [SMALL_STATE(445)] = 11189,
  [SMALL_STATE(446)] = 11197,
  [SMALL_STATE(447)] = 11207,
  [SMALL_STATE(448)] = 11217,
  [SMALL_STATE(449)] = 11227,
  [SMALL_STATE(450)] = 11237,
  [SMALL_STATE(451)] = 11247,
  [SMALL_STATE(452)] = 11257,
  [SMALL_STATE(453)] = 11267,
  [SMALL_STATE(454)] = 11277,
  [SMALL_STATE(455)] = 11287,
  [SMALL_STATE(456)] = 11297,
  [SMALL_STATE(457)] = 11307,
  [SMALL_STATE(458)] = 11317,
  [SMALL_STATE(459)] = 11327,
  [SMALL_STATE(460)] = 11337,
  [SMALL_STATE(461)] = 11345,
  [SMALL_STATE(462)] = 11355,
  [SMALL_STATE(463)] = 11365,
  [SMALL_STATE(464)] = 11373,
  [SMALL_STATE(465)] = 11383,
  [SMALL_STATE(466)] = 11393,
  [SMALL_STATE(467)] = 11403,
  [SMALL_STATE(468)] = 11413,
  [SMALL_STATE(469)] = 11423,
  [SMALL_STATE(470)] = 11433,
  [SMALL_STATE(471)] = 11443,
  [SMALL_STATE(472)] = 11453,
  [SMALL_STATE(473)] = 11463,
  [SMALL_STATE(474)] = 11470,
  [SMALL_STATE(475)] = 11477,
  [SMALL_STATE(476)] = 11484,
  [SMALL_STATE(477)] = 11491,
  [SMALL_STATE(478)] = 11498,
  [SMALL_STATE(479)] = 11505,
  [SMALL_STATE(480)] = 11512,
  [SMALL_STATE(481)] = 11519,
  [SMALL_STATE(482)] = 11526,
  [SMALL_STATE(483)] = 11533,
  [SMALL_STATE(484)] = 11540,
  [SMALL_STATE(485)] = 11547,
  [SMALL_STATE(486)] = 11554,
  [SMALL_STATE(487)] = 11561,
  [SMALL_STATE(488)] = 11568,
  [SMALL_STATE(489)] = 11575,
  [SMALL_STATE(490)] = 11582,
  [SMALL_STATE(491)] = 11589,
  [SMALL_STATE(492)] = 11596,
  [SMALL_STATE(493)] = 11603,
  [SMALL_STATE(494)] = 11610,
  [SMALL_STATE(495)] = 11617,
  [SMALL_STATE(496)] = 11624,
  [SMALL_STATE(497)] = 11631,
  [SMALL_STATE(498)] = 11638,
  [SMALL_STATE(499)] = 11645,
  [SMALL_STATE(500)] = 11652,
  [SMALL_STATE(501)] = 11659,
  [SMALL_STATE(502)] = 11666,
  [SMALL_STATE(503)] = 11673,
  [SMALL_STATE(504)] = 11680,
  [SMALL_STATE(505)] = 11687,
  [SMALL_STATE(506)] = 11694,
  [SMALL_STATE(507)] = 11701,
  [SMALL_STATE(508)] = 11708,
  [SMALL_STATE(509)] = 11715,
  [SMALL_STATE(510)] = 11722,
  [SMALL_STATE(511)] = 11729,
  [SMALL_STATE(512)] = 11736,
  [SMALL_STATE(513)] = 11743,
  [SMALL_STATE(514)] = 11750,
  [SMALL_STATE(515)] = 11757,
  [SMALL_STATE(516)] = 11764,
  [SMALL_STATE(517)] = 11771,
  [SMALL_STATE(518)] = 11778,
  [SMALL_STATE(519)] = 11785,
  [SMALL_STATE(520)] = 11792,
  [SMALL_STATE(521)] = 11799,
  [SMALL_STATE(522)] = 11806,
  [SMALL_STATE(523)] = 11813,
  [SMALL_STATE(524)] = 11820,
  [SMALL_STATE(525)] = 11827,
  [SMALL_STATE(526)] = 11834,
  [SMALL_STATE(527)] = 11841,
  [SMALL_STATE(528)] = 11848,
  [SMALL_STATE(529)] = 11855,
  [SMALL_STATE(530)] = 11862,
  [SMALL_STATE(531)] = 11869,
  [SMALL_STATE(532)] = 11876,
  [SMALL_STATE(533)] = 11883,
  [SMALL_STATE(534)] = 11890,
  [SMALL_STATE(535)] = 11897,
  [SMALL_STATE(536)] = 11904,
  [SMALL_STATE(537)] = 11911,
  [SMALL_STATE(538)] = 11918,
  [SMALL_STATE(539)] = 11925,
  [SMALL_STATE(540)] = 11932,
  [SMALL_STATE(541)] = 11939,
  [SMALL_STATE(542)] = 11946,
  [SMALL_STATE(543)] = 11953,
  [SMALL_STATE(544)] = 11960,
  [SMALL_STATE(545)] = 11967,
  [SMALL_STATE(546)] = 11974,
  [SMALL_STATE(547)] = 11981,
  [SMALL_STATE(548)] = 11988,
  [SMALL_STATE(549)] = 11995,
  [SMALL_STATE(550)] = 12002,
  [SMALL_STATE(551)] = 12009,
  [SMALL_STATE(552)] = 12016,
  [SMALL_STATE(553)] = 12023,
  [SMALL_STATE(554)] = 12030,
  [SMALL_STATE(555)] = 12037,
  [SMALL_STATE(556)] = 12044,
  [SMALL_STATE(557)] = 12051,
  [SMALL_STATE(558)] = 12058,
  [SMALL_STATE(559)] = 12065,
  [SMALL_STATE(560)] = 12072,
  [SMALL_STATE(561)] = 12079,
  [SMALL_STATE(562)] = 12086,
  [SMALL_STATE(563)] = 12093,
  [SMALL_STATE(564)] = 12100,
  [SMALL_STATE(565)] = 12107,
  [SMALL_STATE(566)] = 12114,
  [SMALL_STATE(567)] = 12121,
  [SMALL_STATE(568)] = 12128,
  [SMALL_STATE(569)] = 12135,
  [SMALL_STATE(570)] = 12142,
  [SMALL_STATE(571)] = 12149,
  [SMALL_STATE(572)] = 12156,
  [SMALL_STATE(573)] = 12163,
  [SMALL_STATE(574)] = 12170,
  [SMALL_STATE(575)] = 12177,
  [SMALL_STATE(576)] = 12184,
  [SMALL_STATE(577)] = 12191,
  [SMALL_STATE(578)] = 12198,
  [SMALL_STATE(579)] = 12205,
  [SMALL_STATE(580)] = 12212,
  [SMALL_STATE(581)] = 12219,
  [SMALL_STATE(582)] = 12226,
  [SMALL_STATE(583)] = 12233,
  [SMALL_STATE(584)] = 12240,
  [SMALL_STATE(585)] = 12247,
  [SMALL_STATE(586)] = 12254,
  [SMALL_STATE(587)] = 12261,
  [SMALL_STATE(588)] = 12268,
  [SMALL_STATE(589)] = 12275,
  [SMALL_STATE(590)] = 12282,
  [SMALL_STATE(591)] = 12289,
  [SMALL_STATE(592)] = 12296,
  [SMALL_STATE(593)] = 12303,
  [SMALL_STATE(594)] = 12310,
  [SMALL_STATE(595)] = 12317,
  [SMALL_STATE(596)] = 12324,
  [SMALL_STATE(597)] = 12331,
  [SMALL_STATE(598)] = 12338,
  [SMALL_STATE(599)] = 12345,
};

static const TSParseActionEntry ts_parse_actions[] = {
  [0] = {.entry = {.count = 0, .reusable = false}},
  [1] = {.entry = {.count = 1, .reusable = false}}, RECOVER(),
  [3] = {.entry = {.count = 1, .reusable = false}}, SHIFT_EXTRA(),
  [5] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_hurl_file, 0, 0, 0),
  [7] = {.entry = {.count = 1, .reusable = true}}, SHIFT(46),
  [9] = {.entry = {.count = 1, .reusable = false}}, SHIFT(290),
  [11] = {.entry = {.count = 1, .reusable = false}}, SHIFT(46),
  [13] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_options_section, 3, 0, 3),
  [15] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_options_section, 3, 0, 3),
  [17] = {.entry = {.count = 1, .reusable = false}}, SHIFT(536),
  [19] = {.entry = {.count = 1, .reusable = false}}, SHIFT(537),
  [21] = {.entry = {.count = 1, .reusable = false}}, SHIFT(540),
  [23] = {.entry = {.count = 1, .reusable = false}}, SHIFT(543),
  [25] = {.entry = {.count = 1, .reusable = false}}, SHIFT(573),
  [27] = {.entry = {.count = 1, .reusable = false}}, SHIFT(496),
  [29] = {.entry = {.count = 1, .reusable = false}}, SHIFT(484),
  [31] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_options_section_repeat1, 2, 0, 0),
  [33] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_options_section_repeat1, 2, 0, 0),
  [35] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_options_section_repeat1, 2, 0, 0), SHIFT_REPEAT(536),
  [38] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_options_section_repeat1, 2, 0, 0), SHIFT_REPEAT(537),
  [41] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_options_section_repeat1, 2, 0, 0), SHIFT_REPEAT(540),
  [44] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_options_section_repeat1, 2, 0, 0), SHIFT_REPEAT(543),
  [47] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_options_section_repeat1, 2, 0, 0), SHIFT_REPEAT(573),
  [50] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_options_section_repeat1, 2, 0, 0), SHIFT_REPEAT(496),
  [53] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_options_section_repeat1, 2, 0, 0), SHIFT_REPEAT(484),
  [56] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_options_section, 2, 0, 3),
  [58] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_options_section, 2, 0, 3),
  [60] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_request, 3, 0, 0),
  [62] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_request, 3, 0, 0),
  [64] = {.entry = {.count = 1, .reusable = false}}, SHIFT(385),
  [66] = {.entry = {.count = 1, .reusable = false}}, SHIFT(384),
  [68] = {.entry = {.count = 1, .reusable = false}}, SHIFT(379),
  [70] = {.entry = {.count = 1, .reusable = false}}, SHIFT(377),
  [72] = {.entry = {.count = 1, .reusable = false}}, SHIFT(374),
  [74] = {.entry = {.count = 1, .reusable = false}}, SHIFT(372),
  [76] = {.entry = {.count = 1, .reusable = false}}, SHIFT(497),
  [78] = {.entry = {.count = 1, .reusable = false}}, SHIFT(180),
  [80] = {.entry = {.count = 1, .reusable = false}}, SHIFT(418),
  [82] = {.entry = {.count = 1, .reusable = false}}, SHIFT(214),
  [84] = {.entry = {.count = 1, .reusable = false}}, SHIFT(494),
  [86] = {.entry = {.count = 1, .reusable = false}}, SHIFT(488),
  [88] = {.entry = {.count = 1, .reusable = false}}, SHIFT(487),
  [90] = {.entry = {.count = 1, .reusable = false}}, SHIFT(310),
  [92] = {.entry = {.count = 1, .reusable = false}}, SHIFT(184),
  [94] = {.entry = {.count = 1, .reusable = false}}, SHIFT(234),
  [96] = {.entry = {.count = 1, .reusable = false}}, SHIFT(173),
  [98] = {.entry = {.count = 1, .reusable = false}}, SHIFT(211),
  [100] = {.entry = {.count = 1, .reusable = false}}, SHIFT(126),
  [102] = {.entry = {.count = 1, .reusable = false}}, SHIFT(473),
  [104] = {.entry = {.count = 1, .reusable = false}}, SHIFT(360),
  [106] = {.entry = {.count = 1, .reusable = false}}, SHIFT(258),
  [108] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_request, 2, 0, 0),
  [110] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_request, 2, 0, 0),
  [112] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_request, 4, 0, 0),
  [114] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_request, 4, 0, 0),
  [116] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym__comment_or_new_line_repeat1, 2, 0, 0),
  [118] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym__comment_or_new_line_repeat1, 2, 0, 0), SHIFT_REPEAT(9),
  [121] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym__comment_or_new_line_repeat1, 2, 0, 0),
  [123] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym__comment_or_new_line_repeat1, 2, 0, 0), SHIFT_REPEAT(9),
  [126] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym__comment_or_new_line, 1, 0, 0),
  [128] = {.entry = {.count = 1, .reusable = true}}, SHIFT(9),
  [130] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym__comment_or_new_line, 1, 0, 0),
  [132] = {.entry = {.count = 1, .reusable = false}}, SHIFT(9),
  [134] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_request, 5, 0, 0),
  [136] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_request, 5, 0, 0),
  [138] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_response, 3, 0, 0),
  [140] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_response, 3, 0, 0),
  [142] = {.entry = {.count = 1, .reusable = false}}, SHIFT(396),
  [144] = {.entry = {.count = 1, .reusable = false}}, SHIFT(397),
  [146] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_response, 4, 0, 0),
  [148] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_response, 4, 0, 0),
  [150] = {.entry = {.count = 1, .reusable = true}}, SHIFT(440),
  [152] = {.entry = {.count = 1, .reusable = true}}, SHIFT(328),
  [154] = {.entry = {.count = 1, .reusable = false}}, SHIFT(76),
  [156] = {.entry = {.count = 1, .reusable = true}}, SHIFT(511),
  [158] = {.entry = {.count = 1, .reusable = true}}, SHIFT(106),
  [160] = {.entry = {.count = 1, .reusable = true}}, SHIFT(105),
  [162] = {.entry = {.count = 1, .reusable = true}}, SHIFT(104),
  [164] = {.entry = {.count = 1, .reusable = true}}, SHIFT(107),
  [166] = {.entry = {.count = 1, .reusable = false}}, SHIFT(218),
  [168] = {.entry = {.count = 1, .reusable = false}}, SHIFT(222),
  [170] = {.entry = {.count = 1, .reusable = true}}, SHIFT(223),
  [172] = {.entry = {.count = 1, .reusable = true}}, SHIFT(225),
  [174] = {.entry = {.count = 1, .reusable = false}}, SHIFT(226),
  [176] = {.entry = {.count = 1, .reusable = false}}, SHIFT(221),
  [178] = {.entry = {.count = 1, .reusable = true}}, SHIFT(217),
  [180] = {.entry = {.count = 1, .reusable = true}}, SHIFT(224),
  [182] = {.entry = {.count = 1, .reusable = true}}, SHIFT(239),
  [184] = {.entry = {.count = 1, .reusable = true}}, SHIFT(238),
  [186] = {.entry = {.count = 1, .reusable = true}}, SHIFT(459),
  [188] = {.entry = {.count = 1, .reusable = true}}, SHIFT(302),
  [190] = {.entry = {.count = 1, .reusable = true}}, SHIFT(109),
  [192] = {.entry = {.count = 1, .reusable = true}}, SHIFT(57),
  [194] = {.entry = {.count = 1, .reusable = true}}, SHIFT(319),
  [196] = {.entry = {.count = 1, .reusable = true}}, SHIFT(286),
  [198] = {.entry = {.count = 1, .reusable = true}}, SHIFT(450),
  [200] = {.entry = {.count = 1, .reusable = true}}, SHIFT_EXTRA(),
  [202] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_response, 5, 0, 0),
  [204] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_response, 5, 0, 0),
  [206] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_multipart_form_data_section, 3, 0, 3),
  [208] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_multipart_form_data_section, 3, 0, 3),
  [210] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_multipart_form_data_section, 2, 0, 3),
  [212] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_multipart_form_data_section, 2, 0, 3),
  [214] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_multipart_form_data_section_repeat1, 2, 0, 0),
  [216] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_multipart_form_data_section_repeat1, 2, 0, 0),
  [218] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_multipart_form_data_section_repeat1, 2, 0, 0), SHIFT_REPEAT(418),
  [221] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_multipart_form_data_section_repeat1, 2, 0, 0), SHIFT_REPEAT(234),
  [224] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_multipart_form_data_section_repeat1, 2, 0, 0), SHIFT_REPEAT(392),
  [227] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_request_repeat1, 2, 0, 0),
  [229] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_request_repeat1, 2, 0, 0),
  [231] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_request_repeat1, 2, 0, 0), SHIFT_REPEAT(418),
  [234] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_request_repeat1, 2, 0, 0), SHIFT_REPEAT(234),
  [237] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_request_repeat1, 2, 0, 0), SHIFT_REPEAT(392),
  [240] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_asserts_section, 2, 0, 3),
  [242] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_asserts_section, 2, 0, 3),
  [244] = {.entry = {.count = 1, .reusable = false}}, SHIFT(465),
  [246] = {.entry = {.count = 1, .reusable = false}}, SHIFT(466),
  [248] = {.entry = {.count = 1, .reusable = false}}, SHIFT(74),
  [250] = {.entry = {.count = 1, .reusable = false}}, SHIFT(467),
  [252] = {.entry = {.count = 1, .reusable = false}}, SHIFT(468),
  [254] = {.entry = {.count = 1, .reusable = false}}, SHIFT(469),
  [256] = {.entry = {.count = 1, .reusable = false}}, SHIFT(307),
  [258] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_asserts_section_repeat1, 2, 0, 0),
  [260] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_asserts_section_repeat1, 2, 0, 0),
  [262] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_asserts_section_repeat1, 2, 0, 0), SHIFT_REPEAT(465),
  [265] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_asserts_section_repeat1, 2, 0, 0), SHIFT_REPEAT(466),
  [268] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_asserts_section_repeat1, 2, 0, 0), SHIFT_REPEAT(74),
  [271] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_asserts_section_repeat1, 2, 0, 0), SHIFT_REPEAT(467),
  [274] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_asserts_section_repeat1, 2, 0, 0), SHIFT_REPEAT(468),
  [277] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_asserts_section_repeat1, 2, 0, 0), SHIFT_REPEAT(469),
  [280] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_asserts_section_repeat1, 2, 0, 0), SHIFT_REPEAT(307),
  [283] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_asserts_section, 3, 0, 3),
  [285] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_asserts_section, 3, 0, 3),
  [287] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_cookies_section, 4, 0, 3),
  [289] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_cookies_section, 4, 0, 3),
  [291] = {.entry = {.count = 1, .reusable = false}}, SHIFT(392),
  [293] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_query_string_params_section, 3, 0, 3),
  [295] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_query_string_params_section, 3, 0, 3),
  [297] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_cookies_section, 5, 0, 3),
  [299] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_cookies_section, 5, 0, 3),
  [301] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_form_params_section, 4, 0, 3),
  [303] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_form_params_section, 4, 0, 3),
  [305] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_query_string_params_section, 4, 0, 3),
  [307] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_query_string_params_section, 4, 0, 3),
  [309] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_cookies_section, 3, 0, 3),
  [311] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_cookies_section, 3, 0, 3),
  [313] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_form_params_section, 3, 0, 3),
  [315] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_form_params_section, 3, 0, 3),
  [317] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_query_string_params_section, 5, 0, 3),
  [319] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_query_string_params_section, 5, 0, 3),
  [321] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_form_params_section, 5, 0, 3),
  [323] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_form_params_section, 5, 0, 3),
  [325] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_request_repeat2, 2, 0, 0),
  [327] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_request_repeat2, 2, 0, 0),
  [329] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_request_repeat2, 2, 0, 0), SHIFT_REPEAT(385),
  [332] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_request_repeat2, 2, 0, 0), SHIFT_REPEAT(384),
  [335] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_request_repeat2, 2, 0, 0), SHIFT_REPEAT(379),
  [338] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_request_repeat2, 2, 0, 0), SHIFT_REPEAT(377),
  [341] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_request_repeat2, 2, 0, 0), SHIFT_REPEAT(374),
  [344] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_request_repeat2, 2, 0, 0), SHIFT_REPEAT(372),
  [347] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_capture_repeat1, 2, 0, 0), SHIFT_REPEAT(440),
  [350] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_capture_repeat1, 2, 0, 0), SHIFT_REPEAT(328),
  [353] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_capture_repeat1, 2, 0, 0),
  [355] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_capture_repeat1, 2, 0, 0),
  [357] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_capture_repeat1, 2, 0, 0), SHIFT_REPEAT(57),
  [360] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_capture_repeat1, 2, 0, 0), SHIFT_REPEAT(319),
  [363] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_capture_repeat1, 2, 0, 0), SHIFT_REPEAT(286),
  [366] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_capture_repeat1, 2, 0, 0), SHIFT_REPEAT(450),
  [369] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_hurl_file_repeat2, 2, 0, 0),
  [371] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_hurl_file_repeat2, 2, 0, 0), SHIFT_REPEAT(41),
  [374] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_hurl_file_repeat2, 2, 0, 0),
  [376] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_hurl_file_repeat2, 2, 0, 0), SHIFT_REPEAT(41),
  [379] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym__comment_or_new_line_repeat1, 2, 0, 0), SHIFT_REPEAT(40),
  [382] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym__comment_or_new_line_repeat1, 2, 0, 0), SHIFT_REPEAT(40),
  [385] = {.entry = {.count = 1, .reusable = true}}, SHIFT(40),
  [387] = {.entry = {.count = 1, .reusable = false}}, SHIFT(40),
  [389] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_header, 2, 0, 0),
  [391] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_header, 2, 0, 0),
  [393] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_integer, 1, 0, 0),
  [395] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_integer, 1, 0, 0),
  [397] = {.entry = {.count = 1, .reusable = true}}, SHIFT(52),
  [399] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_integer_repeat1, 2, 0, 0),
  [401] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_integer_repeat1, 2, 0, 0),
  [403] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_integer_repeat1, 2, 0, 0), SHIFT_REPEAT(52),
  [406] = {.entry = {.count = 1, .reusable = true}}, SHIFT(47),
  [408] = {.entry = {.count = 1, .reusable = false}}, SHIFT(47),
  [410] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym__comment_or_new_line_repeat1, 2, 0, 0), SHIFT_REPEAT(47),
  [413] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym__comment_or_new_line_repeat1, 2, 0, 0), SHIFT_REPEAT(47),
  [416] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_basic_auth_section, 4, 0, 3),
  [418] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_basic_auth_section, 4, 0, 3),
  [420] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_assert, 3, 0, 0),
  [422] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_assert, 3, 0, 0),
  [424] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_assert, 4, 0, 0),
  [426] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_assert, 4, 0, 0),
  [428] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_request_section, 1, 0, 0),
  [430] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_request_section, 1, 0, 0),
  [432] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_digit, 1, 0, 0),
  [434] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_digit, 1, 0, 0),
  [436] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_regex, 2, 0, 0),
  [438] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_regex, 2, 0, 0),
  [440] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_quoted_string, 3, 0, 0),
  [442] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_quoted_string, 3, 0, 0),
  [444] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_regex, 3, 0, 0),
  [446] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_regex, 3, 0, 0),
  [448] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_quoted_string, 2, 0, 0),
  [450] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_quoted_string, 2, 0, 0),
  [452] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_simple_filter_key, 1, 0, 2),
  [454] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_simple_filter_key, 1, 0, 2),
  [456] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_regex_filter, 2, 0, 2),
  [458] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_regex_filter, 2, 0, 2),
  [460] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_xpath_filter, 2, 0, 2),
  [462] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_xpath_filter, 2, 0, 2),
  [464] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_replace_filter, 3, 0, 2),
  [466] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_replace_filter, 3, 0, 2),
  [468] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_split_filter, 2, 0, 2),
  [470] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_split_filter, 2, 0, 2),
  [472] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_filter, 1, 0, 0),
  [474] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_filter, 1, 0, 0),
  [476] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_nth_filter, 2, 0, 2),
  [478] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_nth_filter, 2, 0, 2),
  [480] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_xpath_query, 2, 0, 5),
  [482] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_xpath_query, 2, 0, 5),
  [484] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_captures_section, 2, 0, 3),
  [486] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_captures_section, 2, 0, 3),
  [488] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_variable_query, 2, 0, 5),
  [490] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_variable_query, 2, 0, 5),
  [492] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_header_query, 2, 0, 5),
  [494] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_header_query, 2, 0, 5),
  [496] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_captures_section_repeat1, 2, 0, 0),
  [498] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_captures_section_repeat1, 2, 0, 0),
  [500] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_captures_section_repeat1, 2, 0, 0), SHIFT_REPEAT(418),
  [503] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_captures_section_repeat1, 2, 0, 0), SHIFT_REPEAT(234),
  [506] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_captures_section_repeat1, 2, 0, 0), SHIFT_REPEAT(392),
  [509] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_regex_query, 2, 0, 5),
  [511] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_regex_query, 2, 0, 5),
  [513] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_jsonpath_query, 2, 0, 5),
  [515] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_jsonpath_query, 2, 0, 5),
  [517] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_query, 1, 0, 0),
  [519] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_query, 1, 0, 0),
  [521] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_cookie_query, 2, 0, 5),
  [523] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_cookie_query, 2, 0, 5),
  [525] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_simple_query, 1, 0, 5),
  [527] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_simple_query, 1, 0, 5),
  [529] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_captures_section, 3, 0, 3),
  [531] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_captures_section, 3, 0, 3),
  [533] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_response_repeat1, 2, 0, 0),
  [535] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_response_repeat1, 2, 0, 0),
  [537] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_response_repeat1, 2, 0, 0), SHIFT_REPEAT(396),
  [540] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_response_repeat1, 2, 0, 0), SHIFT_REPEAT(397),
  [543] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym__comment_or_new_line_repeat1, 2, 0, 0), SHIFT_REPEAT(78),
  [546] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym__comment_or_new_line_repeat1, 2, 0, 0), SHIFT_REPEAT(78),
  [549] = {.entry = {.count = 1, .reusable = true}}, SHIFT(78),
  [551] = {.entry = {.count = 1, .reusable = false}}, SHIFT(78),
  [553] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_capture, 4, 0, 0),
  [555] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_capture, 4, 0, 0),
  [557] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_capture, 5, 0, 0),
  [559] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_capture, 5, 0, 0),
  [561] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_response_section, 1, 0, 0),
  [563] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_response_section, 1, 0, 0),
  [565] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_entry, 2, 0, 0),
  [567] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_entry, 2, 0, 0),
  [569] = {.entry = {.count = 1, .reusable = false}}, SHIFT(445),
  [571] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_entry, 1, 0, 0),
  [573] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_entry, 1, 0, 0),
  [575] = {.entry = {.count = 1, .reusable = true}}, SHIFT(79),
  [577] = {.entry = {.count = 1, .reusable = false}}, SHIFT(454),
  [579] = {.entry = {.count = 1, .reusable = false}}, SHIFT(305),
  [581] = {.entry = {.count = 1, .reusable = false}}, SHIFT(149),
  [583] = {.entry = {.count = 1, .reusable = false}}, SHIFT(300),
  [585] = {.entry = {.count = 1, .reusable = false}}, SHIFT(309),
  [587] = {.entry = {.count = 1, .reusable = false}}, SHIFT(452),
  [589] = {.entry = {.count = 1, .reusable = false}}, SHIFT(79),
  [591] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_hurl_file, 1, 0, 0),
  [593] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_hurl_file_repeat1, 2, 0, 0),
  [595] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_hurl_file_repeat1, 2, 0, 0), SHIFT_REPEAT(121),
  [598] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_hurl_file_repeat1, 2, 0, 0), SHIFT_REPEAT(290),
  [601] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_hurl_file_repeat1, 2, 0, 0), SHIFT_REPEAT(121),
  [604] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_expr, 2, 0, 0),
  [606] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_request, 6, 0, 0),
  [608] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_request, 6, 0, 0),
  [610] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_capture_repeat1, 2, 0, 0), SHIFT_REPEAT(454),
  [613] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_capture_repeat1, 2, 0, 0), SHIFT_REPEAT(305),
  [616] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_capture_repeat1, 2, 0, 0), SHIFT_REPEAT(149),
  [619] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_capture_repeat1, 2, 0, 0), SHIFT_REPEAT(300),
  [622] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_capture_repeat1, 2, 0, 0), SHIFT_REPEAT(309),
  [625] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_capture_repeat1, 2, 0, 0), SHIFT_REPEAT(452),
  [628] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_expr, 1, 0, 0),
  [630] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_body, 2, 0, 0),
  [632] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_body, 2, 0, 0),
  [634] = {.entry = {.count = 1, .reusable = false}}, SHIFT(108),
  [636] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_hurl_file, 2, 0, 0),
  [638] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_integer_repeat1, 2, 0, 0), SHIFT_REPEAT(108),
  [641] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_key_value, 2, 0, 0),
  [643] = {.entry = {.count = 1, .reusable = false}}, SHIFT(530),
  [645] = {.entry = {.count = 1, .reusable = false}}, SHIFT(171),
  [647] = {.entry = {.count = 1, .reusable = false}}, SHIFT(210),
  [649] = {.entry = {.count = 1, .reusable = false}}, SHIFT(267),
  [651] = {.entry = {.count = 1, .reusable = false}}, SHIFT(529),
  [653] = {.entry = {.count = 1, .reusable = false}}, SHIFT(391),
  [655] = {.entry = {.count = 1, .reusable = true}}, SHIFT(121),
  [657] = {.entry = {.count = 1, .reusable = false}}, SHIFT(121),
  [659] = {.entry = {.count = 1, .reusable = true}}, SHIFT(551),
  [661] = {.entry = {.count = 1, .reusable = true}}, SHIFT(180),
  [663] = {.entry = {.count = 1, .reusable = true}}, SHIFT(487),
  [665] = {.entry = {.count = 1, .reusable = true}}, SHIFT(310),
  [667] = {.entry = {.count = 1, .reusable = true}}, SHIFT(179),
  [669] = {.entry = {.count = 1, .reusable = true}}, SHIFT(211),
  [671] = {.entry = {.count = 1, .reusable = true}}, SHIFT(529),
  [673] = {.entry = {.count = 1, .reusable = true}}, SHIFT(360),
  [675] = {.entry = {.count = 1, .reusable = true}}, SHIFT(108),
  [677] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_hurl_file_repeat2, 2, 0, 0), SHIFT_REPEAT(46),
  [680] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_hurl_file_repeat2, 2, 0, 0), SHIFT_REPEAT(46),
  [683] = {.entry = {.count = 1, .reusable = true}}, SHIFT(444),
  [685] = {.entry = {.count = 1, .reusable = true}}, SHIFT(443),
  [687] = {.entry = {.count = 1, .reusable = true}}, SHIFT(146),
  [689] = {.entry = {.count = 1, .reusable = true}}, SHIFT(441),
  [691] = {.entry = {.count = 1, .reusable = true}}, SHIFT(419),
  [693] = {.entry = {.count = 1, .reusable = true}}, SHIFT(439),
  [695] = {.entry = {.count = 1, .reusable = true}}, SHIFT(334),
  [697] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_hurl_file_repeat2, 2, 0, 0), SHIFT_REPEAT(121),
  [700] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_hurl_file_repeat2, 2, 0, 0), SHIFT_REPEAT(121),
  [703] = {.entry = {.count = 1, .reusable = false}}, SHIFT(570),
  [705] = {.entry = {.count = 1, .reusable = true}}, SHIFT(455),
  [707] = {.entry = {.count = 1, .reusable = false}}, SHIFT(232),
  [709] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_entry, 3, 0, 0),
  [711] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_entry, 3, 0, 0),
  [713] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym__comment_or_new_line_repeat1, 2, 0, 0), SHIFT_REPEAT(119),
  [716] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym__comment_or_new_line_repeat1, 2, 0, 0), SHIFT_REPEAT(119),
  [719] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_response, 6, 0, 0),
  [721] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_response, 6, 0, 0),
  [723] = {.entry = {.count = 1, .reusable = true}}, SHIFT(119),
  [725] = {.entry = {.count = 1, .reusable = false}}, SHIFT(119),
  [727] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_entry, 4, 0, 0),
  [729] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_entry, 4, 0, 0),
  [731] = {.entry = {.count = 1, .reusable = true}}, SHIFT(402),
  [733] = {.entry = {.count = 1, .reusable = false}}, SHIFT(220),
  [735] = {.entry = {.count = 1, .reusable = true}}, SHIFT(174),
  [737] = {.entry = {.count = 1, .reusable = true}}, SHIFT(130),
  [739] = {.entry = {.count = 1, .reusable = true}}, SHIFT(404),
  [741] = {.entry = {.count = 1, .reusable = true}}, SHIFT(383),
  [743] = {.entry = {.count = 1, .reusable = true}}, SHIFT(228),
  [745] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_variable_name, 2, 0, 0),
  [747] = {.entry = {.count = 1, .reusable = false}}, SHIFT(571),
  [749] = {.entry = {.count = 1, .reusable = false}}, SHIFT(574),
  [751] = {.entry = {.count = 1, .reusable = false}}, SHIFT(251),
  [753] = {.entry = {.count = 1, .reusable = false}}, SHIFT(389),
  [755] = {.entry = {.count = 1, .reusable = false}}, SHIFT(582),
  [757] = {.entry = {.count = 1, .reusable = false}}, SHIFT(41),
  [759] = {.entry = {.count = 1, .reusable = true}}, SHIFT(41),
  [761] = {.entry = {.count = 1, .reusable = true}}, SHIFT(234),
  [763] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_xml_tag_repeat1, 2, 0, 0), SHIFT_REPEAT(494),
  [766] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_xml_tag_repeat1, 2, 0, 0), SHIFT_REPEAT(571),
  [769] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_xml_tag_repeat1, 2, 0, 0),
  [771] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_xml_tag_repeat1, 2, 0, 0), SHIFT_REPEAT(251),
  [774] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_xml_tag_repeat1, 2, 0, 0), SHIFT_REPEAT(389),
  [777] = {.entry = {.count = 1, .reusable = true}}, SHIFT(382),
  [779] = {.entry = {.count = 1, .reusable = true}}, SHIFT(451),
  [781] = {.entry = {.count = 1, .reusable = false}}, SHIFT(382),
  [783] = {.entry = {.count = 1, .reusable = false}}, SHIFT(278),
  [785] = {.entry = {.count = 1, .reusable = false}}, SHIFT(200),
  [787] = {.entry = {.count = 1, .reusable = false}}, SHIFT(510),
  [789] = {.entry = {.count = 1, .reusable = false}}, SHIFT(203),
  [791] = {.entry = {.count = 1, .reusable = false}}, SHIFT(398),
  [793] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_multiline_string_repeat1, 2, 0, 0), SHIFT_REPEAT(202),
  [796] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_multiline_string_repeat1, 2, 0, 0), SHIFT_REPEAT(200),
  [799] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_multiline_string_repeat1, 2, 0, 0),
  [801] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_multiline_string_repeat1, 2, 0, 0), SHIFT_REPEAT(203),
  [804] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_multiline_string_repeat1, 2, 0, 0), SHIFT_REPEAT(398),
  [807] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_value_string_repeat1, 2, 0, 0),
  [809] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_value_string_repeat1, 2, 0, 0), SHIFT_REPEAT(210),
  [812] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_value_string_repeat1, 2, 0, 0), SHIFT_REPEAT(267),
  [815] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_value_string_repeat1, 2, 0, 0), SHIFT_REPEAT(391),
  [818] = {.entry = {.count = 1, .reusable = false}}, SHIFT(255),
  [820] = {.entry = {.count = 1, .reusable = false}}, SHIFT(485),
  [822] = {.entry = {.count = 1, .reusable = false}}, SHIFT(281),
  [824] = {.entry = {.count = 1, .reusable = false}}, SHIFT(538),
  [826] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_value_string, 1, 0, 0),
  [828] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_quoted_string_repeat1, 2, 0, 0), SHIFT_REPEAT(188),
  [831] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_quoted_string_repeat1, 2, 0, 0),
  [833] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_quoted_string_repeat1, 2, 0, 0), SHIFT_REPEAT(229),
  [836] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_quoted_string_repeat1, 2, 0, 0), SHIFT_REPEAT(412),
  [839] = {.entry = {.count = 1, .reusable = true}}, SHIFT(418),
  [841] = {.entry = {.count = 1, .reusable = true}}, SHIFT(392),
  [843] = {.entry = {.count = 1, .reusable = false}}, SHIFT(188),
  [845] = {.entry = {.count = 1, .reusable = false}}, SHIFT(56),
  [847] = {.entry = {.count = 1, .reusable = false}}, SHIFT(229),
  [849] = {.entry = {.count = 1, .reusable = false}}, SHIFT(412),
  [851] = {.entry = {.count = 1, .reusable = false}}, SHIFT(453),
  [853] = {.entry = {.count = 1, .reusable = false}}, SHIFT(376),
  [855] = {.entry = {.count = 1, .reusable = false}}, SHIFT(241),
  [857] = {.entry = {.count = 1, .reusable = false}}, SHIFT(363),
  [859] = {.entry = {.count = 1, .reusable = false}}, SHIFT(199),
  [861] = {.entry = {.count = 1, .reusable = false}}, SHIFT(544),
  [863] = {.entry = {.count = 1, .reusable = false}}, SHIFT(265),
  [865] = {.entry = {.count = 1, .reusable = false}}, SHIFT(365),
  [867] = {.entry = {.count = 1, .reusable = false}}, SHIFT(245),
  [869] = {.entry = {.count = 1, .reusable = false}}, SHIFT(495),
  [871] = {.entry = {.count = 1, .reusable = false}}, SHIFT(513),
  [873] = {.entry = {.count = 1, .reusable = false}}, SHIFT(367),
  [875] = {.entry = {.count = 1, .reusable = false}}, SHIFT(298),
  [877] = {.entry = {.count = 1, .reusable = false}}, SHIFT(54),
  [879] = {.entry = {.count = 1, .reusable = false}}, SHIFT(541),
  [881] = {.entry = {.count = 1, .reusable = false}}, SHIFT(332),
  [883] = {.entry = {.count = 1, .reusable = false}}, SHIFT(144),
  [885] = {.entry = {.count = 1, .reusable = false}}, SHIFT(148),
  [887] = {.entry = {.count = 1, .reusable = false}}, SHIFT(527),
  [889] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_oneline_string_repeat1, 2, 0, 0), SHIFT_REPEAT(245),
  [892] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_oneline_string_repeat1, 2, 0, 0), SHIFT_REPEAT(495),
  [895] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_oneline_string_repeat1, 2, 0, 0),
  [897] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_oneline_string_repeat1, 2, 0, 0), SHIFT_REPEAT(367),
  [900] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_json_string_repeat1, 2, 0, 0), SHIFT_REPEAT(199),
  [903] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_json_string_repeat1, 2, 0, 0),
  [905] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_json_string_repeat1, 2, 0, 0), SHIFT_REPEAT(265),
  [908] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_json_string_repeat1, 2, 0, 0), SHIFT_REPEAT(365),
  [911] = {.entry = {.count = 1, .reusable = false}}, SHIFT(483),
  [913] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_filename, 1, 0, 0),
  [915] = {.entry = {.count = 1, .reusable = false}}, SHIFT(375),
  [917] = {.entry = {.count = 1, .reusable = false}}, SHIFT(235),
  [919] = {.entry = {.count = 1, .reusable = false}}, SHIFT(371),
  [921] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_key_string_repeat1, 2, 0, 0),
  [923] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_key_string_repeat1, 2, 0, 0), SHIFT_REPEAT(455),
  [926] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_key_string_repeat1, 2, 0, 0), SHIFT_REPEAT(232),
  [929] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_key_string_repeat1, 2, 0, 0), SHIFT_REPEAT(360),
  [932] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_key_string_repeat1, 2, 0, 0),
  [934] = {.entry = {.count = 1, .reusable = false}}, SHIFT(313),
  [936] = {.entry = {.count = 1, .reusable = false}}, SHIFT(471),
  [938] = {.entry = {.count = 1, .reusable = false}}, SHIFT(315),
  [940] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_xml_value_string, 1, 0, 0),
  [942] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_key_string, 1, 0, 0),
  [944] = {.entry = {.count = 1, .reusable = false}}, SHIFT(455),
  [946] = {.entry = {.count = 1, .reusable = true}}, SHIFT(232),
  [948] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_key_string, 1, 0, 0),
  [950] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_integer, 1, 0, 0),
  [952] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_xml_value_string_repeat1, 2, 0, 0),
  [954] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_xml_value_string_repeat1, 2, 0, 0), SHIFT_REPEAT(251),
  [957] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_xml_value_string_repeat1, 2, 0, 0), SHIFT_REPEAT(389),
  [960] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_key_string_repeat1, 2, 0, 0), SHIFT_REPEAT(418),
  [963] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_key_string_repeat1, 2, 0, 0), SHIFT_REPEAT(234),
  [966] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_key_string_repeat1, 2, 0, 0), SHIFT_REPEAT(392),
  [969] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_json_integer_repeat1, 2, 0, 0),
  [971] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_json_integer_repeat1, 2, 0, 0), SHIFT_REPEAT(228),
  [974] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_filename_repeat1, 2, 0, 0),
  [976] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_filename_repeat1, 2, 0, 0), SHIFT_REPEAT(375),
  [979] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_filename_repeat1, 2, 0, 0), SHIFT_REPEAT(235),
  [982] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_filename_repeat1, 2, 0, 0), SHIFT_REPEAT(371),
  [985] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_filename_repeat1, 2, 0, 0), SHIFT_REPEAT(376),
  [988] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_filename_repeat1, 2, 0, 0), SHIFT_REPEAT(241),
  [991] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_filename_repeat1, 2, 0, 0), SHIFT_REPEAT(363),
  [994] = {.entry = {.count = 1, .reusable = true}}, SHIFT(325),
  [996] = {.entry = {.count = 1, .reusable = true}}, SHIFT(446),
  [998] = {.entry = {.count = 1, .reusable = true}}, SHIFT(275),
  [1000] = {.entry = {.count = 1, .reusable = true}}, SHIFT(462),
  [1002] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_value_string_content_repeat1, 2, 0, 0),
  [1004] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_value_string_content_repeat1, 2, 0, 0), SHIFT_REPEAT(210),
  [1007] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_value_string_content_repeat1, 2, 0, 0), SHIFT_REPEAT(267),
  [1010] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_multiline_string_content, 1, 0, 0),
  [1012] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym__multiline_string_text, 1, 0, 0),
  [1014] = {.entry = {.count = 1, .reusable = false}}, SHIFT(208),
  [1016] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_multiline_string_content_repeat1, 2, 0, 0), SHIFT_REPEAT(204),
  [1019] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_multiline_string_content_repeat1, 2, 0, 0), SHIFT_REPEAT(200),
  [1022] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_multiline_string_content_repeat1, 2, 0, 0),
  [1024] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_multiline_string_content_repeat1, 2, 0, 0), SHIFT_REPEAT(203),
  [1027] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_value_string_content, 1, 0, 0),
  [1029] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym__multiline_string_text_repeat1, 2, 0, 0),
  [1031] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym__multiline_string_text_repeat1, 2, 0, 0), SHIFT_REPEAT(206),
  [1034] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_fraction, 2, 0, 0),
  [1036] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym__multiline_string_text, 2, 0, 0),
  [1038] = {.entry = {.count = 1, .reusable = false}}, SHIFT(206),
  [1040] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_number, 1, 0, 0),
  [1042] = {.entry = {.count = 1, .reusable = true}}, SHIFT(370),
  [1044] = {.entry = {.count = 1, .reusable = true}}, SHIFT(270),
  [1046] = {.entry = {.count = 1, .reusable = true}}, SHIFT(291),
  [1048] = {.entry = {.count = 1, .reusable = true}}, SHIFT(464),
  [1050] = {.entry = {.count = 1, .reusable = false}}, SHIFT(291),
  [1052] = {.entry = {.count = 1, .reusable = false}}, SHIFT(165),
  [1054] = {.entry = {.count = 1, .reusable = false}}, SHIFT(489),
  [1056] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_integer, 1, 0, 0),
  [1058] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_oneline_string_content, 1, 0, 0),
  [1060] = {.entry = {.count = 1, .reusable = true}}, SHIFT(552),
  [1062] = {.entry = {.count = 1, .reusable = true}}, SHIFT(320),
  [1064] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_quoted_string_content_repeat1, 2, 0, 0), SHIFT_REPEAT(188),
  [1067] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_quoted_string_content_repeat1, 2, 0, 0),
  [1069] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_quoted_string_content_repeat1, 2, 0, 0), SHIFT_REPEAT(215),
  [1072] = {.entry = {.count = 1, .reusable = true}}, SHIFT(260),
  [1074] = {.entry = {.count = 1, .reusable = false}}, SHIFT(159),
  [1076] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_oneline_string_content_repeat1, 2, 0, 0), SHIFT_REPEAT(245),
  [1079] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_oneline_string_content_repeat1, 2, 0, 0), SHIFT_REPEAT(495),
  [1082] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_oneline_string_content_repeat1, 2, 0, 0),
  [1084] = {.entry = {.count = 1, .reusable = true}}, SHIFT(378),
  [1086] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_json_integer_repeat1, 2, 0, 0), SHIFT_REPEAT(258),
  [1089] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_json_integer_repeat1, 2, 0, 0),
  [1091] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_digit, 1, 0, 0),
  [1093] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_quoted_string_content, 1, 0, 0),
  [1095] = {.entry = {.count = 1, .reusable = false}}, SHIFT(215),
  [1097] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_exponent, 3, 0, 0),
  [1099] = {.entry = {.count = 1, .reusable = false}}, SHIFT(522),
  [1101] = {.entry = {.count = 1, .reusable = false}}, SHIFT(53),
  [1103] = {.entry = {.count = 1, .reusable = false}}, SHIFT(266),
  [1105] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_key_string_content, 1, 0, 0),
  [1107] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_key_string_content, 1, 0, 0),
  [1109] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_value_string_text_repeat1, 2, 0, 0),
  [1111] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_value_string_text_repeat1, 2, 0, 0), SHIFT_REPEAT(233),
  [1114] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_filename_content, 1, 0, 0),
  [1116] = {.entry = {.count = 1, .reusable = true}}, SHIFT(488),
  [1118] = {.entry = {.count = 1, .reusable = false}}, SHIFT(386),
  [1120] = {.entry = {.count = 1, .reusable = false}}, SHIFT(282),
  [1122] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_number, 1, 0, 0),
  [1124] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_filename_content_repeat1, 2, 0, 0),
  [1126] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_filename_content_repeat1, 2, 0, 0), SHIFT_REPEAT(376),
  [1129] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_filename_content_repeat1, 2, 0, 0), SHIFT_REPEAT(240),
  [1132] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_number, 2, 0, 0),
  [1134] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_key_string_content_repeat1, 2, 0, 0),
  [1136] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_key_string_content_repeat1, 2, 0, 0), SHIFT_REPEAT(455),
  [1139] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_key_string_content_repeat1, 2, 0, 0), SHIFT_REPEAT(243),
  [1142] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_key_string_content_repeat1, 2, 0, 0),
  [1144] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_filename_content_repeat1, 2, 0, 0), SHIFT_REPEAT(375),
  [1147] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_filename_content_repeat1, 2, 0, 0), SHIFT_REPEAT(244),
  [1150] = {.entry = {.count = 1, .reusable = true}}, SHIFT(311),
  [1152] = {.entry = {.count = 1, .reusable = true}}, SHIFT(449),
  [1154] = {.entry = {.count = 1, .reusable = false}}, SHIFT(311),
  [1156] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_fraction, 2, 0, 0),
  [1158] = {.entry = {.count = 1, .reusable = false}}, SHIFT(131),
  [1160] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_exponent, 2, 0, 0),
  [1162] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_value_string_text, 1, 0, 0),
  [1164] = {.entry = {.count = 1, .reusable = false}}, SHIFT(233),
  [1166] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_key_string_content_repeat1, 2, 0, 0), SHIFT_REPEAT(418),
  [1169] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_key_string_content_repeat1, 2, 0, 0), SHIFT_REPEAT(252),
  [1172] = {.entry = {.count = 1, .reusable = true}}, SHIFT(276),
  [1174] = {.entry = {.count = 1, .reusable = false}}, SHIFT(276),
  [1176] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_unicode_char, 6, 0, 0),
  [1178] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_multiline_string_content_repeat1, 1, 0, 0),
  [1180] = {.entry = {.count = 1, .reusable = false}}, SHIFT(546),
  [1182] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_multiline_string_escaped_char, 3, 0, 0),
  [1184] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_template, 3, 0, 1),
  [1186] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_digit, 1, 0, 0),
  [1188] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_xml_prolog_tag, 3, 0, 0),
  [1190] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_filename_password, 1, 0, 0),
  [1192] = {.entry = {.count = 1, .reusable = false}}, SHIFT(277),
  [1194] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_xml_open_tag, 3, 0, 0),
  [1196] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_xml_tag, 3, 0, 0),
  [1198] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_value, 1, 0, 0),
  [1200] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_key_string_repeat1, 1, 0, 0),
  [1202] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_key_string_repeat1, 1, 0, 0),
  [1204] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_value, 1, 0, 0),
  [1206] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_string_text, 1, 0, 0),
  [1208] = {.entry = {.count = 1, .reusable = false}}, SHIFT(272),
  [1210] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_regex_content, 1, 0, 0),
  [1212] = {.entry = {.count = 1, .reusable = false}}, SHIFT(269),
  [1214] = {.entry = {.count = 1, .reusable = false}}, SHIFT(268),
  [1216] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_value_string_text_repeat1, 2, 0, 0), SHIFT_REPEAT(268),
  [1219] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_regex_content_repeat1, 2, 0, 0), SHIFT_REPEAT(522),
  [1222] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_regex_content_repeat1, 2, 0, 0),
  [1224] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_regex_content_repeat1, 2, 0, 0), SHIFT_REPEAT(269),
  [1227] = {.entry = {.count = 1, .reusable = true}}, SHIFT(354),
  [1229] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_duration_option, 3, 0, 6),
  [1231] = {.entry = {.count = 1, .reusable = false}}, SHIFT(542),
  [1233] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_duration_option, 3, 0, 6),
  [1235] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_json_string_text_repeat1, 2, 0, 0),
  [1237] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_json_string_text_repeat1, 2, 0, 0), SHIFT_REPEAT(272),
  [1240] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_xml_close_tag, 3, 0, 0),
  [1242] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_xml_tag, 2, 0, 0),
  [1244] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_multiline_string_escaped_char, 2, 0, 0),
  [1246] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym__comment_or_new_line_repeat1, 2, 0, 0), SHIFT_REPEAT(276),
  [1249] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym__comment_or_new_line_repeat1, 2, 0, 0), SHIFT_REPEAT(276),
  [1252] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_filename_password_repeat1, 2, 0, 0),
  [1254] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_filename_password_repeat1, 2, 0, 0), SHIFT_REPEAT(277),
  [1257] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_filename_password_repeat1, 2, 0, 0), SHIFT_REPEAT(159),
  [1260] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_template, 3, 0, 1),
  [1262] = {.entry = {.count = 1, .reusable = true}}, SHIFT(258),
  [1264] = {.entry = {.count = 1, .reusable = true}}, SHIFT(356),
  [1266] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_xml_repeat1, 2, 0, 0),
  [1268] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_xml_repeat1, 2, 0, 0), SHIFT_REPEAT(488),
  [1271] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_query_string_params_section_repeat1, 2, 0, 0), SHIFT_REPEAT(253),
  [1274] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_query_string_params_section_repeat1, 2, 0, 0), SHIFT_REPEAT(253),
  [1277] = {.entry = {.count = 1, .reusable = true}}, SHIFT(170),
  [1279] = {.entry = {.count = 1, .reusable = true}}, SHIFT(231),
  [1281] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_number, 2, 0, 0),
  [1283] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_method, 1, 0, 0),
  [1285] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_value_string_escaped_char, 2, 0, 0),
  [1287] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_oneline_string_escaped_char, 3, 0, 0),
  [1289] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_key_string_escaped_char, 2, 0, 0),
  [1291] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_key_string_escaped_char, 2, 0, 0),
  [1293] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_quoted_string_escaped_char, 3, 0, 0),
  [1295] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_string, 2, 0, 0),
  [1297] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_exponent, 3, 0, 0),
  [1299] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_value_string_escaped_char, 3, 0, 0),
  [1301] = {.entry = {.count = 1, .reusable = true}}, SHIFT(247),
  [1303] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_hexdigit, 1, 0, 0),
  [1305] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_filename_escaped_char, 2, 0, 0),
  [1307] = {.entry = {.count = 1, .reusable = true}}, SHIFT(486),
  [1309] = {.entry = {.count = 1, .reusable = true}}, SHIFT(351),
  [1311] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_oneline_string_escaped_char, 2, 0, 0),
  [1313] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_fraction, 2, 0, 0),
  [1315] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_fraction, 2, 0, 0),
  [1317] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_quoted_string_escaped_char, 2, 0, 0),
  [1319] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_invalid_quoted_string_escaped_char, 2, 0, 0),
  [1321] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_oneline_string_text, 2, 0, 0),
  [1323] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_exponent, 2, 0, 0),
  [1325] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_string_content, 1, 0, 0),
  [1327] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_string_escaped_char, 6, 0, 0),
  [1329] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_string_escaped_char, 2, 0, 0),
  [1331] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_oneline_hex_repeat1, 2, 0, 0),
  [1333] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_oneline_hex_repeat1, 2, 0, 0), SHIFT_REPEAT(351),
  [1336] = {.entry = {.count = 1, .reusable = true}}, SHIFT(547),
  [1338] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_string, 3, 0, 0),
  [1340] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_string_option, 3, 0, 6),
  [1342] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_value_string_repeat1, 1, 0, 0),
  [1344] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_json_array_repeat1, 2, 0, 0), SHIFT_REPEAT(128),
  [1347] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_json_array_repeat1, 2, 0, 0),
  [1349] = {.entry = {.count = 1, .reusable = true}}, SHIFT(128),
  [1351] = {.entry = {.count = 1, .reusable = true}}, SHIFT(369),
  [1353] = {.entry = {.count = 1, .reusable = true}}, SHIFT(10),
  [1355] = {.entry = {.count = 1, .reusable = false}}, SHIFT(10),
  [1357] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_key_value, 3, 0, 0),
  [1359] = {.entry = {.count = 1, .reusable = false}}, SHIFT(380),
  [1361] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_key_value, 3, 0, 0),
  [1363] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_object, 3, 0, 0),
  [1365] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_array, 3, 0, 0),
  [1367] = {.entry = {.count = 1, .reusable = true}}, SHIFT(576),
  [1369] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_hexdigit, 1, 0, 0),
  [1371] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_regex_escaped_char, 2, 0, 0),
  [1373] = {.entry = {.count = 1, .reusable = true}}, SHIFT(518),
  [1375] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_json_object_repeat1, 2, 0, 0),
  [1377] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_json_object_repeat1, 2, 0, 0), SHIFT_REPEAT(320),
  [1380] = {.entry = {.count = 1, .reusable = true}}, SHIFT(506),
  [1382] = {.entry = {.count = 1, .reusable = true}}, SHIFT(514),
  [1384] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_number, 3, 0, 0),
  [1386] = {.entry = {.count = 1, .reusable = true}}, SHIFT(504),
  [1388] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_object, 4, 0, 0),
  [1390] = {.entry = {.count = 1, .reusable = true}}, SHIFT(534),
  [1392] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_array, 4, 0, 0),
  [1394] = {.entry = {.count = 1, .reusable = true}}, SHIFT(253),
  [1396] = {.entry = {.count = 1, .reusable = false}}, SHIFT(253),
  [1398] = {.entry = {.count = 1, .reusable = true}}, SHIFT(337),
  [1400] = {.entry = {.count = 1, .reusable = false}}, SHIFT(337),
  [1402] = {.entry = {.count = 1, .reusable = true}}, SHIFT(308),
  [1404] = {.entry = {.count = 1, .reusable = false}}, SHIFT(308),
  [1406] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_object, 2, 0, 0),
  [1408] = {.entry = {.count = 1, .reusable = true}}, SHIFT(348),
  [1410] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_filename_password_escaped_char, 2, 0, 0),
  [1412] = {.entry = {.count = 1, .reusable = true}}, SHIFT(349),
  [1414] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_predicate_value, 1, 0, 0),
  [1416] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_predicate_value, 1, 0, 0),
  [1418] = {.entry = {.count = 1, .reusable = true}}, SHIFT(366),
  [1420] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_greater_predicate, 2, 0, 7),
  [1422] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_greater_predicate, 2, 0, 7),
  [1424] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_filename_password_escaped_char, 3, 0, 0),
  [1426] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_greater_predicate, 2, 0, 0),
  [1428] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_greater_predicate, 2, 0, 0),
  [1430] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_greater_or_equal_predicate, 2, 0, 7),
  [1432] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_greater_or_equal_predicate, 2, 0, 7),
  [1434] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_boolean, 1, 0, 0),
  [1436] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_greater_or_equal_predicate, 2, 0, 0),
  [1438] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_greater_or_equal_predicate, 2, 0, 0),
  [1440] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_variable_value, 1, 0, 0),
  [1442] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_variable_value, 1, 0, 0),
  [1444] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_less_predicate, 2, 0, 7),
  [1446] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_less_predicate, 2, 0, 7),
  [1448] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_less_predicate, 2, 0, 0),
  [1450] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_less_predicate, 2, 0, 0),
  [1452] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_less_or_equal_predicate, 2, 0, 7),
  [1454] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_less_or_equal_predicate, 2, 0, 7),
  [1456] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_less_or_equal_predicate, 2, 0, 0),
  [1458] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_less_or_equal_predicate, 2, 0, 0),
  [1460] = {.entry = {.count = 1, .reusable = false}}, SHIFT(317),
  [1462] = {.entry = {.count = 1, .reusable = true}}, SHIFT(317),
  [1464] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_file_value, 3, 0, 0),
  [1466] = {.entry = {.count = 1, .reusable = false}}, SHIFT(553),
  [1468] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_file_value, 3, 0, 0),
  [1470] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_xml_prolog_tag, 3, 0, 0),
  [1472] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_version, 1, 0, 0),
  [1474] = {.entry = {.count = 1, .reusable = true}}, SHIFT(512),
  [1476] = {.entry = {.count = 1, .reusable = true}}, SHIFT(306),
  [1478] = {.entry = {.count = 1, .reusable = true}}, SHIFT(423),
  [1480] = {.entry = {.count = 1, .reusable = true}}, SHIFT(420),
  [1482] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_file_value, 2, 0, 0),
  [1484] = {.entry = {.count = 1, .reusable = false}}, SHIFT(575),
  [1486] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_file_value, 2, 0, 0),
  [1488] = {.entry = {.count = 1, .reusable = false}}, SHIFT(296),
  [1490] = {.entry = {.count = 1, .reusable = true}}, SHIFT(296),
  [1492] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_key_value, 3, 0, 0),
  [1494] = {.entry = {.count = 1, .reusable = true}}, SHIFT(422),
  [1496] = {.entry = {.count = 1, .reusable = true}}, SHIFT(442),
  [1498] = {.entry = {.count = 1, .reusable = true}}, SHIFT(421),
  [1500] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_boolean, 1, 0, 0),
  [1502] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_string_option, 3, 0, 6),
  [1504] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_integer_option, 3, 0, 6),
  [1506] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_integer_option, 3, 0, 6),
  [1508] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_boolean_option, 3, 0, 6),
  [1510] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_boolean_option, 3, 0, 6),
  [1512] = {.entry = {.count = 1, .reusable = true}}, SHIFT(115),
  [1514] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_variable_option, 3, 0, 6),
  [1516] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_variable_option, 3, 0, 6),
  [1518] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_cert_option, 3, 0, 6),
  [1520] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_cert_option, 3, 0, 6),
  [1522] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_ca_certificate_option, 3, 0, 6),
  [1524] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_ca_certificate_option, 3, 0, 6),
  [1526] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_file_param, 3, 0, 0),
  [1528] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_file_param, 3, 0, 0),
  [1530] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_string, 2, 0, 0),
  [1532] = {.entry = {.count = 1, .reusable = true}}, SHIFT(393),
  [1534] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_multiline_string, 5, 0, 0),
  [1536] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_multiline_string, 5, 0, 0),
  [1538] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_oneline_hex, 2, 0, 0),
  [1540] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_oneline_hex, 2, 0, 0),
  [1542] = {.entry = {.count = 1, .reusable = true}}, SHIFT(491),
  [1544] = {.entry = {.count = 1, .reusable = false}}, SHIFT(499),
  [1546] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_multiline_string_type, 1, 0, 0),
  [1548] = {.entry = {.count = 1, .reusable = true}}, SHIFT(163),
  [1550] = {.entry = {.count = 1, .reusable = true}}, SHIFT(556),
  [1552] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_bytes, 1, 0, 0),
  [1554] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_bytes, 1, 0, 0),
  [1556] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_xml, 1, 0, 0),
  [1558] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_xml, 1, 0, 0),
  [1560] = {.entry = {.count = 1, .reusable = false}}, SHIFT(507),
  [1562] = {.entry = {.count = 1, .reusable = false}}, SHIFT(316),
  [1564] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_string_option_key, 1, 0, 0),
  [1566] = {.entry = {.count = 1, .reusable = true}}, SHIFT(113),
  [1568] = {.entry = {.count = 1, .reusable = true}}, SHIFT(438),
  [1570] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_xml_tag, 2, 0, 0),
  [1572] = {.entry = {.count = 1, .reusable = true}}, SHIFT(112),
  [1574] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_float, 2, 0, 0),
  [1576] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_float, 2, 0, 0),
  [1578] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_xml_close_tag, 3, 0, 0),
  [1580] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_array, 4, 0, 0),
  [1582] = {.entry = {.count = 1, .reusable = true}}, SHIFT(341),
  [1584] = {.entry = {.count = 1, .reusable = true}}, SHIFT(127),
  [1586] = {.entry = {.count = 1, .reusable = true}}, SHIFT(261),
  [1588] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_key_string, 1, 0, 4),
  [1590] = {.entry = {.count = 1, .reusable = true}}, SHIFT(129),
  [1592] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_multiline_string, 4, 0, 0),
  [1594] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_multiline_string, 4, 0, 0),
  [1596] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_simple_predicate, 1, 0, 7),
  [1598] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_simple_predicate, 1, 0, 7),
  [1600] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_json_hexdigit, 1, 0, 0),
  [1602] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_oneline_string, 2, 0, 0),
  [1604] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_oneline_string, 2, 0, 0),
  [1606] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_object, 4, 0, 0),
  [1608] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_xml, 2, 0, 0),
  [1610] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_xml, 2, 0, 0),
  [1612] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_query_string_params_section_repeat1, 2, 0, 0),
  [1614] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_query_string_params_section_repeat1, 2, 0, 0),
  [1616] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_status, 1, 0, 0),
  [1618] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_status, 1, 0, 0),
  [1620] = {.entry = {.count = 1, .reusable = true}}, SHIFT(580),
  [1622] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_predicate, 1, 0, 0),
  [1624] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_predicate, 1, 0, 0),
  [1626] = {.entry = {.count = 1, .reusable = true}}, SHIFT(55),
  [1628] = {.entry = {.count = 1, .reusable = false}}, SHIFT(357),
  [1630] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_predicate_func, 1, 0, 0),
  [1632] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_predicate_func, 1, 0, 0),
  [1634] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_multipart_form_data_param, 1, 0, 0),
  [1636] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_multipart_form_data_param, 1, 0, 0),
  [1638] = {.entry = {.count = 1, .reusable = true}}, SHIFT(102),
  [1640] = {.entry = {.count = 1, .reusable = true}}, SHIFT(279),
  [1642] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_oneline_file, 2, 0, 0),
  [1644] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_oneline_file, 2, 0, 0),
  [1646] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_number, 3, 0, 0),
  [1648] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_boolean, 1, 0, 0),
  [1650] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_boolean, 1, 0, 0),
  [1652] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_xml_tag, 3, 0, 0),
  [1654] = {.entry = {.count = 1, .reusable = true}}, SHIFT(322),
  [1656] = {.entry = {.count = 1, .reusable = true}}, SHIFT(503),
  [1658] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_array, 3, 0, 0),
  [1660] = {.entry = {.count = 1, .reusable = true}}, SHIFT(437),
  [1662] = {.entry = {.count = 1, .reusable = true}}, SHIFT(187),
  [1664] = {.entry = {.count = 1, .reusable = true}}, SHIFT(216),
  [1666] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_multiline_string, 3, 0, 0),
  [1668] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_multiline_string, 3, 0, 0),
  [1670] = {.entry = {.count = 1, .reusable = true}}, SHIFT(259),
  [1672] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_boolean_option_key, 1, 0, 0),
  [1674] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_oneline_string, 3, 0, 0),
  [1676] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_oneline_string, 3, 0, 0),
  [1678] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_duration_unit, 1, 0, 0),
  [1680] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_duration_unit, 1, 0, 0),
  [1682] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_integer_option_key, 1, 0, 0),
  [1684] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_string, 3, 0, 0),
  [1686] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_duration_option, 4, 0, 6),
  [1688] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_duration_option, 4, 0, 6),
  [1690] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_multiline_string, 6, 0, 0),
  [1692] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_multiline_string, 6, 0, 0),
  [1694] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_oneline_hex, 3, 0, 0),
  [1696] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_oneline_hex, 3, 0, 0),
  [1698] = {.entry = {.count = 1, .reusable = true}}, SHIFT(273),
  [1700] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_predicate, 2, 0, 0),
  [1702] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_predicate, 2, 0, 0),
  [1704] = {.entry = {.count = 1, .reusable = true}}, SHIFT(143),
  [1706] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_object, 2, 0, 0),
  [1708] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_file_value, 4, 0, 0),
  [1710] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_file_value, 4, 0, 0),
  [1712] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_equal_predicate, 2, 0, 7),
  [1714] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_equal_predicate, 2, 0, 7),
  [1716] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_variable_definition, 3, 0, 0),
  [1718] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_variable_definition, 3, 0, 0),
  [1720] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_oneline_base64, 3, 0, 0),
  [1722] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_oneline_base64, 3, 0, 0),
  [1724] = {.entry = {.count = 1, .reusable = true}}, SHIFT(294),
  [1726] = {.entry = {.count = 1, .reusable = true}}, SHIFT(293),
  [1728] = {.entry = {.count = 1, .reusable = true}}, SHIFT(254),
  [1730] = {.entry = {.count = 1, .reusable = true}}, SHIFT(289),
  [1732] = {.entry = {.count = 1, .reusable = true}}, SHIFT(288),
  [1734] = {.entry = {.count = 1, .reusable = true}}, SHIFT(321),
  [1736] = {.entry = {.count = 1, .reusable = true}}, SHIFT(408),
  [1738] = {.entry = {.count = 1, .reusable = true}}, SHIFT(410),
  [1740] = {.entry = {.count = 1, .reusable = true}}, SHIFT(263),
  [1742] = {.entry = {.count = 1, .reusable = true}}, SHIFT(333),
  [1744] = {.entry = {.count = 1, .reusable = true}}, SHIFT(257),
  [1746] = {.entry = {.count = 1, .reusable = true}}, SHIFT(335),
  [1748] = {.entry = {.count = 1, .reusable = true}}, SHIFT(295),
  [1750] = {.entry = {.count = 1, .reusable = false}}, SHIFT(539),
  [1752] = {.entry = {.count = 1, .reusable = true}},  ACCEPT_INPUT(),
  [1754] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_duration_option_key, 1, 0, 0),
  [1756] = {.entry = {.count = 1, .reusable = false}}, SHIFT(548),
  [1758] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_json_object, 3, 0, 0),
  [1760] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_include_predicate, 2, 0, 7),
  [1762] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_include_predicate, 2, 0, 7),
  [1764] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_match_predicate, 2, 0, 7),
  [1766] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_match_predicate, 2, 0, 7),
  [1768] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_contain_predicate, 2, 0, 7),
  [1770] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_contain_predicate, 2, 0, 7),
  [1772] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_oneline_file, 3, 0, 0),
  [1774] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_oneline_file, 3, 0, 0),
  [1776] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_end_with_predicate, 2, 0, 7),
  [1778] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_end_with_predicate, 2, 0, 7),
  [1780] = {.entry = {.count = 1, .reusable = false}}, SHIFT(533),
  [1782] = {.entry = {.count = 1, .reusable = true}}, SHIFT(166),
  [1784] = {.entry = {.count = 1, .reusable = true}}, SHIFT(250),
  [1786] = {.entry = {.count = 1, .reusable = true}}, SHIFT(249),
  [1788] = {.entry = {.count = 1, .reusable = true}}, SHIFT(280),
  [1790] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_option, 1, 0, 0),
  [1792] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_option, 1, 0, 0),
  [1794] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_start_with_predicate, 2, 0, 7),
  [1796] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_start_with_predicate, 2, 0, 7),
  [1798] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_not_equal_predicate, 2, 0, 0),
  [1800] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_not_equal_predicate, 2, 0, 0),
  [1802] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_not_equal_predicate, 2, 0, 7),
  [1804] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_not_equal_predicate, 2, 0, 7),
  [1806] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_equal_predicate, 2, 0, 0),
  [1808] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_equal_predicate, 2, 0, 0),
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

TS_PUBLIC const TSLanguage *tree_sitter_hurl(void) {
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
    .primary_state_ids = ts_primary_state_ids,
  };
  return &language;
}
#ifdef __cplusplus
}
#endif

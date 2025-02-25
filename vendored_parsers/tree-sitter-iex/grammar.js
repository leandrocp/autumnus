const WHITE_SPACE = /[ \f\t\v]+/;
const NEWLINE = /\r?\n/;
const ANYTHING = /[^\r\n]+/;

module.exports = grammar({
  name: "iex",

  extras: ($) => [WHITE_SPACE],

  rules: {
    source: ($) => repeat(choice($.evaluation_block, NEWLINE)),

    evaluation_block: ($) =>
      seq(
        alias($._default_prompt_line, $.prompt_line),
        repeat(alias($._cont_prompt_line, $.prompt_line)),
        optional($.result)
      ),

    _default_prompt_line: ($) =>
      seq(alias(/iex(\([^\)]+\)\d*)?>/, $.prompt), optional($.expression)),

    _cont_prompt_line: ($) =>
      seq(alias(/\.\.\.(\([^\)]+\)\d*)?>/, $.prompt), optional($.expression)),

    expression: ($) => seq(ANYTHING, NEWLINE),

    result: ($) =>
      prec.right(
        seq(sep1(token(prec(-1, ANYTHING)), NEWLINE), optional(NEWLINE))
      ),
  },
});

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

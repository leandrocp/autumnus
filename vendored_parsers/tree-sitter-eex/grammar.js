module.exports = grammar({
  name: 'eex',

  rules: {
    fragment: $ => repeat($._node),

    _node: $ => choice(
      $.text,
      $.comment,
      $.directive
    ),

    directive: $ => seq(
      choice('<%', '<%=', '<%%', '<%%='),
      prec.left(
        seq(
          optional(choice($.partial_expression, $.expression)),
          '%>',
        )
      )
    ),

    partial_expression: $ => choice(
      seq(/end[\)\]\}]*/, repeat($._code)),
      seq(repeat($._code), choice('do', '->'), optional(seq('#', repeat($._code)))),
    ),

    expression: $ => repeat1($._code),

    comment: $ => choice($._hash_comment, $._bang_comment),

    _hash_comment: $ => seq(
      '<%#',
      prec.left(
        seq(
          repeat($._code),
          '%>'
        )
      )
    ),

    _bang_comment: $ => seq(
      '<%!--',
      prec.left(
        seq(
          repeat(/[^-]+|-/),
          '--%>'
        )
      )
    ),

    text: $ => /[^<]+|</,

    _code: $ => /[^%\s]+|[%\s]/,
}})

module.exports = grammar({
  name: 'surface',

  rules: {
    fragment: $ => repeat($._node),

    _node: $ => choice(
      $.tag,
      $.component,
      $.text,
      $.expression,
      $.block,
      $.comment,
    ),

    tag: $ => choice(
      seq(
        $.start_tag,
        repeat($._node),
        $.end_tag
      ),
      $.self_closing_tag
    ),

    component: $ => choice(
      seq(
        $.start_component,
        repeat($._node),
        $.end_component
      ),
      $.self_closing_component,
      seq(
        $.start_markdown,
        $.text,
        $.end_markdown
      )
    ),

    block: $ => seq(
      $.start_block,
      repeat($._node),
      $.end_block
    ),

    start_markdown: $ => seq(
      '<',
      alias('#Markdown', $.component_name),
      repeat(
        choice(
          $.attribute, 
          $.expression,
          $.directive
        )
      ),
      '>'
    ),

    end_markdown: $ => seq(
      '</',
      alias('#Markdown', $.component_name),
      '>'
    ),

    start_tag: $ => seq(
      '<',
      $.tag_name,
      repeat(
        choice(
          $.attribute, 
          $.expression,
          $.directive
        )
      ),
      '>'
    ),

    end_tag: $ => seq(
      '</',
      $.tag_name,
      '>'
    ),

    self_closing_tag: $ => seq(
      '<',
      $.tag_name,
      repeat(
        choice(
          $.attribute, 
          $.expression,
          $.directive
        )
      ),
      '/>'
    ),

    start_component: $ => seq(
      '<',
      $.component_name,
      repeat(
        choice(
          $.attribute, 
          $.expression,
          $.directive
        )
      ),
      '>'
    ),

    end_component: $ => seq(
      '</',
      $.component_name,
      '>'
    ),

    self_closing_component: $ => seq(
      '<',
      $.component_name,
      repeat(
        choice(
          $.attribute, 
          $.expression,
          $.directive
        )
      ),
      '/>'
    ),

    expression: $ => seq(
      '{',
      optional(
        choice(
          '=',
          '...',
          '^',
        )
      ),
      $.expression_value,
      '}'
    ),

    expression_value: $ => choice(
      /[^{}]+/,
      '{}',
      seq(
        '{',
        alias($.expression_value, 'expression_value'),
        '}'
      ),
    ),

    comment: $ => choice(
      $._public_comment,
      $._private_comment,
    ),

    _public_comment: $ => seq(
      '<!--', 
      alias(
        choice(
          repeat1(/[^-]+|-/), 
          $._public_comment
        ), 
        'comment'
      ),
      '-->'
    ),

    _private_comment: $ => seq(
      '{!--', 
      alias(
        choice(
          repeat1(
            /[^-]+|-/
          ), 
          $._private_comment
        ), 
        'comment'
      ),
      '--}'
    ),

    block: $ => seq(
      $.start_block,
      repeat(
        choice(
          $.subblock,
          $._node
        )
      ),
      $.end_block
    ),

    start_block: $ => seq(
      '{#',
      $.block_name,
      optional($.expression_value),
      '}',
    ),

    block_name: $ => choice(
      'if', 
      'unless', 
      'for', 
      'case', 
    ),

    end_block: $ => seq(
      '{/', 
      $.block_name,
      '}',
    ),

    subblock: $ => seq(
      '{#',
      $.subblock_name,
      optional($.expression_value),
      '}',
    ),

    subblock_name: $ => choice(
      'else',
      'elseif',
      'match'
    ),

    attribute: $ => seq(
      $.attribute_name,
      optional(
        seq(
          '=', 
          choice(
            $.quoted_attribute_value,
            $.attribute_value,
            $.expression
          )
        )
      )
    ),

    directive: $ => seq(
      ':',
      $.directive_name,
      '=',
      choice(
        $.attribute_value,
        $.quoted_attribute_value,
        $.expression
      )
    ),

    quoted_attribute_value: $ => choice(
      seq(
        "'", 
        optional(alias(/[^']+/, $.attribute_value)), 
        "'"
      ),
      seq(
        '"', 
        optional(alias(/[^"]+/, $.attribute_value)), 
        '"'
      )
    ),

    attribute_value: $ => /[^<>{}"'=\s]+/,

    tag_name: $ => /[a-z]+[^\-<>{}!"'/=\s]*/,

    component_name: $ => /[A-Z#:]+[^\-<>{}!"'/=\s]*/,

    attribute_name: $ => /[^<>{}"'/=\s:]+/,

    directive_name: $ => choice(
      "if",
      "show",
      "let",
      "args",
      "values",
      "hook",
      "on-click",
      "on-capture-click",
      "on-blur",
      "on-focus",
      "on-change",
      "on-submit",
      "on-keydown",
      "on-keyup",
      "on-window-focus",
      "on-window-blur",
      "on-window-keydown",
      "on-window-keyup",
    ),

    text: $ => /[^<>{}\s]([^<>{}]*[^<>{}\s])?/,
}})

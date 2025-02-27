/* eslint-disable camelcase */
/* eslint-disable-next-line spaced-comment */

module.exports = grammar({
  name: 'liquid',

  word: ($) => $.identifier,

  conflicts: ($) => [
    [$.else_clause],
    [$.elsif_clause],
    [$.when_clause],
    [$.custom_unpaired_statement, $._expression],
  ],

  externals: ($) => [
    $._inline_comment_content,
    $._paired_comment_content,
    $._paired_comment_content_liq,
    $.raw_content,
    $.front_matter,

    // check if scanner is in error recovery mode
    $.error_sentinel,
  ],

  precedences: (_) => [
    [
      'unary_not',
      'binary_exp',
      'binary_times',
      'binary_plus',
      'binary_in',
      'binary_compare',
      'binary_relation',
      'clause_connective',
      'contains',
    ],
  ],

  rules: {

    program: ($) =>
      seq(
        optional($.front_matter),
        repeat($._node),
      ),


    _node: ($) =>
      choice(
        $._statement,
        $.template_content,
        $.comment,
      ),

    template_content: (_) =>
      choice(
        /[^{]+|\{[^{%]/,
        '{%%',
        '{{{',
      ),

    _statement: ($) =>
      choice(
        $._tagged_unpaired_statement,
        $._tagged_paired_statment,
        $._output_statement,
      ),

    liquid_tag: ($) =>
      seq(
        'liquid',
        repeat(
          choice(
            $._liquid_node,
            alias($.comment_liq, $.comment),
          ),
        ),
      ),

    _liquid_node: ($) =>
      seq(
        choice(
          $._expression,
          $._untagged_unpaired_statement,
          $._untagged_paired_statement,
        ),
        /(\r\n|\r|\n)/,
      ),

    _tagged_unpaired_statement: ($) =>
      tag(
        choice(
          $._untagged_unpaired_statement,
          $.liquid_tag,
        ),
      ),

    _output_statement: ($) =>
      output($._expression),

    _untagged_unpaired_statement: ($) =>
      choice(
        $.assignment_statement,
        $.render_statement,
        $.include_statement,
        $.section_statement,
        $.sections_statement,
        $.echo_statement,
        $.increment_statement,
        $.decrement_statement,
        $.layout_statement,
        $.cycle_statement,
        $.break_statement,
        $.continue_statement,
        $.custom_unpaired_statement,
      ),

    _tagged_paired_statment: ($) =>
      choice(
        $.if_statement,
        $.unless_statement,
        $.case_statement,
        $.for_loop_statement,
        $.capture_statement,
        $.tablerow_statement,
        $.form_statement,
        $.paginate_statement,
        $.schema_statement,
        $.raw_statement,
        $.style_statement,
        $.javascript_statement,
      ),

    _untagged_paired_statement: ($) =>
      choice(
        alias($._if_liq, $.if_statement),
        alias($._unless_liq, $.unless_statement),
        alias($._case_liq, $.case_statement),
        alias($._for_loop_liq, $.for_loop_statement),
        alias($._capture_liq, $.capture_statement),
        alias($._tablerow_liq, $.tablerow_statement),
        alias($._form_liq, $.form_statement),
        alias($._paginate_liq, $.paginate_statement),
      ),

    _expression: ($) =>
      choice(
        $._literal,
        $.filter,
        $.identifier,
        $.predicate,
        $.access,
        output($._expression),
      ),


    // //////////////
    // Primitives //
    // //////////////

    identifier: (_) => /([a-zA-Z][0-9a-zA-Z_\?-]*)/,

    _literal: ($) => choice($.string, $.number, $.boolean),

    string: (_) =>
      choice(
        seq('\'', /[^']*/, '\''),
        seq('"', /[^"]*/, '"'),
      ),

    number: (_) => /-?\d*\.?\d+/,

    boolean: (_) => choice('true', 'false'),

    predicate: ($) =>
      choice(
        ...[
          ['+', 'binary_plus'],
          ['-', 'binary_plus'],
          ['*', 'binary_times'],
          ['/', 'binary_times'],
          ['%', 'binary_times'],
          ['^', 'binary_exp'],
          ['==', 'binary_relation'],
          ['<', 'binary_relation'],
          ['<=', 'binary_relation'],
          ['!=', 'binary_relation'],
          ['>=', 'binary_relation'],
          ['>', 'binary_relation'],
          ['and', 'clause_connective'],
          ['or', 'clause_connective'],
          ['contains', 'contains'],
        ].map(([operator, precedence]) =>
          prec.left(
            precedence,
            seq(
              field('left', $._expression),
              field('operator', operator),
              field('right', $._expression),
            ),
          ),
        ),
      ),


    // ///////////////////////
    // Unpaired Statements //
    // ///////////////////////

    break_statement: (_) => 'break',

    continue_statement: (_) => 'continue',

    echo_statement: ($) => seq('echo', $._expression),

    section_statement: ($) => seq('section', $.string),

    sections_statement: ($) => seq('sections', $.string),

    increment_statement: ($) => seq('increment', $.identifier),

    decrement_statement: ($) => seq('decrement', $.identifier),

    layout_statement: ($) => seq('layout', choice($.string, 'none')),

    custom_unpaired_statement: ($) =>
      seq(
        alias($.identifier, 'custom_keyword'),
        repeat($._expression),
      ),

    assignment_statement: ($) =>
      seq(
        'assign',
        field('variable_name', $.identifier),
        '=',
        field('value', $._expression),
      ),

    cycle_statement: ($) =>
      seq(
        'cycle',
        optional(
          field('group_name', seq($.string, ':')),
        ),
        field(
          'group_item',
          seq(
            choice($.number, $.string, $.access, $.identifier),
            repeat(
              seq(',', choice($.number, $.string, $.access, $.identifier)),
            ),
          ),
        ),
      ),

    include_statement: ($) =>
      seq(
        choice(
          'include',
          'include_relative',
        ),
        choice(
          $.string,
          output($._expression),
          alias(
            // match any sequence of non-whitespace charaters that does not contain "{{" or "{%"
            /(\{[^{%\s][^{\s]*|[^{\s]+)(?:\{[^{%\s][^{\s]*)*/,
            $.string,
          ),
        ),
        repeat(
          $._include_param,
        ),
      ),

    _include_param: ($) =>
      seq(
        $.identifier,
        token.immediate('='),
        $._expression,
      ),

    render_statement: ($) =>
      seq(
        'render',
        field('file', $.string),
        optional(
          choice(
            field('arguments',
              seq(',', $.argument_list),
            ),
            field(
              'iteration',
              seq('for', $._render_param),
            ),
            field('with',
              seq('with', $._render_param),
            ),
          ),
        ),
      ),

    _render_param: ($) =>
      seq(
        $.identifier,
        optional(
          seq(
            'as',
            field('item', $.identifier),
          ),
        ),
      ),

    filter: ($) =>
      seq(
        field('body', $._expression),
        '|',
        field('name', $.identifier),
        optional(seq(':', $.argument_list)),
      ),

    access: ($) =>
      seq(
        field('receiver', choice($.access, $.identifier)),
        choice(
          seq(
            '.',
            field('property', $.identifier),
          ),
          seq(
            '[',
            field('property', choice($.number, $.string)),
            ']',
          ),
        ),
      ),

    argument_list: ($) =>
      sep1(
        choice($._literal, $.identifier, $.access, $.argument),
        ',',
      ),

    argument: ($) =>
      seq(
        field('key', $.identifier),
        ':',
        field('value', choice($._literal, $.identifier, $.access)),
      ),

    range: ($) =>
      seq(
        '(',
        field('start', choice($.identifier, $.access, $.number)),
        '..',
        field('end', choice($.identifier, $.access, $.number)),
        ')',
      ),


    // /////////////////////
    // Paired Statements //
    // /////////////////////

    // Because paired statements can appear in both tagged and untagged forms
    // (inside vs. outside a liquid tag), we abstract their rules to constructors
    // which allow for a flexible internal representations of sub-rules and tagging.

    // tagged
    if_statement: ($) => paired($).tagged._if,

    elsif_clause: ($) => paired($).tagged._elsif,

    else_clause: ($) => paired($).tagged._else,

    for_loop_statement: ($) => paired($).tagged._for_loop,

    case_statement: ($) => paired($).tagged._case,

    when_clause: ($) => paired($).tagged._when,

    unless_statement: ($) => paired($).tagged._unless,

    capture_statement: ($) => paired($).tagged._capture,

    form_statement: ($) => paired($).tagged._form,

    tablerow_statement: ($) => paired($).tagged._tablerow,

    paginate_statement: ($) => paired($).tagged._paginate,

    // untagged
    _if_liq: ($) => paired($).untagged._if,

    _elsif_liq: ($) => paired($).untagged._elsif,

    _else_liq: ($) => paired($).untagged._else,

    _for_loop_liq: ($) => paired($).untagged._for_loop,

    _case_liq: ($) => paired($).untagged._case,

    _when_liq: ($) => paired($).untagged._when,

    _unless_liq: ($) => paired($).untagged._unless,

    _capture_liq: ($) => paired($).untagged._capture,

    _form_liq: ($) => paired($).untagged._form,

    _tablerow_liq: ($) => paired($).untagged._tablerow,

    _paginate_liq: ($) => paired($).untagged._paginate,


    // alias untagged clauses
    _else_aliased: ($) => alias($._else_liq, $.else_clause),

    _elsif_aliased: ($) => alias($._elsif_liq, $.elsif_clause),

    _when_aliased: ($) => alias($._when_liq, $.when_clause),


    _iterator: ($) =>
      prec.left(
        1,
        seq(
          field(
            'iterator', choice($.identifier, $.access, $.range),
          ),
          optional(
            field('modifier', choice($.argument_list, $.identifier)),
          ),
        ),
      ),

    _page_iterator: ($) =>
      prec.left(
        1,
        seq(
          field(
            'iterator', choice($.identifier, $.access, $.number),
          ),
          optional(
            field(
              'modifier',
              seq(',', choice($.argument_list, $.identifier)),
            ),
          ),
        ),
      ),

    schema_statement: ($) =>
      seq(
        tag('schema'),
        repeat(alias($.template_content, $.json_content)),
        tag('endschema'),
      ),

    style_statement: ($) =>
      seq(
        tag('style'),
        // this is a $._node but with template_content aliased for highlight purposes
        repeat(
          choice(
            $._statement,
            alias($.template_content, $.style_content),
            $.comment,
          ),
        ),
        tag('endstyle'),
      ),

    javascript_statement: ($) =>
      seq(
        tag('javascript'),
        repeat(
          choice(
            alias($.template_content, $.js_content),
            $.comment,
          ),
        ),
        tag('endjavascript'),
      ),

    raw_statement: ($) =>
      seq(
        tag('raw'),
        $.raw_content,
        optional($.raw_statement),
        tag('endraw'),
      ),

    comment: ($) =>
      choice($._inline_comment, $._paired_comment),

    comment_liq: ($) =>
      choice(
        $._inline_comment_content,
        $._paired_comment_liq,
      ),

    _inline_comment: ($) =>
      tag(repeat1($._inline_comment_content)),

    _paired_comment: ($) =>
      seq(
        concealed_tag('comment'),
        $._paired_comment_content,
        optional($._paired_comment),
        concealed_tag('endcomment'),
      ),

    _paired_comment_liq: ($) =>
      seq(
        'comment',
        $._paired_comment_content_liq,
        optional($._paired_comment_liq),
        'endcomment',
      ),
  },
});

function seq_or_one(...args) {
  if (args.length === 1) {
    return args[0];
  } else {
    return seq(...args);
  }
};

function paired($) {
  return {
    tagged: statements($, {
      node: $._node,
      else: $.else_clause,
      elsif: $.elsif_clause,
      when: $.when_clause,
      wrapper: tag,
    }),

    untagged: statements($, {
      node: $._liquid_node,
      else: $._else_aliased,
      elsif: $._elsif_aliased,
      when: $._when_aliased,
      wrapper: seq_or_one,
    }),
  };
}

function statements($, rules) {
  return {

    _if: seq(
      rules.wrapper(
        'if',
        field('condition', $._expression),
      ),

      field('consequence', alias(repeat(rules.node), $.block)),
      repeat(field('alternative', rules.elsif)),
      optional(field('alternative', rules.else)),

      prec.right(
        rules.wrapper('endif'),
      ),
    ),

    _elsif: prec.dynamic(
      1,
      seq(
        rules.wrapper('elsif', field('condition', $._expression)),
        alias(repeat(rules.node), $.block),
      ),
    ),

    _else: prec.dynamic(
      2,
      seq(
        rules.wrapper('else'),
        alias(repeat(rules.node), $.block),
      ),
    ),

    _for_loop: seq(
      rules.wrapper(
        'for',
        field('item', $.identifier),
        'in',
        $._iterator,
      ),

      field('body', alias(repeat(rules.node), $.block)),

      optional(field('alternative', rules.else)),

      prec.right(
        rules.wrapper('endfor'),
      ),
    ),

    _unless: seq(
      rules.wrapper(
        'unless', field('condition', $._expression),
      ),

      field('consequence', alias(repeat(rules.node), $.block)),
      repeat(field('alternative', rules.elsif)),
      optional(field('alternative', rules.else)),

      prec.right(
        rules.wrapper('endunless'),
      ),
    ),

    _when: prec.dynamic(
      1,
      seq(
        rules.wrapper(
          'when',
          field('condition', choice( $.predicate, $.argument_list)),
        ),

        field('consequence', alias( repeat(rules.node), $.block)),
      ),
    ),

    _case: seq(
      rules.wrapper(
        'case', field('receiver', choice($.identifier, $.access)),
      ),

      field('conditions', alias(repeat(rules.when), $.block)),
      optional(field('alternative', rules.else)),

      prec.right(
        rules.wrapper('endcase'),
      ),
    ),

    _capture: seq(
      rules.wrapper(
        'capture', field('variable', $.identifier),
      ),

      field('value', alias(repeat(rules.node), $.block)),

      prec.right(
        rules.wrapper('endcapture'),
      ),
    ),

    _tablerow: seq(
      rules.wrapper(
        'tablerow',
        field('item', $.identifier),
        'in',
        $._iterator,
      ),

      field('body', alias(repeat(rules.node), $.block)),

      prec.right(
        rules.wrapper('endtablerow'),
      ),
    ),

    _paginate: seq(
      rules.wrapper(
        'paginate',
        field('item', choice($.identifier, $.access)),
        'by',
        $._page_iterator,
      ),

      field('body', alias(repeat(rules.node), $.block)),

      prec.right(
        rules.wrapper('endpaginate'),
      ),
    ),

    _form: seq(
      rules.wrapper(
        'form',
        field('type', choice($.string, $.identifier, $.access)),
        optional(
          field(
            'parameters',
            seq(',', $.argument_list,
            ),
          ),
        ),
      ),

      repeat(rules.node),

      rules.wrapper('endform'),
    ),
  };
}


function tag(...rules) {
  return seq(
    choice('{%', '{%-'),
    ...rules,
    choice('%}', '-%}'),
  );
}

function output(...rules) {
  return seq(
    choice('{{', '{{-'),
    ...rules,
    choice('}}', '-}}'),
  );
}

function concealed_tag(...rules) {
  return seq(
    choice(
      alias('{%', ''),
      alias('{%-', ''),
    ),
    ...rules,
    choice(
      alias('%}', ''),
      alias('-%}', ''),
    ),
  );
}

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}


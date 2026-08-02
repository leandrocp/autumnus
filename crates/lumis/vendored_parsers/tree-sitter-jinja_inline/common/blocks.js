function defineBlocks(directive, rootNode) {
  return {
    if_block: $ => seq(
      directive($, $.if_statement),
      repeat(rootNode($)),
      repeat($.elif_block),
      optional($.else_block),
      directive($, $.endif_statement)
    ),
    elif_block: $ => seq(
      directive($, $.elif_statement),
      repeat(rootNode($))
    ),
    else_block: $ => seq(
      directive($, $.else_statement),
      repeat(rootNode($))
    ),
    for_block: $ => seq(
      directive($, $.for_statement),
      repeat(rootNode($)),
      optional($.else_block),
      directive($, $.endfor_statement)
    ),
    block_block: $ => seq(
      directive($, $.block_statement),
      repeat(rootNode($)),
      directive($, $.endblock_statement)
    ),
    with_block: $ => seq(
      directive($, $.with_statement),
      repeat(rootNode($)),
      directive($, $.endwith_statement)
    ),
    filter_block: $ => seq(
      directive($, $.filter_statement),
      repeat(rootNode($)),
      directive($, $.endfilter_statement)
    ),
    macro_block: $ => seq(
      directive($, $.macro_statement),
      repeat(rootNode($)),
      directive($, $.endmacro_statement)
    ),
    call_block: $ => seq(
      directive($, $.call_statement),
      repeat(rootNode($)),
      directive($, $.endcall_statement)
    ),
    set_block: $ => seq(
      directive($, $.set_block_statement),
      repeat(rootNode($)),
      directive($, $.endset_statement)
    ),
    trans_block: $ => seq(
      directive($, $.trans_statement),
      repeat(rootNode($)),
      optional($.pluralize_block),
      directive($, $.endtrans_statement)
    ),
    pluralize_block: $ => seq(
      directive($, $.pluralize_statement),
      repeat(rootNode($))
    ),
    autoescape_block: $ => seq(
      directive($, $.autoescape_statement),
      repeat(rootNode($)),
      directive($, $.endautoescape_statement)
    ),
  };
}
module.exports = { defineBlocks };

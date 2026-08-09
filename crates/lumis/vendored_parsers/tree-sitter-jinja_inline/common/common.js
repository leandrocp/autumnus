/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @return {SeqRule}
 *
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @return {ChoiceRule}
 *
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}

/**
 * @param {Rule} rule
 * @param {string} sep
 * @return {SeqRule}
 */
function anySep1(rule, sep) {
  return seq(rule, repeat(seq(sep, rule)));
}

/**
 * @param {Rule} rule
 * @param {string} sep
 * @return {ChoiceRule}
 */
function anySep(rule, sep) {
  return optional(anySep1(rule, sep));
}

exports.commaSep1 = commaSep1;
exports.commaSep = commaSep;
exports.anySep1 = anySep1;
exports.anySep = anySep;

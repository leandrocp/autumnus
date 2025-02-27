try {
  module.exports = require('../../build/Release/tree_sitter_csv_binding');
} catch (error1) {
  if (error1.code !== 'MODULE_NOT_FOUND') {
    throw error1;
  }
  try {
    module.exports = require('../../build/Debug/tree_sitter_csv_binding');
  } catch (error2) {
    if (error2.code !== 'MODULE_NOT_FOUND') {
      throw error2;
    }
    throw error1;
  }
}

try {
  module.exports.csv.nodeTypeInfo = require('../../csv/src/node-types.json');
  module.exports.tsv.nodeTypeInfo = require('../../tsv/src/node-types.json');
} catch (_) {}

# tree-sitter-csv

[![Build Status](https://github.com/amaanq/tree-sitter-csv/actions/workflows/ci.yml/badge.svg)](https://github.com/amaanq/tree-sitter-csv/actions/workflows/ci.yml)
[![Discord](https://img.shields.io/discord/1063097320771698699?logo=discord)](https://discord.gg/w7nTvsVJhm)

CSV, PSV, and TSV grammars for [tree-sitter](https://github.com/tree-sitter/tree-sitter).

Because CSV, PSV, and TSV are actually three different dialects, this module defines
two grammars. Require them as follows:

```js
require("tree-sitter-csv").csv; // CSV grammar
require("tree-sitter-csv").psv; // PSV grammar
require("tree-sitter-csv").tsv; // TSV grammar
```

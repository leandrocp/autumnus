{
  "targets": [
    {
      "target_name": "tree_sitter_csv_binding",
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "csv/src"
      ],
      "sources": [
        "bindings/node/binding.cc",
        "csv/src/parser.c",
        "psv/src/parser.c",
        "tsv/src/parser.c",
      ],
      "cflags_c": [
        "-std=c99",
      ]
    }
  ]
}

generate:
	./node_modules/tree-sitter-cli/cli.js generate

test: generate
	nvim --headless -c "luafile ./lua/tests_to_corpus.lua" -c "qa!"
	./node_modules/tree-sitter-cli/cli.js test

build_parser: generate
	cc -o ./build/parser.so -I./src src/parser.c -shared -Os -lstdc++ -fPIC

wasm: build_parser
	./node_modules/tree-sitter-cli/cli.js build-wasm

web: wasm
	./node_modules/tree-sitter-cli/cli.js web-ui

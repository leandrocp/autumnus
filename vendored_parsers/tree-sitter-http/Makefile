.PHONY: test parse

build:
	$(CC) -fPIC -c src/parser.c -o parser.o $(CFLAGS)
	$(CC) -shared -o parser/http.so *.o

test:
	@tree-sitter generate
	@tree-sitter test

parse:
	@tree-sitter generate
	@tree-sitter parse testfile

# HTTP tree-sitter parser

HTTP grammar for [tree-sitter](https://github.com/tree-sitter/tree-sitter)


# How to contribute

You can get a development environment with
`nix develop`
then run:
```
npm install
make build
```

Neovim loads parser in runtimepath order so to test the generated grammar,
prepend it to rtp with `set rtp^=/path/to/tree-sitter-http`.

# Tasks

- [x] variable
- [x] comment
- [x] request
    - [x] method
    - [x] target_url
        - [x] scheme
        - [x] authority
        - [x] host
        - [x] path /
        - [x] query ?
        - [x] fragment #
    - [x] http-version
    - [x] params
    - [x] response
    - [x] header
    - [x] body
        - [x] json
        - [x] xml
        - [x] file
        - [x] graphql
- [ ] cli

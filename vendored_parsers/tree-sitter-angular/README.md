<h1 align="center"> ✨ Tree Sitter Grammar for Angular ✨ </h1>

<h4 align="center">
    <img alt="GitHub Workflow Status (with event)" src="https://img.shields.io/github/actions/workflow/status/dlvandenberg/tree-sitter-angular/ci.yml">
    <img alt="Angular" src="https://img.shields.io/badge/Angular-v18.1-AF21EA?logo=angular&logoColor=F51365">
    <img alt="Tree-sitter CLI version" src="https://img.shields.io/github/package-json/dependency-version/dlvandenberg/tree-sitter-angular/dev/tree-sitter-cli/main">
</h4>

## Specification

This parser is a complete rewrite of steelsojka's [tree-sitter-angular](https://github.com/steelsojka/tree-sitter-angular/tree/main).
This parser extends [tree-sitter-html](https://github.com/tree-sitter/tree-sitter-html) because the new _Control Flow_ syntax is not valid HTML code.

## Supported Features

- [x] Structural Directives
- [x] Property binding
- [x] Event binding
- [x] String interpolation
- [x] If-statements (v17)
- [x] For-statements (v17)
- [x] Switch-statements (v17)
- [x] Defer-statements (v17)
- [x] Let-expression (v18.1)
- [x] ICU message format

## Requirements

- [Neovim](https://neovim.io/) nightly recommended (as it includes the filetype detection of Angular Templates)

## Filetype

In the nightly neovim built (or release 0.11.x), the filetype detection for Angular templates is included. It will detect Angular HTML templates, based on it's contents, and set the filetype to `htmlangular`.

### Older versions

If you are using an older version, you must set the filetype yourself.

E.g. mark the file as `htmlangular` if it matches the pattern `*.component.html`:

Create a `plugin` in `~/.config/nvim/plugin/angular.lua` with the following:

```lua
vim.filetype.add({
  pattern = {
    [".*%.component%.html"] = "htmlangular", -- Sets the filetype to `htmlangular` if it matches the pattern
  },
})
```

Next, create a `ftplugin` for `htmlangular` that does the following:

```vim
runtime! ftplugin/html.vim!
```

Or, in lua:

```lua
vim.cmd('runtime! ftplugin/html.vim!')
```

## LSP's or other plugins

You may need to include this new filetype (`htmlangular`) for other plugins, like [LSP](https://github.com/neovim/nvim-lspconfig/blob/master/doc/server_configurations.md#angularls) for example:

```lua
require('lspconfig').angularls.setup {
  filetypes = { 'typescript', 'html', 'typescriptreact', 'typescript.tsx', 'htmlangular' }
}
```

## Issues

If you experience any issues, please feel free to open an issue with the code that's causing problems.

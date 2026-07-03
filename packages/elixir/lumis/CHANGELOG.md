## [0.6.1](https://github.com/leandrocp/lumis/compare/hex-lumis/v0.6.0...hex-lumis/v0.6.1) (2026-07-03)


### Bug Fixes

- preserve curly braces - [#982](https://github.com/leandrocp/lumis/pull/982)
- themes issues - [#977](https://github.com/leandrocp/lumis/pull/977) by @Fosox

## [0.6.0](https://github.com/leandrocp/lumis/compare/hex-lumis/v0.5.0...hex-lumis/v0.6.0) (2026-06-12)

### ⚠ BREAKING CHANGES

- adopt the `l-` prefix on token class [#952](https://github.com/leandrocp/lumis/pull/952)

### Bug Fixes

- use vim.pack to update themes - [#751](https://github.com/leandrocp/lumis/pull/751)
- fix build for glimmer and fortran

### Features

- rainbow brackets - [#949](https://github.com/leandrocp/lumis/pull/949)
- css stylesheet builder - [#951](https://github.com/leandrocp/lumis/pull/951)

## [0.5.0](https://github.com/leandrocp/lumis/compare/hex-lumis/v0.4.0...hex-lumis/v0.5.0) (2026-04-22)

### Bug Fixes

- remove stale gleam query node name causing `QueryError` - [#718](https://github.com/leandrocp/lumis/pull/718) by @stefanobaghino

### Features

- terminal: add bg color and width options - [#713](https://github.com/leandrocp/lumis/pull/713) by @Gazler
- terminal: add background theme option - [#723](https://github.com/leandrocp/lumis/pull/723)

## [0.4.0](https://github.com/leandrocp/lumis/compare/hex-lumis/v0.3.0...hex-lumis/v0.4.0) (2026-04-18)

### Bug Fixes

- BREAKING: rename `formatter` -> `formatters` - [#678](https://github.com/leandrocp/lumis/pull/678)

### Documentation

- elixir examples
- move runnable examples into package dirs - [#709](https://github.com/leandrocp/lumis/pull/709)

### Features

- align `lang` -> `language` names - [#591](https://github.com/leandrocp/lumis/pull/591)

## [0.3.0](https://github.com/leandrocp/lumis/compare/elixir@v0.2.0...elixir@v0.3.0) (2026-04-05)

### Features

* align formatters to accept `:language`  ([#572](https://github.com/leandrocp/lumis/issues/572)) ([0c6e569](https://github.com/leandrocp/lumis/commit/0c6e569fa4918a2962a61cea47715e6f0b762ec2))

### Code Refactoring

* improve formatter internals ([#570](https://github.com/leandrocp/lumis/issues/570)) ([c811832](https://github.com/leandrocp/lumis/commit/c811832c808c50f0ab6603c70d5403813e06476d))


### Code Refactoring

* improve formatter internals ([#570](https://github.com/leandrocp/lumis/issues/570)) ([c811832](https://github.com/leandrocp/lumis/commit/c811832c808c50f0ab6603c70d5403813e06476d))

## [0.2.0](https://github.com/leandrocp/lumis/compare/elixir@v0.1.2...elixir@v0.2.0) (2026-04-02)


### ⚠ BREAKING CHANGES

* bump tree-sitter 0.26 ([#521](https://github.com/leandrocp/lumis/issues/521))

### Features

* add 135 themes ([#483](https://github.com/leandrocp/lumis/issues/483)) ([26b9d84](https://github.com/leandrocp/lumis/commit/26b9d84f096e5d9dd5064cf816f794fd578f5adf))
* add 42 new languages ([#467](https://github.com/leandrocp/lumis/issues/467)) ([9bacc46](https://github.com/leandrocp/lumis/commit/9bacc46552597f0b7ee5c3b8adde3bfc321a2097))
* add bbcode_scoped formatter to Elixir and Javascript ([#478](https://github.com/leandrocp/lumis/issues/478)) ([1a34357](https://github.com/leandrocp/lumis/commit/1a343574b0239b5100d6b170124b586b0aabecfe))


### Bug Fixes

* include unnamed children in range ([#430](https://github.com/leandrocp/lumis/issues/430)) ([782bfaa](https://github.com/leandrocp/lumis/commit/782bfaaf4ac86fd287541fcd1307157060846ffc))
* isolate elixir nif from rust release workspace ([#528](https://github.com/leandrocp/lumis/issues/528)) ([da1c6d1](https://github.com/leandrocp/lumis/commit/da1c6d127850ebc33697a502577e0b6c968e9825))


### Miscellaneous Chores

* bump tree-sitter 0.26 ([#521](https://github.com/leandrocp/lumis/issues/521)) ([ad9a567](https://github.com/leandrocp/lumis/commit/ad9a5679e94032e153eb7d997f2c1577479ec812))

## 0.1.2 - 2026-03-04

### Fixed
- Use published `lumis` crate

## 0.1.1 - 2026-02-19

### Changed
- Add language nushell (started by @c4lliope)
- Rename CSS class from `athl` to `lumis` for consistency with the project name
- Rename CSS class from `athl-themes` to `lumis-themes` for multi-theme formatter
- Change default CSS variable prefix from `--athl` to `--lumis`

## 0.1.0 - 2026-01-27

First release of `lumis`, a renamed version of the `autumn` package.

### Migration from autumn

Update your `mix.exs`:

```elixir
# Before
{:autumn, "~> 0.6"}

# After
{:lumis, "~> 0.1"}
```

Update your imports:

```elixir
# Before
alias Autumn
alias Autumn.Theme

# After
alias Lumis
alias Lumis.Theme
```

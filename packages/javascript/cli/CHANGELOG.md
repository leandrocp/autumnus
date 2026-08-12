## Next release migration

Why: commands now use one vocabulary.

1. Replace `lumis parsers fetch <names>` with `lumis languages cache <names>`.
2. Replace `lumis parsers update <names>` with `lumis languages cache --force <names>`.
3. Use `-H` for highlighted lines and `-h` for help.
4. Use `-V` for version and `-v` for verbose output.
5. Remove flags rejected by `lumis formatters show <name>`.

Why: `--all` now means every language.

1. Name languages explicitly to refresh only selected cache entries.

Why: HTML output now matches.

1. Regenerate exact HTML snapshots.

## [0.5.0](https://github.com/leandrocp/lumis/compare/npm-cli/v0.4.1...npm-cli/v0.5.0) (2026-07-23)


### Bug Fixes

- prevent query capture list pool overflow on large inputs - [#1028](https://github.com/leandrocp/lumis/pull/1028) by @ericmj


### Features

- add mdx language reusing the markdown parser - [#1012](https://github.com/leandrocp/lumis/pull/1012) by @benswift
- add dump commands - [#1087](https://github.com/leandrocp/lumis/pull/1087)
- Lumis JavaScript native (Rust bindings) - [#1083](https://github.com/leandrocp/lumis/pull/1083)

## [0.4.1](https://github.com/leandrocp/lumis/compare/npm-cli/v0.4.0...npm-cli/v0.4.1) (2026-07-11)

### Features

- config file [#998](https://github.com/leandrocp/lumis/pull/998)
- auto theme [#998](https://github.com/leandrocp/lumis/pull/998)

## [0.4.0](https://github.com/leandrocp/lumis/tree/npm-cli/v0.4.0) (2026-07-10)


### Features

- introduce npm cli - [#997](https://github.com/leandrocp/lumis/pull/997)

# Changelog

All notable changes to this package will be documented in this file.

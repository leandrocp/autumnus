# Changelog

## 0.0.1 - Unreleased

Initial release. Shared core logic for Lumis packages.

### Added

- Language detection from file paths, shebangs, and emacs mode headers
- Built-in Neovim themes with `get` and `available_themes` APIs
- Custom theme loading from JSON files via `from_file`
- Highlight event types for formatter consumption
- Formatters: HTML inline, HTML linked, HTML multi-themes, and terminal (ANSI)
- Language enum with 60+ supported languages and glob patterns

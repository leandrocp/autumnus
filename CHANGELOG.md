# Changelog

## [0.1.7] - 2025-03-09

### Fixed
- Guess uppercase language names

### Changed
- Make language optional and move to `Options`
- Rename `lang_or_path` to `lang_or_file`
- Rename option `include_highlight` to `include_highlights`
- Change types `&str` to `String` in `Options`
- Remove options `italic` and `include_highlights` from `HtmlLinked`

## [0.1.6] - 2025-03-08

### Fixed
- Some theme colors and CSS

## [0.1.5] - 2025-03-07

### Added
- `languages::available_languages()`: Get a map of all supported languages with their details
- `themes::available_themes()`: Get a list of all available themes

### Changed
- Moved formatter-specific options (pre_class, italic, include_highlight) from `Options` to their respective formatter structs (`HtmlInline`, `HtmlLinked`, `Terminal`)

## [0.1.4] - 2025-03-06

### Fixed
- Build theme path relative to CARGO_MANIFEST_DIR
- Documentation: exclude dev binary from docs
- Documentation: remove unnecessary empty default features

## [0.1.3] - 2025-03-05

### Fixed
- Docs: generate link to def

## [0.1.2] - 2025-03-05

### Fixed
- doc_auto_cfg

## [0.1.1] - 2025-03-05

### Fixed
- Docs config

## [0.1.0] - 2025-03-05

### Added
- Initial release with core functionality

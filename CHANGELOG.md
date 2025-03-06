# Changelog

## Unreleased

### Added
- `available_languages()`: Get a map of all supported languages with their details
- `available_themes()`: Get a map of all available themes with their details

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

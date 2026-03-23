# Changelog

## 0.2.0 - 2026-03-23

### Breaking Changes

- **`highlight_iter` callback signature changed**: the callback now receives `(text, language, range, scope, style)` instead of `(text, range, scope, style)`. The new `language` parameter reports the active language (useful for language injections, e.g. JavaScript inside HTML `<script>` tags).
- **`span_inline` / `span_inline_attrs` parameter order changed**: `language` now comes before `scope` — `span_inline(text, language, scope, ...)` instead of `span_inline(text, scope, language, ...)`.

### Migration

Update `highlight_iter` callbacks:

```rust
// Before
highlight_iter(source, language, theme, |text, range, scope, style| { ... })

// After
highlight_iter(source, language, theme, |text, _language, range, scope, style| { ... })
```

Update `span_inline` calls:

```rust
// Before
span_inline(text, scope, Some(language), theme, false, false)

// After
span_inline(text, Some(language), scope, theme, false, false)
```

## 0.1.3 - 2026-02-20

### Changed
- Add language wat (@andreaTP)

## 0.1.2 - 2026-02-18

### Changed
- Add language nushell (started by @c4lliope)
- Rename CSS class from `athl` to `lumis` for consistency with the project name
- Rename CSS class from `athl-themes` to `lumis-themes` for multi-theme formatter
- Change default CSS variable prefix from `--athl` to `--lumis`

## 0.1.1 - 2026-01-27

### Removed
- Remove `elixir-nif` feature. The Elixir/Rustler bridge code is now maintained in the Elixir package itself.

## 0.1.0 - 2026-01-23

First release of `lumis`, a renamed and restructured version of `autumnus`.

### Migration from autumnus

Update your `Cargo.toml`:

```toml
# Before
[dependencies]
autumnus = "0.8"

# After
[dependencies]
lumis = "0.1"
```

Update your imports:

```rust
// Before
use autumnus::*;

// After
use lumis::*;
```

The API remains the same as `autumnus` v0.8.0 - only the crate and binary names have changed.

A deprecated `autumnus` v0.9.0 crate re-exports all types from `lumis` with deprecation warnings to facilitate migration.

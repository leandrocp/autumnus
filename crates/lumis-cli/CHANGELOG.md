# Changelog

## Unreleased

### Breaking Changes

- **Commands restructured into groups**: commands are now organized by category instead of flat top-level names.

| Before | After |
|---|---|
| `lumis list-languages` | `lumis languages list` |
| `lumis list-themes` | `lumis themes list` |
| `lumis gen-theme` | `lumis themes generate` |
| `lumis fetch-parsers` | `lumis parsers fetch` |
| `lumis update-parsers` | `lumis parsers update` |
| `lumis highlight-source` | removed (use stdin) |

- **`highlight-source` merged into `highlight`**: pipe source via stdin instead of passing it as a positional argument.

```sh
# Before
lumis highlight-source -l rust 'fn main() {}'

# After
echo 'fn main() {}' | lumis highlight -l rust
```

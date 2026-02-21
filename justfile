#!/usr/bin/env just --justfile

# List available commands
default:
    @just --list

# Run all tests (Rust crates and Elixir)
test:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Running Rust tests..."
    cargo test --all-features
    echo ""
    echo "Running Elixir tests..."
    cd packages/elixir/lumis && LUMIS_BUILD=1 mix test

# Run all linters (Rust and Elixir)
lint:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Running Rust clippy..."
    cargo clippy --all-features -- -D warnings
    echo ""
    echo "Running Rust fmt check..."
    cargo fmt --all -- --check
    echo ""
    echo "Running Elixir format check..."
    (cd packages/elixir/lumis && mix format --check-formatted)
    echo ""
    echo "Running Elixir compile warnings..."
    (cd packages/elixir/lumis && LUMIS_BUILD=1 mix compile --warnings-as-errors)

# Start local dev server
server:
    cargo run -p lumis-sh

# Generate CSS files for HTML linked formatter
css-gen:
    lua scripts/themes.lua gen-css

# Copy CSS files to crates and packages
css-sync:
    lua scripts/themes.lua sync-css

# Generate documentation for both Rust and Elixir
docs-gen:
    #!/usr/bin/env bash
    set -euo pipefail
    cargo doc --all-features --no-deps
    (cd packages/elixir/lumis && LUMIS_BUILD=1 mix docs)

# Generate LANGUAGES.md from Cargo.toml metadata
docs-gen-languages:
    lua scripts/langs.lua gen-languages

# Generate THEMES.md from themes definition
docs-gen-themes:
    lua scripts/themes.lua gen-themes

# Extract highlight scopes from query files
langs-extract-scopes:
    #!/usr/bin/env bash
    set -euo pipefail
    find crates/lumis/queries -type f -name "*.scm" -exec grep -oh '@[^_ ][^ ]*' {} \; 2>/dev/null | sed 's/^@//; s/[^a-zA-Z0-9_.-]//g' | sort -u

# Fetch vendored parser sources at pinned revisions
langs-fetch-parsers name="":
    lua scripts/langs.lua fetch-parsers {{name}}

# Fetch vendored query files at pinned revisions
langs-fetch-queries name="":
    lua scripts/langs.lua fetch-queries {{name}}

# List all languages declared in Cargo.toml metadata
langs-list:
    lua scripts/langs.lua list

# Upgrade vendored parser revisions in Cargo.toml from nvim-treesitter parsers.lua and upstream
langs-upgrade-parsers name="":
    lua scripts/langs.lua upgrade-parsers {{name}}

# Upgrade vendored query revisions in Cargo.toml from upstream
langs-upgrade-queries name="":
    lua scripts/langs.lua upgrade-queries {{name}}

# Extract highlight scopes from theme files
themes-extract-scopes:
    #!/usr/bin/env bash
    set -euo pipefail
    jq -r '.highlights | keys[]' themes/*.json | sort -u

# Generate theme JSON files from Neovim colorschemes
themes-gen theme_name="":
    lua scripts/themes.lua gen {{theme_name}}

# List all available themes
themes-list:
    lua scripts/themes.lua list

# Copy theme JSON files to crates/lumis/themes
themes-sync:
    lua scripts/themes.lua sync

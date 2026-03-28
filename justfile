#!/usr/bin/env just --justfile

# List available commands
default:
    @just --list

# Install dependencies and check required tools
setup:
    #!/usr/bin/env bash
    set -euo pipefail

    errors=0

    check_bin() {
        if command -v "$1" &>/dev/null; then
            echo "  ✓ $1"
        else
            echo "  ✗ $1 -- $2"
            errors=$((errors + 1))
        fi
    }

    check_python310() {
        if ! command -v python3 &>/dev/null; then
            echo "  ✗ python3 -- Python 3.10+ is needed for WASM builds"
            errors=$((errors + 1))
            return
        fi

        local version
        version="$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:3])))')"

        if python3 -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)'; then
            echo "  ✓ python3 ($version)"
        else
            echo "  ✗ python3 ($version) -- Python 3.10+ is needed for WASM builds"
            errors=$((errors + 1))
        fi
    }

    echo "Checking required tools..."
    check_bin cargo "https://rustup.rs"
    check_bin node "https://nodejs.org"
    check_bin pnpm "https://pnpm.io/installation"
    check_bin mix "https://elixir-lang.org/install.html"
    check_bin stylua "cargo install stylua"
    echo ""

    echo "Checking optional tools..."
    check_bin tree-sitter "cargo install tree-sitter-cli (needed for WASM builds)"
    check_bin emcc "https://emscripten.org (needed for WASM builds)"
    check_python310
    check_bin nvim "https://neovim.io (needed for theme generation)"
    echo ""

    if [ "$errors" -gt 0 ]; then
        echo "⚠ $errors tool(s) missing -- see above"
        echo ""
    fi

    echo "Fetching Rust dependencies..."
    cargo fetch
    echo ""

    echo "Installing JS dependencies..."
    (cd packages/javascript && pnpm install)
    echo ""

    echo "Installing website dependencies..."
    (cd website && pnpm install)
    echo ""

    echo "Installing docs site dependencies..."
    (cd docs && pnpm install)
    echo ""

    echo "Preprocessing shared queries..."
    just langs-preprocess-queries
    echo ""

    echo "Generating JS theme assets..."
    (cd packages/javascript && pnpm --filter @lumis-sh/themes build)
    echo ""

    echo "Generating JS language/runtime artifacts..."
    (cd packages/javascript && pnpm --filter @lumis-sh/lumis build:generate)
    echo ""

    echo "Fetching Elixir dependencies..."
    (cd packages/elixir/lumis && mix deps.get)
    echo ""

    echo "Done."

# Run all tests
test:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Running Rust tests..."
    cargo test --workspace
    echo ""
    echo "Running Elixir tests..."
    (cd packages/elixir/lumis && LUMIS_BUILD=1 mix test)
    echo ""
    echo "Running Javascript tests..."
    (cd packages/javascript && pnpm --filter @lumis-sh/lumis build)
    (cd packages/javascript && pnpm -r --if-present test)

# Run conformance tests across all packages
test-conformance:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Rust conformance..."
    cargo test -p lumis --test formatter_conformance
    echo ""
    echo "CLI conformance..."
    cargo test -p lumis-cli --test conformance
    echo ""
    echo "JS conformance..."
    (cd packages/javascript/lumis && pnpm vitest run test/conformance.test.ts)
    echo ""
    echo "Elixir conformance..."
    (cd packages/elixir/lumis && LUMIS_BUILD=1 mix test test/conformance_test.exs)

# Run all linters
lint:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Running Rust clippy..."
    cargo clippy --workspace --all-targets --all-features -- -D warnings
    echo ""
    echo "Running Rust fmt check..."
    cargo fmt --all -- --check
    echo ""
    echo "Running Elixir format check..."
    (cd packages/elixir/lumis && mix format --check-formatted)
    echo ""
    echo "Running Elixir compile warnings..."
    (cd packages/elixir/lumis && LUMIS_BUILD=1 mix compile --warnings-as-errors)
    echo "Running Elixir credo..."
    (cd packages/elixir/lumis && LUMIS_BUILD=1 mix credo)
    echo ""
    echo "Running JS fmt check..."
    (cd packages/javascript && pnpm --filter @lumis-sh/lumis fmt:check)
    (cd packages/javascript && pnpm --filter @lumis-sh/themes fmt:check)
    echo ""
    echo "Running JS lint..."
    (cd packages/javascript && pnpm --filter @lumis-sh/lumis lint)
    echo ""
    echo "Running Lua fmt check..."
    stylua --check themes/

# Format all code
fmt:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Formatting Rust..."
    cargo fmt --all
    echo ""
    echo "Formatting Elixir..."
    (cd packages/elixir/lumis && mix format)
    echo ""
    echo "Formatting JS/TS..."
    (cd packages/javascript && pnpm --filter @lumis-sh/lumis fmt)
    (cd packages/javascript && pnpm --filter @lumis-sh/themes fmt)
    echo ""
    echo "Formatting Lua..."
    stylua themes/

# Build lumis-cli in release mode and install to the given path
cli-install path:
    #!/usr/bin/env bash
    set -euo pipefail
    cargo build -p lumis-cli --release
    mkdir -p "{{path}}"
    cp target/release/lumis "{{path}}/lumis"
    echo "Installed lumis to {{path}}/lumis"

# Start website dev server
dev:
    #!/usr/bin/env bash
    set -euo pipefail
    if [ ! -f packages/javascript/lumis/dist/bundles/full.js ]; then
        echo "Building @lumis-sh/lumis for website imports..."
        (cd packages/javascript && pnpm --filter @lumis-sh/lumis build)
        echo ""
    fi
    (cd website && pnpm dev)

# Start docs site dev server
docs-site:
    #!/usr/bin/env bash
    set -euo pipefail
    (cd docs && pnpm start)

# Generate CSS files for HTML linked formatter
css-gen:
    cargo run -p dev --release -- gen-css

# Copy CSS files to crates and packages
css-sync:
    cargo run -p dev -- sync-css

# Dump canonical Rust highlight events as JSON
conformance-dump-events source lang:
    cargo run -p dev --features lumis-all-languages -- dump-events "{{source}}" -l {{lang}}

# Verify shared conformance fixtures against canonical Rust output
conformance-verify name="":
    cargo run -p dev --features lumis-all-languages -- verify-conformance {{name}}

# Regenerate shared conformance fixtures from canonical Rust output
conformance-regen name="":
    cargo run -p dev --features lumis-all-languages -- regen-conformance {{name}}

# Generate documentation for all crates and packages
docs:
    #!/usr/bin/env bash
    set -euo pipefail
    cargo doc --all-features --no-deps
    (cd packages/elixir/lumis && LUMIS_BUILD=1 mix docs)
    (cd packages/javascript && pnpm --filter @lumis-sh/lumis docs)
    echo ""
    echo "Docs generated:"
    echo "  lumis:           $(pwd)/target/doc/lumis/index.html"
    echo "  lumis-core:      $(pwd)/target/doc/lumis_core/index.html"
    echo "  elixir:          $(pwd)/packages/elixir/lumis/doc/index.html"
    echo "  javascript:      $(pwd)/packages/javascript/lumis/doc/index.html"

# Generate LANGUAGES.md from languages.toml
docs-gen-languages-md:
    cargo run -p dev --no-default-features -- gen-languages-md

# Update language parser, queries, and docs
langs-update name:
    #!/usr/bin/env bash
    set -euo pipefail
    just langs-fetch-parsers {{name}}
    just langs-fetch-queries {{name}}
    just langs-preprocess-queries {{name}}
    just docs-gen-languages-md

# Generate THEMES.md from themes definition
docs-gen-themes-md:
    cargo run -p dev --no-default-features -- gen-themes-md

# Extract highlight scopes from query files
langs-extract-scopes:
    #!/usr/bin/env bash
    set -euo pipefail
    find queries/upstream -type f -name "*.scm" -exec grep -oh '@[^_ ][^ ]*' {} \; 2>/dev/null | sed 's/^@//; s/[^a-zA-Z0-9_.-]//g' | sort -u

# Fetch vendored parser sources at pinned revisions
langs-fetch-parsers name="":
    cargo run -p dev --no-default-features -- fetch-parsers {{name}}

# Fetch vendored query files at pinned revisions
langs-fetch-queries name="":
    cargo run -p dev --no-default-features -- fetch-queries {{name}}

# Preprocess query files (resolve inheritance, apply fixes, strip unsupported predicates)
langs-preprocess-queries name="":
    cargo run -p dev --no-default-features -- preprocess-queries {{name}}

# Generate highlights.rs and highlights.ts from highlights.toml
langs-gen-highlights:
    cargo run -p dev --no-default-features -- gen-highlights

# List all languages declared in languages.toml
langs-list:
    cargo run -p dev --no-default-features -- langs-list

# Upgrade vendored parser revisions from nvim-treesitter parsers.lua and upstream
langs-upgrade-parsers name="":
    cargo run -p dev --no-default-features -- upgrade-parsers {{name}}

# Upgrade vendored query revisions from upstream
langs-upgrade-queries name="":
    cargo run -p dev --no-default-features -- upgrade-queries {{name}}

# Build WASM files for tree-sitter parsers (requires emscripten)
wasm-build name="":
    cargo run -p dev -- build-wasm {{name}}

# List parsers whose current WASM packages still need publishing
wasm-publish-needed parser="":
    @python3 scripts/wasm-needed.py "{{parser}}"

# Stage a WASM package for inspection before publishing
wasm-publish-prepare parser:
    #!/usr/bin/env bash
    set -euo pipefail
    just wasm-build {{parser}}
    cargo run -p dev -- stage-wasm {{parser}}

# Stage and publish a WASM package to npm
wasm-publish parser:
    #!/usr/bin/env bash
    set -euo pipefail
    just wasm-publish-prepare {{parser}}
    wasm_name=$(cargo run -q -p dev -- wasm-meta {{parser}} | grep '^wasm_name=' | cut -d= -f2)
    cd tmp/wasm-publish/$wasm_name && npm publish --access public

# Extract highlight scopes from theme files
themes-extract-scopes:
    #!/usr/bin/env bash
    set -euo pipefail
    jq -r '.highlights | keys[]' themes/*.json | sort -u

# Generate theme JSON files from Neovim colorschemes
themes-gen theme_name="":
    #!/usr/bin/env bash
    set -euo pipefail
    if [ -z "{{theme_name}}" ]; then
        echo "This will regenerate all theme files in themes/"
        read -p "Do you want to proceed? (y/N) " reply
        [[ "$reply" =~ ^[Yy]$ ]] || { echo "Operation cancelled."; exit 0; }
        find themes -type f -name '*.json' -delete
        for name in $(cargo run -p dev -- list-themes); do
            echo "Generating $name..."
            nvim --clean --headless -V3 -u themes/init.lua -l themes/extract_theme.lua "$name"
        done
    else
        echo "This will regenerate {{theme_name}} in themes/"
        read -p "Do you want to proceed? (y/N) " reply
        [[ "$reply" =~ ^[Yy]$ ]] || { echo "Operation cancelled."; exit 0; }
        nvim --clean --headless -V3 -u themes/init.lua -l themes/extract_theme.lua {{theme_name}}
    fi
    cargo run -p dev -- sync-themes

# List all available themes
themes-list:
    cargo run -p dev -- list-themes

# Copy theme JSON files to crates/lumis/themes
themes-sync:
    cargo run -p dev -- sync-themes

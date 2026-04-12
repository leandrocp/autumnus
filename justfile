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

    check_tree_sitter_cli() {
        if ! command -v tree-sitter &>/dev/null; then
            echo "  ✗ tree-sitter -- tree-sitter-cli >= 0.26 is needed for WASM builds"
            errors=$((errors + 1))
            return
        fi

        local version raw_version major minor
        raw_version="$(tree-sitter --version 2>/dev/null)"
        version="${raw_version#tree-sitter }"
        version="${version%% *}"

        if [[ ! "$version" =~ ^([0-9]+)\.([0-9]+)(\.[0-9]+)?$ ]]; then
            echo "  ✗ tree-sitter ($raw_version) -- could not determine version; need >= 0.26"
            errors=$((errors + 1))
            return
        fi

        major="${BASH_REMATCH[1]}"
        minor="${BASH_REMATCH[2]}"

        if (( major > 0 || minor >= 26 )); then
            echo "  ✓ tree-sitter ($version)"
        else
            echo "  ✗ tree-sitter ($version) -- tree-sitter-cli >= 0.26 is needed for WASM builds"
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
    check_tree_sitter_cli
    check_bin emcc "https://emscripten.org (needed for WASM builds)"
    check_bin git-cliff "https://git-cliff.org"
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
    pnpm install
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
    pnpm --filter @lumis-sh/themes build
    echo ""

    echo "Generating JS language/runtime artifacts..."
    pnpm --filter @lumis-sh/lumis build:generate
    pnpm --dir packages/javascript run build:wasm-bundles
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
    pnpm --filter @lumis-sh/lumis build
    pnpm -r --if-present test

# Run conformance tests across all packages
test-conformance:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Rust conformance..."
    cargo test -p lumis --test formatter_conformance -- --ignored
    echo ""
    echo "CLI conformance..."
    cargo test -p lumis-cli --test conformance -- --ignored
    echo ""
    echo "JS conformance..."
    pnpm --filter @lumis-sh/lumis test:conformance
    echo ""
    echo "Elixir conformance..."
    (cd packages/elixir/lumis && LUMIS_BUILD=1 mix test --include conformance test/conformance_test.exs)

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
    pnpm --filter @lumis-sh/lumis fmt:check
    pnpm --filter @lumis-sh/themes fmt:check
    echo ""
    echo "Running JS lint..."
    pnpm --filter @lumis-sh/lumis lint
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
    pnpm --filter @lumis-sh/lumis fmt
    pnpm --filter @lumis-sh/themes fmt
    echo ""
    echo "Formatting Lua..."
    stylua themes/

# Build lumis-cli in release mode and install to the given path, eg: just cli-install ~/.local/bin
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
        pnpm --filter @lumis-sh/lumis build
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
    cargo run --manifest-path crates/dev/Cargo.toml --release -- gen-css

# Copy CSS files to crates and packages
css-sync:
    cargo run --manifest-path crates/dev/Cargo.toml -- sync-css

# Dump canonical Rust highlight events as JSON, eg: just conformance-dump-events samples/rust.rs rust
conformance-dump-events source lang:
    cargo run --manifest-path crates/dev/Cargo.toml --features lumis-all-languages -- dump-events "{{source}}" -l {{lang}}

# Verify shared conformance fixtures against canonical Rust output, eg: just conformance-verify rust
conformance-verify name="":
    cargo run --manifest-path crates/dev/Cargo.toml --features lumis-all-languages -- verify-conformance {{name}}

# Regenerate shared conformance fixtures from canonical Rust output, eg: just conformance-regen rust
conformance-regen name="":
    cargo run --manifest-path crates/dev/Cargo.toml --features lumis-all-languages -- regen-conformance {{name}}

# Generate documentation for all crates and packages
docs:
    #!/usr/bin/env bash
    set -euo pipefail
    cargo doc --all-features --no-deps
    (cd packages/elixir/lumis && LUMIS_BUILD=1 mix docs)
    pnpm --filter @lumis-sh/lumis docs
    echo ""
    echo "Docs generated:"
    echo "  lumis:           $(pwd)/target/doc/lumis/index.html"
    echo "  lumis-core:      $(pwd)/target/doc/lumis_core/index.html"
    echo "  elixir:          $(pwd)/packages/elixir/lumis/doc/index.html"
    echo "  javascript:      $(pwd)/packages/javascript/lumis/doc/index.html"

# Generate LANGUAGES.md from languages.toml
docs-gen-languages-md:
    cargo run --manifest-path crates/dev/Cargo.toml --no-default-features -- gen-languages-md

# Update language parser, queries, and docs, eg: just langs-update bash
langs-update name:
    #!/usr/bin/env bash
    set -euo pipefail
    just langs-fetch-vendored-parsers {{name}}
    cargo run --manifest-path crates/dev/Cargo.toml --no-default-features -- cargo-update-dep {{name}}
    cargo run --manifest-path crates/dev/Cargo.toml --no-default-features -- cargo-update-features
    just langs-fetch-queries {{name}}
    just langs-preprocess-queries {{name}}
    just docs-gen-languages-md

# Generate THEMES.md from themes definition
docs-gen-themes-md:
    cargo run --manifest-path crates/dev/Cargo.toml --no-default-features -- gen-themes-md

# Extract highlight scopes from query files
langs-extract-scopes:
    #!/usr/bin/env bash
    set -euo pipefail
    find queries/upstream -type f -name "*.scm" -exec grep -oh '@[^_ ][^ ]*' {} \; 2>/dev/null | sed 's/^@//; s/[^a-zA-Z0-9_.-]//g' | sort -u

# Fetch vendored parser sources at pinned revisions, eg: just langs-fetch-vendored-parsers bash
langs-fetch-vendored-parsers name="":
    cargo run --manifest-path crates/dev/Cargo.toml --no-default-features -- fetch-parsers {{name}}
    cargo run --manifest-path crates/dev/Cargo.toml --no-default-features -- compress-parsers {{name}}

# Fetch vendored query files at pinned revisions, eg: just langs-fetch-queries bash
langs-fetch-queries name="":
    cargo run --manifest-path crates/dev/Cargo.toml --no-default-features -- fetch-queries {{name}}

# Preprocess query files (resolve inheritance, apply fixes, strip unsupported predicates), eg: just langs-preprocess-queries bash
langs-preprocess-queries name="":
    cargo run --manifest-path crates/dev/Cargo.toml --no-default-features -- preprocess-queries {{name}}

# Generate highlights.rs and highlights.ts from highlights.toml
langs-gen-highlights:
    cargo run --manifest-path crates/dev/Cargo.toml --no-default-features -- gen-highlights

# List all languages declared in languages.toml
langs-list:
    cargo run --manifest-path crates/dev/Cargo.toml --no-default-features -- langs-list

# Sync Rust bundle feature lists from languages.toml
cargo-update-features:
    cargo run --manifest-path crates/dev/Cargo.toml --no-default-features -- cargo-update-features

# Upgrade parser revisions and sync crate-backed versions, eg: just langs-upgrade-parsers bash
langs-upgrade-parsers name="":
    cargo run --manifest-path crates/dev/Cargo.toml --no-default-features -- upgrade-parsers {{name}}
    cargo run --manifest-path crates/dev/Cargo.toml --no-default-features -- cargo-update-dep {{name}}
    cargo run --manifest-path crates/dev/Cargo.toml --no-default-features -- cargo-update-features

# Upgrade vendored query revisions from upstream, eg: just langs-upgrade-queries bash
langs-upgrade-queries name="":
    cargo run --manifest-path crates/dev/Cargo.toml --no-default-features -- upgrade-queries {{name}}

# Build WASM files for tree-sitter parsers (requires emscripten), eg: just wasm-build bash
wasm-build name="":
    cargo run --manifest-path crates/dev/Cargo.toml -- build-wasm {{name}}

# List parsers whose current WASM packages still need publishing, eg: just wasm-publish-needed bash
wasm-publish-needed parser="":
    @python3 scripts/wasm-needed.py "{{parser}}"

# Stage a WASM package for inspection before publishing, eg: just wasm-publish-prepare bash
wasm-publish-prepare parser:
    #!/usr/bin/env bash
    set -euo pipefail
    just wasm-build {{parser}}
    cargo run --manifest-path crates/dev/Cargo.toml -- stage-wasm {{parser}}

# Stage and publish a WASM package to npm, eg: just wasm-publish bash
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

# Generate theme JSON files from Neovim colorschemes, eg: just themes-gen catppuccin-mocha
themes-gen theme_name="":
    #!/usr/bin/env bash
    set -euo pipefail
    if [ -z "{{theme_name}}" ]; then
        echo "This will regenerate all theme files in themes/"
        read -p "Do you want to proceed? (y/N) " reply
        [[ "$reply" =~ ^[Yy]$ ]] || { echo "Operation cancelled."; exit 0; }
        find themes -type f -name '*.json' -delete
        for name in $(cargo run --manifest-path crates/dev/Cargo.toml -- list-themes); do
            echo "Generating $name..."
            nvim --clean --headless -V3 -u themes/init.lua -l themes/extract_theme.lua "$name"
        done
    else
        echo "This will regenerate {{theme_name}} in themes/"
        read -p "Do you want to proceed? (y/N) " reply
        [[ "$reply" =~ ^[Yy]$ ]] || { echo "Operation cancelled."; exit 0; }
        nvim --clean --headless -V3 -u themes/init.lua -l themes/extract_theme.lua {{theme_name}}
    fi
    cargo run --manifest-path crates/dev/Cargo.toml -- sync-themes

# List all available themes
themes-list:
    cargo run --manifest-path crates/dev/Cargo.toml -- list-themes

# Copy theme JSON files to crates/lumis/themes and generate JS theme modules
themes-sync:
    cargo run --manifest-path crates/dev/Cargo.toml -- sync-themes
    pnpm --filter @lumis-sh/themes build:themes

# List packages with path-scoped commits since their latest release tag
release-needed:
    #!/usr/bin/env bash
    set -euo pipefail

    packages=(
        "cargo-lumis|crates/lumis"
        "cargo-lumis-core|crates/lumis-core"
        "cargo-lumis-build|crates/lumis-build"
        "cargo-lumis-cli|crates/lumis-cli"
        "npm-lumis|packages/javascript/lumis"
        "npm-markdown-it-lumis|packages/javascript/markdown-it-lumis"
        "npm-rehype-lumis|packages/javascript/rehype-lumis"
        "npm-react|packages/javascript/react"
        "npm-themes|packages/javascript/themes"
        "npm-wasm-bundle-web|packages/javascript/wasm-bundle-web"
        "npm-wasm-bundle-web-extra|packages/javascript/wasm-bundle-web-extra"
        "npm-wasm-bundle-system|packages/javascript/wasm-bundle-system"
        "npm-wasm-bundle-backend|packages/javascript/wasm-bundle-backend"
        "npm-wasm-bundle-full|packages/javascript/wasm-bundle-full"
        "hex-lumis|packages/elixir/lumis"
    )

    found=0

    for entry in "${packages[@]}"; do
        package="${entry%%|*}"
        path="${entry#*|}"
        tag="$(git tag --list "$package/v*" --sort=-version:refname | head -n1)"

        if [ -n "$tag" ]; then
            commits="$(git log --no-merges --format='%h %s' "$tag"..HEAD -- "$path")"
        else
            commits="$(git log --no-merges --format='%h %s' -- "$path")"
        fi

        if [ -z "$commits" ]; then
            continue
        fi

        found=1
        echo "$package"
        if [ -n "$tag" ]; then
            echo "  since: $tag"
        else
            echo "  since: no tags yet"
        fi
        while IFS= read -r line; do
            echo "  $line"
        done <<< "$commits"
        echo ""
    done

    if [ "$found" -eq 0 ]; then
        echo "No package-scoped commits found since the latest package tags."
    fi

# Update package version files and regenerate the package changelog locally, eg: just release-prepare cargo-lumis-cli 0.2.1
release-prepare package version:
    #!/usr/bin/env bash
    set -euo pipefail

    package="{{package}}"
    version="{{version}}"
    case "$package" in
        cargo-lumis)
            manifest="crates/lumis/Cargo.toml"
            changelog="crates/lumis/CHANGELOG.md"
            include_path="crates/lumis/**/*"
            kind="cargo"
            cargo_package="lumis"
            ;;
        cargo-lumis-core)
            manifest="crates/lumis-core/Cargo.toml"
            changelog="crates/lumis-core/CHANGELOG.md"
            include_path="crates/lumis-core/**/*"
            kind="cargo"
            cargo_package="lumis-core"
            ;;
        cargo-lumis-build)
            manifest="crates/lumis-build/Cargo.toml"
            changelog="crates/lumis-build/CHANGELOG.md"
            include_path="crates/lumis-build/**/*"
            kind="cargo"
            cargo_package="lumis-build"
            ;;
        cargo-lumis-cli)
            manifest="crates/lumis-cli/Cargo.toml"
            changelog="crates/lumis-cli/CHANGELOG.md"
            include_path="crates/lumis-cli/**/*"
            kind="cargo"
            cargo_package="lumis-cli"
            ;;
        npm-lumis)
            manifest="packages/javascript/lumis/package.json"
            changelog="packages/javascript/lumis/CHANGELOG.md"
            include_path="packages/javascript/lumis/**/*"
            kind="npm"
            ;;
        npm-markdown-it-lumis)
            manifest="packages/javascript/markdown-it-lumis/package.json"
            changelog="packages/javascript/markdown-it-lumis/CHANGELOG.md"
            include_path="packages/javascript/markdown-it-lumis/**/*"
            kind="npm"
            ;;
        npm-rehype-lumis)
            manifest="packages/javascript/rehype-lumis/package.json"
            changelog="packages/javascript/rehype-lumis/CHANGELOG.md"
            include_path="packages/javascript/rehype-lumis/**/*"
            kind="npm"
            ;;
        npm-react)
            manifest="packages/javascript/react/package.json"
            changelog="packages/javascript/react/CHANGELOG.md"
            include_path="packages/javascript/react/**/*"
            kind="npm"
            ;;
        npm-themes)
            manifest="packages/javascript/themes/package.json"
            changelog="packages/javascript/themes/CHANGELOG.md"
            include_path="packages/javascript/themes/**/*"
            kind="npm"
            ;;
        npm-wasm-bundle-web)
            manifest="packages/javascript/wasm-bundle-web/package.json"
            changelog="packages/javascript/wasm-bundle-web/CHANGELOG.md"
            include_path="packages/javascript/wasm-bundle-web/**/*"
            kind="npm"
            ;;
        npm-wasm-bundle-web-extra)
            manifest="packages/javascript/wasm-bundle-web-extra/package.json"
            changelog="packages/javascript/wasm-bundle-web-extra/CHANGELOG.md"
            include_path="packages/javascript/wasm-bundle-web-extra/**/*"
            kind="npm"
            ;;
        npm-wasm-bundle-system)
            manifest="packages/javascript/wasm-bundle-system/package.json"
            changelog="packages/javascript/wasm-bundle-system/CHANGELOG.md"
            include_path="packages/javascript/wasm-bundle-system/**/*"
            kind="npm"
            ;;
        npm-wasm-bundle-backend)
            manifest="packages/javascript/wasm-bundle-backend/package.json"
            changelog="packages/javascript/wasm-bundle-backend/CHANGELOG.md"
            include_path="packages/javascript/wasm-bundle-backend/**/*"
            kind="npm"
            ;;
        npm-wasm-bundle-full)
            manifest="packages/javascript/wasm-bundle-full/package.json"
            changelog="packages/javascript/wasm-bundle-full/CHANGELOG.md"
            include_path="packages/javascript/wasm-bundle-full/**/*"
            kind="npm"
            ;;
        hex-lumis)
            manifest="packages/elixir/lumis/mix.exs"
            changelog="packages/elixir/lumis/CHANGELOG.md"
            include_path="packages/elixir/lumis/**/*"
            kind="hex"
            ;;
        *) echo "Unknown package: $package" >&2; exit 1 ;;
    esac

    tag="$package/v$version"

    case "$kind" in
        cargo)
            cargo set-version --manifest-path "$manifest" -p "$cargo_package" "$version"
            ;;
        npm)
            npm --prefix "$(dirname "$manifest")" version --no-git-tag-version "$version"
            ;;
        hex)
            python3 -c 'from pathlib import Path; import re, sys; path = Path(sys.argv[1]); version = sys.argv[2]; content = path.read_text(); content = re.sub(r"@version \"[^\"]+\"", f"@version \"{version}\"", content, count=1); path.write_text(content)' "$manifest" "$version"
            ;;
    esac

    git-cliff --config cliff.toml --github-repo leandrocp/lumis --include-path "$include_path" --tag-pattern "$package/v[0-9].*" --tag "$tag" --prepend "$changelog" --strip header --unreleased
    printf 'Prepared %s %s\n' "$package" "$version"

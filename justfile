#!/usr/bin/env just --justfile

default:
    @just --list

list-languages:
    #!/usr/bin/env bash
    set -euo pipefail
    cargo run --bin autumn list-languages

list-themes:
    #!/usr/bin/env bash
    set -euo pipefail
    cargo run --bin autumn list-themes

extract-scopes:
    #!/usr/bin/env bash
    set -euo pipefail
    (cd queries && bash extract_scopes.sh)

update-queries:
    #!/usr/bin/env bash
    set -euo pipefail
    
    read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operation cancelled."
        exit 0
    fi
    
    TEMP_DIR=$(mktemp -d)
    git clone --depth 1 https://github.com/nvim-treesitter/nvim-treesitter.git "$TEMP_DIR/nvim-treesitter"
    
    LANGUAGES=$(find queries -maxdepth 1 -type d | grep -v "^queries$" | sed 's|queries/||')
    
    for LANG in $LANGUAGES; do
        SRC_DIR="$TEMP_DIR/nvim-treesitter/queries/$LANG"
        DEST_DIR="queries/$LANG"
        
        if [ -d "$SRC_DIR" ]; then
            echo "Replacing queries for $LANG"
            mkdir -p "$DEST_DIR"
            cp -r "$SRC_DIR"/* "$DEST_DIR/" 2>/dev/null || true
        else
            echo "No queries found for $LANG in nvim-treesitter"
        fi
    done
    
    rm -rf "$TEMP_DIR"

gen-themes:
    #!/usr/bin/env bash
    set -euo pipefail
    
    echo "⚠️  This will regenerate files in the themes/ directory."
    echo ""
    read -p "Do you want to proceed? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operation cancelled."
        exit 0
    fi

    find themes -type f -name "*.json" -delete
    (cd themes && nvim --clean --headless -u init.lua -l extract_themes.lua)

gen-css:
    #!/usr/bin/env bash
    set -euo pipefail
    
    echo "⚠️  This will regenerate files in the css/ directory."
    echo ""
    read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operation cancelled."
        exit 0
    fi
    
    find css -type f -name "*.css" -delete
    cargo run --release --features=dev --bin dev gen-css

gen-samples:
    #!/usr/bin/env bash
    set -euo pipefail
    
    echo "⚠️  This will regenerate files in the samples/ directory."
    echo ""
    read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operation cancelled."
        exit 0
    fi
    
    find samples -type f -name "*.html" ! -name "index.html" ! -name "html.html" -delete
    cargo run --release --features=dev --bin dev gen-samples

dev-server:
    #!/usr/bin/env bash
    set -euo pipefail
    (cd samples && python -m http.server)

update-parsers:
    #!/usr/bin/env bash
    set -euo pipefail
    
    echo "⚠️  This will update all parser subtrees in vendored_parsers/."
    echo ""
    read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operation cancelled."
        exit 0
    fi

    for dir in vendored_parsers/tree-sitter-*; do
        if [ -d "$dir" ]; then
            parser_name=$(basename "$dir")
            remote_url=$(git config -f "$dir/.git/config" --get remote.origin.url)
            if [ -n "$remote_url" ]; then
                branch=$(cd "$dir" && git symbolic-ref --short HEAD 2>/dev/null || echo "main")
                git subtree pull --prefix="$dir" "$remote_url" "$branch" --squash
            else
                echo "⚠️  Could not find remote URL for $parser_name"
            fi
        fi
    done

    # necessary for `cargo package` to work
    find vendored_parsers -type f -name "Cargo.toml" -delete
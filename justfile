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
    
    echo "⚠️  WARNING: This will replace all existing tree-sitter queries in your project with the latest from nvim-treesitter."
    echo "⚠️  No backups will be created. All files in the queries/ directory will be overwritten."
    echo ""
    
    read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operation cancelled."
        exit 0
    fi
    
    TEMP_DIR=$(mktemp -d)
    echo "Created temporary directory: $TEMP_DIR"
    
    echo "Cloning nvim-treesitter repository..."
    git clone --depth 1 https://github.com/nvim-treesitter/nvim-treesitter.git "$TEMP_DIR/nvim-treesitter"
    
    LANGUAGES=$(find queries -maxdepth 1 -type d | grep -v "^queries$" | sed 's|queries/||')
    
    echo "Copying queries for languages already in the project..."
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
    
    echo "Cleaning up..."
    rm -rf "$TEMP_DIR"
    
    echo "Query update complete!"

update-themes:
    #!/usr/bin/env bash
    set -euo pipefail
    
    echo "Updating themes using the extract_themes.sh script..."
    echo "⚠️  This will regenerate theme files in the themes/ directory."
    echo ""
    
    read -p "Do you want to proceed? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operation cancelled."
        exit 0
    fi
    
    echo "Running extract_themes.lua in the themes directory..."
    (cd themes && nvim --clean --headless -u init.lua -l extract_themes.lua)

gen-samples:
    #!/usr/bin/env bash
    set -euo pipefail
    cargo run --features=dev --bin dev gen-samples

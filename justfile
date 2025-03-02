#!/usr/bin/env just --justfile

# Default recipe
default:
    @just --list

# Update queries from nvim-treesitter repository
update-queries:
    #!/usr/bin/env bash
    set -euo pipefail
    
    echo "⚠️  WARNING: This will replace all existing tree-sitter queries in your project with the latest from nvim-treesitter."
    echo "⚠️  No backups will be created. All files in the queries/ directory will be overwritten."
    echo ""
    
    # Ask for confirmation
    read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operation cancelled."
        exit 0
    fi
    
    # Create a temporary directory for cloning
    TEMP_DIR=$(mktemp -d)
    echo "Created temporary directory: $TEMP_DIR"
    
    # Clone the nvim-treesitter repository
    echo "Cloning nvim-treesitter repository..."
    git clone --depth 1 https://github.com/nvim-treesitter/nvim-treesitter.git "$TEMP_DIR/nvim-treesitter"
    
    # Get the list of language directories in our queries folder
    LANGUAGES=$(find queries -maxdepth 1 -type d | grep -v "^queries$" | sed 's|queries/||')
    
    # Copy queries for each language
    echo "Copying queries for languages already in the project..."
    for LANG in $LANGUAGES; do
        SRC_DIR="$TEMP_DIR/nvim-treesitter/queries/$LANG"
        DEST_DIR="queries/$LANG"
        
        if [ -d "$SRC_DIR" ]; then
            echo "Replacing queries for $LANG"
            # Copy new queries directly (no backup)
            mkdir -p "$DEST_DIR"
            cp -r "$SRC_DIR"/* "$DEST_DIR/" 2>/dev/null || true
        else
            echo "No queries found for $LANG in nvim-treesitter"
        fi
    done
    
    # Clean up
    echo "Cleaning up..."
    rm -rf "$TEMP_DIR"
    
    echo "Query update complete!"

# Update themes by running the extract_themes.sh script
update-themes:
    #!/usr/bin/env bash
    set -euo pipefail
    
    echo "Updating themes using the extract_themes.sh script..."
    echo "⚠️  This will regenerate theme files in the themes/ directory."
    echo ""
    
    # Ask for confirmation
    read -p "Do you want to proceed? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operation cancelled."
        exit 0
    fi
    
    # Change to the themes directory and run the script
    echo "Running extract_themes.sh in the themes directory..."
    (cd themes && bash extract_themes.sh)
    
    echo "Theme update complete!" 
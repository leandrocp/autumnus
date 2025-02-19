#!/usr/bin/env bash

set -euo pipefail

for cmd in nvim jq; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: $cmd is required but not installed"
    exit 1
  fi
done

set -euo pipefail

# install themes in init.lua
COLORSCHEMES=(
  "tokyonight-night"
  "tokyonight-storm"
  "tokyonight-day"
  "tokyonight-moon"
  "catppuccin-latte"
  "catppuccin-frappe"
  "catppuccin-macchiato"
  "catppuccin-mocha"
)

for scheme in "${COLORSCHEMES[@]}"; do
  nvim --headless -u init.lua -l nvim_theme.lua "$scheme" 2>&1 | jq -S >"${scheme//-/_}.json"
done

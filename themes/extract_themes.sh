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
  "github_dark"
  "github_dark_default"
  "github_dark_dimmed"
  "github_dark_high_contrast"
  "github_dark_colorblind"
  "github_dark_tritanopia"
  "github_light"
  "github_light_default"
  "github_light_high_contrast"
  "github_light_colorblind"
  "github_light_tritanopia"
)

for scheme in "${COLORSCHEMES[@]}"; do
  echo $scheme
  nvim --headless -u init.lua -l nvim_theme.lua "$scheme" 2>&1 | jq -S >"${scheme//-/_}.json"
done

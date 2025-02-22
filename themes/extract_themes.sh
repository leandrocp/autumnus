#!/usr/bin/env bash

set -euo pipefail

for cmd in nvim jq; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: $cmd is required but not installed"
    exit 1
  fi
done

themes=(
  "catppuccin-frappe:dark@catppuccin_frappe"
  "catppuccin-latte:light@catppuccin_latte"
  "catppuccin-macchiato:dark@catppuccin_macchiato"
  "catppuccin-mocha:dark@catppuccin_mocha"
  "dracula-soft:dark@dracula_soft"
  "dracula:dark@dracula"
  "github_dark:dark@github_dark"
  "github_dark_colorblind:dark@github_dark_colorblind"
  "github_dark_default:dark@github_dark_default"
  "github_dark_dimmed:dark@github_dark_dimmed"
  "github_dark_high_contrast:dark@github_dark_high_contrast"
  "github_dark_tritanopia:dark@github_dark_tritanopia"
  "github_light:light@github_light"
  "github_light_colorblind:light@github_light_colorblind"
  "github_light_default:light@github_light_default"
  "github_light_high_contrast:light@github_dark_high_contrast"
  "github_light_tritanopia:light@github_light_tritanopia"
  "gruvbox:dark@gruvbox_dark light@gruvbox_light"
  "kanagawa-dragon:dark@kanagawa_dragon"
  "kanagawa-lotus:light@kanagawa_lotus"
  "kanagawa-wave:dark@kanagawa_wave"
  "onedark:dark@onedark"
  "solarized:dark@solarized_dark light@solarized_light"
  "tokyonight-day:light@tokyonight_day"
  "tokyonight-moon:dark@tokyonight_moon"
  "tokyonight-night:dark@tokyonight_night"
  "tokyonight-storm:dark@tokyonight_storm"
  "vscode:dark@vscode_dark light@vscode_light"
)

for entry in "${themes[@]}"; do
  colorscheme=${entry%%:*}
  for variant in ${entry#*:}; do
    appearance=${variant%%@*}
    theme=${variant#*@}
    echo "$colorscheme ($appearance) -> $theme"
    FILE="${theme}.json"
    HIGHLIGHTS=$(nvim --headless -u init.lua -l nvim_theme.lua "$appearance" "$colorscheme" 2>&1 | jq -S)
    echo '{}' | jq ". + {\"name\": \"$theme\", \"appearance\": \"$appearance\", \"highlights\": $HIGHLIGHTS}" >$FILE
  done
done

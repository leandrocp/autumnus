#!/usr/bin/env bash

set -euo pipefail

for cmd in nvim jq; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: $cmd is required but not installed"
    exit 1
  fi
done

# colorscheme@appearance:theme_name[:variable_name=variable_value]
themes=(
  "catppuccin-frappe@dark:catppuccin_frappe"
  "catppuccin-latte@light:catppuccin_latte"
  "catppuccin-macchiato@dark:catppuccin_macchiato"
  "catppuccin-mocha@dark:catppuccin_mocha"
  "dracula-soft@dark:dracula_soft"
  "dracula@dark:dracula"
  "github_dark@dark:github_dark"
  "github_dark_colorblind@dark:github_dark_colorblind"
  "github_dark_default@dark:github_dark_default"
  "github_dark_dimmed@dark:github_dark_dimmed"
  "github_dark_high_contrast@dark:github_dark_high_contrast"
  "github_dark_tritanopia@dark:github_dark_tritanopia"
  "github_light@light:github_light"
  "github_light_colorblind@light:github_light_colorblind"
  "github_light_default@light:github_light_default"
  "github_light_high_contrast@light:github_dark_high_contrast"
  "github_light_tritanopia@light:github_light_tritanopia"
  "gruvbox@dark:gruvbox_dark"
  "gruvbox@light:gruvbox_light"
  "kanagawa-dragon@dark:kanagawa_dragon"
  "kanagawa-lotus@light:kanagawa_lotus"
  "kanagawa-wave@dark:kanagawa_wave"
  "material@dark:material_darker:material_style=darker"
  "material@dark:material_lighter:material_style=lighter"
  "material@dark:material_oceanic:material_style=oceanic"
  "material@dark:material_palenight:material_style=palenight"
  "material@dark:material_deep_ocean:material_style=deep ocean"
  "onedark@dark:onedark_dark:onedark_config.style=dark"
  "onedark@dark:onedark_darker:onedark_config.style=darker"
  "onedark@dark:onedark_cool:onedark_config.style=cool"
  "onedark@dark:onedark_deep:onedark_config.style=deep"
  "onedark@dark:onedark_warm:onedark_config.style=warm"
  "onedark@dark:onedark_warmer:onedark_config.style=warmer"
  "solarized@dark:solarized_dark"
  "solarized@light:solarized_light"
  "tokyonight-day@light:tokyonight_day"
  "tokyonight-moon@dark:tokyonight_moon"
  "tokyonight-night@dark:tokyonight_night"
  "tokyonight-storm@dark:tokyonight_storm"
  "vscode@dark:vscode_dark"
  "vscode@light:vscode_light"
)

for entry in "${themes[@]}"; do
  colorscheme=${entry%%@*}
  rest=${entry#*@}
  appearance=${rest%%:*}
  theme_part=${rest#*:}

  # Check if there are variables
  if [[ $theme_part == *":"* ]]; then
    theme=${theme_part%%:*}
    variables=${theme_part#*:}
  else
    theme=$theme_part
    variables=""
  fi

  FILE="${theme}.json"

  if [[ -n "$variables" ]]; then
    HIGHLIGHTS=$(nvim --headless -u init.lua -l nvim_theme.lua "$appearance" "$colorscheme" "$variables" 2>&1 | jq -S)
    echo '{}' | jq ". + {\"name\": \"$theme\", \"appearance\": \"$appearance\", \"highlights\": $HIGHLIGHTS}" >"$FILE"
    echo "$colorscheme ($appearance / $variables) -> $FILE"
  else
    HIGHLIGHTS=$(nvim --headless -u init.lua -l nvim_theme.lua "$appearance" "$colorscheme" 2>&1 | jq -S)
    echo '{}' | jq ". + {\"name\": \"$theme\", \"appearance\": \"$appearance\", \"highlights\": $HIGHLIGHTS}" >"$FILE"
    echo "$colorscheme ($appearance) -> $FILE"
  fi
done

-- Script to extract TreeSitter highlight groups from Neovim themes
-- Usage: nvim --clean --headless -u init.lua -l extract_themes.lua
-- Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-03-03 00:49:56
-- Current User's Login: leandrocp

local themes = {
	{
		name = "tokyonight_night",
		colorscheme = "tokyonight-night",
		appearance = "dark",
		plugin = {
			"folke/tokyonight.nvim",
			opts = { style = "night" },
		},
	},
	{
		name = "tokyonight_day",
		colorscheme = "tokyonight-day",
		appearance = "light",
		plugin = {
			"folke/tokyonight.nvim",
			opts = { style = "day" },
		},
	},
	{
		name = "catppuccin_frappe",
		colorscheme = "catppuccin-frappe",
		appearance = "dark",
		plugin = {
			"catppuccin/nvim",
			name = "catppuccin",
			opts = {},
		},
	},
	{
		name = "catppuccin_latte",
		colorscheme = "catppuccin-latte",
		appearance = "light",
		plugin = {
			"catppuccin/nvim",
			name = "catppuccin",
			opts = {},
		},
	},
	{
		name = "catppuccin_macchiato",
		colorscheme = "catppuccin-macchiato",
		appearance = "dark",
		plugin = {
			"catppuccin/nvim",
			name = "catppuccin",
			opts = {},
		},
	},
	{
		name = "catppuccin_mocha",
		colorscheme = "catppuccin-mocha",
		appearance = "dark",
		plugin = {
			"catppuccin/nvim",
			name = "catppuccin",
			opts = {},
		},
	},
}

local highlight_groups = {
	"Normal",
	"Comment",
	"@attribute",
	"@attribute.builtin",
	"@boolean",
	"@character",
	"@character.special",
	"@charset",
	"@clicke",
	"@comment",
	"@comment.documentation",
	"@constant",
	"@constant.builtin",
	"@constant.macro",
	"@constructor",
	"@diff.minus",
	"@diff.plus",
	"@error",
	"@function",
	"@function.builtin",
	"@function.call",
	"@function.macro",
	"@function.method",
	"@function.method.call",
	"@import",
	"@indent.begin",
	"@indent.branch",
	"@indent.end",
	"@indent.ignore",
	"@injection.content",
	"@injection.language",
	"@keyframes",
	"@keyword",
	"@keyword.conditional",
	"@keyword.conditional.ternary",
	"@keyword.coroutine",
	"@keyword.debug",
	"@keyword.directive",
	"@keyword.directive.define",
	"@keyword.exception",
	"@keyword.function",
	"@keyword.import",
	"@keyword.modifier",
	"@keyword.operator",
	"@keyword.repeat",
	"@keyword.return",
	"@keyword.type",
	"@label",
	"@local.definition",
	"@local.definition.associated",
	"@local.definition.field",
	"@local.definition.function",
	"@local.definition.import",
	"@local.definition.macro",
	"@local.definition.method",
	"@local.definition.namespace",
	"@local.definition.parameter",
	"@local.definition.type",
	"@local.definition.var",
	"@local.reference",
	"@local.scope",
	"@markup.heading",
	"@markup.heading.1",
	"@markup.heading.2",
	"@markup.heading.3",
	"@markup.heading.4",
	"@markup.heading.5",
	"@markup.heading.6",
	"@markup.italic",
	"@markup.link.label",
	"@markup.raw",
	"@markup.strikethrough",
	"@markup.strong",
	"@markup.underline",
	"@media",
	"@module",
	"@module.builtin",
	"@namespace",
	"@none",
	"@number",
	"@number.float",
	"@operator",
	"@property",
	"@punctuation.bracket",
	"@punctuation.delimiter",
	"@punctuation.special",
	"@string",
	"@string.documentation",
	"@string.escape",
	"@string.regexp",
	"@string.special",
	"@string.special.path",
	"@string.special.symbol",
	"@string.special.url",
	"@supports",
	"@tag",
	"@tag.attribute",
	"@tag.delimiter",
	"@type",
	"@type.builtin",
	"@type.definition",
	"@variable",
	"@variable.builtin",
	"@variable.member",
	"@variable.parameter",
	"@variable.parameter.builtin",
}

-- Function to extract colors from a specific colorscheme
local function extract_colorscheme_colors(theme_def)
	local theme_name = theme_def.name
	local colorscheme_name = theme_def.colorscheme
	local appearance = theme_def.appearance

	print(string.format("Processing %s (colorscheme: %s, appearance: %s)...", theme_name, colorscheme_name, appearance))

	-- Reset Neovim state as much as possible
	vim.cmd("colorscheme default")

	-- Clear ALL package cache for theme-related modules
	local preserved_modules = {
		"_G",
		"bit",
		"coroutine",
		"debug",
		"io",
		"lazy",
		"math",
		"os",
		"package",
		"string",
		"table",
		"vim",
		"jit",
	}
	local preserve_list = {}
	for _, mod in ipairs(preserved_modules) do
		preserve_list[mod] = true
	end

	for k in pairs(package.loaded) do
		if not preserve_list[k] then
			package.loaded[k] = nil
		end
	end

	-- Set appearance
	vim.opt.termguicolors = true
	vim.o.background = appearance

	-- Load the colorscheme
	local success, err = pcall(vim.cmd, "colorscheme " .. colorscheme_name)
	if not success then
		print(string.format("Error loading colorscheme for %s: %s", theme_name, err))
		return false
	end

	-- Extract specified highlight groups using the provided code
	local highlights = {}

	for _, group in ipairs(highlight_groups) do
		local hl = vim.api.nvim_get_hl(0, { name = group, link = false })
		local style = {}

		if hl.fg then
			style.fg = string.format("#%06x", hl.fg)
		end

		if hl.bg then
			style.bg = string.format("#%06x", hl.bg)
		end

		if hl.bold then
			style.bold = true
		end
		if hl.italic then
			style.italic = true
		end
		if hl.underline then
			style.underline = true
		end
		if hl.undercurl then
			style.undercurl = true
		end
		if hl.strikethrough then
			style.strikethrough = true
		end

		if next(style) ~= nil then
			highlights[string.lower(string.gsub(group, "@", ""))] = style
		end
	end

	-- Write to JSON file in the current directory
	local output_file = theme_name .. ".json"
	local theme_data = {
		name = theme_name,
		appearance = appearance,
		highlights = highlights,
	}

	local json_str = vim.json.encode(theme_data)
	local file = io.open(output_file, "w")
	if file then
		file:write(json_str)
		file:close()

		-- Use jq to order the fields and the properties within each highlight style
		local jq_cmd = [[jq '
      {
        name,
        appearance,
        highlights: (.highlights | to_entries | sort_by(.key) | map({
          key: .key,
          value: {
            fg: .value.fg,
            bg: .value.bg,
            bold: .value.bold,
            italic: .value.italic,
            undercurl: .value.undercurl,
            underline: .value.underline,
            strikethrough: .value.strikethrough
          } | with_entries(select(.value != null))
        }) | from_entries)
      }' ]] .. output_file .. " > " .. output_file .. ".tmp && mv " .. output_file .. ".tmp " .. output_file

		local jq_result = vim.fn.system(jq_cmd)

		if vim.v.shell_error ~= 0 then
			print("Warning: jq processing failed: " .. jq_result)
		else
			print("JSON file processed with jq (name field first, highlight keys and properties sorted)")
		end

		print(string.format("%s -> %s", theme_name, output_file))
		return true
	else
		print(string.format("Error: Could not write to file %s", output_file))
		return false
	end
end

-- Setup plugins with lazy
print("Setting up plugins...")
local plugins = {}
for _, theme_def in ipairs(themes) do
	-- Make all plugins load immediately (not lazy-loaded)
	local plugin = vim.deepcopy(theme_def.plugin)
	plugin.lazy = false
	plugin.priority = 1000
	table.insert(plugins, plugin)
end

-- Initialize lazy with all theme plugins
-- Configure lazy to work in headless mode
require("lazy").setup(plugins, {
	install = {
		-- Don't change colorscheme during installation
		colorscheme = { "default" },
	},
	-- Disable UI elements that don't work in headless mode
	ui = {
		-- Disable all UI features
		border = "none",
		icons = {
			cmd = "",
			config = "",
			event = "",
			ft = "",
			init = "",
			keys = "",
			plugin = "",
			runtime = "",
			source = "",
			start = "",
			task = "",
		},
		throttle = 99999999, -- Effectively disable UI updates
	},
	-- Don't check for updates
	checker = {
		enabled = false,
	},
})

-- Now process each theme
for _, theme_def in ipairs(themes) do
	extract_colorscheme_colors(theme_def)
end

print("All colorschemes processed successfully.")
vim.cmd("quit!")

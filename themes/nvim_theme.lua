-- https://github.com/nvim-treesitter/nvim-treesitter/blob/master/CONTRIBUTING.md
-- https://github.com/catppuccin/nvim/blob/main/lua/catppuccin/groups/integrations/treesitter.lua

local appearance = arg[1]
local colorscheme = arg[2]
local variables = arg[3]

-- Set up global variables if they were passed
if variables then
	for var_assignment in variables:gmatch("([^,]+)") do
		-- Check for table assignment with format: table_name.key=value
		if var_assignment:match("(.+)%.(.+)=(.+)") then
			local table_name, key, value = var_assignment:match("(.+)%.(.+)=(.+)")
			-- Remove any quotes if present
			value = value:gsub('"', ""):gsub("'", "")

			-- Initialize the table if it doesn't exist
			vim.g[table_name] = vim.g[table_name] or {}
			-- Set the key-value in the table
			vim.g[table_name][key] = value
		else
			-- Handle simple variable assignment with format: name=value
			local var_name, var_value = var_assignment:match("(.+)=(.+)")
			if var_name and var_value then
				-- Remove any quotes if present
				var_value = var_value:gsub('"', ""):gsub("'", "")
				-- Set the global variable
				vim.g[var_name] = var_value
			end
		end
	end
end

vim.o.termguicolors = true
vim.o.background = appearance
vim.cmd.colorscheme(colorscheme)

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

local json_highlights = vim.fn.json_encode(highlights)
print(json_highlights)

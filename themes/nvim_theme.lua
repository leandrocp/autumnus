-- https://github.com/nvim-treesitter/nvim-treesitter/blob/master/CONTRIBUTING.md
-- https://github.com/catppuccin/nvim/blob/main/lua/catppuccin/groups/integrations/treesitter.lua

local appearance = arg[1]
local colorscheme = arg[2]

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
	"@comment",
	"@comment.doc",
	"@comment.documentation",
	"@comment.error",
	"@comment.hint",
	"@comment.note",
	"@comment.todo",
	"@comment.unused",
	"@comment.warning",
	"@comment.warning.gitcommit",
	"@conditional",
	"@constant",
	"@constant.builtin",
	"@constant.java",
	"@constant.macro",
	"@constructor",
	"@constructor.lua",
	"@constructor.tsx",
	"@constructor.typescript",
	"@define",
	"@diff.delta",
	"@diff.minus",
	"@diff.plus",
	"@error",
	"@exception",
	"@field",
	"@float",
	"@function",
	"@function.builtin",
	"@function.builtin.bash",
	"@function.call",
	"@function.macro",
	"@function.method",
	"@function.method.call",
	"@function.method.call.php",
	"@function.method.php",
	"@include",
	"@keyword",
	"@keyword.conditional",
	"@keyword.conditional.ternary",
	"@keyword.coroutine",
	"@keyword.debug",
	"@keyword.directive",
	"@keyword.directive.define",
	"@keyword.exception",
	"@keyword.export",
	"@keyword.function",
	"@keyword.import",
	"@keyword.modifier",
	"@keyword.operator",
	"@keyword.repeat",
	"@keyword.return",
	"@keyword.storage",
	"@keyword.type",
	"@label",
	"@label.json",
	"@markup.environment",
	"@markup.environment.name",
	"@markup.heading",
	"@markup.heading.1",
	"@markup.heading.1.markdown",
	"@markup.heading.2",
	"@markup.heading.2.markdown",
	"@markup.heading.3",
	"@markup.heading.3.markdown",
	"@markup.heading.4",
	"@markup.heading.4.markdown",
	"@markup.heading.5",
	"@markup.heading.5.markdown",
	"@markup.heading.6",
	"@markup.heading.6.markdown",
	"@markup.italic",
	"@markup.link",
	"@markup.link.label",
	"@markup.link.url",
	"@markup.list",
	"@markup.list.checked",
	"@markup.list.unchecked",
	"@markup.math",
	"@markup.quote",
	"@markup.raw",
	"@markup.raw.block",
	"@markup.strikethrough",
	"@markup.strong",
	"@markup.underline",
	"@method",
	"@method.call",
	"@method.call.php",
	"@method.php",
	"@module",
	"@module.builtin",
	"@namespace",
	"@number",
	"@number.css",
	"@number.float",
	"@operator",
	"@parameter",
	"@preproc",
	"@property",
	"@property.class.css",
	"@property.cpp",
	"@property.css",
	"@property.id.css",
	"@property.toml",
	"@property.typescript",
	"@punctuation.bracket",
	"@punctuation.delimiter",
	"@punctuation.special",
	"@repeat",
  "@spell",
	"@storageclass",
	"@string",
	"@string.documentation",
	"@string.escape",
	"@string.plain.css",
	"@string.regex",
	"@string.regexp",
	"@string.special",
	"@string.special.path",
	"@string.special.php.gitignore",
	"@string.special.symbol",
	"@string.special.symbol.ruby",
	"@string.special.url",
	"@symbol",
	"@symbol.ruby",
	"@tag",
	"@tag.attribute",
	"@tag.attribute.tsx",
	"@tag.builtin",
	"@tag.delimiter",
	"@text",
	"@text.danger",
	"@text.diff.add",
	"@text.diff.delete",
	"@text.emphasis",
	"@text.environment",
	"@text.environment.name",
	"@text.literal",
	"@text.math",
	"@text.note",
	"@text.reference",
	"@text.strike",
	"@text.strong",
	"@text.title",
	"@text.title.1.markdown",
	"@text.title.2.markdown",
	"@text.title.3.markdown",
	"@text.title.4.markdown",
	"@text.title.5.markdown",
	"@text.title.6.markdown",
	"@text.todo",
	"@text.todo.checked",
	"@text.todo.unchecked",
	"@text.underline",
	"@text.uri",
	"@text.uri",
	"@text.warning",
	"@type",
	"@type.builtin",
	"@type.builtin.c",
	"@type.builtin.cpp",
	"@type.css",
	"@type.definition",
	"@type.qualifier",
	"@type.tag.css",
	"@variable",
	"@variable.builtin",
	"@variable.member",
	"@variable.member.yaml",
	"@variable.member.yaml",
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

-- local output_data = {
-- 	name = name,
-- 	highlights = highlights,
-- }
--
-- local output_file = string.format("%s.json", name)
-- local file = io.open(output_file, "w")
-- local json_str = vim.fn.json_encode(output_data)
-- file:write(json_str)
-- file:close()

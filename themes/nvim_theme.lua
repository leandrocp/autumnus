local colorscheme = arg[1]
local name = string.gsub(colorscheme, "-", "_")

vim.cmd.colorscheme(colorscheme)

local highlight_groups = {
	"Normal",
	"Comment",
	"@variable",
	"@variable.builtin",
	"@variable.parameter",
	"@variable.parameter.builtin",
	"@variable.member",
	"@constant",
	"@constant.builtin",
	"@constant.macro",
	"@module",
	"@module.builtin",
	"@label",
	"@string",
	"@string.documentation",
	"@string.regexp",
	"@string.escape",
	"@string.special",
	"@string.special.symbol",
	"@string.special.url",
	"@string.special.path",
	"@character",
	"@character.special",
	"@boolean",
	"@number",
	"@number.float",
	"@type",
	"@type.builtin",
	"@type.definition",
	"@attribute",
	"@attribute.builtin",
	"@property",
	"@function",
	"@function.builtin",
	"@function.call",
	"@function.macro",
	"@function.method",
	"@function.method.call",
	"@constructor",
	"@operator",
	"@keyword",
	"@keyword.coroutine",
	"@keyword.function",
	"@keyword.operator",
	"@keyword.import",
	"@keyword.type",
	"@keyword.modifier",
	"@keyword.repeat",
	"@keyword.return",
	"@keyword.debug",
	"@keyword.exception",
	"@keyword.conditional",
	"@keyword.conditional.ternary",
	"@keyword.directive",
	"@keyword.directive.define",
	"@punctuation.delimiter",
	"@punctuation.bracket",
	"@punctuation.special",
	"@comment",
	"@comment.documentation",
	"@comment.error",
	"@comment.warning",
	"@comment.todo",
	"@comment.note",
	"@markup.strong",
	"@markup.italic",
	"@markup.strikethrough",
	"@markup.underline",
	"@markup.heading",
	"@markup.heading.1",
	"@markup.heading.2",
	"@markup.heading.3",
	"@markup.heading.4",
	"@markup.heading.5",
	"@markup.heading.6",
	"@markup.quote",
	"@markup.math",
	"@markup.link",
	"@markup.link.label",
	"@markup.link.url",
	"@markup.raw",
	"@markup.raw.block",
	"@markup.list",
	"@markup.list.checked",
	"@markup.list.unchecked",
	"@diff.plus",
	"@diff.minus",
	"@diff.delta",
	"@tag",
	"@tag.builtin",
	"@tag.attribute",
	"@tag.delimiter",
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

local output_data = {
	name = name,
	highlights = highlights,
}

local output_file = string.format("%s.json", name)
local file = io.open(output_file, "w")
local json_str = vim.fn.json_encode(output_data)
file:write(json_str)
file:close()

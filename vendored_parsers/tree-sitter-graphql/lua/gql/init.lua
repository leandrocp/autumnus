local Query = require'vim.treesitter.query'
local ts_utils = require'nvim-treesitter.ts_utils'

local M = {}

vim.treesitter.require_language('graphql', '/local/repos/oss/tree-sitter-graphql/build/parser.so')

local read = function(f)
  local fp = assert(io.open(f))
  local contents = fp:read("all")
  fp:close()

  return contents
end

local get_query = function(query_name)
 local query = read(string.format('./queries/graphql/%s.scm', query_name))
 return query
end

M.print_something = function()
  print('Printing from the module')
end

local get_fields_definitions = function(root, query)
  local definition_sets = {}
  for id, node in query:iter_captures(root, 0, 0, -1) do
   if query.captures[id] == 'fields_definition' then
     table.insert(definition_sets, node)
   end
  end
  return definition_sets
end

local get_fields_definition_fields = function(root, query, start_row, end_row)
  local field_definitions = {}
  for id, node in query:iter_captures(root, 0, start_row, end_row) do
    if query.captures[id] == 'field_definition' then
      table.insert(field_definitions, node)
    end
  end
  return field_definitions
end

local get_field_name = function(root, start_row, end_row)
  local query = vim.treesitter.parse_query('graphql', '(field_definition (name) @name)')

  local name = ''
  for id, node in query:iter_captures(root, 0, 0, -1) do
    if query.captures[id] == 'name' and node:start() >= start_row and node:end_() <= end_row then
      name = node
    end
  end
  return name
end
--local get_fields = function(root, start_row, end_row)
  --local query_string = '((field_definition (name) @name))'
  --local query = vim.treesitter.parse_query('graphql', query_string)
  --local name = ''
  --for _, capture in query:iter_captures(root, 0, start_row, end_row) do
    --local type = capture:type()
    --print(type)
    --local row1, col1, row2, col2 = capture:range()
    --print(string.format('rows: %s - %s --- cols: %s - %s', row1, row2, col1, col2))
  --end
  --return name
--end


M.execute = function()
  local parser = vim.treesitter.get_parser(0, 'graphql')
  local query = vim.treesitter.parse_query('graphql', get_query('formatter'))

  local tree = parser:parse()
  local root
  for _,t in pairs(tree) do
    root = t:root()
  end

  local definitions_sets = get_fields_definitions(root, query)

  for _, node in pairs(definitions_sets) do
    local start_row, _, end_row, _ = node:range()
    local fields = get_fields_definition_fields(root, query, start_row, end_row)

    for _, field_node in pairs(fields) do
      local field_start_row, _, field_end_row, _ = field_node:range()
      local name = get_field_name(root, field_start_row, field_end_row)

      --local edits = {} local range = ts_utils.node_to_lsp_range(name)
      --table.insert(edits, { range = range, newText = 'hello' })
      --vim.lsp.util.apply_text_edits(edits,  0)
    end
  end
end

--- Get all field_definitions in a fields_definition
--- @param start_row string
--- @param end_row string


M.reload = function()
  print('Reloading module')
  require'plenary.reload'.reload_module('lua.gql.init')
end

return M

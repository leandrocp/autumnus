#!/usr/bin/env lua

local h = io.popen("luarocks path --lua-version 5.4 --lr-path 2>/dev/null")
if h then
   local lr_path = h:read("*a"):gsub("%s+$", "")
   h:close()
   if lr_path ~= "" then package.path = lr_path .. ";" .. package.path end
end
local h2 = io.popen("luarocks path --lua-version 5.4 --lr-cpath 2>/dev/null")
if h2 then
   local lr_cpath = h2:read("*a"):gsub("%s+$", "")
   h2:close()
   if lr_cpath ~= "" then package.cpath = lr_cpath .. ";" .. package.cpath end
end

local toml_edit = require("toml_edit")


local CARGO_TOML = "crates/lumis/Cargo.toml"

local function run(cmd)
   local p = io.popen(cmd)
   if not p then return "" end
   local out = p:read("*a")
   p:close()
   return (out:gsub("%s+$", ""))
end

local function read_file(path)
   local f = assert(io.open(path, "r"))
   local text = f:read("*a")
   f:close()
   return text
end

local function write_file(path, text)
   local f = assert(io.open(path, "w"))
   f:write(text)
   f:close()
end

local function read_cargo_toml()
   return toml_edit.parse(read_file(CARGO_TOML))
end

local function read_cargo_toml_tbl()
   return toml_edit.parse_as_tbl(read_file(CARGO_TOML))
end

local function write_cargo_toml(doc)
   write_file(CARGO_TOML, tostring(doc))
end

local function git_ls_remote(url)
   return run("git ls-remote " .. url .. " HEAD | cut -f1")
end

local function sorted_keys(tbl)
   local keys = {}
   for k in pairs(tbl) do keys[#keys + 1] = k end
   table.sort(keys)
   return keys
end

local function tmpdir()
   return run("mktemp -d")
end

local function resolve_query_source(queries, query_name)
   if queries[query_name] and query_name ~= "default" then
      return queries[query_name]
   end
   return queries.default
end

local function query_names()
   local names = {}
   local p = io.popen('ls -1 crates/lumis/queries/')
   for name in p:lines() do
      if name ~= "README.md" then names[#names + 1] = name end
   end
   p:close()
   table.sort(names)
   return names
end

local function cmd_list()
   local tbl = read_cargo_toml_tbl()
   local parsers = tbl.package.metadata.langs.parsers
   for _, k in ipairs(sorted_keys(parsers)) do
      print(k)
   end
end

local function cmd_upgrade_parsers(name)
   local doc = read_cargo_toml()
   local tbl = read_cargo_toml_tbl()
   local parsers = tbl.package.metadata.langs.parsers

   local tmp = tmpdir()
   os.execute("curl -sL https://raw.githubusercontent.com/nvim-treesitter/nvim-treesitter/main/lua/nvim-treesitter/parsers.lua -o " .. tmp .. "/parsers.lua")

   for _, parser_name in ipairs(sorted_keys(parsers)) do
      local info = parsers[parser_name]
      if info.git then
         if name ~= "" and parser_name ~= name then goto continue end

         local new_rev = ""
         local lua_code = string.format(
            "local parsers = dofile('%s/parsers.lua'); local li = parsers['%s']; if li and li.install_info and li.install_info.revision then print(li.install_info.revision) end",
            tmp, parser_name
         )
         local rev_from_lua = run("lua -e \"" .. lua_code:gsub('"', '\\"') .. "\" 2>/dev/null")

         if rev_from_lua ~= "" then
            new_rev = rev_from_lua
         else
            new_rev = git_ls_remote(info.git)
         end

         if new_rev == "" then
            print("Warning: could not resolve revision for " .. parser_name .. ", skipping")
            goto continue
         end

         if info.rev == new_rev then
            print("  " .. parser_name .. ": already up to date (" .. info.rev .. ")")
         else
            print("  " .. parser_name .. ": " .. info.rev .. " -> " .. new_rev)
            doc.package.metadata.langs.parsers[parser_name].rev = new_rev
         end

         ::continue::
      end
   end

   write_cargo_toml(doc)
   os.execute("rm -rf " .. tmp)
   print("Done. Review changes with: git diff " .. CARGO_TOML)
end

local function cmd_get_parsers(name)
   local tbl = read_cargo_toml_tbl()
   local parsers = tbl.package.metadata.langs.parsers
   local tmp = tmpdir()

   for _, parser_name in ipairs(sorted_keys(parsers)) do
      local info = parsers[parser_name]
      if not info.git then goto continue end
      if name ~= "" and parser_name ~= name then goto continue end

      local parser_dir = "tree-sitter-" .. parser_name
      local clone_dir = tmp .. "/" .. parser_dir

      print("Fetching " .. parser_name .. " from " .. info.git .. " at " .. info.rev)

      os.execute("git clone " .. info.git .. " " .. clone_dir .. " 2>/dev/null")
      os.execute("cd " .. clone_dir .. " && git checkout " .. info.rev .. " 2>/dev/null")

      local dest = "crates/lumis/vendored_parsers/" .. parser_dir
      os.execute("mkdir -p " .. dest)

      if info.generate then
         os.execute("rm -rf " .. dest .. "/*")
         os.execute("cp -r " .. clone_dir .. "/* " .. dest .. "/")
         os.execute("cd " .. dest .. " && npm install --no-save tree-sitter-cli && npx tree-sitter generate")
         os.execute("rm -f " .. dest .. "/Cargo.toml")
         os.execute("rm -rf " .. dest .. "/node_modules")
         os.execute("rm -rf " .. dest .. "/bindings")
         print("  Updated " .. parser_name .. " (generated)")
      elseif info.location then
         local src = clone_dir .. "/" .. info.location .. "/src"
         if os.execute("test -d " .. src) then
            os.execute("rm -rf " .. dest .. "/src")
            os.execute("cp -r " .. src .. " " .. dest .. "/")
            print("  Updated " .. parser_name .. " (location: " .. info.location .. ")")
         else
            print("  Warning: no src directory found for " .. parser_name .. " in location " .. info.location)
         end
      else
         local src = clone_dir .. "/src"
         if os.execute("test -d " .. src) then
            os.execute("rm -rf " .. dest .. "/src")
            os.execute("cp -r " .. src .. " " .. dest .. "/")
            print("  Updated " .. parser_name)
         else
            print("  Warning: no src directory found for " .. parser_name)
         end
      end

      os.execute("rm -rf " .. clone_dir)
      ::continue::
   end

   os.execute("rm -rf " .. tmp)
end

local function cmd_upgrade_queries(name)
   local doc = read_cargo_toml()
   local tbl = read_cargo_toml_tbl()
   local queries = tbl.package.metadata.langs.queries

   local url_revs = {}
   for _, query_name in ipairs(sorted_keys(queries)) do
      local url = queries[query_name].git
      if not url_revs[url] then
         local rev = git_ls_remote(url)
         url_revs[url] = rev
         print("  " .. url .. " -> " .. rev:sub(1, 12))
      end
   end

   for _, query_name in ipairs(sorted_keys(queries)) do
      if name ~= "" and query_name ~= name and query_name ~= "default" then goto continue end

      local info = queries[query_name]
      local new_rev = url_revs[info.git]

      if info.rev ~= new_rev then
         print("  " .. query_name .. ": " .. info.rev:sub(1, 12) .. " -> " .. new_rev:sub(1, 12))
         doc.package.metadata.langs.queries[query_name].rev = new_rev
      end

      ::continue::
   end

   write_cargo_toml(doc)
   print("Done. Review changes with: git diff " .. CARGO_TOML)
end

local function cmd_get_queries(name)
   local tbl = read_cargo_toml_tbl()
   local queries = tbl.package.metadata.langs.queries

   local tmp = tmpdir()
   local repo_clones = {}

   for _, query_name in ipairs(query_names()) do
      if name ~= "" and query_name ~= name then goto continue end

      local info = resolve_query_source(queries, query_name)
      local clone_key = info.git .. "@" .. info.rev

      if not repo_clones[clone_key] then
         local hash = run("echo " .. clone_key .. " | md5sum 2>/dev/null || echo " .. clone_key .. " | md5")
         hash = hash:match("%S+")
         local clone_dir = tmp .. "/repo-" .. hash
         print("Cloning " .. info.git .. " at " .. info.rev:sub(1, 12))
         os.execute("git clone " .. info.git .. " " .. clone_dir .. " 2>/dev/null")
         os.execute("cd " .. clone_dir .. " && git checkout " .. info.rev .. " 2>/dev/null")
         repo_clones[clone_key] = clone_dir
      end

      local clone_dir = repo_clones[clone_key]
      local dest = "crates/lumis/queries/" .. query_name

      local src_dir
      if info.path then
         src_dir = clone_dir .. "/" .. info.path
         -- default path is a prefix, append query name
         if not queries[query_name] or query_name == "default" then
            src_dir = src_dir .. "/" .. query_name
         end
      else
         -- fallback for entries without path
         src_dir = clone_dir .. "/queries"
         if os.execute("test -d " .. src_dir .. "/" .. query_name) then
            src_dir = src_dir .. "/" .. query_name
         end
      end

      if os.execute("test -d " .. src_dir) then
         os.execute("mkdir -p " .. dest)
         os.execute("cp -r " .. src_dir .. "/* " .. dest .. "/ 2>/dev/null")
         print("  Updated " .. query_name .. " queries")
      else
         print("  Warning: no queries found for " .. query_name)
      end

      ::continue::
   end

   os.execute("rm -rf " .. tmp)
end

local function resolve_dep_version(deps, lang, dep_field)
   local crate_name
   if dep_field == true then
      crate_name = "tree-sitter-" .. lang
   else
      crate_name = dep_field
   end
   local dep = deps[crate_name]
   if not dep then return nil, crate_name end
   if type(dep) == "string" then return dep, crate_name end
   return dep.version, crate_name
end

local function cmd_gen_languages()
   local tbl = read_cargo_toml_tbl()
   local parsers = tbl.package.metadata.langs.parsers
   local queries = tbl.package.metadata.langs.queries
   local deps = tbl.dependencies

   local lines = {}
   lines[#lines + 1] = "# Supported Languages"
   lines[#lines + 1] = ""
   lines[#lines + 1] = "| Language | Parser | Vendored | Version / Rev | Queries |"
   lines[#lines + 1] = "|----------|--------|----------|---------------|---------|"

   for _, lang in ipairs(sorted_keys(parsers)) do
      local info = parsers[lang]
      local vendored, version_col, parser_link

      if info.git then
         vendored = "yes"
         local short_rev = info.rev:sub(1, 7)
         local repo_path = info.git:gsub("https://github.com/", ""):gsub("%.git$", "")
         version_col = "`" .. short_rev .. "`"
         parser_link = "[tree-sitter-" .. lang .. "](https://github.com/" .. repo_path .. "/tree/" .. info.rev .. ")"
      elseif info.dep then
         vendored = "no"
         local version, crate_name = resolve_dep_version(deps, lang, info.dep)
         local v = version or "?"
         version_col = "`" .. v .. "`"
         parser_link = "[tree-sitter-" .. lang .. "](https://crates.io/crates/" .. crate_name .. "/" .. v .. ")"
      end

      local qi = resolve_query_source(queries, lang)
      local query_repo_path = qi.git:gsub("https://github.com/", ""):gsub("%.git$", "")
      local query_repo_name = query_repo_path:match("([^/]+)$")
      local query_short_rev = qi.rev:sub(1, 7)
      local query_col = "[" .. query_repo_name .. "](https://github.com/" .. query_repo_path .. "/tree/" .. qi.rev .. ") `" .. query_short_rev .. "`"

      lines[#lines + 1] = "| " .. lang .. " | " .. parser_link .. " | " .. vendored .. " | " .. version_col .. " | " .. query_col .. " |"
   end

   write_file("LANGUAGES.md", table.concat(lines, "\n") .. "\n")
   print("Generated LANGUAGES.md")
end

local commands = {
   list = cmd_list,
   ["upgrade-parsers"] = function() cmd_upgrade_parsers(arg[2] or "") end,
   ["fetch-parsers"] = function() cmd_get_parsers(arg[2] or "") end,
   ["upgrade-queries"] = function() cmd_upgrade_queries(arg[2] or "") end,
   ["fetch-queries"] = function() cmd_get_queries(arg[2] or "") end,
   ["gen-languages"] = cmd_gen_languages,
}

local subcmd = arg[1]
if not subcmd or not commands[subcmd] then
   io.stderr:write("Usage: lua scripts/langs.lua <command> [name]\n")
   io.stderr:write("Commands: list, upgrade-parsers, fetch-parsers, upgrade-queries, fetch-queries, gen-languages\n")
   os.exit(1)
end

commands[subcmd]()

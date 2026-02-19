#!/usr/bin/env lua

local function confirm(msg)
   io.write(msg .. "\n\nDo you want to proceed? (y/N) ")
   io.flush()
   local reply = io.read("*l") or ""
   if not reply:match("^[Yy]$") then
      print("Operation cancelled.")
      os.exit(0)
   end
end

local function theme_names()
   local themes = dofile("themes/themes.lua")
   local names = {}
   for _, theme in ipairs(themes) do
      names[#names + 1] = theme.name
   end
   table.sort(names)
   return names
end

local function sync_themes()
   os.execute("mkdir -p crates/lumis/themes")
   os.execute("rm -f crates/lumis/themes/*.json")
   os.execute("cp themes/*.json crates/lumis/themes/")
   print("Synced theme JSON files to crates/lumis/themes/")
end

local function sync_css()
   os.execute("mkdir -p crates/lumis/css")
   os.execute("mkdir -p packages/elixir/lumis/priv/static/css")
   os.execute("rm -f crates/lumis/css/*.css")
   os.execute("rm -f packages/elixir/lumis/priv/static/css/*.css")
   os.execute("cp css/*.css crates/lumis/css/")
   os.execute("cp css/*.css packages/elixir/lumis/priv/static/css/")
   print("Synced CSS files to crates/lumis/css/ and packages/elixir/lumis/priv/static/css/")
end

local function cmd_list()
   for _, name in ipairs(theme_names()) do
      print(name)
   end
end

local function cmd_gen(name)
   if name == "" then
      confirm("This will regenerate all theme files in themes/")
      os.execute("find themes -type f -name '*.json' -delete")
      for _, theme_name in ipairs(theme_names()) do
         print("Generating " .. theme_name .. "...")
         os.execute("nvim --clean --headless -V3 -u themes/init.lua -l themes/extract_theme.lua " .. theme_name)
      end
   else
      confirm("This will regenerate " .. name .. " in themes/")
      os.execute("nvim --clean --headless -V3 -u themes/init.lua -l themes/extract_theme.lua " .. name)
   end
   sync_themes()
end

local function cmd_sync()
   sync_themes()
end

local function cmd_gen_css()
   confirm("This will regenerate files in css/")
   os.execute("find css -type f -name '*.css' -delete")
   os.execute("cargo run -p dev --release gen-css")
   sync_css()
end

local function cmd_sync_css()
   sync_css()
end

local function cmd_gen_themes()
   local themes = dofile("themes/themes.lua")

   -- build sorted theme entries
   local entries = {}
   for _, theme in ipairs(themes) do
      entries[#entries + 1] = {
         name = theme.name,
         url = theme.url,
      }
   end
   table.sort(entries, function(a, b) return a.name < b.name end)

   -- build repo display name from URL
   local function repo_name(url)
      local path = url:match("github%.com/(.+)$")
      return path or url
   end

   -- write THEMES.md
   local lines = {}
   lines[#lines + 1] = "# Supported Themes"
   lines[#lines + 1] = ""
   lines[#lines + 1] = "| Theme | Repository |"
   lines[#lines + 1] = "|-------|------------|"
   for _, entry in ipairs(entries) do
      local name = repo_name(entry.url)
      lines[#lines + 1] = "| `" .. entry.name .. "` | [" .. name .. "](" .. entry.url .. ") |"
   end
   lines[#lines + 1] = ""

   local f = io.open("THEMES.md", "w")
   f:write(table.concat(lines, "\n"))
   f:close()
   print("Generated THEMES.md with " .. #entries .. " themes")
end

local commands = {
   list = cmd_list,
   gen = function() cmd_gen(arg[2] or "") end,
   sync = cmd_sync,
   ["gen-css"] = cmd_gen_css,
   ["sync-css"] = cmd_sync_css,
   ["gen-themes"] = cmd_gen_themes,
}

local subcmd = arg[1]
if not subcmd or not commands[subcmd] then
   io.stderr:write("Usage: lua scripts/themes.lua <command> [name]\n")
   io.stderr:write("Commands: list, gen, sync, gen-css, sync-css, gen-themes\n")
   os.exit(1)
end

commands[subcmd]()

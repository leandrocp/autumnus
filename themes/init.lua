vim.env.XDG_DATA_HOME = "nvim/data"

local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not (vim.uv or vim.loop).fs_stat(lazypath) then
	local lazyrepo = "https://github.com/folke/lazy.nvim.git"
	local out = vim.fn.system({ "git", "clone", "--filter=blob:none", "--branch=stable", lazyrepo, lazypath })
	if vim.v.shell_error ~= 0 then
		vim.api.nvim_echo({
			{ "Failed to clone lazy.nvim:\n", "ErrorMsg" },
			{ out, "WarningMsg" },
			{ "\nPress any key to exit..." },
		}, true, {})
		vim.fn.getchar()
		os.exit(1)
	end
end
vim.opt.rtp:prepend(lazypath)

require("lazy").setup({
	spec = {
		{
			"catppuccin/nvim",
			lazy = false,
			name = "catppuccin",
			priority = 1000,
		},
		{
			"folke/tokyonight.nvim",
			lazy = false,
			priority = 1000,
			opts = {},
		},
		{
			"projekt0n/github-nvim-theme",
			name = "github-theme",
			lazy = false,
			priority = 1000,
		},
		{
			"rebelot/kanagawa.nvim",
			name = "kanagawa",
			lazy = false,
			priority = 1000,
		},
		{
			"ellisonleao/gruvbox.nvim",
			lazy = false,
			priority = 1000,
		},
		{
			"Mofiqul/dracula.nvim",
			lazy = false,
			priority = 1000,
		},
		{
			"Mofiqul/vscode.nvim",
			lazy = false,
			priority = 1000,
		},
		{
			"navarasu/onedark.nvim",
			lazy = false,
			priority = 1000,
		},
		{
			"maxmx03/solarized.nvim",
			lazy = false,
			priority = 1000,
		},
		{
			"marko-cerovac/material.nvim",
			lazy = false,
			priority = 1000,
		},
		{
			"shaunsingh/nord.nvim",
			lazy = false,
			priority = 1000,
		},
		{
      "olimorris/onedarkpro.nvim",
			lazy = false,
			priority = 1000,
		},
	},
	checker = { enabled = true },
})

{
  description = "Treesitter http grammar";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }: 
    flake-utils.lib.eachSystem [ "x86_64-linux" ] (system:
      let 
        pkgs = nixpkgs.legacyPackages.${system};
      in {


    devShells = {
      default = pkgs.mkShell {
        buildInputs = [ 
          pkgs.tree-sitter
          (pkgs.vimPlugins.nvim-treesitter.withPlugins(p: [ p.json ]))
          pkgs.nodejs
          pkgs.python3  # needed by node-gyp
        ];
      };
    };
  });
}

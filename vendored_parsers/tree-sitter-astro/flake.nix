{
    description = "Tree-sitter for the Astro SSG";

    inputs = {
        flake-utils.url = "github:numtide/flake-utils";
    };

    outputs = { self, nixpkgs, flake-utils }: (flake-utils.lib.eachDefaultSystem (system: let
        pkgs = nixpkgs.legacyPackages.${system};

        appliedOverlay = self.overlays.default pkgs pkgs;
    in {
        devShell = pkgs.mkShell {
            buildInputs = with pkgs; [
                tree-sitter
            ];
        };

        packages.default = appliedOverlay.tree-sitter.passthru.builtGrammars.tree-sitter-astro;
    })) // {
        overlays.default = final: prev: {
            tree-sitter = prev.tree-sitter.override {
                extraGrammars = {
                    tree-sitter-astro = prev.tree-sitter.buildGrammar {
                        language = "astro";
                        src = prev.lib.cleanSource ./.;
                        version = self.shortRev or "latest";
                    };
                };
            };
        };
    };
}

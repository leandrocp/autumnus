package tree_sitter_vim_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter-grammars/tree-sitter-vim"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_vim.Language())
	if language == nil {
		t.Errorf("Error loading Vim grammar")
	}
}

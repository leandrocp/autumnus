package tree_sitter_powershell_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-powershell"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_powershell.Language())
	if language == nil {
		t.Errorf("Error loading Powershell grammar")
	}
}

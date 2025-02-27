package tree_sitter_liquid_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-liquid"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_liquid.Language())
	if language == nil {
		t.Errorf("Error loading Liquid grammar")
	}
}

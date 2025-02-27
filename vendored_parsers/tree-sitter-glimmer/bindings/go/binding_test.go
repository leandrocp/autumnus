package tree_sitter_glimmer_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-glimmer"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_glimmer.Language())
	if language == nil {
		t.Errorf("Error loading Glimmer grammar")
	}
}

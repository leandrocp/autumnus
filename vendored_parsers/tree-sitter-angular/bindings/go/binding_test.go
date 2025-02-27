package tree_sitter_angular_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-angular"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_angular.Language())
	if language == nil {
		t.Errorf("Error loading Angular grammar")
	}
}

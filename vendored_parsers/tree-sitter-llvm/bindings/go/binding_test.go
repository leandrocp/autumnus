package tree_sitter_llvm_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-llvm"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_llvm.Language())
	if language == nil {
		t.Errorf("Error loading Llvm grammar")
	}
}

package tree_sitter_cmake_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_cmake "github.com/uyha/tree-sitter-cmake/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_cmake.Language())
	if language == nil {
		t.Errorf("Error loading Cmake grammar")
	}
}

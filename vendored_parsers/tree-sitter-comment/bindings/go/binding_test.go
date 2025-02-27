package tree_sitter_comment_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/stsewd/tree-sitter-comment"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_comment.Language())
	if language == nil {
		t.Errorf("Error loading Comment grammar")
	}
}

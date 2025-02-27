# tree-sitter-astro

Tree-sitter grammar for the Astro web framework.

## Troubleshooting

### Parser dependencies

If the syntax highlighting doesn't work for embedded CSS/JSX, make sure you have all of the following tree-sitter parsers installed:

- `css` (for CSS in `style` elements)
- `typescript` (for the frontmatter)

### lazy.nvim

If you're using the [`lazy.nvim`](https://github.com/folke/lazy.nvim) plugin manager, do _not_ use the `opts` key for the nvim-treesitter plugin (it won't work, as nvim-treesitter doesn't have a `.config()` function). Use `require('nvim-treesitter.configs').setup(opts)` instead. For more information, take a look at [#16](https://github.com/virchau13/tree-sitter-astro/issues/16).

## Specification

There are two parts to an Astro document, as shown below:
<pre><code>---
<i>{frontmatter}</i>
---
<i>{astro html}</i>
</pre></code>
These have to be handled differently.

### The frontmatter
This is just injected TypeScript.

### Astro's special HTML format
Astro's special HTML format is *not* JSX/TSX, but rather an extension of HTML. This grammar is an extension of the grammar from [tree-sitter-html](https://github.com/tree-sitter/tree-sitter-html).

Astro's HTML is parsed as regular HTML with four exceptions.

#### Fragment tags
Astro allows tags with no name.
```astro
<>
    <p> hi </p>
</>
```
These are used as tags that aren't actually present in the final HTML.  
These are implemented by special-casing unnamed elements in the external lexer.

#### Attribute interpolations
These are special attributes that evaluate to the result of a TypeScript expression. Astro's docs call these "expressions". They come in two forms:
```astro
<div style={styleMap}></div>
<div {...attrMap}></div>
```
These are just handled as injected TypeScript.

#### Attribute backtick strings
These are also special attributes that evaluate to the result of a TypeScript expression, but instead of being wrapped in braces, they're JS backtick strings. They appear to be undocumented.
```astro
<a href=`/pages/${nextPage}`>Link</a>
```
These are also handled as injected TypeScript.

#### HTML interpolations
These are TypeScript expressions that get evaluated to dynamically make a HTML node. Astro's docs also calls these "expressions", but for the purposes of the parser they are very different.
```
<div>
    {variable}
</div>
```
In the Astro compiler, HTML interpolations are actually handled as [special HTML nodes](https://github.com/withastro/compiler/blob/e8b6cdfc89f940a411304787632efd8140535feb/internal/parser.go#L2736). We do the same here.  
Balanced curly braces inside HTML interpolations will turn into a nested stack of HTML interpolations.  
Note that since this is not JSX, there are things valid in Astro that aren't in JSX, and there are things that are valid in JSX that aren't in Astro. For instance,
```astro
<ValidAstro>
    {(() => {
        let name = 
            <!-- You can just leave HTML comments anywhere you want. -->
            <!-- They are completely disregarded by the compiler. -->
            "value";
        // Multiple elements can be put next to each other,
        // which isn't possible in JSX without a containing element.
        let ret = (
            <p> paragraph 1 </p>
            <p> paragraph 2 </p>
        );
    })()}
</ValidAstro>
```
```jsx
<ValidJSX>
    {(() => {
        let p = 2;
        let invalidInAstro = 1<p>"</p>";
        // In JavaScript, the above parses as (1 < p) > "</p>",
        // which evaluates to false.
        // However, since the Astro compiler has no knowledge of JS,
        // it sees the above as the text "1", then
        // a p-tag with a quote character as innerText, then a single quote character again.
        // This compiles to something like
        // let invalidInAstro = 1 $$render(`<p>"</p>`)";
        // which is a syntax error.
    })()}
</ValidJSX>
```


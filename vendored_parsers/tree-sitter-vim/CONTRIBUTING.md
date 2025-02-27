# Contributing to this repository

Hey, and thank you for wanting to help me build this project !

There is still quite a lot to do, and the main axes of improvements
are:

- Add support for more builtin commands: the list of currently
  supported builtin commands can be found in the [keywords file]
- Add support for language constructs.

## Adding a new builtin command

To add a new command, you only need to modify the [grammar] and the
[keywords file], by doing the following:

1. Add the following in the [keywords file], in the `KEYWORDS` object:
```js
<UPPERCASE UNIQUE NAME> = {
  mandat = "<mandatory part of the command>",
  opt = "<optional part of the command>",
  ignore_comments_after = true|false <whether the parser needs to ignore comments after this command>
}
```
2. Add a new rule named `<command name>_statement` in the [grammar],
   and add it to the `statement` rule. To use the command keyword in
   the grammar, use `utils.keyword($, "<command name>")`.
3. Add a test for your command in a custom file in the `test/corpus`
   directory.
4. Add highlighting for this command in [the highlight query], and
   test it in [the highlight tests].

Then open a pull request, and you'll be good to go !

Some notes on how this all works internally: we generate the keywords
so that they can be used in the external scanner. To avoid to much
hastle, and ensure the synchronisation between the grammar and the
external scanner, some things must be done correctly. The `<UPPERCASE UNIQUE NAME>`
is actually the name of the token on the C side.
We create, for each keyword in the grammar, a hidden _external rule_
named `"_" + mandat + opt`, and thus the `<command name>` mentionned
above is actually `mandat + opt`.

## Adding new language constructs

It should be sufficient to just modify the `grammar.js` for that,
adding the appropriate rules.

Be mindful though that you need to handle the command separators on
your own, using the `$._cmd_separator` rule.

[scanner file]: ./src/scanner.c
[grammar]: ./grammar.js
[the highlight query]: ./queries/highlights.scm
[the highlight tests]: ./test/highlight/
[keywords file]: ./keywords.js

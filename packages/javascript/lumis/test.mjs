// packages/javascript/lumis/test.mjs
import { createHighlighter } from "@lumis-sh/lumis";
import { htmlInline } from "@lumis-sh/lumis/formatters";
import elixir from "@lumis-sh/lumis/langs/elixir";
import dracula from "@lumis-sh/themes/dracula";

const highlighter = await createHighlighter({ languages: [elixir] });
const html = highlighter.highlight(
  'def foo, do: "hello"',
  htmlInline({ language: elixir, theme: dracula }),
);
console.log(html);

import { createHighlighter } from "@lumis-sh/lumis";
import { htmlLinked } from "@lumis-sh/lumis/formatters";
import css from "@lumis-sh/wasm-css";
import markdown from "@lumis-sh/wasm-markdown";
import web from "@lumis-sh/wasm-bundle-web";

async function render(languages, language, source) {
  try {
    const highlighter = await createHighlighter({ languages });
    await highlighter.loadLanguage(language);
    return highlighter.highlight(source, htmlLinked({ language }));
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

const output = document.querySelector("#output");
output.textContent = JSON.stringify({
  css: await render([css], "css", "a { color: red; }"),
  markdown: await render([markdown], "markdown", "# Title\n\nSome *emphasis*.\n"),
  bundle: await render([web], "typescript", "const answer: number = 42;\n"),
});

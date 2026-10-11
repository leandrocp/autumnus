import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { htmlInline, htmlLinked, htmlMultiThemes } from "@lumis-sh/lumis/formatters";
import rehypeLumis from "@lumis-sh/rehype-lumis";
import markdownItLumis from "@lumis-sh/markdown-it-lumis";
import viteLumis from "@lumis-sh/vite";
import { renderCodeBlock } from "@lumis-sh/react/server";
import { renderToStaticMarkup } from "react-dom/server";
import MarkdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";
import { unified } from "unified";
import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";

const require = createRequire(import.meta.url);
for (const name of ["rehype-lumis", "markdown-it-lumis", "react", "vite"]) {
  const integrationRequire = createRequire(import.meta.resolve(`@lumis-sh/${name}`));
  assert.equal(
    integrationRequire.resolve("@lumis-sh/lumis/formatters"),
    require.resolve("@lumis-sh/lumis/formatters"),
    `${name} must use the application's Lumis`,
  );
}

const theme = { name: "test", appearance: "dark", highlights: {} };
const html =
  '<pre id="keep-me" class="authored" data-panel="output" role="tabpanel"><code class="language-plaintext" id="source">hello</code></pre>';

function checkAttributes(output) {
  for (const attribute of ['id="keep-me"', 'data-panel="output"', 'role="tabpanel"']) {
    assert.ok(output.includes(attribute), `lost ${attribute}: ${output}`);
  }
  assert.match(output, /class="[^"]*\bauthored\b/u);
  assert.ok(output.includes("hello"));
}

for (const factory of [
  htmlInline,
  htmlLinked,
  (options) => htmlMultiThemes({ ...options, themes: { dark: theme } }),
]) {
  const options = { formatter: (language) => factory({ language }) };
  const processor = unified().use(rehypeLumis, options);
  const rehypeOutput = toHtml(await processor.run(fromHtml(html, { fragment: true })));
  checkAttributes(rehypeOutput);
  assert.ok(rehypeOutput.includes('id="source"'));

  const md = new MarkdownIt().use(markdownItAttrs).use(await markdownItLumis(options));
  checkAttributes(
    md.render('```plaintext {#keep-me .authored data-panel="output" role="tabpanel"}\nhello\n```'),
  );

  const plugin = viteLumis(options);
  assert.equal(typeof plugin.transformIndexHtml, "function");
  const viteOutput = await plugin.transformIndexHtml(html);
  checkAttributes(viteOutput);
  assert.ok(viteOutput.includes('id="source"'));

  const reactOutput = renderToStaticMarkup(
    await renderCodeBlock({
      children: "hello",
      formatter: factory({
        language: "plaintext",
        preAttrs: { id: "keep-me", class: "authored", "data-panel": "output", role: "tabpanel" },
      }),
    }),
  );
  checkAttributes(reactOutput);
}

console.log(
  "Four packed integrations share the consumer's Lumis; all three HTML formatters preserve attributes.",
);

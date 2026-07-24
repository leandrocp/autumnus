import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { createHighlighter } from "../../../packages/javascript/lumis/dist/index.js";
import { htmlInline } from "../../../packages/javascript/lumis/dist/formatters.js";
import css from "../../../packages/javascript/lumis/dist/langs/css.js";
import htmlLanguage from "../../../packages/javascript/lumis/dist/langs/html.js";
import javascript from "../../../packages/javascript/lumis/dist/langs/javascript.js";
import json from "../../../packages/javascript/lumis/dist/langs/json.js";
import dracula from "../../../packages/javascript/themes/dist/themes/dracula.js";

import { loadSource, sourceUrl } from "./source.mjs";

const highlighter = await createHighlighter({
  languages: [htmlLanguage, css, json, javascript],
});
const source = await loadSource();
const highlighted = highlighter.highlight(
  source,
  htmlInline({ language: htmlLanguage, theme: dracula }),
);

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lumis dynamic WASM — Node.js</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem; background: #f4f4f5; }
      main { max-width: 960px; margin: 0 auto; }
      section { margin-block: 1.5rem; }
      pre.lumis { overflow-x: auto; padding: 1rem; border-radius: 0.5rem; }
    </style>
  </head>
  <body>
    <main>
      <h1>Node.js dynamic parser WASMs</h1>
      <p>
        A real 1,397-line Three.js file with injected CSS, JSON, and JavaScript,
        rendered with <code>html-inline</code>.
      </p>
      <p><a href="${sourceUrl}">Pinned source fixture</a></p>
      ${highlighted}
    </main>
  </body>
</html>
`;

const outputPath = fileURLToPath(new URL("./output.html", import.meta.url));
await writeFile(outputPath, html);
console.log(`Wrote ${outputPath}`);

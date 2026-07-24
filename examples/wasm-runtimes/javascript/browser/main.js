import { createHighlighter } from "../../../../packages/javascript/lumis/dist/index.browser.js";
import { htmlInline } from "../../../../packages/javascript/lumis/dist/formatters.js";
import css from "../../../../packages/javascript/lumis/dist/langs/css.js";
import htmlLanguage from "../../../../packages/javascript/lumis/dist/langs/html.js";
import javascript from "../../../../packages/javascript/lumis/dist/langs/javascript.js";
import json from "../../../../packages/javascript/lumis/dist/langs/json.js";
import dracula from "../../../../packages/javascript/themes/dist/themes/dracula.js";

import { loadSource, sourceUrl } from "../source.mjs";

const output = document.querySelector("#output");
const status = document.querySelector("#status");
const error = document.querySelector("#error");
const fixture = document.querySelector("#fixture");

fixture.innerHTML = `<a href="${sourceUrl}">Pinned source fixture</a>`;

try {
  const highlighter = await createHighlighter({
    languages: [htmlLanguage, css, json, javascript],
  });

  output.innerHTML = highlighter.highlight(
    await loadSource(),
    htmlInline({ language: htmlLanguage, theme: dracula }),
  );
  status.textContent =
    "HTML, CSS, JSON, and JavaScript parsers loaded. Reload to exercise CacheStorage.";
} catch (cause) {
  status.textContent = "Parser loading failed.";
  error.style.display = "block";
  error.textContent = cause instanceof Error ? (cause.stack ?? cause.message) : String(cause);
}

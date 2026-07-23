import { htmlLinked } from "../../src/formatters.ts";
import { createHighlighter } from "../../src/index.browser.ts";
import html from "../../langs/html.ts";
import javascript from "../../langs/javascript.ts";
import htmlWasm from "../fixtures/wasm/tree-sitter-html.wasm?url";
import javascriptWasm from "../fixtures/wasm/tree-sitter-javascript.wasm?url";

export interface BrowserTestResult {
  languages: string[];
  requestedWasms: string[];
  javascriptHtml: string;
  htmlHtml: string;
  injectionLanguages: string[];
}

declare global {
  interface Window {
    __lumisBrowserError?: string;
    __lumisBrowserResult?: BrowserTestResult;
  }
}

async function run(): Promise<void> {
  const requestedWasms: string[] = [];
  const wasmUrls: Record<string, string> = {
    "tree-sitter-html": htmlWasm,
    "tree-sitter-javascript": javascriptWasm,
  };
  const highlighter = await createHighlighter({
    languages: [javascript, html],
    wasmResolver: (_language, wasm) => {
      requestedWasms.push(wasm.name);
      const url = wasmUrls[wasm.name];
      if (!url) throw new Error(`Unexpected parser request: ${wasm.name}`);
      return url;
    },
  });

  const injectionLanguages = new Set<string>();
  highlighter.highlightIter(
    'element.innerHTML = "<strong>hello</strong>"',
    javascript,
    undefined,
    (_text, language) => injectionLanguages.add(language),
  );

  window.__lumisBrowserResult = {
    languages: highlighter.languages,
    requestedWasms,
    javascriptHtml: highlighter.highlight(
      "const answer = 42;",
      htmlLinked({ language: javascript }),
    ),
    htmlHtml: highlighter.highlight(
      '<main class="app">Hello</main>',
      htmlLinked({ language: html }),
    ),
    injectionLanguages: [...injectionLanguages],
  };
}

run().catch((error: unknown) => {
  window.__lumisBrowserError = error instanceof Error ? error.stack : String(error);
});

import { createHighlighter, highlightEvents, highlightIter } from "../../src/index.browser.ts";
import {
  bbcodeScoped,
  htmlInline,
  htmlLinked,
  htmlMultiThemes,
  terminal,
  type Formatter,
} from "../../src/formatters.ts";
import css from "../../langs/css.ts";
import html from "../../langs/html.ts";
import javascript from "../../langs/javascript.ts";
import dracula from "../../../themes/themes/dracula.ts";
import fixtureSource from "../../../../../fixtures/conformance/javascript-html-template-nested-script-css/source.txt?raw";
import cssWasm from "../fixtures/wasm/tree-sitter-css.wasm?url";
import htmlWasm from "../fixtures/wasm/tree-sitter-html.wasm?url";
import javascriptWasm from "../fixtures/wasm/tree-sitter-javascript.wasm?url";

interface CustomFormatterResult {
  balancedEvents: boolean;
  eventCount: number;
  eventLanguages: string[];
  eventScopes: string[];
  maxDepth: number;
  reconstructedSource: string;
  resolvedLanguage: string;
  restoredLanguage: Formatter["language"];
  styledTokenCount: number;
  tokenCount: number;
  tokenLanguages: string[];
  tokenScopes: string[];
  unicodeToken?: {
    text: string;
    language: string;
    scope: string;
    startByte: number;
    endByte: number;
  };
}

export interface BrowserTestResult {
  customFormatter: CustomFormatterResult;
  formatters: {
    bbcodeScoped: string;
    htmlInline: string;
    htmlLinked: string;
    htmlMultiThemes: string;
    terminal: string;
  };
  languages: string[];
  requestedWasms: string[];
}

declare global {
  interface Window {
    __lumisBrowserError?: string;
    __lumisBrowserResult?: BrowserTestResult;
  }
}

function languageId(language: Formatter["language"]): string {
  if (typeof language === "string") return language;
  return language?.id ?? "";
}

async function run(): Promise<void> {
  const requestedWasms: string[] = [];
  const wasmUrls: Record<string, string> = {
    "tree-sitter-css": cssWasm,
    "tree-sitter-html": htmlWasm,
    "tree-sitter-javascript": javascriptWasm,
  };
  const highlighter = await createHighlighter({
    languages: [javascript, html, css],
    wasmResolver: (_language, wasm) => {
      requestedWasms.push(wasm.name);
      const url = wasmUrls[wasm.name];
      if (!url) throw new Error(`Unexpected parser request: ${wasm.name}`);
      return url;
    },
  });

  const formatters = {
    htmlInline: highlighter.highlight(
      fixtureSource,
      htmlInline({ language: javascript, theme: dracula }),
    ),
    htmlLinked: highlighter.highlight(fixtureSource, htmlLinked({ language: javascript })),
    htmlMultiThemes: highlighter.highlight(
      fixtureSource,
      htmlMultiThemes({
        language: javascript,
        themes: { main: dracula },
        defaultTheme: "main",
      }),
    ),
    bbcodeScoped: highlighter.highlight(fixtureSource, bbcodeScoped({ language: javascript })),
    terminal: highlighter.highlight(
      fixtureSource,
      terminal({ language: javascript, theme: dracula }),
    ),
  };

  const customFormatter: Formatter = {
    language: "js",
    rainbowBrackets: true,
    render(source: string): string {
      const events = highlightEvents(source, this.language, {
        rainbowBrackets: this.rainbowBrackets,
      });
      const sourceBytes = new TextEncoder().encode(source);
      const decoder = new TextDecoder();
      const eventLanguages = new Set<string>();
      const eventScopes = new Set<string>();
      let depth = 0;
      let maxDepth = 0;
      let balancedEvents = true;
      let reconstructedSource = "";

      for (const event of events) {
        if (event.type === "start") {
          eventLanguages.add(event.language);
          eventScopes.add(event.scope);
          depth += 1;
          maxDepth = Math.max(maxDepth, depth);
        } else if (event.type === "end") {
          depth -= 1;
          balancedEvents &&= depth >= 0;
        } else {
          reconstructedSource += decoder.decode(
            sourceBytes.subarray(event.startByte, event.endByte),
          );
        }
      }
      balancedEvents &&= depth === 0;

      const tokenLanguages = new Set<string>();
      const tokenScopes = new Set<string>();
      let styledTokenCount = 0;
      let tokenCount = 0;
      let unicodeToken: CustomFormatterResult["unicodeToken"];

      highlightIter(source, this.language, dracula, (text, language, range, scope, style) => {
        tokenCount += 1;
        tokenLanguages.add(language);
        if (scope) tokenScopes.add(scope);
        if (style) styledTokenCount += 1;
        if (text.includes("😀")) {
          unicodeToken = {
            text,
            language,
            scope,
            startByte: range.start,
            endByte: range.end,
          };
        }
      });

      return JSON.stringify({
        balancedEvents,
        eventCount: events.length,
        eventLanguages: [...eventLanguages].sort(),
        eventScopes: [...eventScopes].sort(),
        maxDepth,
        reconstructedSource,
        resolvedLanguage: languageId(this.language),
        styledTokenCount,
        tokenCount,
        tokenLanguages: [...tokenLanguages].sort(),
        tokenScopes: [...tokenScopes].sort(),
        unicodeToken,
      } satisfies Omit<CustomFormatterResult, "restoredLanguage">);
    },
  };

  const customSource =
    `const nested = foo(bar([1, 2], { a: "3" }));\n` + `const view = ${fixtureSource.trim()};\n`;
  const customFormatterResult = JSON.parse(
    highlighter.highlight(customSource, customFormatter),
  ) as Omit<CustomFormatterResult, "restoredLanguage">;

  window.__lumisBrowserResult = {
    customFormatter: {
      ...customFormatterResult,
      restoredLanguage: customFormatter.language,
    },
    formatters,
    languages: highlighter.languages,
    requestedWasms,
  };
}

run().catch((error: unknown) => {
  window.__lumisBrowserError = error instanceof Error ? error.stack : String(error);
});

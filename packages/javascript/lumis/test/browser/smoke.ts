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
import cssBrackets from "../../../../../queries/processed/css/brackets.scm?raw";
import cssHighlights from "../../../../../queries/processed/css/highlights.scm?raw";
import cssInjections from "../../../../../queries/processed/css/injections.scm?raw";
import htmlBrackets from "../../../../../queries/processed/html/brackets.scm?raw";
import htmlHighlights from "../../../../../queries/processed/html/highlights.scm?raw";
import htmlInjections from "../../../../../queries/processed/html/injections.scm?raw";
import javascriptBrackets from "../../../../../queries/processed/javascript/brackets.scm?raw";
import javascriptHighlights from "../../../../../queries/processed/javascript/highlights.scm?raw";
import javascriptInjections from "../../../../../queries/processed/javascript/injections.scm?raw";
import javascriptLocals from "../../../../../queries/processed/javascript/locals.scm?raw";

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
  const languagePackages = new Map([
    [
      "@lumis-sh/wasm-css",
      await languagePackageDataUrl("css", cssWasm, {
        highlights: cssHighlights,
        injections: cssInjections,
        brackets: cssBrackets,
      }),
    ],
    [
      "@lumis-sh/wasm-html",
      await languagePackageDataUrl("html", htmlWasm, {
        highlights: htmlHighlights,
        injections: htmlInjections,
        brackets: htmlBrackets,
      }),
    ],
    [
      "@lumis-sh/wasm-javascript",
      await languagePackageDataUrl("javascript", javascriptWasm, {
        highlights: javascriptHighlights,
        injections: javascriptInjections,
        locals: javascriptLocals,
        brackets: javascriptBrackets,
      }),
    ],
  ]);
  const highlighter = await createHighlighter({
    languages: [javascript, html, css],
    languagePackageResolver: (packageName) => {
      const url = languagePackages.get(packageName);
      if (!url) throw new Error(`Unexpected language package request: ${packageName}`);
      return url;
    },
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
    format(source: string): string {
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

async function languagePackageDataUrl(
  language: string,
  wasmUrl: string,
  queries: {
    highlights: string;
    injections?: string;
    locals?: string;
    brackets?: string;
  },
): Promise<string> {
  const wasm = new Uint8Array(await (await fetch(wasmUrl)).arrayBuffer());
  const digest = await crypto.subtle.digest("SHA-256", wasm);
  const sha256 = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  const metadata = JSON.stringify({
    packageName: `@lumis-sh/wasm-${language}`,
    version: "test",
    definitionHash: sha256,
    parser: {
      name: `tree-sitter-${language}`,
      grammarName: language,
      sha256,
      size: wasm.byteLength,
    },
    languages: {
      [language]: {
        aliases: [],
        highlights: queries.highlights,
        injections: queries.injections ?? "",
        locals: queries.locals ?? "",
        brackets: queries.brackets ?? "",
      },
    },
  });
  const bytes = new TextEncoder().encode(metadata);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:application/json;base64,${btoa(binary)}`;
}

run().catch((error: unknown) => {
  window.__lumisBrowserError = error instanceof Error ? error.stack : String(error);
});

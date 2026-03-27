import { beforeAll, describe, expect, it } from "vitest";

import dracula from "../../themes/dist/json/dracula.json";
import css from "../langs/css.ts";
import html from "../langs/html.ts";
import javascript from "../langs/javascript.ts";
import json from "../langs/json.ts";
import lua from "../langs/lua.ts";
import markdown from "../langs/markdown.ts";
import markdownInline from "../langs/markdown_inline.ts";
import python from "../langs/python.ts";
import { createHighlighter } from "../src/index.js";
import { bbcodeScoped, htmlInline, htmlLinked, htmlMultiThemes, terminal } from "../src/formatters.js";
import type { Highlighter } from "../src/core/highlighter.js";
import type { Language, Theme } from "../src/types.js";

import { loadConformanceFixtures } from "./conformance.js";
import { configureLocalWasmResolver, ensureLocalWasm } from "./wasm.js";

const conformanceFixtures = loadConformanceFixtures();
const theme: Theme = dracula;

const langBundles: Record<string, Language> = {
  json,
  html,
  javascript,
  css,
  lua,
  markdown,
  markdownInline,
  python,
};

function getLanguage(id: string): Language {
  const language = langBundles[id];
  if (!language) throw new Error(`No bundle for language "${id}" in test setup`);
  return language;
}

let highlighter: Highlighter;

beforeAll(async () => {
  configureLocalWasmResolver([
    "diff",
    "json",
    "html",
    "javascript",
    "css",
    "lua",
    "markdown",
    "markdown_inline",
    "python",
  ]);
  highlighter = await createHighlighter({
    languages: [
      json,
      { ...html, wasm: ensureLocalWasm("html") },
      { ...javascript, wasm: ensureLocalWasm("javascript") },
      { ...css, wasm: ensureLocalWasm("css") },
      { ...lua, wasm: ensureLocalWasm("lua") },
      { ...markdown, wasm: ensureLocalWasm("markdown") },
      { ...markdownInline, wasm: ensureLocalWasm("markdown_inline") },
      { ...python, wasm: ensureLocalWasm("python") },
    ],
  });
}, 120_000);

describe.each(conformanceFixtures.map((f) => [f.name, f]))(
  "%s",
  (_name, fixture) => {
    it("html-inline", () => {
      const output = highlighter.highlight(
        fixture.source,
        htmlInline({ language: getLanguage(fixture.language), theme }),
      );
      expect(output).toBe(fixture.htmlInline);
    });

    it("html-linked", () => {
      const output = highlighter.highlight(
        fixture.source,
        htmlLinked({ language: getLanguage(fixture.language) }),
      );
      expect(output).toBe(fixture.htmlLinked);
    });

    it("html-multi-themes", () => {
      const output = highlighter.highlight(
        fixture.source,
        htmlMultiThemes({
          language: getLanguage(fixture.language),
          themes: { main: theme },
          defaultTheme: "main",
        }),
      );
      expect(output).toBe(fixture.htmlMultiThemes);
    });

    it("bbcodeScoped", () => {
      const output = highlighter.highlight(
        fixture.source,
        bbcodeScoped({ language: getLanguage(fixture.language) }),
      );
      expect(output).toBe(fixture.bbcode);
    });

    it("terminal", () => {
      const output = highlighter.highlight(
        fixture.source,
        terminal({ language: getLanguage(fixture.language), theme }),
      );
      expect(output).toBe(fixture.terminal);
    });
  },
);

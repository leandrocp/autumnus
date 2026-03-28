/** Syntax highlighting with Tree-sitter and Neovim themes. */

import { createHighlighterModule } from "./core/highlighter.js";
import {
  availableLanguages,
  configureWasmResolver,
  createRuntime,
  getDefaultRuntime,
} from "./platform/browser.js";

const highlighter = createHighlighterModule({
  createRuntime,
  getDefaultRuntime,
});

/** {@inheritDoc index.createHighlighter} */
export function createHighlighter(...args: Parameters<typeof highlighter.createHighlighter>) {
  return highlighter.createHighlighter(...args);
}
/** {@inheritDoc index.highlight} */
export function highlight(...args: Parameters<typeof highlighter.highlight>) {
  return highlighter.highlight(...args);
}
/** {@inheritDoc index.highlightIter} */
export function highlightIter(...args: Parameters<typeof highlighter.highlightIter>) {
  return highlighter.highlightIter(...args);
}

/** {@inheritDoc index.withWasm} */
export function withWasm<T extends import("./types.js").Language>(
  language: T,
  wasm: import("./types.js").RuntimeWasmInput,
): Omit<T, "wasm"> & { wasm: import("./types.js").RuntimeWasmInput } {
  return {
    ...language,
    wasm,
  };
}

export type { Highlighter } from "./core/highlighter.js";
export type {
  HighlightContext,
  HighlightIterFn,
  HtmlElement,
  HighlightLinesInline,
  HighlightLinesLinked,
  LineSpec,
  HighlightRange,
  HighlightStyle,
  Language,
  LanguageBundle,
  LanguageInput,
  LanguageRef,
  LazyLanguage,
  Theme,
  WasmRef,
  RuntimeWasmInput,
  LanguageInfo,
  ThemeInfo,
} from "./types.js";
export { availableLanguages, configureWasmResolver };
export type { WasmResolver } from "./core/languages.js";
export { availableThemes, sanitizeThemeName } from "./themes.js";

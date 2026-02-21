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
export const createHighlighter = (...args: Parameters<typeof highlighter.createHighlighter>) =>
  highlighter.createHighlighter(...args);
/** {@inheritDoc index.highlight} */
export const highlight = (...args: Parameters<typeof highlighter.highlight>) =>
  highlighter.highlight(...args);
/** {@inheritDoc index.highlightIter} */
export const highlightIter = (...args: Parameters<typeof highlighter.highlightIter>) =>
  highlighter.highlightIter(...args);
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
  LanguageInfo,
  ThemeInfo,
} from "./types.js";
export { availableLanguages, configureWasmResolver };
export type { WasmResolver } from "./core/languages.js";
export { availableThemes, sanitizeThemeName } from "./themes.js";

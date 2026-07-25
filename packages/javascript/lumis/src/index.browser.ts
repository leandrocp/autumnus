/** Syntax highlighting with Tree-sitter and Neovim themes. */

import { mapBundle } from "./bundle-helpers.js";
import { createHighlighterModule } from "./core/highlighter.js";
import {
  availableLanguages,
  configureWasmResolver,
  createRuntime,
  getDefaultRuntime,
} from "./runtime/browser.js";

export { highlightIter, highlightEvents } from "./core/highlighter.js";

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

/** {@inheritDoc index.withWasmBundle} */
export function withWasmBundle(
  bundle: import("./types.js").LanguageBundle,
  wasms: import("./types.js").RuntimeWasmBundle,
): import("./types.js").LanguageBundle {
  return mapBundle(bundle, (language) => {
    const wasm = wasms[language.id];
    return wasm ? withWasm(language, wasm) : language;
  });
}

export type { Highlighter } from "./core/highlighter.js";
export type {
  Annotation,
  AnnotationRange,
  HighlightEvent,
  HighlightIterFn,
  HtmlElement,
  HighlightLinesInline,
  HighlightLinesLinked,
  LineSpec,
  HighlightRange,
  OffsetAnnotationRange,
  Position,
  PositionAnnotationRange,
  ResolvedAnnotation,
  HighlightOptions,
  HighlightStyle,
  Language,
  LanguageBundle,
  LanguageInput,
  LanguageRef,
  LazyLanguage,
  Theme,
  WasmRef,
  RuntimeWasmInput,
  RuntimeWasmBundle,
  SyntaxHighlightEvent,
  LanguageInfo,
  ThemeInfo,
} from "./types.js";
export { availableLanguages, configureWasmResolver };
export type { WasmResolver } from "./core/languages.js";
export { availableThemes, sanitizeThemeName } from "./themes.js";

/** Syntax highlighting with Tree-sitter and Neovim themes. */

import { mapBundle } from "./bundle-helpers.js";
import { createHighlighterModule } from "./core/highlighter.js";
import {
  availableLanguages,
  configureLanguagePackageResolver,
  configureWasmResolver,
  createRuntime,
  getDefaultRuntime,
} from "./runtime/browser.js";

export { runtimeKind } from "./runtime/browser.js";

export { highlightIter, highlightEvents } from "./core/highlighter.js";
export { guessLanguage } from "./guess-language.js";

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

export type { CreateHighlighterOptions, Highlighter } from "./core/highlighter.js";
export type {
  HighlightEvent,
  HighlightIterFn,
  HtmlElement,
  HighlightLinesInline,
  HighlightLinesLinked,
  LineSpec,
  HighlightRange,
  HighlightStyle,
  Language,
  LanguageDefinition,
  LanguagePackageHandle,
  PlaintextLanguage,
  LoadableLanguage,
  LanguageBundle,
  LanguageInput,
  LanguageRef,
  LazyLanguage,
  Theme,
  WasmRef,
  RuntimeWasmInput,
  RuntimeWasmBundle,
  LanguageInfo,
  ThemeInfo,
} from "./types.js";
export { availableLanguages, configureLanguagePackageResolver, configureWasmResolver };
export type { LanguagePackageResolver, WasmResolver } from "./core/languages.js";
export { availableThemes, sanitizeThemeName } from "./themes.js";

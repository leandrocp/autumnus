/** Syntax highlighting with Tree-sitter and Neovim themes. */

import { createHighlighterModule } from "./core/highlighter.js";
import {
  availableLanguages,
  configureWasmResolver,
  createRuntime,
  getDefaultRuntime,
} from "./platform/node.js";

const highlighter = createHighlighterModule({
  createRuntime,
  getDefaultRuntime,
});

/**
 * Create a reusable highlighter with preloaded languages.
 *
 * `createHighlighter` is async; the returned `hl.highlight()` is synchronous.
 *
 * The `languages` array accepts `Language` objects, `LanguageBundle` collections, and dynamic imports.
 *
 * @example Cherry-pick languages
 * ```ts
 * import { createHighlighter } from '@lumis-sh/lumis'
 * import { htmlInline } from '@lumis-sh/lumis/formatters'
 * import javascript from '@lumis-sh/lumis/langs/javascript'
 * import dracula from '@lumis-sh/themes/dracula'
 *
 * const hl = await createHighlighter({ languages: [javascript] })
 * const html = hl.highlight('const x = 1', htmlInline({ language: javascript, theme: dracula }))
 * ```
 *
 * @example With a bundle
 * ```ts
 * import { createHighlighter } from '@lumis-sh/lumis'
 * import { htmlInline } from '@lumis-sh/lumis/formatters'
 * import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
 * import dracula from '@lumis-sh/themes/dracula'
 *
 * // Register all web languages. None are loaded yet.
 * const hl = await createHighlighter({ languages: [bundledLanguages] })
 *
 * // Load a language, then highlight synchronously.
 * await hl.loadLanguage(bundledLanguages.javascript)
 * const html = hl.highlight('const x = 1', htmlInline({ language: bundledLanguages.javascript, theme: dracula }))
 * ```
 */
export function createHighlighter(...args: Parameters<typeof highlighter.createHighlighter>) {
  return highlighter.createHighlighter(...args);
}

/**
 * Highlight code in a single async call.
 *
 * Initializes the parser, loads the language, and returns formatted output.
 * Uses a shared runtime so loaded languages persist across calls.
 *
 * For repeated highlighting, prefer {@link createHighlighter} which separates
 * async setup from synchronous rendering.
 *
 * @example
 * ```ts
 * import { highlight } from '@lumis-sh/lumis'
 * import { htmlInline } from '@lumis-sh/lumis/formatters'
 * import javascript from '@lumis-sh/lumis/langs/javascript'
 * import dracula from '@lumis-sh/themes/dracula'
 *
 * const html = await highlight('const x = 1', htmlInline({ language: javascript, theme: dracula }))
 * ```
 */
export function highlight(...args: Parameters<typeof highlighter.highlight>) {
  return highlighter.highlight(...args);
}

/**
 * Low-level token iterator. Calls `onToken` for each highlighted span.
 *
 * @example
 * ```ts
 * import { highlightIter } from '@lumis-sh/lumis'
 * import javascript from '@lumis-sh/lumis/langs/javascript'
 * import dracula from '@lumis-sh/themes/dracula'
 *
 * await highlightIter('const x = 1', javascript, dracula, (text, language, range, scope, style) => {
 *   console.log(scope, text)
 * })
 * ```
 */
export function highlightIter(...args: Parameters<typeof highlighter.highlightIter>) {
  return highlighter.highlightIter(...args);
}

/**
 * Return a copy of a language with a custom WASM source.
 *
 * Useful in browser bundlers when you want to import a parser package directly,
 * for example `import elixirWasm from '@lumis-sh/wasm-elixir'`.
 */
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

import { bundleWithPackages, languageWithPackage } from "./bundle-helpers.js";

export { guessLanguage as guess } from "./guess-language.js";
export { getLanguage as get } from "./catalog-metadata.js";

/**
 * Return a copy of a language that loads its parser from somewhere else.
 *
 * Rarely needed: a parser package already exports its language, parser and
 * language package included, so `import elixir from '@lumis-sh/wasm-elixir'`
 * is enough in Node and in a browser. `withWasm()` also takes that language,
 * or the package imported as a namespace, and so keeps older code working.
 *
 * Parser bytes on their own work in Node, which reads the language package
 * from the installed package. A browser needs it, so give it the package.
 */
export function withWasm<T extends import("./types.js").Language>(
  language: T,
  source:
    | import("./types.js").Language
    | import("./types.js").LanguagePackageExports
    | import("./types.js").RuntimeWasmInput,
): Omit<T, "wasm" | "languagePackage"> & {
  wasm: import("./types.js").RuntimeWasmInput;
  languagePackage?: object;
} {
  return languageWithPackage(language, source);
}

/**
 * Apply parsers to every matching language in a bundle.
 *
 * Rarely needed: a `@lumis-sh/wasm-bundle-*` package default exports the whole
 * bundle, ready for `createHighlighter({ languages })`.
 */
export function withWasmBundle(
  bundle: import("./types.js").LanguageBundle,
  sources:
    | import("./types.js").RuntimeLanguagePackageBundle
    | import("./types.js").RuntimeWasmBundle
    | Partial<Record<string, import("./types.js").Language>>,
): import("./types.js").LanguageBundle {
  return bundleWithPackages(bundle, sources);
}

export type {
  Language,
  LanguageDefinition,
  LanguageInfo,
  LanguagePackageHandle,
  PlaintextLanguage,
  LoadableLanguage,
  LanguageBundle,
  LanguageInput,
  LanguageRef,
  LazyLanguage,
  WasmRef,
  RuntimeWasmInput,
  RuntimeWasmBundle,
  LanguagePackageExports,
  RuntimeLanguagePackageBundle,
} from "./types.js";
export type { LoadLanguages } from "./core/load-languages.js";
export type { LanguagePackageResolver, WasmResolver } from "./core/languages.js";

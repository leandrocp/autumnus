import type { Parser, Language as TSLanguage, Query } from "web-tree-sitter";

/**
 * A highlighted token's byte range and scope.
 *
 * ```ts
 * // { startByte: 0, endByte: 5, scope: "keyword", language: "javascript" }
 * ```
 */
export interface HighlightSpan {
  startByte: number;
  endByte: number;
  scope: string;
  language: string;
}

/**
 * Visual style for a scope from a theme.
 *
 * ```ts
 * const style: HighlightStyle = { fg: '#ff79c6', italic: true }
 * ```
 */
export interface HighlightStyle {
  fg?: string;
  bg?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean | "solid" | "wavy" | "double" | "dotted" | "dashed";
  strikethrough?: boolean;
}

/**
 * Byte offset range of a highlighted token.
 *
 * ```ts
 * const range: HighlightRange = { start: 0, end: 5 }
 * ```
 */
export interface HighlightRange {
  start: number;
  end: number;
}

/**
 * Metadata about a supported language. Returned by {@link availableLanguages}.
 *
 * ```ts
 * import { availableLanguages } from '@lumis-sh/lumis'
 * const languages = availableLanguages()
 * // [{ id: 'javascript', name: 'JavaScript', aliases: ['js', 'jsx'], extensions: ['*.js', ...] }, ...]
 * ```
 */
export interface LanguageInfo {
  id: string;
  name: string;
  aliases: string[];
  extensions: string[];
  globs: string[];
  emacsModes: string[];
  shebangs: string[];
}

/**
 * Metadata about a built-in theme. Returned by {@link availableThemes}.
 *
 * ```ts
 * import { availableThemes } from '@lumis-sh/lumis'
 * const themes = availableThemes()
 * // [{ name: 'dracula', appearance: 'dark' }, { name: 'github_light', appearance: 'light' }, ...]
 * ```
 */
export interface ThemeInfo {
  name: string;
  appearance: "light" | "dark";
}

/**
 * Theme with color and style mappings for syntax scopes.
 *
 * ```ts
 * import dracula from '@lumis-sh/themes/dracula'
 * // dracula.name        → "dracula"
 * // dracula.appearance  → "dark"
 * // dracula.highlights  → { "keyword": { fg: "#ff79c6" }, ... }
 * ```
 */
export interface Theme {
  name: string;
  appearance: "light" | "dark";
  revision?: string;
  highlights: Record<string, HighlightStyle>;
}

export interface LanguageDefinition {
  id: string;
  aliases: string[];
}

/**
 * Pointer to a WASM parser binary on a CDN.
 *
 * ```ts
 * const ref: WasmRef = { packageName: '@lumis-sh/wasm-javascript', name: 'tree-sitter-javascript', version: '0.26' }
 * ```
 */
export interface WasmRef {
  packageName: string;
  name: string;
  version: string;
}

/**
 * A language definition with Tree-sitter queries and a WASM parser reference.
 *
 * ```ts
 * import javascript from '@lumis-sh/lumis/langs/javascript'
 * // javascript.id         → "javascript"
 * // javascript.aliases    → ["js", "jsx"]
 * // javascript.highlights → "(identifier) @variable ..."
 * ```
 */
export interface Language {
  id: string;
  aliases: string[];
  /** Tree-sitter highlight query (S-expression). */
  highlights: string;
  injections?: string;
  locals?: string;
  /**
   * WASM parser source:
   * - `WasmRef` fetched from CDN (default for pre-built bundles)
   * - `URL` fetched directly (`file://` works in Node.js)
   * - `string` treated as file path (Node.js) or URL (browser)
   */
  wasm: WasmRef | URL | string;
}

/**
 * A lazy language handle from a bundle. Callable to load the full {@link Language}.
 *
 * ```ts
 * import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
 *
 * bundledLanguages.javascript.id  // "javascript"
 * const language = await bundledLanguages.javascript()  // loads the full Language
 * ```
 */
export interface LazyLanguage {
  (): Promise<Language>;
  id: string;
  aliases: string[];
}

/**
 * A collection of lazy language handles. Import a preset bundle:
 *
 * ```ts
 * import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'    // 23 web languages
 * import { bundledLanguages } from '@lumis-sh/lumis/bundles/system' // 18 systems languages
 * import { bundledLanguages } from '@lumis-sh/lumis/bundles/full'   // all 77 languages
 * ```
 */
export type LanguageBundle = Record<string, LazyLanguage>;

/**
 * What `createHighlighter({ languages })` accepts.
 *
 * - `Language` — loaded immediately
 * - `Promise<{ default: Language }>` — e.g. `import('@lumis-sh/lumis/langs/css')`
 * - `() => Promise<{ default: Language }>` — lazy, loaded when called
 * - `LanguageBundle` — registered lazily, loaded on first use
 */
export type LanguageInput =
  | Language
  | Promise<{ default: Language }>
  | (() => Promise<{ default: Language }>)
  | LanguageBundle;

/**
 * How formatters and `hl.highlight()` identify a language.
 *
 * - `Language` — the full language object
 * - `LazyLanguage` — a handle from a bundle
 * - `string` — a language ID like `"javascript"`
 */
export type LanguageRef = Language | LazyLanguage | string;

export interface CaptureMetadata {
  highlightScope?: string;
  isInjectionContent: boolean;
  isInjectionLanguage: boolean;
  isLocalScope: boolean;
  isLocalDefinition: boolean;
  isLocalDefinitionValue: boolean;
  isLocalReference: boolean;
}

export interface QueryCaptureOffset {
  startRow: number;
  startColumn: number;
  endRow: number;
  endColumn: number;
}

export interface CompiledHighlightConfig {
  query: Query;
  injectionPatternEnd: number;
  localsPatternEnd: number;
  captureMetadata: Record<string, CaptureMetadata>;
  nonLocalVariablePatterns: boolean[];
  injectionOffsets: Array<Record<string, QueryCaptureOffset> | undefined>;
}

export interface LoadedLanguage {
  definition: LanguageDefinition;
  parser: Parser;
  language: TSLanguage;
  config: CompiledHighlightConfig;
}

export const PLAINTEXT_LANG_ID = "plaintext";

/**
 * Wraps the `<pre>` block with custom HTML.
 *
 * ```ts
 * htmlInline({ header: { openTag: '<div class="code">', closeTag: '</div>' } })
 * ```
 */
export interface HtmlElement {
  openTag: string;
  closeTag: string;
}

/**
 * A single line number (1-based) or `[start, end]` inclusive range.
 *
 * ```ts
 * const lines: LineSpec[] = [1, [3, 5], 8]  // lines 1, 3-5, and 8
 * ```
 */
export type LineSpec = number | [number, number];

/**
 * Line highlighting for inline and multi-themes formatters.
 *
 * ```ts
 * htmlInline({ highlightLines: { lines: [1, [3, 5]], style: 'theme' } })
 * ```
 */
export interface HighlightLinesInline {
  lines: LineSpec[];
  /** `"theme"` uses the theme's highlight background. Any other string is raw CSS. */
  style?: string;
  class?: string;
}

/**
 * Line highlighting for the linked formatter.
 *
 * ```ts
 * htmlLinked({ highlightLines: { lines: [1, [3, 5]], class: 'active' } })
 * ```
 */
export interface HighlightLinesLinked {
  lines: LineSpec[];
  /** Defaults to `"highlighted"`. */
  class?: string;
}

/**
 * A nested highlight event from tree-sitter.
 *
 * Events form a nested structure: a `start` event opens a scope,
 * `source` events provide text ranges, and `end` closes the scope.
 * Parent scopes stay open across child scopes (e.g. a `string` scope
 * wraps injected `tag` scopes inside template literals).
 */
export type HighlightEvent =
  | { type: "start"; scope: string; language: string }
  | { type: "source"; startByte: number; endByte: number }
  | { type: "end" };

/**
 * Signature of the `highlightIter` function on {@link HighlightContext}.
 *
 * ```ts
 * hl.highlightIter(source, javascript, dracula, (text, language, range, scope, style) => {
 *   console.log(`${scope}: ${text}`)
 * })
 * ```
 */
export type HighlightIterFn = (
  source: string,
  language: LanguageRef | undefined,
  theme: Theme | undefined,
  onToken: HighlightCallback,
) => void;

/**
 * The highlighting context passed to {@link Formatter.format}.
 *
 * Provides `highlightIter` for callback-based token iteration.
 */
export interface HighlightContext {
  /** Iterate over highlighted tokens, calling `onToken` for each. */
  highlightIter: HighlightIterFn;
  /** @internal */
  highlightEvents(source: string, language: LanguageRef | undefined): HighlightEvent[];
}

/**
 * A formatter renders highlighted source code into an output string.
 *
 * Built-in formatters are created with `htmlInline()`, `htmlLinked()`, etc.
 * Custom formatters implement the same interface. Call `hl.highlightIter`
 * inside `format()` to iterate over highlighted tokens.
 *
 * ```ts
 * const formatter: Formatter = {
 *   language: javascript,
 *   format(source, hl) {
 *     const parts: string[] = []
 *     hl.highlightIter(source, javascript, dracula, (text, _lang, _range, scope, _style) => {
 *       parts.push(scope ? `[${scope}] ${text}` : text)
 *     })
 *     return parts.join('\n')
 *   },
 * }
 * ```
 */
export interface Formatter {
  language?: LanguageRef;
  format(source: string, hl: HighlightContext): string;
}

/**
 * Called for each highlighted token in `highlightIter`.
 *
 * ```ts
 * hl.highlightIter(source, javascript, dracula, (text, language, range, scope, style) => {
 *   console.log(`${scope}: ${text}`)
 * })
 * ```
 */
export type HighlightCallback = (
  text: string,
  language: string,
  range: HighlightRange,
  scope: string,
  style: HighlightStyle | undefined,
) => void;

/**
 * Options for {@link htmlInline}.
 *
 * ```ts
 * htmlInline({ language: javascript, theme: dracula, preClass: 'my-code', italic: true })
 * ```
 */
export interface HtmlInlineOptions {
  language?: LanguageRef;
  theme?: Theme;
  preClass?: string;
  /** Use italic styles from the theme. */
  italic?: boolean;
  /** Add `data-highlight` attributes with scope names. */
  includeHighlights?: boolean;
  highlightLines?: HighlightLinesInline;
  header?: HtmlElement;
}

export interface HtmlInlineFormatter extends Formatter, HtmlInlineOptions {}

/**
 * Options for {@link htmlLinked}.
 *
 * ```ts
 * htmlLinked({ language: javascript, preClass: 'my-code' })
 * ```
 */
export interface HtmlLinkedOptions {
  language?: LanguageRef;
  preClass?: string;
  highlightLines?: HighlightLinesLinked;
  header?: HtmlElement;
}

export interface HtmlLinkedFormatter extends Formatter, HtmlLinkedOptions {}

/**
 * Options for {@link htmlMultiThemes}.
 *
 * ```ts
 * htmlMultiThemes({
 *   language: javascript,
 *   themes: { light: githubLight, dark: githubDark },
 *   defaultTheme: 'light-dark()',
 * })
 * ```
 */
export interface HtmlMultiThemesOptions {
  language?: LanguageRef;
  themes: Record<string, Theme>;
  /**
   * Theme whose colors are inlined as defaults.
   * Pass `"light-dark()"` to use the CSS `light-dark()` function instead.
   */
  defaultTheme?: string;
  /** Prefix for CSS custom properties. Defaults to `"--lumis"`. */
  cssVariablePrefix?: string;
  preClass?: string;
  italic?: boolean;
  includeHighlights?: boolean;
  highlightLines?: HighlightLinesInline;
  header?: HtmlElement;
}

export interface HtmlMultiThemesFormatter extends Formatter, HtmlMultiThemesOptions {}

/**
 * Options for {@link bbcodeScoped}.
 *
 * ```ts
 * bbcodeScoped({ language: javascript })
 * ```
 */
export interface BBCodeScopedOptions {
  language?: LanguageRef;
}

export interface BBCodeScopedFormatter extends Formatter, BBCodeScopedOptions {}

/**
 * Options for {@link terminal}.
 *
 * ```ts
 * terminal({ language: javascript, theme: dracula })
 * ```
 */
export interface TerminalOptions {
  language?: LanguageRef;
  theme?: Theme;
}

export interface TerminalFormatter extends Formatter, TerminalOptions {}

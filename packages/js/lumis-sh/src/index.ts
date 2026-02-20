/**
 * lumis-sh — Syntax highlighting powered by tree-sitter.
 *
 * Stateless shorthand:
 *
 * ```typescript
 * import { highlight, htmlInline } from 'lumis-sh'
 * import javascript from 'lumis-sh/langs/javascript'
 * import dracula from 'lumis-sh/themes/dracula'
 *
 * const html = await highlight('const x = 1', htmlInline({ lang: javascript, theme: dracula }))
 * ```
 *
 * Stateful instance:
 *
 * ```typescript
 * import { createHighlighter, htmlInline } from 'lumis-sh'
 * import javascript from 'lumis-sh/langs/javascript'
 * import dracula from 'lumis-sh/themes/dracula'
 *
 * const hl = await createHighlighter({
 *   langs: [javascript],
 *   themes: [dracula],
 * })
 *
 * const html = hl.highlight('const x = 1', htmlInline({ lang: 'javascript', theme: 'dracula' }))
 * ```
 */

export { createHighlighter, highlight, Highlighter } from './highlighter.js'
export type { HighlighterInit } from './highlighter.js'
export { htmlInline, htmlLinked, terminal } from './formatters.js'
export type {
  HtmlElement,
  LanguageBundle,
  LanguageDefinition,
  LoadedLanguage,
  ThemeData,
  Style,
  StyleEntry,
  StyledSegment,
  Formatter,
  HtmlInlineOptions,
  HtmlInlineFormatter,
  HtmlLinkedOptions,
  HtmlLinkedFormatter,
  TerminalOptions,
  TerminalFormatter,
} from './types.js'
export { PLAINTEXT_LANG_ID } from './types.js'
export { registerTheme, getTheme, resolveTheme, getStyle } from './themes.js'
export {
  initParser,
  loadLanguage,
  registerLanguage,
  getLoadedLanguage,
  resolveLanguageId,
} from './languages.js'
export { highlight as highlightTokens } from './engine.js'
export { escapeHtml, renderHtmlInline, renderHtmlLinked } from './renderer.js'
export { HIGHLIGHT_NAMES } from './constants.js'

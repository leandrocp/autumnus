/**
 * Stateful Highlighter class and stateless highlight() shorthand.
 *
 * Unified API: highlight(source, formatter)
 */

import type {
  LanguageBundle,
  ThemeData,
  Formatter,
  HtmlInlineFormatter,
  HtmlLinkedFormatter,
} from './types.js'
import { FORMATTER_TAG, PLAINTEXT_LANG_ID } from './types.js'
import {
  initParser,
  loadLanguage as loadLanguageInternal,
  getLoadedLanguage,
  getLoadedLanguageIds,
  resolveLanguageId,
} from './languages.js'
import { registerTheme, resolveTheme } from './themes.js'
import { highlight as runHighlight } from './engine.js'
import { escapeHtml, renderHtmlInline, renderHtmlLinked } from './renderer.js'

export interface HighlighterInit {
  /** Self-contained language bundles to preload. */
  langs?: LanguageBundle[]
  /** Themes to register. Each theme is registered by its `name` field. */
  themes?: ThemeData[]
}

/**
 * Resolve the lang option to a language id string.
 * If a LanguageBundle is passed, returns its id.
 */
function resolveLangId(lang: string | LanguageBundle): string {
  if (typeof lang === 'string') return resolveLanguageId(lang)
  return lang.id
}

/**
 * Extract lang from a formatter's options.
 */
function extractLang(fmt: Formatter): string | LanguageBundle | undefined {
  return (fmt as any).lang
}

/**
 * Load a LanguageBundle into the registry.
 */
async function loadBundle(lang: LanguageBundle): Promise<void> {
  await loadLanguageInternal({
    definition: { id: lang.id, aliases: lang.aliases, embeddedLangs: lang.embeddedLangs },
    wasm: lang.wasm,
    highlights: lang.highlights,
    injections: lang.injections,
    locals: lang.locals,
  })
}

/**
 * Render source as plain escaped text (no syntax highlighting).
 */
function renderPlaintext(source: string, fmt: Formatter): string {
  const tag = fmt[FORMATTER_TAG]

  switch (tag) {
    case 'html_inline': {
      const f = fmt as HtmlInlineFormatter
      const theme = resolveTheme(f.theme)
      const preClass = f.preClass ? `lumis ${f.preClass}` : 'lumis'

      let preStyle = ''
      if (theme) {
        const text = theme.highlights['text']
        const parts: string[] = []
        if (text?.fg) parts.push(`color: ${text.fg};`)
        if (text?.bg) parts.push(`background-color: ${text.bg};`)
        preStyle = parts.length > 0 ? ` style="${parts.join(' ')}"` : ''
      }

      let html = ''
      if (f.header) html += f.header.openTag
      html += `<pre class="${preClass}"${preStyle}>`
      html += `<code class="language-plaintext" translate="no" tabindex="0">`

      const lines = source.split('\n')
      for (let i = 0; i < lines.length; i++) {
        html += `<div class="line" data-line="${i + 1}">${escapeHtml(lines[i])}</div>`
      }

      html += '</code></pre>'
      if (f.header) html += f.header.closeTag
      return html
    }
    case 'html_linked': {
      const f = fmt as HtmlLinkedFormatter
      const preClass = f.preClass ? `lumis ${f.preClass}` : 'lumis'

      let html = `<pre class="${preClass}">`
      html += `<code class="language-plaintext" translate="no" tabindex="0">`

      const lines = source.split('\n')
      for (let i = 0; i < lines.length; i++) {
        html += `<div class="line" data-line="${i + 1}">${escapeHtml(lines[i])}</div>`
      }

      html += '</code></pre>'
      return html
    }
    default:
      throw new Error(`Unknown formatter: ${String(tag)}`)
  }
}

/**
 * Run the formatter pipeline for the given source and formatter.
 */
const PLAINTEXT_ALIASES = new Set([PLAINTEXT_LANG_ID, 'text', 'txt', 'plain'])

function isPlaintext(lang: string | LanguageBundle): boolean {
  if (typeof lang === 'string') return PLAINTEXT_ALIASES.has(lang)
  return lang.id === PLAINTEXT_LANG_ID
}

function runFormatter(source: string, fmt: Formatter): string {
  const lang = extractLang(fmt)
  if (!lang || isPlaintext(lang)) return renderPlaintext(source, fmt)

  const langId = resolveLangId(lang)
  const loaded = getLoadedLanguage(langId)
  if (!loaded) {
    throw new Error(
      `Language "${langId}" is not loaded. ` +
        `Load it via createHighlighter({ langs: [...] }) or loadLanguage().`
    )
  }

  const tag = fmt[FORMATTER_TAG]

  switch (tag) {
    case 'html_inline': {
      const f = fmt as HtmlInlineFormatter
      const theme = resolveTheme(f.theme)
      const segments = runHighlight(source, loaded, theme)
      return renderHtmlInline(segments, langId, theme, f)
    }
    case 'html_linked': {
      const f = fmt as HtmlLinkedFormatter
      const segments = runHighlight(source, loaded, undefined)
      return renderHtmlLinked(segments, langId, f)
    }
    default:
      throw new Error(`Unknown formatter: ${String(tag)}`)
  }
}

export class Highlighter {
  private constructor() {}

  /**
   * Create and initialize a Highlighter.
   *
   * @deprecated Use `createHighlighter()` instead.
   */
  static async create(init: HighlighterInit = {}): Promise<Highlighter> {
    return createHighlighter(init)
  }

  /**
   * Highlight source code (sync — all languages/themes must be pre-loaded).
   *
   * ```typescript
   * const html = hl.highlight('const x = 1', htmlInline({ lang: 'javascript', theme: 'dracula' }))
   * ```
   */
  highlight(source: string, formatter: Formatter): string {
    return runFormatter(source, formatter)
  }

  /**
   * Load a language dynamically after initialization.
   */
  async loadLanguage(lang: LanguageBundle): Promise<void> {
    await loadBundle(lang)
  }

  /**
   * Register a theme dynamically after initialization.
   */
  loadTheme(theme: ThemeData): void {
    registerTheme(theme.name, theme)
  }

  /**
   * @deprecated Use `loadTheme()` instead.
   */
  registerTheme(theme: ThemeData): void {
    this.loadTheme(theme)
  }

  /**
   * List loaded language ids.
   */
  get languages(): string[] {
    return getLoadedLanguageIds()
  }
}

// ── Factory function ──

/**
 * Create and initialize a Highlighter instance.
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
export async function createHighlighter(init: HighlighterInit = {}): Promise<Highlighter> {
  await initParser()

  // Access private constructor via cast
  const hl = new (Highlighter as any)() as Highlighter

  if (init.themes) {
    for (const theme of init.themes) {
      registerTheme(theme.name, theme)
    }
  }

  if (init.langs) {
    for (const lang of init.langs) {
      await loadBundle(lang)
    }
  }

  return hl
}

// ── Stateless shorthand ──

/**
 * Highlight source code (async, stateless shorthand).
 *
 * Lazily initializes the parser and loads the given language
 * on each call if not already loaded.
 *
 * ```typescript
 * import { highlight, htmlInline } from 'lumis-sh'
 * import javascript from 'lumis-sh/langs/javascript'
 * import dracula from 'lumis-sh/themes/dracula'
 *
 * const html = await highlight('const x = 1', htmlInline({ lang: javascript, theme: dracula }))
 * ```
 */
export async function highlight(
  source: string,
  formatter: Formatter
): Promise<string> {
  // Ensure parser is initialized
  await initParser()

  const lang = extractLang(formatter)
  if (lang && !isPlaintext(lang) && typeof lang !== 'string') {
    // LanguageBundle — ensure it's loaded
    if (!getLoadedLanguage(lang.id)) {
      await loadBundle(lang)
    }
  }

  // Register ThemeData if passed directly in formatter
  const tag = formatter[FORMATTER_TAG]
  if (tag === 'html_inline') {
    const f = formatter as HtmlInlineFormatter
    if (f.theme && typeof f.theme !== 'string') {
      registerTheme(f.theme.name, f.theme)
    }
  }

  return runFormatter(source, formatter)
}

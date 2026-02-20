/**
 * HTML renderers — mirrors the Rust formatter system.
 *
 * Supports:
 * - html_inline: HTML with inline CSS styles (like HtmlInlineBuilder)
 * - html_linked: HTML with CSS classes (like HtmlLinkedBuilder)
 */

import type {
  StyledSegment,
  ThemeData,
  Style,
  HtmlInlineOptions,
  HtmlLinkedOptions,
} from './types.js'

/**
 * Escape text for safe HTML output.
 * Matches the escaping in crates/lumis/src/formatter/html.rs
 */
export function escapeHtml(text: string): string {
  let result = ''
  for (const ch of text) {
    switch (ch) {
      case '&':
        result += '&amp;'
        break
      case '<':
        result += '&lt;'
        break
      case '>':
        result += '&gt;'
        break
      case '"':
        result += '&quot;'
        break
      case "'":
        result += '&#39;'
        break
      case '{':
        result += '&lbrace;'
        break
      case '}':
        result += '&rbrace;'
        break
      default:
        result += ch
    }
  }
  return result
}

/**
 * Convert a scope name to a CSS class name.
 * e.g., "function.method.call" -> "function-method-call"
 */
function scopeToClass(scope: string): string {
  return scope ? scope.replace(/\./g, '-') : 'text'
}

/**
 * Build inline CSS from a Style object.
 */
function styleToCss(style: Style, italic?: boolean): string {
  const parts: string[] = []
  if (style.fg) parts.push(`color: ${style.fg};`)
  if (style.bg) parts.push(`background-color: ${style.bg};`)
  if (style.bold) parts.push('font-weight: bold;')
  if (italic && style.italic) parts.push('font-style: italic;')
  if (style.underline) {
    const decoration =
      style.underline === 'solid' ? 'underline' : `underline ${style.underline}`
    parts.push(`text-decoration: ${decoration};`)
  }
  if (style.strikethrough) {
    parts.push('text-decoration: line-through;')
  }
  return parts.join(' ')
}

/**
 * Render segments as HTML with inline styles.
 */
export function renderHtmlInline(
  segments: StyledSegment[],
  language: string,
  theme: ThemeData | undefined,
  options: HtmlInlineOptions = {}
): string {
  const preClass = options.preClass ? `lumis ${options.preClass}` : 'lumis'
  const italic = options.italic ?? false
  const includeHighlights = options.includeHighlights ?? false

  // Build pre tag style from theme
  let preStyle = ''
  if (theme) {
    const text = theme.highlights['text']
    const parts: string[] = []
    if (text?.fg) parts.push(`color: ${text.fg};`)
    if (text?.bg) parts.push(`background-color: ${text.bg};`)
    preStyle = parts.length > 0 ? ` style="${parts.join(' ')}"` : ''
  }

  let html = ''

  if (options.header) {
    html += options.header.openTag
  }

  html += `<pre class="${preClass}"${preStyle}>`
  html += `<code class="language-${language}" translate="no" tabindex="0">`

  // Group segments into lines
  const lines = splitIntoLines(segments)

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    html += `<div class="line" data-line="${lineNum + 1}">`

    for (const seg of lines[lineNum]) {
      const escaped = escapeHtml(seg.text)
      const css = styleToCss(seg.style, italic)

      if (css || includeHighlights) {
        let attrs = ''
        if (includeHighlights && seg.scope) {
          attrs += `data-highlight="${seg.scope}"`
          if (css) attrs += ' '
        }
        if (css) {
          attrs += `style="${css}"`
        }
        html += `<span ${attrs}>${escaped}</span>`
      } else {
        html += escaped
      }
    }

    html += '</div>'
  }

  html += '</code></pre>'

  if (options.header) {
    html += options.header.closeTag
  }

  return html
}

/**
 * Render segments as HTML with CSS classes.
 */
export function renderHtmlLinked(
  segments: StyledSegment[],
  language: string,
  options: HtmlLinkedOptions = {}
): string {
  const preClass = options.preClass ? `lumis ${options.preClass}` : 'lumis'

  let html = `<pre class="${preClass}">`
  html += `<code class="language-${language}" translate="no" tabindex="0">`

  const lines = splitIntoLines(segments)

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    html += `<div class="line" data-line="${lineNum + 1}">`

    for (const seg of lines[lineNum]) {
      const escaped = escapeHtml(seg.text)
      const cssClass = scopeToClass(seg.scope)
      if (cssClass && cssClass !== 'text') {
        html += `<span class="${cssClass}">${escaped}</span>`
      } else {
        html += escaped
      }
    }

    html += '</div>'
  }

  html += '</code></pre>'
  return html
}

/**
 * Split segments into lines, breaking segments at newline boundaries.
 */
function splitIntoLines(segments: StyledSegment[]): StyledSegment[][] {
  const lines: StyledSegment[][] = [[]]

  for (const seg of segments) {
    const parts = seg.text.split('\n')
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        lines.push([])
      }
      if (parts[i].length > 0) {
        lines[lines.length - 1].push({
          text: parts[i],
          scope: seg.scope,
          style: seg.style,
        })
      }
    }
  }

  // Ensure at least one line
  if (lines.length === 0) lines.push([])

  return lines
}

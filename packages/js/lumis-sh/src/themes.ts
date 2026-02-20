import type { ThemeData, Style, StyleEntry } from './types.js'

const themeCache = new Map<string, ThemeData>()

/**
 * Register a theme by name for later lookup.
 */
export function registerTheme(name: string, theme: ThemeData): void {
  themeCache.set(name, theme)
}

/**
 * Get a registered theme by name.
 */
export function getTheme(name: string): ThemeData | undefined {
  return themeCache.get(name)
}

/**
 * Resolve a theme from either a name (string) or inline ThemeData.
 */
export function resolveTheme(theme: string | ThemeData | undefined): ThemeData | undefined {
  if (!theme) return undefined
  if (typeof theme === 'string') return getTheme(theme)
  return theme
}

/**
 * Look up a style for a scope in a theme, trying specialized scope first.
 * e.g., for scope "keyword" and language "rust", tries "keyword.rust" then "keyword".
 */
export function getStyle(
  theme: ThemeData,
  scope: string,
  language?: string
): Style {
  const highlights = theme.highlights

  // Try language-specialized scope first
  if (language) {
    const specialized = `${scope}.${language}`
    if (highlights[specialized]) {
      return entryToStyle(highlights[specialized])
    }
  }

  // Walk up the scope hierarchy: "function.method.call" -> "function.method" -> "function"
  let current = scope
  while (current) {
    if (highlights[current]) {
      return entryToStyle(highlights[current])
    }
    const dot = current.lastIndexOf('.')
    if (dot === -1) break
    current = current.slice(0, dot)
  }

  return {}
}

function entryToStyle(entry: StyleEntry): Style {
  return {
    fg: entry.fg,
    bg: entry.bg,
    bold: entry.bold,
    italic: entry.italic,
    underline: entry.underline,
    strikethrough: entry.strikethrough,
  }
}

/**
 * Get the pre tag style from a theme (foreground + background).
 */
export function getPreStyle(theme: ThemeData): string {
  const parts: string[] = []
  // Use "text" or root-level fg/bg from highlights
  const text = theme.highlights['text']
  if (text?.fg) parts.push(`color: ${text.fg};`)
  if (text?.bg) parts.push(`background-color: ${text.bg};`)
  return parts.join(' ')
}

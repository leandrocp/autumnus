import type MarkdownIt from 'markdown-it'
import type { Highlighter, LanguageInput, LanguageRef, Theme } from '@lumis-sh/lumis'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
import { createHighlighter } from '@lumis-sh/lumis'
import { htmlInline } from '@lumis-sh/lumis/formatters'

export interface MarkdownItLumisOptions {
  theme: Theme
  langs?: LanguageInput[]
  loadLanguages?: Array<LanguageRef>
  defaultLanguage?: LanguageRef
  fallbackLanguage?: LanguageRef
  preClass?: string
  detectLanguage?: boolean
  includeHighlights?: boolean
  italic?: boolean
  onError?: (error: unknown, context: { language?: string; code: string }) => void
}

function resolveLanguage(
  language: string,
  options: MarkdownItLumisOptions,
): LanguageRef | undefined {
  if (language.length > 0) {
    return language
  }

  if (options.detectLanguage) {
    return undefined
  }

  return options.defaultLanguage
}

function formatterOptions(language: LanguageRef | undefined, options: MarkdownItLumisOptions) {
  return htmlInline({
    language,
    theme: options.theme,
    preClass: options.preClass,
    includeHighlights: options.includeHighlights,
    italic: options.italic,
  })
}

function renderCodeBlock(
  highlighter: Highlighter,
  code: string,
  language: LanguageRef | undefined,
  options: MarkdownItLumisOptions,
): string {
  return highlighter.highlight(code, formatterOptions(language, options))
}

export function fromHighlighter(highlighter: Highlighter, options: MarkdownItLumisOptions) {
  return function installMarkdownItLumis(md: MarkdownIt): void {
    const defaultFence = md.renderer.rules.fence

    md.renderer.rules.fence = function fence(tokens, idx, opts, env, self) {
      const token = tokens[idx]
      if (!token) {
        return defaultFence
          ? defaultFence(tokens, idx, opts, env, self)
          : self.renderToken(tokens, idx, opts)
      }

      const info = token.info.trim()
      const language = info.split(/\s+/, 1)[0] ?? ''
      const code = token.content

      const selectedLanguage = resolveLanguage(language, options)

      try {
        return renderCodeBlock(highlighter, code, selectedLanguage, options)
      } catch (error) {
        if (options.fallbackLanguage && selectedLanguage !== options.fallbackLanguage) {
          return renderCodeBlock(highlighter, code, options.fallbackLanguage, options)
        }

        options.onError?.(error, { language, code })

        if (defaultFence) {
          return defaultFence(tokens, idx, opts, env, self)
        }

        return self.renderToken(tokens, idx, opts)
      }
    }
  }
}

export default async function markdownItLumis(options: MarkdownItLumisOptions) {
  const highlighter = await createHighlighter({
    langs: [bundledLanguages, ...(options.langs ?? [])],
  })

  const loadLanguages = options.loadLanguages ?? Object.keys(bundledLanguages)
  await Promise.all(loadLanguages.map(language => highlighter.loadLanguage(language)))

  return fromHighlighter(highlighter, options)
}

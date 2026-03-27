import type { Root, Element, RootContent } from 'hast'
import type { Highlighter, LanguageInput, LanguageRef, Theme } from '@lumis-sh/lumis'
import type { Plugin } from 'unified'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
import { createHighlighter } from '@lumis-sh/lumis'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import { fromHtml } from 'hast-util-from-html'
import { toString } from 'hast-util-to-string'
import { visit } from 'unist-util-visit'

const LANGUAGE_PREFIX = 'language-'

export interface RehypeLumisOptions {
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

interface ParsedCodeBlock {
  code: string
  language?: string
}

function getPropertyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function getClassNames(node: Element): string[] {
  const className = node.properties.className
  if (!Array.isArray(className)) {
    return []
  }

  return className.filter((value): value is string => typeof value === 'string')
}

function parseCodeBlock(node: Element): ParsedCodeBlock | undefined {
  const head = node.children[0]
  if (!head || head.type !== 'element' || head.tagName !== 'code') {
    return undefined
  }

  const languageFromClassName = getClassNames(head)
    .find(className => className.startsWith(LANGUAGE_PREFIX))
    ?.slice(LANGUAGE_PREFIX.length)

  const languageFromPreClassName = getClassNames(node)
    .find(className => className.startsWith(LANGUAGE_PREFIX))
    ?.slice(LANGUAGE_PREFIX.length)

  const language = languageFromClassName
    ?? languageFromPreClassName
    ?? getPropertyString(node.properties.dataLanguage)
    ?? getPropertyString(node.properties['data-language'])
    ?? getPropertyString(node.properties.language)

  return {
    code: toString(head),
    language,
  }
}

function parseFragment(html: string): RootContent[] {
  return fromHtml(html, { fragment: true }).children
}

function resolveLanguage(
  language: string | undefined,
  options: RehypeLumisOptions,
): LanguageRef | undefined {
  if (language) {
    return language
  }

  if (options.detectLanguage) {
    return undefined
  }

  return options.defaultLanguage
}

async function renderBlock(
  highlighter: Highlighter,
  code: string,
  language: LanguageRef | undefined,
  options: RehypeLumisOptions,
): Promise<RootContent[]> {
  if (language != null) {
    await highlighter.loadLanguage(language)
  }

  const html = highlighter.highlight(
    code,
    htmlInline({
      language,
      theme: options.theme,
      preClass: options.preClass,
      includeHighlights: options.includeHighlights,
      italic: options.italic,
    }),
  )

  return parseFragment(html)
}

const rehypeLumis: Plugin<[RehypeLumisOptions], Root> = function rehypeLumis(options) {
  const setup = (async () => {
    const highlighter = await createHighlighter({
      langs: [bundledLanguages, ...(options.langs ?? [])],
    })

    const loadLanguages = options.loadLanguages ?? ['plaintext']
    await Promise.all(loadLanguages.map(language => highlighter.loadLanguage(language)))

    return highlighter
  })()

  return async function transform(tree) {
    const highlighter = await setup
    const targets: Array<{
      parent: Element | Root
      index: number
      parsed: ParsedCodeBlock
    }> = []

    visit(tree, 'element', (node, index, parent) => {
      if (!parent || index == null || node.tagName !== 'pre') {
        return
      }

      const parsed = parseCodeBlock(node)
      if (!parsed) {
        return
      }

      targets.push({ parent, index, parsed })
      return 'skip'
    })

    const replacements = await Promise.all(
      targets.map(async ({ parsed }) => {
        const selectedLanguage = resolveLanguage(parsed.language, options)

        try {
          return await renderBlock(highlighter, parsed.code, selectedLanguage, options)
        } catch (error) {
          if (options.fallbackLanguage && selectedLanguage !== options.fallbackLanguage) {
            return renderBlock(highlighter, parsed.code, options.fallbackLanguage, options)
          }

          options.onError?.(error, { language: parsed.language, code: parsed.code })
          return undefined
        }
      }),
    )

    for (let i = targets.length - 1; i >= 0; i -= 1) {
      const target = targets[i]
      const replacement = replacements[i]
      if (!target || !replacement) {
        continue
      }

      target.parent.children.splice(target.index, 1, ...replacement)
    }
  }
}

export default rehypeLumis

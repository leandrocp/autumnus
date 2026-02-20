/**
 * Reads query .scm files from crates/lumis/queries/, resolves `; inherits:` directives,
 * converts Lua patterns to JS regex, and emits one TypeScript module per language.
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '../../../../crates/lumis')
const QUERIES_DIR = path.join(ROOT, 'queries')
const OVERWRITES_DIR = path.join(ROOT, 'overwrites')
const OUT_DIR = path.resolve(import.meta.dirname, '../langs')

const LANGUAGES = ['javascript', 'rust', 'json'] as const

const LANG_META: Record<string, { aliases: string[]; embeddedLangs: string[] }> = {
  javascript: { aliases: ['js'], embeddedLangs: ['regex'] },
  rust: { aliases: ['rs'], embeddedLangs: [] },
  json: { aliases: [], embeddedLangs: [] },
}

function convertLuaPatternToRegex(lua: string): string {
  let result = ''
  const chars = [...lua]
  let i = 0

  while (i < chars.length) {
    if (chars[i] === '%') {
      i++
      if (i >= chars.length) break
      const next = chars[i]
      const map: Record<string, string> = {
        d: '\\d',
        s: '\\s',
        l: '[a-z]',
        u: '[A-Z]',
        A: '[^a-zA-Z]',
        S: '\\S',
        '.': '\\.',
        '%': '%',
        '{': '\\{',
        '}': '\\}',
        '$': '\\$',
        '^': '\\^',
      }
      result += map[next] ?? next
    } else {
      result += chars[i]
    }
    i++
  }

  return result
}

function convertLuaMatches(content: string): string {
  return content
    .split('\n')
    .map((line) => {
      let converted = line
        .replace(/#lua-match\?/g, '#match?')
        .replace(/#not-lua-match\?/g, '#not-match?')

      if (converted.includes('#match?') || converted.includes('#not-match?')) {
        const firstQuote = converted.indexOf('"')
        if (firstQuote !== -1) {
          const secondQuote = converted.indexOf('"', firstQuote + 1)
          if (secondQuote !== -1) {
            const luaPattern = converted.slice(firstQuote + 1, secondQuote)
            const regex = convertLuaPatternToRegex(luaPattern)
            converted =
              converted.slice(0, firstQuote + 1) + regex + converted.slice(secondQuote)
          }
        }
      }

      return converted
    })
    .join('\n')
}

function applyTextReplacements(content: string): string {
  return content
    .replace(/\\\\c/g, '(?i)')
    .replace(/\^\{-\]\|\[\^\|\]/g, '^\\{[-]|^\\{[^|]')
    .replace(/""\^\\\\if"/g, '"^if"')
}

/**
 * Remove entire top-level S-expression patterns that contain unsupported predicates.
 *
 * web-tree-sitter doesn't support:
 * - `#set!` with a @capture as first arg (Neovim-specific): (#set! @node key "value")
 *
 * We remove the entire pattern (balanced parens from the outermost `(` to matching `)`)
 * to avoid leaving orphaned parentheses.
 */
function stripUnsupportedPredicates(content: string): string {
  // Split into top-level patterns by finding balanced parenthesized groups
  const patterns: string[] = []
  let i = 0
  let lastEnd = 0

  while (i < content.length) {
    if (content[i] === '(') {
      // Found start of a pattern — find matching close
      let depth = 1
      let j = i + 1
      let inString = false
      while (j < content.length && depth > 0) {
        if (content[j] === '"' && content[j - 1] !== '\\') {
          inString = !inString
        } else if (!inString) {
          if (content[j] === '(') depth++
          else if (content[j] === ')') depth--
        }
        j++
      }

      const pattern = content.slice(i, j)

      // Check if this pattern contains unsupported predicates
      const hasUnsupported = /\(#set!\s+@/.test(pattern)

      if (hasUnsupported) {
        // Emit the text before this pattern (comments, whitespace)
        patterns.push(content.slice(lastEnd, i))
        // Skip the pattern
        lastEnd = j
      }

      i = j
    } else {
      i++
    }
  }

  // Emit remaining text
  patterns.push(content.slice(lastEnd))

  return patterns.join('')
}

function readQueryFile(language: string, queryType: string): string {
  const filePath = path.join(QUERIES_DIR, language, `${queryType}.scm`)
  if (!fs.existsSync(filePath)) return ''
  return fs.readFileSync(filePath, 'utf-8')
}

function readOverwriteFile(language: string, queryType: string): string {
  const filePath = path.join(OVERWRITES_DIR, language, `${queryType}.scm`)
  if (!fs.existsSync(filePath)) return ''
  return fs.readFileSync(filePath, 'utf-8')
}

function resolveQuery(language: string, queryType: string): string {
  const raw = readQueryFile(language, queryType)
  let content = applyTextReplacements(raw)
  content = convertLuaMatches(content)
  content = stripUnsupportedPredicates(content)

  const parts: string[] = []

  for (const line of content.split('\n')) {
    if (line.startsWith('; inherits: ')) {
      const parents = line.replace('; inherits: ', '').trim().split(',').map((s) => s.trim())
      for (const parent of parents) {
        parts.push(resolveQuery(parent, queryType))
      }
    }
  }

  parts.push(`\n; query: ${language}`)
  parts.push(content)

  const overwrite = readOverwriteFile(language, queryType)
  if (overwrite) {
    parts.push(`\n; overwrite: ${language}`)
    parts.push(overwrite)
  }

  return parts.join('\n')
}

function escapeTemplateString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  for (const lang of LANGUAGES) {
    const highlights = resolveQuery(lang, 'highlights')
    const injections = resolveQuery(lang, 'injections')
    const locals = resolveQuery(lang, 'locals')
    const meta = LANG_META[lang]

    const injectionsStr = injections.trim()
    const localsStr = locals.trim()

    const module = `import type { LanguageBundle } from '../src/types.js'

const lang: LanguageBundle = {
  id: ${JSON.stringify(lang)},
  aliases: ${JSON.stringify(meta.aliases)},
  embeddedLangs: ${JSON.stringify(meta.embeddedLangs)},
  highlights: \`${escapeTemplateString(highlights)}\`,${injectionsStr ? `\n  injections: \`${escapeTemplateString(injections)}\`,` : ''}${localsStr ? `\n  locals: \`${escapeTemplateString(localsStr)}\`,` : ''}
  wasm: new URL('../wasm/tree-sitter-${lang}.wasm', import.meta.url),
}

export default lang
`

    fs.writeFileSync(path.join(OUT_DIR, `${lang}.ts`), module)
    console.log(`  ${lang}: langs/${lang}.ts`)
  }

  // Plaintext — no WASM, no queries
  const plaintextModule = `import type { LanguageBundle } from '../src/types.js'

const lang: LanguageBundle = {
  id: "plaintext",
  aliases: ["text", "txt", "plain"],
  embeddedLangs: [],
  highlights: "",
  wasm: "",
}

export default lang
`
  fs.writeFileSync(path.join(OUT_DIR, 'plaintext.ts'), plaintextModule)
  console.log(`  plaintext: langs/plaintext.ts`)
}

main()

/**
 * Reads preprocessed query .scm files from tmp/queries_processed/, converts
 * Lua patterns to JS regex, and emits one TypeScript module per language.
 *
 * Preprocessing (inheritance, text replacements, overwrite merging) is done by
 * `cargo run -p dev -- preprocess-queries`, which is run by `pnpm run build:generate`.
 *
 * Language list and metadata (aliases, wasm_name, query_name) are read from
 * languages.toml at the repo root.
 */

import fs from 'node:fs'
import path from 'node:path'
import { parse as parseToml } from 'smol-toml'

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, '../../../..')
const QUERIES_PROCESSED_DIR = path.join(WORKSPACE_ROOT, 'tmp', 'queries_processed')
const OUT_DIR = path.resolve(import.meta.dirname, '../langs')
const LANGUAGES_TOML = path.join(WORKSPACE_ROOT, 'languages.toml')
const PACKAGE_JSON = path.resolve(import.meta.dirname, '../package.json')

interface ParserEntry {
  git: string
  rev: string
  crate?: string
  version: string
  aliases?: string[]
  emacs?: string[]
  shebang?: string[]
  location?: string
  generate?: boolean
  wasm_name?: string
  query_name?: string
  display_name?: string
  variant?: string
  globs?: string[]
}

interface BundleEntry {
  parsers: string[] | 'all'
}

interface LanguagesToml {
  queries: Record<string, { git: string; rev: string; path: string }>
  parsers: Record<string, ParserEntry>
  bundles?: Record<string, BundleEntry>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isLanguagesToml(value: unknown): value is LanguagesToml {
  if (!isRecord(value)) return false
  if (!isRecord(value.queries) || !isRecord(value.parsers)) return false
  return true
}

function readLanguagesToml(): LanguagesToml {
  const text = fs.readFileSync(LANGUAGES_TOML, 'utf-8')
  const parsed = parseToml(text)
  if (!isLanguagesToml(parsed)) {
    throw new Error('Invalid languages.toml structure')
  }
  return parsed
}

function treeSitterWasmCli(): string {
  const packageJson: { dependencies?: Record<string, string> } = JSON.parse(
    fs.readFileSync(PACKAGE_JSON, 'utf-8'),
  )
  const spec = packageJson.dependencies?.['web-tree-sitter']
  const match = spec?.match(/(\d+\.\d+)/)

  if (!match) {
    throw new Error('Could not determine web-tree-sitter compatibility from package.json')
  }

  return match[1]
}

function wasmPackageName(wasmName: string): string {
  return `@lumis-sh/wasm-${wasmName.startsWith('tree-sitter-') ? wasmName.slice('tree-sitter-'.length) : wasmName}`
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

function expandCaseInsensitiveAscii(regex: string): string {
  let result = ''
  let inCharClass = false

  for (let i = 0; i < regex.length; i++) {
    const char = regex[i]

    if (char === '\\') {
      result += char
      if (i + 1 < regex.length) {
        result += regex[i + 1]
        i++
      }
      continue
    }

    if (char === '[') {
      inCharClass = true
      result += char
      continue
    }

    if (char === ']') {
      inCharClass = false
      result += char
      continue
    }

    if (!inCharClass && /[A-Za-z]/.test(char)) {
      const lower = char.toLowerCase()
      const upper = char.toUpperCase()
      result += lower === upper ? char : `[${lower}${upper}]`
      continue
    }

    result += char
  }

  return result
}

function normalizeRegexForJs(regex: string): string {
  if (!regex.startsWith('(?i)')) return regex
  return expandCaseInsensitiveAscii(regex.slice(4))
}

function convertLuaMatches(content: string): string {
  const converted = content
    .split('\n')
    .map((line) => {
      let updated = line
        .replace(/#lua-match\?/g, '#match?')
        .replace(/#not-lua-match\?/g, '#not-match?')

      if (updated.includes('#match?') || updated.includes('#not-match?')) {
        const firstQuote = updated.indexOf('"')
        if (firstQuote !== -1) {
          const secondQuote = updated.indexOf('"', firstQuote + 1)
          if (secondQuote !== -1) {
            const luaPattern = updated.slice(firstQuote + 1, secondQuote)
            const regex = normalizeRegexForJs(convertLuaPatternToRegex(luaPattern))
            updated = updated.slice(0, firstQuote + 1) + regex + updated.slice(secondQuote)
          }
        }
      }

      return updated
    })
    .join('\n')

  return converted.replace(/"\(\?i\)([^"]*)"/g, (_match, regex: string) => {
    return `"${expandCaseInsensitiveAscii(regex)}"`
  })
}

function resolveQuery(language: string, queryType: string): string {
  const filePath = path.join(QUERIES_PROCESSED_DIR, language, `${queryType}.scm`)
  if (!fs.existsSync(filePath)) return ''
  const content = fs.readFileSync(filePath, 'utf-8')
  return convertLuaMatches(content)
}

function escapeTemplateString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const config = readLanguagesToml()
  const tsCli = treeSitterWasmCli()

  for (const [id, entry] of Object.entries(config.parsers)) {
    const queryName = entry.query_name || id
    const wasmName = entry.wasm_name || `tree-sitter-${id}`
    const aliases = entry.aliases || []

    const highlights = resolveQuery(queryName, 'highlights')
    const injections = resolveQuery(queryName, 'injections')
    const locals = resolveQuery(queryName, 'locals')

    const injectionsStr = injections.trim()
    const localsStr = locals.trim()

    const module = `// Auto-generated by scripts/build-langs.ts — do not edit manually.
import type { Language } from '../src/types.js'

const language: Language = {
  id: ${JSON.stringify(id)},
  aliases: ${JSON.stringify(aliases)},
  highlights: \`${escapeTemplateString(highlights)}\`,${injectionsStr ? `\n  injections: \`${escapeTemplateString(injections)}\`,` : ''}${localsStr ? `\n  locals: \`${escapeTemplateString(localsStr)}\`,` : ''}
  wasm: { packageName: ${JSON.stringify(wasmPackageName(wasmName))}, name: ${JSON.stringify(wasmName)}, version: ${JSON.stringify(tsCli)} },
}

export default language
`

    fs.writeFileSync(path.join(OUT_DIR, `${id}.ts`), module)
    console.log(`  ${id}: langs/${id}.ts`)
  }

  // Plaintext — uses diff parser with empty queries (same as Rust crate)
  const diffEntry = config.parsers['diff']
  if (!diffEntry) throw new Error('diff parser entry not found in languages.toml')
  const diffWasmName = diffEntry.wasm_name || 'tree-sitter-diff'
  const diffWasmVersion = tsCli
  const plaintextModule = `// Auto-generated by scripts/build-langs.ts — do not edit manually.
import type { Language } from '../src/types.js'

const language: Language = {
  id: "plaintext",
  aliases: ["text", "txt", "plain"],
  highlights: "",
  wasm: { packageName: ${JSON.stringify(wasmPackageName(diffWasmName))}, name: ${JSON.stringify(diffWasmName)}, version: ${JSON.stringify(diffWasmVersion)} },
}

export default language
`
  fs.writeFileSync(path.join(OUT_DIR, 'plaintext.ts'), plaintextModule)
  console.log(`  plaintext: langs/plaintext.ts`)

  // Generate language metadata
  const languageEntries: {
    id: string
    name: string
    aliases: string[]
    extensions: string[]
    globs: string[]
    emacsModes: string[]
    shebangs: string[]
  }[] = []

  for (const [id, entry] of Object.entries(config.parsers)) {
    const aliases = entry.aliases || []
    const variant = entry.variant || titlecase(id)
    const name = entry.display_name || variant
    const globs = entry.globs || []
    const extensions = globs.filter((g) => g.startsWith('*.'))
    const emacsModes = entry.emacs || []
    const shebangs = entry.shebang || []

    languageEntries.push({ id, name, aliases, extensions, globs, emacsModes, shebangs })
  }

  // Add plaintext
  languageEntries.push({
    id: 'plaintext',
    name: 'Plain Text',
    aliases: ['text', 'txt', 'plain'],
    extensions: [],
    globs: [],
    emacsModes: ['fundamental', 'text'],
    shebangs: [],
  })

  const GENERATED_DIR = path.resolve(import.meta.dirname, '../src/generated')
  fs.mkdirSync(GENERATED_DIR, { recursive: true })

  const languageMetaModule = `// Auto-generated by scripts/build-langs.ts — do not edit manually.
import type { LanguageInfo } from '../types.js'

export const LANGUAGES: LanguageInfo[] = ${JSON.stringify(languageEntries, null, 2)}
`
  fs.writeFileSync(path.join(GENERATED_DIR, 'languages-meta.ts'), languageMetaModule)
  console.log(`  languages metadata: src/generated/languages-meta.ts`)

  const exactLanguageMap: Record<string, string> = {}
  const emacsModeMap: Record<string, string> = {}
  const shebangMap: Record<string, string> = {}
  const globMatchers: Array<{ id: string; glob: string }> = []

  for (const language of languageEntries) {
    exactLanguageMap[language.id.toLowerCase()] = language.id

    for (const alias of language.aliases) {
      exactLanguageMap[alias.toLowerCase()] = language.id
    }

    for (const mode of language.emacsModes) {
      emacsModeMap[mode.toLowerCase()] = language.id
    }

    for (const shebang of language.shebangs) {
      shebangMap[shebang.toLowerCase()] = language.id
    }

    for (const glob of language.globs) {
      globMatchers.push({ id: language.id, glob: glob.toLowerCase() })
    }
  }

  const languageDetectionModule = `// Auto-generated by scripts/build-langs.ts — do not edit manually.
export const EXACT_LANGUAGE_MAP: Record<string, string> = ${JSON.stringify(exactLanguageMap, null, 2)}

export const EMACS_MODE_MAP: Record<string, string> = ${JSON.stringify(emacsModeMap, null, 2)}

export const SHEBANG_MAP: Record<string, string> = ${JSON.stringify(shebangMap, null, 2)}

export const GLOB_MATCHERS: Array<{ id: string; glob: string }> = ${JSON.stringify(globMatchers, null, 2)}
`
  fs.writeFileSync(path.join(GENERATED_DIR, 'language-detection.ts'), languageDetectionModule)
  console.log(`  language detection: src/generated/language-detection.ts`)

  const languageLoaderEntries = [...Object.keys(config.parsers), 'plaintext']
    .map((id) => `  ${JSON.stringify(id)}: () => import('../../langs/${id}.js'),`)
    .join('\n')

  const languageLoadersModule = `// Auto-generated by scripts/build-langs.ts — do not edit manually.
import type { Language } from '../types.js'

export const LANGUAGE_LOADERS: Record<string, () => Promise<{ default: Language }>> = {
${languageLoaderEntries}
}
`
  fs.writeFileSync(path.join(GENERATED_DIR, 'language-loaders.ts'), languageLoadersModule)
  console.log(`  language loaders: src/generated/language-loaders.ts`)

  // Generate theme metadata
  const THEMES_SRC = path.join(WORKSPACE_ROOT, 'themes')
  const themeEntries: { name: string; appearance: string }[] = []

  for (const file of fs.readdirSync(THEMES_SRC).filter((f) => f.endsWith('.json')).sort()) {
    const json = fs.readFileSync(path.join(THEMES_SRC, file), 'utf-8')
    const data = JSON.parse(json)
    if (data.name && data.appearance) {
      themeEntries.push({ name: data.name, appearance: data.appearance })
    }
  }

  const themeMetaModule = `// Auto-generated by scripts/build-langs.ts — do not edit manually.
import type { ThemeInfo } from '../types.js'

export const THEMES: ThemeInfo[] = ${JSON.stringify(themeEntries, null, 2)}
`
  fs.writeFileSync(path.join(GENERATED_DIR, 'themes-meta.ts'), themeMetaModule)
  console.log(`  themes metadata: src/generated/themes-meta.ts`)

  // Generate bundle files
  const BUNDLES_DIR = path.resolve(import.meta.dirname, '../bundles')
  fs.mkdirSync(BUNDLES_DIR, { recursive: true })

  const allParserIds = Object.keys(config.parsers)

  for (const [bundleName, bundleEntry] of Object.entries(config.bundles ?? {})) {
    const parserIds = bundleEntry.parsers === 'all' ? allParserIds : bundleEntry.parsers
    const aliases: Record<string, string[]> = {}

    for (const id of parserIds) {
      const entry = config.parsers[id]
      aliases[id] = entry?.aliases ?? []
    }

    // Always include plaintext
    if (!parserIds.includes('plaintext')) {
      aliases['plaintext'] = ['text', 'txt', 'plain']
    }

    const allIds = [...parserIds]
    if (!allIds.includes('plaintext')) {
      allIds.push('plaintext')
    }

    const entries = allIds
      .map((id) => {
        const a = JSON.stringify(aliases[id] ?? [])
        return `  ${JSON.stringify(id)}: lazy(${JSON.stringify(id)}, ${a}, () => import("../langs/${id}.js")),`
      })
      .join('\n')

    const bundleModule = `// Auto-generated by scripts/build-langs.ts — do not edit manually.
import type { LanguageBundle } from '../src/types.js'
import { lazy } from '../src/bundle-helpers.js'

export const bundledLanguages: LanguageBundle = {
${entries}
}
`

    fs.writeFileSync(path.join(BUNDLES_DIR, `${bundleName}.ts`), bundleModule)
    console.log(`  bundle ${bundleName}: bundles/${bundleName}.ts (${allIds.length} languages)`)
  }
}

function titlecase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

main()

import { Parser, Language, Query } from 'web-tree-sitter'
import type { LanguageDefinition, LoadedLanguage } from './types.js'
import wasmBinary from './tree-sitter-wasm.js'

export type { Parser, Language, Query }

let parserInitialized = false
const loadedLanguages = new Map<string, LoadedLanguage>()
const aliasMap = new Map<string, string>()

/**
 * Initialize web-tree-sitter. Must be called once before any language loading.
 */
export async function initParser(): Promise<void> {
  if (parserInitialized) return
  await Parser.init({ wasmBinary })
  parserInitialized = true
}

/**
 * Register a language definition's aliases.
 */
export function registerLanguage(def: LanguageDefinition): void {
  for (const alias of def.aliases) {
    aliasMap.set(alias, def.id)
  }
}

/**
 * Resolve a language name or alias to its canonical id.
 */
export function resolveLanguageId(nameOrAlias: string): string {
  return aliasMap.get(nameOrAlias) ?? nameOrAlias
}

export interface LoadLanguageOptions {
  /** Language definition (id, aliases, etc). */
  definition: LanguageDefinition
  /** WASM parser binary — file path (Node), URL string (browser), URL object, or ArrayBuffer. */
  wasm: ArrayBuffer | string | URL | Response
  /** Query strings. Provide directly or use `queries` URLs to fetch them. */
  highlights: string
  injections?: string
  locals?: string
}

/**
 * Resolve a WASM source to a value that Language.load() accepts.
 * URL objects are converted to filesystem paths (Node) or href strings (browser).
 */
function resolveWasm(wasm: ArrayBuffer | string | URL | Response): ArrayBuffer | string | Response {
  if (wasm instanceof URL) {
    if (wasm.protocol === 'file:') {
      // Convert file:// URL to filesystem path for Node.js
      // Manual conversion avoids importing 'node:url' which breaks in browsers
      let path = decodeURIComponent(wasm.pathname)
      // Handle Windows drive letters (e.g. /C:/path)
      if (/^\/[a-zA-Z]:\//.test(path)) {
        path = path.slice(1)
      }
      return path
    }
    return wasm.href
  }
  return wasm
}

/**
 * Load a language from WASM + query strings.
 */
export async function loadLanguage(opts: LoadLanguageOptions): Promise<LoadedLanguage> {
  await initParser()

  const existing = loadedLanguages.get(opts.definition.id)
  if (existing) return existing

  const language = await Language.load(resolveWasm(opts.wasm) as any)
  const parser = new Parser()
  parser.setLanguage(language)

  const highlightsQuery = createQuerySafe(language, opts.highlights)

  let injectionsQuery: Query | undefined
  let localsQuery: Query | undefined
  try {
    if (opts.injections) injectionsQuery = createQuerySafe(language, opts.injections)
  } catch { /* Phase 2 */ }
  try {
    if (opts.locals) localsQuery = createQuerySafe(language, opts.locals)
  } catch { /* Phase 2 */ }

  const loaded: LoadedLanguage = {
    definition: opts.definition,
    parser,
    language,
    highlightsQuery,
    injectionsQuery,
    localsQuery,
  }

  loadedLanguages.set(opts.definition.id, loaded)
  registerLanguage(opts.definition)

  return loaded
}

/**
 * Create a Query, stripping patterns that reference unknown node/field names.
 * Handles version mismatches between queries and WASM parsers.
 */
function createQuerySafe(language: Language, source: string): Query {
  const MAX_ATTEMPTS = 50
  let current = source

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return new Query(language, current)
    } catch (err: any) {
      if (err.index != null) {
        const errorIndex = err.index as number

        if (errorIndex >= current.length) {
          current = current.trimEnd()
          if (current === source) throw err
          continue
        }

        const prev = current
        current = removePatternAtOffset(current, errorIndex)
        if (current === prev) throw err
        continue
      }
      throw err
    }
  }

  return new Query(language, current)
}

/**
 * Remove the top-level balanced parenthesized pattern that contains the given byte offset.
 */
function removePatternAtOffset(source: string, offset: number): string {
  let patternStart = -1
  let depth = 0
  let i = 0

  while (i < source.length) {
    const ch = source[i]

    if (ch === ';' && depth === 0) {
      const nl = source.indexOf('\n', i)
      i = nl === -1 ? source.length : nl + 1
      continue
    }

    if (ch === '"') {
      i++
      while (i < source.length && source[i] !== '"') {
        if (source[i] === '\\') i++
        i++
      }
      i++
      continue
    }

    if (ch === '(') {
      if (depth === 0) patternStart = i
      depth++
    } else if (ch === ')') {
      depth--
      if (depth === 0 && patternStart !== -1) {
        const patternEnd = i + 1
        if (patternStart <= offset && offset < patternEnd) {
          return source.slice(0, patternStart) + source.slice(patternEnd)
        }
        patternStart = -1
      }
    }

    i++
  }

  const lineStart = source.lastIndexOf('\n', offset - 1) + 1
  const lineEnd = source.indexOf('\n', offset)
  if (lineEnd !== -1) {
    return source.slice(0, lineStart) + source.slice(lineEnd + 1)
  }
  return source.slice(0, lineStart)
}

/**
 * Get a loaded language by name or alias.
 */
export function getLoadedLanguage(nameOrAlias: string): LoadedLanguage | undefined {
  const id = resolveLanguageId(nameOrAlias)
  return loadedLanguages.get(id)
}

/**
 * Get all loaded language ids.
 */
export function getLoadedLanguageIds(): string[] {
  return [...loadedLanguages.keys()]
}

import { describe, it, expect, beforeAll } from 'vitest'
import {
  initParser,
  loadLanguage,
  loadPlaintext,
  getLoadedLanguage,
  getLoadedLanguageIds,
  resolveLanguageId,
} from '../src/platform/node.js'
import json from '../langs/json.ts'
import { configureLocalWasmResolver } from './wasm.js'

beforeAll(async () => {
  configureLocalWasmResolver(['diff', 'json'])
  await initParser()
}, 120_000)

describe('resolveLanguageId', () => {
  it('returns the id itself when no alias registered', () => {
    expect(resolveLanguageId('unknown')).toBe('unknown')
  })

  it('resolves plaintext aliases', () => {
    expect(resolveLanguageId('text')).toBe('plaintext')
    expect(resolveLanguageId('txt')).toBe('plaintext')
    expect(resolveLanguageId('plain')).toBe('plaintext')
  })

  it('resolves aliases after language is loaded', async () => {
    await loadLanguage({
      definition: { id: json.id, aliases: json.aliases },
      wasm: json.wasm,
      highlights: json.highlights,
    })
    for (const alias of json.aliases) {
      expect(resolveLanguageId(alias)).toBe('json')
    }
  })
})

describe('loadLanguage', () => {
  it('loads and registers a language', async () => {
    await loadLanguage({
      definition: { id: json.id, aliases: json.aliases },
      wasm: json.wasm,
      highlights: json.highlights,
    })
    expect(getLoadedLanguage('json')).toBeDefined()
    expect(getLoadedLanguage('json')!.definition.id).toBe('json')
  })

  it('is idempotent', async () => {
    const first = getLoadedLanguage('json')
    await loadLanguage({
      definition: { id: json.id, aliases: json.aliases },
      wasm: json.wasm,
      highlights: json.highlights,
    })
    expect(getLoadedLanguage('json')).toBe(first)
  })
})

describe('getLoadedLanguage', () => {
  it('returns undefined for unloaded language', () => {
    expect(getLoadedLanguage('python')).toBeUndefined()
  })

  it('resolves by alias', () => {
    const byId = getLoadedLanguage('json')
    for (const alias of json.aliases) {
      expect(getLoadedLanguage(alias)).toBe(byId)
    }
  })
})

describe('getLoadedLanguageIds', () => {
  it('includes loaded languages', () => {
    expect(getLoadedLanguageIds()).toContain('json')
  })

  it('does not eagerly load plaintext during initParser', () => {
    expect(getLoadedLanguage('plaintext')).toBeUndefined()
  })

  it('does not include unloaded languages', () => {
    expect(getLoadedLanguageIds()).not.toContain('python')
  })
})

describe('loadPlaintext', () => {
  it('loads plaintext with diff parser', async () => {
    await loadPlaintext()
    const loaded = getLoadedLanguage('plaintext')
    expect(loaded).toBeDefined()
    expect(loaded!.definition.id).toBe('plaintext')
    expect(loaded!.parser).toBeDefined()
    expect(loaded!.config.query).toBeDefined()
  })

  it('is idempotent', async () => {
    const first = getLoadedLanguage('plaintext')
    await loadPlaintext()
    expect(getLoadedLanguage('plaintext')).toBe(first)
  })

  it('is accessible via aliases', async () => {
    await loadPlaintext()
    const byId = getLoadedLanguage('plaintext')
    expect(getLoadedLanguage('text')).toBe(byId)
    expect(getLoadedLanguage('txt')).toBe(byId)
    expect(getLoadedLanguage('plain')).toBe(byId)
  })

  it('appears in loaded language ids', async () => {
    await loadPlaintext()
    expect(getLoadedLanguageIds()).toContain('plaintext')
  })
})

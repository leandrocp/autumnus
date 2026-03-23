import { rmSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ensureLocalParserWasm, ensureLocalWasm } from './wasm.js'

const CACHE_DIR = 'node_modules/.cache/lumis'

beforeEach(() => {
  // Clear FS cache so the resolver is always called
  try { rmSync(CACHE_DIR, { recursive: true }) } catch {}
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetModules()
})

describe('Wasm resolver', () => {
  it('uses parser name and version in the default resolver', async () => {
    const { default: diff } = await import('../langs/diff.ts')

    expect(diff.wasm).toEqual({
      packageName: '@lumis-sh/wasm-diff',
      name: 'tree-sitter-diff',
      version: expect.any(String),
    })
  })

  it('loads WasmRef bundles from file:// URLs in Node without fetch', async () => {
    const { createHighlighter } = await import('../src/index.js')
    const { htmlLinked } = await import('../src/formatters.js')
    const { default: diff } = await import('../langs/diff.ts')

    const hl = await createHighlighter({
      langs: [{ ...diff, wasm: ensureLocalWasm('diff') }],
    })

    const html = hl.highlight('- old\n+ new', htmlLinked({ language: diff }))
    expect(html).toContain('class="language-diff"')
  }, 30_000)

  it('accepts wasmResolver in createHighlighter options', async () => {
    const { createHighlighter } = await import('../src/index.js')
    const { htmlLinked } = await import('../src/formatters.js')
    const { default: diff } = await import('../langs/diff.ts')

    const resolver = (_language: string, wasm: { name: string }) => ensureLocalParserWasm(_language, wasm.name)

    const hl = await createHighlighter({
      langs: [diff],
      wasmResolver: resolver,
    })

    const html = hl.highlight('- old\n+ new', htmlLinked({ language: diff }))
    expect(html).toContain('class="language-diff"')
  }, 30_000)

  it('per-instance resolver is isolated from global resolver', async () => {
    const { createHighlighter, configureWasmResolver } = await import('../src/index.js')
    const { htmlLinked } = await import('../src/formatters.js')
    const { default: diff } = await import('../langs/diff.ts')

    const globalCalls: string[] = []
    const instanceCalls: string[] = []

    configureWasmResolver((language, wasm) => {
      globalCalls.push(language)
      return ensureLocalParserWasm(language, wasm.name)
    })

    const hl = await createHighlighter({
      langs: [diff],
      wasmResolver: (language, wasm) => {
        instanceCalls.push(language)
        return ensureLocalParserWasm(language, wasm.name)
      },
    })

    const html = hl.highlight('- old\n+ new', htmlLinked({ language: diff }))
    expect(html).toContain('class="language-diff"')
    expect(instanceCalls.length).toBeGreaterThan(0)
    expect(globalCalls).not.toContain('diff')
  }, 30_000)

  it('global configureWasmResolver applies to createHighlighter without explicit resolver', async () => {
    const { createHighlighter, configureWasmResolver } = await import('../src/index.js')
    const { htmlLinked } = await import('../src/formatters.js')
    const { default: diff } = await import('../langs/diff.ts')

    const calls: string[] = []
    configureWasmResolver((language, wasm) => {
      calls.push(language)
      return ensureLocalParserWasm(language, wasm.name)
    })

    const hl = await createHighlighter({ langs: [diff] })
    const html = hl.highlight('- old\n+ new', htmlLinked({ language: diff }))

    expect(html).toContain('class="language-diff"')
    expect(calls).toContain('diff')
  }, 30_000)

  it('configureWasmResolver called after createHighlighter affects highlighters without explicit resolver', async () => {
    const { createHighlighter, configureWasmResolver } = await import('../src/index.js')
    const { default: html } = await import('../langs/html.ts')

    const hl = await createHighlighter()

    const calls: string[] = []
    configureWasmResolver((language, wasm) => {
      calls.push(language)
      return ensureLocalParserWasm(language, wasm.name)
    })

    await hl.loadLanguage(html)

    expect(calls).toContain('html')
  }, 30_000)
})

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ensureLocalParserWasm, ensureLocalWasm } from './wasm.js'

const CACHE_DIR = '.tmp/wasm-resolver-cache'
process.env.LUMIS_WASM_CACHE_DIR = CACHE_DIR

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
      sha256: expect.stringMatching(/^[0-9a-f]{64}$/),
      size: expect.any(Number),
    })
  })

  it('loads WasmRef bundles from file:// URLs in Node without fetch', async () => {
    const { createHighlighter } = await import('../src/index.js')
    const { htmlLinked } = await import('../src/formatters.js')
    const { default: diff } = await import('../langs/diff.ts')

    const hl = await createHighlighter({
      languages: [{ ...diff, wasm: ensureLocalWasm('diff') }],
      wasmResolver: (language, wasm) => ensureLocalParserWasm(language, wasm.name),
    })

    const html = hl.highlight('- old\n+ new', htmlLinked({ language: diff }))
    expect(html).toContain('class="language-diff"')
  }, 30_000)

  it('supports withWasm for explicit runtime wasm inputs', async () => {
    const { createHighlighter, withWasm } = await import('../src/index.js')
    const { htmlLinked } = await import('../src/formatters.js')
    const { default: diff } = await import('../langs/diff.ts')

    const language = withWasm(diff, ensureLocalWasm('diff'))
    const hl = await createHighlighter({
      languages: [language],
      wasmResolver: (language, wasm) => ensureLocalParserWasm(language, wasm.name),
    })

    const html = hl.highlight('- old\n+ new', htmlLinked({ language }))
    expect(html).toContain('class="language-diff"')
  }, 30_000)

  it('accepts wasmResolver in createHighlighter options', async () => {
    const { createHighlighter } = await import('../src/index.js')
    const { htmlLinked } = await import('../src/formatters.js')
    const { default: diff } = await import('../langs/diff.ts')

    const resolver = (_language: string, wasm: { name: string }) => ensureLocalParserWasm(_language, wasm.name)

    const hl = await createHighlighter({
      languages: [diff],
      wasmResolver: resolver,
    })

    const html = hl.highlight('- old\n+ new', htmlLinked({ language: diff }))
    expect(html).toContain('class="language-diff"')
  }, 30_000)

  it('shares verified parser bytes across highlighter instances', async () => {
    const { createHighlighter } = await import('../src/index.js')
    const { default: diff } = await import('../langs/diff.ts')
    const resolver = vi.fn((language: string, wasm: { name: string }) =>
      ensureLocalParserWasm(language, wasm.name)
    )

    await createHighlighter({ languages: [diff], wasmResolver: resolver })
    await createHighlighter({ languages: [diff], wasmResolver: resolver })

    expect(resolver).toHaveBeenCalledTimes(1)
  }, 30_000)

  it('replaces a corrupted persistent cache entry', async () => {
    const { createHighlighter } = await import('../src/index.js')
    const { htmlLinked } = await import('../src/formatters.js')
    const { default: diff } = await import('../langs/diff.ts')
    const key = `${diff.wasm.name}-${diff.wasm.version}-${diff.wasm.sha256}`
    const cacheFile = join(CACHE_DIR, `${encodeURIComponent(key)}.wasm`)
    mkdirSync(CACHE_DIR, { recursive: true })
    writeFileSync(cacheFile, new Uint8Array([0, 1, 2, 3]))

    const hl = await createHighlighter({
      languages: [diff],
      wasmResolver: (language, wasm) => ensureLocalParserWasm(language, wasm.name),
    })

    expect(hl.highlight('- old\n+ new', htmlLinked({ language: diff }))).toContain(
      'class="language-diff"',
    )
    expect(readFileSync(cacheFile).byteLength).toBe(diff.wasm.size)
  }, 30_000)

  it('rejects parser bytes that do not match the exact manifest entry', async () => {
    const { createHighlighter } = await import('../src/index.js')
    const { default: diff } = await import('../langs/diff.ts')

    await expect(
      createHighlighter({
        languages: [diff],
        wasmResolver: (language) => ensureLocalParserWasm(language, 'tree-sitter-html'),
      }),
    ).rejects.toThrow(/Invalid WASM (size|integrity)/)
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
      languages: [diff],
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

    const hl = await createHighlighter({ languages: [diff] })
    const html = hl.highlight('- old\n+ new', htmlLinked({ language: diff }))

    expect(html).toContain('class="language-diff"')
    expect(calls).toContain('diff')
  }, 30_000)

  it('configureWasmResolver called after createHighlighter affects highlighters without explicit resolver', async () => {
    const { createHighlighter, configureWasmResolver } = await import('../src/index.js')
    const { default: html } = await import('../langs/html.ts')

    configureWasmResolver((language, wasm) => ensureLocalParserWasm(language, wasm.name))
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

import { describe, it, expect, beforeAll } from 'vitest'
import {
  createHighlighter,
  highlight,
  Highlighter,
  htmlInline,
  htmlLinked,
} from '../src/index.js'
import type { Formatter } from '../src/index.js'
import javascript from '../langs/javascript.js'
import rust from '../langs/rust.js'
import json from '../langs/json.js'
import plaintext from '../langs/plaintext.js'
import tokyonight_moon from '../themes/tokyonight_moon.js'

let hl: InstanceType<typeof Highlighter>

beforeAll(async () => {
  hl = await createHighlighter({
    langs: [javascript, rust],
    themes: [tokyonight_moon],
  })
})

describe('createHighlighter', () => {
  it('loads languages passed in init', () => {
    expect(hl.languages).toContain('javascript')
    expect(hl.languages).toContain('rust')
  })

  it('loads languages dynamically via loadLanguage', async () => {
    await hl.loadLanguage(json)
    expect(hl.languages).toContain('json')
  })

  it('registers themes dynamically via loadTheme', () => {
    expect(() => hl.loadTheme(tokyonight_moon)).not.toThrow()
  })
})

describe('hl.highlight (stateful)', () => {
  it('renders html_inline with theme', () => {
    const html = hl.highlight(
      'const x = 1',
      htmlInline({ lang: 'javascript', theme: 'tokyonight_moon' })
    )
    expect(html).toContain('<pre class="lumis"')
    expect(html).toContain('class="language-javascript"')
    expect(html).toContain('data-line="1"')
    expect(html).toContain('style="color:')
  })

  it('resolves language aliases', () => {
    const html = hl.highlight(
      'const x = 42',
      htmlInline({ lang: 'js', theme: 'tokyonight_moon' })
    )
    expect(html).toContain('class="language-javascript"')
  })

  it('accepts LanguageBundle as lang', () => {
    const html = hl.highlight(
      'let y = 2',
      htmlInline({ lang: javascript, theme: 'tokyonight_moon' })
    )
    expect(html).toContain('<span')
    expect(html).toContain('class="language-javascript"')
  })

  it('applies preClass option', () => {
    const html = hl.highlight(
      'fn main() {}',
      htmlInline({ lang: 'rust', theme: 'tokyonight_moon', preClass: 'code-block' })
    )
    expect(html).toContain('class="lumis code-block"')
  })

  it('applies italic option', () => {
    const html = hl.highlight(
      'let x = 1;',
      htmlInline({ lang: 'rust', theme: 'tokyonight_moon', italic: true })
    )
    expect(html).toContain('font-style: italic')
  })

  it('applies includeHighlights option', () => {
    const html = hl.highlight(
      '{"a": 1}',
      htmlInline({ lang: 'json', theme: 'tokyonight_moon', includeHighlights: true })
    )
    expect(html).toContain('data-highlight=')
  })

  it('wraps output with header', () => {
    const html = hl.highlight(
      'console.log("hi")',
      htmlInline({
        lang: 'js',
        theme: 'tokyonight_moon',
        header: {
          openTag: '<div class="wrapper">',
          closeTag: '</div>',
        },
      })
    )
    expect(html).toMatch(/^<div class="wrapper">/)
    expect(html).toMatch(/<\/div>$/)
  })

  it('renders html_linked with CSS classes', () => {
    const html = hl.highlight('const x = 1', htmlLinked({ lang: 'js' }))
    expect(html).toContain('<pre class="lumis">')
    expect(html).toContain('class="language-javascript"')
    expect(html).toMatch(/class="(keyword|variable|operator|number)"/)
  })

  it('throws for unloaded language', () => {
    expect(() =>
      hl.highlight('code', htmlInline({ lang: 'python', theme: 'tokyonight_moon' }))
    ).toThrow(/not loaded/)
  })
})

describe('plaintext', () => {
  it('renders when lang is omitted (html_inline)', () => {
    const html = hl.highlight(
      'just text\nwith <html> & stuff',
      htmlInline({ theme: 'tokyonight_moon' })
    )
    expect(html).toContain('class="language-plaintext"')
    expect(html).toContain('&lt;html&gt;')
    expect(html).toContain('&amp;')
    expect(html).toContain('data-line="1"')
    expect(html).toContain('data-line="2"')
    expect(html).not.toContain('<span')
  })

  it('renders when lang is omitted (html_linked)', () => {
    const html = hl.highlight('plain text', htmlLinked())
    expect(html).toContain('class="language-plaintext"')
    expect(html).toContain('plain text')
  })

  it('renders with lang: "plaintext" string', () => {
    const html = hl.highlight(
      'hello world',
      htmlInline({ lang: 'plaintext', theme: 'tokyonight_moon' })
    )
    expect(html).toContain('class="language-plaintext"')
    expect(html).not.toContain('<span')
  })

  it('renders with plaintext LanguageBundle', () => {
    const html = hl.highlight(
      'hello world',
      htmlInline({ lang: plaintext, theme: 'tokyonight_moon' })
    )
    expect(html).toContain('class="language-plaintext"')
    expect(html).not.toContain('<span')
  })

  it('resolves aliases: text, txt, plain', () => {
    for (const alias of ['text', 'txt', 'plain']) {
      const html = hl.highlight('x', htmlInline({ lang: alias, theme: 'tokyonight_moon' }))
      expect(html).toContain('class="language-plaintext"')
    }
  })

  it('works with stateless highlight()', async () => {
    const html = await highlight(
      'hello',
      htmlInline({ lang: plaintext, theme: tokyonight_moon })
    )
    expect(html).toContain('class="language-plaintext"')
  })

  it('applies preClass', () => {
    const html = hl.highlight(
      'text',
      htmlInline({ lang: 'plaintext', theme: 'tokyonight_moon', preClass: 'my-class' })
    )
    expect(html).toContain('class="lumis my-class"')
  })

  it('wraps with header', () => {
    const html = hl.highlight(
      'text',
      htmlInline({
        lang: 'plaintext',
        theme: 'tokyonight_moon',
        header: { openTag: '<div>', closeTag: '</div>' },
      })
    )
    expect(html).toMatch(/^<div>/)
    expect(html).toMatch(/<\/div>$/)
  })
})

describe('highlight() stateless shorthand', () => {
  it('auto-loads LanguageBundle and ThemeData', async () => {
    const html = await highlight(
      'const z = 3',
      htmlInline({ lang: javascript, theme: tokyonight_moon })
    )
    expect(html).toContain('<span')
    expect(html).toContain('class="language-javascript"')
  })

  it('renders plaintext when lang is omitted', async () => {
    const html = await highlight('hello', htmlInline({ theme: tokyonight_moon }))
    expect(html).toContain('class="language-plaintext"')
  })
})

describe('Highlighter.create (deprecated)', () => {
  it('still works as createHighlighter alias', async () => {
    const hl2 = await Highlighter.create({
      langs: [javascript],
      themes: [tokyonight_moon],
    })
    const html = hl2.highlight(
      'const w = 4',
      htmlInline({ lang: 'javascript', theme: 'tokyonight_moon' })
    )
    expect(html).toContain('<span')
  })
})

describe('formatter factories', () => {
  it('htmlInline returns a valid formatter', () => {
    const fmt = htmlInline({ lang: 'js', theme: 'tokyonight_moon' })
    expect(fmt).toHaveProperty('lang', 'js')
    expect(fmt).toHaveProperty('theme', 'tokyonight_moon')
  })

  it('htmlLinked returns a valid formatter', () => {
    const fmt = htmlLinked({ lang: 'js', preClass: 'custom' })
    expect(fmt).toHaveProperty('lang', 'js')
    expect(fmt).toHaveProperty('preClass', 'custom')
  })

  it('htmlInline defaults are empty', () => {
    const fmt = htmlInline()
    expect(fmt).not.toHaveProperty('lang')
    expect(fmt).not.toHaveProperty('theme')
  })
})

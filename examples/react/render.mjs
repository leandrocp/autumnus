import fs from 'node:fs/promises'
import { renderToStaticMarkup } from 'react-dom/server'
import { renderCodeBlock } from '@lumis-sh/react'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import githubLight from '@lumis-sh/themes/github_light'
import { jsx, Fragment } from 'react/jsx-runtime'

const block = await renderCodeBlock({
  children: `export function greet(name) {
  return \`Hello, \${name}!\`
}`,
  formatter: htmlInline({ language: bundledLanguages.javascript, theme: githubLight }),
})

const html = renderToStaticMarkup(
  jsx('main', {
    style: { fontFamily: 'system-ui, sans-serif', margin: '2rem auto', maxWidth: '880px' },
    children: [
      jsx('h1', { children: 'Lumis React Server Render' }, 'title'),
      jsx('p', { children: 'This file was generated with renderCodeBlock().' }, 'copy'),
      jsx(Fragment, { children: block }, 'block'),
    ],
  }),
)

await fs.writeFile(
  new URL('./output.html', import.meta.url),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Lumis React SSR</title></head><body>${html}</body></html>`,
)

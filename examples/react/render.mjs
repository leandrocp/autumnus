import fs from 'node:fs/promises'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { renderCodeBlock } from '@lumis-sh/react'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import githubLight from '@lumis-sh/themes/github_light'

const block = await renderCodeBlock({
  children: `export function greet(name) {
  return \`Hello, \${name}!\`
}`,
  formatter: htmlInline({ language: bundledLanguages.javascript, theme: githubLight }),
})

const html = renderToStaticMarkup(
  React.createElement('main', { style: { fontFamily: 'system-ui, sans-serif', margin: '2rem auto', maxWidth: '880px' } }, [
    React.createElement('h1', { key: 'title' }, 'Lumis React Server Render'),
    React.createElement('p', { key: 'copy' }, 'This file was generated with renderCodeBlock().'),
    React.createElement(React.Fragment, { key: 'block' }, block),
  ]),
)

await fs.writeFile(
  new URL('./output.html', import.meta.url),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Lumis React SSR</title></head><body>${html}</body></html>`,
)

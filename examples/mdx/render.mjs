import { writeFile } from 'node:fs/promises'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import rehypeLumis from '@lumis-sh/rehype-lumis'
import githubLight from '@lumis-sh/themes/github_light'

const source = `# Demo

\`\`\`js
export function greet(name) {
  return \`Hello, \${name}!\`
}
\`\`\`

\`\`\`rust
fn main() {
    println!("Hello, world!");
}
\`\`\`
`

const compiled = await compile(source, {
  outputFormat: 'function-body',
  rehypePlugins: [[rehypeLumis, { theme: githubLight, fallbackLanguage: 'plaintext' }]],
})

const { default: Content } = await run(String(compiled), {
  ...runtime,
  baseUrl: import.meta.url,
})

const html = renderToStaticMarkup(React.createElement(Content))
await writeFile(new URL('./output.html', import.meta.url), html)
console.log('Wrote examples/mdx/output.html')

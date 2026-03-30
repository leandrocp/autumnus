import React from 'react'
import { createRoot } from 'react-dom/client'
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import rehypeLumis from '@lumis-sh/rehype-lumis'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
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
  rehypePlugins: [[rehypeLumis, {
    formatter: (language) => htmlInline({ language, theme: githubLight }),
    languages: [bundledLanguages],
  }]],
})

const { default: Content } = await run(String(compiled), {
  ...runtime,
  baseUrl: import.meta.url,
})

createRoot(document.querySelector('#app')).render(React.createElement(Content))

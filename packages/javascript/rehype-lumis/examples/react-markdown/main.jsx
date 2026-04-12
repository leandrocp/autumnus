import React from 'react'
import { createRoot } from 'react-dom/client'
import { MarkdownHooks } from 'react-markdown'
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

function App() {
  return (
    <MarkdownHooks rehypePlugins={[[rehypeLumis, { theme: githubLight, fallbackLanguage: 'plaintext' }]]}>
      {source}
    </MarkdownHooks>
  )
}

createRoot(document.querySelector('#app')).render(<App />)

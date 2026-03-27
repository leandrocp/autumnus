import { writeFile } from 'node:fs/promises'
import { Writable } from 'node:stream'
import React from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { MarkdownAsync } from 'react-markdown'
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

const html = await new Promise((resolve, reject) => {
  let output = ''

  const stream = renderToPipeableStream(
    React.createElement(
      MarkdownAsync,
      {
        rehypePlugins: [[rehypeLumis, { theme: githubLight, fallbackLanguage: 'plaintext' }]],
      },
      source,
    ),
    {
      onAllReady() {
        stream.pipe(new Writable({
          write(chunk, _encoding, callback) {
            output += chunk.toString()
            callback()
          },
          final(callback) {
            resolve(output)
            callback()
          },
        }))
      },
      onError(error) {
        reject(error)
      },
    },
  )
})

await writeFile(new URL('./output.html', import.meta.url), html)
console.log('Wrote examples/react-markdown/output.html')

import { writeFile } from 'node:fs/promises'
import MarkdownIt from 'markdown-it'
import markdownItLumis from '@lumis-sh/markdown-it-lumis'
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

const md = new MarkdownIt()
const install = await markdownItLumis({
  theme: githubLight,
  loadLanguages: ['javascript', 'rust', 'plaintext'],
  fallbackLanguage: 'plaintext',
})

install(md)

const html = md.render(source)
await writeFile(new URL('./output.html', import.meta.url), html)
console.log('Wrote examples/markdown-it/output.html')

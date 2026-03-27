import { writeFile } from 'node:fs/promises'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
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

const file = await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeLumis, {
    theme: githubLight,
    fallbackLanguage: 'plaintext',
  })
  .use(rehypeStringify)
  .process(source)

await writeFile(new URL('./output.html', import.meta.url), String(file))
console.log('Wrote examples/rehype-lumis/output.html')

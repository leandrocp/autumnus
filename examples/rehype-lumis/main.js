import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeLumis from '@lumis-sh/rehype-lumis'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import javascript from '@lumis-sh/lumis/langs/javascript'
import rust from '@lumis-sh/lumis/langs/rust'
import plaintext from '@lumis-sh/lumis/langs/plaintext'
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
    formatter: (language) => htmlInline({ language, theme: githubLight }),
    languages: [javascript, rust, plaintext],
  })
  .use(rehypeStringify)
  .process(source)

document.querySelector('#app').innerHTML = String(file)

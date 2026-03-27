import MarkdownIt from 'markdown-it'
import markdownItLumis from '@lumis-sh/markdown-it-lumis'
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

const md = new MarkdownIt()
const install = await markdownItLumis({
  formatter: (language) => htmlInline({ language, theme: githubLight }),
  languages: [javascript, rust, plaintext],
})

install(md)

document.querySelector('#app').innerHTML = md.render(source)

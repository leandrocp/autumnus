import { writeFile } from 'node:fs/promises'
import { createHighlighter } from '@lumis-sh/lumis'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/essential'
import githubLight from '@lumis-sh/themes/github_light'

const source = `# lumis.config.toml
theme = "github-light"

[highlight]
language = "json"
line_numbers = true

[render]
format = "html"
inline_styles = true
`

const highlighter = await createHighlighter({ languages: [bundledLanguages] })
await highlighter.loadLanguage(bundledLanguages.toml)

const code = highlighter.highlight(
  source,
  htmlInline({ language: bundledLanguages.toml, theme: githubLight }),
)

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>wasm-bundle-essential-node + Lumis</title>
    <style>
      body { font-family: sans-serif; margin: 2rem; background: #f6f7f9; }
      main { max-width: 960px; margin: 0 auto; }
      pre.lumis { overflow-x: auto; }
    </style>
  </head>
  <body>
    <main>
      <h1>wasm-bundle-essential-node + Lumis</h1>
      <p>This example installs <code>@lumis-sh/wasm-bundle-essential</code> and imports only the Lumis language bundle.</p>
      ${code}
    </main>
  </body>
</html>
`

await writeFile(new URL('./output.html', import.meta.url), html)
console.log('Wrote examples/wasm-bundle-essential-node/output.html')

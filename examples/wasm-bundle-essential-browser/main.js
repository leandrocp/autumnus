import { createHighlighter, withWasmBundle } from '@lumis-sh/lumis'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/essential'
import { bundledWasms } from '@lumis-sh/wasm-bundle-essential'
import githubLight from '@lumis-sh/themes/github_light'

const languages = withWasmBundle(bundledLanguages, bundledWasms)

const source = `# lumis.config.toml
theme = "github-light"

[highlight]
language = "json"
line_numbers = true

[render]
format = "html"
inline_styles = true
`

const output = document.querySelector('#output')
const error = document.querySelector('#error')

try {
  const highlighter = await createHighlighter({ languages: [languages] })
  await highlighter.loadLanguage(languages.toml)

  output.innerHTML = highlighter.highlight(
    source,
    htmlInline({ language: languages.toml, theme: githubLight }),
  )
} catch (err) {
  error.style.display = 'block'
  error.textContent = err instanceof Error ? err.stack ?? err.message : String(err)
  output.textContent = 'Failed to load the essential bundle parser.'
}

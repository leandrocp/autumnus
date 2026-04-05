import { createRoot } from 'react-dom/client'
import { createHighlighter } from '@lumis-sh/lumis'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
import { fromHighlighter } from '@lumis-sh/react'
import { htmlInline, htmlMultiThemes } from '@lumis-sh/lumis/formatters'
import githubDark from '@lumis-sh/themes/github_dark'
import githubLight from '@lumis-sh/themes/github_light'

const highlighter = await createHighlighter({ languages: [bundledLanguages] })
const { CodeBlock } = fromHighlighter(highlighter)

function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', margin: '2rem auto', maxWidth: 880 }}>
      <h1>Lumis React</h1>

      <CodeBlock formatter={htmlInline({ language: 'javascript', theme: githubLight })}>
        {`export function greet(name) {
  return \`Hello, \${name}!\`
}`}
      </CodeBlock>

      <div style={{ height: 24 }} />

      <CodeBlock
        formatter={htmlMultiThemes({
          language: 'tsx',
          themes: { light: githubLight, dark: githubDark },
          defaultTheme: 'light-dark()',
        })}
      >
        {`export function Button() {
  return <button type="button">Click me</button>
}`}
      </CodeBlock>
    </main>
  )
}

createRoot(document.querySelector('#app')).render(<App />)

import React, { useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { CodeBlock, useCodeBlock } from '@lumis-sh/react'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
import { htmlInline, htmlMultiThemes } from '@lumis-sh/lumis/formatters'
import githubDark from '@lumis-sh/themes/github_dark'
import githubLight from '@lumis-sh/themes/github_light'

function HookExample({ code }) {
  const formatter = useMemo(
    () => htmlInline({ language: bundledLanguages.javascript, theme: githubLight }),
    [],
  )

  const { content, isLoading } = useCodeBlock({
    children: code,
    formatter,
  })

  return (
    <section>
      <p>{isLoading ? 'Highlighting...' : 'Ready'}</p>
      {content}
    </section>
  )
}

function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', margin: '2rem auto', maxWidth: 880 }}>
      <h1>Lumis React</h1>
      <p>Client component and hook examples using formatter-first APIs.</p>

      <CodeBlock formatter={htmlInline({ language: bundledLanguages.javascript, theme: githubLight })}>
        {`export function greet(name) {
  return \`Hello, \${name}!\`
}`}
      </CodeBlock>

      <div style={{ height: 24 }} />

      <CodeBlock
        formatter={htmlMultiThemes({
          language: bundledLanguages.tsx,
          themes: { light: githubLight, dark: githubDark },
          defaultTheme: 'light-dark()',
        })}
      >
        {`export function Button() {
  return <button type="button">Click me</button>
}`}
      </CodeBlock>

      <div style={{ height: 24 }} />

      <HookExample
        code={`const total = items.reduce((sum, item) => sum + item.price, 0)`}
      />
    </main>
  )
}

createRoot(document.querySelector('#app')).render(<App />)

# @lumis-sh/react

React helpers and components for Lumis.

## Install

```bash
npm install @lumis-sh/react @lumis-sh/lumis @lumis-sh/themes react
```

## Client component

```tsx
import { createHighlighter } from '@lumis-sh/lumis'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
import { fromHighlighter } from '@lumis-sh/react'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import githubLight from '@lumis-sh/themes/github_light'

const highlighter = await createHighlighter({ languages: [bundledLanguages] })
const { CodeBlock } = fromHighlighter(highlighter)

export function Example() {
  return (
    <CodeBlock formatter={htmlInline({ language: 'javascript', theme: githubLight })}>
      {`const x = 1`}
    </CodeBlock>
  )
}
```

When `fromHighlighter` receives a resolved `Highlighter`, `CodeBlock` renders synchronously with no flash of unstyled content.

When it receives a `Promise<Highlighter>`, `CodeBlock` renders nothing until the highlighter resolves.

## Server rendering

```tsx
import { renderCodeBlock } from '@lumis-sh/react'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import githubLight from '@lumis-sh/themes/github_light'

const node = await renderCodeBlock({
  children: 'const x = 1',
  formatter: htmlInline({ language: bundledLanguages.javascript, theme: githubLight }),
})
```

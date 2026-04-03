# @lumis-sh/react

React helpers and components for Lumis.

## Install

```bash
npm install @lumis-sh/react @lumis-sh/lumis @lumis-sh/themes react
```

## Client component

```tsx
import { CodeBlock } from '@lumis-sh/react'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import githubLight from '@lumis-sh/themes/github_light'

export function Example() {
  return (
    <CodeBlock formatter={htmlInline({ language: bundledLanguages.javascript, theme: githubLight })}>
      {`const x = 1`}
    </CodeBlock>
  )
}
```

`CodeBlock` renders a plain fallback first and then highlights after mount.

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

## Reuse a highlighter

```tsx
import { createHighlighter } from '@lumis-sh/lumis'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
import { fromHighlighter } from '@lumis-sh/react'

const highlighter = await createHighlighter({ languages: [bundledLanguages] })
const { CodeBlock, renderCodeBlock, useCodeBlock } = fromHighlighter(highlighter)
```

This is the recommended path when you want to preload a bundle and reuse one highlighter across many blocks.

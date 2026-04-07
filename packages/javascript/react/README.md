# @lumis-sh/react

React integration for [Lumis](https://lumis.sh) syntax highlighting.

Docs: [https://lumis.sh/docs](https://lumis.sh/docs)

## Install

```bash
npm install @lumis-sh/react @lumis-sh/lumis @lumis-sh/themes react
```

## Usage

```tsx
import { CodeBlock } from '@lumis-sh/react'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import githubLight from '@lumis-sh/themes/github_light'

export function Example() {
  return (
    <CodeBlock formatter={htmlInline({ language: 'javascript', theme: githubLight })}>
      {`const x = 1`}
    </CodeBlock>
  )
}
```

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

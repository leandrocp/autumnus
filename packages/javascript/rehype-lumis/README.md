# @lumis-sh/rehype-lumis

rehype plugin for [Lumis](https://lumis.sh).

## Usage

```ts
import { unified } from 'unified'
import rehypeLumis from '@lumis-sh/rehype-lumis'
import dracula from '@lumis-sh/themes/dracula'

unified()
  .use(rehypeLumis, { theme: dracula })
```

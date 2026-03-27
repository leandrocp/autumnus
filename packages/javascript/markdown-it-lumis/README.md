# @lumis-sh/markdown-it-lumis

markdown-it plugin for [Lumis](https://lumis.sh).

## Usage

```ts
import MarkdownIt from 'markdown-it'
import markdownItLumis from '@lumis-sh/markdown-it-lumis'
import dracula from '@lumis-sh/themes/dracula'

const md = new MarkdownIt()

const lumis = await markdownItLumis({ theme: dracula })
lumis(md)
```

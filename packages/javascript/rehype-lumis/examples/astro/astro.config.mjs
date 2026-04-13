import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import rehypeLumis from '@lumis-sh/rehype-lumis'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
import githubLight from '@lumis-sh/themes/github_light'

export default defineConfig({
  integrations: [
    mdx({
      rehypePlugins: [[rehypeLumis, {
        formatter: (language) => htmlInline({ language, theme: githubLight }),
        languages: [bundledLanguages],
      }]],
    }),
  ],
})

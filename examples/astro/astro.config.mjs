import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import rehypeLumis from '@lumis-sh/rehype-lumis'
import githubLight from '@lumis-sh/themes/github_light'

export default defineConfig({
  integrations: [
    mdx({
      rehypePlugins: [[rehypeLumis, { theme: githubLight, fallbackLanguage: 'plaintext' }]],
    }),
  ],
})

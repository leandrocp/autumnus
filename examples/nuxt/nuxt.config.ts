import { htmlInline } from '@lumis-sh/lumis/formatters'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
import githubLight from '@lumis-sh/themes/github_light'

export default defineNuxtConfig({
  modules: ['@nuxt/content'],
  content: {
    build: {
      markdown: {
        highlight: false,
        rehypePlugins: {
          '@lumis-sh/rehype-lumis': {
            options: {
              formatter: (language) => htmlInline({ language, theme: githubLight }),
              languages: [bundledLanguages],
            },
          },
        },
      },
    },
  },
})

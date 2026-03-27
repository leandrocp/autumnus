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
              theme: githubLight,
              fallbackLanguage: 'plaintext',
            },
          },
        },
      },
    },
  },
})

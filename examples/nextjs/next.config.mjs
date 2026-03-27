import createMDX from '@next/mdx'
import githubLight from '@lumis-sh/themes/github_light'

const withMDX = createMDX({
  options: {
    rehypePlugins: [['@lumis-sh/rehype-lumis', { theme: githubLight, fallbackLanguage: 'plaintext' }]],
  },
})

export default withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
})

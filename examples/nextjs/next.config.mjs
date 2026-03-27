import createMDX from '@next/mdx'
import { fileURLToPath } from 'node:url'

const rehypeLumisPath = fileURLToPath(new URL('./rehype-lumis.mjs', import.meta.url))

const withMDX = createMDX({
  options: {
    rehypePlugins: [rehypeLumisPath],
  },
})

export default withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
})

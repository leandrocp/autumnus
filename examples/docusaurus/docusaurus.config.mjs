import rehypeLumis from '@lumis-sh/rehype-lumis'
import githubLight from '@lumis-sh/themes/github_light'

export default {
  title: 'Docusaurus + Lumis',
  url: 'https://example.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'lumis',
  projectName: 'docusaurus-example',
  onBrokenLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          rehypePlugins: [[rehypeLumis, { theme: githubLight, fallbackLanguage: 'plaintext' }]],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],
  themeConfig: {
    navbar: {
      title: 'Docusaurus + Lumis',
      items: [{ type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'Docs' }],
    },
  },
}

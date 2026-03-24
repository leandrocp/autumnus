import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const remarkLumis = require('./plugins/remark-lumis.cjs');

const config: Config = {
  title: 'Lumis Docs',
  tagline: 'One syntax highlighting guide across every Lumis runtime.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://lumis.sh',
  baseUrl: '/docs/',

  organizationName: 'leandrocp',
  projectName: 'lumis',

  onBrokenLinks: 'throw',

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
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/leandrocp/lumis/tree/main/docs/',
          remarkPlugins: [remarkLumis],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    metadata: [
      {
        name: 'keywords',
        content: 'lumis, syntax highlighting, tree-sitter, rust, elixir, javascript, java',
      },
      {name: 'twitter:card', content: 'summary_large_image'},
    ],
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Lumis',
      logo: {
        alt: 'Lumis logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/', label: 'Intro', position: 'left'},
        {to: '/installation', label: 'Installation', position: 'left'},
        {
          href: 'https://lumis.sh',
          label: 'Website',
          position: 'right',
        },
        {
          href: 'https://github.com/leandrocp/lumis',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Intro',
              to: '/',
            },
            {
              label: 'Installation',
              to: '/installation',
            },
            {
              label: 'Highlight',
              to: '/highlight',
            },
          ],
        },
        {
          title: 'Packages',
          items: [
            {
              label: 'Rust',
              href: 'https://docs.rs/lumis',
            },
            {
              label: 'Elixir',
              href: 'https://hexdocs.pm/lumis',
            },
            {
              label: 'JavaScript',
              href: 'https://www.npmjs.com/package/@lumis-sh/lumis',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Main Website',
              href: 'https://lumis.sh',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/leandrocp/lumis',
            },
          ],
        },
      ],
      copyright: `Copyright &copy; ${new Date().getFullYear()} Lumis. Built with Docusaurus. Syntax highlighting by Lumis.`,
    },
    // Prism kept as fallback for languages Lumis doesn't cover (e.g. xml)
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'rust', 'elixir', 'java', 'toml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'installation',
    'architecture',
    {
      type: 'category',
      label: 'Highlight',
      items: [
        'usage/highlight',
        'usage/html-output',
        'usage/rust-advanced',
        'usage/javascript-runtime',
        'usage/elixir-integration',
        'usage/java',
      ],
    },
    {
      type: 'category',
      label: 'Formatters',
      items: [
        'usage/formatters',
        'usage/formatters/html-inline',
        'usage/formatters/html-linked',
        'usage/formatters/html-multi-themes',
        'usage/formatters/terminal',
        'usage/formatters/bbcode',
        'usage/custom-formatters',
      ],
    },
    {
      type: 'category',
      label: 'Themes',
      items: [
        'usage/themes',
        'usage/css-theme-files',
      ],
    },
    {
      type: 'category',
      label: 'Integrations',
      items: [
        'integrations/rehype-lumis',
        'integrations/markdown-it',
        'integrations/vitepress',
        'integrations/mdx',
        'integrations/nextjs',
        'integrations/astro',
        'integrations/unified-rehype',
        'integrations/react-markdown',
        'integrations/ratatui',
        'integrations/nimble-publisher',
        'integrations/docusaurus',
        'integrations/nuxt',
      ],
    },
    {
      type: 'category',
      label: 'Recipes',
      items: [
        'recipes/light-dark',
        'recipes/file-title-copy',
        'usage/line-highlighting',
      ],
    },
    {
      type: 'category',
      label: 'CLI',
      items: [
        'cli/commands',
        'usage/cli-behavior',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'usage/wasm-and-cdn',
      ],
    },
    'usage/examples',
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/languages',
        'reference/themes',
        'reference/platforms',
      ],
    },
  ],
};

export default sidebars;

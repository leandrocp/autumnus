# Lumis Docs

This Docusaurus app powers the documentation published under `https://lumis.sh/docs`.

## Install

```bash
pnpm install
```

## Local development

```bash
pnpm start
```

## Build

```bash
pnpm build
```

## Deploy

The production site is served from `https://lumis.sh/`, with this app mounted at `https://lumis.sh/docs`.

`docs/docusaurus.config.ts` already sets `url: 'https://lumis.sh'` and `baseUrl: '/docs/'`.

The GitHub Pages deploy workflow builds both apps and copies `docs/build/` into `website/dist/docs/` before publishing, so the final artifact contains:

- `website/dist/index.html` -> `https://lumis.sh/`
- `website/dist/docs/index.html` -> `https://lumis.sh/docs`

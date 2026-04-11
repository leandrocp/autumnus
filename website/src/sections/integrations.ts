const INTEGRATION_LINKS = [
  {
    name: "React",
    summary: "Render highlighted code as components inside product UIs, docs, and app shells.",
    fit: "UI components",
    links: [
      {
        label: "Example",
        href: "https://github.com/leandrocp/lumis/tree/main/examples/react",
      },
      { label: "Package", href: "https://www.npmjs.com/package/@lumis-sh/react" },
    ],
  },
  {
    name: "react-markdown",
    summary:
      "Drop Lumis into markdown-driven React surfaces without building a custom renderer stack.",
    fit: "Markdown in React",
    links: [
      {
        label: "Example",
        href: "https://github.com/leandrocp/lumis/tree/main/examples/react-markdown",
      },
      { label: "Plugin", href: "https://www.npmjs.com/package/@lumis-sh/rehype-lumis" },
    ],
  },
  {
    name: "markdown-it",
    summary:
      "Upgrade markdown pipelines, blog engines, and static publishing flows with one plugin.",
    fit: "Markdown pipelines",
    links: [
      {
        label: "Example",
        href: "https://github.com/leandrocp/lumis/tree/main/examples/markdown-it",
      },
      {
        label: "Plugin",
        href: "https://www.npmjs.com/package/@lumis-sh/markdown-it-lumis",
      },
    ],
  },
  {
    name: "Astro",
    summary:
      "Ship highlighted code in Astro MDX content sites without forking your content pipeline.",
    fit: "Content sites",
    links: [
      {
        label: "Example",
        href: "https://github.com/leandrocp/lumis/tree/main/examples/astro",
      },
      { label: "Plugin", href: "https://www.npmjs.com/package/@lumis-sh/rehype-lumis" },
    ],
  },
  {
    name: "Ratatui",
    summary: "Bring the same themes and token model to terminal apps, TUIs, and developer tools.",
    fit: "Terminal UIs",
    links: [
      {
        label: "Example",
        href: "https://github.com/leandrocp/lumis/tree/main/examples/ratatui",
      },
      { label: "Rust", href: "https://docs.rs/lumis" },
    ],
  },
  {
    name: "NimblePublisher",
    summary:
      "Make Elixir-powered publishing stacks look polished without treating highlighting as an afterthought.",
    fit: "Elixir publishing",
    links: [
      {
        label: "Example",
        href: "https://github.com/leandrocp/lumis/tree/main/examples/nimble_publisher",
      },
      { label: "Hex", href: "https://hex.pm/packages/lumis" },
    ],
  },
  {
    name: "Docusaurus",
    summary: "Slot Lumis into doc portals where code samples are part of the product story.",
    fit: "Docs platforms",
    links: [
      {
        label: "Example",
        href: "https://github.com/leandrocp/lumis/tree/main/examples/docusaurus",
      },
      { label: "Plugin", href: "https://www.npmjs.com/package/@lumis-sh/rehype-lumis" },
    ],
  },
  {
    name: "VitePress",
    summary:
      "Keep Vite-native docs fast while upgrading code blocks beyond the default markdown look.",
    fit: "Static docs",
    links: [
      {
        label: "Example",
        href: "https://github.com/leandrocp/lumis/tree/main/examples/vitepress",
      },
      {
        label: "Plugin",
        href: "https://www.npmjs.com/package/@lumis-sh/markdown-it-lumis",
      },
    ],
  },
] as const;

export function renderIntegrations() {
  return `
    <section id="integrations" class="py-24 sm:py-36">
      <div class="mx-auto max-w-6xl px-6">
        <a href="#integrations" class="group inline-flex items-center gap-1 font-mono text-sm font-semibold tracking-wider no-underline transition-opacity hover:opacity-80">
          <span class="text-cyan-400">&lt;</span><span class="text-fuchsia-400">Integrations</span> <span class="text-cyan-400">/&gt;</span>
        </a>
        <h2 class="mt-8 max-w-4xl font-mono text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Show up where developers already write code.
        </h2>
        <p class="mt-4 max-w-3xl font-mono text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Runtimes prove coverage. Integrations prove adoption. Lumis already plugs into the frameworks, markdown stacks, terminal UIs, and publishing workflows people actually ship.
        </p>
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <a href="https://github.com/leandrocp/lumis/tree/main/examples" target="_blank" rel="noreferrer"
             class="inline-flex items-center gap-2 border border-zinc-200 px-4 py-2 font-mono text-xs tracking-wider text-zinc-700 uppercase transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white">
            browse examples
            <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </a>
          <span class="font-mono text-xs text-zinc-500 dark:text-zinc-400">Use the package that fits the stack you already have.</span>
        </div>

        <div class="mt-12 grid gap-px border border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
          ${INTEGRATION_LINKS.map(
            (integration) => `
              <div class="bg-white p-6 dark:bg-[#09090b]">
                <div class="font-mono text-[11px] tracking-[0.24em] text-zinc-400 uppercase dark:text-zinc-500">${integration.fit}</div>
                <h3 class="mt-3 font-mono text-sm font-bold tracking-wider text-zinc-900 uppercase dark:text-white">${integration.name}</h3>
                <p class="mt-3 font-mono text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">${integration.summary}</p>
                <div class="mt-5 flex flex-wrap gap-2">
                  ${integration.links
                    .map(
                      (link) =>
                        `<a href="${link.href}" target="_blank" rel="noreferrer" class="font-mono text-xs text-zinc-500 underline decoration-zinc-300 underline-offset-2 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:decoration-zinc-700 dark:hover:text-white">${link.label}</a>`,
                    )
                    .join('<span class="text-zinc-300 dark:text-zinc-700">/</span>')}
                </div>
              </div>
            `,
          ).join("")}
        </div>
      </div>
    </section>`;
}

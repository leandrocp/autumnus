const INTEGRATIONS = [
  {
    name: "React",
    runtime: "JavaScript",
    summary: "Client and server code blocks with the same formatter API.",
    href: "/docs/integrations/react",
  },
  {
    name: "markdown-it",
    runtime: "JavaScript",
    summary: "Drop Lumis into markdown rendering without rewriting your pipeline.",
    href: "/docs/integrations/markdown-it",
  },
  {
    name: "Astro",
    runtime: "JavaScript",
    summary: "Use rehype-lumis across Astro markdown and MDX content.",
    href: "/docs/integrations/astro",
  },
  {
    name: "Ratatui",
    runtime: "Rust",
    summary: "Bridge Lumis ANSI output into terminal widgets with ansi-to-tui.",
    href: "/docs/integrations/ratatui",
  },
  {
    name: "NimblePublisher",
    runtime: "Elixir",
    summary: "Wire Lumis into markdown conversion with MDEx in Phoenix-style apps.",
    href: "/docs/integrations/nimble-publisher",
  },
  {
    name: "rehype / unified",
    runtime: "JavaScript",
    summary: "The core content-pipeline integration behind MDX, Next.js, and more.",
    href: "/docs/integrations/rehype-lumis",
  },
  {
    name: "Next.js",
    runtime: "JavaScript",
    summary: "Replace MDX code fence highlighting inside app-router content flows.",
    href: "/docs/integrations/nextjs",
  },
  {
    name: "Docusaurus",
    runtime: "JavaScript",
    summary: "Swap Prism-style code fences for Lumis in docs sites.",
    href: "/docs/integrations/docusaurus",
  },
] as const;

export function renderIntegrations() {
  return `
    <section id="integrations" class="py-24 sm:py-36">
      <div class="mx-auto max-w-6xl px-6">
        <a href="#integrations" class="group inline-flex items-center gap-1 font-mono text-sm font-semibold tracking-wider no-underline transition-opacity hover:opacity-80">
          <span class="text-cyan-400">&lt;</span><span class="text-emerald-400">Integrations</span> <span class="text-cyan-400">/&gt;</span>
        </a>
        <h2 class="mt-8 font-mono text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Plug Lumis into the stack you already have.
        </h2>
        <p class="mt-4 max-w-3xl font-mono text-sm text-zinc-500">
          React, markdown-it, Astro, Ratatui, NimblePublisher, rehype, Docusaurus, Next.js, and more already have working Lumis paths.
        </p>

        <div class="mt-12 grid gap-px border border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
          ${INTEGRATIONS.map(
            (integration) => `
              <a href="${integration.href}" class="group bg-white p-6 no-underline transition-colors hover:bg-zinc-50 dark:bg-[#09090b] dark:hover:bg-zinc-950">
                <p class="font-mono text-[11px] tracking-[0.18em] text-zinc-400 uppercase dark:text-zinc-500">${integration.runtime}</p>
                <h3 class="mt-3 font-mono text-sm font-bold tracking-wider text-zinc-900 uppercase dark:text-white">${integration.name}</h3>
                <p class="mt-3 font-mono text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">${integration.summary}</p>
                <span class="mt-5 inline-flex items-center gap-2 font-mono text-[11px] tracking-wider text-zinc-500 uppercase transition-colors group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white">
                  view docs
                  <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
                </span>
              </a>
            `,
          ).join("")}
        </div>
      </div>
    </section>`;
}

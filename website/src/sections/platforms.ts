const PLATFORM_LINKS = [
  {
    name: "CLI",
    summary: "Pipes, scripts, local workflows.",
    install: "cargo install lumis-cli",
    links: [
      {
        label: "Docs",
        href: "https://github.com/leandrocp/lumis/blob/main/crates/lumis-cli/README.md",
      },
      { label: "Source", href: "https://github.com/leandrocp/lumis/tree/main/crates/lumis-cli" },
    ],
  },
  {
    name: "Rust",
    summary: "Backend rendering, editors, docs pipelines.",
    install: "cargo add lumis",
    links: [
      { label: "docs.rs", href: "https://docs.rs/lumis" },
      { label: "crates.io", href: "https://crates.io/crates/lumis" },
      { label: "Source", href: "https://github.com/leandrocp/lumis/tree/main/crates/lumis" },
    ],
  },
  {
    name: "Elixir",
    summary: "BEAM apps, Phoenix, LiveView.",
    install: `{:lumis, "~> 0.1"}`,
    links: [
      { label: "HexDocs", href: "https://hexdocs.pm/lumis" },
      { label: "Hex", href: "https://hex.pm/packages/lumis" },
      {
        label: "Source",
        href: "https://github.com/leandrocp/lumis/tree/main/packages/elixir/lumis",
      },
    ],
  },
  {
    name: "Node.js",
    summary: "Server-side rendering, build tools, SSR.",
    install: "npm install @lumis-sh/lumis",
    links: [
      { label: "npm", href: "https://www.npmjs.com/package/@lumis-sh/lumis" },
      {
        label: "Source",
        href: "https://github.com/leandrocp/lumis/tree/main/packages/javascript/lumis",
      },
    ],
  },
  {
    name: "Browser",
    summary: "Client-side highlighting, SPAs, web apps.",
    install: "npm install @lumis-sh/lumis",
    links: [
      { label: "npm", href: "https://www.npmjs.com/package/@lumis-sh/lumis" },
      {
        label: "Source",
        href: "https://github.com/leandrocp/lumis/tree/main/packages/javascript/lumis",
      },
    ],
  },
  {
    name: "Java",
    summary: "JVM parity across the stack.",
    install: "io.roastedroot:lumis4j",
    links: [
      { label: "Maven", href: "https://central.sonatype.com/search?q=io.roastedroot%3Alumis4j" },
      { label: "Source", href: "https://github.com/roastedroot/lumis4j" },
    ],
  },
] as const;

export function renderPlatforms() {
  return `
    <section id="platforms" class="py-24 sm:py-36">
      <div class="mx-auto max-w-6xl px-6">
        <a href="#platforms" class="group inline-flex items-center gap-1 font-mono text-sm font-semibold tracking-wider no-underline transition-opacity hover:opacity-80">
          <span class="text-rose-400">&lt;</span><span class="text-indigo-400">Platforms</span> <span class="text-rose-400">/&gt;</span>
        </a>
        <h2 class="mt-8 font-mono text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Same engine, every stack.
        </h2>
        <p class="mt-4 font-mono text-sm text-zinc-500">Same themes, same output. Pick the package for your runtime.</p>

        <div class="mt-12">
          <div class="grid gap-px border border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 sm:grid-cols-2 lg:grid-cols-3">
            ${PLATFORM_LINKS.map(
              (p) => `
              <div class="bg-white p-6 dark:bg-[#09090b]">
                <h3 class="font-mono text-sm font-bold tracking-wider text-zinc-900 uppercase dark:text-white">${p.name}</h3>
                <p class="mt-2 font-mono text-xs leading-relaxed text-zinc-500">${p.summary}</p>
                <div class="mt-4 overflow-x-auto border border-zinc-100 px-3 py-2 font-mono text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                  <span class="mr-2 text-zinc-300 select-none dark:text-zinc-700">&gt;</span>${p.install}
                </div>
                <div class="mt-4 flex flex-wrap gap-2">
                  ${p.links
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
      </div>
    </section>`;
}

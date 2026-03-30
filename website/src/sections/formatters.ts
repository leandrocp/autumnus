const FORMATTERS = [
  {
    name: "html_inline",
    description: "Inline styles on every token. Zero config, works everywhere.",
  },
  {
    name: "html_linked",
    description: "Class names instead of inline styles. Full control, cacheable stylesheets.",
  },
  {
    name: "html_multi_theme",
    description:
      "CSS custom properties for multiple themes. Automatic switching with prefers-color-scheme.",
  },
  {
    name: "terminal",
    description: "ANSI escape codes. Same themes, same colors, rendered in your shell.",
  },
  {
    name: "bbcode_scoped",
    description: "BBCode with scoped color tags. Forum posts, game chat, Discord-style rich text.",
  },
  {
    name: "custom",
    description:
      "Implement the formatter trait/interface to output any format. Markdown, LaTeX, whatever.",
  },
];

export function renderFormatters() {
  return `
    <section id="formatters" class="py-24 sm:py-36">
      <div class="mx-auto max-w-6xl px-6">
        <a href="#formatters" class="group inline-flex items-center gap-1 font-mono text-sm font-semibold tracking-wider no-underline transition-opacity hover:opacity-80">
          <span class="text-sky-400">&lt;</span><span class="text-emerald-400">Formatters</span> <span class="text-sky-400">/&gt;</span>
        </a>
        <h2 class="mt-8 font-mono text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Built-in formatters or bring your own.
        </h2>
        <p class="mt-4 font-mono text-sm text-zinc-500">
          Parsing is separated from rendering. Choose a built-in formatter or implement the
          trait/interface to output any format.
        </p>

        <div class="mt-12 grid gap-px border border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 sm:grid-cols-2 lg:grid-cols-3">
          ${FORMATTERS.map(
            (f) => `
            <div class="bg-white p-6 dark:bg-[#09090b]">
              <h3 class="font-mono text-sm font-bold tracking-wider text-zinc-900 dark:text-white">${f.name}</h3>
              <p class="mt-2 font-mono text-xs leading-relaxed text-zinc-500">${f.description}</p>
            </div>
          `,
          ).join("")}
        </div>
      </div>
    </section>`;
}

import { bbcodeScoped, htmlInline, htmlMultiThemes, terminal } from "@lumis-sh/lumis/formatters";
import elixir from "@lumis-sh/lumis/langs/elixir";
import heex from "@lumis-sh/lumis/langs/heex";
import javascript from "@lumis-sh/lumis/langs/javascript";
import json from "@lumis-sh/lumis/langs/json";
import markdown from "@lumis-sh/lumis/langs/markdown";
import markdownInline from "@lumis-sh/lumis/langs/markdown_inline";
import rust from "@lumis-sh/lumis/langs/rust";
import typescript from "@lumis-sh/lumis/langs/typescript";
import catppuccinLatte from "@lumis-sh/themes/catppuccin_latte";
import catppuccinMocha from "@lumis-sh/themes/catppuccin_mocha";
import dracula from "@lumis-sh/themes/dracula";
import githubLight from "@lumis-sh/themes/github_light";
import nord from "@lumis-sh/themes/nord";
import tokyonightMoon from "@lumis-sh/themes/tokyonight_moon";
import { highlighterFor } from "../lib/published-highlighter";
import { COPY_SVG, escapeHtml } from "../lib/utils";

const REPO = "https://github.com/leandrocp/lumis/tree/main";
const PRE_CLASS = "m-0 overflow-x-auto p-5 font-mono text-[13px] leading-relaxed";
const ESCAPE = "\u001b";

interface Demo {
  id: string;
  title: string;
  blurb: string;
  tags: string[];
  code: string;
  source: string;
  run: () => Promise<string>;
}

const TYPESCRIPT_SOURCE = `export async function search(query: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ q: query, limit: "20" })
  const response = await fetch(\`/api/search?\${params}\`, { signal })

  if (!response.ok) {
    throw new SearchError(response.status, await response.text())
  }

  return (await response.json()) as SearchResult[]
}`;

const RUST_SOURCE = `impl Cache {
    pub fn get_or_insert(&mut self, key: &str, load: impl FnOnce() -> Vec<u8>) -> &[u8] {
        if !self.entries.contains_key(key) {
            let bytes = load();
            self.bytes_held += bytes.len();
            self.entries.insert(key.to_owned(), bytes);
        }

        &self.entries[key]
    }
}`;

const ELIXIR_SOURCE = `defmodule Store.CartComponent do
  @moduledoc """
  Renders the cart.

  Prices come from \`Store.Pricing\`, so **totals** are never recomputed here.
  """
  use Phoenix.Component

  attr :items, :list, required: true

  def cart(assigns) do
    ~H"""
    <ul class="cart" phx-update="stream">
      <li :for={item <- @items} id={"item-#{item.id}"} class="cart-row">
        <span class="name">{item.name}</span>
        <span class="price">{Money.to_string(item.price)}</span>
      </li>
    </ul>
    """
  end
end`;

const BRACKETS_SOURCE = `const server = createServer({
  routes: [route("/health", () => ok({ status: [200, "up"] }))],
  plugins: [metrics({ buckets: [0.1, [0.5, 1], 5] }), tracing()],
})`;

const THEME_SOURCE = `defp deps do
  [{:lumis, "~> 0.6"}]
end`;

const ANSI_SOURCE = `{"id": 1, "ok": true}`;

const DEMOS: Demo[] = [
  {
    id: "light-dark",
    title: "One output, both colour schemes",
    blurb:
      "Two themes are baked into a single render. The page follows the reader without a second pass or a class toggle.",
    tags: ["htmlMultiThemes", "TypeScript"],
    source: `${REPO}/packages/javascript/lumis/examples/multi-themes.html`,
    code: `import { createHighlighter } from '@lumis-sh/lumis'
import { htmlMultiThemes } from '@lumis-sh/lumis/formatters'
import typescript from '@lumis-sh/lumis/langs/typescript'
import latte from '@lumis-sh/themes/catppuccin_latte'
import mocha from '@lumis-sh/themes/catppuccin_mocha'

const hl = await createHighlighter({ languages: [typescript] })

const html = hl.highlight(source, htmlMultiThemes({
  language: typescript,
  themes: { light: latte, dark: mocha },
  defaultTheme: 'light-dark()',
}))`,
    async run() {
      const hl = await highlighterFor(typescript);
      return hl.highlight(
        TYPESCRIPT_SOURCE,
        htmlMultiThemes({
          language: typescript,
          themes: { light: catppuccinLatte, dark: catppuccinMocha },
          defaultTheme: "light-dark()",
          preClass: PRE_CLASS,
          italic: false,
        }),
      );
    },
  },
  {
    id: "line-highlighting",
    title: "Point at the lines that matter",
    blurb:
      "Ranges take the theme's own highlight background, so emphasis stays inside the theme instead of fighting it.",
    tags: ["htmlInline", "Rust"],
    source: `${REPO}/packages/javascript/lumis/examples/highlight-lines.html`,
    code: `import { htmlInline } from '@lumis-sh/lumis/formatters'
import rust from '@lumis-sh/lumis/langs/rust'
import dracula from '@lumis-sh/themes/dracula'

const html = hl.highlight(source, htmlInline({
  language: rust,
  theme: dracula,
  highlightLines: { lines: [[3, 6]], style: 'theme' },
}))`,
    async run() {
      const hl = await highlighterFor(rust);
      return hl.highlight(
        RUST_SOURCE,
        htmlInline({
          language: rust,
          theme: dracula,
          preClass: PRE_CLASS,
          italic: false,
          highlightLines: { lines: [[3, 6]], style: "theme" },
        }),
      );
    },
  },
  {
    id: "injections",
    title: "Languages inside languages",
    blurb:
      "A HEEx template in a sigil and Markdown in a doc string, each parsed by its own grammar rather than coloured as a string.",
    tags: ["Elixir", "HEEx", "Markdown"],
    source: "/docs/recipes/injected-languages-html-css-js",
    code: `import elixir from '@lumis-sh/lumis/langs/elixir'
import heex from '@lumis-sh/lumis/langs/heex'
import markdown from '@lumis-sh/lumis/langs/markdown'
import markdownInline from '@lumis-sh/lumis/langs/markdown_inline'

// Browsers cannot fetch a parser mid-walk, so injected
// languages load first. Node and the CLI find them as they go.
const hl = await createHighlighter({
  languages: [elixir, heex, markdown, markdownInline],
})

const html = hl.highlight(
  source,
  htmlInline({ language: elixir, theme: dracula }),
)`,
    async run() {
      const hl = await highlighterFor(elixir, heex, markdown, markdownInline);
      return hl.highlight(
        ELIXIR_SOURCE,
        htmlInline({ language: elixir, theme: dracula, preClass: PRE_CLASS, italic: false }),
      );
    },
  },
  {
    id: "rainbow-brackets",
    title: "Brackets coloured by depth",
    blurb:
      "The pairs come from each language's brackets query, so generics count in Rust and JSX angle brackets do not.",
    tags: ["rainbowBrackets", "JavaScript"],
    source: "/docs/recipes/rainbow-brackets",
    code: `import { htmlInline } from '@lumis-sh/lumis/formatters'
import javascript from '@lumis-sh/lumis/langs/javascript'

const html = hl.highlight(source, htmlInline({
  language: javascript,
  theme: dracula,
  rainbowBrackets: true,
}))`,
    async run() {
      const hl = await highlighterFor(javascript);
      return hl.highlight(
        BRACKETS_SOURCE,
        htmlInline({
          language: javascript,
          theme: dracula,
          preClass: PRE_CLASS,
          italic: false,
          rainbowBrackets: true,
        }),
      );
    },
  },
  {
    id: "themes",
    title: "Themes extracted from Neovim",
    blurb:
      "Each one is generated from the colorscheme itself, so a theme looks here the way it looks in the editor it came from.",
    tags: ["250+ themes", "Elixir"],
    source: `${REPO}/packages/javascript/lumis/examples/theme-gallery.html`,
    code: `import dracula from '@lumis-sh/themes/dracula'
import nord from '@lumis-sh/themes/nord'
import githubLight from '@lumis-sh/themes/github_light'
import tokyonightMoon from '@lumis-sh/themes/tokyonight_moon'

for (const theme of [dracula, nord, githubLight, tokyonightMoon]) {
  render(hl.highlight(source, htmlInline({ language: elixir, theme })))
}`,
    async run() {
      const hl = await highlighterFor(elixir);
      const themes = [
        { label: "dracula", theme: dracula },
        { label: "nord", theme: nord },
        { label: "github_light", theme: githubLight },
        { label: "tokyonight_moon", theme: tokyonightMoon },
      ];

      return `<div class="grid gap-px bg-zinc-200 dark:bg-zinc-800 sm:grid-cols-2">${themes
        .map(({ label, theme }) => {
          const html = hl.highlight(
            THEME_SOURCE,
            htmlInline({
              language: elixir,
              theme,
              preClass: `${PRE_CLASS} text-xs`,
              italic: false,
            }),
          );
          return `<figure class="m-0">
            <figcaption class="bg-white px-5 pt-4 font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:bg-[#09090b] dark:text-zinc-400">${label}</figcaption>
            ${html}
          </figure>`;
        })
        .join("")}</div>`;
    },
  },
  {
    id: "beyond-html",
    title: "Output that is not HTML",
    blurb:
      "One walk over the tree drives every formatter. These are the bytes the terminal and BBCode formatters return.",
    tags: ["terminal", "bbcodeScoped", "JSON"],
    source: `${REPO}/packages/javascript/lumis/examples/terminal.html`,
    code: `import { terminal, bbcodeScoped } from '@lumis-sh/lumis/formatters'

const ansi = hl.highlight(source, terminal({ language: json, theme: dracula }))
const bbcode = hl.highlight(source, bbcodeScoped({ language: json }))`,
    async run() {
      const hl = await highlighterFor(json);
      const ansi = hl.highlight(ANSI_SOURCE, terminal({ language: json, theme: dracula }));
      const bbcode = hl.highlight(ANSI_SOURCE, bbcodeScoped({ language: json }));

      // A terminal reads U+001B; a reader has to be able to see that it is there.
      return `<div class="grid gap-px bg-zinc-200 dark:bg-zinc-800">
        ${outputPanel("terminal()", ansi.replaceAll(ESCAPE, "\\e"))}
        ${outputPanel("bbcodeScoped()", bbcode)}
      </div>`;
    },
  },
];

const CATALOG = [
  {
    title: "Browser and Node",
    detail:
      "17 standalone pages: every formatter, line highlighting, a custom WASM resolver, a theme gallery, a copy toolbar.",
    href: `${REPO}/packages/javascript/lumis/examples`,
  },
  {
    title: "React",
    detail: "Server-rendered React and a Next.js App Router route.",
    href: `${REPO}/packages/javascript/react/examples`,
  },
  {
    title: "Markdown pipelines",
    detail: "Astro, Docusaurus, MDX, Next.js, Nuxt, react-markdown and plain rehype.",
    href: `${REPO}/packages/javascript/rehype-lumis/examples`,
  },
  {
    title: "markdown-it and VitePress",
    detail: "Drop-in highlighting for markdown-it, and the VitePress config that uses it.",
    href: `${REPO}/packages/javascript/markdown-it-lumis/examples`,
  },
  {
    title: "Elixir",
    detail:
      "Six Livebooks covering light and dark, rainbow brackets and scoped CSS, plus a NimblePublisher blog.",
    href: `${REPO}/packages/elixir/lumis/examples`,
  },
  {
    title: "Rust",
    detail:
      "13 runnable examples, including three custom formatters and a Ratatui app that highlights in the terminal.",
    href: `${REPO}/crates/lumis/examples`,
  },
];

function outputPanel(label: string, content: string) {
  return `<div class="bg-white dark:bg-[#09090b]">
    <p class="px-5 pt-4 font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">${label}</p>
    <pre class="m-0 max-h-44 overflow-auto p-5 font-mono text-[13px] leading-relaxed break-all whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">${escapeHtml(content)}</pre>
  </div>`;
}

export function renderShowcase() {
  return `
    <section id="showcase" class="pt-32 pb-24 sm:pt-40 sm:pb-36">
      <div class="mx-auto max-w-6xl px-6">
        <h1 class="inline-flex items-center gap-1 font-mono text-sm font-semibold tracking-wider">
          <span class="text-pink-400">&lt;</span><span class="text-purple-400">Showcase</span> <span class="text-pink-400">/&gt;</span>
        </h1>
        <h2 class="mt-8 max-w-3xl font-mono text-4xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white">
          Every demo below runs in this page.
        </h2>
        <p class="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Parsers download from the CDN at the version this release pins, which is what an
          <code class="font-mono text-zinc-900 dark:text-white">npm install</code> gets you. Nothing
          here is a screenshot.
        </p>

        <div class="mt-16 space-y-12">
          ${DEMOS.map(
            (demo) => `
            <article id="${demo.id}" class="border border-zinc-200 dark:border-zinc-800">
              <header class="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                <div class="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 class="font-mono text-lg font-bold tracking-tight text-zinc-900 dark:text-white">${demo.title}</h3>
                  <div class="flex flex-wrap gap-2">
                    ${demo.tags
                      .map(
                        (tag) =>
                          `<span class="border border-zinc-200 px-2 py-0.5 font-mono text-[10px] tracking-wider text-zinc-500 uppercase dark:border-zinc-800 dark:text-zinc-400">${tag}</span>`,
                      )
                      .join("")}
                  </div>
                </div>
                <p class="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">${demo.blurb}</p>
              </header>
              <div class="grid lg:grid-cols-2">
                <div class="demo-output grid border-b border-zinc-200 dark:border-zinc-800 lg:border-r lg:border-b-0" data-demo="${demo.id}">
                  <p class="px-5 py-12 text-center font-mono text-xs text-zinc-400">Fetching parser…</p>
                </div>
                <div class="demo-code" data-demo="${demo.id}">
                  <div class="flex items-center justify-between border-b border-zinc-200 px-5 py-2 dark:border-zinc-800">
                    <span class="font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">The code that made it</span>
                    <button class="copy-install shrink-0 cursor-pointer text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white" aria-label="Copy to clipboard" data-copy="${encodeURIComponent(demo.code)}">${COPY_SVG}</button>
                  </div>
                  <pre class="${PRE_CLASS} text-zinc-700 dark:text-zinc-300"><code>${escapeHtml(demo.code)}</code></pre>
                </div>
              </div>
              <footer class="border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
                <a href="${demo.source}" ${demo.source.startsWith("http") ? 'target="_blank" rel="noreferrer"' : ""}
                   class="inline-flex items-center gap-1.5 font-mono text-xs tracking-wider text-zinc-500 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white">
                  Full example
                  <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
                </a>
              </footer>
            </article>`,
          ).join("")}
        </div>

        <h2 class="mt-24 font-mono text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          The rest run on your machine.
        </h2>
        <p class="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Frameworks, editors and terminals cannot be embedded in a page. Each of these is a
          directory you can clone and run.
        </p>
        <div class="mt-8 grid gap-px border border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 sm:grid-cols-2 lg:grid-cols-3">
          ${CATALOG.map(
            (entry) => `
            <a href="${entry.href}" target="_blank" rel="noreferrer"
               class="group bg-white p-6 transition-colors hover:bg-zinc-50 dark:bg-[#09090b] dark:hover:bg-zinc-950">
              <h3 class="flex items-center gap-1.5 font-mono text-sm font-bold tracking-wider text-zinc-900 dark:text-white">
                ${entry.title}
                <svg class="h-3.5 w-3.5 text-zinc-400 transition-transform group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
              </h3>
              <p class="mt-2 font-mono text-xs leading-relaxed text-zinc-500">${entry.detail}</p>
            </a>`,
          ).join("")}
        </div>
      </div>
    </section>`;
}

export function setupShowcase(root: HTMLElement) {
  for (const demo of DEMOS) {
    const output = root.querySelector<HTMLDivElement>(`.demo-output[data-demo="${demo.id}"]`)!;
    const code = root.querySelector<HTMLDivElement>(`.demo-code[data-demo="${demo.id}"] pre`)!;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        void mount(demo, output, code);
      },
      { rootMargin: "300px" },
    );
    observer.observe(output);
  }
}

// A demo that cannot fetch its parser reports that in its own panel. One failure
// is one panel, on the page as much as in the library.
async function mount(demo: Demo, output: HTMLElement, code: HTMLElement) {
  try {
    output.innerHTML = await demo.run();
  } catch (error) {
    output.innerHTML = `<p class="px-5 py-12 text-center font-mono text-xs text-red-500">${escapeHtml(
      `${demo.title} did not render: ${String(error)}`,
    )}</p>`;
  }

  try {
    const hl = await highlighterFor(javascript);
    code.outerHTML = hl.highlight(
      demo.code,
      htmlMultiThemes({
        language: javascript,
        themes: { light: catppuccinLatte, dark: catppuccinMocha },
        defaultTheme: "light-dark()",
        preClass: PRE_CLASS,
        italic: false,
      }),
    );
  } catch {
    // The snippet is already readable as plain text, so leave it alone.
  }
}

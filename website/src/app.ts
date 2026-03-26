import { LANGUAGES, LANGUAGES_BY_ID, getSample } from "./data/languages";
import { loadTheme, THEMES, THEMES_BY_ID } from "./data/themes";
import { preloadAllLanguages, renderHighlight, renderHighlightMultiTheme } from "./lib/highlighter";
import { mountHeroFluid } from "./lib/hero-fluid";

const ACTIVE_TAB_CLASSES = ["border-zinc-900", "text-zinc-900", "dark:border-white", "dark:text-white"];
const INACTIVE_TAB_CLASSES = ["border-transparent", "text-zinc-400"];

function setupTabs(
  root: HTMLElement,
  tabSelector: string,
  dataAttr: string,
  panelSelector: string,
  panelDataAttr: string,
) {
  const tabs = root.querySelectorAll<HTMLButtonElement>(tabSelector);
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset[dataAttr]!;
      tabs.forEach((t) => {
        const isActive = t.dataset[dataAttr] === id;
        ACTIVE_TAB_CLASSES.forEach((c) => t.classList.toggle(c, isActive));
        INACTIVE_TAB_CLASSES.forEach((c) => t.classList.toggle(c, !isActive));
        if (t.hasAttribute("aria-selected")) t.setAttribute("aria-selected", String(isActive));
      });
      root.querySelectorAll(panelSelector).forEach((panel) => {
        panel.classList.toggle("hidden", (panel as HTMLElement).dataset[panelDataAttr] !== id);
      });
    });
  });
}

const initialLanguage = LANGUAGES[0];
const initialTheme = THEMES[0];

const PLATFORM_LINKS = [
  {
    name: "CLI",
    summary: "Pipes, scripts, local workflows.",
    install: "cargo install lumis-cli",
    links: [
      { label: "Docs", href: "https://github.com/leandrocp/lumis/blob/main/crates/lumis-cli/README.md" },
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
      { label: "Source", href: "https://github.com/leandrocp/lumis/tree/main/packages/elixir/lumis" },
    ],
  },
  {
    name: "Node.js",
    summary: "Server-side rendering, build tools, SSR.",
    install: "npm install @lumis-sh/lumis",
    links: [
      { label: "npm", href: "https://www.npmjs.com/package/@lumis-sh/lumis" },
      { label: "Source", href: "https://github.com/leandrocp/lumis/tree/main/packages/javascript/lumis" },
    ],
  },
  {
    name: "Browser",
    summary: "Client-side highlighting, SPAs, web apps.",
    install: "npm install @lumis-sh/lumis",
    links: [
      { label: "npm", href: "https://www.npmjs.com/package/@lumis-sh/lumis" },
      { label: "Source", href: "https://github.com/leandrocp/lumis/tree/main/packages/javascript/lumis" },
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

const QUICKSTART_TABS = [
  {
    id: "cli",
    label: "CLI",
    install: { language: "bash", code: `cargo install lumis-cli` },
    usage: {
      language: "bash",
      code: `lumis highlight index.js --lang javascript --theme dracula`,
    },
  },
  {
    id: "rust",
    label: "Rust",
    install: { language: "bash", code: `cargo add lumis` },
    usage: {
      language: "rust",
      code: `use lumis::{highlight, HtmlInlineBuilder, languages::Language, themes};

let theme = themes::get("dracula").unwrap();

let formatter = HtmlInlineBuilder::new()
    .lang(Language::Javascript)
    .theme(Some(theme))
    .build()
    .unwrap();

let html = highlight("const x = 1", formatter);`,
    },
  },
  {
    id: "nodejs",
    label: "Node.js",
    install: { language: "bash", code: `npm install @lumis-sh/lumis @lumis-sh/themes` },
    usage: {
      language: "javascript",
      code: `import { highlight } from '@lumis-sh/lumis'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import javascript from '@lumis-sh/lumis/langs/javascript'
import dracula from '@lumis-sh/themes/dracula'

const html = await highlight(
  'const x = 1',
  htmlInline({ language: javascript, theme: dracula })
)`,
    },
  },
  {
    id: "cdn",
    label: "CDN",
    install: null,
    usage: {
      language: "html",
      code: `<script type="module">
  import { highlight } from 'https://esm.sh/@lumis-sh/lumis'
  import { htmlInline } from 'https://esm.sh/@lumis-sh/lumis/formatters'
  import javascript from 'https://esm.sh/@lumis-sh/lumis/langs/javascript'
  import dracula from 'https://esm.sh/@lumis-sh/themes/dracula'

  document.getElementById('output').innerHTML = await highlight(
    'const x = 1',
    htmlInline({ language: javascript, theme: dracula })
  )
</script>`,
    },
  },
  {
    id: "elixir",
    label: "Elixir",
    install: { language: "elixir", code: `{:lumis, "~> 0.1"}` },
    usage: {
      language: "elixir",
      code: `Lumis.highlight!(
  "const x = 1",
  language: "javascript",
  formatter: {:html_inline, theme: "dracula"}
)`,
    },
  },
  {
    id: "java",
    label: "Java",
    install: { language: "bash", code: `io.roastedroot:lumis4j` },
    usage: {
      language: "java",
      code: `import io.roastedroot.lumis4j.core.Lumis;
import io.roastedroot.lumis4j.core.Lang;
import io.roastedroot.lumis4j.core.Theme;

var lumis = Lumis.builder()
    .withLang(Lang.JAVASCRIPT)
    .withTheme(Theme.DRACULA)
    .build();

var result = lumis.highlight("const x = 1");`,
    },
  },
];

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
    description: "CSS custom properties for multiple themes. Automatic switching with <code class=\"font-mono text-[11px] text-zinc-500\">prefers-color-scheme</code>.",
  },
  {
    name: "terminal",
    description: "ANSI escape codes. Same themes, same colors, rendered in your shell.",
  },
  {
    name: "custom",
    description: "Implement the formatter to output any format. Markdown, LaTeX, whatever.",
  },
];

const GITHUB_SVG = `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`;

const BURGER_SVG = `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
const CLOSE_SVG = `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

const COPY_SVG = `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`;
const CHECK_SVG = `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function mountApp(root: HTMLDivElement) {
  root.innerHTML = `
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg dark:bg-[#09090b]/80">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="/" class="flex items-center gap-2.5 font-mono text-sm font-bold tracking-wider text-zinc-900 uppercase dark:text-white">
          <span class="inline-flex h-7 w-7 items-center justify-center bg-zinc-900 text-[11px] font-black text-white dark:bg-white dark:text-zinc-900">L</span>
          Lumis
        </a>
        <div class="flex items-center gap-6 font-mono text-xs tracking-wider uppercase">
          <a href="#playground" class="hidden text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white sm:inline-block">Playground</a>
          <a href="#quickstart" class="hidden text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white sm:inline-block">Quickstart</a>
          <a href="#engine" class="hidden text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white sm:inline-block">Engine</a>
          <a href="#platforms" class="hidden text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white sm:inline-block">Platforms</a>
          <a href="/docs" class="hidden text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white sm:inline-block">Docs</a>
          <a href="https://github.com/leandrocp/lumis" target="_blank" rel="noreferrer"
             class="inline-flex items-center gap-1.5 border border-zinc-900 px-3 py-1.5 text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-zinc-900">
            ${GITHUB_SVG}
            <span class="hidden sm:inline">GitHub</span>
          </a>
          <button class="mobile-menu-toggle cursor-pointer text-zinc-900 dark:text-white sm:hidden" aria-label="Toggle menu">
            ${BURGER_SVG}
          </button>
        </div>
      </div>
      <div class="mobile-menu hidden border-t border-zinc-200 bg-white/95 backdrop-blur-lg dark:border-zinc-800 dark:bg-[#09090b]/95 sm:hidden">
        <div class="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4 font-mono text-sm tracking-wider uppercase">
          <a href="#playground" class="mobile-menu-link block py-2 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">Playground</a>
          <a href="#quickstart" class="mobile-menu-link block py-2 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">Quickstart</a>
          <a href="#engine" class="mobile-menu-link block py-2 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">Engine</a>
          <a href="#platforms" class="mobile-menu-link block py-2 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">Platforms</a>
          <a href="/docs" class="mobile-menu-link block py-2 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">Docs</a>
        </div>
      </div>
    </nav>

    <section class="relative pt-36 pb-20 sm:pt-48 sm:pb-28">
      <div id="hero-fluid" class="absolute inset-0 -top-16 z-0 overflow-hidden" aria-hidden="true"></div>
      <div class="pointer-events-none relative z-10 mx-auto max-w-4xl px-6 text-center [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_select]:pointer-events-auto">
        <h1 class="font-mono text-4xl font-bold leading-[1.05] tracking-tighter text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white">
          Syntax Highlighter powered by Tree-sitter
        </h1>
        <p class="mt-5 font-mono text-2xl font-medium text-zinc-400 sm:text-3xl dark:text-zinc-500">Unified API for 6 Platforms</p>

        <div class="mt-12 flex items-center justify-center gap-3">
          <a href="#quickstart"
             class="inline-flex h-10 items-center gap-2 bg-zinc-900 px-5 font-mono text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
            get started
            <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </a>
          <a href="https://github.com/leandrocp/lumis" target="_blank" rel="noreferrer"
             class="inline-flex h-10 items-center gap-2 border border-zinc-200 px-5 font-mono text-sm text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-white">
            ${GITHUB_SVG}
            star on github
          </a>
        </div>

        <div class="mx-auto mt-6 max-w-lg">
          <div class="flex justify-center overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
            <button data-install="cli" class="install-tab shrink-0 cursor-pointer border-b-2 border-zinc-900 px-4 py-2 font-mono text-xs tracking-wider text-zinc-900 uppercase dark:border-white dark:text-white">cli</button>
            <button data-install="rust" class="install-tab shrink-0 cursor-pointer border-b-2 border-transparent px-4 py-2 font-mono text-xs tracking-wider text-zinc-400 uppercase hover:text-zinc-600 dark:hover:text-zinc-300">cargo</button>
            <button data-install="javascript" class="install-tab shrink-0 cursor-pointer border-b-2 border-transparent px-4 py-2 font-mono text-xs tracking-wider text-zinc-400 uppercase hover:text-zinc-600 dark:hover:text-zinc-300">npm</button>
            <button data-install="browser" class="install-tab shrink-0 cursor-pointer border-b-2 border-transparent px-4 py-2 font-mono text-xs tracking-wider text-zinc-400 uppercase hover:text-zinc-600 dark:hover:text-zinc-300">cdn</button>
            <button data-install="elixir" class="install-tab shrink-0 cursor-pointer border-b-2 border-transparent px-4 py-2 font-mono text-xs tracking-wider text-zinc-400 uppercase hover:text-zinc-600 dark:hover:text-zinc-300">hex</button>
            <button data-install="java" class="install-tab shrink-0 cursor-pointer border-b-2 border-transparent px-4 py-2 font-mono text-xs tracking-wider text-zinc-400 uppercase hover:text-zinc-600 dark:hover:text-zinc-300">maven</button>
          </div>
          <div class="border-x border-b border-zinc-200 dark:border-zinc-800">
            <div data-install-panel="cli" class="flex items-center justify-between gap-2 px-4 py-3">
              <code class="min-w-0 truncate font-mono text-sm text-zinc-700 dark:text-zinc-300"><span class="mr-2 text-zinc-400 select-none">&gt;</span>cargo install lumis-cli</code>
              <button class="copy-install shrink-0 cursor-pointer text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white" data-copy="cargo install lumis-cli">${COPY_SVG}</button>
            </div>
            <div data-install-panel="rust" class="hidden flex items-center justify-between gap-2 px-4 py-3">
              <code class="font-mono text-sm text-zinc-700 dark:text-zinc-300"><span class="mr-2 text-zinc-400 select-none">&gt;</span>cargo add lumis</code>
              <button class="copy-install shrink-0 cursor-pointer text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white" data-copy="cargo add lumis">${COPY_SVG}</button>
            </div>
            <div data-install-panel="javascript" class="hidden flex items-center justify-between gap-2 px-4 py-3">
              <code class="min-w-0 truncate font-mono text-sm text-zinc-700 dark:text-zinc-300"><span class="mr-2 text-zinc-400 select-none">&gt;</span>npm install @lumis-sh/lumis</code>
              <button class="copy-install shrink-0 cursor-pointer text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white" data-copy="npm install @lumis-sh/lumis">${COPY_SVG}</button>
            </div>
            <div data-install-panel="browser" class="hidden flex items-center justify-between gap-2 px-4 py-3">
              <code class="min-w-0 truncate font-mono text-sm text-zinc-700 dark:text-zinc-300"><span class="mr-2 text-zinc-400 select-none">&gt;</span>unpkg.com/@lumis-sh/lumis</code>
              <button class="copy-install shrink-0 cursor-pointer text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white" data-copy="https://unpkg.com/@lumis-sh/lumis">${COPY_SVG}</button>
            </div>
            <div data-install-panel="elixir" class="hidden flex items-center justify-between px-4 py-3">
              <code class="font-mono text-sm text-zinc-700 dark:text-zinc-300"><span class="mr-2 text-zinc-400 select-none">&gt;</span>{:lumis, "~&gt; 0.1"}</code>
              <button class="copy-install shrink-0 cursor-pointer text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white" data-copy='{:lumis, "~> 0.1"}'>${COPY_SVG}</button>
            </div>
            <div data-install-panel="java" class="hidden flex items-center justify-between px-4 py-3">
              <code class="font-mono text-sm text-zinc-700 dark:text-zinc-300"><span class="mr-2 text-zinc-400 select-none">&gt;</span>io.roastedroot:lumis4j</code>
              <button class="copy-install shrink-0 cursor-pointer text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white" data-copy="io.roastedroot:lumis4j">${COPY_SVG}</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="border-y border-zinc-200 dark:border-zinc-800">
      <div class="mx-auto max-w-6xl">
        <div class="grid gap-px bg-zinc-200 dark:bg-zinc-800 sm:grid-cols-3">
          <div class="bg-white px-6 py-8 dark:bg-[#09090b]">
            <p class="font-mono text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">6 <span class="text-pink-400">Platforms</span></p>
            <p class="mt-1 font-mono text-xs text-zinc-500">CLI, Rust, Elixir, Node.js, Browser, Java. Multiple engines, same output.</p>
          </div>
          <div class="bg-white px-6 py-8 dark:bg-[#09090b]">
            <p class="font-mono text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">110+ <span class="text-sky-400">Languages</span></p>
            <p class="mt-1 font-mono text-xs text-zinc-500">Compiled Tree-sitter grammars containing highlights and injections.</p>
          </div>
          <div class="bg-white px-6 py-8 dark:bg-[#09090b]">
            <p class="font-mono text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">110+ <span class="text-amber-400">Themes</span></p>
            <p class="mt-1 font-mono text-xs text-zinc-500">Neovim colorschemes btw. Pick one of the built-in themes or bring your own.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="playground" class="py-24 sm:py-36">
      <div class="mx-auto max-w-6xl px-6">
        <a href="#playground" class="group inline-flex items-center gap-1 font-mono text-sm font-semibold tracking-wider no-underline transition-opacity hover:opacity-80">
          <span class="text-pink-400">&lt;</span><span class="text-purple-400">Playground</span> <span class="text-pink-400">/&gt;</span>
        </a>
        <div class="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 class="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Try it live.
          </h2>
          <div class="flex flex-wrap items-end gap-3">
            <label>
              <span class="mb-1 block font-mono text-[11px] tracking-wider text-zinc-400 uppercase">Language</span>
              <select name="language" class="h-9 border border-zinc-200 bg-white px-3 pr-8 font-mono text-xs text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-[#09090b] dark:text-white dark:focus:border-white">
                ${LANGUAGES.map((lang) => `<option value="${lang.id}">${lang.label}</option>`).join("")}
              </select>
            </label>
            <label>
              <span class="mb-1 block font-mono text-[11px] tracking-wider text-zinc-400 uppercase">Theme</span>
              <select name="theme" class="h-9 border border-zinc-200 bg-white px-3 pr-8 font-mono text-xs text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-[#09090b] dark:text-white dark:focus:border-white">
                ${THEMES.map((theme) => `<option value="${theme.id}">${theme.label}</option>`).join("")}
              </select>
            </label>
            <button type="button" class="randomize flex h-9 cursor-pointer items-center gap-2 border border-zinc-200 bg-white px-3 font-mono text-xs text-zinc-500 transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-800 dark:bg-[#09090b] dark:text-zinc-400 dark:hover:border-white dark:hover:text-white">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
              randomize
            </button>
          </div>
        </div>

        <div class="mt-8 overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <div class="preview-content max-h-[50rem] overflow-y-auto [&_code]:font-mono"></div>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-6xl px-6"><hr class="border-zinc-200 dark:border-zinc-800" /></div>

    <section id="quickstart" class="py-24 sm:py-36">
      <div class="mx-auto max-w-4xl px-6">
        <a href="#quickstart" class="group inline-flex items-center gap-1 font-mono text-sm font-semibold tracking-wider no-underline transition-opacity hover:opacity-80">
          <span class="text-amber-400">&lt;</span><span class="text-violet-400">Quickstart</span> <span class="text-amber-400">/&gt;</span>
        </a>
        <h2 class="mt-8 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Install, import, highlight.
        </h2>
        <p class="mt-4 font-mono text-sm text-zinc-500">Every platform, same pattern.</p>
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <a href="/docs"
             class="inline-flex items-center gap-2 border border-zinc-200 px-4 py-2 font-mono text-xs tracking-wider text-zinc-700 uppercase transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white">
            full docs
            <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </a>
          <span class="font-mono text-xs text-zinc-400">API guides, formatters, themes, CLI, and platform references.</span>
        </div>

        <div class="mt-12">
          <div class="flex gap-1 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800" role="tablist">
            ${QUICKSTART_TABS.map(
              (tab, i) => `
              <button role="tab" data-tab="${tab.id}" aria-selected="${i === 0}"
                class="quickstart-tab shrink-0 cursor-pointer border-b-2 px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors
                  ${i === 0 ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white" : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"}"
              >${tab.label}</button>
            `,
            ).join("")}
          </div>

          ${QUICKSTART_TABS.map(
            (tab, i) => `
            <div data-tab-panel="${tab.id}" class="${i === 0 ? "" : "hidden"} mt-6 space-y-4">
              ${tab.install ? `
              <div class="border border-zinc-200 dark:border-zinc-800">
                <div class="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
                  <span class="font-mono text-[11px] tracking-wider text-zinc-400 uppercase">Install</span>
                  <button class="copy-install shrink-0 cursor-pointer text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white" data-copy="${encodeURIComponent(tab.install.code)}">${COPY_SVG}</button>
                </div>
                <div class="quickstart-install [&_code]:font-mono" data-language="${tab.install.language}" data-code="${encodeURIComponent(tab.install.code)}">
                  <pre class="m-0 overflow-x-auto px-5 py-4 font-mono text-[13px] leading-7 text-zinc-700 dark:text-zinc-300 sm:px-6 sm:text-sm"><code>${escapeHtml(tab.install.code)}</code></pre>
                </div>
              </div>
              ` : ""}
              <div class="border border-zinc-200 dark:border-zinc-800">
                <div class="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
                  <span class="font-mono text-[11px] tracking-wider text-zinc-400 uppercase">Usage</span>
                  <button class="copy-install shrink-0 cursor-pointer text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white" data-copy="${encodeURIComponent(tab.usage.code)}">${COPY_SVG}</button>
                </div>
                <div class="quickstart-usage [&_code]:font-mono" data-language="${tab.usage.language}" data-code="${encodeURIComponent(tab.usage.code)}">
                  <pre class="m-0 overflow-x-auto px-5 py-4 font-mono text-[13px] leading-7 text-zinc-700 dark:text-zinc-300 sm:px-6 sm:text-sm"><code>${escapeHtml(tab.usage.code)}</code></pre>
                </div>
              </div>
            </div>
          `,
          ).join("")}
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-6xl px-6"><hr class="border-zinc-200 dark:border-zinc-800" /></div>

    <section id="engine" class="py-24 sm:py-36">
      <div class="mx-auto max-w-6xl px-6">
        <a href="#engine" class="group inline-flex items-center gap-1 font-mono text-sm font-semibold tracking-wider no-underline transition-opacity hover:opacity-80">
          <span class="text-sky-400">&lt;</span><span class="text-emerald-400">Engine</span> <span class="text-sky-400">/&gt;</span>
        </a>

        <div class="mt-12 grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <h2 class="text-4xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white">
              Tree-sitter,<br>not regex.
            </h2>
            <p class="mt-6 font-mono text-sm leading-relaxed text-zinc-500">
              The same parsing technology that powers your code editor. Nested languages resolve correctly,
              incomplete code stays readable, streaming AI output highlights as tokens arrive.
            </p>
            <dl class="mt-10 space-y-6">
              <div class="border-l-2 border-zinc-200 py-1 pl-5 dark:border-zinc-800">
                <dt class="font-mono text-sm font-medium text-zinc-900 dark:text-white">Streaming</dt>
                <dd class="mt-1 font-mono text-xs leading-relaxed text-zinc-500">Chat apps, agent output, copilots. Highlights code that isn't finished yet.</dd>
              </div>
              <div class="border-l-2 border-zinc-200 py-1 pl-5 dark:border-zinc-800">
                <dt class="font-mono text-sm font-medium text-zinc-900 dark:text-white">Injections</dt>
                <dd class="mt-1 font-mono text-xs leading-relaxed text-zinc-500">&lt;script&gt; inside HTML, SQL inside Rust — both highlighted with full fidelity.</dd>
              </div>
              <div class="border-l-2 border-zinc-200 py-1 pl-5 dark:border-zinc-800">
                <dt class="font-mono text-sm font-medium text-zinc-900 dark:text-white">Local WASM</dt>
                <dd class="mt-1 font-mono text-xs leading-relaxed text-zinc-500">Ship parsers with your app. No runtime downloads, no CDN dependency.</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 class="text-4xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white">
              Built-in formatters<br/>or bring your own.
            </h2>
            <p class="mt-6 font-mono text-sm leading-relaxed text-zinc-500">
              Parsing is separated from rendering. Choose a built-in formatter or implement the
              trait/interface to output any format.
            </p>
            <div class="mt-10 space-y-4">
              ${FORMATTERS.map(
                (f) => `
                <div class="flex items-baseline justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800/50">
                  <div>
                    <span class="font-mono text-sm font-medium text-zinc-900 dark:text-white">${f.name}</span>
                    <p class="mt-1 font-mono text-xs leading-relaxed text-zinc-500">${f.description}</p>
                  </div>
                </div>
              `,
              ).join("")}
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-6xl px-6"><hr class="border-zinc-200 dark:border-zinc-800" /></div>

    <section id="platforms" class="py-24 sm:py-36">
      <div class="mx-auto max-w-6xl px-6">
        <a href="#platforms" class="group inline-flex items-center gap-1 font-mono text-sm font-semibold tracking-wider no-underline transition-opacity hover:opacity-80">
          <span class="text-rose-400">&lt;</span><span class="text-indigo-400">Platforms</span> <span class="text-rose-400">/&gt;</span>
        </a>
        <h2 class="mt-8 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
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
                        `<a href="${link.href}" target="_blank" rel="noreferrer" class="font-mono text-xs text-zinc-400 underline decoration-zinc-300 underline-offset-2 transition-colors hover:text-zinc-900 dark:decoration-zinc-700 dark:hover:text-white">${link.label}</a>`,
                    )
                    .join('<span class="text-zinc-300 dark:text-zinc-700">/</span>')}
                </div>
              </div>
            `,
            ).join("")}
          </div>
        </div>
      </div>
    </section>

    <footer class="border-t border-zinc-200 dark:border-zinc-800">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <div class="flex items-center gap-2.5 font-mono text-xs text-zinc-400">
          <span class="inline-flex h-5 w-5 items-center justify-center bg-zinc-900 text-[9px] font-black text-white dark:bg-white dark:text-zinc-900">L</span>
          <span>lumis &mdash; syntax highlighting for every platform</span>
        </div>
        <div class="flex items-center gap-4 font-mono text-xs text-zinc-400">
          <a href="https://github.com/leandrocp/lumis" target="_blank" rel="noreferrer" class="transition-colors hover:text-zinc-900 dark:hover:text-white">github</a>
          <span class="text-zinc-300 dark:text-zinc-700">/</span>
          <a href="https://crates.io/crates/lumis" target="_blank" rel="noreferrer" class="transition-colors hover:text-zinc-900 dark:hover:text-white">crates</a>
          <span class="text-zinc-300 dark:text-zinc-700">/</span>
          <a href="https://www.npmjs.com/package/@lumis-sh/lumis" target="_blank" rel="noreferrer" class="transition-colors hover:text-zinc-900 dark:hover:text-white">npm</a>
          <span class="text-zinc-300 dark:text-zinc-700">/</span>
          <a href="https://hex.pm/packages/lumis" target="_blank" rel="noreferrer" class="transition-colors hover:text-zinc-900 dark:hover:text-white">hex</a>
          <span class="text-zinc-300 dark:text-zinc-700">/</span>
          <a href="https://central.sonatype.com/artifact/io.roastedroot/lumis4j" target="_blank" rel="noreferrer" class="transition-colors hover:text-zinc-900 dark:hover:text-white">maven</a>
        </div>
      </div>
    </footer>
  `;

  // Hero fluid animation (skip on mobile - too expensive for small screens)
  const heroFluidContainer = root.querySelector<HTMLDivElement>("#hero-fluid");
  if (heroFluidContainer && window.matchMedia("(min-width: 640px)").matches) {
    mountHeroFluid(heroFluidContainer);
  }

  setupTabs(root, ".install-tab", "install", "[data-install-panel]", "installPanel");

  // Mobile menu toggle
  const menuToggle = root.querySelector<HTMLButtonElement>(".mobile-menu-toggle")!;
  const mobileMenu = root.querySelector<HTMLDivElement>(".mobile-menu")!;
  menuToggle.addEventListener("click", () => {
    const isOpen = !mobileMenu.classList.contains("hidden");
    mobileMenu.classList.toggle("hidden");
    menuToggle.innerHTML = isOpen ? BURGER_SVG : CLOSE_SVG;
  });
  root.querySelectorAll<HTMLAnchorElement>(".mobile-menu-link").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      menuToggle.innerHTML = BURGER_SVG;
    });
  });

  // Copy install command
  root.querySelectorAll<HTMLButtonElement>(".copy-install").forEach((btn) => {
    btn.addEventListener("click", () => {
      const raw = btn.dataset.copy!;
      const text = decodeURIComponent(raw);
      navigator.clipboard.writeText(text);
      btn.innerHTML = CHECK_SVG;
      btn.classList.add("text-emerald-500");
      setTimeout(() => {
        btn.innerHTML = COPY_SVG;
        btn.classList.remove("text-emerald-500");
      }, 1500);
    });
  });

  setupTabs(root, ".quickstart-tab", "tab", "[data-tab-panel]", "tabPanel");

  const languageSelect = root.querySelector<HTMLSelectElement>('select[name="language"]')!;
  const themeSelect = root.querySelector<HTMLSelectElement>('select[name="theme"]')!;
  const preview = root.querySelector<HTMLDivElement>(".preview-content")!;
  const randomizeButton = root.querySelector<HTMLButtonElement>(".randomize")!;

  languageSelect.value = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)].id;
  themeSelect.value = THEMES[Math.floor(Math.random() * THEMES.length)].id;

  let renderToken = 0;

  const render = async () => {
    const token = ++renderToken;
    const language = LANGUAGES_BY_ID.get(languageSelect.value) ?? initialLanguage;
    const theme = THEMES_BY_ID.get(themeSelect.value) ?? initialTheme;

    preview.setAttribute("data-state", "loading");

    const themeData = await loadTheme(theme.id);
    const html = await renderHighlight(language, themeData, getSample(language.id));
    if (token !== renderToken) return;

    preview.innerHTML = html;
    preview.setAttribute("data-state", "ready");
  };

  languageSelect.addEventListener("change", () => void render());
  themeSelect.addEventListener("change", () => void render());

  randomizeButton.addEventListener("click", () => {
    const language = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];
    const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
    languageSelect.value = language.id;
    themeSelect.value = theme.id;
    void render();
  });

  await render();

  // Preload all language WASMs in the background so switching languages is instant
  void preloadAllLanguages();

  const [quickstartLightTheme, quickstartDarkTheme] = await Promise.all([
    loadTheme("github_light"),
    loadTheme("github_dark"),
  ]);
  root.querySelectorAll<HTMLDivElement>(".quickstart-install, .quickstart-usage").forEach(async (el) => {
    const langId = el.dataset.language!;
    const code = decodeURIComponent(el.dataset.code!);
    const lang = LANGUAGES_BY_ID.get(langId);
    if (!lang) return;

    const highlighted = await renderHighlightMultiTheme(
      lang,
      quickstartLightTheme,
      quickstartDarkTheme,
      code,
      "m-0 overflow-x-auto p-5 font-mono text-[13px] leading-relaxed sm:p-6 sm:text-sm",
    );
    el.innerHTML = highlighted;
  });
}

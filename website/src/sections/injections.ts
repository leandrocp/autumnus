import { loadTheme } from "../data/themes";
import { LANGUAGES_BY_ID } from "../data/languages";
import { preloadAllLanguages, renderHighlightMultiTheme } from "../lib/highlighter";

const HTML_CSS_JS_SOURCE = `<section class="greeting-card">
  <style>
    .greeting-card {
      border: 1px solid currentColor;
      padding: 1rem;
    }
  </style>

  <h1>Hello, Maya</h1>

  <script>
    const heading = document.querySelector('.greeting-card h1')
    console.log(heading.textContent)
  </script>
</section>`;

export function renderInjections() {
  return `
    <section id="injections" class="py-24 sm:py-36">
      <div class="mx-auto max-w-6xl px-6">
        <a href="#injections" class="group inline-flex items-center gap-1 font-mono text-sm font-semibold tracking-wider no-underline transition-opacity hover:opacity-80">
          <span class="text-emerald-400">&lt;</span><span class="text-teal-400">Injections</span> <span class="text-emerald-400">/&gt;</span>
        </a>
        <h2 class="mt-8 font-mono text-4xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white">
          Highlight injected languages too.
        </h2>
        <p class="mt-4 font-mono text-sm leading-relaxed text-zinc-500">
          All languages, no matter the level, are parsed using their own parser to output the correct colors. No plaintext, no confusion.
        </p>

        <div class="mt-12">
          <div class="mb-3 flex items-center justify-between">
            <span class="font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">3 languages</span>
            <div class="flex gap-3">
              <span class="inline-flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                <span class="inline-block h-2 w-2 rounded-full bg-sky-400"></span>CSS
              </span>
              <span class="inline-flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                <span class="inline-block h-2 w-2 rounded-full bg-rose-400"></span>HTML
              </span>
              <span class="inline-flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                <span class="inline-block h-2 w-2 rounded-full bg-amber-400"></span>JavaScript
              </span>
            </div>
          </div>
          <div class="overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div class="injection-preview-html-nested [&_code]:font-mono"></div>
          </div>
        </div>

        <dl class="mt-12 grid gap-8 sm:grid-cols-3">
          <div class="border-l-2 border-zinc-200 py-1 pl-5 dark:border-zinc-800">
            <dt class="font-mono text-sm font-medium text-zinc-900 dark:text-white">Multi-level nesting</dt>
            <dd class="mt-1 font-mono text-xs leading-relaxed text-zinc-500">Each injected language gets its own parser. No depth limits, no hacks.</dd>
          </div>
          <div class="border-l-2 border-zinc-200 py-1 pl-5 dark:border-zinc-800">
            <dt class="font-mono text-sm font-medium text-zinc-900 dark:text-white">Language-aware scopes</dt>
            <dd class="mt-1 font-mono text-xs leading-relaxed text-zinc-500">Tokens know which language they belong to. Themes apply the right colors automatically.</dd>
          </div>
          <div class="border-l-2 border-zinc-200 py-1 pl-5 dark:border-zinc-800">
            <dt class="font-mono text-sm font-medium text-zinc-900 dark:text-white">Real embedded syntax</dt>
            <dd class="mt-1 font-mono text-xs leading-relaxed text-zinc-500">Injected blocks are not plain text, so strings, keywords, and punctuation keep the right scopes.</dd>
          </div>
        </dl>
      </div>
    </section>`;
}

export async function setupInjections(_root: HTMLElement) {
  await preloadAllLanguages();

  const [lightTheme, darkTheme] = await Promise.all([
    loadTheme("catppuccin_latte"),
    loadTheme("catppuccin_mocha"),
  ]);

  const preClass =
    "m-0 overflow-x-auto p-5 font-mono text-[13px] leading-relaxed sm:p-6 sm:text-sm";

  const phpPreview = document.querySelector<HTMLDivElement>(".injection-preview-html-nested");
  const htmlCssJsLang = LANGUAGES_BY_ID.get("html");
  if (phpPreview && htmlCssJsLang) {
    const highlighted = await renderHighlightMultiTheme(
      htmlCssJsLang,
      lightTheme,
      darkTheme,
      HTML_CSS_JS_SOURCE,
      preClass,
    );
    phpPreview.innerHTML = highlighted;
  }
}

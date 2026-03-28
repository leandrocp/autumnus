import { loadTheme } from "../data/themes";

export function renderTokenInspector() {
  return `
    <section id="inspector" class="py-24 sm:py-36">
      <div class="mx-auto max-w-6xl px-6">
        <a href="#inspector" class="group inline-flex items-center gap-1 font-mono text-sm font-semibold tracking-wider no-underline transition-opacity hover:opacity-80">
          <span class="text-cyan-400">&lt;</span><span class="text-pink-400">Inspector</span> <span class="text-cyan-400">/&gt;</span>
        </a>
        <h2 class="mt-8 font-mono text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Inspect every token.
        </h2>
        <p class="mt-4 font-mono text-sm text-zinc-500">
          Tree-sitter parses every token with full grammar awareness. Hover any token to see
          its scope, language, and where it sits in the source.
        </p>

        <div class="mt-12 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div class="mb-3 flex items-center justify-between">
              <span class="font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">HTML + JavaScript</span>
              <div class="flex gap-3">
                <span class="font-mono text-[11px] text-zinc-400" id="inspector-token-count"></span>
                <span class="font-mono text-[11px] text-zinc-400" id="inspector-scope-count"></span>
                <span class="font-mono text-[11px] text-zinc-400" id="inspector-lang-count"></span>
              </div>
            </div>
            <div class="overflow-hidden border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#0d1117] sm:p-5">
              <div id="inspector-output" class="inspector-output overflow-x-auto [&_code]:font-mono"></div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="border border-zinc-200 p-4 dark:border-zinc-800">
              <span class="block font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">Token</span>
              <code class="mt-1 block font-mono text-sm text-zinc-900 dark:text-white" id="inspector-text">-</code>
            </div>
            <div class="border border-zinc-200 p-4 dark:border-zinc-800">
              <span class="block font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">Scope</span>
              <span class="mt-1 block font-mono text-sm text-zinc-900 dark:text-white" id="inspector-scope">-</span>
            </div>
            <div class="border border-zinc-200 p-4 dark:border-zinc-800">
              <span class="block font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">Language</span>
              <span class="mt-1 block font-mono text-sm text-zinc-900 dark:text-white" id="inspector-language">-</span>
            </div>
            <div class="border border-zinc-200 p-4 dark:border-zinc-800">
              <span class="block font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">Byte range</span>
              <span class="mt-1 block font-mono text-sm text-zinc-900 dark:text-white" id="inspector-range">-</span>
            </div>
            <div class="border border-zinc-200 p-4 dark:border-zinc-800">
              <span class="block font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">Foreground</span>
              <span class="mt-1 block font-mono text-sm text-zinc-900 dark:text-white" id="inspector-fg">-</span>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

const INSPECTOR_SOURCE = `<article class="profile-card">
  <h2>User profile</h2>
  <script>
    async function loadUserProfile(userId) {
      const response = await fetch(\`/api/users/\${userId}\`)
      if (!response.ok) throw new Error('Failed to load')

      return response.json()
    }
  </script>
</article>`;

export async function setupTokenInspector(root: HTMLElement) {
  const output = root.querySelector<HTMLDivElement>("#inspector-output");
  if (!output) return;

  const observer = new IntersectionObserver(
    async (entries) => {
      const entry = entries[0];
      if (!entry.isIntersecting) return;
      observer.disconnect();
      await initInspector(root, output);
    },
    { rootMargin: "200px" },
  );
  observer.observe(output);
}

async function initInspector(root: HTMLElement, output: HTMLDivElement) {
  const [
    { createHighlighter, configureWasmResolver },
    { escape, openSpanTag, openPreTag, openCodeTag, closingTags, wrapLine, styleToCss },
    html,
    javascript,
    lightTheme,
    darkTheme,
  ] = await Promise.all([
    import("@lumis-sh/lumis"),
    import("@lumis-sh/lumis/formatters/html"),
    import("@lumis-sh/lumis/langs/html").then((m) => m.default),
    import("@lumis-sh/lumis/langs/javascript").then((m) => m.default),
    loadTheme("catppuccin_latte"),
    loadTheme("catppuccin_mocha"),
  ]);

  configureWasmResolver((_language, wasm) => `/wasm/${wasm.name}.wasm`);
  const hl = await createHighlighter({ languages: [html, javascript] });

  const docsFormatter = {
    language: html,
    format(source: string, hlCtx: unknown) {
      let tokenId = 0;
      const lines = [""];

      const hl = hlCtx as {
        highlightIter: (
          source: string,
          language: unknown,
          theme: unknown,
          cb: (
            text: string,
            language: string,
            range: { start: number; end: number },
            scope: string,
            style: { fg?: string; bg?: string } | undefined,
          ) => void,
        ) => void;
      };
      const darkStyles: Array<{ fg?: string; bg?: string } | undefined> = [];

      hl.highlightIter(
        source,
        html,
        darkTheme,
        (
          text: string,
          _language: string,
          _range: { start: number; end: number },
          scope: string,
          style: { fg?: string; bg?: string } | undefined,
        ) => {
          const parts = text.split("\n");
          for (let i = 0; i < parts.length; i++) {
            if (parts[i].length > 0 && scope) darkStyles.push(style);
          }
        },
      );

      let darkStyleIndex = 0;
      hl.highlightIter(
        source,
        html,
        lightTheme,
        (
          text: string,
          language: string,
          range: { start: number; end: number },
          scope: string,
          style: { fg?: string; bg?: string } | undefined,
        ) => {
          const parts = text.split("\n");
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part.length > 0) {
              const escaped = escape(part);
              if (scope) {
                const darkStyle = darkStyles[darkStyleIndex++];
                lines[lines.length - 1] +=
                  openSpanTag({
                    class: "tok",
                    tabindex: 0,
                    "data-token-id": String(++tokenId),
                    "data-scope": scope,
                    "data-language": language,
                    "data-start": String(range.start),
                    "data-end": String(range.end),
                    "data-fg": style?.fg,
                    "data-bg": style?.bg,
                    "data-fg-dark": darkStyle?.fg,
                    "data-bg-dark": darkStyle?.bg,
                    style: styleToCss(
                      {
                        fg:
                          style?.fg && darkStyle?.fg
                            ? `light-dark(${style.fg}, ${darkStyle.fg})`
                            : (style?.fg ?? darkStyle?.fg),
                        bg:
                          style?.bg && darkStyle?.bg
                            ? `light-dark(${style.bg}, ${darkStyle.bg})`
                            : (style?.bg ?? darkStyle?.bg),
                      },
                      { italic: true },
                    ),
                  }) +
                  escaped +
                  "</span>";
              } else {
                lines[lines.length - 1] += escaped;
              }
            }
            if (i < parts.length - 1) lines.push("");
          }
        },
      );

      const body = lines.map((line: string, i: number) => wrapLine(i + 1, line)).join("");
      return `${openPreTag({ preClass: "inspector-demo" })}${openCodeTag(html)}${body}${closingTags()}`;
    },
  };

  output.innerHTML = hl.highlight(INSPECTOR_SOURCE, docsFormatter);

  const tokens = [...output.querySelectorAll<HTMLElement>(".tok")];
  const scopeTotals = new Map<string, number>();
  const languageTotals = new Map<string, number>();

  for (const token of tokens) {
    const scope = token.dataset.scope;
    if (!scope) continue;
    scopeTotals.set(scope, (scopeTotals.get(scope) ?? 0) + 1);
    const lang = token.dataset.language;
    if (lang) languageTotals.set(lang, (languageTotals.get(lang) ?? 0) + 1);
  }

  const tokenCountEl = root.querySelector("#inspector-token-count");
  const scopeCountEl = root.querySelector("#inspector-scope-count");
  const langCountEl = root.querySelector("#inspector-lang-count");
  if (tokenCountEl) tokenCountEl.textContent = `${tokens.length} tokens`;
  if (scopeCountEl) scopeCountEl.textContent = `${scopeTotals.size} scopes`;
  if (langCountEl) langCountEl.textContent = `${languageTotals.size} languages`;

  const textEl = root.querySelector("#inspector-text")!;
  const scopeEl = root.querySelector("#inspector-scope")!;
  const languageEl = root.querySelector("#inspector-language")!;
  const rangeEl = root.querySelector("#inspector-range")!;
  const fgEl = root.querySelector("#inspector-fg")!;
  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
  let activeToken: HTMLElement | null = null;

  function selectToken(token: HTMLElement) {
    activeToken = token;
    for (const t of tokens) t.classList.remove("is-active");
    token.classList.add("is-active");
    textEl.textContent = token.textContent ?? "";
    scopeEl.textContent = token.dataset.scope ?? "-";
    languageEl.textContent = token.dataset.language ?? "-";
    rangeEl.textContent = `${token.dataset.start ?? "?"}..${token.dataset.end ?? "?"}`;
    fgEl.textContent = colorScheme.matches
      ? (token.dataset.fgDark ?? token.dataset.fg ?? "none")
      : (token.dataset.fg ?? "none");
  }

  for (const token of tokens) {
    token.addEventListener("mouseenter", () => selectToken(token));
    token.addEventListener("focus", () => selectToken(token));
    token.addEventListener("click", () => selectToken(token));
  }

  colorScheme.addEventListener("change", () => {
    if (activeToken) selectToken(activeToken);
  });

  if (tokens[0]) selectToken(tokens[0]);
}

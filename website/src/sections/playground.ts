import { LANGUAGES, LANGUAGES_BY_ID, getSample } from "../data/languages";
import { loadTheme, THEMES, THEMES_BY_ID } from "../data/themes";
import { preloadAllLanguages, renderHighlight } from "../lib/highlighter";

export function renderPlayground() {
  return `
    <section id="playground" class="py-24 sm:py-36">
      <div class="mx-auto max-w-6xl px-6">
        <a href="#playground" class="group inline-flex items-center gap-1 font-mono text-sm font-semibold tracking-wider no-underline transition-opacity hover:opacity-80">
          <span class="text-pink-400">&lt;</span><span class="text-purple-400">Playground</span> <span class="text-pink-400">/&gt;</span>
        </a>
        <div class="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 class="font-mono text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Try it live.
          </h2>
          <div class="flex flex-wrap items-end gap-3">
            <label>
              <span class="mb-1 block font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">Language</span>
              <select name="language" class="h-9 border border-zinc-200 bg-white px-3 pr-8 font-mono text-xs text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-[#09090b] dark:text-white dark:focus:border-white">
                ${LANGUAGES.map((lang) => `<option value="${lang.id}">${lang.label}</option>`).join("")}
              </select>
            </label>
            <label>
              <span class="mb-1 block font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">Theme</span>
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
          <div class="preview-content max-h-[50rem] overflow-y-auto [&_code]:font-mono"><div class="flex items-center justify-center py-24 font-mono text-xs text-zinc-400">Highlighting…</div></div>
        </div>
      </div>
    </section>`;
}

export async function setupPlayground(root: HTMLElement) {
  const initialLanguage = LANGUAGES[0];
  const initialTheme = THEMES[0];

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

  void preloadAllLanguages();
}

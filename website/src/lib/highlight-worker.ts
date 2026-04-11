import { createHighlighter, withWasm } from "@lumis-sh/lumis";
import { bundledLanguages } from "@lumis-sh/lumis/bundles/full";
import { htmlInline, htmlMultiThemes } from "@lumis-sh/lumis/formatters";
import type { Language, Theme } from "@lumis-sh/lumis";

const DEFAULT_PRE_CLASS =
  "m-0 overflow-x-auto p-5 font-mono text-[13px] leading-relaxed sm:p-6 sm:text-sm";

const wasmModules = import.meta.glob<Uint8Array>(
  [
    "../../node_modules/@lumis-sh/wasm-*/index.js",
    "../../node_modules/@lumis-sh/wasm-bundle-full/node_modules/@lumis-sh/wasm-*/index.js",
  ],
  { import: "default" },
);

const wasmLoaders = new Map(
  Object.entries(wasmModules).map(([path, loader]) => {
    const match = path.match(/(@lumis-sh\/wasm-[^/]+)\/index\.js$/);
    if (!match) {
      throw new Error(`Could not derive wasm package name from ${path}`);
    }

    return [match[1], loader];
  }),
);

const languageCache = new Map<string, Promise<Language>>();
const highlighterPromise = createHighlighter();

async function getLanguage(languageId: string): Promise<Language> {
  const existing = languageCache.get(languageId);
  if (existing) return existing;

  const handle = bundledLanguages[languageId];
  if (!handle) {
    throw new Error(`Unknown language: ${languageId}`);
  }

  const promise = (async () => {
    const language = await handle();
    const loader = wasmLoaders.get(language.wasm.packageName);

    if (!loader) {
      return language;
    }

    const wasm = await loader();
    return withWasm(language, wasm);
  })();

  languageCache.set(languageId, promise);
  return promise;
}

export type WorkerRequest =
  | {
      id: number;
      type: "highlight";
      languageId: string;
      theme: Theme;
      source: string;
      preClass?: string;
    }
  | {
      id: number;
      type: "highlightMultiTheme";
      languageId: string;
      lightTheme: Theme;
      darkTheme: Theme;
      source: string;
      preClass?: string;
    }
  | { id: number; type: "preloadAll" };

export type WorkerResponse =
  | { id: number; type: "result"; html: string }
  | { id: number; type: "done" }
  | { id: number; type: "error"; message: string };

async function handleMessage(req: WorkerRequest): Promise<WorkerResponse> {
  const hl = await highlighterPromise;

  switch (req.type) {
    case "highlight": {
      const lang = await getLanguage(req.languageId);
      await hl.loadLanguage(lang);
      const html = hl.highlight(
        req.source,
        htmlInline({
          language: lang,
          theme: req.theme,
          preClass: req.preClass ?? DEFAULT_PRE_CLASS,
          includeHighlights: true,
          italic: false,
        }),
      );
      return { id: req.id, type: "result", html };
    }
    case "highlightMultiTheme": {
      const lang = await getLanguage(req.languageId);
      await hl.loadLanguage(lang);
      const html = hl.highlight(
        req.source,
        htmlMultiThemes({
          language: lang,
          themes: { light: req.lightTheme, dark: req.darkTheme },
          defaultTheme: "light-dark()",
          preClass: req.preClass ?? DEFAULT_PRE_CLASS,
          italic: false,
        }),
      );
      return { id: req.id, type: "result", html };
    }
    case "preloadAll": {
      await Promise.all(
        Object.keys(bundledLanguages).map((id) =>
          getLanguage(id)
            .then((language) => hl.loadLanguage(language))
            .catch(() => {}),
        ),
      );
      return { id: req.id, type: "done" };
    }
  }
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  try {
    const response = await handleMessage(e.data);
    self.postMessage(response);
  } catch (err) {
    self.postMessage({
      id: e.data.id,
      type: "error",
      message: String(err),
    } satisfies WorkerResponse);
  }
};

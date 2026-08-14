import { configureWasmResolver, createHighlighter } from "@lumis-sh/lumis";
import { bundledLanguages } from "@lumis-sh/lumis/bundles/full";
import { htmlInline, htmlMultiThemes } from "@lumis-sh/lumis/formatters";
import type { Language, Theme } from "@lumis-sh/lumis";

const DEFAULT_PRE_CLASS =
  "m-0 overflow-x-auto p-5 font-mono text-[13px] leading-relaxed sm:p-6 sm:text-sm";

const wasmModules = import.meta.glob<string>(
  [
    "../../node_modules/@lumis-sh/wasm-*/*.wasm",
    "../../node_modules/.pnpm/@lumis-sh+wasm-*/node_modules/@lumis-sh/wasm-*/*.wasm",
    "!../../node_modules/@lumis-sh/wasm-bundle-*/*.wasm",
    "!../../node_modules/.pnpm/@lumis-sh+wasm-bundle-*/node_modules/@lumis-sh/wasm-bundle-*/*.wasm",
  ],
  { eager: true, import: "default", query: "?url" },
);

const wasmVersions = import.meta.glob<string>(
  [
    "../../node_modules/@lumis-sh/wasm-*/package.json",
    "../../node_modules/.pnpm/@lumis-sh+wasm-*/node_modules/@lumis-sh/wasm-*/package.json",
    "!../../node_modules/@lumis-sh/wasm-bundle-*/package.json",
    "!../../node_modules/.pnpm/@lumis-sh+wasm-bundle-*/node_modules/@lumis-sh/wasm-bundle-*/package.json",
  ],
  { eager: true, import: "version" },
);

const versionByDirectory = new Map(
  Object.entries(wasmVersions).map(([path, version]) => [directoryOf(path), version]),
);

const wasmUrls = new Map(
  Object.entries(wasmModules).map(([path, url]) => {
    const match = path.match(/(@lumis-sh\/wasm-[^/]+)\/([^/]+\.wasm)$/);
    if (!match) {
      throw new Error(`Could not derive wasm package name and file from ${path}`);
    }

    const version = versionByDirectory.get(directoryOf(path));
    if (!version) {
      throw new Error(`Could not find the installed version for ${path}`);
    }

    return [`${match[1]}@${version}/${match[2]}`, url];
  }),
);

function directoryOf(path: string) {
  return path.slice(0, path.lastIndexOf("/"));
}

// The catalog resolves each parser package against the registry, so it can ask
// for a version newer than the one installed here, and `pnpm` leaves the
// superseded copy on disk, so a name alone can match either. The bytes are
// checked against the size and digest the catalog carries, and a near miss
// fails every language rather than falling back, so only the exact version is
// served locally.
configureWasmResolver((_language, wasm) => {
  const file = `${wasm.packageName}@${wasm.version}/${wasm.name}.wasm`;
  return wasmUrls.get(file) ?? `https://cdn.jsdelivr.net/npm/${file}`;
});

const languageCache = new Map<string, Promise<Language>>();
const highlighterPromise = createHighlighter();
let highlighterQueue = Promise.resolve();

function withHighlighter<T>(fn: () => Promise<T> | T): Promise<T> {
  const task = highlighterQueue.then(fn, fn);
  highlighterQueue = task.then(
    () => undefined,
    () => undefined,
  );
  return task;
}

async function getLanguage(languageId: string): Promise<Language> {
  const existing = languageCache.get(languageId);
  if (existing) return existing;

  const handle = bundledLanguages[languageId];
  if (!handle) {
    throw new Error(`Unknown language: ${languageId}`);
  }

  const promise = (async () => {
    return await handle();
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
  | { id: number; type: "loadLanguages"; languageIds: string[] };

export type WorkerResponse =
  | { id: number; type: "result"; html: string }
  | { id: number; type: "done" }
  | { id: number; type: "error"; message: string };

async function handleMessage(req: WorkerRequest): Promise<WorkerResponse> {
  const hl = await highlighterPromise;

  switch (req.type) {
    case "highlight": {
      const html = await withHighlighter(async () => {
        const lang = await getLanguage(req.languageId);
        await hl.loadLanguage(lang);
        return hl.highlight(
          req.source,
          htmlInline({
            language: lang,
            theme: req.theme,
            preClass: req.preClass ?? DEFAULT_PRE_CLASS,
            includeHighlights: true,
            italic: false,
          }),
        );
      });
      return { id: req.id, type: "result", html };
    }
    case "highlightMultiTheme": {
      const html = await withHighlighter(async () => {
        const lang = await getLanguage(req.languageId);
        await hl.loadLanguage(lang);
        return hl.highlight(
          req.source,
          htmlMultiThemes({
            language: lang,
            themes: { light: req.lightTheme, dark: req.darkTheme },
            defaultTheme: "light-dark()",
            preClass: req.preClass ?? DEFAULT_PRE_CLASS,
            italic: false,
          }),
        );
      });
      return { id: req.id, type: "result", html };
    }
    case "loadLanguages": {
      for (const id of req.languageIds) {
        await withHighlighter(async () => {
          const language = await getLanguage(id);
          await hl.loadLanguage(language);
        }).catch(() => {});
      }
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

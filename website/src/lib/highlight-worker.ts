import { createHighlighter } from "@lumis-sh/lumis";
import { bundledLanguages } from "@lumis-sh/lumis/bundles/full";
import { htmlInline, htmlMultiThemes } from "@lumis-sh/lumis/formatters";
import type { Theme } from "@lumis-sh/lumis";

const DEFAULT_PRE_CLASS = "m-0 overflow-x-auto p-5 font-mono text-[13px] leading-relaxed sm:p-6 sm:text-sm";

const highlighterPromise = createHighlighter({ langs: [bundledLanguages] });

export type WorkerRequest =
  | { id: number; type: "highlight"; languageId: string; theme: Theme; source: string; preClass?: string }
  | { id: number; type: "highlightMultiTheme"; languageId: string; lightTheme: Theme; darkTheme: Theme; source: string; preClass?: string }
  | { id: number; type: "preloadAll" };

export type WorkerResponse =
  | { id: number; type: "result"; html: string }
  | { id: number; type: "done" }
  | { id: number; type: "error"; message: string };

async function handleMessage(req: WorkerRequest): Promise<WorkerResponse> {
  const hl = await highlighterPromise;

  switch (req.type) {
    case "highlight": {
      const lang = bundledLanguages[req.languageId];
      if (!lang) return { id: req.id, type: "error", message: `Unknown language: ${req.languageId}` };
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
      const lang = bundledLanguages[req.languageId];
      if (!lang) return { id: req.id, type: "error", message: `Unknown language: ${req.languageId}` };
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
      await Promise.all(Object.values(bundledLanguages).map((l) => hl.loadLanguage(l).catch(() => {})));
      return { id: req.id, type: "done" };
    }
  }
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  try {
    const response = await handleMessage(e.data);
    self.postMessage(response);
  } catch (err) {
    self.postMessage({ id: e.data.id, type: "error", message: String(err) } satisfies WorkerResponse);
  }
};

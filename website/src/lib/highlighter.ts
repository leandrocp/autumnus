import type { Theme } from "@lumis-sh/lumis";
import type { WorkerRequest, WorkerResponse } from "./highlight-worker";
import type { LanguageOption } from "../data/languages";

const worker = new Worker(new URL("./highlight-worker.ts", import.meta.url), { type: "module" });

let nextId = 0;
const pending = new Map<number, { resolve: (v: WorkerResponse) => void }>();

worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
  const handler = pending.get(e.data.id);
  if (handler) {
    pending.delete(e.data.id);
    handler.resolve(e.data);
  }
};

function send(req: Omit<WorkerRequest, "id">): Promise<WorkerResponse> {
  const id = nextId++;
  return new Promise((resolve) => {
    pending.set(id, { resolve });
    worker.postMessage({ ...req, id });
  });
}

export async function preloadAllLanguages(): Promise<void> {
  await send({ type: "preloadAll" });
}

export async function renderHighlight(language: LanguageOption, theme: Theme, source: string, preClass?: string): Promise<string> {
  const res = await send({ type: "highlight", languageId: language.id, theme, source, preClass });
  if (res.type === "error") throw new Error(res.message);
  return (res as Extract<WorkerResponse, { type: "result" }>).html;
}

export async function renderHighlightMultiTheme(
  language: LanguageOption,
  lightTheme: Theme,
  darkTheme: Theme,
  source: string,
  preClass?: string,
): Promise<string> {
  const res = await send({ type: "highlightMultiTheme", languageId: language.id, lightTheme, darkTheme, source, preClass });
  if (res.type === "error") throw new Error(res.message);
  return (res as Extract<WorkerResponse, { type: "result" }>).html;
}

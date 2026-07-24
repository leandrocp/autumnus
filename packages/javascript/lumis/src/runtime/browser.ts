import type { RuntimeEnvironment } from "./runtime.js";
import { createLanguagesModule } from "../core/languages.js";
import treeSitterWasmBinary from "../tree-sitter-wasm.js";

const WASM_CACHE_NAME = "lumis-wasm-v1";
const WASM_DATABASE_NAME = "lumis-wasm-v1";
const WASM_DATABASE_STORE = "parsers";
const cacheLocks = new Map<string, Promise<unknown>>();
let wasmDatabase: Promise<IDBDatabase | undefined> | undefined;

function cacheRequest(key: string): Request {
  const origin = globalThis.location?.origin ?? "https://lumis.invalid";
  return new Request(`${origin}/.lumis-cache/${encodeURIComponent(key)}`);
}

async function openWasmCache(): Promise<Cache | undefined> {
  if (!("caches" in globalThis)) return undefined;
  try {
    return await globalThis.caches.open(WASM_CACHE_NAME);
  } catch {
    return undefined;
  }
}

function prefersIndexedDb(): boolean {
  const userAgent = globalThis.navigator?.userAgent ?? "";
  return /\bSafari\//.test(userAgent) && !/\b(?:Chrome|Chromium|CriOS|Edg|OPR)\//.test(userAgent);
}

async function openWasmDatabase(): Promise<IDBDatabase | undefined> {
  if (!("indexedDB" in globalThis)) return undefined;
  wasmDatabase ??= new Promise((resolve) => {
    const request = globalThis.indexedDB.open(WASM_DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(WASM_DATABASE_STORE)) {
        request.result.createObjectStore(WASM_DATABASE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(undefined);
    request.onblocked = () => resolve(undefined);
  });
  return wasmDatabase;
}

async function readCacheStorage(key: string): Promise<Uint8Array | undefined> {
  const cache = await openWasmCache();
  if (!cache) return undefined;
  try {
    const response = await cache.match(cacheRequest(key));
    return response ? new Uint8Array(await response.arrayBuffer()) : undefined;
  } catch {
    return undefined;
  }
}

async function writeCacheStorage(key: string, data: Uint8Array): Promise<boolean> {
  const cache = await openWasmCache();
  if (!cache) return false;
  try {
    await cache.put(
      cacheRequest(key),
      new Response(data.slice(), {
        headers: {
          "Content-Type": "application/wasm",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      }),
    );
    return true;
  } catch {
    return false;
  }
}

async function readIndexedDb(key: string): Promise<Uint8Array | undefined> {
  const database = await openWasmDatabase();
  if (!database) return undefined;
  return new Promise((resolve) => {
    const request = database
      .transaction(WASM_DATABASE_STORE, "readonly")
      .objectStore(WASM_DATABASE_STORE)
      .get(key);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result instanceof ArrayBuffer ? new Uint8Array(result) : undefined);
    };
    request.onerror = () => resolve(undefined);
  });
}

async function writeIndexedDb(key: string, data: Uint8Array): Promise<boolean> {
  const database = await openWasmDatabase();
  if (!database) return false;
  return new Promise((resolve) => {
    const transaction = database.transaction(WASM_DATABASE_STORE, "readwrite");
    transaction.objectStore(WASM_DATABASE_STORE).put(data.slice().buffer, key);
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => resolve(false);
    transaction.onabort = () => resolve(false);
  });
}

export const browserRuntime: RuntimeEnvironment = {
  async resolveWasm(wasm) {
    if (wasm instanceof URL) {
      return wasm.href;
    }
    if (wasm instanceof Response) {
      return new Uint8Array(await wasm.arrayBuffer());
    }
    if (wasm instanceof ArrayBuffer) {
      return new Uint8Array(wasm);
    }
    return wasm;
  },

  async readFsCache(key) {
    return prefersIndexedDb()
      ? ((await readIndexedDb(key)) ?? readCacheStorage(key))
      : ((await readCacheStorage(key)) ?? readIndexedDb(key));
  },

  async writeFsCache(key, data) {
    if (prefersIndexedDb()) {
      if (!(await writeIndexedDb(key, data))) await writeCacheStorage(key, data);
    } else if (!(await writeCacheStorage(key, data))) {
      await writeIndexedDb(key, data);
    }
  },

  async withFsCacheLock(key, operation) {
    const existing = cacheLocks.get(key);
    if (existing) {
      await existing;
      return operation();
    }

    const pending = operation();
    cacheLocks.set(key, pending);
    try {
      return await pending;
    } finally {
      cacheLocks.delete(key);
    }
  },

  async readResolvedWasmFromDisk() {
    return undefined;
  },

  async parserInitOptions() {
    return {
      wasmBinary: treeSitterWasmBinary,
    };
  },
};

export type {
  HighlighterRuntimeOptions,
  LoadLanguageOptions,
  SharedRuntimeCache,
  RuntimeLike,
  WasmResolver,
} from "../core/languages.js";

const runtime = createLanguagesModule(browserRuntime);

export function createRuntime(...args: Parameters<typeof runtime.createRuntime>) {
  return runtime.createRuntime(...args);
}
/** {@inheritDoc node.configureWasmResolver} */
export function configureWasmResolver(...args: Parameters<typeof runtime.configureWasmResolver>) {
  return runtime.configureWasmResolver(...args);
}
export function initParser(...args: Parameters<typeof runtime.initParser>) {
  return runtime.initParser(...args);
}
export function registerLanguage(...args: Parameters<typeof runtime.registerLanguage>) {
  return runtime.registerLanguage(...args);
}
export function resolveLanguageId(...args: Parameters<typeof runtime.resolveLanguageId>) {
  return runtime.resolveLanguageId(...args);
}
export function loadLanguage(...args: Parameters<typeof runtime.loadLanguage>) {
  return runtime.loadLanguage(...args);
}
export function loadPlaintext(...args: Parameters<typeof runtime.loadPlaintext>) {
  return runtime.loadPlaintext(...args);
}
export function getLoadedLanguage(...args: Parameters<typeof runtime.getLoadedLanguage>) {
  return runtime.getLoadedLanguage(...args);
}
export function getLoadedLanguageIds(...args: Parameters<typeof runtime.getLoadedLanguageIds>) {
  return runtime.getLoadedLanguageIds(...args);
}
/** {@inheritDoc node.availableLanguages} */
export function availableLanguages(...args: Parameters<typeof runtime.availableLanguages>) {
  return runtime.availableLanguages(...args);
}
export function getDefaultRuntime(...args: Parameters<typeof runtime.getDefaultRuntime>) {
  return runtime.getDefaultRuntime(...args);
}

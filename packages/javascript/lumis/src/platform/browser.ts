import type { RuntimePlatform } from "./runtime.js";
import { createLanguagesModule } from "../core/languages.js";

export const browserRuntimePlatform: RuntimePlatform = {
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

  async readFsCache() {
    return undefined;
  },

  async writeFsCache() {
    // browser runtime does not persist WASM to disk
  },

  async readResolvedWasmFromDisk() {
    return undefined;
  },
};

export type {
  HighlighterRuntimeOptions,
  LoadLanguageOptions,
  SharedRuntimeCache,
  RuntimeLike,
  WasmResolver,
} from "../core/languages.js";

const runtime = createLanguagesModule(browserRuntimePlatform);

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

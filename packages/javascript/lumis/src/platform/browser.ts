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

export const createRuntime = (...args: Parameters<typeof runtime.createRuntime>) =>
  runtime.createRuntime(...args);
/** {@inheritDoc node.configureWasmResolver} */
export const configureWasmResolver = (...args: Parameters<typeof runtime.configureWasmResolver>) =>
  runtime.configureWasmResolver(...args);
export const initParser = (...args: Parameters<typeof runtime.initParser>) =>
  runtime.initParser(...args);
export const registerLanguage = (...args: Parameters<typeof runtime.registerLanguage>) =>
  runtime.registerLanguage(...args);
export const resolveLanguageId = (...args: Parameters<typeof runtime.resolveLanguageId>) =>
  runtime.resolveLanguageId(...args);
export const loadLanguage = (...args: Parameters<typeof runtime.loadLanguage>) =>
  runtime.loadLanguage(...args);
export const loadPlaintext = (...args: Parameters<typeof runtime.loadPlaintext>) =>
  runtime.loadPlaintext(...args);
export const getLoadedLanguage = (...args: Parameters<typeof runtime.getLoadedLanguage>) =>
  runtime.getLoadedLanguage(...args);
export const getLoadedLanguageIds = (...args: Parameters<typeof runtime.getLoadedLanguageIds>) =>
  runtime.getLoadedLanguageIds(...args);
/** {@inheritDoc node.availableLanguages} */
export const availableLanguages = (...args: Parameters<typeof runtime.availableLanguages>) =>
  runtime.availableLanguages(...args);
export const getDefaultRuntime = (...args: Parameters<typeof runtime.getDefaultRuntime>) =>
  runtime.getDefaultRuntime(...args);

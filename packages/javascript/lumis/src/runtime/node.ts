import type { RuntimeEnvironment } from "./runtime.js";
import { createLanguagesModule } from "../core/languages.js";
import type { LanguagePackageResolver, LanguagesModule, WasmResolver } from "../core/languages.js";
import { createNativeLanguagesModule } from "../core/native-languages.js";
import { loadNativeBinding } from "../native-binding.js";
import treeSitterWasmBinary from "../tree-sitter-wasm.js";
import {
  isUrlString,
  readCachedWasm,
  wasmCacheFilename,
  withWasmCacheLock,
  writeCachedWasm,
} from "./node-cache.js";

const nodeFsPromises = "node:fs" + "/promises";
const nodePath = "node:path";
const nodeUrl = "node:url";

export const nodeRuntime: RuntimeEnvironment = {
  async resolveWasm(wasm) {
    if (wasm instanceof URL) {
      if (wasm.protocol === "file:") {
        const { fileURLToPath } = await import(nodeUrl);
        return fileURLToPath(wasm);
      }
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
    return readCachedWasm(key);
  },

  async writeFsCache(key, data) {
    try {
      await writeCachedWasm(key, data);
    } catch {
      // cache write failures are non-fatal
    }
  },

  async withFsCacheLock(key, operation) {
    return withWasmCacheLock(key, operation);
  },

  async readStagedAsset(filename) {
    const root = process.env.LUMIS_WASM_PATH;
    if (!root) return undefined;
    const { join } = await import(nodePath);
    const { readFile } = await import(nodeFsPromises);
    try {
      return new Uint8Array(await readFile(join(root, "parsers", filename)));
    } catch {
      return undefined;
    }
  },

  async readResolvedWasmFromDisk(source) {
    const { isAbsolute } = await import(nodePath);

    if (source instanceof URL) {
      if (source.protocol !== "file:") {
        return undefined;
      }

      const { fileURLToPath } = await import(nodeUrl);
      return new Uint8Array(await (await import(nodeFsPromises)).readFile(fileURLToPath(source)));
    }

    if (source.startsWith("file://")) {
      const { fileURLToPath } = await import(nodeUrl);
      return new Uint8Array(
        await (await import(nodeFsPromises)).readFile(fileURLToPath(new URL(source))),
      );
    }

    if (isUrlString(source)) {
      return undefined;
    }

    const { readFile } = await import(nodeFsPromises);
    try {
      return new Uint8Array(await readFile(source));
    } catch {
      if (!isAbsolute(source)) return undefined;
      throw new Error(`Failed to read parser WASM from ${source}`);
    }
  },

  async parserInitOptions() {
    return {
      wasmBinary: treeSitterWasmBinary,
    };
  },
};

export { wasmCacheFilename };

export type {
  HighlighterRuntimeOptions,
  LoadLanguageOptions,
  SharedRuntimeCache,
  RuntimeLike,
  LanguagePackageResolver,
  WasmResolver,
} from "../core/languages.js";

const binding = loadNativeBinding();

/**
 * Node highlights through the native addon, the same Wasmtime runtime the CLI
 * and the Elixir bindings use, so all three produce identical output from
 * identical input and load parsers the same way.
 *
 * Platforms with no prebuilt addon fall back to `web-tree-sitter`, which the
 * browser uses too. It cannot load a language during the walk that discovers
 * it, so an injected language has to be loaded before the document mentioning
 * it is highlighted.
 */
const runtime: LanguagesModule = binding
  ? createNativeLanguagesModule(binding)
  : createLanguagesModule(nodeRuntime);

export function createRuntime(...args: Parameters<LanguagesModule["createRuntime"]>) {
  return runtime.createRuntime(...args);
}
/**
 * Set a custom WASM resolver for parser binaries. Applies globally.
 *
 * ```ts
 * import { configureWasmResolver } from '@lumis-sh/lumis'
 *
 * configureWasmResolver((_language, wasm) =>
 *   `https://unpkg.com/${wasm.packageName}@${wasm.version}/${wasm.name}.wasm`
 * )
 * ```
 */
export function configureWasmResolver(fn: WasmResolver) {
  return runtime.configureWasmResolver(fn);
}
export function configureLanguagePackageResolver(fn: LanguagePackageResolver) {
  return runtime.configureLanguagePackageResolver(fn);
}
export function initParser(...args: Parameters<LanguagesModule["initParser"]>) {
  return runtime.initParser(...args);
}
export function registerLanguage(...args: Parameters<LanguagesModule["registerLanguage"]>) {
  return runtime.registerLanguage(...args);
}
export function resolveLanguageId(...args: Parameters<LanguagesModule["resolveLanguageId"]>) {
  return runtime.resolveLanguageId(...args);
}
export function loadLanguage(...args: Parameters<LanguagesModule["loadLanguage"]>) {
  return runtime.loadLanguage(...args);
}
export function loadPlaintext(...args: Parameters<LanguagesModule["loadPlaintext"]>) {
  return runtime.loadPlaintext(...args);
}
export function getLoadedLanguage(...args: Parameters<LanguagesModule["getLoadedLanguage"]>) {
  return runtime.getLoadedLanguage(...args);
}
export function getLoadedLanguageIds(...args: Parameters<LanguagesModule["getLoadedLanguageIds"]>) {
  return runtime.getLoadedLanguageIds(...args);
}
/**
 * List all supported languages with their ID, name, aliases, and file extensions.
 *
 * ```ts
 * import { availableLanguages } from '@lumis-sh/lumis'
 * const languages = availableLanguages()
 * // [{ id: 'javascript', name: 'JavaScript', aliases: ['js', 'jsx'], extensions: ['*.js', ...] }, ...]
 * ```
 */
export function availableLanguages(...args: Parameters<LanguagesModule["availableLanguages"]>) {
  return runtime.availableLanguages(...args);
}
export function getDefaultRuntime(...args: Parameters<LanguagesModule["getDefaultRuntime"]>) {
  return runtime.getDefaultRuntime(...args);
}

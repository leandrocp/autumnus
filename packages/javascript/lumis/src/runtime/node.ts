import type { RuntimeEnvironment } from "./runtime.js";
import { createLanguagesModule } from "../core/languages.js";
import type { LanguagesModule, WasmResolver } from "../core/languages.js";
import { createNativeLanguagesModule } from "../core/native-languages.js";
import { loadNativeBinding } from "../native-binding.js";
import treeSitterWasmBinary from "../tree-sitter-wasm.js";

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
    try {
      const { readFile } = await import(nodeFsPromises);
      const { join } = await import(nodePath);
      const filePath = join("node_modules", ".cache", "lumis", key + ".wasm");
      return new Uint8Array(await readFile(filePath));
    } catch {
      return undefined;
    }
  },

  async writeFsCache(key, data) {
    try {
      const { writeFile, mkdir } = await import(nodeFsPromises);
      const { join } = await import(nodePath);
      const cacheDir = join("node_modules", ".cache", "lumis");
      await mkdir(cacheDir, { recursive: true });
      await writeFile(join(cacheDir, key + ".wasm"), data);
    } catch {
      // cache write failures are non-fatal
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

    if (URL.canParse(source)) {
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

export type {
  HighlighterRuntimeOptions,
  LoadLanguageOptions,
  SharedRuntimeCache,
  RuntimeLike,
  WasmResolver,
} from "../core/languages.js";

let runtime: LanguagesModule | undefined;
let configuredResolver: WasmResolver | undefined;

function getRuntime(): LanguagesModule {
  if (runtime) return runtime;

  const binding = loadNativeBinding();
  if (binding) {
    try {
      runtime = createNativeLanguagesModule(nodeRuntime, binding);
    } catch (error) {
      // A present but unloadable addon must never prevent the universal fallback.
      if (process.env.LUMIS_REQUIRE_NATIVE === "1") throw error;
    }
  }
  runtime ??= createLanguagesModule(nodeRuntime);
  if (configuredResolver) runtime.configureWasmResolver(configuredResolver);
  return runtime;
}

export function createRuntime(...args: Parameters<LanguagesModule["createRuntime"]>) {
  return getRuntime().createRuntime(...args);
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
  configuredResolver = fn;
  return getRuntime().configureWasmResolver(fn);
}
export function initParser(...args: Parameters<LanguagesModule["initParser"]>) {
  return getRuntime().initParser(...args);
}
export function registerLanguage(...args: Parameters<LanguagesModule["registerLanguage"]>) {
  return getRuntime().registerLanguage(...args);
}
export function resolveLanguageId(...args: Parameters<LanguagesModule["resolveLanguageId"]>) {
  return getRuntime().resolveLanguageId(...args);
}
export function loadLanguage(...args: Parameters<LanguagesModule["loadLanguage"]>) {
  return getRuntime().loadLanguage(...args);
}
export function loadPlaintext(...args: Parameters<LanguagesModule["loadPlaintext"]>) {
  return getRuntime().loadPlaintext(...args);
}
export function getLoadedLanguage(...args: Parameters<LanguagesModule["getLoadedLanguage"]>) {
  return getRuntime().getLoadedLanguage(...args);
}
export function getLoadedLanguageIds(...args: Parameters<LanguagesModule["getLoadedLanguageIds"]>) {
  return getRuntime().getLoadedLanguageIds(...args);
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
  return getRuntime().availableLanguages(...args);
}
export function getDefaultRuntime(...args: Parameters<LanguagesModule["getDefaultRuntime"]>) {
  return getRuntime().getDefaultRuntime(...args);
}

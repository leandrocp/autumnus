import type { RuntimePlatform } from "./runtime.js";
import { createLanguagesModule } from "../core/languages.js";

export const nodeRuntimePlatform: RuntimePlatform = {
  async resolveWasm(wasm) {
    if (wasm instanceof URL) {
      if (wasm.protocol === "file:") {
        const { fileURLToPath } = await import("node:url");
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
      const { readFile } = await import("node:fs/promises");
      const { join } = await import("node:path");
      const filePath = join("node_modules", ".cache", "lumis", key + ".wasm");
      return new Uint8Array(await readFile(filePath));
    } catch {
      return undefined;
    }
  },

  async writeFsCache(key, data) {
    try {
      const { writeFile, mkdir } = await import("node:fs/promises");
      const { join } = await import("node:path");
      const cacheDir = join("node_modules", ".cache", "lumis");
      await mkdir(cacheDir, { recursive: true });
      await writeFile(join(cacheDir, key + ".wasm"), data);
    } catch {
      // cache write failures are non-fatal
    }
  },

  async readResolvedWasmFromDisk(source) {
    const { isAbsolute } = await import("node:path");

    if (source instanceof URL) {
      if (source.protocol !== "file:") {
        return undefined;
      }

      const { fileURLToPath } = await import("node:url");
      return new Uint8Array(
        await (await import("node:fs/promises")).readFile(fileURLToPath(source)),
      );
    }

    if (source.startsWith("file://")) {
      const { fileURLToPath } = await import("node:url");
      return new Uint8Array(
        await (await import("node:fs/promises")).readFile(fileURLToPath(new URL(source))),
      );
    }

    if (URL.canParse(source) || !isAbsolute(source)) {
      return undefined;
    }

    const { readFile } = await import("node:fs/promises");
    return new Uint8Array(await readFile(source));
  },
};

export type {
  HighlighterRuntimeOptions,
  LoadLanguageOptions,
  SharedRuntimeCache,
  RuntimeLike,
  WasmResolver,
} from "../core/languages.js";

const runtime = createLanguagesModule(nodeRuntimePlatform);

export const createRuntime = (...args: Parameters<typeof runtime.createRuntime>) =>
  runtime.createRuntime(...args);
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
/**
 * List all supported languages with their ID, name, aliases, and file extensions.
 *
 * ```ts
 * import { availableLanguages } from '@lumis-sh/lumis'
 * const langs = availableLanguages()
 * // [{ id: 'javascript', name: 'JavaScript', aliases: ['js', 'jsx'], extensions: ['*.js', ...] }, ...]
 * ```
 */
export const availableLanguages = (...args: Parameters<typeof runtime.availableLanguages>) =>
  runtime.availableLanguages(...args);
export const getDefaultRuntime = (...args: Parameters<typeof runtime.getDefaultRuntime>) =>
  runtime.getDefaultRuntime(...args);

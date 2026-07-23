import type { RuntimeEnvironment } from "./runtime.js";
import { createLanguagesModule } from "../core/languages.js";
import type { LanguagesModule, WasmResolver } from "../core/languages.js";
import treeSitterWasmBinary from "../tree-sitter-wasm.js";

const nodeFsPromises = "node:fs" + "/promises";
const nodePath = "node:path";
const nodeUrl = "node:url";

/** @internal */
export function wasmCacheFilename(key: string): string {
  return `${encodeURIComponent(key)}.wasm`;
}

async function wasmCacheDir(): Promise<string> {
  const { join } = await import(nodePath);
  if (process.env.LUMIS_WASM_CACHE_DIR) return process.env.LUMIS_WASM_CACHE_DIR;
  if (process.env.XDG_CACHE_HOME) return join(process.env.XDG_CACHE_HOME, "lumis", "wasm");
  if (process.platform === "win32" && process.env.LOCALAPPDATA) {
    return join(process.env.LOCALAPPDATA, "lumis", "wasm");
  }
  const { homedir } = await import("node:os");
  return process.platform === "darwin"
    ? join(homedir(), "Library", "Caches", "lumis", "wasm")
    : join(homedir(), ".cache", "lumis", "wasm");
}

function isNodeError(error: unknown, code: string): boolean {
  return error instanceof Error && "code" in error && error.code === code;
}

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
      const filePath = join(await wasmCacheDir(), wasmCacheFilename(key));
      return new Uint8Array(await readFile(filePath));
    } catch {
      return undefined;
    }
  },

  async writeFsCache(key, data) {
    const { join } = await import(nodePath);
    const cacheDir = await wasmCacheDir();
    const filePath = join(cacheDir, wasmCacheFilename(key));
    const temporary = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    try {
      const { writeFile, mkdir, rename, rm } = await import(nodeFsPromises);
      await mkdir(cacheDir, { recursive: true });
      await writeFile(temporary, data, { flag: "wx" });
      await rm(filePath, { force: true });
      await rename(temporary, filePath);
    } catch {
      // cache write failures are non-fatal
    } finally {
      try {
        const { rm } = await import(nodeFsPromises);
        await rm(temporary, { force: true });
      } catch {
        // best-effort temporary cleanup
      }
    }
  },

  async withFsCacheLock(key, operation) {
    const { mkdir, open, rm, stat } = await import(nodeFsPromises);
    const { join } = await import(nodePath);
    const cacheDir = await wasmCacheDir();
    await mkdir(cacheDir, { recursive: true });
    const lockPath = join(cacheDir, `${wasmCacheFilename(key)}.lock`);
    const deadline = Date.now() + 120_000;
    let lock: { close(): Promise<void> } | undefined;

    while (!lock) {
      try {
        lock = await open(lockPath, "wx");
      } catch (error) {
        if (!isNodeError(error, "EEXIST")) return operation();
        try {
          const info = await stat(lockPath);
          if (Date.now() - info.mtimeMs > 300_000) {
            await rm(lockPath, { force: true });
            continue;
          }
        } catch {
          continue;
        }
        if (Date.now() >= deadline) {
          throw new Error(`Timed out waiting for Lumis WASM cache lock: ${lockPath}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
    }

    try {
      return await operation();
    } finally {
      await lock.close();
      await rm(lockPath, { force: true });
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

const runtime: LanguagesModule = createLanguagesModule(nodeRuntime);

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

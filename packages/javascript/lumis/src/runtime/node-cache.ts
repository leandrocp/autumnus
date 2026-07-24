const nodeFsPromises = "node:fs" + "/promises";
const nodePath = "node:path";

/** @internal */
export function isUrlString(source: string): boolean {
  if (/^[a-zA-Z]:/.test(source)) return false;
  try {
    new URL(source);
    return true;
  } catch {
    return false;
  }
}

/** @internal */
export function wasmCacheFilename(key: string): string {
  return `${encodeURIComponent(key)}.wasm`;
}

/** @internal */
export async function wasmCacheDir(): Promise<string> {
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

/** @internal */
export async function wasmCachePath(key: string, directory?: string): Promise<string> {
  const { join } = await import(nodePath);
  return join(directory ?? (await wasmCacheDir()), wasmCacheFilename(key));
}

/** @internal */
export async function readCachedWasm(
  key: string,
  directory?: string,
): Promise<Uint8Array | undefined> {
  try {
    const { readFile } = await import(nodeFsPromises);
    return new Uint8Array(await readFile(await wasmCachePath(key, directory)));
  } catch {
    return undefined;
  }
}

/** @internal */
export async function writeCachedWasm(
  key: string,
  data: Uint8Array,
  directory?: string,
): Promise<string> {
  const resolvedDirectory = directory ?? (await wasmCacheDir());
  const filePath = await wasmCachePath(key, resolvedDirectory);
  const temporary = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    const { writeFile, mkdir, rename, rm } = await import(nodeFsPromises);
    await mkdir(resolvedDirectory, { recursive: true });
    await writeFile(temporary, data, { flag: "wx" });
    try {
      await rename(temporary, filePath);
    } catch (error) {
      if (!isNodeError(error, "EEXIST") && !isNodeError(error, "EPERM")) throw error;
      await rm(filePath, { force: true });
      await rename(temporary, filePath);
    }
    return filePath;
  } finally {
    try {
      const { rm } = await import(nodeFsPromises);
      await rm(temporary, { force: true });
    } catch {
      // best-effort temporary cleanup
    }
  }
}

function isNodeError(error: unknown, code: string): boolean {
  return error instanceof Error && "code" in error && error.code === code;
}

/** @internal */
export async function withWasmCacheLock<T>(
  key: string,
  operation: () => Promise<T>,
  directory?: string,
): Promise<T> {
  const resolvedDirectory = directory ?? (await wasmCacheDir());
  const { mkdir, open, rm, stat } = await import(nodeFsPromises);
  const { join } = await import(nodePath);
  await mkdir(resolvedDirectory, { recursive: true });
  const lockPath = join(resolvedDirectory, `${wasmCacheFilename(key)}.lock`);
  const deadline = Date.now() + 120_000;
  let lock: { close(): Promise<void> } | undefined;

  while (!lock) {
    try {
      lock = await open(lockPath, "wx");
    } catch (error) {
      if (!isNodeError(error, "EEXIST")) throw error;
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
    try {
      await lock.close();
    } finally {
      await rm(lockPath, { force: true });
    }
  }
}

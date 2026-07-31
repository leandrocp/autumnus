import { LOCK_RETRY_MS, LOCK_STALE_AFTER_MS, LOCK_TIMEOUT_MS } from "../cache-timing.js";

const nodeFsPromises = "node:fs" + "/promises";
const nodePath = "node:path";
const nodeOs = "node:os";

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
  const extension = key.startsWith("language-package-") ? "json" : "wasm";
  return `${encodeURIComponent(key)}.${extension}`;
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

interface LockOwner {
  host: string;
  pid: number;
}

/** @internal */
export function lockOwnerIsGone(owner: LockOwner | undefined, host: string): boolean {
  // A pid is only meaningful on the machine that wrote it. Anywhere else, and
  // for an unreadable lock, fall back to the staleness timer.
  if (!owner || owner.host !== host) return false;
  try {
    process.kill(owner.pid, 0);
    return false;
  } catch (error) {
    // EPERM means the process exists but belongs to someone else.
    return !isNodeError(error, "EPERM");
  }
}

async function readLockOwner(lockPath: string): Promise<LockOwner | undefined> {
  const { readFile } = await import(nodeFsPromises);
  try {
    const owner = JSON.parse(await readFile(lockPath, "utf8")) as LockOwner;
    return typeof owner?.host === "string" && typeof owner?.pid === "number" ? owner : undefined;
  } catch {
    return undefined;
  }
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
  const { hostname } = await import(nodeOs);
  await mkdir(resolvedDirectory, { recursive: true });
  const lockPath = join(resolvedDirectory, `${wasmCacheFilename(key)}.lock`);
  const host = hostname();
  const deadline = Date.now() + LOCK_TIMEOUT_MS;
  let lock: { close(): Promise<void>; writeFile(data: string): Promise<void> } | undefined;

  while (!lock) {
    try {
      lock = await open(lockPath, "wx");
      await lock.writeFile(JSON.stringify({ host, pid: process.pid } satisfies LockOwner));
    } catch (error) {
      if (!isNodeError(error, "EEXIST")) throw error;

      if (lockOwnerIsGone(await readLockOwner(lockPath), host)) {
        await rm(lockPath, { force: true });
        continue;
      }

      const age = await stat(lockPath)
        .then((info) => Date.now() - info.mtimeMs)
        .catch(() => 0);
      if (age > LOCK_STALE_AFTER_MS) {
        await rm(lockPath, { force: true });
        continue;
      }

      if (Date.now() >= deadline) {
        throw new Error(`Timed out waiting for Lumis WASM cache lock: ${lockPath}`);
      }
      await new Promise((resolve) => setTimeout(resolve, LOCK_RETRY_MS));
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

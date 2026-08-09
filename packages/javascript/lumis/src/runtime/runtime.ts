import type { WasmRef } from "../types.js";

export interface RuntimeEnvironment {
  resolveWasm(
    wasm: Uint8Array | ArrayBuffer | string | URL | Response,
  ): Promise<Uint8Array | string>;
  readFsCache(key: string): Promise<Uint8Array | undefined>;
  writeFsCache(key: string, data: Uint8Array): Promise<void>;
  withFsCacheLock<T>(key: string, operation: () => Promise<T>): Promise<T>;
  /** Read a file already under `$LUMIS_DATA_DIR/parsers`, where the runtime has one. */
  readStagedAsset?(filename: string): Promise<Uint8Array | undefined>;
  readResolvedWasmFromDisk(source: string | URL): Promise<Uint8Array | undefined>;
  parserInitOptions?(): Promise<Record<string, unknown> | undefined>;
}

export interface RuntimeEnvironmentResolver {
  language: string;
  ref: WasmRef;
}

import type { WasmRef } from "../types.js";

export interface RuntimePlatform {
  resolveWasm(
    wasm: Uint8Array | ArrayBuffer | string | URL | Response,
  ): Promise<Uint8Array | string>;
  readFsCache(key: string): Promise<Uint8Array | undefined>;
  writeFsCache(key: string, data: Uint8Array): Promise<void>;
  readResolvedWasmFromDisk(source: string | URL): Promise<Uint8Array | undefined>;
}

export interface RuntimePlatformResolver {
  language: string;
  ref: WasmRef;
}

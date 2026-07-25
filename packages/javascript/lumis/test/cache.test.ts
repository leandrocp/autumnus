import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cacheLanguages } from "../src/cache.js";
import { cacheKey } from "../src/core/languages.js";
import { wasmCacheFilename } from "../src/runtime/node-cache.js";
import type { WasmRef } from "../src/types.js";
import diff from "../langs/diff.js";
import { ensureLocalParserWasm } from "./wasm.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  const { rm } = await import("node:fs/promises");
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
  vi.restoreAllMocks();
});

async function temporaryDirectory(): Promise<string> {
  const { mkdtemp } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const directory = await mkdtemp(join(tmpdir(), "lumis-js-cache-"));
  temporaryDirectories.push(directory);
  return directory;
}

describe("cacheLanguages", () => {
  it("persists verified parsers and reuses them without resolving again", async () => {
    const directory = await temporaryDirectory();
    const resolver = (_language: string, wasm: { name: string }) =>
      ensureLocalParserWasm(_language, wasm.name);

    const first = await cacheLanguages(["diff", "plaintext"], { directory, resolver });
    expect(first).toHaveLength(1);
    expect(first[0]).toMatchObject({ language: "diff", downloaded: true });

    const unavailable = vi.fn(() => {
      throw new Error("network resolver must not run");
    });
    const second = await cacheLanguages(["diff"], { directory, resolver: unavailable });

    expect(second[0]).toMatchObject({ language: "diff", downloaded: false });
    expect(unavailable).not.toHaveBeenCalled();
    expect(readFileSync(second[0]!.path).byteLength).toBe((diff.wasm as WasmRef).size);
  });

  it("replaces corrupt persistent bytes", async () => {
    const directory = await temporaryDirectory();
    const ref = diff.wasm as WasmRef;
    const key = cacheKey(ref);
    const cacheFile = join(directory, wasmCacheFilename(key));
    writeFileSync(cacheFile, "corrupt");

    const result = await cacheLanguages(["diff"], {
      directory,
      resolver: (_language, wasm) => ensureLocalParserWasm(_language, wasm.name),
    });

    expect(result[0]).toMatchObject({ downloaded: true });
    expect(readFileSync(cacheFile).byteLength).toBe(ref.size);
  });

  it("loads a cached parser after a runtime restart in offline mode", async () => {
    const directory = await temporaryDirectory();
    await cacheLanguages(["diff"], {
      directory,
      resolver: (_language, wasm) => ensureLocalParserWasm(_language, wasm.name),
    });

    const previousDirectory = process.env.LUMIS_WASM_CACHE_DIR;
    const previousOffline = process.env.LUMIS_WASM_OFFLINE;
    process.env.LUMIS_WASM_CACHE_DIR = directory;
    process.env.LUMIS_WASM_OFFLINE = "1";
    vi.resetModules();
    const network = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network disabled"));

    try {
      const { createHighlighter } = await import("../src/index.js");
      const { default: restartedDiff } = await import("../langs/diff.js");
      const highlighter = await createHighlighter({ languages: [restartedDiff] });

      expect(highlighter.languages).toContain("diff");
      expect(network).not.toHaveBeenCalled();
    } finally {
      if (previousDirectory === undefined) delete process.env.LUMIS_WASM_CACHE_DIR;
      else process.env.LUMIS_WASM_CACHE_DIR = previousDirectory;
      if (previousOffline === undefined) delete process.env.LUMIS_WASM_OFFLINE;
      else process.env.LUMIS_WASM_OFFLINE = previousOffline;
    }
  });
});

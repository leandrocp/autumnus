import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cacheLanguages } from "../src/cache.js";
import { cacheKey } from "../src/core/languages.js";
import { wasmCacheFilename } from "../src/runtime/node-cache.js";
import {
  ensureLocalParserWasm,
  localLanguagePackageMetadata,
  localLanguagePackageResolver,
} from "./wasm.js";

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

    const first = await cacheLanguages(["diff", "plaintext"], {
      directory,
      resolver,
      languagePackageResolver: localLanguagePackageResolver,
    });
    expect(first).toHaveLength(1);
    expect(first[0]).toMatchObject({ language: "diff", downloaded: true });

    const unavailable = vi.fn(() => {
      throw new Error("network resolver must not run");
    });
    const second = await cacheLanguages(["diff"], {
      directory,
      resolver: unavailable,
      languagePackageResolver: localLanguagePackageResolver,
    });

    expect(second[0]).toMatchObject({ language: "diff", downloaded: false });
    expect(unavailable).not.toHaveBeenCalled();
    expect(readFileSync(second[0]!.path).byteLength).toBeGreaterThan(0);
  });

  it("replaces corrupt persistent bytes", async () => {
    const directory = await temporaryDirectory();
    const packageMetadata = localLanguagePackageMetadata("@lumis-sh/wasm-diff");
    const ref = {
      packageName: packageMetadata.packageName,
      name: packageMetadata.parser.name,
      version: packageMetadata.version,
      sha256: packageMetadata.parser.sha256,
      size: packageMetadata.parser.size,
    };
    const key = cacheKey(ref);
    const cacheFile = join(directory, wasmCacheFilename(key));
    writeFileSync(cacheFile, "corrupt");

    const result = await cacheLanguages(["diff"], {
      directory,
      resolver: (_language, wasm) => ensureLocalParserWasm(_language, wasm.name),
      languagePackageResolver: localLanguagePackageResolver,
    });

    expect(result[0]).toMatchObject({ downloaded: true });
    expect(readFileSync(cacheFile).byteLength).toBe(ref.size);
  });

  it("loads a cached parser after a runtime restart without the network", async () => {
    const directory = await temporaryDirectory();
    await cacheLanguages(["diff"], {
      directory,
      resolver: (_language, wasm) => ensureLocalParserWasm(_language, wasm.name),
      languagePackageResolver: localLanguagePackageResolver,
    });

    const previousDirectory = process.env.LUMIS_WASM_CACHE_DIR;
    process.env.LUMIS_WASM_CACHE_DIR = directory;
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
    }
  });
});

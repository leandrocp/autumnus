import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cacheLanguages } from "../src/cache.js";
import { cacheKey } from "../src/core/languages.js";
import { wasmCachePath } from "../src/runtime/node-cache.js";
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
    const cacheFile = await wasmCachePath(key, directory);
    mkdirSync(dirname(cacheFile), { recursive: true });
    writeFileSync(cacheFile, "corrupt");

    const result = await cacheLanguages(["diff"], {
      directory,
      resolver: (_language, wasm) => ensureLocalParserWasm(_language, wasm.name),
      languagePackageResolver: localLanguagePackageResolver,
    });

    expect(result[0]).toMatchObject({ downloaded: true });
    expect(readFileSync(cacheFile).byteLength).toBe(ref.size);
  });

  // A real child process, not `vi.resetModules()`. The native addon builds its
  // store once per process, so re-importing the JavaScript is not a restart for
  // it, and the assertion would pass for the wrong reason.
  it("loads a cached parser after a runtime restart without the network", async () => {
    const directory = await temporaryDirectory();
    await cacheLanguages(["diff"], {
      directory,
      resolver: (_language, wasm) => ensureLocalParserWasm(_language, wasm.name),
      languagePackageResolver: localLanguagePackageResolver,
    });

    const script = `
      globalThis.fetch = () => { throw new Error("network disabled"); };
      const { createHighlighter } = await import("./dist/index.js");
      const { default: diff } = await import("./dist/langs/diff.js");
      const highlighter = await createHighlighter({ languages: [diff] });
      if (!highlighter.languages.includes("diff")) throw new Error("diff was not loaded");
      console.log("ok");
    `;

    const { execFileSync } = await import("node:child_process");
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", script], {
      cwd: new URL("..", import.meta.url).pathname,
      env: {
        ...process.env,
        LUMIS_DATA_DIR: directory,
      },
      encoding: "utf8",
    });

    expect(output).toContain("ok");
  }, 60_000);
});

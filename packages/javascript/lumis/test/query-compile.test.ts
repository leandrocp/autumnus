import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join, parse } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { Language as TSLanguage, Parser, Query } from "web-tree-sitter";

import { bundledLanguages } from "../bundles/full.js";

const bundleRequire = createRequire(
  createRequire(import.meta.url).resolve("@lumis-sh/wasm-bundle-full"),
);

async function initParser(): Promise<void> {
  await Parser.init();
}

function resolveWasmPath(packageName: string, wasmName: string): string | undefined {
  try {
    return bundleRequire.resolve(`${packageName}/${wasmName}.wasm`);
  } catch {
    return undefined;
  }
}

async function compileQueries(
  grammar: TSLanguage,
  lang: { highlights: string; injections?: string; locals?: string },
): Promise<void> {
  expect(() => new Query(grammar, lang.highlights)).not.toThrow();
  if (lang.injections) {
    expect(() => new Query(grammar, lang.injections!)).not.toThrow();
  }
  if (lang.locals) {
    expect(() => new Query(grammar, lang.locals!)).not.toThrow();
  }
}

// Guards against grammar/query drift: for each bundled language, load the
// published WASM grammar and compile the generated query strings against it.
// This is the exact failure mode that broke the website's Gleam playground
// (QueryError "Bad node name 'bit_string_segment_option'") — the repo's query
// referenced a node type the shipped grammar didn't have.
describe("bundled language queries compile against their shipped WASM", async () => {
  await initParser();

  const entries = Object.entries(bundledLanguages);

  describe.each(entries)("%s", (id, lazy) => {
    it("compiles highlights/injections/locals", async () => {
      const lang = await lazy();
      const wasmPath = resolveWasmPath(lang.wasm.packageName, lang.wasm.name);

      if (!wasmPath || !existsSync(wasmPath)) {
        return;
      }

      const bytes = readFileSync(wasmPath);
      const grammar = await TSLanguage.load(bytes);
      await compileQueries(grammar, lang);
    }, 30_000);
  });
});

// Same test but against the built dist/ output (what actually gets published).
// Catches drift where source queries are correct but the last npm publish
// shipped stale query strings — the exact pattern that broke Prisma on the
// website while the regression test above passed.
const distLangsDir = fileURLToPath(new URL("../dist/langs/", import.meta.url));

describe.skipIf(!existsSync(distLangsDir))(
  "dist/ language queries compile against their shipped WASM",
  async () => {
    await initParser();

    const distLangFiles = existsSync(distLangsDir)
      ? readdirSync(distLangsDir)
          .filter((f) => f.endsWith(".js") && !f.endsWith(".cjs"))
          .map((f) => parse(f).name)
      : [];

    describe.each(distLangFiles)("%s (dist)", (id) => {
      it("compiles highlights/injections/locals", async () => {
        const mod = await import(join(distLangsDir, `${id}.js`));
        const lang = mod.default as {
          highlights: string;
          injections?: string;
          locals?: string;
          wasm: { packageName: string; name: string };
        };

        const wasmPath = resolveWasmPath(lang.wasm.packageName, lang.wasm.name);
        if (!wasmPath || !existsSync(wasmPath)) {
          return;
        }

        const bytes = readFileSync(wasmPath);
        const grammar = await TSLanguage.load(bytes);
        await compileQueries(grammar, lang);
      }, 30_000);
    });
  },
);

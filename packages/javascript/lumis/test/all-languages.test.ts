import { existsSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join, parse } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import { availableLanguages, createHighlighter } from "../src/index.js";
import type { Language } from "../src/types.js";

type LanguageModule = {
  id: string;
  aliases?: string[];
  highlights?: string;
};

const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));
const langsRoot = fileURLToPath(new URL("../langs/", import.meta.url));
const samplesDir = join(repoRoot, "samples");
const resolveFullBundleDependency = createRequire(
  new URL("../../wasm-bundle-full/package.json", import.meta.url),
).resolve;

const sampleBaseNameOverrides = new Map<string, string>([["ocaml_interface", "ocamlinterface"]]);

const sampleFiles = new Map(
  readdirRecursive(samplesDir).map(
    (filePath) => [parse(filePath).name.toLowerCase(), filePath] as const,
  ),
);

function readdirRecursive(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    return statSync(fullPath).isDirectory() ? readdirRecursive(fullPath) : [fullPath];
  });
}

function listSourceLanguageIds(): string[] {
  return readdirSync(langsRoot)
    .filter((entry) => entry.endsWith(".ts"))
    .map((entry) => parse(entry).name)
    .sort((a, b) => a.localeCompare(b));
}

async function loadLanguageModule(id: string): Promise<LanguageModule> {
  const moduleUrl = pathToFileURL(join(langsRoot, `${id}.ts`)).href;
  const mod = await import(moduleUrl);
  return mod.default as LanguageModule;
}

function resolveSamplePath(language: LanguageModule): string | undefined {
  const candidates = [
    language.id,
    sampleBaseNameOverrides.get(language.id),
    ...(language.aliases ?? []),
  ]
    .filter((value): value is string => value != null)
    .map((value) => value.toLowerCase());

  for (const candidate of candidates) {
    const samplePath = sampleFiles.get(candidate);
    if (samplePath) return samplePath;
  }
}

const sourceLanguageIds = listSourceLanguageIds();
const availableLanguageIds = availableLanguages()
  .map((language) => language.id)
  .sort((a, b) => a.localeCompare(b));

const languageFixtures = await Promise.all(
  sourceLanguageIds.map(async (id) => {
    const language = await loadLanguageModule(id);
    const samplePath = resolveSamplePath(language);

    if (!samplePath) {
      throw new Error(`No sample file found for language "${id}"`);
    }

    return { id, language, samplePath };
  }),
);

describe.skipIf(languageFixtures.length === 0)("all languages", () => {
  it("matches source modules to available languages", () => {
    expect(sourceLanguageIds).toEqual(availableLanguageIds);
  });

  it.each(languageFixtures)(
    "loads $id and has a sample fixture",
    async ({ id, language, samplePath }) => {
      expect(language.id).toBe(id);
      expect(typeof language.highlights).toBe("string");
      expect(existsSync(samplePath)).toBe(true);
    },
  );

  it.runIf(process.env.LUMIS_REQUIRE_NATIVE === "1")(
    "uses shared queries and explicit grammar names with the native runtime",
    async () => {
      const highlighter = await createHighlighter();
      const nativeRegressionLanguages = new Set(["csharp", "elm", "nushell", "protobuf"]);

      for (const { language } of languageFixtures.filter(({ id }) =>
        nativeRegressionLanguages.has(id),
      )) {
        const definition = language as Language;
        const wasm = definition.wasm;
        if (typeof wasm !== "object" || wasm === null || !("packageName" in wasm)) {
          throw new Error(`Expected a package reference for ${definition.id}`);
        }

        const localWasm = pathToFileURL(
          resolveFullBundleDependency(`${wasm.packageName}/${wasm.name}.wasm`),
        );
        await highlighter.loadLanguage({ ...definition, wasm: localWasm });
      }
    },
    60_000,
  );
});

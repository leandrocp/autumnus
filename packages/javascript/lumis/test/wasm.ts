import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { configureWasmResolver } from "../src/index.js";

const fixturesRoot = new URL("./fixtures/wasm/", import.meta.url);

export function ensureLocalWasm(language: string): URL {
  return ensureLocalParserWasm(language, `tree-sitter-${language}`);
}

export function ensureLocalParserWasm(language: string, parser: string): URL {
  const wasmUrl = new URL(`${parser}.wasm`, fixturesRoot);

  if (!existsSync(fileURLToPath(wasmUrl))) {
    throw new Error(`Missing committed test WASM for ${language} at ${fileURLToPath(wasmUrl)}`);
  }

  return wasmUrl;
}

export function configureLocalWasmResolver(langs: string[]): void {
  for (const language of langs) {
    ensureLocalWasm(language);
  }

  configureWasmResolver((_language, wasm) => new URL(`${wasm.name}.wasm`, fixturesRoot));
}

export function ensureLocalParserWasmDataUrl(language: string, parser: string): string {
  const wasmUrl = ensureLocalParserWasm(language, parser);
  const bytes = readFileSync(fileURLToPath(wasmUrl));
  return `data:application/wasm;base64,${bytes.toString("base64")}`;
}

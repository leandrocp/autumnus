import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { configureWasmResolver } from "../src/index.js";

const repoRoot = new URL("../../../../", import.meta.url);

export function ensureLocalWasm(language: string): URL {
  return ensureLocalParserWasm(language, `tree-sitter-${language}`);
}

export function ensureLocalParserWasm(language: string, parser: string): URL {
  const wasmUrl = new URL(`tmp/wasms/${parser}.wasm`, repoRoot);

  if (!existsSync(fileURLToPath(wasmUrl))) {
    execFileSync("cargo", ["run", "-p", "dev", "--", "build-wasm", language], {
      cwd: fileURLToPath(repoRoot),
      stdio: "pipe",
    });
  }

  return wasmUrl;
}

export function configureLocalWasmResolver(langs: string[]): void {
  for (const language of langs) {
    ensureLocalWasm(language);
  }

  configureWasmResolver((_language, wasm) => new URL(`tmp/wasms/${wasm.name}.wasm`, repoRoot));
}

export function ensureLocalParserWasmDataUrl(language: string, parser: string): string {
  const wasmUrl = ensureLocalParserWasm(language, parser);
  const bytes = readFileSync(fileURLToPath(wasmUrl));
  return `data:application/wasm;base64,${bytes.toString("base64")}`;
}

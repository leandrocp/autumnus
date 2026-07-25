import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseToml } from "smol-toml";
import { describe, expect, it } from "vitest";
import { Language as TSLanguage, Parser, Query } from "web-tree-sitter";

import { bundledLanguages } from "../bundles/full.js";

const bundleRequire = createRequire(
  createRequire(import.meta.url).resolve("@lumis-sh/wasm-bundle-full"),
);
const workspaceRoot = fileURLToPath(new URL("../../../..", import.meta.url));
const languagesToml = parseToml(readFileSync(join(workspaceRoot, "languages.toml"), "utf8")) as {
  parsers?: Record<
    string,
    {
      rev?: string;
      wasm_rev?: string;
      wasm_name?: string;
      query_name?: string;
    }
  >;
};

function resolveWasmPath(packageName: string, wasmName: string): string | undefined {
  try {
    return bundleRequire.resolve(`${packageName}/${wasmName}.wasm`);
  } catch {
    return undefined;
  }
}

function installedWasmMatchesParserRevision(wasmPath: string, expectedRevision?: string): boolean {
  if (!expectedRevision) return true;
  const packageJson = JSON.parse(readFileSync(join(dirname(wasmPath), "package.json"), "utf8")) as {
    lumis?: { rev?: string };
  };
  return packageJson.lumis?.rev === expectedRevision;
}

function readQuery(queryName: string, kind: string): string {
  const path = join(workspaceRoot, "queries/processed", queryName, `${kind}.scm`);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function compileQueries(grammar: TSLanguage, id: string, queryName: string): void {
  const highlights = readQuery(queryName, "highlights");
  const injections = readQuery(queryName, "injections");
  const locals = readQuery(queryName, "locals");
  if (highlights) expect(() => new Query(grammar, highlights), id).not.toThrow();
  if (injections) expect(() => new Query(grammar, injections)).not.toThrow();
  if (locals) expect(() => new Query(grammar, locals)).not.toThrow();
}

describe("processed queries compile against their matching published WASM", async () => {
  await Parser.init();

  const entries = Object.entries(bundledLanguages).filter(([id]) => id !== "plaintext");

  describe.each(entries)("%s", (id, lazy) => {
    it("compiles highlights, injections, and locals", async () => {
      const language = await lazy();
      const parser = languagesToml.parsers?.[id];
      if (!parser || !language.packageName) return;

      const wasmName = parser.wasm_name ?? `tree-sitter-${id}`;
      const wasmPath = resolveWasmPath(language.packageName, wasmName);
      if (!wasmPath || !existsSync(wasmPath)) return;
      if (!installedWasmMatchesParserRevision(wasmPath, parser.wasm_rev ?? parser.rev)) {
        return;
      }

      const grammar = await TSLanguage.load(readFileSync(wasmPath));
      compileQueries(grammar, id, parser.query_name ?? id);
    }, 30_000);
  });
});

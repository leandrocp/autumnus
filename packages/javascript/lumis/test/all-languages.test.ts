import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { join, parse } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

type Language = {
  id: string;
  aliases?: string[];
  wasm?: {
    packageName: string;
    name: string;
    version: string;
  };
};

const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));
const distRoot = fileURLToPath(new URL("../dist/", import.meta.url));
const samplesDir = join(repoRoot, "samples");
const npmCacheDir = execFileSync("npm", ["config", "get", "cache"], {
  cwd: repoRoot,
  encoding: "utf8",
}).trim();
const wasmCacheDir = join(repoRoot, "tmp", "npm-wasm-cache");

const sampleBaseNameOverrides = new Map<string, string>([
  ["ocaml_interface", "ocamlinterface"],
]);

const sampleFiles = new Map(
  readdirRecursive(samplesDir).map((filePath) => [parse(filePath).name.toLowerCase(), filePath] as const),
);

function readdirRecursive(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    return statSync(fullPath).isDirectory() ? readdirRecursive(fullPath) : [fullPath];
  });
}

function listDistLanguageIds(): string[] {
  return readdirSync(join(distRoot, "langs"))
    .filter((entry) => entry.endsWith(".js"))
    .map((entry) => parse(entry).name)
    .sort((a, b) => a.localeCompare(b));
}

async function loadLanguageModule(id: string): Promise<Language> {
  const moduleUrl = pathToFileURL(join(distRoot, "langs", `${id}.js`)).href;
  const mod = await import(moduleUrl);
  return mod.default as Language;
}

function resolveSamplePath(language: Language): string | undefined {
  const candidates = [language.id, sampleBaseNameOverrides.get(language.id), ...(language.aliases ?? [])]
    .filter((value): value is string => value != null)
    .map((value) => value.toLowerCase());

  for (const candidate of candidates) {
    const samplePath = sampleFiles.get(candidate);
    if (samplePath) return samplePath;
  }
}

function sanitizePackageName(packageName: string): string {
  return packageName.replace(/^@/, "").replaceAll("/", "-");
}

function ensureCachedWasm(wasm: NonNullable<Language["wasm"]>): string {
  const packageDir = join(wasmCacheDir, `${sanitizePackageName(wasm.packageName)}@${wasm.version}`);
  const wasmPath = join(packageDir, "package", `${wasm.name}.wasm`);

  if (existsSync(wasmPath)) return wasmPath;

  mkdirSync(packageDir, { recursive: true });

  const packageSpec = `${wasm.packageName}@${wasm.version}`;
  const tarballName = execFileSync(
    "npm",
    ["pack", packageSpec, "--cache", npmCacheDir, "--offline", "--silent"],
    {
      cwd: packageDir,
      encoding: "utf8",
    },
  )
    .trim()
    .split(/\r?\n/)
    .at(-1);

  if (!tarballName) {
    throw new Error(`Failed to resolve ${packageSpec} from npm cache`);
  }

  execFileSync("tar", ["-xzf", tarballName], { cwd: packageDir, stdio: "inherit" });
  rmSync(join(packageDir, tarballName), { force: true });

  if (!existsSync(wasmPath)) {
    throw new Error(`Expected ${wasmPath} in cached package ${packageSpec}`);
  }

  return wasmPath;
}

const selectedLanguageIds = listDistLanguageIds();
const wasmPaths = new Map<string, string>();

const languageFixtures = (
  await Promise.all(
    selectedLanguageIds.map(async (id) => {
      const language = await loadLanguageModule(id);
      const samplePath = resolveSamplePath(language);

      if (!samplePath) {
        throw new Error(`No sample file found for language \"${id}\"`);
      }

      if (!language.wasm) {
        if (id === "plaintext") return null;
        throw new Error(`Language \"${id}\" has no WasmRef`);
      }

      return { id, language, samplePath };
    }),
  )
).filter((fixture): fixture is { id: string; language: Language; samplePath: string } => fixture !== null);

mkdirSync(wasmCacheDir, { recursive: true });

const { configureWasmResolver, highlight } = await import(pathToFileURL(join(distRoot, "index.js")).href);
const { htmlLinked } = await import(pathToFileURL(join(distRoot, "formatters.js")).href);

configureWasmResolver((_language: string, wasm: NonNullable<Language["wasm"]>) => {
  let wasmPath = wasmPaths.get(wasm.name);
  if (!wasmPath) {
    wasmPath = ensureCachedWasm(wasm);
    wasmPaths.set(wasm.name, wasmPath);
  }
  return wasmPath;
});

describe.skipIf(languageFixtures.length === 0)("all languages", () => {
  it.each(languageFixtures)("loads $id and highlights its sample", async ({ id, language, samplePath }) => {
    const code = readFileSync(samplePath, "utf8");

    const html = await highlight(code, htmlLinked({ language }));

    expect(html).toContain(`language-${id}`);
    expect(html).toContain("<span");
  }, 30_000);
});

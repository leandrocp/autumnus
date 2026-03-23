import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { configureWasmResolver, highlight } from "../src/index.js";
import { htmlInline } from "../src/formatters.js";
import type { Language, Theme } from "../src/types.js";
import dracula from "../../themes/dist/json/dracula.json";

const theme: Theme = dracula;
const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const samplesDir = join(repoRoot, "samples");
const wasmDir = join(repoRoot, "tmp", "wasms");
const python3 = resolvePython3();

const sampleBaseNameOverrides = new Map<string, string>([
  ["ocaml_interface", "ocamlinterface"],
]);

const sampleFiles = new Map(
  readdirSync(samplesDir)
    .filter((name) => name !== "README.md" && name !== "LICENSE.md")
    .map((name) => [basename(name, extname(name)), join(samplesDir, name)]),
);
const bundles = Object.values(
  import.meta.glob<Language>("../langs/*.ts", {
    eager: true,
    import: "default",
  }),
)
  .sort((a, b) => a.id.localeCompare(b.id));

const bundlesWithSamples = bundles.map((bundle) => {
  const samplePath = resolveSamplePath(bundle);
  return {
    bundle,
    samplePath,
  };
});

function resolvePython3(): string {
  const candidates = [
    process.env.PYTHON,
    process.env.EMSDK_PYTHON,
    "/opt/homebrew/bin/python3",
    "/usr/local/bin/python3",
    execFileSync("/bin/sh", ["-c", "command -v python3 || true"], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim(),
  ].filter((value): value is string => value != null && value.length > 0);

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;

    try {
      const version = execFileSync(candidate, [
        "-c",
        "import sys; print('.'.join(map(str, sys.version_info[:3])))",
      ], {
        cwd: repoRoot,
        encoding: "utf8",
      }).trim();

      const [major, minor] = version.split(".").map((part) => Number(part));
      if (major > 3 || (major === 3 && minor >= 10)) {
        return candidate;
      }
    } catch {
      // try the next interpreter candidate
    }
  }

  throw new Error("Python 3.10+ is required for local WASM build tests");
}

function resolveSamplePath(bundle: Language): string {
  const candidates = [
    bundle.id,
    sampleBaseNameOverrides.get(bundle.id),
    ...bundle.aliases,
  ].filter((value): value is string => value != null);

  for (const candidate of candidates) {
    const samplePath = sampleFiles.get(candidate);
    if (samplePath) {
      return samplePath;
    }
  }

  throw new Error(`No sample found for language "${bundle.id}"`);
}

function ensureLocalWasm(bundle: Language): void {
  const wasmPath = join(wasmDir, `${bundle.wasm.name}.wasm`);
  const versionPath = join(wasmDir, `${bundle.wasm.name}.version`);

  if (existsSync(wasmPath)) {
    if (existsSync(versionPath)) {
      const currentVersion = readFileSync(versionPath, "utf8").trim();
      if (currentVersion === bundle.wasm.version) return;
    } else {
      writeFileSync(versionPath, bundle.wasm.version);
      return;
    }
  }

  rmSync(wasmPath, { force: true });
  rmSync(versionPath, { force: true });

  execFileSync("cargo", ["run", "-p", "dev", "--", "build-wasm", bundle.id], {
    cwd: repoRoot,
    env: {
      ...process.env,
      PATH: `${dirname(python3)}:${process.env.PATH ?? ""}`,
      EMSDK_PYTHON: python3,
      PYTHON: python3,
    },
    stdio: "inherit",
  });

  if (!existsSync(wasmPath)) {
    throw new Error(`Failed to build ${bundle.id} WASM at ${wasmPath}`);
  }

  writeFileSync(versionPath, bundle.wasm.version);
}

beforeAll(() => {
  const seen = new Set<string>();
  for (const { bundle } of bundlesWithSamples) {
    if (seen.has(bundle.wasm.name)) continue;
    seen.add(bundle.wasm.name);
    ensureLocalWasm(bundle);
  }

  configureWasmResolver((_lang, wasm) => join(wasmDir, `${wasm.name}.wasm`));
}, 600_000);

describe.sequential("all language bundles", () => {
  it.each(bundlesWithSamples)(
    'loads parser, queries, and highlights the sample for "$bundle.id"',
    async ({ bundle, samplePath }) => {
      const source = readFileSync(samplePath, "utf8");

      const output = await highlight(
        source,
        htmlInline({
          language: bundle,
          theme,
        }),
      );

      expect(output).toContain("<pre");
      expect(output).toContain(`language-${bundle.id}`);
    },
    30_000,
  );
});

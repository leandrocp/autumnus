#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { copyFile, mkdir, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const cacheRoot = resolve(repoDir, "target/benchmarks/cli");
const dataDir = resolve(cacheRoot, "data");
const xdgCacheDir = resolve(cacheRoot, "xdg-cache");
const benchmarkRequire = createRequire(resolve(benchmarksDir, "javascript/package.json"));
const shim = benchmarkRequire.resolve("@lumis-sh/cli-benchmark/bin/lumis");

await rm(cacheRoot, { recursive: true, force: true });
await mkdir(resolve(dataDir, "parsers"), { recursive: true });
await mkdir(xdgCacheDir, { recursive: true });

const manifest = JSON.parse(
  await readFile(resolve(repoDir, "target/benchmarks/fixtures/scenarios.json"), "utf8"),
);
const languages = [
  ...new Set(manifest.scenarios.flatMap(({ files }) => files.map(({ language }) => language))),
];

for (const language of languages) {
  const wasmPath = benchmarkRequire.resolve(
    `@lumis-sh/wasm-${language}/tree-sitter-${language}.wasm`,
  );
  await copyFile(wasmPath, resolve(dataDir, "parsers", `tree-sitter-${language}.wasm`));
}

const env = {
  ...process.env,
  XDG_CACHE_HOME: xdgCacheDir,
  LUMIS_DATA_DIR: dataDir,
  LUMIS_CONFIG: resolve(cacheRoot, "missing-config.toml"),
};
const fixtures = new Map();
for (const scenario of manifest.scenarios) {
  for (const file of scenario.files) fixtures.set(file.language, file);
}
for (const file of fixtures.values()) {
  const result = spawnSync(
    shim,
    [
      "--data-dir",
      dataDir,
      "highlight",
      "--language",
      file.language,
      "--formatter",
      "terminal",
      "--theme",
      "github_dark",
      resolve(repoDir, file.path),
    ],
    { cwd: repoDir, env, encoding: "buffer", maxBuffer: 128 * 1024 * 1024 },
  );
  if (result.status !== 0 || result.stdout.length === 0) {
    throw new Error(`failed to prepare Lumis CLI for ${file.language}: ${result.stderr}`);
  }
}

console.log(JSON.stringify({ dataDir, languages }));

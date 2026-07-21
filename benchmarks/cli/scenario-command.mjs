#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const benchmarkRequire = createRequire(resolve(benchmarksDir, "javascript/package.json"));
const implementation = process.argv[2];
const scenarioId = process.argv[3];
const cacheRoot = resolve(repoDir, "target/benchmarks/cli");
const dataDir = resolve(cacheRoot, "data");
const shim = benchmarkRequire.resolve("@lumis-sh/cli-benchmark/bin/lumis");
const manifest = JSON.parse(
  readFileSync(resolve(repoDir, "target/benchmarks/fixtures/scenarios.json"), "utf8"),
);
const scenario = manifest.scenarios.find(({ id }) => id === scenarioId);

if (!scenario) throw new Error(`unknown benchmark scenario: ${scenarioId}`);
if (!new Set(["lumis-cli", "bat"]).has(implementation)) {
  throw new Error(`unknown CLI benchmark implementation: ${implementation}`);
}

const env = {
  ...process.env,
  XDG_CACHE_HOME: resolve(cacheRoot, "xdg-cache"),
  LUMIS_DATA_DIR: dataDir,
  LUMIS_CONFIG: resolve(cacheRoot, "missing-config.toml"),
  BAT_OPTS: "",
  BAT_PAGER: "cat",
  PAGER: "cat",
  CLICOLOR_FORCE: "1",
};
delete env.NO_COLOR;

let outputBytes = 0;
for (const file of scenario.files) {
  const path = resolve(repoDir, file.path);
  const command = implementation === "lumis-cli" ? shim : findBat();
  const args =
    implementation === "lumis-cli"
      ? [
          "--data-dir",
          dataDir,
          "highlight",
          "--language",
          file.language,
          "--formatter",
          "terminal",
          "--theme",
          "github_dark",
          path,
        ]
      : [
          "--no-config",
          "--paging=never",
          "--style=plain",
          "--color=always",
          `--language=${file.syntax}`,
          "--theme=Monokai Extended",
          path,
        ];
  const result = spawnSync(command, args, {
    cwd: repoDir,
    env,
    encoding: "buffer",
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`${implementation} failed for ${file.path}: ${result.stderr}`);
  }
  if (result.stdout.length <= file.bytes) {
    throw new Error(`${implementation} did not highlight ${file.path}`);
  }
  outputBytes += result.stdout.length;
}

console.log(
  JSON.stringify({
    implementation,
    scenario: scenario.id,
    inputBytes: scenario.inputBytes,
    outputBytes,
    fileCount: scenario.fileCount,
    languageCount: scenario.languageCount,
  }),
);

function findBat() {
  for (const candidate of ["bat", "batcat"]) {
    const result = spawnSync(candidate, ["--version"], { stdio: "ignore" });
    if (!result.error && result.status === 0) return candidate;
  }
  throw new Error("bat is required");
}

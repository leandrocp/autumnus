#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const benchmarkRequire = createRequire(resolve(benchmarksDir, "javascript/package.json"));
const outputDir = resolve(
  process.env.BENCH_OUTPUT_DIR ?? resolve(repoDir, "target/benchmarks/runs/current/cli"),
);
const commandScript = resolve(benchmarksDir, "cli/scenario-command.mjs");
const cacheRoot = resolve(repoDir, "target/benchmarks/cli");
const dataDir = resolve(cacheRoot, "data");
const shim = benchmarkRequire.resolve("@lumis-sh/cli-benchmark/bin/lumis");
const bat = findBat();
const manifest = JSON.parse(
  await readFile(resolve(repoDir, "target/benchmarks/fixtures/scenarios.json"), "utf8"),
);
const metadata = [];
const benchmarkEnv = {
  ...process.env,
  XDG_CACHE_HOME: resolve(cacheRoot, "xdg-cache"),
  LUMIS_DATA_DIR: dataDir,
  LUMIS_CONFIG: resolve(cacheRoot, "missing-config.toml"),
  BAT_OPTS: "",
  BAT_PAGER: "cat",
  PAGER: "cat",
  CLICOLOR_FORCE: "1",
};
delete benchmarkEnv.NO_COLOR;

await mkdir(outputDir, { recursive: true });
for (const scenario of manifest.scenarios) {
  for (const implementation of ["lumis-cli", "bat"]) {
    const preflight = spawnSync(process.execPath, [commandScript, implementation, scenario.id], {
      cwd: repoDir,
      encoding: "utf8",
    });
    if (preflight.status !== 0) {
      throw new Error(`${implementation}/${scenario.id} preflight failed: ${preflight.stderr}`);
    }
    metadata.push(JSON.parse(preflight.stdout.trim().split("\n").at(-1)));
  }

  const output = resolve(outputDir, `${scenario.id}.json`);
  const args = [
    "--style",
    "basic",
    "--export-json",
    output,
    "--warmup",
    process.env.BENCH_WARMUP ?? "1",
    "--min-runs",
    process.env.BENCH_RUNS ?? "5",
  ];
  for (const implementation of ["lumis-cli", "bat"]) {
    args.push("--command-name", implementation, scenarioCommand(implementation, scenario));
  }
  const result = spawnSync("hyperfine", args, {
    cwd: repoDir,
    env: benchmarkEnv,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`hyperfine failed for ${scenario.id}: ${result.stdout}${result.stderr}`);
  }
  process.stdout.write(result.stdout);
}

await writeFile(
  resolve(outputDir, "metadata.json"),
  `${JSON.stringify({ schemaVersion: 1, runner: "hyperfine", results: metadata }, null, 2)}\n`,
);

function scenarioCommand(implementation, scenario) {
  return scenario.files
    .map((file) => {
      const path = resolve(repoDir, file.path);
      const parts =
        implementation === "lumis-cli"
          ? [
              shim,
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
              bat,
              "--no-config",
              "--paging=never",
              "--style=plain",
              "--color=always",
              `--language=${file.syntax}`,
              "--theme=Monokai Extended",
              path,
            ];
      return `${command(parts)} > /dev/null`;
    })
    .join(" && ");
}

function command(parts) {
  return parts.map((part) => `'${String(part).replaceAll("'", `'\\''`)}'`).join(" ");
}

function findBat() {
  for (const candidate of ["bat", "batcat"]) {
    const result = spawnSync(candidate, ["--version"], { stdio: "ignore" });
    if (!result.error && result.status === 0) return candidate;
  }
  throw new Error("bat is required");
}

#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const outputDir = resolve(
  process.env.BENCH_OUTPUT_DIR ?? resolve(repoDir, "target/benchmarks/runs/current/cli"),
);
const commandScript = resolve(benchmarksDir, "cli/scenario-command.mjs");
const manifest = JSON.parse(
  await readFile(resolve(repoDir, "target/benchmarks/fixtures/scenarios.json"), "utf8"),
);
const metadata = [];

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
    args.push(
      "--command-name",
      implementation,
      command([process.execPath, commandScript, implementation, scenario.id]),
    );
  }
  const result = spawnSync("hyperfine", args, { cwd: repoDir, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`hyperfine failed for ${scenario.id}: ${result.stdout}${result.stderr}`);
  }
  process.stdout.write(result.stdout);
}

await writeFile(
  resolve(outputDir, "metadata.json"),
  `${JSON.stringify({ schemaVersion: 1, runner: "hyperfine", results: metadata }, null, 2)}\n`,
);

function command(parts) {
  return parts.map((part) => `'${String(part).replaceAll("'", `'\\''`)}'`).join(" ");
}

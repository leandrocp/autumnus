#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const outputDir = resolve(
  process.env.BENCH_OUTPUT_DIR ?? resolve(repoDir, "target/benchmarks/runs/current"),
);
const targetDir = resolve(repoDir, "target/benchmarks/rust-target/release");
const implementations = [
  { name: "lumis", binary: resolve(targetDir, "lumis-first-render") },
  { name: "syntect", binary: resolve(targetDir, "syntect-first-render") },
];
const fixtureSelection = process.env.BENCH_FIXTURE ?? "all";
const fixtures = [
  { name: "small", path: resolve(benchmarksDir, "fixtures/rust-small.rs") },
  { name: "large", path: resolve(repoDir, "target/benchmarks/fixtures/rust-large.rs") },
].filter((fixture) => fixtureSelection === "all" || fixture.name === fixtureSelection);
if (fixtures.length === 0) throw new Error(`unknown BENCH_FIXTURE: ${fixtureSelection}`);

function quote(value) {
  return `'${String(value).replaceAll("'", `'\\''`)}'`;
}

function parseJson(source, label) {
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`${label} returned invalid JSON: ${source}`, { cause: error });
  }
}

const hyperfineVersion = spawnSync("hyperfine", ["--version"], { encoding: "utf8" });
if (hyperfineVersion.error || hyperfineVersion.status !== 0) {
  throw new Error("hyperfine is required; install https://github.com/sharkdp/hyperfine");
}

await mkdir(outputDir, { recursive: true });
const phases = [];
for (const fixture of fixtures) {
  const output = resolve(outputDir, `rust-first-render-${fixture.name}.json`);
  const args = [
    "--style",
    "basic",
    "--warmup",
    process.env.BENCH_WARMUP ?? "2",
    "--min-runs",
    process.env.BENCH_RUNS ?? "8",
    "--export-json",
    output,
  ];

  for (const implementation of implementations) {
    const preflight = spawnSync(implementation.binary, [fixture.path], {
      cwd: repoDir,
      encoding: "utf8",
    });
    if (preflight.status !== 0) {
      throw new Error(`${implementation.name} preflight failed: ${preflight.stderr}`);
    }
    phases.push({
      fixtureName: fixture.name,
      ...parseJson(preflight.stdout.trim(), implementation.name),
    });
    args.push(
      "--command-name",
      implementation.name,
      `${quote(implementation.binary)} ${quote(fixture.path)}`,
    );
  }

  const result = spawnSync("hyperfine", args, { cwd: repoDir, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`hyperfine failed for Rust ${fixture.name}\n${result.stdout}${result.stderr}`);
  }
  process.stdout.write(result.stdout);
}

await writeFile(
  resolve(outputDir, "rust-first-render-phases.json"),
  `${JSON.stringify({ schemaVersion: 1, results: phases }, null, 2)}\n`,
);

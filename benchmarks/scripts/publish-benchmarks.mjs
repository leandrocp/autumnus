#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { implementationById } from "./implementations.mjs";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const runDir = resolve(
  process.env.BENCH_RUN_DIR ?? resolve(repoDir, "target/benchmarks/runs/current"),
);
const target = resolve(repoDir, "website/public/benchmark-data");

const report = await readJson(resolve(runDir, "results.json"));
const sizes = await readJson(resolve(runDir, "package-sizes.json"));

if (report.schemaVersion !== 1 || !Array.isArray(report.results) || report.results.length === 0) {
  throw new Error(`${runDir}/results.json is not a merged benchmark report`);
}
if (!sizes.system?.cpu) {
  throw new Error(`${runDir}/package-sizes.json does not name the machine that measured`);
}

// The website says which machine produced these numbers, because timings are
// only comparable to each other. A reader has to be able to tell that the rows
// were measured together on one machine rather than collected from anywhere.
const published = {
  schemaVersion: 1,
  metric: report.metric,
  timingBoundary: report.timingBoundary,
  system: sizes.system,
  scenarios: report.results.map((scenario) => ({
    id: scenario.id,
    description: scenario.description,
    inputBytes: scenario.inputBytes,
    fileCount: scenario.fileCount,
    languageCount: scenario.languageCount,
    results: scenario.results.map((result) => {
      const implementation = implementationById(result.implementation);
      if (!Number.isFinite(result.totalNs) || result.totalNs <= 0) {
        throw new Error(`${implementation.label} has no timing for ${scenario.id}`);
      }
      return {
        id: implementation.id,
        label: implementation.label,
        lumis: implementation.id.startsWith("lumis-"),
        totalNs: result.totalNs,
        setupNs: Number.isFinite(result.setupNs) ? result.setupNs : null,
      };
    }),
  })),
};

await mkdir(target, { recursive: true });
await writeFile(resolve(target, "results.json"), `${JSON.stringify(published, null, 2)}\n`);

console.log(
  `Published ${published.scenarios.length} scenarios × ` +
    `${published.scenarios[0].results.length} implementations measured on ` +
    `${published.system.cpu} to website/public/benchmark-data.`,
);

async function readJson(path) {
  return JSON.parse(
    await readFile(path, "utf8").catch(() => {
      throw new Error(`${path} is missing; run \`mise run -C benchmarks run\` first`);
    }),
  );
}

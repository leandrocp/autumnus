#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const runDir = resolve(
  process.env.BENCH_RUN_DIR ?? resolve(repoDir, "target/benchmarks/runs/current"),
);
const manifest = await readJson(resolve(repoDir, "target/benchmarks/fixtures/scenarios.json"));
const rustMetadata = await readJson(resolve(runDir, "rust-metadata.json"));
const cliMetadata = await readJson(resolve(runDir, "cli/metadata.json"));
const implementations = [
  "lumis-rust",
  "lumis-js-native",
  "lumis-js-wasm",
  "lumis-elixir",
  "shiki",
  "syntect",
  "lumis-cli",
  "bat",
];

const results = [];
for (const scenario of manifest.scenarios) {
  const scenarioResults = [];
  for (const implementation of implementations) {
    const metadata = await implementationMetadata(implementation, scenario.id);
    validateMetadata(metadata, scenario, implementation);
    const measurement = await measurementFor(implementation, scenario.id);
    if (
      !Number.isFinite(measurement.totalNs) ||
      measurement.totalNs <= 0 ||
      measurement.samples < 3
    ) {
      throw new Error(
        `${implementation}/${scenario.id} has an invalid Total or fewer than three samples`,
      );
    }
    scenarioResults.push({
      implementation,
      runner: runner(implementation),
      totalNs: measurement.totalNs,
      outputBytes: metadata.outputBytes,
    });
  }

  results.push({
    id: scenario.id,
    description: scenario.description,
    inputBytes: scenario.inputBytes,
    fileCount: scenario.fileCount,
    languageCount: scenario.languageCount,
    results: scenarioResults,
  });
}

const report = {
  schemaVersion: 1,
  metric: "total",
  timingBoundary:
    "runtime setup/load plus every highlight in the scenario; harness fixture reads excluded, CLI command file I/O included",
  results,
};
await mkdir(runDir, { recursive: true });
await writeFile(resolve(runDir, "results.json"), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(resolve(runDir, "results.md"), renderMarkdown(report));
console.log(resolve(runDir, "results.json"));

async function implementationMetadata(implementation, scenario) {
  if (implementation === "lumis-rust" || implementation === "syntect") {
    return rustMetadata.implementations
      .find((entry) => entry.implementation === implementation)
      .scenarios.find((entry) => entry.scenario === scenario);
  }
  if (implementation === "lumis-cli" || implementation === "bat") {
    return cliMetadata.results.find(
      (entry) => entry.implementation === implementation && entry.scenario === scenario,
    );
  }
  if (implementation === "lumis-elixir") {
    return readJson(resolve(runDir, `elixir/${scenario}-metadata.json`));
  }
  return readJson(resolve(runDir, `javascript/${implementation}/${scenario}.json`));
}

async function measurementFor(implementation, scenario) {
  if (implementation === "lumis-rust" || implementation === "syntect") {
    const directory = resolve(runDir, `criterion/${scenario}/${implementation}/total/new`);
    const [estimates, sample] = await Promise.all([
      readJson(resolve(directory, "estimates.json")),
      readJson(resolve(directory, "sample.json")),
    ]);
    return { totalNs: estimates.median.point_estimate, samples: sample.times.length };
  }
  if (implementation === "lumis-cli" || implementation === "bat") {
    const report = await readJson(resolve(runDir, `cli/${scenario}.json`));
    const result = report.results.find(({ command }) => command === implementation);
    if (!result) throw new Error(`Hyperfine is missing ${implementation}/${scenario}`);
    return { totalNs: result.median * 1e9, samples: result.times.length };
  }
  if (implementation === "lumis-elixir") {
    const report = await readJson(resolve(runDir, `elixir/${scenario}.json`));
    const result = report.find(({ job_name: job }) => job === "lumis-elixir/total");
    if (!result) throw new Error(`Benchee is missing lumis-elixir/${scenario}`);
    return {
      totalNs: result.run_time_data.statistics.median,
      samples: result.run_time_data.statistics.sample_size,
    };
  }
  const report = await readJson(resolve(runDir, `javascript/${implementation}/${scenario}.json`));
  return { totalNs: report.total.p50, samples: report.total.samples.length };
}

function validateMetadata(metadata, scenario, implementation) {
  if (
    !metadata ||
    metadata.scenario !== scenario.id ||
    metadata.inputBytes !== scenario.inputBytes ||
    metadata.fileCount !== scenario.fileCount ||
    metadata.languageCount !== scenario.languageCount ||
    metadata.outputBytes <= metadata.inputBytes
  ) {
    throw new Error(`${implementation} returned incompatible metadata for ${scenario.id}`);
  }
}

function runner(implementation) {
  if (implementation === "lumis-rust" || implementation === "syntect") return "criterion";
  if (implementation === "lumis-elixir") return "benchee";
  if (implementation === "lumis-cli" || implementation === "bat") return "hyperfine";
  return "mitata";
}

function renderMarkdown(report) {
  const scenarios = {
    "small-one-language": "1 small file for 1 language",
    "large-one-language": "1 big file for 1 language",
    "ten-files-one-language": "10 different files for 1 language",
    "ten-files-ten-languages": "10 different files for 10 languages",
  };
  const labels = {
    "lumis-rust": "Lumis Rust",
    "lumis-js-native": "Lumis JS native",
    "lumis-js-wasm": "Lumis JS Wasm",
    "lumis-elixir": "Lumis Elixir",
    shiki: "Shiki",
    syntect: "syntect",
    "lumis-cli": "Lumis CLI",
    bat: "bat",
  };
  const lines = ["# Benchmarks", "", "Run all benchmarks with `mise run -C benchmarks run`.", ""];
  for (const scenario of report.results) {
    lines.push(
      `## ${scenarios[scenario.id]}`,
      "",
      scenario.description,
      "",
      "| Tool | Total |",
      "| --- | ---: |",
    );
    for (const result of scenario.results.toSorted((left, right) => left.totalNs - right.totalNs)) {
      lines.push(`| ${labels[result.implementation]} | ${formatDuration(result.totalNs)} |`);
    }
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

function formatDuration(ns) {
  if (ns >= 1e9) return `${(ns / 1e9).toFixed(3)} s`;
  if (ns >= 1e6) return `${(ns / 1e6).toFixed(3)} ms`;
  if (ns >= 1e3) return `${(ns / 1e3).toFixed(3)} µs`;
  return `${ns.toFixed(0)} ns`;
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`could not read benchmark report ${path}`, { cause: error });
  }
}

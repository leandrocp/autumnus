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
const packageSizes = await readJson(resolve(runDir, "package-sizes.json"));
const implementations = [
  "lumis-rust",
  "lumis-js-wasm",
  "lumis-elixir",
  "shiki",
  "highlight-js",
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
const markdown = renderMarkdown(report, packageSizes);
await writeFile(resolve(runDir, "results.md"), markdown);
await writeFile(resolve(benchmarksDir, "README.md"), markdown);
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

function renderMarkdown(report, sizes) {
  const scenarios = {
    "small-one-language": "1 small file for 1 language",
    "large-one-language": "1 big file for 1 language",
    "ten-files-one-language": "10 different files for 1 language",
    "ten-files-ten-languages": "10 different files for 10 languages",
  };
  const labels = {
    "lumis-rust": "Lumis Rust",
    "lumis-js-wasm": "Lumis JS WASM",
    "lumis-elixir": "Lumis Elixir",
    shiki: "Shiki",
    "highlight-js": "highlight.js",
    syntect: "syntect",
    "lumis-cli": "Lumis CLI",
    bat: "bat",
  };
  validatePackageSizes(sizes);
  const lines = [
    "# Benchmarks",
    "",
    "Run all benchmarks and regenerate this file with `mise run -C benchmarks run`.",
    "",
    "The timing rows use local workspace source for every Lumis runtime. The Elixir",
    "rows use dynamic WASM; see the [focused before/after report](elixir-runtime.md)",
    "for cold loading, concurrency, and memory measurements.",
    "",
    "## Visual output comparison",
    "",
    "Generate the gallery with `mise run -C benchmarks showcase`, then open",
    "[`index.html`](index.html) directly in a browser.",
    "",
    "This comparison is separate from timing. Every implementation highlights the",
    "same pinned 1,397-line Three.js HTML file, including injected CSS, JSON, and",
    "JavaScript, with the Dracula theme. The gallery covers Lumis Rust, JavaScript",
    "WASM, Elixir, and CLI alongside Shiki 4.3.1, highlight.js 11.11.1, syntect",
    "5.3.0, and bat 0.26.1—the latest releases at the time of measurement. Its",
    "preparation step verifies SHA-256 hashes for both the fixture and syntect's",
    "official Dracula theme before rendering.",
    "",
    "## Package size",
    "",
    `Measured on ${sizes.system.cpu} (${sizes.system.architecture}, ${sizes.system.platform}).`,
    "npm rows sum the packed and unpacked sizes of each unique production package.",
    "Native rows compare the raw release artifact with deterministic gzip level 9.",
    "Compare rows within the same artifact class; npm packages, executables, and a NIF",
    "are not interchangeable distribution formats.",
    "",
    "| Tool | Measured artifact | Raw / unpacked | Download / gzip -9 |",
    "| --- | --- | ---: | ---: |",
  ];
  for (const entry of sizes.entries) {
    lines.push(
      `| ${entry.label} | ${entry.artifact} | ${formatBytes(entry.rawBytes)} | ${formatBytes(entry.compressedBytes)} |`,
    );
  }
  lines.push("");
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

function validatePackageSizes(report) {
  const required = [
    "Lumis JS WASM (runtime)",
    "Lumis JS WASM (1 language)",
    "Lumis JS WASM (10 languages)",
    "Shiki 4.3.1",
    "highlight.js 11.11.1",
    "Lumis Rust",
    "syntect 5.3.0",
    "Lumis CLI",
    "bat 0.26.1",
    "Lumis Elixir",
  ];
  if (
    report?.schemaVersion !== 1 ||
    !report.system?.cpu ||
    !Array.isArray(report.entries) ||
    required.some((label) => !report.entries.some((entry) => entry.label === label)) ||
    report.entries.some(
      (entry) =>
        !Number.isSafeInteger(entry.rawBytes) ||
        entry.rawBytes <= 0 ||
        !Number.isSafeInteger(entry.compressedBytes) ||
        entry.compressedBytes <= 0,
    )
  ) {
    throw new Error("package size report is missing or invalid");
  }
}

function formatDuration(ns) {
  if (ns >= 1e9) return `${(ns / 1e9).toFixed(3)} s`;
  if (ns >= 1e6) return `${(ns / 1e6).toFixed(3)} ms`;
  if (ns >= 1e3) return `${(ns / 1e3).toFixed(3)} µs`;
  return `${ns.toFixed(0)} ns`;
}

function formatBytes(bytes) {
  const units = ["B", "KiB", "MiB", "GiB"];
  let value = bytes;
  let unit = units.shift();
  while (value >= 1024 && units.length > 0) {
    value /= 1024;
    unit = units.shift();
  }
  return `${value.toFixed(unit === "B" ? 0 : 2)} ${unit}`;
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`could not read benchmark report ${path}`, { cause: error });
  }
}

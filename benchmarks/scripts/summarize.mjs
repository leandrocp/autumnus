#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const runDir = resolve(
  process.env.BENCH_RUN_DIR ?? resolve(repoDir, "target/benchmarks/runs/current"),
);

function parseJson(source, path) {
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`invalid JSON report ${path}: ${error.message}`, { cause: error });
  }
}

async function readJson(path) {
  return parseJson(await readFile(path, "utf8"), path);
}

async function filesUnder(path) {
  const result = [];
  async function visit(current) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const child = resolve(current, entry.name);
      if (entry.isDirectory()) await visit(child);
      else result.push(child);
    }
  }
  await visit(path);
  return result;
}

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

const summary = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  runDir,
  rustWarm: [],
  rustFirst: [],
  jsWarm: [],
  jsFirst: [],
  application: [],
  cli: [],
  memory: null,
  rawReports: [],
};

const reportFiles = await filesUnder(runDir);
summary.rawReports = reportFiles.map((path) => relative(runDir, path));

for (const path of reportFiles) {
  if (path.endsWith("js-first-render.json")) {
    const report = await readJson(path);
    const groups = new Map();
    for (const result of report.results) {
      const key = `${result.implementation}/${result.fixtureName}`;
      const group = groups.get(key) ?? [];
      group.push(result);
      groups.set(key, group);
    }
    for (const [id, results] of groups) {
      summary.jsFirst.push({
        id,
        samples: results.length,
        externalMedianNs: median(results.map((result) => result.externalTotalNs)),
        importMedianNs: median(results.map((result) => result.importNs)),
        initMedianNs: median(results.map((result) => result.initNs)),
        renderMedianNs: median(results.map((result) => result.renderNs)),
        outputBytes: results[0].outputBytes,
      });
    }
  } else if (path.endsWith("js-warm.json")) {
    const report = await readJson(path);
    summary.jsWarm = report.results.map((result) => ({
      id: `${result.name}/${result.fixture}`,
      samples: result.stats.samples.length,
      medianNs: result.stats.p50,
      meanNs: result.stats.avg,
      minNs: result.stats.min,
      maxNs: result.stats.max,
    }));
  } else if (path.endsWith("application.json")) {
    const report = await readJson(path);
    const groups = new Map();
    for (const result of report.results) {
      const group = groups.get(result.implementation) ?? [];
      group.push(result);
      groups.set(result.implementation, group);
    }
    for (const [implementation, results] of groups) {
      summary.application.push({
        implementation,
        samples: results.length,
        languages: results[0].languages,
        snippetCount: results[0].snippetCount,
        inputBytes: results[0].inputBytes,
        outputBytes: results[0].outputBytes,
        externalMedianNs: median(results.map((result) => result.externalTotalNs)),
        internalTotalMedianNs: median(results.map((result) => result.internalTotalNs)),
        fixtureMedianNs: median(results.map((result) => result.fixtureNs)),
        importMedianNs: median(results.map((result) => result.importNs)),
        initMedianNs: median(results.map((result) => result.initNs)),
        renderMedianNs: median(results.map((result) => result.renderNs)),
        maxRssMedianBytes: median(
          results.map((result) => result.maxRssBytes).filter(Number.isFinite),
        ),
      });
    }
  } else if (/cli-(first-use|repeat-use)-(small|large)\.json$/.test(path)) {
    const report = await readJson(path);
    summary.cli.push({
      path: relative(runDir, path),
      results: report.results.map((result) => ({
        command: result.command,
        meanSeconds: result.mean,
        medianSeconds: result.median,
        stddevSeconds: result.stddev,
        minSeconds: result.min,
        maxSeconds: result.max,
      })),
    });
  } else if (path.endsWith("memory.json")) {
    summary.memory = await readJson(path);
  } else if (/rust-first-render-(small|large)\.json$/.test(path)) {
    summary.rustFirst.push({
      path: relative(runDir, path),
      report: await readJson(path),
    });
  }
}

const criterionRoot = resolve(runDir, "criterion");
for (const path of await filesUnder(criterionRoot)) {
  if (!path.endsWith("/new/estimates.json")) continue;
  const estimates = await readJson(path);
  summary.rustWarm.push({
    id: relative(criterionRoot, dirname(dirname(path))),
    meanNs: estimates.mean?.point_estimate ?? null,
    medianNs: estimates.median?.point_estimate ?? null,
    stdDevNs: estimates.std_dev?.point_estimate ?? null,
  });
}

const summaryPath = resolve(runDir, "summary.json");
await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

const markdown = [
  "# Lumis benchmark summary",
  "",
  `Generated: ${summary.generatedAt}`,
  "",
  "## Rust warm render",
  "",
  "| Benchmark | Median (ms) | Mean (ms) |",
  "| --- | ---: | ---: |",
  ...summary.rustWarm.map(
    (row) =>
      `| ${row.id} | ${(row.medianNs / 1e6).toFixed(3)} | ${(row.meanNs / 1e6).toFixed(3)} |`,
  ),
  "",
  "## Rust first render",
  "",
  "| Benchmark | Median (ms) | Mean (ms) |",
  "| --- | ---: | ---: |",
  ...summary.rustFirst.flatMap((entry) =>
    entry.report.results.map(
      (row) =>
        `| ${entry.path}/${row.command} | ${(row.median * 1e3).toFixed(3)} | ${(row.mean * 1e3).toFixed(3)} |`,
    ),
  ),
  "",
  "## JavaScript warm render",
  "",
  "| Benchmark | Median (ms) | Mean (ms) |",
  "| --- | ---: | ---: |",
  ...summary.jsWarm.map(
    (row) =>
      `| ${row.id} | ${(row.medianNs / 1e6).toFixed(3)} | ${(row.meanNs / 1e6).toFixed(3)} |`,
  ),
  "",
  "## JavaScript first render",
  "",
  "| Benchmark | External (ms) | Import (ms) | Init (ms) | Render (ms) |",
  "| --- | ---: | ---: | ---: | ---: |",
  ...summary.jsFirst.map(
    (row) =>
      `| ${row.id} | ${(row.externalMedianNs / 1e6).toFixed(3)} | ${(row.importMedianNs / 1e6).toFixed(3)} | ${(row.initMedianNs / 1e6).toFixed(3)} | ${(row.renderMedianNs / 1e6).toFixed(3)} |`,
  ),
  "",
  "## Cross-runtime application workload",
  "",
  "Two languages (JavaScript and JSON), three snippets per language, in a fresh process.",
  "",
  "| Implementation | Workload total (ms) | Process total (ms) | Init/load (ms) | Render 6 (ms) | Peak RSS (MiB) |",
  "| --- | ---: | ---: | ---: | ---: | ---: |",
  ...summary.application
    .toSorted((left, right) => left.internalTotalMedianNs - right.internalTotalMedianNs)
    .map(
      (row) =>
        `| ${row.implementation} | ${(row.internalTotalMedianNs / 1e6).toFixed(3)} | ${(row.externalMedianNs / 1e6).toFixed(3)} | ${(row.initMedianNs / 1e6).toFixed(3)} | ${(row.renderMedianNs / 1e6).toFixed(3)} | ${row.maxRssMedianBytes === null ? "—" : (row.maxRssMedianBytes / 1024 / 1024).toFixed(1)} |`,
    ),
  "",
  "## CLI",
  "",
  ...summary.cli.flatMap((report) => [
    `### ${report.path}`,
    "",
    "| Command | Median (ms) | Mean (ms) |",
    "| --- | ---: | ---: |",
    ...report.results.map(
      (row) =>
        `| ${row.command} | ${(row.medianSeconds * 1e3).toFixed(3)} | ${(row.meanSeconds * 1e3).toFixed(3)} |`,
    ),
    "",
  ]),
  "## Memory (secondary)",
  "",
  summary.memory?.memorySupported ? "| Benchmark | Fixture | Peak RSS (MiB) |" : "",
  summary.memory?.memorySupported ? "| --- | --- | ---: |" : "",
  ...(summary.memory?.results ?? [])
    .filter((row) => row.supported)
    .map(
      (row) => `| ${row.label} | ${row.fixture} | ${(row.peakRssBytes / 1024 / 1024).toFixed(1)} |`,
    ),
  summary.memory?.memorySupported ? "" : "Peak RSS measurement unavailable on this host.",
  "",
  "Network-inclusive CLI first-use results and all memory results are informational and non-gating.",
  "",
];
await writeFile(resolve(runDir, "summary.md"), `${markdown.join("\n")}\n`);
console.log(summaryPath);

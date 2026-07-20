import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { applicationRuntimeDir, prepareApplicationRuntime, repoDir } from "./common.mjs";

const sampleCount = Number.parseInt(
  process.env.BENCH_FRESH_SAMPLES ?? process.env.BENCH_SAMPLES ?? "20",
  10,
);
const requestedOutput = process.env.BENCH_OUTPUT;
if (!requestedOutput) throw new Error("BENCH_OUTPUT is required");
if (!Number.isSafeInteger(sampleCount) || sampleCount < 2) {
  throw new Error(`BENCH_FRESH_SAMPLES must be at least two, got ${sampleCount}`);
}

await prepareApplicationRuntime();

const fixture = resolve(repoDir, "benchmarks/fixtures/application.json");
const nodeApplication = resolve(repoDir, "benchmarks/javascript/src/application-lumis.mjs");
const shikiApplication = resolve(repoDir, "benchmarks/javascript/src/application-shiki.mjs");
const rustApplication = resolve(repoDir, "target/benchmarks/rust-target/release/application-once");
const cases = [
  {
    implementation: "lumis-js-native",
    command: process.execPath,
    args: [nodeApplication],
    cwd: applicationRuntimeDir,
    env: {
      LUMIS_DISABLE_NATIVE: "0",
      LUMIS_REQUIRE_NATIVE: "1",
      BENCH_IMPLEMENTATION: "lumis-js-native",
    },
    loadedLanguageScope: "requested-only",
    theme: "github-dark",
  },
  {
    implementation: "lumis-js-wasm",
    command: process.execPath,
    args: [nodeApplication],
    cwd: applicationRuntimeDir,
    env: {
      LUMIS_DISABLE_NATIVE: "1",
      LUMIS_REQUIRE_NATIVE: "0",
      BENCH_IMPLEMENTATION: "lumis-js-wasm",
    },
    loadedLanguageScope: "requested-only",
    theme: "github-dark",
  },
  {
    implementation: "shiki",
    command: process.execPath,
    args: [shikiApplication],
    cwd: applicationRuntimeDir,
    env: {},
    loadedLanguageScope: "requested-only",
    theme: "github-dark",
  },
  {
    implementation: "lumis-rust",
    command: rustApplication,
    args: [],
    cwd: repoDir,
    env: { BENCH_IMPLEMENTATION: "lumis-rust", BENCH_APPLICATION_FIXTURE: fixture },
  },
  {
    implementation: "syntect",
    command: rustApplication,
    args: [],
    cwd: repoDir,
    env: { BENCH_IMPLEMENTATION: "syntect", BENCH_APPLICATION_FIXTURE: fixture },
  },
  {
    implementation: "lumis-elixir",
    command: "mix",
    args: ["run", "--no-compile", "application_once.exs"],
    cwd: resolve(repoDir, "benchmarks/elixir"),
    env: { MIX_ENV: "prod", BENCH_APPLICATION_FIXTURE: fixture },
  },
];

const samples = new Map(cases.map(({ implementation }) => [implementation, []]));
for (let sample = 0; sample < sampleCount; sample += 1) {
  for (const benchmark of cases) {
    const externalStarted = process.hrtime.bigint();
    const child = spawnSync(benchmark.command, benchmark.args, {
      cwd: benchmark.cwd,
      encoding: "utf8",
      env: { ...process.env, ...benchmark.env },
    });
    const externalTotalNs = Number(process.hrtime.bigint() - externalStarted);
    if (child.status !== 0) {
      throw new Error(
        `${benchmark.implementation} fresh process failed:\n${child.stdout}\n${child.stderr}`,
      );
    }

    const line = child.stdout.trim().split("\n").at(-1);
    const report = JSON.parse(line);
    if (
      report.implementation !== benchmark.implementation ||
      report.languages?.join(",") !== "javascript,json" ||
      report.snippetCount !== 6 ||
      report.inputBytes !== 1_036 ||
      report.outputBytes <= report.inputBytes ||
      !Number.isFinite(report.initNs) ||
      !Number.isFinite(report.renderNs)
    ) {
      throw new Error(`${benchmark.implementation} returned incompatible fresh-process metadata`);
    }

    samples.get(benchmark.implementation).push({
      initNs: report.initNs,
      renderNs: report.renderNs,
      totalNs: report.initNs + report.renderNs,
      externalTotalNs,
      outputBytes: report.outputBytes,
      loadedLanguageScope: report.loadedLanguageScope ?? benchmark.loadedLanguageScope,
      theme: report.theme ?? benchmark.theme,
    });
  }
}

function stats(values) {
  const sorted = values.toSorted((left, right) => left - right);
  const meanNs = values.reduce((total, value) => total + value, 0) / values.length;
  const variance =
    values.reduce((total, value) => total + (value - meanNs) ** 2, 0) / values.length;
  const middle = Math.floor(sorted.length / 2);
  return {
    meanNs,
    medianNs: sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle],
    minNs: sorted[0],
    maxNs: sorted.at(-1),
    stdDevNs: Math.sqrt(variance),
    samples: values.length,
    iterations: values.length,
  };
}

const results = cases.map((benchmark) => {
  const implementationSamples = samples.get(benchmark.implementation);
  const first = implementationSamples[0];
  if (
    implementationSamples.some(
      (sample) =>
        sample.outputBytes !== first.outputBytes ||
        sample.loadedLanguageScope !== first.loadedLanguageScope ||
        sample.theme !== first.theme,
    )
  ) {
    throw new Error(`${benchmark.implementation} fresh-process metadata changed between samples`);
  }

  return {
    implementation: benchmark.implementation,
    runner: "fresh-process/internal-clock",
    languages: ["javascript", "json"],
    snippetCount: 6,
    inputBytes: 1_036,
    outputBytes: first.outputBytes,
    executionContract: {
      requestedLanguages: 2,
      renderHighlights: 6,
      totalHighlights: 6,
    },
    loadedLanguageScope: first.loadedLanguageScope,
    theme: first.theme,
    init: stats(implementationSamples.map((sample) => sample.initNs)),
    render: stats(implementationSamples.map((sample) => sample.renderNs)),
    total: stats(implementationSamples.map((sample) => sample.totalNs)),
    externalProcess: stats(implementationSamples.map((sample) => sample.externalTotalNs)),
    rawSamples: implementationSamples.map(({ initNs, renderNs, totalNs, externalTotalNs }) => ({
      initNs,
      renderNs,
      totalNs,
      externalTotalNs,
    })),
  };
});

const report = {
  schemaVersion: 1,
  runner: "mise-fresh-process-coordinator",
  scenario: "application-two-languages-six-snippets",
  timingBoundary:
    "library init/load plus exactly six renders in a fresh host process; host startup, imports, fixture parsing, and report serialization excluded",
  fixture,
  sampleCount,
  results,
};
const outputPath = isAbsolute(requestedOutput)
  ? requestedOutput
  : resolve(repoDir, requestedOutput);
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(relative(repoDir, outputPath));

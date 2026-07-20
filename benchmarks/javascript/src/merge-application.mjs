import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { applicationRuntimeDir, repoDir } from "./common.mjs";

const requestedRawDir =
  process.env.BENCH_APPLICATION_RAW_DIR ?? "target/benchmarks/runs/current/application";
const requestedOutput =
  process.env.BENCH_OUTPUT ?? "target/benchmarks/runs/current/application.json";
const rawDir = isAbsolute(requestedRawDir) ? requestedRawDir : resolve(repoDir, requestedRawDir);
const outputPath = isAbsolute(requestedOutput)
  ? requestedOutput
  : resolve(repoDir, requestedOutput);

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`could not read application benchmark report ${path}`, { cause: error });
  }
}

function stats({ meanNs, medianNs, minNs, maxNs, stdDevNs, samples, iterations }) {
  return { meanNs, medianNs, minNs, maxNs, stdDevNs, samples, iterations };
}

function mitataStats(report, phase) {
  const phaseStats = report.benchmarks[phase];
  return stats({
    meanNs: phaseStats.avg,
    medianNs: phaseStats.p50,
    minNs: phaseStats.min,
    maxNs: phaseStats.max,
    stdDevNs: phaseStats.stddev ?? null,
    samples: phaseStats.samples.length,
    iterations: phaseStats.ticks,
  });
}

async function criterionStats(implementation, phase) {
  const benchmarkDir = resolve(rawDir, "criterion", "application", implementation, phase, "new");
  const [estimates, sample] = await Promise.all([
    readJson(resolve(benchmarkDir, "estimates.json")),
    readJson(resolve(benchmarkDir, "sample.json")),
  ]);
  return stats({
    meanNs: estimates.mean.point_estimate,
    medianNs: estimates.median.point_estimate,
    minNs: null,
    maxNs: null,
    stdDevNs: estimates.std_dev.point_estimate,
    samples: sample.times.length,
    iterations: sample.iters.reduce((total, iterations) => total + iterations, 0),
  });
}

function bencheeStats(report, implementation, phase) {
  const job = report.find((entry) => entry.job_name === `${implementation}/${phase}`);
  if (!job) throw new Error(`Benchee report is missing ${implementation}/${phase}`);
  const runStats = job.run_time_data.statistics;
  return stats({
    meanNs: runStats.average,
    medianNs: runStats.median,
    minNs: runStats.minimum,
    maxNs: runStats.maximum,
    stdDevNs: runStats.std_dev,
    samples: runStats.sample_size,
    iterations: runStats.sample_size,
  });
}

function metadataFrom(report) {
  return {
    implementation: report.implementation,
    runner: report.runner,
    languages: report.languages,
    snippetCount: report.snippetCount,
    inputBytes: report.inputBytes,
    outputBytes: report.outputBytes,
    executionContract: report.executionContract,
    loadedLanguageScope: report.loadedLanguageScope,
    theme: report.theme ?? null,
  };
}

const javascriptReports = await Promise.all(
  ["lumis-js-native", "lumis-js-wasm", "shiki"].map((implementation) =>
    readJson(resolve(rawDir, `${implementation}.json`)),
  ),
);
const [lumisRustMetadata, syntectMetadata, elixirMetadata, bencheeReport] = await Promise.all([
  readJson(resolve(rawDir, "lumis-rust-metadata.json")),
  readJson(resolve(rawDir, "syntect-metadata.json")),
  readJson(resolve(rawDir, "lumis-elixir-metadata.json")),
  readJson(resolve(rawDir, "benchee.json")),
]);

const warmResults = javascriptReports.map((report) => ({
  ...metadataFrom(report),
  init: mitataStats(report, "init"),
  render: mitataStats(report, "render"),
  total: mitataStats(report, "total"),
}));

for (const metadata of [lumisRustMetadata, syntectMetadata]) {
  const implementation = metadata.implementation;
  warmResults.push({
    ...metadataFrom({ ...metadata, runner: "criterion" }),
    init: await criterionStats(implementation, "init"),
    render: await criterionStats(implementation, "render"),
    total: await criterionStats(implementation, "total"),
  });
}

warmResults.push({
  ...metadataFrom(elixirMetadata),
  init: bencheeStats(bencheeReport, "lumis-elixir", "init"),
  render: bencheeStats(bencheeReport, "lumis-elixir", "render"),
  total: bencheeStats(bencheeReport, "lumis-elixir", "total"),
});

const expectedImplementations = [
  "lumis-js-native",
  "lumis-js-wasm",
  "shiki",
  "lumis-rust",
  "syntect",
  "lumis-elixir",
];
const freshReport = await readJson(resolve(rawDir, "fresh.json"));
const results = freshReport.results;
const expectedExecutionContract = {
  requestedLanguages: 2,
  renderHighlights: 6,
  totalHighlights: 6,
};
for (const group of [results, warmResults]) {
  if (
    group.map((result) => result.implementation).join(",") !== expectedImplementations.join(",")
  ) {
    throw new Error("application benchmark implementations are incomplete or out of order");
  }
  if (new Set(group.map((result) => result.inputBytes)).size !== 1) {
    throw new Error("application implementations did not consume the same input bytes");
  }
  for (const result of group) {
    const contract = result.executionContract;
    if (
      result.languages?.join(",") !== "javascript,json" ||
      result.snippetCount !== 6 ||
      result.outputBytes <= result.inputBytes ||
      !contract ||
      Object.keys(contract).length !== Object.keys(expectedExecutionContract).length ||
      Object.entries(expectedExecutionContract).some(([key, value]) => contract[key] !== value) ||
      typeof result.loadedLanguageScope !== "string"
    ) {
      throw new Error(`${result.implementation} returned incompatible application metadata`);
    }
  }
}

const report = {
  schemaVersion: 2,
  runner: "mise-coordinated",
  scenario: "application-two-languages-six-snippets",
  fixture: resolve(repoDir, "benchmarks/fixtures/application.json"),
  runtimeDirectory: applicationRuntimeDir,
  timingBoundary: freshReport.timingBoundary,
  rawDirectory: rawDir,
  rawReports: [
    "fresh.json",
    ...javascriptReports.map((report) => `${report.implementation}.json`),
    "criterion/application",
    "lumis-rust-metadata.json",
    "syntect-metadata.json",
    "benchee.json",
    "lumis-elixir-metadata.json",
  ],
  results,
  warmResults,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(relative(repoDir, outputPath));

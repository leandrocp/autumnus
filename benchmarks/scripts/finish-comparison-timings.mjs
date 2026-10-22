#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { cpus, platform, release, totalmem } from "node:os";
import { resolve } from "node:path";
import { implementationById, lumisReference } from "./implementations.mjs";

const benchmarksDir = resolve(import.meta.dirname, "..");
const repoDir = resolve(benchmarksDir, "..");
const runDir = resolve(
  process.env.BENCH_RUN_DIR ?? resolve(repoDir, "target/benchmarks/runs/current"),
  "comparison",
);

const manifest = await readJson(resolve(repoDir, "website/public/comparison-data/manifest.json"));
const javascript = await readJson(resolve(runDir, "javascript.json"));
const memory = await readJson(resolve(runDir, "memory.json"));
// Both runs time the first flavour.
const theme = manifest.themes[0].id;
if (memory.theme !== theme) {
  throw new Error(`the memory pass rendered ${memory.theme}, not ${theme}; rerun it`);
}

const documents = [];
for (const document of manifest.documents) {
  const results = [];
  for (const { id, label } of manifest.implementations) {
    // The published Lumis column is its reference runtime's output.
    const implementation = id === "lumis" ? lumisReference : id;
    const timing = await timingFor(implementation, document.id);
    const peakRssBytes = memory.results.find(
      (result) => result.document === document.id && result.implementation === implementation,
    )?.peakRssBytes;
    // Every output on the page gets its own time and nothing else does, so a pair
    // with no output has no time and a pair with output cannot go untimed.
    if (document.unsupported.includes(id)) {
      if (timing !== undefined || peakRssBytes !== undefined) {
        throw new Error(`${label} measured ${document.id}, which it does not support`);
      }
      continue;
    }
    if (!(timing?.totalNs > 0)) throw new Error(`${label} has no timing for ${document.id}`);
    // The memory pass checked each of its outputs against the published one, so
    // a figure here belongs to the same output as the time.
    if (!(peakRssBytes > 0)) throw new Error(`${label} has no peak RSS for ${document.id}`);

    // The time is published beside the output, so it has to be the time to produce
    // that output. One that differs from the published output means the comparison
    // is stale, and its time would describe a page no one can see. The hash goes
    // out with the time, so the page can drop a time once the output it measured
    // has been replaced.
    const fragment = await readFile(
      resolve(runDir, "fragments", document.id, `${implementation}.html`),
    );
    const sha256 = createHash("sha256").update(fragment).digest("hex");
    if (sha256 !== document.outputSha256[id]?.[theme]) {
      throw new Error(
        `${label} does not render ${document.id} as the published comparison shows it; ` +
          "run `mise run -C benchmarks showcase-publish` first",
      );
    }
    results.push({ id, totalNs: timing.totalNs, samples: timing.samples, peakRssBytes, sha256 });
  }
  documents.push({ id: document.id, results });
}

const report = {
  schemaVersion: 2,
  measuredAt: new Date().toISOString(),
  metric: "median",
  timingBoundary:
    "one highlight of the whole document through the call that rendered the published output, " +
    `with Lumis as ${implementationById(lumisReference).label}; ` +
    "building the highlighter and loading its languages are excluded",
  memory: {
    metric: "median",
    runs: memory.runs,
    boundary:
      "peak resident set size of a fresh process that builds one library's highlighter, " +
      "loads its languages and highlights the document once; each process holds only that library",
    definition:
      "resident set size counts the runtime (Node.js and V8, or the Rust executable), compiled code, " +
      "WebAssembly memory and allocator overhead, not only the live heap",
    baselines: memory.baselines,
  },
  theme,
  // These numbers are only comparable to each other, so the page says which
  // machine measured them.
  system: {
    platform: platform(),
    release: release(),
    os: operatingSystem(),
    architecture: process.arch,
    cpu: cpus()[0]?.model,
    cores: cpus().length,
    memoryBytes: totalmem(),
  },
  runtimes: {
    node: javascript.run.node,
    rust: execFileSync("rustc", ["--version"], { encoding: "utf8" }).trim(),
  },
  implementations: manifest.implementations.map(({ id, label, version }) => ({
    id,
    label,
    version,
  })),
  documents,
};
const output = resolve(runDir, "timings.json");
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  `Timed ${documents.reduce((total, document) => total + document.results.length, 0)} ` +
    `outputs of ${documents.length} documents on ${report.system.cpu}: ${output}`,
);

async function timingFor(implementation, document) {
  if (implementationById(implementation).runner === "criterion") {
    const directory = resolve(runDir, "criterion", document, implementation, "new");
    const estimates = await readJson(resolve(directory, "estimates.json"), true);
    if (!estimates) return;
    const sample = await readJson(resolve(directory, "sample.json"));
    return { totalNs: estimates.median.point_estimate, samples: sample.iters.length };
  }
  const result = javascript.results.find(
    (entry) => entry.document === document && entry.implementation === implementation,
  );
  return result && { totalNs: result.totalNs, samples: result.samples };
}

// `release()` is the kernel version, which on macOS is Darwin's rather than the
// one a reader knows the machine by.
function operatingSystem() {
  if (platform() === "darwin") {
    return `${product("-productName")} ${product("-productVersion")}`;
  }
  if (platform() === "linux") {
    return execFileSync("sh", ["-c", '. /etc/os-release && printf %s "$PRETTY_NAME"'], {
      encoding: "utf8",
    });
  }
  return `${platform()} ${release()}`;
}

function product(key) {
  return execFileSync("sw_vers", [key], { encoding: "utf8" }).trim();
}

async function readJson(path, optional = false) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (optional && error.code === "ENOENT") return;
    throw error;
  }
}

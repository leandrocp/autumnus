#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { implementationById, lumisReference } from "./implementations.mjs";

// The peak resident set size of a fresh process that builds one library's
// highlighter and highlights one document once, the median of `runs` processes.
// Each process holds only that library, and every one of them has to render the
// published output byte for byte, as the timing pass does, so the figure is the
// memory of the output beside it.
const runs = 5;

const benchmarksDir = resolve(import.meta.dirname, "..");
const repoDir = resolve(benchmarksDir, "..");
const runDir = resolve(
  process.env.BENCH_RUN_DIR ?? resolve(repoDir, "target/benchmarks/runs/current"),
  "comparison",
);
const rustBinary = resolve(
  process.env.CARGO_TARGET_DIR ?? resolve(repoDir, "target/benchmarks/rust-target"),
  "release",
  process.platform === "win32" ? "comparison-memory.exe" : "comparison-memory",
);
const javascriptEntry = resolve(benchmarksDir, "javascript/src/comparison-memory.mjs");
const fragmentsDir = resolve(runDir, "memory");

const manifest = JSON.parse(
  await readFile(resolve(repoDir, "website/public/comparison-data/manifest.json"), "utf8"),
);
// The timing pass renders the first flavour, so this one does too.
const theme = manifest.themes[0].id;

const results = [];
for (const document of manifest.documents) {
  await mkdir(resolve(fragmentsDir, document.id), { recursive: true });
  for (const { id, label } of manifest.implementations) {
    if (document.unsupported.includes(id)) continue;
    // The published Lumis column is its reference runtime's output.
    const implementation = id === "lumis" ? lumisReference : id;
    const samples = [];
    for (let run = 0; run < runs; run += 1) {
      const fragment = resolve(fragmentsDir, document.id, `${implementation}.html`);
      samples.push(measure(implementation, document.id, fragment));
      const sha256 = createHash("sha256")
        .update(await readFile(fragment))
        .digest("hex");
      if (sha256 !== document.outputSha256[id]?.[theme]) {
        throw new Error(
          `${label} does not render ${document.id} as the published comparison shows it; ` +
            "run `mise run -C benchmarks showcase-publish` first",
        );
      }
    }
    const peakRssBytes = median(samples);
    results.push({ document: document.id, implementation, peakRssBytes, samples });
    console.log(`${document.id} · ${label}: ${(peakRssBytes / 2 ** 20).toFixed(1)} MiB`);
  }
}

// What each runtime costs before it loads a library, measured the same way, so a
// reader can tell the library from the process it runs in.
const baselines = {
  node: median(Array.from({ length: runs }, () => measure("baseline-node", "webgpu"))),
  rust: median(Array.from({ length: runs }, () => measure("baseline-rust", "webgpu"))),
};

await writeFile(
  resolve(runDir, "memory.json"),
  `${JSON.stringify({ runs, theme, baselines, results }, null, 2)}\n`,
);
console.log(resolve(runDir, "memory.json"));

function measure(implementation, document, fragment) {
  const [command, args] = commandFor(implementation);
  const stdout = execFileSync(command, [...args, document, ...(fragment ? [fragment] : [])], {
    cwd: repoDir,
    encoding: "utf8",
  });
  const { peakRssBytes } = JSON.parse(stdout);
  if (!Number.isSafeInteger(peakRssBytes) || peakRssBytes <= 0) {
    throw new Error(`${implementation} reported no peak RSS for ${document}`);
  }
  return peakRssBytes;
}

function commandFor(implementation) {
  if (implementation === "baseline-node") return [process.execPath, [javascriptEntry, "baseline"]];
  if (implementation === "baseline-rust") return [rustBinary, ["baseline"]];
  return implementationById(implementation).runner === "criterion"
    ? [rustBinary, [implementation]]
    : [process.execPath, [javascriptEntry, implementation]];
}

function median(values) {
  const sorted = values.toSorted((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const [leftLabel, rightLabel] = process.argv.slice(2);
if (!leftLabel || !rightLabel) throw new Error("usage: compare.mjs <left-label> <right-label>");

function parseJson(source, label) {
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`invalid summary for ${label}: ${error.message}`, { cause: error });
  }
}

async function load(label) {
  const path = resolve(repoDir, "target/benchmarks/staged", label, "run/summary.json");
  return { label, path, report: parseJson(await readFile(path, "utf8"), label) };
}

function rows(report) {
  const values = new Map();
  for (const row of report.rustWarm ?? []) values.set(`rust-warm/${row.id}`, row.medianNs);
  for (const entry of report.rustFirst ?? []) {
    for (const row of entry.report.results) {
      values.set(`rust-first/${entry.path}/${row.command}`, row.median * 1e9);
    }
  }
  for (const row of report.jsWarm ?? []) values.set(`js-warm/${row.id}`, row.medianNs);
  for (const row of report.jsFirst ?? []) {
    values.set(`js-first/${row.id}`, row.externalMedianNs);
  }
  for (const cliReport of report.cli ?? []) {
    for (const row of cliReport.results) {
      values.set(`cli/${cliReport.path}/${row.command}`, row.medianSeconds * 1e9);
    }
  }
  for (const row of report.memory?.results ?? []) {
    if (row.supported) values.set(`memory/${row.label}/${row.fixture}`, row.peakRssBytes);
  }
  return values;
}

const left = await load(leftLabel);
const right = await load(rightLabel);
const leftRows = rows(left.report);
const rightRows = rows(right.report);
const comparisons = [];
for (const [id, leftValue] of leftRows) {
  const rightValue = rightRows.get(id);
  if (rightValue === undefined || leftValue === null || rightValue === null) continue;
  comparisons.push({
    id,
    left: leftValue,
    right: rightValue,
    ratio: rightValue / leftValue,
    changePercent: ((rightValue - leftValue) / leftValue) * 100,
  });
}

const report = {
  schemaVersion: 1,
  left: { label: left.label, path: left.path },
  right: { label: right.label, path: right.path },
  comparisons,
};
const output = resolve(repoDir, "target/benchmarks/staged", `${leftLabel}-vs-${rightLabel}.json`);
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(output);
for (const row of comparisons) {
  console.log(`${row.changePercent.toFixed(2).padStart(8)}%  ${row.id}`);
}

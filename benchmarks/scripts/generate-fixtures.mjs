#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const manifestPath = resolve(benchmarksDir, "fixtures/manifest.json");
const outputDir = resolve(repoDir, "target/benchmarks/fixtures");
const outputPath = resolve(outputDir, "rust-large.rs");
function parseManifest(source) {
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`invalid fixture manifest: ${error.message}`, { cause: error });
  }
}

const manifest = parseManifest(await readFile(manifestPath, "utf8"));
const spec = manifest.fixtures.find((fixture) => fixture.id === "rust-large");

if (!spec) throw new Error("rust-large fixture is missing from manifest.json");

const lines = [
  "//! Deterministic generated Rust benchmark input.",
  "#![allow(dead_code)]",
  "",
  "pub trait Measure {",
  "    fn measure(&self) -> u64;",
  "}",
  "",
];

for (let index = 0; index < spec.generator.modules; index += 1) {
  const id = String(index).padStart(4, "0");
  const factor = (index % 97) + 3;
  const offset = (index * 17) % 251;
  const variant = index % 4;
  lines.push(
    `pub mod block_${id} {`,
    "    use super::Measure;",
    "",
    `    pub const LABEL: &str = r#"block-${id}: <tag attr='${factor}'>& data"#;`,
    "",
    "    #[derive(Debug, Clone, Copy, PartialEq, Eq)]",
    "    pub struct Record {",
    "        pub id: u32,",
    "        pub weight: u64,",
    "    }",
    "",
    "    #[derive(Debug, Clone, Copy, PartialEq, Eq)]",
    "    pub enum State {",
    "        Ready(Record),",
    "        Waiting { retries: u8 },",
    "        Finished,",
    "    }",
    "",
    "    impl Measure for Record {",
    "        fn measure(&self) -> u64 {",
    `            self.weight.wrapping_mul(${factor}).wrapping_add(self.id as u64)`,
    "        }",
    "    }",
    "",
    "    pub fn classify(value: u64) -> State {",
    `        match value % 4 {`,
    `            ${variant} => State::Ready(Record { id: ${index}, weight: value }),`,
    "            1 => State::Waiting { retries: (value % 8) as u8 },",
    "            _ => State::Finished,",
    "        }",
    "    }",
    "",
    "    pub fn checksum(seed: u64) -> u64 {",
    `        let values = [seed, seed.rotate_left(${index % 63}), seed ^ ${offset}];`,
    "        values",
    "            .iter()",
    "            .copied()",
    "            .enumerate()",
    "            .map(|(position, value)| {",
    "                let record = Record { id: position as u32, weight: value };",
    "                record.measure() ^ (LABEL.len() as u64)",
    "            })",
    "            .fold(0, u64::wrapping_add)",
    "    }",
    "}",
    "",
  );
}

lines.push("pub const RUNNERS: &[fn(u64) -> u64] = &[");
for (let index = 0; index < spec.generator.modules; index += 1) {
  lines.push(`    block_${String(index).padStart(4, "0")}::checksum,`);
}
lines.push(
  "];",
  "",
  "pub fn run_all(seed: u64) -> u64 {",
  "    RUNNERS",
  "        .iter()",
  "        .enumerate()",
  "        .map(|(index, run)| run(seed.wrapping_add(index as u64)))",
  "        .fold(0, u64::wrapping_add)",
  "}",
  "",
);

const source = `${lines.join("\n")}\n`;
const sha256 = createHash("sha256").update(source).digest("hex");
const bytes = Buffer.byteLength(source);
const lineCount = source.split("\n").length - 1;

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, source);

console.log(
  JSON.stringify({ id: spec.id, path: outputPath, sha256, bytes, lines: lineCount }, null, 2),
);

if (spec.sha256 && spec.sha256 !== sha256) {
  throw new Error(`rust-large SHA-256 mismatch: expected ${spec.sha256}, got ${sha256}`);
}
if (bytes < spec.minBytes) {
  throw new Error(
    `rust-large is too small: expected at least ${spec.minBytes} bytes, got ${bytes}`,
  );
}
if (lineCount < spec.minLines) {
  throw new Error(
    `rust-large has too few lines: expected at least ${spec.minLines}, got ${lineCount}`,
  );
}

#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const manifestPath = resolve(benchmarksDir, "fixtures/manifest.json");

function parseJson(source, label) {
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`invalid ${label}: ${error.message}`, { cause: error });
  }
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: repoDir, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed\n${result.stdout ?? ""}${result.stderr ?? ""}`,
    );
  }
}

run(process.execPath, [resolve(benchmarksDir, "scripts/generate-fixtures.mjs")]);

const manifest = parseJson(await readFile(manifestPath, "utf8"), "fixture manifest");
const rustcOutputDir = resolve(repoDir, "target/benchmarks/fixture-validation");
await mkdir(rustcOutputDir, { recursive: true });

const verified = [];
for (const fixture of manifest.fixtures) {
  const path = resolve(repoDir, fixture.path);
  const source = await readFile(path);
  const text = source.toString("utf8");
  const sha256 = createHash("sha256").update(source).digest("hex");
  const lines = text.split("\n").length - (text.endsWith("\n") ? 1 : 0);

  if (text.includes("\r\n")) throw new Error(`${fixture.id} must use LF line endings`);
  if (sha256 !== fixture.sha256) {
    throw new Error(`${fixture.id} SHA-256 mismatch: expected ${fixture.sha256}, got ${sha256}`);
  }
  if (source.length < fixture.minBytes) {
    throw new Error(`${fixture.id} is too small: ${source.length} < ${fixture.minBytes}`);
  }
  if (lines < fixture.minLines) {
    throw new Error(`${fixture.id} has too few lines: ${lines} < ${fixture.minLines}`);
  }

  run("rustc", [
    "--edition=2021",
    "--crate-type=lib",
    "--emit=metadata",
    "-Awarnings",
    path,
    "-o",
    resolve(rustcOutputDir, `${fixture.id}.rmeta`),
  ]);

  verified.push({ id: fixture.id, path, sha256, bytes: source.length, lines });
}

console.log(JSON.stringify({ schemaVersion: manifest.schemaVersion, fixtures: verified }, null, 2));

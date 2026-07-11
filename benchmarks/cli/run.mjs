#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { cases, command, findHyperfine } from "./cases.mjs";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const scenario = process.argv[2] ?? "repeat-use";
const fixtureSelection = process.env.BENCH_FIXTURE ?? "all";
const outputDir = resolve(
  process.env.BENCH_OUTPUT_DIR ?? resolve(repoDir, "target/benchmarks/runs/current"),
);
const prepareScript = resolve(benchmarksDir, "scripts/prepare-cli-cache.mjs");
const cacheRoot = resolve(repoDir, "target/benchmarks/cli-cache", scenario);
const dataDir = resolve(cacheRoot, "data");
const homeDir = resolve(cacheRoot, "home");
const xdgCacheDir = resolve(cacheRoot, "xdg-cache");
const fixtures = [
  { name: "small", path: resolve(benchmarksDir, "fixtures/rust-small.rs") },
  { name: "large", path: resolve(repoDir, "target/benchmarks/fixtures/rust-large.rs") },
].filter((fixture) => fixtureSelection === "all" || fixture.name === fixtureSelection);

if (scenario !== "first-use" && scenario !== "repeat-use") {
  throw new Error("usage: run.mjs <first-use|repeat-use>");
}
if (fixtures.length === 0) throw new Error(`unknown BENCH_FIXTURE: ${fixtureSelection}`);

await mkdir(outputDir, { recursive: true });
const hyperfine = findHyperfine();
const prepare = command(process.execPath, [prepareScript, scenario]);

if (scenario === "repeat-use") {
  const seeded = spawnSync(process.execPath, [prepareScript, scenario], {
    cwd: repoDir,
    encoding: "utf8",
  });
  if (seeded.status !== 0) throw new Error(`failed to seed repeat-use cache: ${seeded.stderr}`);
}

const env = {
  ...process.env,
  HOME: homeDir,
  XDG_CACHE_HOME: xdgCacheDir,
  LUMIS_DATA_DIR: dataDir,
  BAT_OPTS: "",
  BAT_PAGER: "cat",
  PAGER: "cat",
  CLICOLOR_FORCE: "1",
};
delete env.NO_COLOR;

if (scenario === "first-use") {
  const reset = spawnSync(process.execPath, [prepareScript, scenario], {
    cwd: repoDir,
    encoding: "utf8",
  });
  if (reset.status !== 0) throw new Error(`failed to reset first-use cache: ${reset.stderr}`);

  const shim = resolve(repoDir, "target/benchmarks/npm-cli/bin/lumis");
  const preflight = spawnSync(
    shim,
    [
      "--data-dir",
      dataDir,
      "highlight",
      "--language",
      "rust",
      "--theme",
      "github_dark",
      fixtures[0].path,
    ],
    { cwd: repoDir, env, encoding: "utf8", stdio: ["ignore", "ignore", "pipe"] },
  );
  if (preflight.status !== 0) {
    throw new Error(`first-use download preflight failed: ${preflight.stderr}`);
  }
  const parserPath = resolve(dataDir, "parsers/tree-sitter-rust.wasm");
  if (!existsSync(parserPath)) throw new Error(`first-use download did not create ${parserPath}`);
  const parser = await readFile(parserPath);
  await writeFile(
    resolve(outputDir, "cli-first-use-download.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        url: "https://unpkg.com/@lumis-sh/wasm-rust@latest/tree-sitter-rust.wasm",
        bytes: parser.length,
        sha256: createHash("sha256").update(parser).digest("hex"),
      },
      null,
      2,
    )}\n`,
  );

  const restore = spawnSync(process.execPath, [prepareScript, scenario], {
    cwd: repoDir,
    encoding: "utf8",
  });
  if (restore.status !== 0) throw new Error(`failed to restore first-use cache: ${restore.stderr}`);
}

for (const fixture of fixtures) {
  const benchmarkCases = cases({
    repoDir,
    fixture: fixture.path,
    dataDir,
    includeNative: scenario === "repeat-use",
  });
  const output = resolve(outputDir, `cli-${scenario}-${fixture.name}.json`);
  const args = ["--style", "basic", "--export-json", output];

  if (scenario === "first-use") {
    args.push("--runs", process.env.BENCH_RUNS ?? "3", "--prepare", prepare);
  } else {
    args.push(
      "--warmup",
      process.env.BENCH_WARMUP ?? "2",
      "--min-runs",
      process.env.BENCH_RUNS ?? "8",
    );
  }
  for (const benchmarkCase of benchmarkCases) {
    args.push("--command-name", benchmarkCase.name, benchmarkCase.command);
  }

  const result = spawnSync(hyperfine, args, { cwd: repoDir, env, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(
      `hyperfine failed for ${scenario}/${fixture.name}\n${result.stdout}${result.stderr}`,
    );
  }
  process.stdout.write(result.stdout);
  console.log(output);
}

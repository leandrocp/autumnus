#!/usr/bin/env node

import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const outputPath = resolve(
  process.env.BENCH_OUTPUT ?? resolve(repoDir, "target/benchmarks/runs/current/memory.json"),
);
const timeCommand = "/usr/bin/time";
const fixtures = [
  { name: "small", path: resolve(benchmarksDir, "fixtures/rust-small.rs") },
  { name: "large", path: resolve(repoDir, "target/benchmarks/fixtures/rust-large.rs") },
];

async function commandExists(command) {
  if (command.includes("/")) {
    try {
      await access(command);
      return true;
    } catch {
      return false;
    }
  }
  const result = spawnSync(command, ["--version"], { stdio: "ignore" });
  return !result.error && result.status === 0;
}

function parsePeakRss(stderr) {
  if (process.platform === "linux") {
    const match = stderr.match(/Maximum resident set size \(kbytes\):\s*(\d+)/);
    return match ? Number.parseInt(match[1], 10) * 1024 : null;
  }
  if (process.platform === "darwin") {
    const match = stderr.match(/\s*(\d+)\s+maximum resident set size/);
    return match ? Number.parseInt(match[1], 10) : null;
  }
  return null;
}

function measure(label, fixture, command, args, env = process.env) {
  const timeArgs = [process.platform === "darwin" ? "-l" : "-v", command, ...args];
  const result = spawnSync(timeCommand, timeArgs, {
    cwd: repoDir,
    env,
    encoding: "utf8",
    stdio: ["ignore", "ignore", "pipe"],
  });
  const peakRssBytes = parsePeakRss(result.stderr ?? "");
  return {
    label,
    fixture: fixture.name,
    command,
    status: result.status,
    peakRssBytes,
    supported: result.status === 0 && peakRssBytes !== null,
    error: result.status === 0 ? null : (result.stderr ?? "").trim(),
  };
}

const report = {
  schemaVersion: 1,
  memorySupported:
    ["linux", "darwin"].includes(process.platform) && (await commandExists(timeCommand)),
  platform: process.platform,
  source: process.platform === "linux" ? "gnu-time-v" : "bsd-time-l",
  semantics:
    "peak RSS for the measured command; child-process coverage follows the platform time implementation",
  results: [],
};

if (report.memorySupported) {
  const rustTarget = resolve(repoDir, "target/benchmarks/rust-target/release");
  const jsDir = resolve(benchmarksDir, "javascript/src");
  const shim = resolve(repoDir, "target/benchmarks/npm-cli/bin/lumis");
  const native = resolve(repoDir, "target/release/lumis");
  const prepare = spawnSync(
    process.execPath,
    [resolve(benchmarksDir, "scripts/prepare-cli-cache.mjs"), "repeat-use"],
    { cwd: repoDir, encoding: "utf8" },
  );
  if (prepare.status !== 0)
    throw new Error(`failed to prepare CLI memory cache: ${prepare.stderr}`);

  const cacheRoot = resolve(repoDir, "target/benchmarks/cli-cache/repeat-use");
  const dataDir = resolve(cacheRoot, "data");
  const cliEnv = {
    ...process.env,
    HOME: resolve(cacheRoot, "home"),
    XDG_CACHE_HOME: resolve(cacheRoot, "xdg-cache"),
    LUMIS_DATA_DIR: dataDir,
    BAT_OPTS: "",
    BAT_PAGER: "cat",
    PAGER: "cat",
  };
  delete cliEnv.NO_COLOR;

  for (const fixture of fixtures) {
    report.results.push(
      measure("rust-lumis-first-render", fixture, resolve(rustTarget, "lumis-first-render"), [
        fixture.path,
      ]),
      measure("rust-syntect-first-render", fixture, resolve(rustTarget, "syntect-first-render"), [
        fixture.path,
      ]),
      measure("js-lumis-first-render", fixture, process.execPath, [
        resolve(jsDir, "first-render-lumis.mjs"),
        fixture.path,
      ]),
      measure("js-shiki-first-render", fixture, process.execPath, [
        resolve(jsDir, "first-render-shiki.mjs"),
        fixture.path,
      ]),
    );

    const lumisArgs = [
      "--data-dir",
      dataDir,
      "highlight",
      "--language",
      "rust",
      "--formatter",
      "terminal",
      "--theme",
      "github_dark",
      fixture.path,
    ];
    report.results.push(
      measure("cli-lumis-npm-repeat-use", fixture, shim, lumisArgs, cliEnv),
      measure("cli-lumis-native-repeat-use", fixture, native, lumisArgs, cliEnv),
    );

    const bat = (await commandExists("bat"))
      ? "bat"
      : (await commandExists("batcat"))
        ? "batcat"
        : null;
    if (bat) {
      report.results.push(
        measure(
          "cli-bat",
          fixture,
          bat,
          [
            "--no-config",
            "--paging=never",
            "--style=plain",
            "--color=always",
            "--language=rust",
            "--theme=Monokai Extended",
            fixture.path,
          ],
          cliEnv,
        ),
      );
    }
  }
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(outputPath);

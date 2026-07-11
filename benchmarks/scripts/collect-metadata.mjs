#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, stat, writeFile, mkdir } from "node:fs/promises";
import { cpus, freemem, hostname, platform, release, totalmem } from "node:os";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const outputPath = resolve(
  process.env.BENCH_OUTPUT ?? resolve(repoDir, "target/benchmarks/runs/current/metadata.json"),
);

function commandVersion(command, args = ["--version"]) {
  const result = spawnSync(command, args, { cwd: repoDir, encoding: "utf8" });
  if (result.error || result.status !== 0) return null;
  return `${result.stdout}${result.stderr}`.trim().split("\n")[0];
}

async function sha256(path) {
  try {
    return createHash("sha256")
      .update(await readFile(path))
      .digest("hex");
  } catch {
    return null;
  }
}

async function fileMetadata(path) {
  try {
    const info = await stat(path);
    return { path, bytes: info.size, sha256: await sha256(path) };
  } catch {
    return { path, missing: true };
  }
}

async function readJsonIfExists(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

const gitStatus = spawnSync("git", ["status", "--porcelain"], {
  cwd: repoDir,
  encoding: "utf8",
});
const gitCommit = commandVersion("git", ["rev-parse", "HEAD"]);
const cpuList = cpus();
const parserPath = resolve(
  repoDir,
  "target/benchmarks/cli-cache/repeat-use/data/parsers/tree-sitter-rust.wasm",
);

const metadata = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  git: {
    commit: gitCommit,
    branch: commandVersion("git", ["branch", "--show-current"]),
    dirty: gitStatus.status === 0 ? gitStatus.stdout.trim().length > 0 : null,
  },
  host: {
    hostname: hostname(),
    platform: platform(),
    release: release(),
    architecture: process.arch,
    cpuModel: cpuList[0]?.model ?? null,
    logicalCores: cpuList.length,
    totalMemoryBytes: totalmem(),
    freeMemoryBytes: freemem(),
  },
  tools: {
    rustc: commandVersion("rustc"),
    cargo: commandVersion("cargo"),
    node: process.version,
    pnpm: commandVersion("pnpm"),
    mise: commandVersion("mise"),
    just: commandVersion("just"),
    hyperfine: commandVersion("hyperfine"),
    bat: commandVersion("bat") ?? commandVersion("batcat"),
  },
  locks: {
    cargo: await sha256(resolve(benchmarksDir, "rust/Cargo.lock")),
    pnpm: await sha256(resolve(repoDir, "pnpm-lock.yaml")),
    miseConfig: await sha256(resolve(benchmarksDir, "mise.toml")),
    miseLock: await sha256(resolve(benchmarksDir, "mise.lock")),
  },
  fixtures: await Promise.all([
    fileMetadata(resolve(benchmarksDir, "fixtures/rust-small.rs")),
    fileMetadata(resolve(repoDir, "target/benchmarks/fixtures/rust-large.rs")),
  ]),
  cliParserWasm: await fileMetadata(parserPath),
  cliFirstUseDownload: await readJsonIfExists(
    resolve(dirname(outputPath), "cli-first-use-download.json"),
  ),
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(metadata, null, 2)}\n`);
console.log(outputPath);

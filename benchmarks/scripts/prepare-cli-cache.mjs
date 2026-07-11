#!/usr/bin/env node

import { access, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const mode = process.argv[2];
const cacheRoot = resolve(repoDir, "target/benchmarks/cli-cache", mode ?? "invalid");
const dataDir = resolve(cacheRoot, "data");
const homeDir = resolve(cacheRoot, "home");
const xdgCacheDir = resolve(cacheRoot, "xdg-cache");
const parserPath = resolve(dataDir, "parsers/tree-sitter-rust.wasm");
const shim = resolve(repoDir, "target/benchmarks/npm-cli/bin/lumis");
const fixture = resolve(benchmarksDir, "fixtures/rust-small.rs");

if (mode !== "first-use" && mode !== "repeat-use") {
  throw new Error("usage: prepare-cli-cache.mjs <first-use|repeat-use>");
}

await rm(cacheRoot, { recursive: true, force: true });
await mkdir(dataDir, { recursive: true });
await mkdir(homeDir, { recursive: true });
await mkdir(xdgCacheDir, { recursive: true });

if (mode === "repeat-use") {
  const result = spawnSync(
    shim,
    ["--data-dir", dataDir, "highlight", "--language", "rust", "--theme", "github_dark", fixture],
    {
      cwd: repoDir,
      env: {
        ...process.env,
        HOME: homeDir,
        XDG_CACHE_HOME: xdgCacheDir,
        LUMIS_DATA_DIR: dataDir,
        LUMIS_CONFIG: resolve(cacheRoot, "missing-config.toml"),
        NO_COLOR: "",
      },
      stdio: ["ignore", "ignore", "pipe"],
      encoding: "utf8",
    },
  );
  if (result.status !== 0) {
    throw new Error(`failed to seed CLI cache: ${result.stderr}`);
  }
  await access(parserPath);
} else {
  try {
    await access(parserPath);
    throw new Error(`first-use parser unexpectedly exists at ${parserPath}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

console.log(JSON.stringify({ mode, cacheRoot, dataDir, homeDir, xdgCacheDir, parserPath }));

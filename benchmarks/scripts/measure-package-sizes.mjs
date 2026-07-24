#!/usr/bin/env node

import { execFile as execFileCallback } from "node:child_process";
import { gzipSync } from "node:zlib";
import { createRequire } from "node:module";
import { mkdir, mkdtemp, readFile, realpath, rm, stat, writeFile } from "node:fs/promises";
import { cpus, platform, release, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFile = promisify(execFileCallback);
const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const runDir = resolve(
  process.env.BENCH_RUN_DIR ?? resolve(repoDir, "target/benchmarks/runs/current"),
);
const releaseDir = resolve(
  process.env.CARGO_TARGET_DIR ?? resolve(repoDir, "target/benchmarks/rust-target"),
  "release",
);
const requestedGroup = process.env.BENCH_PACKAGE_SIZE_GROUP;
const groups = requestedGroup
  ? new Set([requestedGroup])
  : new Set(["javascript", "rust", "cli", "elixir"]);
const validGroups = new Set(["javascript", "rust", "cli", "elixir"]);
if ([...groups].some((group) => !validGroups.has(group))) {
  throw new Error(`unknown package-size group: ${requestedGroup}`);
}
const temporaryDir = await mkdtemp(join(tmpdir(), "lumis-package-sizes-"));

try {
  const entries = [];
  if (groups.has("javascript")) {
    const lumisPackages = await packageClosure(
      resolve(repoDir, "packages/javascript/lumis"),
      temporaryDir,
    );
    const shikiPackages = await packageClosure(
      resolve(repoDir, "benchmarks/javascript/node_modules/shiki"),
      temporaryDir,
    );
    const parserPackages = new Map();
    for (const language of [
      "c",
      "css",
      "go",
      "html",
      "java",
      "javascript",
      "json",
      "python",
      "ruby",
      "rust",
    ]) {
      parserPackages.set(
        language,
        await packageClosure(
          resolve(repoDir, `benchmarks/javascript/node_modules/@lumis-sh/wasm-${language}`),
          temporaryDir,
        ),
      );
    }
    entries.push(
      packageEntry(
        "Lumis JS WASM (runtime)",
        "npm production closure; parsers load on demand",
        lumisPackages,
      ),
      packageEntry(
        "Lumis JS WASM (1 language)",
        "npm production closure plus Rust parser",
        combinePackages(lumisPackages, parserPackages.get("rust")),
      ),
      packageEntry(
        "Lumis JS WASM (10 languages)",
        "npm production closure plus benchmark parsers",
        combinePackages(lumisPackages, ...parserPackages.values()),
      ),
      packageEntry("Shiki 4.3.1", "npm production closure", shikiPackages),
    );
  }

  if (groups.has("rust")) {
    entries.push(
      await binaryEntry(
        "Lumis Rust",
        "stripped 10-language benchmark executable",
        resolve(releaseDir, "lumis-size"),
      ),
      await binaryEntry(
        "syntect 5.3",
        "stripped default-syntax benchmark executable",
        resolve(releaseDir, "syntect-size"),
      ),
    );
  }

  if (groups.has("cli")) {
    entries.push(
      await binaryEntry(
        "Lumis CLI",
        "stripped release executable",
        resolve(releaseDir, executableName("lumis")),
      ),
      await binaryEntry(
        "bat 0.26.1",
        "release executable",
        requiredEnvironment("BAT_BINARY"),
      ),
    );
  }

  if (groups.has("elixir")) {
    entries.push(
      await binaryEntry(
        "Lumis Elixir",
        "stripped release NIF shared library",
        await nifPath(releaseDir),
      ),
    );
  }

  const report = {
    schemaVersion: 1,
    group: requestedGroup ?? "all",
    system: {
      platform: platform(),
      release: release(),
      architecture: process.arch,
      cpu: cpus()[0]?.model ?? "unknown",
    },
    boundaries: {
      npm: "sum of npm pack archives and unpacked bytes for the unique production dependency closure",
      native:
        "raw local release artifact and the same bytes compressed with deterministic gzip level 9",
    },
    entries,
  };
  const output = requestedGroup
    ? resolve(runDir, "package-sizes", `${requestedGroup}.json`)
    : resolve(runDir, "package-sizes.json");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(output);
} finally {
  await rm(temporaryDir, { recursive: true, force: true });
}

async function packageClosure(packageDir, packRoot) {
  const packages = new Map();
  const queue = [await realpath(packageDir)];
  while (queue.length > 0) {
    const directory = queue.shift();
    const manifest = JSON.parse(await readFile(resolve(directory, "package.json"), "utf8"));
    const key = `${manifest.name}@${manifest.version}`;
    if (packages.has(key)) continue;

    const packed = await packPackage(directory, key, packRoot);
    packages.set(key, {
      key,
      name: manifest.name,
      version: manifest.version,
      packedBytes: packed.size,
      unpackedBytes: packed.unpackedSize,
    });

    for (const dependency of Object.keys({
      ...manifest.dependencies,
      ...manifest.optionalDependencies,
    })) {
      try {
        queue.push(await resolvePackageDirectory(directory, dependency));
      } catch (error) {
        if (manifest.optionalDependencies?.[dependency]) continue;
        throw new Error(`${key} is missing production dependency ${dependency}`, {
          cause: error,
        });
      }
    }
  }
  return packages;
}

async function resolvePackageDirectory(directory, name) {
  for (const candidate of [
    resolve(directory, "node_modules", name),
    resolve(dirname(directory), name),
  ]) {
    try {
      const resolved = await realpath(candidate);
      const manifest = JSON.parse(await readFile(resolve(resolved, "package.json"), "utf8"));
      if (manifest.name === name) return resolved;
    } catch {
      // Fall back to Node's package resolution.
    }
  }

  const require = createRequire(resolve(directory, "package.json"));
  try {
    return dirname(await realpath(require.resolve(`${name}/package.json`)));
  } catch (error) {
    if (error.code !== "ERR_PACKAGE_PATH_NOT_EXPORTED") throw error;
  }

  let candidate = dirname(await realpath(require.resolve(name)));
  while (true) {
    try {
      const manifest = JSON.parse(await readFile(resolve(candidate, "package.json"), "utf8"));
      if (manifest.name === name) return candidate;
    } catch {
      // Continue walking from an exported file to its package root.
    }
    const parent = dirname(candidate);
    if (parent === candidate) throw new Error(`could not resolve package root for ${name}`);
    candidate = parent;
  }
}

async function packPackage(directory, key, packRoot) {
  const destination = resolve(
    packRoot,
    key.replaceAll("/", "_").replaceAll("@", "_").replaceAll(":", "_"),
  );
  await mkdir(destination, { recursive: true });
  const args = [
    "pack",
    "--json",
    "--ignore-scripts",
    "--pack-destination",
    destination,
    directory,
  ];
  const npmCli = process.env.BENCH_NPM_CLI;
  const executable = npmCli ? process.execPath : "npm";
  const commandArgs = npmCli ? [npmCli, ...args] : args;
  let stdout;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      ({ stdout } = await execFile(executable, commandArgs, {
        env: {
          ...process.env,
          npm_config_cache: resolve(packRoot, "npm-cache"),
          npm_config_ignore_scripts: "true",
        },
        maxBuffer: 10 * 1024 * 1024,
      }));
      break;
    } catch (error) {
      if (attempt === 2 || !error.stderr?.includes("Exit handler never called")) throw error;
      console.warn(`npm pack hit npm's exit-handler failure for ${key}; retrying once`);
    }
  }
  const result = JSON.parse(stdout).at(-1);
  if (!result || !Number.isSafeInteger(result.size) || !Number.isSafeInteger(result.unpackedSize)) {
    throw new Error(`npm pack returned invalid sizes for ${key}`);
  }
  return result;
}

function combinePackages(...collections) {
  const combined = new Map();
  for (const collection of collections) {
    for (const [key, value] of collection) combined.set(key, value);
  }
  return combined;
}

function packageEntry(label, artifact, packages) {
  return {
    label,
    artifact,
    format: "npm",
    rawBytes: sum(packages, "unpackedBytes"),
    compressedBytes: sum(packages, "packedBytes"),
    packageCount: packages.size,
  };
}

async function binaryEntry(label, artifact, path) {
  const bytes = await readFile(path);
  const details = await stat(path);
  if (!details.isFile() || bytes.length === 0) {
    throw new Error(`${label} artifact is missing or empty: ${path}`);
  }
  return {
    label,
    artifact,
    format: "native",
    rawBytes: bytes.length,
    compressedBytes: gzipSync(bytes, { level: 9, mtime: 0 }).length,
  };
}

async function nifPath(directory) {
  for (const filename of ["liblumis_nif.dylib", "liblumis_nif.so", "lumis_nif.dll"]) {
    const path = resolve(directory, filename);
    try {
      if ((await stat(path)).isFile()) return path;
    } catch {
      // Try the next platform filename.
    }
  }
  throw new Error(`could not find the Lumis NIF in ${directory}`);
}

function executableName(name) {
  return process.platform === "win32" ? `${name}.exe` : name;
}

function requiredEnvironment(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must point to the competitor artifact`);
  return value;
}

function sum(packages, field) {
  return [...packages.values()].reduce((total, entry) => total + entry[field], 0);
}

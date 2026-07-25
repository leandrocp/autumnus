#!/usr/bin/env node

import { execFile as execFileCallback } from "node:child_process";
import { gzipSync } from "node:zlib";
import { createRequire } from "node:module";
import { mkdir, mkdtemp, readFile, realpath, rm, stat, writeFile } from "node:fs/promises";
import { cpus, platform, release, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { implementationById } from "./implementations.mjs";

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
const requireFromScript = createRequire(import.meta.url);
const npmTarLibrary = process.env.BENCH_NPM_TAR
  ? requireFromScript(process.env.BENCH_NPM_TAR)
  : undefined;
const pnpmExecutable = process.env.BENCH_PNPM ?? "pnpm";
const requestedGroup = process.env.BENCH_PACKAGE_SIZE_GROUP;
const validGroups = new Set(["javascript", "rust", "cli", "elixir"]);
const groups = requestedGroup ? new Set([requestedGroup]) : validGroups;
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
    const highlightJsPackages = await packageClosure(
      resolve(repoDir, "benchmarks/javascript/node_modules/highlight.js"),
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
        "lumis-js-wasm",
        "runtime",
        "npm production closure; parsers load on demand",
        lumisPackages,
      ),
      packageEntry(
        "lumis-js-wasm",
        "1 language",
        "npm production closure plus Rust parser",
        combinePackages(lumisPackages, parserPackages.get("rust")),
      ),
      packageEntry(
        "lumis-js-wasm",
        "10 languages",
        "npm production closure plus benchmark parsers",
        combinePackages(lumisPackages, ...parserPackages.values()),
      ),
      packageEntry("shiki", undefined, "npm production closure", shikiPackages),
      packageEntry("highlight-js", undefined, "npm production closure", highlightJsPackages),
    );
  }

  if (groups.has("rust")) {
    entries.push(
      await binaryEntry(
        "lumis-rust",
        "stripped 10-language benchmark executable",
        resolve(releaseDir, "lumis-size"),
      ),
      await binaryEntry(
        "syntect",
        "stripped default-syntax benchmark executable",
        resolve(releaseDir, "syntect-size"),
      ),
    );
  }

  if (groups.has("cli")) {
    entries.push(
      await binaryEntry(
        "lumis-cli",
        "stripped release executable",
        resolve(releaseDir, executableName("lumis")),
      ),
      await binaryEntry("bat", "release executable", requiredEnvironment("BAT_BINARY")),
    );
  }

  if (groups.has("elixir")) {
    entries.push(
      await binaryEntry(
        "lumis-elixir",
        "stripped release NIF shared library",
        await nifPath(releaseDir),
      ),
    );
  }

  const report = {
    schemaVersion: 2,
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
  if (npmTarLibrary) {
    return packPackageWithPnpm(directory, key, packRoot);
  }

  const destination = resolve(
    packRoot,
    key.replaceAll("/", "_").replaceAll("@", "_").replaceAll(":", "_"),
  );
  await mkdir(destination, { recursive: true });
  const args = ["pack", "--json", "--ignore-scripts", "--pack-destination", destination, directory];
  let stdout;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      ({ stdout } = await execFile("npm", args, {
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

async function packPackageWithPnpm(directory, key, packRoot) {
  const pnpmDestination = resolve(packRoot, "pnpm");
  await mkdir(pnpmDestination, { recursive: true });
  const { stdout } = await execFile(
    pnpmExecutable,
    [
      "-C",
      directory,
      "--config.ignore-scripts=true",
      "pack",
      "--json",
      "--skip-manifest-obfuscation",
      "--pack-destination",
      pnpmDestination,
    ],
    { maxBuffer: 10 * 1024 * 1024 },
  );
  const packed = JSON.parse(stdout);
  if (!packed.filename) {
    throw new Error(`pnpm pack returned no archive for ${key}`);
  }

  // pnpm's archive has the same files as npm but different tar metadata.
  // Repack its ordered file list with npm's settings to retain exact npm sizes.
  const files = [];
  const fileListParser = npmTarLibrary.list({
    onReadEntry(entry) {
      files.push(entry.path.replace(/^package\//, ""));
    },
  });
  fileListParser.end(await readFile(packed.filename));
  const manifest = JSON.parse(await readFile(resolve(directory, "package.json"), "utf8"));
  const bins = new Set(
    typeof manifest.bin === "string" ? [manifest.bin] : Object.values(manifest.bin ?? {}),
  );
  const tarball = await npmTarLibrary
    .create(
      {
        cwd: directory,
        prefix: "package/",
        portable: true,
        sync: true,
        gzip: { level: 9 },
        mtime: new Date("1985-10-26T08:15:00.000Z"),
        filter(path, details) {
          if (bins.has(path.replace(/^[^\\/]*[\\/]/, ""))) details.mode |= 0o111;
          return true;
        },
      },
      files,
    )
    .concat();
  let unpackedSize = 0;
  const sizeParser = npmTarLibrary.list({
    onReadEntry(entry) {
      unpackedSize += entry.size;
    },
  });
  sizeParser.end(tarball);
  return { size: tarball.length, unpackedSize };
}

function combinePackages(...collections) {
  const combined = new Map();
  for (const collection of collections) {
    for (const [key, value] of collection) combined.set(key, value);
  }
  return combined;
}

function packageEntry(implementation, variant, artifact, packages) {
  implementationById(implementation);
  return {
    implementation,
    ...(variant && { variant }),
    artifact,
    format: "npm",
    rawBytes: sum(packages, "unpackedBytes"),
    compressedBytes: sum(packages, "packedBytes"),
    packageCount: packages.size,
  };
}

async function binaryEntry(implementation, artifact, path) {
  const label = implementationById(implementation).label;
  const bytes = await readFile(path);
  const details = await stat(path);
  if (!details.isFile() || bytes.length === 0) {
    throw new Error(`${label} artifact is missing or empty: ${path}`);
  }
  return {
    implementation,
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
  if (!value) throw new Error(`${name} must point to the comparison artifact`);
  return value;
}

function sum(packages, field) {
  return [...packages.values()].reduce((total, entry) => total + entry[field], 0);
}

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { applicationRuntimeDir, nsSince, prepareApplicationRuntime, repoDir } from "./common.mjs";

const samples = Number.parseInt(process.env.BENCH_SAMPLES ?? "10", 10);
const requestedOutput =
  process.env.BENCH_OUTPUT ?? "target/benchmarks/runs/current/application.json";
const outputPath = isAbsolute(requestedOutput)
  ? requestedOutput
  : resolve(repoDir, requestedOutput);
const executableSuffix = process.platform === "win32" ? ".exe" : "";
const rustTargetDir = resolve(repoDir, "target/benchmarks/rust-target/release");
const elixirDir = resolve(repoDir, "packages/elixir/lumis");
const fixturePath = resolve(repoDir, "benchmarks/fixtures/application.json");
await prepareApplicationRuntime();
const availableImplementations = [
  {
    name: "lumis-js-native",
    command: process.execPath,
    args: [fileURLToPath(new URL("./application-lumis.mjs", import.meta.url))],
    cwd: applicationRuntimeDir,
    env: {
      BENCH_IMPLEMENTATION: "lumis-js-native",
      LUMIS_DISABLE_NATIVE: "0",
      LUMIS_REQUIRE_NATIVE: "1",
    },
  },
  {
    name: "lumis-js-wasm",
    command: process.execPath,
    args: [fileURLToPath(new URL("./application-lumis.mjs", import.meta.url))],
    cwd: applicationRuntimeDir,
    env: {
      BENCH_IMPLEMENTATION: "lumis-js-wasm",
      LUMIS_DISABLE_NATIVE: "1",
      LUMIS_REQUIRE_NATIVE: "0",
    },
  },
  {
    name: "shiki",
    command: process.execPath,
    args: [fileURLToPath(new URL("./application-shiki.mjs", import.meta.url))],
    cwd: applicationRuntimeDir,
  },
  {
    name: "lumis-rust",
    command: resolve(rustTargetDir, `lumis-application${executableSuffix}`),
    args: [],
    cwd: repoDir,
  },
  {
    name: "syntect",
    command: resolve(rustTargetDir, `syntect-application${executableSuffix}`),
    args: [],
    cwd: repoDir,
  },
  {
    name: "lumis-elixir",
    command: process.platform === "win32" ? "mix.bat" : "mix",
    args: [
      "run",
      "--no-compile",
      "--no-deps-check",
      resolve(repoDir, "benchmarks/elixir/application.exs"),
    ],
    cwd: elixirDir,
    env: { MIX_ENV: "prod", BENCH_APPLICATION_FIXTURE: fixturePath },
  },
];
const requestedImplementations =
  process.env.BENCH_APPLICATION_IMPLEMENTATIONS?.split(",").filter(Boolean);
const implementations = requestedImplementations
  ? requestedImplementations.map((name) => {
      const implementation = availableImplementations.find((candidate) => candidate.name === name);
      if (!implementation) throw new Error(`unknown application implementation: ${name}`);
      return implementation;
    })
  : availableImplementations;
if (implementations.length === 0) {
  throw new Error("BENCH_APPLICATION_IMPLEMENTATIONS must select at least one implementation");
}

if (!Number.isSafeInteger(samples) || samples < 1) {
  throw new Error(`BENCH_SAMPLES must be a positive integer, got ${process.env.BENCH_SAMPLES}`);
}

function parseResult(source, implementation) {
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`${implementation} returned invalid JSON: ${source}`, { cause: error });
  }
}

const results = [];
for (let sample = 0; sample < samples; sample += 1) {
  const offset = sample % implementations.length;
  const sampleOrder = [...implementations.slice(offset), ...implementations.slice(0, offset)];
  for (const implementation of sampleOrder) {
    const started = process.hrtime.bigint();
    const child = spawnSync(implementation.command, implementation.args, {
      cwd: implementation.cwd,
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1", ...implementation.env },
    });
    const externalTotalNs = nsSince(started);
    if (child.status !== 0) {
      throw new Error(
        `${implementation.name} failed with status ${child.status}\n${child.stdout}${child.stderr}`,
      );
    }
    const result = parseResult(child.stdout.trim(), implementation.name);
    if (
      result.implementation !== implementation.name ||
      result.scenario !== "application-two-languages-six-snippets" ||
      result.languages?.length !== 2 ||
      result.snippetCount !== 6
    ) {
      throw new Error(`${implementation.name} returned incompatible application metadata`);
    }
    results.push({
      ...result,
      sample,
      externalTotalNs,
    });
  }
}

if (new Set(results.map((result) => result.inputBytes)).size !== 1) {
  throw new Error("application implementations did not consume the same input bytes");
}

const report = {
  schemaVersion: 1,
  runner: "node-child-process",
  node: process.version,
  fixture: fixturePath,
  samples,
  implementations: implementations.map(({ name }) => name),
  results,
};
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(outputPath);

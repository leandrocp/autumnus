import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const repoDir = resolve(benchmarksDir, "..");
export const applicationRuntimeDir = resolve(repoDir, "target/benchmarks/application-runtime");
export const fixtures = [
  { name: "small", path: resolve(benchmarksDir, "fixtures/rust-small.rs") },
  { name: "large", path: resolve(repoDir, "target/benchmarks/fixtures/rust-large.rs") },
];

export async function loadFixtures() {
  return Promise.all(
    fixtures.map(async (fixture) => ({ ...fixture, source: await readFile(fixture.path, "utf8") })),
  );
}

export async function prepareApplicationRuntime() {
  const cacheDir = resolve(applicationRuntimeDir, "node_modules/.cache/lumis");
  const diffWasm = fileURLToPath(import.meta.resolve("@lumis-sh/wasm-diff/tree-sitter-diff.wasm"));
  await mkdir(cacheDir, { recursive: true });
  await copyFile(diffWasm, resolve(cacheDir, "tree-sitter-diff-0.26.wasm"));
}

export function nsSince(started) {
  return Number(process.hrtime.bigint() - started);
}

export function assertHtml(output, inputBytes, implementation) {
  if (!output.includes("<pre") || !output.includes("<span") || output.length <= inputBytes) {
    throw new Error(`${implementation} did not produce expected highlighted HTML`);
  }
}

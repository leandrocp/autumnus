/**
 * Print the languages and parsers `languages.toml` declares.
 *
 * Usage: node scripts/list-parsers.mjs [--parsers|--pairs] [--unverified]
 *   default       language ids, one per line
 *   --parsers     tree-sitter parser names, deduplicated, for `mise run wasm-build`
 *   --pairs       `<language>\t<parser>`, for callers that must keep the two in step
 *   --unverified  only the languages whose installed `@lumis-sh/wasm-*` package cannot
 *                 verify their queries, because it is not installed or was built from a
 *                 different `languages.toml` revision. Maintains the waiver in
 *                 test/unverified-parsers.json, which may only shrink
 *
 * Several languages share one parser, so the language list and the parser list have
 * different lengths. Anything that shards this work must shard `--pairs` and derive
 * both sides from it; sharding the two lists independently puts a language in one
 * shard and its parser in another.
 */
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseToml } from "smol-toml";

const workspaceRoot = fileURLToPath(new URL("../../../../", import.meta.url));

const { parsers = {} } = parseToml(readFileSync(join(workspaceRoot, "languages.toml"), "utf8"));

function installedRevision(wasmPath) {
  const packageDirectory = dirname(wasmPath);
  const manifestPath = join(packageDirectory, "language.json");
  if (existsSync(manifestPath)) {
    const revision = JSON.parse(readFileSync(manifestPath, "utf8"))?.parser?.revision;
    if (revision) return revision;
  }
  return JSON.parse(readFileSync(join(packageDirectory, "package.json"), "utf8"))?.lumis?.rev;
}

function isVerifiable(bundleRequire, id, entry) {
  const parser = entry.wasm_name ?? `tree-sitter-${id}`;
  const packageName = `@lumis-sh/wasm-${parser.replace(/^tree-sitter-/, "")}`;
  let installed;
  try {
    installed = bundleRequire.resolve(`${packageName}/${parser}.wasm`);
  } catch {
    return false;
  }
  if (!existsSync(installed)) return false;
  return !entry.rev || installedRevision(installed) === entry.rev;
}

const wantParsers = process.argv.includes("--parsers");
const wantPairs = process.argv.includes("--pairs");
const onlyUnverified = process.argv.includes("--unverified");
const output = new Set();

// Resolving through the full bundle is what makes an installed parser visible, and
// it is only needed to answer whether one can verify itself.
const bundleRequire = onlyUnverified
  ? createRequire(createRequire(import.meta.url).resolve("@lumis-sh/wasm-bundle-full"))
  : undefined;

for (const [id, entry] of Object.entries(parsers)) {
  if (onlyUnverified && isVerifiable(bundleRequire, id, entry)) continue;
  const parser = entry.wasm_name ?? `tree-sitter-${id}`;
  if (wantPairs) output.add(`${id}\t${parser}`);
  else output.add(wantParsers ? parser : id);
}

for (const value of [...output].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))) console.log(value);

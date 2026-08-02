// The release workflow publishes every native package before `@lumis-sh/lumis`,
// and npm refuses to republish a name/version that already exists. pnpm also
// rewrites `workspace:*` to the workspace version when it packs, so a main
// package bumped on its own would ship optionalDependencies pointing at the
// previous native release.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const javascriptDir = dirname(dirname(fileURLToPath(import.meta.url)));
const lumisDir = join(javascriptDir, "lumis");
const nativeNpmDir = join(lumisDir, "native", "npm");

// Named rather than counted. A directory that disappears has to fail here, not
// silently shrink the set the release workflow publishes.
const PLATFORM_DIRS = [
  "darwin-arm64",
  "darwin-x64",
  "linux-arm64-gnu",
  "linux-x64-gnu",
  "win32-x64-msvc",
];
const SELECTOR_DIR = "meta";

const EXPECTED_NAMES = new Set([
  "@lumis-sh/lumis-native",
  ...PLATFORM_DIRS.map((target) => `@lumis-sh/lumis-native-${target}`),
]);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const mainPackage = readJson(join(lumisDir, "package.json"));
const expected = mainPackage.version;
const problems = [];

const cargo = readFileSync(join(lumisDir, "native", "Cargo.toml"), "utf8");
const cargoVersion = /^version\s*=\s*"([^"]+)"/m.exec(cargo)?.[1];
if (cargoVersion !== expected) {
  problems.push(`packages/javascript/lumis/native/Cargo.toml: ${cargoVersion ?? "no version"}`);
}

const present = new Set(readdirSync(nativeNpmDir));
for (const directory of [SELECTOR_DIR, ...PLATFORM_DIRS]) {
  const relative = `packages/javascript/lumis/native/npm/${directory}`;
  if (!present.has(directory)) {
    problems.push(`${relative}: missing`);
    continue;
  }
  present.delete(directory);

  const manifest = readJson(join(nativeNpmDir, directory, "package.json"));
  if (!EXPECTED_NAMES.has(manifest.name)) {
    problems.push(`${relative}: unexpected name ${manifest.name}`);
  }
  if (manifest.version !== expected) {
    problems.push(`${relative}: ${manifest.version}`);
  }
}

for (const extra of present) {
  problems.push(
    `packages/javascript/lumis/native/npm/${extra}: not published by javascript-release.yml`,
  );
}

// The main package pins these as optional dependencies, and pnpm rewrites
// `workspace:*` at pack time, so a missing entry ships a broken tarball.
const optional = Object.keys(mainPackage.optionalDependencies ?? {});
for (const target of PLATFORM_DIRS) {
  const name = `@lumis-sh/lumis-native-${target}`;
  if (!optional.includes(name)) {
    problems.push(`packages/javascript/lumis/package.json: ${name} is not an optionalDependency`);
  }
}

if (problems.length > 0) {
  console.error(
    `@lumis-sh/lumis is ${expected}; the native packages must match and be complete:\n` +
      problems.map((problem) => `  ${problem}`).join("\n") +
      "\n\n`mise run release-prepare npm-lumis <version>` bumps all of them together.",
  );
  process.exit(1);
}

console.log(`${PLATFORM_DIRS.length + 2} native manifests are at ${expected}`);

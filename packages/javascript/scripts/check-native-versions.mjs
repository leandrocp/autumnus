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

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const expected = readJson(join(lumisDir, "package.json")).version;

const manifests = [
  ["packages/javascript/lumis/native/Cargo.toml", readCargoVersion()],
  ...readdirSync(nativeNpmDir).map((entry) => {
    const path = join(nativeNpmDir, entry, "package.json");
    return [`packages/javascript/lumis/native/npm/${entry}/package.json`, readJson(path).version];
  }),
];

function readCargoVersion() {
  const manifest = readFileSync(join(lumisDir, "native", "Cargo.toml"), "utf8");
  const match = /^version\s*=\s*"([^"]+)"/m.exec(manifest);
  if (!match) throw new Error("native/Cargo.toml has no version");
  return match[1];
}

if (manifests.length < 6) {
  throw new Error(`expected at least 6 native manifests, found ${manifests.length}`);
}

const drifted = manifests.filter(([, version]) => version !== expected);

if (drifted.length > 0) {
  const detail = drifted.map(([path, version]) => `  ${path}: ${version}`).join("\n");
  console.error(
    `@lumis-sh/lumis is ${expected} but these are not:\n${detail}\n\n` +
      "`mise run prepare-release npm-lumis <version>` bumps all of them together.",
  );
  process.exit(1);
}

console.log(`${manifests.length} native manifests are at ${expected}`);

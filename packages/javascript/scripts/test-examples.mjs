import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  globSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import semver from "semver";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { update: { type: "boolean", default: false } },
});
const javascriptDir = fileURLToPath(new URL("../", import.meta.url));
const packages = ["themes", "lumis", "rehype-lumis", "markdown-it-lumis", "react", "vite"];
const manifests = globSync(["*/examples/package.json", "*/examples/*/package.json"], {
  cwd: javascriptDir,
}).sort();
assert.ok(manifests.length >= 15, `Expected at least 15 examples, found ${manifests.length}`);
const examples = manifests.map((manifest) => manifest.slice(0, -"/package.json".length));
for (const selected of positionals) {
  assert.ok(examples.includes(selected), `Unknown example: ${selected}`);
}
const project = mkdtempSync(join(tmpdir(), "lumis-examples-"));

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function run(args, cwd) {
  execFileSync("pnpm", args, {
    cwd,
    stdio: "inherit",
    timeout: 600_000,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", NUXT_TELEMETRY_DISABLED: "1" },
  });
}

function pack(directory) {
  const source = join(javascriptDir, directory);
  const manifest = readJson(join(source, "package.json"));
  const tarball = join(project, `${manifest.name.replaceAll("/", "-")}.tgz`);
  run(["--config.ignore-scripts=true", "pack", "--out", tarball], source);
  return { ...manifest, spec: `file:${tarball}` };
}

function checkDependencies(manifest, localPackages) {
  const dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
  for (const dependency of localPackages) {
    const range = dependencies[dependency.name];
    if (range === undefined) continue;
    assert.ok(
      semver.satisfies(dependency.version, range),
      `${manifest.name}: ${dependency.name} ${range} excludes workspace ${dependency.version}`,
    );
  }
  assert.ok(dependencies["@lumis-sh/lumis"], `${manifest.name} must declare Lumis`);
  assert.ok(
    Object.keys(dependencies).some((name) => name.startsWith("@lumis-sh/wasm-")),
    `${manifest.name} must declare its parsers`,
  );
}

function checkRender(source, consumer) {
  const output = join(consumer, "output.html");
  const html = readFileSync(output, "utf8");
  assert.match(html, /<span[^>]*style="[^"]*color:/u, `${source} did not highlight tokens`);
  const snapshot = join(source, "output.html");
  assert.ok(existsSync(snapshot), `${source} must check in its rendered output`);
  if (values.update) copyFileSync(output, snapshot);
  else assert.equal(html, readFileSync(snapshot, "utf8"), `${source}: run mise run examples-regen`);
}

function testExample(example, localPackages) {
  const source = join(javascriptDir, example);
  const manifest = readJson(join(source, "package.json"));
  checkDependencies(manifest, localPackages);
  if (existsSync(join(source, "output.html"))) {
    assert.ok(manifest.scripts?.render, `${example} must regenerate its checked-in output.html`);
  }
  const consumer = join(project, "consumer");
  cpSync(source, consumer, {
    recursive: true,
    filter: (path) =>
      ![
        "node_modules",
        "dist",
        "build",
        ".next",
        ".nuxt",
        ".output",
        ".data",
        "output.html",
      ].includes(basename(path)) &&
      (path === source || !existsSync(join(path, "package.json"))),
  });
  manifest.packageManager = readJson(join(javascriptDir, "package.json")).packageManager;
  writeFileSync(join(consumer, "package.json"), JSON.stringify(manifest));
  writeFileSync(
    join(consumer, "pnpm-workspace.yaml"),
    JSON.stringify({
      overrides: Object.fromEntries(localPackages.map((pkg) => [pkg.name, pkg.spec])),
      allowBuilds: {
        "@parcel/watcher": true,
        "better-sqlite3": true,
        "core-js": true,
        "core-js-pure": true,
        esbuild: true,
        sharp: true,
      },
    }),
  );
  console.log(`\n=== ${example} ===`);
  run(["install", "--no-frozen-lockfile", "--prefer-offline"], consumer);
  const scripts = ["render", "build"].filter((name) => manifest.scripts?.[name]);
  assert.ok(scripts.length > 0, `${example} has no build or render script`);
  for (const script of scripts) {
    run(["run", script], consumer);
    if (script === "render") checkRender(source, consumer);
  }
  rmSync(consumer, { recursive: true, force: true });
  console.log(`PASS ${example}`);
}

try {
  const nativePackages = globSync("lumis/native/npm/*/*.node", { cwd: javascriptDir });
  assert.ok(nativePackages.length > 0, "Build the local Node addon before testing examples");
  const localPackages = [
    ...packages.map((directory) => pack(directory)),
    ...nativePackages.map((binary) => pack(dirname(binary))),
  ];
  const selected = positionals.length > 0 ? positionals : examples;
  for (const example of selected) testExample(example, localPackages);
  console.log(`Verified ${selected.length} standalone examples against workspace packages.`);
} finally {
  rmSync(project, { recursive: true, force: true });
}

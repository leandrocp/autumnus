import assert from "node:assert/strict";
import { globSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const javascriptDir = fileURLToPath(new URL("../", import.meta.url));
const directory = process.argv[2];
assert.ok(directory, "Pass the directory of the released npm package");
const { name, version } = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
const manifests = globSync(["*/examples/package.json", "*/examples/*/package.json"], {
  cwd: javascriptDir,
});
assert.ok(manifests.length > 0, "No example manifests found");

for (const relative of manifests) {
  const path = join(javascriptDir, relative);
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  let changed = false;
  for (const dependencies of [manifest.dependencies, manifest.devDependencies]) {
    if (dependencies?.[name] !== undefined && dependencies[name] !== `^${version}`) {
      dependencies[name] = `^${version}`;
      changed = true;
    }
  }
  if (changed) writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
}

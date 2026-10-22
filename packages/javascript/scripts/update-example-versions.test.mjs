import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";

test("npm releases update example ranges across a 0.x minor boundary", (t) => {
  const root = mkdtempSync(join(tmpdir(), "lumis-example-versions-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const files = {
    "lumis/package.json": { name: "@lumis-sh/lumis", version: "0.10.0" },
    "lumis/examples/package.json": {
      dependencies: { "@lumis-sh/lumis": "^0.9.4", "@lumis-sh/themes": "^0.4.0" },
    },
    "react/examples/react/package.json": {
      devDependencies: { "@lumis-sh/lumis": "^0.9.4" },
    },
    "themes/examples/preview/package.json": { dependencies: { "@lumis-sh/themes": "^0.4.0" } },
  };
  for (const [path, manifest] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), `${JSON.stringify(manifest, null, 2)}\n`);
  }
  mkdirSync(join(root, "scripts"));
  const script = join(root, "scripts/update-example-versions.mjs");
  copyFileSync(new URL("./update-example-versions.mjs", import.meta.url), script);
  execFileSync(process.execPath, [script, join(root, "lumis")]);

  assert.deepEqual(JSON.parse(readFileSync(join(root, "lumis/examples/package.json"), "utf8")), {
    dependencies: { "@lumis-sh/lumis": "^0.10.0", "@lumis-sh/themes": "^0.4.0" },
  });
  assert.deepEqual(
    JSON.parse(readFileSync(join(root, "react/examples/react/package.json"), "utf8")),
    {
      devDependencies: { "@lumis-sh/lumis": "^0.10.0" },
    },
  );
  assert.deepEqual(
    JSON.parse(readFileSync(join(root, "themes/examples/preview/package.json"), "utf8")),
    files["themes/examples/preview/package.json"],
  );
});

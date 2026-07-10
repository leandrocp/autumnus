const { mkdirSync, rmSync, writeFileSync } = require("node:fs");
const { chmodSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const { join } = require("node:path");

const vendorDir = join(__dirname, "..", "vendor");
const binary = join(vendorDir, process.platform === "win32" ? "lumis.exe" : "lumis");

mkdirSync(vendorDir, { recursive: true });
writeFileSync(binary, '#!/usr/bin/env node\nconsole.log(process.argv.slice(2).join(" "));\n');
chmodSync(binary, 0o755);

const result = spawnSync(process.execPath, [join(__dirname, "..", "bin", "lumis"), "ok"], {
  encoding: "utf8",
});

rmSync(binary, { force: true });

if (result.status !== 0 || result.stdout.trim() !== "ok") {
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exit(result.status || 1);
}

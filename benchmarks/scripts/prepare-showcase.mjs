#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const generatedDir = resolve(benchmarksDir, "showcase/generated");
const assetsDir = resolve(generatedDir, "assets");

const assets = [
  {
    name: "webgpu_compute_reduce.html",
    source: resolve(benchmarksDir, "webgpu_compute_reduce.html"),
    sha256: "e1b31d91c25e9103931d7e830b9dfb9e075d97c175623e3e44fb3dc3685067af",
  },
  {
    name: "Dracula.tmTheme",
    url: "https://raw.githubusercontent.com/dracula/sublime/d490b57c08f3d110ff61a07ec6edcc1ed9e24a63/Dracula.tmTheme",
    sha256: "6767fe7cf5a2759d108207156f500c189a3dec216bd6f4f60b9b4bc09fbf8a5a",
  },
];

await mkdir(assetsDir, { recursive: true });

for (const asset of assets) {
  const path = resolve(assetsDir, asset.name);
  let bytes = asset.source ? await readFile(asset.source) : undefined;

  if (!bytes) {
    try {
      const cached = await readFile(path);
      if (sha256(cached) === asset.sha256) bytes = cached;
    } catch {
      // Download below.
    }
    if (!bytes) {
      const response = await fetch(asset.url);
      if (!response.ok) throw new Error(`failed to download ${asset.url}: HTTP ${response.status}`);
      bytes = Buffer.from(await response.arrayBuffer());
    }
  }

  const actual = sha256(bytes);
  if (actual !== asset.sha256) {
    throw new Error(`${asset.name} SHA-256 mismatch: expected ${asset.sha256}, got ${actual}`);
  }
  await writeFile(path, bytes);
}

console.log(generatedDir);

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { createServer } from "vite";
import { checkApi } from "./api-check.js";
import manifest from "../../package.json" with { type: "json" };

const packageDir = fileURLToPath(new URL("../../", import.meta.url));
const entries = [
  "@lumis-sh/lumis",
  "@lumis-sh/lumis/languages",
  "@lumis-sh/lumis/themes",
  "@lumis-sh/lumis/formatters",
];

function prepareConsumer(consumer: string): void {
  const archive = join(consumer, "lumis.tgz");
  execFileSync("pnpm", ["--config.ignore-scripts=true", "pack", "--out", archive], {
    cwd: packageDir,
    stdio: "pipe",
    timeout: 60_000,
  });
  const installed = join(consumer, "node_modules/@lumis-sh/lumis");
  mkdirSync(installed, { recursive: true });
  execFileSync("tar", ["-xzf", archive, "--strip-components=1", "-C", installed]);
  for (const name of [...Object.keys(manifest.dependencies), "@lumis-sh/wasm-json"]) {
    const target = join(consumer, "node_modules", name);
    mkdirSync(dirname(target), { recursive: true });
    symlinkSync(join(packageDir, "node_modules", name), target, "dir");
  }
  writeFileSync(join(consumer, "package.json"), JSON.stringify({ private: true, type: "module" }));
  for (const file of ["api.html", "api.ts"]) {
    copyFileSync(new URL(file, import.meta.url), join(consumer, file));
  }
}

test("Vite prebundles the packed API without splitting its runtime", async ({ page }) => {
  test.setTimeout(120_000);
  const consumer = mkdtempSync(join(tmpdir(), "lumis-api-vite-"));
  try {
    prepareConsumer(consumer);
    const server = await createServer({
      root: consumer,
      configFile: false,
      cacheDir: join(consumer, ".vite"),
      logLevel: "error",
      server: { host: "127.0.0.1", port: 0 },
      optimizeDeps: { include: entries, force: true },
    });
    try {
      await server.listen();
      const url = server.resolvedUrls?.local[0];
      expect(url).toBeDefined();
      await checkApi(page, `${url}api.html`);
      const metadata = JSON.parse(
        readFileSync(join(consumer, ".vite/deps/_metadata.json"), "utf8"),
      );
      expect(Object.keys(metadata.optimized)).toEqual(expect.arrayContaining(entries));
    } finally {
      await server.close();
    }
  } finally {
    rmSync(consumer, { recursive: true, force: true });
  }
});

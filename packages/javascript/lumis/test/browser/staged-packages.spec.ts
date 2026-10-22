import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import { build, createServer, preview, type ResolvedServerUrls } from "vite";

const repo = fileURLToPath(new URL("../../../../../", import.meta.url));
const lumisDir = fileURLToPath(new URL("../../", import.meta.url));
const consumerFiles = new URL("staged-packages/", import.meta.url);
const bundleDir = join(repo, "tmp/wasm/npm/wasm-bundle-web");
const publishDir = join(repo, "tmp/wasm/publish");
const imported = ["@lumis-sh/wasm-css", "@lumis-sh/wasm-markdown"];

interface Manifest {
  name: string;
  dependencies?: Record<string, string>;
}

function readManifest(dir: string): Manifest {
  return JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
}

function stagedPackageDirs(): Map<string, string> {
  const dirs = new Map<string, string>();
  for (const entry of readdirSync(publishDir)) {
    const dir = join(publishDir, entry);
    if (existsSync(join(dir, "package.json"))) dirs.set(readManifest(dir).name, dir);
  }
  return dirs;
}

/** The staged packages the page imports, each one's requirements, and every bundle member. */
function requiredPackageDirs(): string[] {
  if (!existsSync(bundleDir) || !existsSync(publishDir)) {
    throw new Error("nothing is staged; run `mise run wasm-check-bundler`");
  }
  const staged = stagedPackageDirs();
  const pending = [...imported, ...Object.keys(readManifest(bundleDir).dependencies ?? {})];
  const dirs = new Map<string, string>();
  for (let name = pending.pop(); name !== undefined; name = pending.pop()) {
    if (dirs.has(name)) continue;
    const dir = staged.get(name);
    if (dir === undefined) {
      throw new Error(
        `${name} is not staged in ${publishDir}; run \`mise run wasm-check-bundler\``,
      );
    }
    dirs.set(name, dir);
    pending.push(...Object.keys(readManifest(dir).dependencies ?? {}));
  }
  return [bundleDir, ...dirs.values()];
}

function pack(dir: string, destination: string): string {
  const [packed]: { filename: string }[] = JSON.parse(
    execFileSync("npm", ["pack", dir, "--json", "--pack-destination", destination], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }),
  );
  if (packed === undefined) throw new Error(`npm packed nothing from ${dir}`);
  return packed.filename;
}

/** A project that installed the tarballs the way a user installs the published packages. */
function installConsumer(consumer: string): void {
  const lumis = join(consumer, "lumis.tgz");
  execFileSync("pnpm", ["--config.ignore-scripts=true", "pack", "--out", lumis], {
    cwd: lumisDir,
    stdio: "pipe",
  });
  const tarballs = new Map([["@lumis-sh/lumis", lumis]]);
  for (const dir of requiredPackageDirs()) {
    tarballs.set(readManifest(dir).name, join(consumer, pack(dir, consumer)));
  }
  const dependencies = Object.fromEntries(
    [...tarballs].map(([name, tarball]) => [name, `file:${tarball}`]),
  );
  writeFileSync(
    join(consumer, "package.json"),
    JSON.stringify({ private: true, type: "module", dependencies }),
  );
  execFileSync(
    "npm",
    ["install", "--no-audit", "--no-fund", "--omit=optional", "--ignore-scripts"],
    { cwd: consumer, stdio: "pipe" },
  );
  for (const file of ["index.html", "main.js"]) {
    copyFileSync(new URL(file, consumerFiles), join(consumer, file));
  }
}

async function expectHighlighted(page: Page, urls: ResolvedServerUrls | null): Promise<void> {
  const url = urls?.local[0];
  if (url === undefined) throw new Error("Vite reported no local URL");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);
  await expect(page.locator("#output")).not.toBeEmpty();
  const output: Record<string, string> = JSON.parse(await page.locator("#output").innerText());
  expect.soft(output.css).toContain('<span class="l-property">color</span>');
  // `*emphasis*` is parsed by markdown_inline, which markdown's package requires.
  expect.soft(output.markdown).toContain('<span class="l-markup-italic">*emphasis*</span>');
  expect.soft(output.bundle).toContain('<span class="l-keyword">const</span>');
  expect(errors).toEqual([]);
}

test.describe.configure({ timeout: 180_000 });

let consumer = "";

test.beforeAll(() => {
  consumer = mkdtempSync(join(tmpdir(), "lumis-staged-vite-"));
  installConsumer(consumer);
});

test.afterAll(() => {
  rmSync(consumer, { recursive: true, force: true });
});

test("Vite's dev server serves each installed package's parser", async ({ page }) => {
  const server = await createServer({
    root: consumer,
    configFile: false,
    cacheDir: join(consumer, ".vite"),
    logLevel: "error",
    server: { host: "127.0.0.1", port: 0 },
  });
  try {
    await server.listen();
    await expectHighlighted(page, server.resolvedUrls);
  } finally {
    await server.close();
  }
});

test("vite build emits each installed package's parser", async ({ page }) => {
  const outDir = join(consumer, "dist");
  await build({ root: consumer, configFile: false, logLevel: "error", build: { outDir } });
  const server = await preview({
    root: consumer,
    configFile: false,
    logLevel: "error",
    build: { outDir },
    preview: { host: "127.0.0.1", port: 0 },
  });
  try {
    await expectHighlighted(page, server.resolvedUrls);
  } finally {
    await server.close();
  }
});

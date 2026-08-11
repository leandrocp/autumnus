/**
 * The addon is selected by two copies of the same function: `nativeTargetFor`
 * in src/native-binding.ts, used when `@lumis-sh/lumis` resolves the addon
 * itself, and the copy in native/npm/meta/index.js, used when an install goes
 * through the `@lumis-sh/lumis-native` selector. That package ships alone, so
 * it cannot import the first one.
 *
 * A target added to one copy and not the other, or to both but with no
 * published package, silently drops those hosts onto `web-tree-sitter`. Nothing
 * else in the suite would notice, because CI runs on hosts the addon covers.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";
import { nativeTargetFor } from "../src/native-binding.js";

const packageDir = resolve(import.meta.dirname, "..");
const nativeNpmDir = join(packageDir, "native", "npm");

const PLATFORMS = ["darwin", "linux", "win32", "freebsd", "openbsd", "sunos", "aix", "android"];
const ARCHS = ["arm64", "x64", "ia32", "arm", "riscv64", "ppc64", "s390x", "loong64"];
const LIBCS = ["gnu", "musl"] as const;

function targetsFrom(fn: typeof nativeTargetFor): string[] {
  const found = new Set<string>();
  for (const platform of PLATFORMS) {
    for (const arch of ARCHS) {
      for (const libc of LIBCS) {
        const target = fn(platform, arch, libc);
        if (target) found.add(target);
      }
    }
  }
  return [...found].sort();
}

/**
 * The selector's copy, loaded without running its `require` of the resolved
 * platform package, which is not installed for most of the matrix below.
 */
function selectorNativeTargetFor(): typeof nativeTargetFor {
  const source = readFileSync(join(nativeNpmDir, "meta", "index.js"), "utf8");
  const start = source.indexOf("function nativeTargetFor(");
  expect(start, "native/npm/meta/index.js declares nativeTargetFor").toBeGreaterThan(-1);
  const end = source.indexOf("\n}\n", start);
  expect(end, "nativeTargetFor is terminated").toBeGreaterThan(start);
  const body = source.slice(start, end + 3);
  // oxlint-disable-next-line typescript-eslint/no-implied-eval -- running the shipped selector's own source is the point; importing it would resolve a platform package this host does not have
  return new Function(`${body}; return nativeTargetFor;`)() as typeof nativeTargetFor;
}

const publishedTargets = readdirSync(nativeNpmDir)
  .filter((entry) => entry !== "meta")
  .sort();

describe("native target selection", () => {
  it("covers every published platform package", () => {
    expect(targetsFrom(nativeTargetFor)).toEqual(publishedTargets);
  });

  it("agrees with the @lumis-sh/lumis-native selector", () => {
    expect(targetsFrom(selectorNativeTargetFor())).toEqual(targetsFrom(nativeTargetFor));
  });

  it("resolves each host to the package that declares it", () => {
    const require = createRequire(import.meta.url);
    for (const target of publishedTargets) {
      const manifest = require(join(nativeNpmDir, target, "package.json")) as {
        name: string;
        os: string[];
        cpu: string[];
        libc?: string[];
      };
      expect(manifest.name).toBe(`@lumis-sh/lumis-native-${target}`);

      const platform = manifest.os[0];
      const arch = manifest.cpu[0];
      const libc = manifest.libc?.[0] === "musl" ? "musl" : "gnu";
      expect(nativeTargetFor(platform, arch, libc), `${platform}-${arch}-${libc}`).toBe(target);
    }
  });

  it("leaves platforms with no addon on the Wasm runtime", () => {
    expect(nativeTargetFor("freebsd", "x64", "gnu")).toBeUndefined();
    expect(nativeTargetFor("android", "arm64", "gnu")).toBeUndefined();
    expect(nativeTargetFor("linux", "riscv64", "gnu")).toBeUndefined();
    expect(nativeTargetFor("win32", "ia32", "gnu")).toBeUndefined();
  });

  it("keeps glibc and musl on separate packages", () => {
    expect(nativeTargetFor("linux", "x64", "gnu")).toBe("linux-x64-gnu");
    expect(nativeTargetFor("linux", "x64", "musl")).toBe("linux-x64-musl");
    expect(nativeTargetFor("linux", "arm64", "gnu")).toBe("linux-arm64-gnu");
    expect(nativeTargetFor("linux", "arm64", "musl")).toBe("linux-arm64-musl");
  });
});

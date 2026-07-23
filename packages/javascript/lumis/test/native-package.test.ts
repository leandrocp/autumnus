import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

interface PackageManifest {
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

const platformPackages = [
  "@lumis-sh/lumis-native-darwin-arm64",
  "@lumis-sh/lumis-native-darwin-x64",
  "@lumis-sh/lumis-native-linux-arm64-gnu",
  "@lumis-sh/lumis-native-linux-x64-gnu",
  "@lumis-sh/lumis-native-win32-x64-msvc",
];

function readManifest(relativePath: string): PackageManifest {
  return JSON.parse(readFileSync(new URL(relativePath, import.meta.url), "utf8"));
}

function selectedPackage(platform: string, arch: string, glibc = true): string | undefined {
  const source = readFileSync(new URL("../native/npm/meta/index.js", import.meta.url), "utf8");
  let selected: string | undefined;

  vm.runInNewContext(source, {
    module: { exports: {} },
    process: {
      platform,
      arch,
      report: {
        getReport: () => ({
          header: glibc ? { glibcVersionRuntime: "2.39" } : {},
        }),
      },
    },
    require: (specifier: string) => {
      selected = specifier;
      return {};
    },
  });

  return selected;
}

describe("native package installation", () => {
  it("keeps platform addons out of the default package", () => {
    const manifest = readManifest("../package.json");
    const installedByDefault = {
      ...manifest.dependencies,
      ...manifest.optionalDependencies,
    };

    expect(
      Object.keys(installedByDefault).filter((name) => name.startsWith("@lumis-sh/lumis-native")),
    ).toEqual([]);
  });

  it("keeps platform addons behind the opt-in selector", () => {
    const manifest = readManifest("../native/npm/meta/package.json");
    expect(Object.keys(manifest.optionalDependencies ?? {}).sort()).toEqual(platformPackages);
  });

  it.each([
    ["darwin", "arm64", true, "@lumis-sh/lumis-native-darwin-arm64"],
    ["darwin", "x64", true, "@lumis-sh/lumis-native-darwin-x64"],
    ["linux", "arm64", true, "@lumis-sh/lumis-native-linux-arm64-gnu"],
    ["linux", "x64", true, "@lumis-sh/lumis-native-linux-x64-gnu"],
    ["win32", "x64", true, "@lumis-sh/lumis-native-win32-x64-msvc"],
  ])("selects the %s-%s platform addon", (platform, arch, glibc, expected) => {
    expect(selectedPackage(platform, arch, glibc)).toBe(expected);
  });

  it("rejects Linux musl so Lumis can fall back to WASM", () => {
    expect(() => selectedPackage("linux", "x64", false)).toThrow(
      "The Lumis native runtime does not support linux-x64",
    );
  });
});

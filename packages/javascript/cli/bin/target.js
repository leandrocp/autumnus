"use strict";

/**
 * Deliberately narrower than `nativeTargetFor` in `@lumis-sh/lumis`: the CLI
 * publishes no musl build, so a musl host resolves to nothing and gets told to
 * build from source. Returning the glibc target instead would install a binary
 * npm's `libc` field already excluded, and fail at exec with a loader error.
 *
 * `test-shim.js` pins this against the package directories under `npm/`, so a
 * target added here without a package, or the reverse, fails.
 */
function cliTargetFor(platform, arch, libc) {
  if (platform === "darwin" && ["arm64", "x64"].includes(arch)) {
    return `darwin-${arch}`;
  }
  if (platform === "linux" && arch === "arm64" && libc === "gnu") {
    return "linux-arm64-gnu";
  }
  if (platform === "linux" && arch === "x64" && libc === "gnu") {
    return "linux-x64-gnu";
  }
  if (platform === "win32" && ["arm64", "x64"].includes(arch)) {
    return `win32-${arch}-msvc`;
  }
  return undefined;
}

function hostLibc() {
  if (process.platform !== "linux") return "gnu";
  const report = process.report?.getReport?.();
  return report?.header?.glibcVersionRuntime ? "gnu" : "musl";
}

module.exports = { cliTargetFor, hostLibc };

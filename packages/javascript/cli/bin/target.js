"use strict";

/**
 * The same mapping as `nativeTargetFor` in `@lumis-sh/lumis`, over the same
 * eight targets. Both packages ship alone, so neither can import the other.
 * `test-shim.js` pins this against the CLI package directories and against the
 * addon's, so a target added to one and not the other fails.
 */
function cliTargetFor(platform, arch, libc) {
  if (platform === "darwin" && ["arm64", "x64"].includes(arch)) {
    return `darwin-${arch}`;
  }
  if (platform === "linux" && ["arm64", "x64"].includes(arch)) {
    return `linux-${arch}-${libc}`;
  }
  if (platform === "win32" && ["arm64", "x64"].includes(arch)) {
    return `win32-${arch}-msvc`;
  }
  return;
}

function hostLibc() {
  if (process.platform !== "linux") return "gnu";
  const report = process.report?.getReport?.();
  return report?.header?.glibcVersionRuntime ? "gnu" : "musl";
}

module.exports = { cliTargetFor, hostLibc };

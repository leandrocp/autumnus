"use strict";

function linuxLibc() {
  const report = process.report?.getReport?.();
  return report?.header?.glibcVersionRuntime ? "gnu" : "musl";
}

function nativeTarget() {
  if (process.platform === "darwin" && ["arm64", "x64"].includes(process.arch)) {
    return `darwin-${process.arch}`;
  }
  if (process.platform === "linux" && ["arm64", "x64"].includes(process.arch)) {
    return linuxLibc() === "gnu" ? `linux-${process.arch}-gnu` : undefined;
  }
  if (process.platform === "win32" && process.arch === "x64") {
    return "win32-x64-msvc";
  }
  return undefined;
}

const target = nativeTarget();

if (!target) {
  throw new Error(
    `The Lumis native runtime does not support ${process.platform}-${process.arch}`,
  );
}

module.exports = require(`@lumis-sh/lumis-native-${target}`);

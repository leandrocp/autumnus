import { accessSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

export function findBat() {
  for (const candidate of ["bat", "batcat"]) {
    const result = spawnSync(candidate, ["--version"], { stdio: "ignore" });
    if (!result.error && result.status === 0) return candidate;
  }
  throw new Error("bat is required; install https://github.com/sharkdp/bat");
}

export function findHyperfine() {
  const result = spawnSync("hyperfine", ["--version"], { stdio: "ignore" });
  if (result.error || result.status !== 0) {
    throw new Error("hyperfine is required; install https://github.com/sharkdp/hyperfine");
  }
  return "hyperfine";
}

export function quote(value) {
  return `'${String(value).replaceAll("'", `'\\''`)}'`;
}

export function command(executable, args) {
  return [executable, ...args].map(quote).join(" ");
}

export function cases({ repoDir, fixture, dataDir, includeNative = true }) {
  const shim = resolve(repoDir, "target/benchmarks/npm-cli/bin/lumis");
  const native = resolve(repoDir, "target/release/lumis");
  accessSync(shim);
  accessSync(native);
  const commonLumis = [
    "--data-dir",
    dataDir,
    "highlight",
    "--language",
    "rust",
    "--formatter",
    "terminal",
    "--theme",
    "github_dark",
    fixture,
  ];
  const result = [
    { name: "lumis-npm", command: command(shim, commonLumis) },
    {
      name: "bat",
      command: command(findBat(), [
        "--no-config",
        "--paging=never",
        "--style=plain",
        "--color=always",
        "--language=rust",
        "--theme=Monokai Extended",
        fixture,
      ]),
    },
  ];
  if (includeNative) {
    result.splice(1, 0, { name: "lumis-native", command: command(native, commonLumis) });
  }
  return result;
}

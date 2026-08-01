import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const packageDir = path.resolve(import.meta.dirname, "..");
const workspaceDir = path.resolve(packageDir, "../../..");

function linuxLibc(): "gnu" | "musl" {
  const report = process.report?.getReport?.() as
    | { header?: { glibcVersionRuntime?: string } }
    | undefined;
  return report?.header?.glibcVersionRuntime ? "gnu" : "musl";
}

function targetName(): string {
  if (process.platform === "darwin") return `darwin-${process.arch}`;
  if (process.platform === "linux") return `linux-${process.arch}-${linuxLibc()}`;
  if (process.platform === "win32") return `win32-${process.arch}-msvc`;
  throw new Error(`Unsupported native build platform: ${process.platform}-${process.arch}`);
}

const libraryName =
  process.platform === "win32"
    ? "lumis_js_native.dll"
    : process.platform === "darwin"
      ? "liblumis_js_native.dylib"
      : "liblumis_js_native.so";
const target = targetName();
// The benchmarks set CARGO_TARGET_DIR, so cargo does not always write to
// target/release and looking only there finds nothing, or something stale.
const targetDir = process.env.CARGO_TARGET_DIR
  ? path.resolve(process.env.CARGO_TARGET_DIR)
  : path.join(workspaceDir, "target");
const source = path.join(targetDir, "release", libraryName);
if (!existsSync(source)) {
  throw new Error(`no built addon at ${source}; run \`cargo build -p lumis-js-native --release\``);
}
const nativeDir = path.join(packageDir, "native");
const destination = path.join(nativeDir, `lumis-native.${target}.node`);

mkdirSync(nativeDir, { recursive: true });
copyFileSync(source, destination);
console.log(destination);

// Also where the platform package's `main` points, so a local run resolves the
// addon the way an install does, and the package-size benchmark measures what
// a Node install actually downloads rather than an empty shell.
const platformPackage = path.join(nativeDir, "npm", target, `lumis-native.${target}.node`);
mkdirSync(path.dirname(platformPackage), { recursive: true });
copyFileSync(source, platformPackage);
console.log(platformPackage);

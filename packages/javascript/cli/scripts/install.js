const { createWriteStream, existsSync, mkdirSync, rmSync } = require("node:fs");
const { chmod, rename } = require("node:fs/promises");
const { get } = require("node:https");
const { join } = require("node:path");
const { tmpdir } = require("node:os");
const { x: extractTar } = require("tar");
const pkg = require("../package.json");

const repo = "https://github.com/leandrocp/lumis";
const vendorDir = join(__dirname, "..", "vendor");
const binaryName = process.platform === "win32" ? "lumis.exe" : "lumis";
const binaryPath = join(vendorDir, binaryName);

if (process.env.LUMIS_CLI_SKIP_DOWNLOAD === "1" || existsSync(binaryPath)) {
  process.exit(0);
}

if (existsSync(join(__dirname, "..", "..", "..", "..", "crates", "lumis-cli", "Cargo.toml"))) {
  process.exit(0);
}

const target = targetTriple();
const archiveName = `lumis-${target}.tar.gz`;
const url = `${repo}/releases/download/cargo-lumis-cli/v${pkg.version}/${archiveName}`;

mkdirSync(vendorDir, { recursive: true });

const archivePath = join(tmpdir(), `lumis-${pkg.version}-${target}-${process.pid}.tar.gz`);
const extractDir = join(tmpdir(), `lumis-${pkg.version}-${target}-${process.pid}`);

download(url, archivePath)
  .then(async () => {
    rmSync(extractDir, { force: true, recursive: true });
    mkdirSync(extractDir, { recursive: true });
    await extractTar({ file: archivePath, cwd: extractDir });
    await rename(findBinary(extractDir), binaryPath);
    if (process.platform !== "win32") {
      await chmod(binaryPath, 0o755);
    }
  })
  .catch((error) => {
    console.error(`Failed to install lumis from ${url}`);
    console.error(error.message);
    process.exit(1);
  })
  .finally(() => {
    rmSync(archivePath, { force: true });
    rmSync(extractDir, { force: true, recursive: true });
  });

function targetTriple() {
  const platform = process.platform;
  const arch = process.arch;

  if (platform === "darwin" && arch === "arm64") return "aarch64-apple-darwin";
  if (platform === "darwin" && arch === "x64") return "x86_64-apple-darwin";
  if (platform === "linux" && arch === "arm64") return "aarch64-unknown-linux-gnu";
  if (platform === "linux" && arch === "x64") return "x86_64-unknown-linux-gnu";
  if (platform === "win32" && arch === "arm64") return "aarch64-pc-windows-msvc";
  if (platform === "win32" && arch === "x64") return "x86_64-pc-windows-msvc";

  throw new Error(`Unsupported platform: ${platform} ${arch}`);
}

function download(url, destination) {
  return new Promise((resolve, reject) => {
    const request = get(url, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
        response.resume();
        download(response.headers.location, destination).then(resolve, reject);
        return;
      }

      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const file = createWriteStream(destination);
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
      file.on("error", reject);
    });

    request.on("error", reject);
  });
}

function findBinary(dir) {
  const candidates = [join(dir, binaryName), join(dir, "lumis", binaryName)];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(`Archive did not contain ${binaryName}`);
}

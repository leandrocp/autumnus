import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parse as parseToml } from "smol-toml";

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../../..");
const LANGUAGES_TOML = path.join(WORKSPACE_ROOT, "languages.toml");
const LUMIS_PACKAGE_JSON = path.resolve(import.meta.dirname, "../package.json");
const PACKAGES_DIR = path.join(WORKSPACE_ROOT, "packages", "javascript");

interface ParserEntry {
  wasm_name?: string;
}

interface BundleEntry {
  parsers: string[] | "all";
}

interface LanguagesToml {
  parsers: Record<string, ParserEntry>;
  bundles?: Record<string, BundleEntry>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLanguagesToml(value: unknown): value is LanguagesToml {
  if (!isRecord(value)) return false;
  if (!isRecord(value.parsers)) return false;
  return true;
}

function readLanguagesToml(): LanguagesToml {
  const text = fs.readFileSync(LANGUAGES_TOML, "utf-8");
  const parsed = parseToml(text);
  if (!isLanguagesToml(parsed)) {
    throw new Error("Invalid languages.toml structure");
  }
  return parsed;
}

function treeSitterCompatRange(): string {
  const packageJson: { dependencies?: Record<string, string>; version?: string } = JSON.parse(
    fs.readFileSync(LUMIS_PACKAGE_JSON, "utf-8"),
  );
  const spec = packageJson.dependencies?.["web-tree-sitter"];
  const match = spec?.match(/(\d+\.\d+)/);

  if (!match) {
    throw new Error("Could not determine web-tree-sitter compatibility from package.json");
  }

  return `^${match[1]}.0`;
}

function lumisVersionRange(): string {
  const packageJson: { version?: string } = JSON.parse(
    fs.readFileSync(LUMIS_PACKAGE_JSON, "utf-8"),
  );
  if (!packageJson.version) throw new Error("Missing @lumis-sh/lumis version");
  return `^${packageJson.version}`;
}

function wasmNameForLanguage(id: string, entry: ParserEntry | undefined): string {
  if (id === "plaintext") return "tree-sitter-diff";
  return entry?.wasm_name || `tree-sitter-${id}`;
}

function wasmPackageName(wasmName: string): string {
  return `@lumis-sh/wasm-${wasmName.startsWith("tree-sitter-") ? wasmName.slice("tree-sitter-".length) : wasmName}`;
}

function packageDir(bundleName: string): string {
  return path.join(PACKAGES_DIR, `wasm-bundle-${bundleName}`);
}

function importName(packageName: string): string {
  const cleaned = packageName
    .replace("@lumis-sh/", "")
    .replace(/[^a-zA-Z0-9]+(.)/g, (_match, next: string) => next.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
  return cleaned.replace(/^[A-Z]/, (char) => char.toLowerCase());
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function isPublishedForCompat(packageName: string, versionRange: string): boolean {
  const result = spawnSync("npm", ["view", `${packageName}@${versionRange}`, "version", "--json"], {
    encoding: "utf-8",
  });
  return result.status === 0;
}

function bundleLanguageIds(bundle: BundleEntry, allParserIds: string[]): string[] {
  const parserIds = bundle.parsers === "all" ? allParserIds : bundle.parsers;
  return parserIds.includes("plaintext") ? parserIds : [...parserIds, "plaintext"];
}

function writeBundlePackage(
  bundleName: string,
  languageIds: string[],
  parsers: Record<string, ParserEntry>,
) {
  const dir = packageDir(bundleName);
  fs.mkdirSync(dir, { recursive: true });

  const wasmPackagesByLanguage = Object.fromEntries(
    languageIds.map((id) => {
      const wasmName = wasmNameForLanguage(id, parsers[id]);
      return [id, wasmPackageName(wasmName)];
    }),
  );

  const dependencyPackages = unique(Object.values(wasmPackagesByLanguage)).sort();
  const wasmVersionRange = treeSitterCompatRange();
  const lumisPeerRange = lumisVersionRange();
  const publishedPackages = new Set(
    dependencyPackages.filter((packageName) => isPublishedForCompat(packageName, wasmVersionRange)),
  );
  const publishedLanguageIds = languageIds.filter((id) =>
    publishedPackages.has(wasmPackagesByLanguage[id]),
  );
  const missingLanguageIds = languageIds.filter(
    (id) => !publishedPackages.has(wasmPackagesByLanguage[id]),
  );

  const importLines = [...publishedPackages]
    .sort()
    .map((pkg) => `import ${importName(pkg)} from ${JSON.stringify(pkg)}`)
    .join("\n");

  const entries = publishedLanguageIds
    .map((id) => `  ${JSON.stringify(id)}: ${importName(wasmPackagesByLanguage[id])},`)
    .join("\n");

  const indexJs = `${importLines}

export const bundledWasms = {
${entries}
}

export const missingLanguages = ${JSON.stringify(missingLanguageIds, null, 2)}

export default bundledWasms
`;

  const indexDts = `import type { RuntimeWasmBundle } from '@lumis-sh/lumis'

export declare const bundledWasms: RuntimeWasmBundle
export declare const missingLanguages: string[]
export default bundledWasms
`;

  const dependencies = Object.fromEntries(
    [...publishedPackages].sort().map((pkg) => [pkg, wasmVersionRange]),
  );
  const packageJson = {
    name: `@lumis-sh/wasm-bundle-${bundleName}`,
    version: "0.0.1",
    description: `Preset WASM parser bundle for the ${bundleName} Lumis language bundle`,
    author: "Leandro Pereira",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/leandrocp/lumis.git",
      directory: `packages/javascript/wasm-bundle-${bundleName}`,
    },
    bugs: "https://github.com/leandrocp/lumis/issues",
    homepage: "https://lumis.sh",
    keywords: ["lumis-sh", "tree-sitter", "wasm", "bundle"],
    sideEffects: false,
    type: "module",
    exports: {
      ".": {
        types: "./index.d.ts",
        import: "./index.js",
        default: "./index.js",
      },
    },
    files: ["index.js", "index.d.ts", "README.md", "CHANGELOG.md"],
    publishConfig: {
      access: "public",
    },
    peerDependencies: {
      "@lumis-sh/lumis": lumisPeerRange,
    },
    dependencies,
  };

  const missingSection =
    missingLanguageIds.length > 0
      ? `## Missing local packages

These languages currently fall back to Lumis's normal runtime resolution because compatible \`@lumis-sh/wasm-*\` packages are not published yet:

${missingLanguageIds.map((id) => `- \`${id}\``).join("\n")}
`
      : "";

  const readme = `# @lumis-sh/wasm-bundle-${bundleName}

Static WASM imports for the ${bundleName} Lumis bundle.

## Install

\`\`\`sh
npm install @lumis-sh/lumis @lumis-sh/wasm-bundle-${bundleName}
\`\`\`

## Node.js

Install this package alongside \`@lumis-sh/lumis/bundles/${bundleName}\` and Lumis will resolve the local parser packages automatically.

## Browser bundlers

\`\`\`ts
import { createHighlighter, withWasmBundle } from '@lumis-sh/lumis'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/${bundleName}'
import { bundledWasms } from '@lumis-sh/wasm-bundle-${bundleName}'

const languages = withWasmBundle(bundledLanguages, bundledWasms)
const highlighter = await createHighlighter({ languages: [languages] })
\`\`\`

${missingSection}
`;

  const changelog = "# Changelog\n\n";

  fs.writeFileSync(path.join(dir, "index.js"), indexJs);
  fs.writeFileSync(path.join(dir, "index.d.ts"), indexDts);
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify(packageJson, null, 2) + "\n");
  fs.writeFileSync(path.join(dir, "README.md"), readme);
  fs.writeFileSync(path.join(dir, "CHANGELOG.md"), changelog);

  const missingSuffix =
    missingLanguageIds.length > 0 ? `, ${missingLanguageIds.length} missing local package(s)` : "";
  console.log(
    `  wasm bundle ${bundleName}: packages/javascript/wasm-bundle-${bundleName}${missingSuffix}`,
  );
}

function main() {
  const config = readLanguagesToml();
  const bundles = config.bundles ?? {};
  const allParserIds = Object.keys(config.parsers);

  for (const [bundleName, bundle] of Object.entries(bundles)) {
    writeBundlePackage(bundleName, bundleLanguageIds(bundle, allParserIds), config.parsers);
  }
}

main();

import {
  cacheKey,
  DEFAULT_LANGUAGE_PACKAGE_RESOLVER,
  DEFAULT_RESOLVER,
  isCompatibleLanguagePackageVersion,
  languagePackageCacheKey,
  parseLanguagePackage,
  serializeLanguagePackageCache,
  verifyWasm,
  type LanguagePackage,
  type LanguagePackageResolver,
  type WasmResolver,
} from "./core/languages.js";
import { BUNDLES } from "./generated/bundles-meta.js";
import { EXACT_LANGUAGE_MAP } from "./generated/language-detection.js";
import { LANGUAGE_LOADERS } from "./generated/language-loaders.js";
import { LANGUAGE_PACKAGE_VERSION_RANGE } from "./generated/package-version-range.js";
import {
  readCachedWasm,
  isUrlString,
  wasmCacheDir,
  wasmCachePath,
  withWasmCacheLock,
  writeCachedWasm,
} from "./runtime/node-cache.js";
import { loadNativeBinding } from "./native-binding.js";
import type { Language, WasmRef } from "./types.js";

export interface CacheLanguagesOptions {
  /** Destination for verified parsers and native compiled modules. */
  directory?: string;
  /** Resolve the compatible package range again and replace verified parser files. */
  force?: boolean;
  /** Override the exact-version jsDelivr resolver. */
  resolver?: WasmResolver;
  /** Override the compatible-range language-package metadata resolver. */
  languagePackageResolver?: LanguagePackageResolver;
}

export interface CachedLanguage {
  language: string;
  path: string;
  downloaded: boolean;
  wasm: WasmRef;
}

function languagePackageName(language: Language): string {
  if (!language.packageName) {
    throw new Error(`Language "${language.id}" does not have a language package`);
  }
  return language.packageName;
}

async function loadLanguage(name: string): Promise<Language> {
  const normalized = name.toLowerCase();
  const id = EXACT_LANGUAGE_MAP[normalized] ?? normalized;
  const loader = LANGUAGE_LOADERS[id];
  if (!loader) throw new Error(`Unknown language "${name}"`);
  return (await loader()).default;
}

/**
 * Members of `bundle-<name>`, accepting `-` or `_` between words so Elixir's
 * `:bundle_web_extra` and the CLI's `bundle-web-extra` reach the same entry.
 */
function bundleMembers(name: string): string[] | undefined {
  const lower = name.toLowerCase();
  if (!lower.startsWith("bundle-") && !lower.startsWith("bundle_")) return undefined;

  const suffix = lower.slice("bundle-".length).replaceAll("_", "-");
  return BUNDLES[suffix];
}

/**
 * Expand every `bundle-<name>` token into its members, leaving other names
 * alone. Mirrors `catalog::expand_bundles` in `lumis-wasm-runtime`.
 */
export function expandBundles(names: Iterable<string>): string[] {
  const expanded: string[] = [];

  for (const name of names) {
    const members = bundleMembers(name);
    if (members) {
      expanded.push(...members);
      continue;
    }

    const lower = name.toLowerCase();
    if (lower.startsWith("bundle-") || lower.startsWith("bundle_")) {
      throw new Error(`Unknown bundle "${name}"`);
    }

    expanded.push(name);
  }

  return [...new Set(expanded)];
}

async function fetchWasm(language: Language, ref: WasmRef, resolver: WasmResolver) {
  const source = resolver(language.id, ref);
  if (source instanceof URL ? source.protocol === "file:" : source.startsWith("file://")) {
    const { readFile } = await import("node:fs/promises");
    const { fileURLToPath } = await import("node:url");
    const url = source instanceof URL ? source : new URL(source);
    return verifyWasm(ref, new Uint8Array(await readFile(fileURLToPath(url))));
  }
  if (typeof source === "string" && !isUrlString(source)) {
    const { readFile } = await import("node:fs/promises");
    return verifyWasm(ref, new Uint8Array(await readFile(source)));
  }
  const response = await fetch(typeof source === "string" ? source : source.href);
  if (!response.ok) {
    throw new Error(
      `could not download parser WASM ${ref.name}@${ref.version}: HTTP ${response.status} ${response.statusText}`,
    );
  }
  return verifyWasm(ref, new Uint8Array(await response.arrayBuffer()));
}

async function fetchLanguagePackage(
  packageName: string,
  resolver: LanguagePackageResolver,
): Promise<LanguagePackage> {
  const source = resolver(packageName, LANGUAGE_PACKAGE_VERSION_RANGE);
  let packageMetadata: LanguagePackage;
  if (source instanceof URL ? source.protocol === "file:" : source.startsWith("file://")) {
    const { readFile } = await import("node:fs/promises");
    const { fileURLToPath } = await import("node:url");
    const url = source instanceof URL ? source : new URL(source);
    packageMetadata = parseLanguagePackage(
      new Uint8Array(await readFile(fileURLToPath(url))),
      packageName,
    );
  } else if (typeof source === "string" && !isUrlString(source)) {
    const { readFile } = await import("node:fs/promises");
    packageMetadata = parseLanguagePackage(new Uint8Array(await readFile(source)), packageName);
  } else {
    const response = await fetch(typeof source === "string" ? source : source.href);
    if (!response.ok) {
      throw new Error(
        `could not download language package ${packageName}: HTTP ${response.status} ${response.statusText}`,
      );
    }
    packageMetadata = parseLanguagePackage(
      new Uint8Array(await response.arrayBuffer()),
      packageName,
    );
  }

  if (!isCompatibleLanguagePackageVersion(packageMetadata.version)) {
    throw new Error(
      `Language package ${packageMetadata.packageName}@${packageMetadata.version} does not satisfy the supported range ${LANGUAGE_PACKAGE_VERSION_RANGE}`,
    );
  }
  return packageMetadata;
}

/**
 * Also write the package where the Rust store reads it, as `<suffix>.lumis.json`.
 *
 * Node highlights through the Wasmtime addon by default, and that store names
 * this file differently from the JavaScript cache. Prefetching would otherwise
 * fill a cache the runtime doing the highlighting never looks in, and the first
 * request would download it all again.
 */
async function writeSharedLanguagePackage(
  packageName: string,
  packageMetadata: LanguagePackage,
  directory?: string,
): Promise<void> {
  const { join } = await import("node:path");
  const { mkdir, writeFile } = await import("node:fs/promises");

  const suffix = packageName.replace(/^@lumis-sh\/wasm-/, "");
  if (suffix.includes("/")) return;

  const parsers = await wasmCacheDir(directory);
  await mkdir(parsers, { recursive: true });
  await writeFile(join(parsers, `${suffix}.lumis.json`), JSON.stringify(packageMetadata), "utf8");
}

/**
 * Resolve compatible packages and cache exact, integrity-pinned parser WASMs.
 * When the native Node addon is available, also compile and validate every
 * selected language and persist its Wasmtime module in the same directory.
 *
 * Accepts language names and `bundle-<name>` tokens, the same set
 * `Lumis.Languages.cache/2` and `lumis languages cache` accept.
 *
 * Point `LUMIS_DATA_DIR` at the same directory in the deployed process.
 */
export async function cacheLanguages(
  names: Iterable<string>,
  options: CacheLanguagesOptions = {},
): Promise<CachedLanguage[]> {
  const directory = options.directory;
  const resolver = options.resolver ?? DEFAULT_RESOLVER;
  const packageResolver = options.languagePackageResolver ?? DEFAULT_LANGUAGE_PACKAGE_RESOLVER;
  const languages = await Promise.all(expandBundles(names).map(loadLanguage));
  const seen = new Set<string>();
  const packages = new Map<string, LanguagePackage>();
  const persisted = new Set<string>();
  const cached: CachedLanguage[] = [];

  for (const language of languages) {
    if (language.id === "plaintext") continue;

    const packageName = languagePackageName(language);
    let packageMetadata = packages.get(packageName);
    if (!packageMetadata) {
      if (!options.force) {
        const bytes = await readCachedWasm(languagePackageCacheKey(packageName), directory);
        if (bytes) {
          try {
            const candidate = parseLanguagePackage(bytes, packageName);
            if (isCompatibleLanguagePackageVersion(candidate.version)) {
              packageMetadata = candidate;
            }
          } catch {
            // Invalid metadata is replaced below.
          }
        }
      }
      packageMetadata ??= await fetchLanguagePackage(packageName, packageResolver);
      packages.set(packageName, packageMetadata);
    }
    const packaged = packageMetadata.languages[language.id];
    if (!packaged) {
      throw new Error(
        `Language "${language.id}" is not provided by ${packageMetadata.packageName}@${packageMetadata.version}`,
      );
    }
    const ref: WasmRef = {
      packageName,
      name: packageMetadata.parser.name,
      version: packageMetadata.version,
      sha256: packageMetadata.parser.sha256,
      size: packageMetadata.parser.size,
    };
    const key = cacheKey(ref);
    if (seen.has(key)) continue;
    seen.add(key);

    const result = await withWasmCacheLock(
      key,
      async () => {
        if (!options.force) {
          const existing = await readCachedWasm(key, directory);
          if (existing) {
            try {
              await verifyWasm(ref, existing);
              return {
                path: await wasmCachePath(key, directory),
                downloaded: false,
              };
            } catch {
              // Replace corrupt cache entries below.
            }
          }
        }

        const bytes = await fetchWasm(language, ref, resolver);
        return {
          path: await writeCachedWasm(key, bytes, directory),
          downloaded: true,
        };
      },
      directory,
    );

    // A manifest names a parser, so it is only writable once that parser is in
    // the store. Replacing it first leaves a forced refresh that failed halfway
    // pointing every runtime sharing this directory at bytes nothing holds.
    if (!persisted.has(packageName)) {
      persisted.add(packageName);
      await writeCachedWasm(
        languagePackageCacheKey(packageName),
        serializeLanguagePackageCache(packageMetadata),
        directory,
      );
      await writeSharedLanguagePackage(packageName, packageMetadata, directory);
    }

    cached.push({ language: language.id, wasm: ref, ...result });
  }

  const binding = loadNativeBinding();
  if (binding) {
    const names = [...new Set(languages.map((language) => language.id))].filter(
      (name) => name !== "plaintext",
    );
    if (names.length > 0) await binding.precompileLanguages(names, directory);
  }

  return cached;
}

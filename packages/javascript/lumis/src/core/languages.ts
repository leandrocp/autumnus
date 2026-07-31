import type { Language, Query as TreeSitterQuery } from "web-tree-sitter";
import { PACKAGE_CACHE_TTL_MS } from "../cache-timing.js";
import { buildHighlightEvents } from "../events.js";
import { LANGUAGES } from "../generated/languages-meta.js";
import { sha256 } from "./sha256.js";
import { HIGHLIGHT_NAMES } from "../highlights.js";
import type { RuntimeEnvironment } from "../runtime/runtime.js";
import type {
  CaptureMetadata,
  CompiledBracketConfig,
  CompiledHighlightConfig,
  Formatter,
  HighlightEvent,
  LanguageDefinition,
  LoadedLanguage,
  QueryCaptureOffset,
  WasmRef,
} from "../types.js";
import { PLAINTEXT_LANG_ID, type LanguageInfo } from "../types.js";

export type WasmResolver = (language: string, wasm: WasmRef) => string | URL;
export type LanguagePackageResolver = (packageName: string) => string | URL;

export interface PackagedLanguage {
  aliases: string[];
  highlights: string;
  injections?: string;
  locals?: string;
  brackets?: string;
}

/**
 * A language package as published inside `@lumis-sh/wasm-*`. Mirrors
 * `LanguagePackage` in `crates/lumis-wasm-runtime/src/package.rs`.
 *
 * There is deliberately no `formatVersion` gate: runtimes resolve this document
 * from a floating tag, so the format is additive-only by contract and
 * compatibility is decided by shape.
 */
export interface LanguagePackage {
  packageName: string;
  version: string;
  definitionHash: string;
  parser: {
    name: string;
    grammarName: string;
    upstreamVersion?: string;
    revision?: string;
    sha256: string;
    size: number;
  };
  languages: Record<string, PackagedLanguage>;
}

interface CachedLanguagePackage {
  checkedAt: number;
  package: LanguagePackage;
}

export interface ResolvedLanguagePackage {
  definition: LanguageDefinition;
  wasm: WasmRef;
  highlights: string;
  injections?: string;
  locals?: string;
  brackets?: string;
}

export interface SharedRuntimeCache {
  parserInit?: Promise<void>;
  wasmBytes: Map<string, Uint8Array>;
  wasmLoads: Map<string, Promise<Uint8Array>>;
  packages: Map<string, LanguagePackage>;
  packageLoads: Map<string, Promise<LanguagePackage>>;
}

function compileBracketConfig(
  language: Language,
  Query: typeof TreeSitterQuery,
  bracketsQuery?: string,
): CompiledBracketConfig | undefined {
  if (!bracketsQuery) return undefined;

  // A bracket query can name tokens a grammar lacks, such as "(" in HTML, so a
  // compile failure means "no rainbow brackets here" rather than a load failure.
  let query: InstanceType<typeof Query>;
  try {
    query = new Query(language, bracketsQuery);
  } catch {
    return undefined;
  }

  const captureMetadata: CompiledBracketConfig["captureMetadata"] = {};

  for (const captureName of query.captureNames) {
    captureMetadata[captureName] = {
      isOpen: matchesSpecialCapture(captureName, "open"),
      isClose: matchesSpecialCapture(captureName, "close"),
    };
  }

  // `(#set! rainbow.exclude)` has no value, so the property is stored as
  // `{ "rainbow.exclude": null }`. Detect it by key presence, not by value.
  const rainbowExcludePatterns = Array.from({ length: query.patternCount() }, (_, patternIndex) => {
    const properties = query.setProperties[patternIndex];
    return properties != null && "rainbow.exclude" in properties;
  });

  return { query, captureMetadata, rainbowExcludePatterns };
}

export interface LoadLanguageOptions {
  definition: LanguageDefinition;
  packageName?: string;
  wasm?: WasmRef | Uint8Array | ArrayBuffer | string | URL | Response;
  highlights?: string;
  injections?: string;
  locals?: string;
  brackets?: string;
}

export interface HighlighterRuntimeOptions {
  wasmResolver?: WasmResolver;
  languagePackageResolver?: LanguagePackageResolver;
  sharedCache?: SharedRuntimeCache;
}

export interface RuntimeLike {
  configureWasmResolver(fn: WasmResolver): void;
  configureLanguagePackageResolver(fn: LanguagePackageResolver): void;
  initParser(): Promise<void>;
  registerLanguage(def: LanguageDefinition): void;
  resolveLanguageId(nameOrAlias: string): string;
  getLoadedLanguage(nameOrAlias: string): LoadedLanguage | undefined;
  getLoadedLanguageIds(): string[];
  loadLanguage(opts: LoadLanguageOptions): Promise<LoadedLanguage>;
  resolveLanguagePackage(
    language: LanguageDefinition,
    packageName: string,
  ): Promise<ResolvedLanguagePackage>;
  loadPlaintext(): Promise<LoadedLanguage>;
  highlightEvents(
    source: string,
    language: LoadedLanguage,
    options?: { rainbowBrackets?: boolean },
  ): HighlightEvent[];
  format?(source: string, language: LoadedLanguage, formatter: Formatter): string | undefined;
  formatAsync?(
    source: string,
    language: LoadedLanguage,
    formatter: Formatter,
  ): Promise<string | undefined>;
}

export interface LanguagesModule {
  createRuntime(options?: HighlighterRuntimeOptions): RuntimeLike;
  configureWasmResolver(fn: WasmResolver): void;
  configureLanguagePackageResolver(fn: LanguagePackageResolver): void;
  initParser(): Promise<void>;
  registerLanguage(def: LanguageDefinition): void;
  resolveLanguageId(nameOrAlias: string): string;
  loadLanguage(opts: LoadLanguageOptions): Promise<LoadedLanguage>;
  resolveLanguagePackage(
    language: LanguageDefinition,
    packageName: string,
  ): Promise<ResolvedLanguagePackage>;
  loadPlaintext(): Promise<LoadedLanguage>;
  getLoadedLanguage(nameOrAlias: string): LoadedLanguage | undefined;
  getLoadedLanguageIds(): string[];
  availableLanguages(): LanguageInfo[];
  getDefaultRuntime(): RuntimeLike;
}

/** Tried in order; both serve the same `<package>@<version>/<file>` layout. */
export const CDNS = ["https://cdn.jsdelivr.net/npm", "https://unpkg.com"] as const;

/** @internal */
export const DEFAULT_RESOLVER: WasmResolver = (_language, wasm) =>
  `${CDNS[0]}/${wasm.packageName}@${wasm.version}/${wasm.name}.wasm`;
export const DEFAULT_LANGUAGE_PACKAGE_RESOLVER: LanguagePackageResolver = (packageName) =>
  `${CDNS[0]}/${packageName}@latest/language.json`;

/** Only used with the default resolver; a custom resolver names one location. */
async function fetchFromCdns(primary: string, isDefault: boolean): Promise<Response> {
  const urls = isDefault ? CDNS.map((base) => primary.replace(CDNS[0], base)) : [primary];
  const failures: { host: string; reason: string }[] = [];
  for (const url of urls) {
    const host = new URL(url).host;
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      failures.push({ host, reason: `HTTP ${response.status} ${response.statusText}`.trim() });
    } catch (error) {
      failures.push({ host, reason: error instanceof Error ? error.message : String(error) });
    }
  }
  throw new Error(describeFailures(failures));
}

/** Every mirror serving the same 404 is one fact, not two, so say it once. */
function describeFailures(failures: { host: string; reason: string }[]): string {
  const hosts = failures.map(({ host }) => host).join(", ");
  const first = failures[0]?.reason;
  if (first !== undefined && failures.every(({ reason }) => reason === first)) {
    return `${first} (tried ${hosts})`;
  }
  return failures.map(({ host, reason }) => `${host}: ${reason}`).join("; ");
}

const HIGHLIGHT_NAMES_SET = new Set(HIGHLIGHT_NAMES);
const PLAINTEXT_ALIASES = ["text", "txt", "plain"];

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function createSharedRuntimeCache(): SharedRuntimeCache {
  return {
    wasmBytes: new Map<string, Uint8Array>(),
    wasmLoads: new Map<string, Promise<Uint8Array>>(),
    packages: new Map<string, LanguagePackage>(),
    packageLoads: new Map<string, Promise<LanguagePackage>>(),
  };
}

/** @internal */
export function cacheKey(ref: WasmRef): string {
  return `${ref.name}-${ref.version}-${ref.sha256}`;
}

function isWasmRef(wasm: object): wasm is WasmRef {
  return (
    "packageName" in wasm &&
    "name" in wasm &&
    "version" in wasm &&
    "sha256" in wasm &&
    "size" in wasm
  );
}

function isRuntimeWasmInput(
  wasm: NonNullable<LoadLanguageOptions["wasm"]>,
): wasm is Uint8Array | ArrayBuffer | string | URL | Response {
  return !(typeof wasm === "object" && wasm !== null && isWasmRef(wasm));
}

export function languagePackageCacheKey(packageName: string): string {
  return `language-package-${packageName}`;
}

export function parseLanguagePackage(
  data: Uint8Array,
  expectedPackageName: string,
): LanguagePackage {
  const value = JSON.parse(decoder.decode(data)) as LanguagePackage;
  const languages =
    typeof value.languages === "object" && value.languages !== null
      ? Object.values(value.languages)
      : [];
  if (
    value.packageName !== expectedPackageName ||
    typeof value.version !== "string" ||
    !isSafePackagePathSegment(value.version) ||
    typeof value.definitionHash !== "string" ||
    value.definitionHash.length === 0 ||
    typeof value.parser?.name !== "string" ||
    !isSafePackagePathSegment(value.parser.name) ||
    typeof value.parser?.grammarName !== "string" ||
    value.parser.grammarName.length === 0 ||
    typeof value.parser?.sha256 !== "string" ||
    !/^[0-9a-f]{64}$/.test(value.parser.sha256) ||
    !Number.isSafeInteger(value.parser?.size) ||
    value.parser.size <= 0 ||
    languages.length === 0 ||
    languages.some(
      (language) =>
        !Array.isArray(language.aliases) ||
        language.aliases.some((alias) => typeof alias !== "string") ||
        typeof language.highlights !== "string" ||
        (language.injections !== undefined && typeof language.injections !== "string") ||
        (language.locals !== undefined && typeof language.locals !== "string") ||
        (language.brackets !== undefined && typeof language.brackets !== "string"),
    )
  ) {
    throw new Error(`Invalid Lumis language package: ${expectedPackageName}`);
  }
  return value;
}

function isSafePackagePathSegment(value: string): boolean {
  return (
    value !== "" &&
    value !== "." &&
    value !== ".." &&
    !value.includes("/") &&
    !value.includes("\\") &&
    !value.includes("\0")
  );
}

export function serializeLanguagePackageCache(packageMetadata: LanguagePackage): Uint8Array {
  return encoder.encode(
    JSON.stringify({
      checkedAt: Date.now(),
      package: packageMetadata,
    } satisfies CachedLanguagePackage),
  );
}

function packagedLanguage(
  language: LanguageDefinition,
  packageMetadata: LanguagePackage,
): [string, PackagedLanguage] {
  for (const [id, definition] of Object.entries(packageMetadata.languages)) {
    if (
      id.toLowerCase() === language.id.toLowerCase() ||
      definition.aliases.some((alias) => alias.toLowerCase() === language.id.toLowerCase())
    ) {
      return [id, definition];
    }
  }
  throw new Error(
    `Language "${language.id}" is not provided by ${packageMetadata.packageName}@${packageMetadata.version}`,
  );
}

let treeSitterPromise: Promise<typeof import("web-tree-sitter")> | undefined;

async function loadTreeSitter() {
  treeSitterPromise ??= import("web-tree-sitter");
  return treeSitterPromise;
}

async function trackLoad<T>(
  loads: Map<string, Promise<T>>,
  key: string,
  promise: Promise<T>,
): Promise<T> {
  loads.set(key, promise);

  try {
    return await promise;
  } finally {
    loads.delete(key);
  }
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(data: Uint8Array): Promise<string> {
  // Browsers withhold crypto.subtle from non-secure origins, so plain HTTP
  // reaches here with it undefined. Keep the native path: on a 1.6 MiB parser
  // it is 1.3 ms against 35.9 ms, and this runs on every load, cache hits too.
  if (!globalThis.crypto?.subtle) return hex(sha256(data));

  const bytes =
    data.buffer instanceof ArrayBuffer &&
    data.byteOffset === 0 &&
    data.byteLength === data.buffer.byteLength
      ? data.buffer
      : data.slice().buffer;
  return hex(new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", bytes)));
}

/** @internal */
export async function verifyWasm(ref: WasmRef, data: Uint8Array): Promise<Uint8Array> {
  if (data.byteLength !== ref.size) {
    throw new Error(
      `Invalid WASM size for ${ref.name}@${ref.version}: expected ${ref.size}, got ${data.byteLength}`,
    );
  }
  const actual = await sha256Hex(data);
  if (actual !== ref.sha256) {
    throw new Error(
      `Invalid WASM integrity for ${ref.name}@${ref.version}: expected sha256-${ref.sha256}, got sha256-${actual}`,
    );
  }
  return data;
}

function matchesSpecialCapture(name: string, base: string): boolean {
  return name === base;
}

function resolveHighlightName(captureName: string): string | undefined {
  const name = captureName.startsWith("@") ? captureName.slice(1) : captureName;

  if (
    name.length === 0 ||
    name.startsWith("_") ||
    matchesSpecialCapture(name, "injection.content") ||
    matchesSpecialCapture(name, "injection.language") ||
    matchesSpecialCapture(name, "local.scope") ||
    matchesSpecialCapture(name, "local.definition") ||
    matchesSpecialCapture(name, "local.definition-value") ||
    matchesSpecialCapture(name, "local.reference")
  ) {
    return undefined;
  }

  if (HIGHLIGHT_NAMES_SET.has(name)) {
    return name;
  }

  const captureParts = new Set(name.split("."));
  let best: string | undefined;
  let bestLen = 0;

  for (const recognized of HIGHLIGHT_NAMES) {
    const recognizedParts = recognized.split(".");
    if (
      recognizedParts.length > bestLen &&
      recognizedParts.every((part) => captureParts.has(part))
    ) {
      best = recognized;
      bestLen = recognizedParts.length;
    }
  }

  return best;
}

function compileHighlightConfig(
  language: Language,
  Query: typeof TreeSitterQuery,
  highlightsQuery: string,
  injectionsQuery = "",
  localsQuery = "",
): CompiledHighlightConfig {
  const querySource = `${injectionsQuery}${localsQuery}${highlightsQuery}`;
  const localsQueryOffset = injectionsQuery.length;
  const highlightsQueryOffset = injectionsQuery.length + localsQuery.length;
  const query = new Query(language, querySource);

  let injectionPatternEnd = 0;
  let localsPatternEnd = 0;
  for (let i = 0; i < query.patternCount(); i += 1) {
    const patternOffset = query.startIndexForPattern(i);
    if (patternOffset < highlightsQueryOffset) {
      localsPatternEnd += 1;
    }
    if (patternOffset < localsQueryOffset) {
      injectionPatternEnd += 1;
    }
  }

  const captureMetadata: Record<string, CaptureMetadata> = {};

  for (const captureName of query.captureNames) {
    captureMetadata[captureName] = {
      highlightScope: resolveHighlightName(captureName),
      isInjectionContent: matchesSpecialCapture(captureName, "injection.content"),
      isInjectionLanguage: matchesSpecialCapture(captureName, "injection.language"),
      isLocalScope: matchesSpecialCapture(captureName, "local.scope"),
      isLocalDefinition: matchesSpecialCapture(captureName, "local.definition"),
      isLocalDefinitionValue: matchesSpecialCapture(captureName, "local.definition-value"),
      isLocalReference: matchesSpecialCapture(captureName, "local.reference"),
    };
  }

  const nonLocalVariablePatterns = Array.from({ length: query.patternCount() }, (_, index) => {
    const refuted = query.refutedProperties[index] ?? {};
    return Object.prototype.hasOwnProperty.call(refuted, "local");
  });

  // Neovim applies `#offset!` to injection ranges *and* highlight ranges, so this
  // collects offsets for every pattern, not just the injection ones.
  const captureOffsets = Array.from(
    { length: query.patternCount() },
    (_, patternIndex): Record<string, QueryCaptureOffset> | undefined => {
      let offsets: Record<string, QueryCaptureOffset> | undefined;

      for (const predicate of query.predicatesForPattern(patternIndex) ?? []) {
        if (predicate.operator !== "offset!" || predicate.operands.length !== 5) continue;

        const [captureStep, startRow, startColumn, endRow, endColumn] = predicate.operands;
        if (
          captureStep?.type !== "capture" ||
          startRow?.type !== "string" ||
          startColumn?.type !== "string" ||
          endRow?.type !== "string" ||
          endColumn?.type !== "string"
        ) {
          continue;
        }

        offsets ??= {};
        offsets[captureStep.name] = {
          startRow: Number.parseInt(startRow.value, 10),
          startColumn: Number.parseInt(startColumn.value, 10),
          endRow: Number.parseInt(endRow.value, 10),
          endColumn: Number.parseInt(endColumn.value, 10),
        };
      }

      return offsets;
    },
  );

  return {
    query,
    injectionPatternEnd,
    localsPatternEnd,
    captureMetadata,
    nonLocalVariablePatterns,
    captureOffsets,
  };
}

export function createLanguagesModule(runtime: RuntimeEnvironment): LanguagesModule {
  let configuredDefaultResolver: WasmResolver = DEFAULT_RESOLVER;
  let configuredLanguagePackageResolver: LanguagePackageResolver =
    DEFAULT_LANGUAGE_PACKAGE_RESOLVER;
  const moduleCache = createSharedRuntimeCache();

  class HighlighterRuntime implements RuntimeLike {
    private explicitResolver: WasmResolver | undefined;
    private explicitLanguagePackageResolver: LanguagePackageResolver | undefined;
    private readonly sharedCache: SharedRuntimeCache;
    private readonly loadedLanguages = new Map<string, LoadedLanguage>();
    private readonly aliasMap = new Map<string, string>();
    private readonly languageLoads = new Map<string, Promise<LoadedLanguage>>();
    private readonly bracketCompilers = new WeakMap<
      LoadedLanguage,
      () => CompiledBracketConfig | undefined
    >();

    constructor(options: HighlighterRuntimeOptions = {}) {
      this.explicitResolver = options.wasmResolver;
      this.explicitLanguagePackageResolver = options.languagePackageResolver;
      this.sharedCache = options.sharedCache ?? moduleCache;

      for (const alias of PLAINTEXT_ALIASES) {
        this.aliasMap.set(alias, PLAINTEXT_LANG_ID);
      }
    }

    private get resolver(): WasmResolver {
      return this.explicitResolver ?? configuredDefaultResolver;
    }

    private get languagePackageResolver(): LanguagePackageResolver {
      return this.explicitLanguagePackageResolver ?? configuredLanguagePackageResolver;
    }

    private async readCachedLanguagePackage(
      packageName: string,
    ): Promise<CachedLanguagePackage | undefined> {
      const bytes = await runtime.readFsCache(languagePackageCacheKey(packageName));
      if (!bytes) return undefined;
      try {
        const cached = JSON.parse(decoder.decode(bytes)) as CachedLanguagePackage;
        const serialized = encoder.encode(JSON.stringify(cached.package));
        return {
          checkedAt: cached.checkedAt,
          package: parseLanguagePackage(serialized, packageName),
        };
      } catch {
        return undefined;
      }
    }

    private async loadInstalledLanguagePackage(
      packageName: string,
    ): Promise<LanguagePackage | undefined> {
      try {
        const mod = await import(
          /* webpackIgnore: true */
          /* turbopackIgnore: true */
          /* @vite-ignore */
          packageName
        );
        const base = mod.default as unknown;
        if (!(base instanceof URL) && typeof base !== "string") return undefined;
        const source = new URL("./language.json", base instanceof URL ? base : new URL(base));
        const disk = await runtime.readResolvedWasmFromDisk(source);
        if (disk) return parseLanguagePackage(disk, packageName);
        const response = await fetch(source);
        if (!response.ok) return undefined;
        return parseLanguagePackage(new Uint8Array(await response.arrayBuffer()), packageName);
      } catch {
        return undefined;
      }
    }

    private async fetchLanguagePackage(packageName: string): Promise<LanguagePackage> {
      const source = this.languagePackageResolver(packageName);
      const disk = await runtime.readResolvedWasmFromDisk(source);
      if (disk) return parseLanguagePackage(disk, packageName);
      const href = typeof source === "string" ? source : source.href;
      const response = await fetchFromCdns(
        href,
        this.languagePackageResolver === DEFAULT_LANGUAGE_PACKAGE_RESOLVER,
      ).catch((error: Error) => {
        throw new Error(`could not download language package ${packageName}: ${error.message}`);
      });
      return parseLanguagePackage(new Uint8Array(await response.arrayBuffer()), packageName);
    }

    private async resolvePackage(packageName: string): Promise<LanguagePackage> {
      const memory = this.sharedCache.packages.get(packageName);
      if (memory) return memory;
      const inFlight = this.sharedCache.packageLoads.get(packageName);
      if (inFlight) return inFlight;

      const load = (async () => {
        const staged = await runtime.readStagedAsset?.(
          `${packageName.replace(/^@lumis-sh\/wasm-/, "")}.language.json`,
        );
        if (staged) return parseLanguagePackage(staged, packageName);

        const installed = await this.loadInstalledLanguagePackage(packageName);
        if (installed) return installed;

        const cached = await this.readCachedLanguagePackage(packageName);
        if (cached && Date.now() - cached.checkedAt < PACKAGE_CACHE_TTL_MS) {
          return cached.package;
        }

        try {
          const packageMetadata = await this.fetchLanguagePackage(packageName);
          await runtime.writeFsCache(
            languagePackageCacheKey(packageName),
            serializeLanguagePackageCache(packageMetadata),
          );
          return packageMetadata;
        } catch (error) {
          if (cached) return cached.package;
          throw error;
        }
      })().then((value) => {
        this.sharedCache.packages.set(packageName, value);
        return value;
      });

      return trackLoad(this.sharedCache.packageLoads, packageName, load);
    }

    private async readVerifiedCache(ref: WasmRef, key: string): Promise<Uint8Array | undefined> {
      const fsCached = await runtime.readFsCache(key);
      if (fsCached) {
        try {
          return await verifyWasm(ref, fsCached);
        } catch {
          // Corrupt or stale entries are replaced atomically by the locked writer.
        }
      }
      return undefined;
    }

    private async loadInstalledPackage(ref: WasmRef): Promise<Uint8Array | undefined> {
      try {
        const mod = await import(
          /* webpackIgnore: true */
          /* turbopackIgnore: true */
          /* @vite-ignore */
          ref.packageName
        );
        const input = mod.default as unknown;
        if (
          input instanceof Uint8Array ||
          input instanceof ArrayBuffer ||
          input instanceof URL ||
          typeof input === "string"
        ) {
          const resolved = await runtime.resolveWasm(input);
          if (resolved instanceof Uint8Array) return resolved;
          const disk = await runtime.readResolvedWasmFromDisk(resolved);
          if (disk) return disk;
          const response = await fetch(resolved);
          if (!response.ok) return undefined;
          return new Uint8Array(await response.arrayBuffer());
        }
      } catch {}
      return undefined;
    }

    private async fetchResolvedWasm(language: string, ref: WasmRef): Promise<Uint8Array> {
      const staged = await runtime.readStagedAsset?.(
        `${ref.name}-${ref.version}-${ref.sha256}.wasm`,
      );
      if (staged) return staged;

      const installed = await this.loadInstalledPackage(ref);
      if (installed) return installed;

      const url = this.resolver(language, ref);
      const diskData = await runtime.readResolvedWasmFromDisk(url);
      if (diskData) return diskData;
      const href = typeof url === "string" ? url : url.href;
      const response = await fetchFromCdns(href, this.resolver === DEFAULT_RESOLVER).catch(
        (error: Error) => {
          throw new Error(
            `could not download parser WASM ${ref.name}@${ref.version}: ${error.message}`,
          );
        },
      );
      return new Uint8Array(await response.arrayBuffer());
    }

    private async loadWasmBytes(language: string, ref: WasmRef, key: string): Promise<Uint8Array> {
      const fsCached = await this.readVerifiedCache(ref, key);
      if (fsCached) return fsCached;

      return runtime.withFsCacheLock(key, async () => {
        const lockedCache = await this.readVerifiedCache(ref, key);
        if (lockedCache) return lockedCache;

        const data = await verifyWasm(ref, await this.fetchResolvedWasm(language, ref));
        await runtime.writeFsCache(key, data);
        return data;
      });
    }

    private async createLoadedLanguage(opts: LoadLanguageOptions): Promise<LoadedLanguage> {
      await this.initParser();

      const resolved = opts.packageName
        ? {
            ...(await this.resolveLanguagePackage(opts.definition, opts.packageName)),
            ...(opts.wasm === undefined ? {} : { wasm: opts.wasm }),
          }
        : opts;
      if (!resolved.wasm || resolved.highlights === undefined) {
        throw new Error(
          `Language "${opts.definition.id}" requires packageName or complete queries and WASM`,
        );
      }

      let wasmInput: Uint8Array | string;
      if (typeof resolved.wasm === "object" && resolved.wasm !== null && isWasmRef(resolved.wasm)) {
        wasmInput = await this.resolveWasmRef(resolved.definition.id, resolved.wasm);
      } else if (isRuntimeWasmInput(resolved.wasm)) {
        wasmInput = await runtime.resolveWasm(resolved.wasm);
      } else {
        throw new Error(`Unsupported WASM input for language "${opts.definition.id}"`);
      }

      const { Language, Parser, Query } = await loadTreeSitter();
      const language = await Language.load(wasmInput);
      const parser = new Parser();
      parser.setLanguage(language);

      const loaded: LoadedLanguage = {
        definition: resolved.definition,
        parser,
        language,
        config: compileHighlightConfig(
          language,
          Query,
          resolved.highlights,
          resolved.injections,
          resolved.locals,
        ),
      };
      if (resolved.brackets) {
        this.bracketCompilers.set(loaded, () =>
          compileBracketConfig(language, Query, resolved.brackets),
        );
      }

      this.loadedLanguages.set(resolved.definition.id, loaded);
      this.registerLanguage(resolved.definition);
      return loaded;
    }

    configureWasmResolver(fn: WasmResolver): void {
      this.explicitResolver = fn;
    }

    configureLanguagePackageResolver(fn: LanguagePackageResolver): void {
      this.explicitLanguagePackageResolver = fn;
    }

    async resolveLanguagePackage(
      language: LanguageDefinition,
      packageName: string,
    ): Promise<ResolvedLanguagePackage> {
      const packageMetadata = await this.resolvePackage(packageName);
      const [id, packaged] = packagedLanguage(language, packageMetadata);
      return {
        definition: { id, aliases: packaged.aliases },
        wasm: {
          packageName: packageMetadata.packageName,
          name: packageMetadata.parser.name,
          version: packageMetadata.version,
          sha256: packageMetadata.parser.sha256,
          size: packageMetadata.parser.size,
        },
        highlights: packaged.highlights,
        injections: packaged.injections,
        locals: packaged.locals,
        brackets: packaged.brackets,
      };
    }

    async initParser(): Promise<void> {
      this.sharedCache.parserInit ??= Promise.all([
        loadTreeSitter(),
        runtime.parserInitOptions?.() ?? Promise.resolve(undefined),
      ]).then(([{ Parser }, initOptions]) => Parser.init(initOptions));
      await this.sharedCache.parserInit;
    }

    registerLanguage(def: LanguageDefinition): void {
      for (const alias of def.aliases) {
        this.aliasMap.set(alias, def.id);
      }
    }

    resolveLanguageId(nameOrAlias: string): string {
      return this.aliasMap.get(nameOrAlias) ?? nameOrAlias;
    }

    getLoadedLanguage(nameOrAlias: string): LoadedLanguage | undefined {
      const id = this.resolveLanguageId(nameOrAlias);
      return this.loadedLanguages.get(id);
    }

    getLoadedLanguageIds(): string[] {
      return [...this.loadedLanguages.keys()];
    }

    private async resolveWasmRef(language: string, ref: WasmRef): Promise<Uint8Array> {
      const key = cacheKey(ref);
      const cached = this.sharedCache.wasmBytes.get(key);
      if (cached) return cached;

      const existingLoad = this.sharedCache.wasmLoads.get(key);
      if (existingLoad) {
        return existingLoad;
      }

      const load = this.loadWasmBytes(language, ref, key).then((data) => {
        this.sharedCache.wasmBytes.set(key, data);
        return data;
      });
      return trackLoad(this.sharedCache.wasmLoads, key, load);
    }

    async loadLanguage(opts: LoadLanguageOptions): Promise<LoadedLanguage> {
      if (opts.definition.id === PLAINTEXT_LANG_ID) {
        return this.createPlaintext(opts.definition);
      }
      const existing = this.loadedLanguages.get(opts.definition.id);
      if (existing) return existing;

      const inFlight = this.languageLoads.get(opts.definition.id);
      if (inFlight) return inFlight;

      return trackLoad(this.languageLoads, opts.definition.id, this.createLoadedLanguage(opts));
    }

    async loadPlaintext(): Promise<LoadedLanguage> {
      return this.createPlaintext({ id: PLAINTEXT_LANG_ID, aliases: PLAINTEXT_ALIASES });
    }

    private createPlaintext(definition: LanguageDefinition): LoadedLanguage {
      const existing = this.loadedLanguages.get(PLAINTEXT_LANG_ID);
      if (existing) return existing;

      const loaded = { definition } as LoadedLanguage;
      this.loadedLanguages.set(PLAINTEXT_LANG_ID, loaded);
      this.registerLanguage(definition);
      return loaded;
    }

    highlightEvents(
      source: string,
      language: LoadedLanguage,
      options: { rainbowBrackets?: boolean } = {},
    ): HighlightEvent[] {
      if (language.definition.id === PLAINTEXT_LANG_ID) {
        return [{ type: "source", startByte: 0, endByte: encoder.encode(source).byteLength }];
      }
      if (options.rainbowBrackets && !language.brackets) {
        const compile = this.bracketCompilers.get(language);
        if (compile) {
          this.bracketCompilers.delete(language);
          language.brackets = compile();
        }
      }
      return buildHighlightEvents(source, language, this, options) as HighlightEvent[];
    }
  }

  const defaultRuntime = new HighlighterRuntime();

  return {
    createRuntime(options = {}) {
      return new HighlighterRuntime(options);
    },
    configureWasmResolver(fn) {
      configuredDefaultResolver = fn;
      defaultRuntime.configureWasmResolver(fn);
    },
    configureLanguagePackageResolver(fn) {
      configuredLanguagePackageResolver = fn;
      defaultRuntime.configureLanguagePackageResolver(fn);
    },
    initParser() {
      return defaultRuntime.initParser();
    },
    registerLanguage(def) {
      defaultRuntime.registerLanguage(def);
    },
    resolveLanguageId(nameOrAlias) {
      return defaultRuntime.resolveLanguageId(nameOrAlias);
    },
    loadLanguage(opts) {
      return defaultRuntime.loadLanguage(opts);
    },
    resolveLanguagePackage(language, packageName) {
      return defaultRuntime.resolveLanguagePackage(language, packageName);
    },
    loadPlaintext() {
      return defaultRuntime.loadPlaintext();
    },
    getLoadedLanguage(nameOrAlias) {
      return defaultRuntime.getLoadedLanguage(nameOrAlias);
    },
    getLoadedLanguageIds() {
      return defaultRuntime.getLoadedLanguageIds();
    },
    availableLanguages() {
      return LANGUAGES;
    },
    getDefaultRuntime() {
      return defaultRuntime;
    },
  };
}

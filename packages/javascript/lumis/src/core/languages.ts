import type { Language } from "web-tree-sitter";
import { buildHighlightEvents } from "../events.js";
import { LANGUAGES } from "../generated/languages-meta.js";
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

export interface SharedRuntimeCache {
  parserInit?: Promise<void>;
  wasmBytes: Map<string, Uint8Array>;
  wasmLoads: Map<string, Promise<Uint8Array>>;
}

async function compileBracketConfig(
  language: Language,
  bracketsQuery?: string,
): Promise<CompiledBracketConfig | undefined> {
  if (!bracketsQuery) return undefined;

  const { Query } = await loadTreeSitter();

  // A bracket query can reference anonymous nodes that do not exist in a given
  // grammar (for example HTML has no "(" token). Treat a query that fails to
  // compile as "no rainbow brackets for this language" instead of failing the
  // whole language load, matching the Rust reference implementation.
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
  wasm: WasmRef | Uint8Array | ArrayBuffer | string | URL | Response;
  highlights: string;
  injections?: string;
  locals?: string;
  brackets?: string;
}

export interface HighlighterRuntimeOptions {
  wasmResolver?: WasmResolver;
  sharedCache?: SharedRuntimeCache;
}

export interface RuntimeLike {
  configureWasmResolver(fn: WasmResolver): void;
  initParser(): Promise<void>;
  registerLanguage(def: LanguageDefinition): void;
  resolveLanguageId(nameOrAlias: string): string;
  getLoadedLanguage(nameOrAlias: string): LoadedLanguage | undefined;
  getLoadedLanguageIds(): string[];
  loadLanguage(opts: LoadLanguageOptions): Promise<LoadedLanguage>;
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
  initParser(): Promise<void>;
  registerLanguage(def: LanguageDefinition): void;
  resolveLanguageId(nameOrAlias: string): string;
  loadLanguage(opts: LoadLanguageOptions): Promise<LoadedLanguage>;
  loadPlaintext(): Promise<LoadedLanguage>;
  getLoadedLanguage(nameOrAlias: string): LoadedLanguage | undefined;
  getLoadedLanguageIds(): string[];
  availableLanguages(): LanguageInfo[];
  getDefaultRuntime(): RuntimeLike;
}

const DEFAULT_RESOLVER: WasmResolver = (_language, wasm) =>
  `https://cdn.jsdelivr.net/npm/${wasm.packageName}@${wasm.version}/${wasm.name}.wasm`;

const HIGHLIGHT_NAMES_SET = new Set(HIGHLIGHT_NAMES);
const PLAINTEXT_ALIASES = ["text", "txt", "plain"];
const PLAINTEXT_WASM: WasmRef = {
  packageName: "@lumis-sh/wasm-diff",
  name: "tree-sitter-diff",
  version: "0.26",
};

function createSharedRuntimeCache(): SharedRuntimeCache {
  return {
    wasmBytes: new Map<string, Uint8Array>(),
    wasmLoads: new Map<string, Promise<Uint8Array>>(),
  };
}

function cacheKey(name: string, version: string): string {
  return `${name}-${version}`;
}

function isWasmRef(wasm: object): wasm is WasmRef {
  return "packageName" in wasm && "name" in wasm && "version" in wasm;
}

function isRuntimeWasmInput(
  wasm: LoadLanguageOptions["wasm"],
): wasm is Uint8Array | ArrayBuffer | string | URL | Response {
  return !(typeof wasm === "object" && wasm !== null && isWasmRef(wasm));
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

async function compileHighlightConfig(
  language: Language,
  highlightsQuery: string,
  injectionsQuery = "",
  localsQuery = "",
): Promise<CompiledHighlightConfig> {
  const { Query } = await loadTreeSitter();
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

  const injectionOffsets = Array.from(
    { length: query.patternCount() },
    (): Record<string, QueryCaptureOffset> | undefined => undefined,
  );

  for (let patternIndex = 0; patternIndex < injectionPatternEnd; patternIndex += 1) {
    const predicates = query.predicatesForPattern(patternIndex) ?? [];
    let offsetsByCapture: Record<string, QueryCaptureOffset> | undefined;

    for (const predicate of predicates) {
      if (predicate.operator !== "offset!" || predicate.operands.length !== 5) {
        continue;
      }

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

      offsetsByCapture ??= {};
      offsetsByCapture[captureStep.name] = {
        startRow: Number.parseInt(startRow.value, 10),
        startColumn: Number.parseInt(startColumn.value, 10),
        endRow: Number.parseInt(endRow.value, 10),
        endColumn: Number.parseInt(endColumn.value, 10),
      };
    }

    injectionOffsets[patternIndex] = offsetsByCapture;
  }

  return {
    query,
    injectionPatternEnd,
    localsPatternEnd,
    captureMetadata,
    nonLocalVariablePatterns,
    injectionOffsets,
  };
}

export function createLanguagesModule(runtime: RuntimeEnvironment): LanguagesModule {
  let configuredDefaultResolver: WasmResolver = DEFAULT_RESOLVER;

  class HighlighterRuntime implements RuntimeLike {
    private explicitResolver: WasmResolver | undefined;
    private readonly sharedCache: SharedRuntimeCache;
    private readonly loadedLanguages = new Map<string, LoadedLanguage>();
    private readonly aliasMap = new Map<string, string>();
    private readonly languageLoads = new Map<string, Promise<LoadedLanguage>>();

    constructor(options: HighlighterRuntimeOptions = {}) {
      this.explicitResolver = options.wasmResolver;
      this.sharedCache = options.sharedCache ?? createSharedRuntimeCache();

      for (const alias of PLAINTEXT_ALIASES) {
        this.aliasMap.set(alias, PLAINTEXT_LANG_ID);
      }
    }

    private get resolver(): WasmResolver {
      return this.explicitResolver ?? configuredDefaultResolver;
    }

    private async loadWasmBytes(language: string, ref: WasmRef, key: string): Promise<Uint8Array> {
      const fsCached = await runtime.readFsCache(key);
      if (fsCached) {
        this.sharedCache.wasmBytes.set(key, fsCached);
        return fsCached;
      }

      try {
        const mod = await import(
          /* webpackIgnore: true */
          /* turbopackIgnore: true */
          /* @vite-ignore */
          ref.packageName
        );
        if (mod.default instanceof Uint8Array) {
          this.sharedCache.wasmBytes.set(key, mod.default);
          return mod.default;
        }
      } catch {
        // Package not installed - fall back to resolver URL
      }

      const url = this.resolver(language, ref);
      const diskData = await runtime.readResolvedWasmFromDisk(url);
      if (diskData) {
        this.sharedCache.wasmBytes.set(key, diskData);
        return diskData;
      }

      const response = await fetch(typeof url === "string" ? url : url.href);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch WASM for ${ref.name}@${ref.version}: ${response.status} ${response.statusText}`,
        );
      }

      const data = new Uint8Array(await response.arrayBuffer());
      this.sharedCache.wasmBytes.set(key, data);
      await runtime.writeFsCache(key, data);
      return data;
    }

    private async createLoadedLanguage(opts: LoadLanguageOptions): Promise<LoadedLanguage> {
      await this.initParser();

      let wasmInput: Uint8Array | string;
      if (typeof opts.wasm === "object" && opts.wasm !== null && isWasmRef(opts.wasm)) {
        wasmInput = await this.resolveWasmRef(opts.definition.id, opts.wasm);
      } else if (isRuntimeWasmInput(opts.wasm)) {
        wasmInput = await runtime.resolveWasm(opts.wasm);
      } else {
        throw new Error(`Unsupported WASM input for language "${opts.definition.id}"`);
      }

      const { Language, Parser } = await loadTreeSitter();
      const language = await Language.load(wasmInput);
      const parser = new Parser();
      parser.setLanguage(language);

      const loaded: LoadedLanguage = {
        definition: opts.definition,
        parser,
        language,
        config: await compileHighlightConfig(
          language,
          opts.highlights,
          opts.injections,
          opts.locals,
        ),
        brackets: await compileBracketConfig(language, opts.brackets),
      };

      this.loadedLanguages.set(opts.definition.id, loaded);
      this.registerLanguage(opts.definition);
      return loaded;
    }

    configureWasmResolver(fn: WasmResolver): void {
      this.explicitResolver = fn;
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
      const key = cacheKey(ref.name, ref.version);
      const cached = this.sharedCache.wasmBytes.get(key);
      if (cached) return cached;

      const existingLoad = this.sharedCache.wasmLoads.get(key);
      if (existingLoad) {
        return existingLoad;
      }

      return trackLoad(this.sharedCache.wasmLoads, key, this.loadWasmBytes(language, ref, key));
    }

    async loadLanguage(opts: LoadLanguageOptions): Promise<LoadedLanguage> {
      const existing = this.loadedLanguages.get(opts.definition.id);
      if (existing) return existing;

      const inFlight = this.languageLoads.get(opts.definition.id);
      if (inFlight) return inFlight;

      return trackLoad(this.languageLoads, opts.definition.id, this.createLoadedLanguage(opts));
    }

    async loadPlaintext(): Promise<LoadedLanguage> {
      const existing = this.loadedLanguages.get(PLAINTEXT_LANG_ID);
      if (existing) return existing;

      return this.loadLanguage({
        definition: { id: PLAINTEXT_LANG_ID, aliases: PLAINTEXT_ALIASES },
        wasm: await this.resolveWasmRef("diff", PLAINTEXT_WASM),
        highlights: "",
      });
    }

    highlightEvents(
      source: string,
      language: LoadedLanguage,
      options: { rainbowBrackets?: boolean } = {},
    ): HighlightEvent[] {
      return buildHighlightEvents(source, language, this, options) as HighlightEvent[];
    }
  }

  const defaultSharedCache = createSharedRuntimeCache();
  const defaultRuntime = new HighlighterRuntime({ sharedCache: defaultSharedCache });

  return {
    createRuntime(options = {}) {
      return new HighlighterRuntime(options);
    },
    configureWasmResolver(fn) {
      configuredDefaultResolver = fn;
      defaultRuntime.configureWasmResolver(fn);
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

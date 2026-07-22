import { LANGUAGES } from "../generated/languages-meta.js";
import { NATIVE_QUERY_LOADERS } from "../generated/native-query-loaders.js";
import { HIGHLIGHT_NAMES } from "../highlights.js";
import type { NativeBinding, NativeFormatter, NativeRuntimeInstance } from "../native-binding.js";
import type { RuntimeEnvironment } from "../runtime/runtime.js";
import type {
  Formatter,
  HighlightEvent,
  LanguageDefinition,
  LanguageInfo,
  LoadedLanguage,
  WasmRef,
} from "../types.js";
import { builtinFormatterKind } from "./builtin-formatter.js";
import { PLAINTEXT_LANG_ID } from "../types.js";
import type {
  HighlighterRuntimeOptions,
  LanguagesModule,
  LoadLanguageOptions,
  RuntimeLike,
  SharedRuntimeCache,
  WasmResolver,
} from "./languages.js";
import { specializeInjections } from "./injection-specialization.js";

const DEFAULT_RESOLVER: WasmResolver = (_language, wasm) =>
  `https://cdn.jsdelivr.net/npm/${wasm.packageName}@${wasm.version}/${wasm.name}.wasm`;
const PLAINTEXT_ALIASES = ["text", "txt", "plain"];
const BUILTIN_LANGUAGE_IDS = new Set(LANGUAGES.map(({ id }) => id));
const decoder = new TextDecoder();
const encoder = new TextEncoder();

interface NativeLoadedLanguage {
  definition: LanguageDefinition;
  queries?: {
    highlights: string;
    injections: string;
    locals: string;
    omittedLanguages: Set<string>;
  };
}

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

function grammarName(wasm: LoadLanguageOptions["wasm"], languageId: string): string {
  if (typeof wasm === "object" && wasm !== null && isWasmRef(wasm)) {
    return wasm.name.replace(/^tree-sitter-/, "").replaceAll("-", "_");
  }
  return languageId.replaceAll("-", "_");
}

function queryHash(opts: LoadLanguageOptions): number {
  const bytes = encoder.encode(
    [opts.highlights, opts.injections ?? "", opts.locals ?? "", opts.brackets ?? ""].join("\0"),
  );
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

function decodeEvents(data: Uint8Array): HighlightEvent[] {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const events: HighlightEvent[] = [];
  let offset = 0;

  while (offset < data.byteLength) {
    const tag = view.getUint8(offset);
    offset += 1;
    if (tag === 0) {
      if (offset + 8 > data.byteLength) throw new Error("Invalid native Lumis event buffer");
      const startByte = view.getUint32(offset, true);
      const endByte = view.getUint32(offset + 4, true);
      offset += 8;
      events.push({ type: "source", startByte, endByte });
      continue;
    }
    if (tag === 1) {
      if (offset + 4 > data.byteLength) throw new Error("Invalid native Lumis event buffer");
      const scopeIndex = view.getUint16(offset, true);
      const languageLength = view.getUint16(offset + 2, true);
      offset += 4;
      if (offset + languageLength > data.byteLength) {
        throw new Error("Invalid native Lumis event buffer");
      }
      const scope = HIGHLIGHT_NAMES[scopeIndex];
      if (!scope) throw new Error(`Unknown native Lumis highlight index ${scopeIndex}`);
      const language = decoder.decode(data.subarray(offset, offset + languageLength));
      offset += languageLength;
      events.push({ type: "start", scope, language });
      continue;
    }
    if (tag === 2) {
      events.push({ type: "end" });
      continue;
    }
    throw new Error(`Unknown native Lumis event tag ${tag}`);
  }

  return events;
}

export function createNativeLanguagesModule(
  environment: RuntimeEnvironment,
  binding: NativeBinding,
): LanguagesModule {
  let configuredDefaultResolver: WasmResolver = DEFAULT_RESOLVER;

  class NativeHighlighterRuntime implements RuntimeLike {
    private readonly native: NativeRuntimeInstance = new binding.NativeRuntime();
    private explicitResolver: WasmResolver | undefined;
    private readonly sharedCache: SharedRuntimeCache;
    private readonly loadedLanguages = new Map<string, NativeLoadedLanguage>();
    private readonly aliasMap = new Map<string, string>();
    private readonly registeredLanguageIds = new Set<string>();
    private readonly languageLoads = new Map<string, Promise<LoadedLanguage>>();

    constructor(options: HighlighterRuntimeOptions = {}) {
      this.explicitResolver = options.wasmResolver;
      this.sharedCache = options.sharedCache ?? createSharedRuntimeCache();
      for (const alias of PLAINTEXT_ALIASES) this.aliasMap.set(alias, PLAINTEXT_LANG_ID);
    }

    private get resolver(): WasmResolver {
      return this.explicitResolver ?? configuredDefaultResolver;
    }

    configureWasmResolver(fn: WasmResolver): void {
      // Preserve RuntimeLike semantics for callers that configure an instance directly.
      this.explicitResolver = fn;
    }

    async initParser(): Promise<void> {
      // Loading the addon constructs its Wasmtime engine; no web parser initialization is needed.
    }

    registerLanguage(definition: LanguageDefinition): void {
      this.registeredLanguageIds.add(definition.id);
      for (const alias of definition.aliases) this.aliasMap.set(alias, definition.id);
    }

    resolveLanguageId(nameOrAlias: string): string {
      return this.aliasMap.get(nameOrAlias) ?? nameOrAlias;
    }

    getLoadedLanguage(nameOrAlias: string): LoadedLanguage | undefined {
      const loaded = this.loadedLanguages.get(this.resolveLanguageId(nameOrAlias));
      return loaded as LoadedLanguage | undefined;
    }

    getLoadedLanguageIds(): string[] {
      return [...this.loadedLanguages.keys()];
    }

    private async loadWasmRef(language: string, ref: WasmRef): Promise<Uint8Array> {
      const key = cacheKey(ref.name, ref.version);
      const cached = this.sharedCache.wasmBytes.get(key);
      if (cached) return cached;
      const inFlight = this.sharedCache.wasmLoads.get(key);
      if (inFlight) return inFlight;

      return trackLoad(
        this.sharedCache.wasmLoads,
        key,
        (async () => {
          const fsCached = await environment.readFsCache(key);
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
            // Package not installed; use the configured URL/path resolver.
          }

          const resolved = this.resolver(language, ref);
          const diskData = await environment.readResolvedWasmFromDisk(resolved);
          if (diskData) {
            this.sharedCache.wasmBytes.set(key, diskData);
            return diskData;
          }

          const response = await fetch(typeof resolved === "string" ? resolved : resolved.href);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch WASM for ${ref.name}@${ref.version}: ${response.status} ${response.statusText}`,
            );
          }
          const data = new Uint8Array(await response.arrayBuffer());
          this.sharedCache.wasmBytes.set(key, data);
          await environment.writeFsCache(key, data);
          return data;
        })(),
      );
    }

    private async resolveWasmBytes(opts: LoadLanguageOptions): Promise<Uint8Array> {
      if (typeof opts.wasm === "object" && opts.wasm !== null && isWasmRef(opts.wasm)) {
        return this.loadWasmRef(opts.definition.id, opts.wasm);
      }

      const resolved = await environment.resolveWasm(opts.wasm);
      if (resolved instanceof Uint8Array) return resolved;
      const diskData = await environment.readResolvedWasmFromDisk(resolved);
      if (diskData) return diskData;
      const response = await fetch(resolved);
      if (!response.ok) {
        throw new Error(`Failed to fetch WASM for ${opts.definition.id}: ${response.status}`);
      }
      return new Uint8Array(await response.arrayBuffer());
    }

    private async createLoadedLanguage(opts: LoadLanguageOptions): Promise<LoadedLanguage> {
      const wasm = await this.resolveWasmBytes(opts);
      let nativeGrammarName = grammarName(opts.wasm, opts.definition.id);
      let highlights = opts.highlights;
      let injections = opts.injections;
      let locals = opts.locals;
      let brackets = opts.brackets;
      const nativeQueryLoader = NATIVE_QUERY_LOADERS[opts.definition.id];
      if (nativeQueryLoader) {
        const nativeQueries = (await nativeQueryLoader()).default;
        if (nativeQueries.hash === queryHash(opts)) {
          nativeGrammarName = nativeQueries.grammarName;
          highlights = nativeQueries.highlights;
          injections = nativeQueries.injections;
          locals = nativeQueries.locals;
          brackets = nativeQueries.brackets;
        }
      }
      const specialized = specializeInjections(injections ?? "", (languageId) =>
        this.registeredLanguageIds.has(this.resolveLanguageId(languageId)),
      );
      await this.native.loadLanguageAsync(
        opts.definition.id,
        opts.definition.aliases,
        nativeGrammarName,
        wasm,
        highlights,
        specialized.source,
        locals,
        brackets,
      );
      const loaded: NativeLoadedLanguage = {
        definition: opts.definition,
        queries: {
          highlights,
          injections: injections ?? "",
          locals: locals ?? "",
          omittedLanguages: specialized.omittedLanguages,
        },
      };
      this.loadedLanguages.set(opts.definition.id, loaded);
      this.registerLanguage(opts.definition);
      return loaded as LoadedLanguage;
    }

    async loadLanguage(opts: LoadLanguageOptions): Promise<LoadedLanguage> {
      if (opts.definition.id === PLAINTEXT_LANG_ID) {
        return this.createPlaintext(opts.definition);
      }
      const existing = this.getLoadedLanguage(opts.definition.id);
      if (existing) return existing;
      const inFlight = this.languageLoads.get(opts.definition.id);
      if (inFlight) return inFlight;
      this.registerLanguage(opts.definition);
      return trackLoad(
        this.languageLoads,
        opts.definition.id,
        this.createLoadedLanguage(opts).then(async (loaded) => {
          await this.refreshInjectionsFor(opts.definition, loaded);
          return loaded;
        }),
      );
    }

    private async refreshInjectionsFor(
      definition: LanguageDefinition,
      newlyLoaded: LoadedLanguage,
    ): Promise<void> {
      const activates = (languageId: string) =>
        this.resolveLanguageId(languageId) === definition.id ||
        definition.aliases.includes(languageId);
      const refreshes: Promise<void>[] = [];

      for (const loaded of this.loadedLanguages.values()) {
        if (loaded === (newlyLoaded as NativeLoadedLanguage)) continue;
        const queries = loaded.queries;
        if (!queries || !Array.from(queries.omittedLanguages).some(activates)) continue;

        const specialized = specializeInjections(queries.injections, (languageId) =>
          this.registeredLanguageIds.has(this.resolveLanguageId(languageId)),
        );
        queries.omittedLanguages = specialized.omittedLanguages;
        refreshes.push(
          this.native.configureLanguageAsync(
            loaded.definition.id,
            queries.highlights,
            specialized.source,
            queries.locals,
          ),
        );
      }

      await Promise.all(refreshes);
    }

    async loadPlaintext(): Promise<LoadedLanguage> {
      return this.createPlaintext({ id: PLAINTEXT_LANG_ID, aliases: PLAINTEXT_ALIASES });
    }

    private createPlaintext(definition: LanguageDefinition): LoadedLanguage {
      const existing = this.getLoadedLanguage(PLAINTEXT_LANG_ID);
      if (existing) return existing;

      const loaded: NativeLoadedLanguage = { definition };
      this.loadedLanguages.set(PLAINTEXT_LANG_ID, loaded);
      this.registerLanguage(definition);
      return loaded as LoadedLanguage;
    }

    highlightEvents(
      source: string,
      language: LoadedLanguage,
      options: { rainbowBrackets?: boolean } = {},
    ): HighlightEvent[] {
      if (language.definition.id === PLAINTEXT_LANG_ID) {
        return [{ type: "source", startByte: 0, endByte: encoder.encode(source).byteLength }];
      }
      return decodeEvents(
        this.native.highlightEvents(
          source,
          language.definition.id,
          options.rainbowBrackets ?? false,
        ),
      );
    }

    format(source: string, language: LoadedLanguage, formatter: Formatter): string | undefined {
      const nativeFormatter = this.nativeFormatter(language, formatter);
      return nativeFormatter
        ? this.native.format(source, language.definition.id, nativeFormatter)
        : undefined;
    }

    async formatAsync(
      source: string,
      language: LoadedLanguage,
      formatter: Formatter,
    ): Promise<string | undefined> {
      const nativeFormatter = this.nativeFormatter(language, formatter);
      return nativeFormatter
        ? this.native.formatAsync(source, language.definition.id, nativeFormatter)
        : undefined;
    }

    private nativeFormatter(
      language: LoadedLanguage,
      formatter: Formatter,
    ): NativeFormatter | undefined {
      const kind = builtinFormatterKind(formatter);
      if (
        !kind ||
        kind === "html-multi-themes" ||
        language.definition.id === PLAINTEXT_LANG_ID ||
        !BUILTIN_LANGUAGE_IDS.has(language.definition.id)
      ) {
        return undefined;
      }
      const options = { ...formatter } as Record<string, unknown>;
      delete options.format;
      delete options.language;
      return {
        rainbowBrackets: formatter.rainbowBrackets,
        kind,
        options,
      };
    }
  }

  const defaultSharedCache = createSharedRuntimeCache();
  const defaultRuntime = new NativeHighlighterRuntime({ sharedCache: defaultSharedCache });

  return {
    createRuntime(options = {}) {
      return new NativeHighlighterRuntime(options);
    },
    configureWasmResolver(fn) {
      configuredDefaultResolver = fn;
    },
    initParser() {
      return defaultRuntime.initParser();
    },
    registerLanguage(definition) {
      defaultRuntime.registerLanguage(definition);
    },
    resolveLanguageId(nameOrAlias) {
      return defaultRuntime.resolveLanguageId(nameOrAlias);
    },
    loadLanguage(options) {
      return defaultRuntime.loadLanguage(options);
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
    availableLanguages(): LanguageInfo[] {
      return LANGUAGES.map((language) => ({ ...language }));
    },
    getDefaultRuntime() {
      return defaultRuntime;
    },
  };
}

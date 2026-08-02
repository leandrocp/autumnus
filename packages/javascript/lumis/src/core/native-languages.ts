import { LANGUAGES } from "../generated/languages-meta.js";
import type { NativeBinding, NativeFormatter, NativeRuntimeInstance } from "../native-binding.js";
import type {
  Formatter,
  HighlightEvent,
  LanguageDefinition,
  LanguageInfo,
  LoadedLanguage,
  WasmRef,
} from "../types.js";
import { builtinFormatterKind } from "./builtin-formatter.js";
import { decodeNativeEvents } from "./native-event-codec.js";
import { PLAINTEXT_LANG_ID } from "../types.js";
import type {
  HighlighterRuntimeOptions,
  LanguagePackageResolver,
  LanguagesModule,
  LoadLanguageOptions,
  ResolvedLanguagePackage,
  RuntimeLike,
  WasmResolver,
} from "./languages.js";

const PLAINTEXT_ALIASES = ["text", "txt", "plain"];
const CATALOG_LANGUAGE_IDS = new Set(LANGUAGES.map(({ id }) => id));
const encoder = new TextEncoder();

function isWasmRef(wasm: NonNullable<LoadLanguageOptions["wasm"]>): wasm is WasmRef {
  return typeof wasm === "object" && wasm !== null && "sha256" in wasm && "packageName" in wasm;
}

type RuntimeWasmInput = Exclude<NonNullable<LoadLanguageOptions["wasm"]>, WasmRef>;

/** Parser bytes from whatever the caller handed over: buffer, path, URL or Response. */
async function readWasmInput(wasm: RuntimeWasmInput): Promise<Uint8Array> {
  if (wasm instanceof Uint8Array) return wasm;
  if (wasm instanceof ArrayBuffer) return new Uint8Array(wasm);
  if (wasm instanceof Response) return new Uint8Array(await wasm.arrayBuffer());

  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");

  if (wasm instanceof URL) {
    if (wasm.protocol !== "file:") {
      return new Uint8Array(await (await fetch(wasm)).arrayBuffer());
    }
    return new Uint8Array(await readFile(fileURLToPath(wasm)));
  }

  if (wasm.startsWith("file://")) {
    return new Uint8Array(await readFile(fileURLToPath(new URL(wasm))));
  }
  if (/^https?:\/\//.test(wasm)) {
    return new Uint8Array(await (await fetch(wasm)).arrayBuffer());
  }
  return new Uint8Array(await readFile(wasm));
}

/**
 * Node highlighting over the Wasmtime addon.
 *
 * Rust resolves, verifies, caches and loads parsers by default, which is what
 * lets an injected language load during the walk that finds it. A caller can
 * still take that over — `configureWasmResolver`, `configureLanguagePackageResolver`,
 * an explicit `wasm`, or a complete custom `Language` — and those all mean the
 * same thing here as under `web-tree-sitter`. When one is in play the JavaScript
 * pipeline in `createLanguagesModule` does the resolving, and hands the addon
 * bytes it has already verified.
 *
 * `resolvers` is that pipeline: the same module the `web-tree-sitter` runtime
 * uses, so there is one implementation of resolve, verify and cache rather than
 * a native copy that can drift.
 */
export function createNativeLanguagesModule(
  binding: NativeBinding,
  resolvers: LanguagesModule,
): LanguagesModule {
  // A resolver configured globally applies to runtimes that already exist, so
  // this cannot live on the instance that happened to be current at the time.
  let globalResolverConfigured = false;

  /**
   * Hand the addon the directories the environment names before it builds its
   * store, which it does once and never revisits. `LUMIS_DATA_DIR` can be set
   * at any point in a Node process, and a caller that sets it late would
   * otherwise silently keep writing to the platform cache directory.
   */
  function newNativeRuntime(): NativeRuntimeInstance {
    binding.configureStore(process.env.LUMIS_DATA_DIR, process.env.LUMIS_WASM_PATH);
    return new binding.NativeRuntime();
  }

  class NativeHighlighterRuntime implements RuntimeLike {
    private readonly native: NativeRuntimeInstance = newNativeRuntime();
    private readonly loadedLanguages = new Map<string, LoadedLanguage>();
    private readonly aliasMap = new Map<string, string>();
    private readonly resolver: RuntimeLike;
    private hasJsResolver: boolean;

    constructor(options: HighlighterRuntimeOptions = {}) {
      for (const alias of PLAINTEXT_ALIASES) this.aliasMap.set(alias, PLAINTEXT_LANG_ID);
      this.resolver = resolvers.createRuntime(options);
      this.hasJsResolver = Boolean(options.wasmResolver ?? options.languagePackageResolver);
    }

    configureWasmResolver(fn: WasmResolver): void {
      this.hasJsResolver = true;
      this.resolver.configureWasmResolver(fn);
    }

    configureLanguagePackageResolver(fn: LanguagePackageResolver): void {
      this.hasJsResolver = true;
      this.resolver.configureLanguagePackageResolver(fn);
    }

    resolveLanguagePackage(
      language: LanguageDefinition,
      packageName: string,
    ): Promise<ResolvedLanguagePackage> {
      return this.resolver.resolveLanguagePackage(language, packageName);
    }

    resolveParserWasm(language: string, wasm: WasmRef): Promise<Uint8Array> {
      return this.resolver.resolveParserWasm(language, wasm);
    }

    async initParser(): Promise<void> {
      // The addon resolves and compiles parsers on demand; nothing to set up.
    }

    registerLanguage(definition: LanguageDefinition): void {
      for (const alias of definition.aliases) this.aliasMap.set(alias, definition.id);
    }

    resolveLanguageId(nameOrAlias: string): string {
      return this.aliasMap.get(nameOrAlias) ?? nameOrAlias;
    }

    getLoadedLanguage(nameOrAlias: string): LoadedLanguage | undefined {
      return this.loadedLanguages.get(this.resolveLanguageId(nameOrAlias));
    }

    getLoadedLanguageIds(): string[] {
      return [...this.loadedLanguages.keys()];
    }

    private async createLoadedLanguage(opts: LoadLanguageOptions): Promise<LoadedLanguage> {
      await this.loadThroughAddon(opts);
      const loaded = { definition: opts.definition } as LoadedLanguage;
      this.loadedLanguages.set(opts.definition.id, loaded);
      this.registerLanguage(opts.definition);
      return loaded;
    }

    /**
     * Whether the caller has taken over resolution for this load.
     *
     * Rust cannot see a JavaScript resolver, a `Uint8Array` of parser bytes, or
     * a query string the caller wrote, so anything carrying one has to be
     * resolved here instead. Everything else stays on the Rust path, where a
     * language injected inside the document still loads mid-walk.
     */
    private isCallerResolved(opts: LoadLanguageOptions): boolean {
      return (
        this.hasJsResolver ||
        globalResolverConfigured ||
        opts.wasm !== undefined ||
        opts.highlights !== undefined ||
        !CATALOG_LANGUAGE_IDS.has(opts.definition.id)
      );
    }

    private async loadThroughAddon(opts: LoadLanguageOptions): Promise<void> {
      if (!this.isCallerResolved(opts)) {
        // An installed @lumis-sh/wasm-* package is what the caller asked for, so
        // it wins over anything the addon would resolve for itself.
        if (!(await this.loadInstalled(opts))) {
          this.native.loadLanguage(opts.definition.id);
        }
        return;
      }

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

      const wasm = isWasmRef(resolved.wasm)
        ? await this.resolveParserWasm(resolved.definition.id, resolved.wasm)
        : await readWasmInput(resolved.wasm);

      this.native.loadLanguageDefinition(
        {
          id: resolved.definition.id,
          aliases: resolved.definition.aliases,
          highlights: resolved.highlights,
          injections: resolved.injections,
          locals: resolved.locals,
          brackets: resolved.brackets,
        },
        wasm,
      );
    }

    async loadLanguage(opts: LoadLanguageOptions): Promise<LoadedLanguage> {
      if (opts.definition.id === PLAINTEXT_LANG_ID) {
        return this.loadPlaintext();
      }
      const existing = this.getLoadedLanguage(opts.definition.id);
      if (existing) return existing;
      return this.createLoadedLanguage(opts);
    }

    /**
     * Whether an installed `@lumis-sh/wasm-*` package supplied this language.
     *
     * Node can resolve one and the addon cannot, since a package sits wherever
     * the package manager put it rather than under a directory the store scans.
     */
    private async loadInstalled(opts: LoadLanguageOptions): Promise<boolean> {
      const { packageName } = opts;
      const id = opts.definition.id;
      if (!packageName) return false;
      try {
        const module = (await import(
          /* webpackIgnore: true */
          /* turbopackIgnore: true */
          /* @vite-ignore */
          packageName
        )) as { default?: unknown };
        const base = module.default;
        if (!(base instanceof URL) && typeof base !== "string") return false;

        const root = base instanceof URL ? base : new URL(base);
        const { readFile } = await import("node:fs/promises");
        const { fileURLToPath } = await import("node:url");
        const read = async (name: string) => readFile(fileURLToPath(new URL(name, root)));

        const manifest = await read("language.json");
        const parser = JSON.parse(manifest.toString("utf8")) as { parser: { name: string } };
        this.native.loadLanguagePackage(
          id,
          manifest.toString("utf8"),
          await read(`${parser.parser.name}.wasm`),
        );
        return true;
      } catch {
        return false;
      }
    }

    async loadPlaintext(): Promise<LoadedLanguage> {
      return this.createPlaintext({ id: PLAINTEXT_LANG_ID, aliases: PLAINTEXT_ALIASES });
    }

    private createPlaintext(definition: LanguageDefinition): LoadedLanguage {
      const existing = this.getLoadedLanguage(PLAINTEXT_LANG_ID);
      if (existing) return existing;

      const loaded = { definition } as LoadedLanguage;
      this.loadedLanguages.set(PLAINTEXT_LANG_ID, loaded);
      this.registerLanguage(definition);
      return loaded;
    }

    /**
     * One pass over the document. Languages injected inside it are downloaded
     * and loaded during the walk that finds them, so nothing has to be declared
     * up front and nothing is left unhighlighted for want of a parser.
     */
    highlightEvents(
      source: string,
      language: LoadedLanguage,
      options: { rainbowBrackets?: boolean } = {},
    ): HighlightEvent[] {
      if (language.definition.id === PLAINTEXT_LANG_ID) {
        return [{ type: "source", startByte: 0, endByte: encoder.encode(source).byteLength }];
      }
      return decodeNativeEvents(
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
      // Rust names the `language-*` class from `lumis_core::Language`, which has
      // no variant for a language the caller defined. Highlighting still runs
      // natively; only the string assembly falls back to JavaScript, exactly as
      // it already does for `html-multi-themes`.
      if (
        !kind ||
        kind === "html-multi-themes" ||
        language.definition.id === PLAINTEXT_LANG_ID ||
        !CATALOG_LANGUAGE_IDS.has(language.definition.id)
      ) {
        return undefined;
      }
      const options = { ...formatter } as Record<string, unknown>;
      delete options.format;
      delete options.language;
      delete options.rainbowBrackets;
      return {
        rainbowBrackets: formatter.rainbowBrackets,
        kind,
        options,
      };
    }
  }

  const defaultRuntime = new NativeHighlighterRuntime();

  return {
    createRuntime(options) {
      return new NativeHighlighterRuntime(options);
    },
    // Applies to the default runtime and to every runtime created afterwards,
    // matching the web-tree-sitter module this delegates to.
    configureWasmResolver(fn) {
      globalResolverConfigured = true;
      resolvers.configureWasmResolver(fn);
      defaultRuntime.configureWasmResolver(fn);
    },
    configureLanguagePackageResolver(fn) {
      globalResolverConfigured = true;
      resolvers.configureLanguagePackageResolver(fn);
      defaultRuntime.configureLanguagePackageResolver(fn);
    },
    resolveLanguagePackage(language, packageName) {
      return defaultRuntime.resolveLanguagePackage(language, packageName);
    },
    resolveParserWasm(language, wasm) {
      return defaultRuntime.resolveParserWasm(language, wasm);
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

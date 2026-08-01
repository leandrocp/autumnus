import { LANGUAGES } from "../generated/languages-meta.js";
import type { NativeBinding, NativeFormatter, NativeRuntimeInstance } from "../native-binding.js";
import type {
  Formatter,
  HighlightEvent,
  LanguageDefinition,
  LanguageInfo,
  LoadedLanguage,
} from "../types.js";
import { builtinFormatterKind } from "./builtin-formatter.js";
import { decodeNativeEvents } from "./native-event-codec.js";
import { PLAINTEXT_LANG_ID } from "../types.js";
import type { LanguagesModule, LoadLanguageOptions, RuntimeLike } from "./languages.js";

const PLAINTEXT_ALIASES = ["text", "txt", "plain"];
const CATALOG_LANGUAGE_IDS = new Set(LANGUAGES.map(({ id }) => id));
const encoder = new TextEncoder();

export function createNativeLanguagesModule(binding: NativeBinding): LanguagesModule {
  class NativeHighlighterRuntime implements RuntimeLike {
    private readonly native: NativeRuntimeInstance = new binding.NativeRuntime();
    private readonly loadedLanguages = new Map<string, LoadedLanguage>();
    private readonly aliasMap = new Map<string, string>();

    constructor() {
      for (const alias of PLAINTEXT_ALIASES) this.aliasMap.set(alias, PLAINTEXT_LANG_ID);
    }

    // Resolution happens in Rust, against LUMIS_WASM_PATH and LUMIS_DATA_DIR,
    // so a JavaScript resolver has nothing to configure here.
    configureWasmResolver(): void {}
    configureLanguagePackageResolver(): void {}

    resolveLanguagePackage(): Promise<never> {
      return Promise.reject(
        new Error("the native runtime resolves language packages itself, in Rust"),
      );
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
      if (!CATALOG_LANGUAGE_IDS.has(opts.definition.id)) {
        throw new Error(`Lumis has no language "${opts.definition.id}"`);
      }
      // An installed @lumis-sh/wasm-* package is what the caller asked for, so
      // it wins over anything the addon would resolve for itself.
      if (!(await this.loadInstalled(opts))) {
        this.native.loadLanguage(opts.definition.id);
      }
      const loaded = { definition: opts.definition } as LoadedLanguage;
      this.loadedLanguages.set(opts.definition.id, loaded);
      this.registerLanguage(opts.definition);
      return loaded;
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
      if (!kind || kind === "html-multi-themes" || language.definition.id === PLAINTEXT_LANG_ID) {
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
    createRuntime() {
      return new NativeHighlighterRuntime();
    },
    configureWasmResolver() {},
    configureLanguagePackageResolver() {},
    resolveLanguagePackage() {
      return defaultRuntime.resolveLanguagePackage();
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

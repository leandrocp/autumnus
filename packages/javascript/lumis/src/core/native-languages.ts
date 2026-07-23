import { LANGUAGES } from "../generated/languages-meta.js";
import { HIGHLIGHT_NAMES } from "../highlights.js";
import type { NativeBinding, NativeFormatter, NativeRuntimeInstance } from "../native-binding.js";
import type {
  Formatter,
  HighlightEvent,
  LanguageDefinition,
  LanguageInfo,
  LoadedLanguage,
} from "../types.js";
import { builtinFormatterKind } from "./builtin-formatter.js";
import { PLAINTEXT_LANG_ID } from "../types.js";
import type { LanguagesModule, LoadLanguageOptions, RuntimeLike } from "./languages.js";

const PLAINTEXT_ALIASES = ["text", "txt", "plain"];
const BUILTIN_LANGUAGE_IDS = new Set(LANGUAGES.map(({ id }) => id));
const decoder = new TextDecoder();
const encoder = new TextEncoder();

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

export function createNativeLanguagesModule(binding: NativeBinding): LanguagesModule {
  class NativeHighlighterRuntime implements RuntimeLike {
    private readonly native: NativeRuntimeInstance = new binding.NativeRuntime();
    private readonly loadedLanguages = new Map<string, LoadedLanguage>();
    private readonly aliasMap = new Map<string, string>();

    constructor() {
      for (const alias of PLAINTEXT_ALIASES) this.aliasMap.set(alias, PLAINTEXT_LANG_ID);
    }

    configureWasmResolver(): void {}

    async initParser(): Promise<void> {
      // Native parsers and queries are compiled into the addon.
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

    private createLoadedLanguage(opts: LoadLanguageOptions): LoadedLanguage {
      if (!BUILTIN_LANGUAGE_IDS.has(opts.definition.id)) {
        throw new Error(`The native runtime does not include language "${opts.definition.id}"`);
      }
      this.native.loadLanguage(opts.definition.id);
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

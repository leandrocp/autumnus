import type {
  HighlightCallback,
  HighlightContext,
  HighlightEvent,
  Language,
  LanguageBundle,
  LanguageInput,
  LanguageRef,
  LazyLanguage,
  Formatter,
  Theme,
} from "../types.js";
import { PLAINTEXT_LANG_ID } from "../types.js";
import type { RuntimeLike, WasmResolver } from "./languages.js";
import { buildHighlightEvents } from "../events.js";
import { getScopedThemeStyle } from "../formatter/html.js";
import { LANGUAGE_LOADERS } from "../generated/language-loaders.js";
import { guessLanguage } from "../guess-language.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function decodeSlice(sourceBytes: Uint8Array, startByte: number, endByte: number): string {
  return decoder.decode(sourceBytes.subarray(startByte, endByte));
}

/** A reusable highlighter with preloaded or lazily registered languages. */
export interface Highlighter {
  /** Highlight source code synchronously. The language must already be loaded. */
  highlight(source: string, formatter: Formatter): string;
  /** Low-level token iterator. Calls `onToken` for each highlighted span. Languages must already be loaded. */
  highlightIter(
    source: string,
    language: LanguageRef | undefined,
    theme: Theme | undefined,
    onToken: HighlightCallback,
  ): void;
  /** Load a language by object, lazy handle, or string ID from a registered bundle. No-op if already loaded. */
  loadLanguage(language: Language | LazyLanguage | string): Promise<void>;
  /** IDs of languages that have been loaded and are ready to highlight. */
  readonly languages: string[];
  /** IDs of all languages, including those registered lazily from bundles. */
  readonly registeredLanguages: string[];
}

export interface HighlighterModuleFactory {
  createRuntime(options?: { wasmResolver?: WasmResolver }): RuntimeLike;
  getDefaultRuntime(): RuntimeLike;
}

async function loadLang(runtime: RuntimeLike, language: Language): Promise<void> {
  await runtime.loadLanguage({
    definition: { id: language.id, aliases: language.aliases },
    wasm: language.wasm,
    highlights: language.highlights,
    injections: language.injections,
    locals: language.locals,
  });
}

/** Resolve a LanguageRef to a language ID string. */
function resolveRefId(ref: LanguageRef | undefined): string {
  if (!ref) return PLAINTEXT_LANG_ID;
  if (typeof ref === "string") return ref;
  return ref.id;
}

function isPlaintextRef(ref?: LanguageRef): boolean {
  return resolveRefId(ref) === PLAINTEXT_LANG_ID;
}

function detectLanguageRef(source: string, ref?: LanguageRef): LanguageRef | string {
  if (ref && typeof ref !== "string") {
    return ref;
  }

  return guessLanguage(ref, source);
}

async function loadBuiltinLanguageById(id: string): Promise<Language | undefined> {
  const loader = LANGUAGE_LOADERS[id];
  if (!loader) {
    return undefined;
  }

  const mod = await loader();
  return mod.default;
}

async function ensureLanguageLoaded(
  runtime: RuntimeLike,
  ref: LanguageRef | string,
  lazyRegistry?: Map<string, LazyLanguage>,
): Promise<void> {
  if (isPlaintextRef(ref)) {
    await runtime.loadPlaintext();
    return;
  }

  if (typeof ref !== "string") {
    if (!runtime.getLoadedLanguage(ref.id)) {
      if (isLanguage(ref)) {
        await loadLang(runtime, ref);
      } else {
        const lang = await ref();
        await loadLang(runtime, lang);
      }
    }
    return;
  }

  const langId = ref;
  if (runtime.getLoadedLanguage(langId)) {
    return;
  }

  const lazy = lazyRegistry?.get(langId);
  if (lazy) {
    const lang = await lazy();
    await loadLang(runtime, lang);
    return;
  }

  const builtin = await loadBuiltinLanguageById(langId);
  if (builtin) {
    await loadLang(runtime, builtin);
  }
}

function resolveLoadedLanguage(runtime: RuntimeLike, ref?: LanguageRef) {
  const langId = resolveRefId(ref);
  const loaded = runtime.getLoadedLanguage(langId);
  if (!loaded) {
    if (langId === PLAINTEXT_LANG_ID) {
      throw new Error(
        `Language "${langId}" is not loaded. ` +
          `Load the plaintext bundle before using omitted/plaintext sync highlighting.`,
      );
    }
    throw new Error(
      `Language "${langId}" is not loaded. ` +
        `Pass it to createHighlighter({ langs: [...] }) or call hl.loadLanguage(bundle).`,
    );
  }

  return loaded;
}

function runHighlightIter(
  runtime: RuntimeLike,
  source: string,
  language: LanguageRef | undefined,
  theme: Theme | undefined,
  onToken: HighlightCallback,
): void {
  const loaded = resolveLoadedLanguage(runtime, language);
  const events = buildHighlightEvents(source, loaded, runtime);
  const bytes = encoder.encode(source);
  const scopeStack: Array<{ scope: string; language: string }> = [];

  for (const event of events) {
    if (event.type === "start") {
      scopeStack.push({ scope: event.scope, language: event.language });
      continue;
    }

    if (event.type === "end") {
      scopeStack.pop();
      continue;
    }

    const active = scopeStack[scopeStack.length - 1];
    const scope = active?.scope ?? "";
    const tokenLanguage = active?.language ?? loaded.definition.id;

    onToken(
      decodeSlice(bytes, event.startByte, event.endByte),
      tokenLanguage,
      { start: event.startByte, end: event.endByte },
      scope,
      scope.length > 0 ? getScopedThemeStyle(theme, scope, tokenLanguage) : undefined,
    );
  }
}

function runHighlightEvents(
  runtime: RuntimeLike,
  source: string,
  language: LanguageRef | undefined,
): HighlightEvent[] {
  const loaded = resolveLoadedLanguage(runtime, language);
  return buildHighlightEvents(source, loaded, runtime) as HighlightEvent[];
}

function createHighlightContext(runtime: RuntimeLike): HighlightContext {
  return {
    highlightIter: (source, language, theme, onToken) =>
      runHighlightIter(runtime, source, detectLanguageRef(source, language), theme, onToken),
    highlightEvents: (source, language) =>
      runHighlightEvents(runtime, source, detectLanguageRef(source, language)),
  };
}

function runFormatter(
  runtime: RuntimeLike,
  source: string,
  fmt: Formatter,
  detectedRef: LanguageRef | string,
): string {
  const ctx = createHighlightContext(runtime);
  const originalLanguage = fmt.language;
  fmt.language = detectedRef;

  try {
    return fmt.format(source, ctx);
  } finally {
    fmt.language = originalLanguage;
  }
}

/** Check if a value is a Language object (has highlights and wasm). */
function isLanguage(value: unknown): value is Language {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "highlights" in value &&
    "wasm" in value
  );
}

/** Check if a value is a LanguageBundle (Record<string, LazyLanguage>). */
function isLanguageBundle(value: unknown): value is LanguageBundle {
  if (typeof value !== "object" || value === null) return false;
  if ("id" in value || "highlights" in value || "default" in value) return false;
  const keys = Object.keys(value);
  const firstKey = keys[0];
  return (
    firstKey !== undefined && typeof (value as Record<string, unknown>)[firstKey] === "function"
  );
}

/** Resolve a single LanguageInput into Language(s), registering lazy ones. */
async function resolveLanguageInput(
  input: LanguageInput,
  runtime: RuntimeLike,
  lazyRegistry: Map<string, LazyLanguage>,
): Promise<void> {
  // Language object — load eagerly
  if (isLanguage(input)) {
    await loadLang(runtime, input);
    return;
  }

  // LanguageBundle (Record<string, LazyLanguage>) — register all lazily
  if (isLanguageBundle(input)) {
    for (const [id, lazy] of Object.entries(input)) {
      if (!lazyRegistry.has(id)) {
        lazyRegistry.set(id, lazy);
        for (const alias of lazy.aliases) {
          lazyRegistry.set(alias, lazy);
        }
      }
    }
    return;
  }

  // () => Promise<{ default: Language }> — lazy function
  if (typeof input === "function") {
    const mod = await input();
    await loadLang(runtime, mod.default);
    return;
  }

  // Promise<{ default: Language }> — eager dynamic import
  const mod = await input;
  await loadLang(runtime, mod.default);
}

export function createHighlighterModule(factory: HighlighterModuleFactory) {
  return {
    async createHighlighter(
      init: { langs?: LanguageInput[]; wasmResolver?: WasmResolver } = {},
    ): Promise<Highlighter> {
      const runtime = factory.createRuntime({ wasmResolver: init.wasmResolver });
      await runtime.initParser();

      const lazyRegistry = new Map<string, LazyLanguage>();
      const inputs = init.langs ?? [];

      const eagerLoads: Array<Promise<void>> = [];
      for (const input of inputs) {
        if (isLanguageBundle(input)) {
          for (const [id, lazy] of Object.entries(input)) {
            if (!lazyRegistry.has(id)) {
              lazyRegistry.set(id, lazy);
              for (const alias of lazy.aliases) {
                lazyRegistry.set(alias, lazy);
              }
            }
          }
        } else {
          eagerLoads.push(resolveLanguageInput(input, runtime, lazyRegistry));
        }
      }
      await Promise.all([runtime.loadPlaintext(), ...eagerLoads]);

      return {
        highlight: (source, fmt) => {
          const detectedRef = detectLanguageRef(source, fmt.language);
          return runFormatter(runtime, source, fmt, detectedRef);
        },
        highlightIter: (source, language, theme, onToken) =>
          runHighlightIter(runtime, source, detectLanguageRef(source, language), theme, onToken),
        async loadLanguage(input) {
          const id = typeof input === "string" ? input : input.id;
          if (runtime.getLoadedLanguage(id)) return;

          if (isLanguage(input)) {
            await loadLang(runtime, input);
          } else if (typeof input === "string") {
            const lazy = lazyRegistry.get(input);
            if (lazy) {
              const lang = await lazy();
              await loadLang(runtime, lang);
              return;
            }

            const builtin = await loadBuiltinLanguageById(input);
            if (!builtin) {
              throw new Error(`Language "${input}" is not registered in any bundle.`);
            }
            await loadLang(runtime, builtin);
          } else if (typeof input === "function") {
            const lang = await input();
            await loadLang(runtime, lang);
          }
        },
        get languages() {
          return runtime.getLoadedLanguageIds();
        },
        get registeredLanguages() {
          return [...new Set([...runtime.getLoadedLanguageIds(), ...lazyRegistry.keys()])];
        },
      };
    },

    async highlight(source: string, fmt: Formatter): Promise<string> {
      const runtime = factory.getDefaultRuntime();
      await runtime.initParser();

      const detectedRef = detectLanguageRef(source, fmt.language);
      await ensureLanguageLoaded(runtime, detectedRef);

      return runFormatter(runtime, source, fmt, detectedRef);
    },

    async highlightIter(
      source: string,
      language: LanguageRef | undefined,
      theme: Theme | undefined,
      onToken: HighlightCallback,
    ): Promise<void> {
      const runtime = factory.getDefaultRuntime();
      await runtime.initParser();

      const detectedRef = detectLanguageRef(source, language);
      await ensureLanguageLoaded(runtime, detectedRef);

      runHighlightIter(runtime, source, detectedRef, theme, onToken);
    },
  };
}

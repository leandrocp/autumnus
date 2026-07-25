import type {
  HighlightCallback,
  HighlightEvent,
  HighlightOptions,
  Language,
  LanguageBundle,
  LanguageInput,
  LanguageRef,
  LazyLanguage,
  Formatter,
  SyntaxHighlightEvent,
  Theme,
} from "../types.js";
import { PLAINTEXT_LANG_ID } from "../types.js";
import type { RuntimeLike, WasmResolver } from "./languages.js";
import { composeAnnotations } from "../annotations.js";
import { buildSourceIndex } from "../events.js";
import { getScopedThemeStyle } from "../formatter/html.js";
import { LANGUAGE_LOADERS } from "../generated/language-loaders.js";
import { guessLanguage } from "../guess-language.js";
import { builtinFormatterKind } from "./builtin-formatter.js";

const decoder = new TextDecoder();

function decodeSlice(sourceBytes: Uint8Array, startByte: number, endByte: number): string {
  return decoder.decode(sourceBytes.subarray(startByte, endByte));
}

/** A reusable highlighter with preloaded or lazily registered languages. */
export interface Highlighter {
  /** Highlight source code synchronously. The language must already be loaded. */
  highlight<T>(source: string, formatter: Formatter<T>, options?: HighlightOptions<T>): string;
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

/** Options for {@link createHighlighter}. */
export interface CreateHighlighterOptions {
  /** Languages to preload or register lazily. */
  languages?: LanguageInput[];
  /** Optional resolver for external WASM assets. */
  wasmResolver?: WasmResolver;
}

async function loadLanguageDefinition(runtime: RuntimeLike, language: Language): Promise<void> {
  await runtime.loadLanguage({
    definition: { id: language.id, aliases: language.aliases },
    wasm: language.wasm,
    highlights: language.highlights,
    injections: language.injections,
    locals: language.locals,
    brackets: language.brackets,
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
        await loadLanguageDefinition(runtime, ref);
      } else {
        const language = await ref();
        await loadLanguageDefinition(runtime, language);
      }
    }
    return;
  }

  const languageId = ref;
  if (runtime.getLoadedLanguage(languageId)) {
    return;
  }

  const lazy = lazyRegistry?.get(languageId);
  if (lazy) {
    const language = await lazy();
    await loadLanguageDefinition(runtime, language);
    return;
  }

  const builtin = await loadBuiltinLanguageById(languageId);
  if (builtin) {
    await loadLanguageDefinition(runtime, builtin);
  }
}

function resolveLoadedLanguage(runtime: RuntimeLike, ref?: LanguageRef) {
  const languageId = resolveRefId(ref);
  const loaded = runtime.getLoadedLanguage(languageId);
  if (!loaded) {
    if (languageId === PLAINTEXT_LANG_ID) {
      throw new Error(
        `Language "${languageId}" is not loaded. ` +
          `Load the plaintext bundle before using omitted/plaintext sync highlighting.`,
      );
    }
    throw new Error(
      `Language "${languageId}" is not loaded. ` +
        `Pass it to createHighlighter({ languages: [...] }) or call hl.loadLanguage(bundle).`,
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
  const events = runtime.highlightEvents(source, loaded);
  const bytes = buildSourceIndex(source).sourceBytes;
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

function runHighlightEvents<T>(
  runtime: RuntimeLike,
  source: string,
  language: LanguageRef | undefined,
  options: HighlightOptions<T> = {},
): HighlightEvent<T>[] {
  const loaded = resolveLoadedLanguage(runtime, language);
  const events = runtime.highlightEvents(source, loaded, {
    rainbowBrackets: options.rainbowBrackets,
  }) as SyntaxHighlightEvent[];
  const annotations = options.annotations ?? [];
  if (annotations.length === 0) return events;

  return composeAnnotations(events, annotations, buildSourceIndex(source));
}

// Ambient runtime for sync free functions called inside `Formatter.render()`.
// JS is single-threaded, so swapping a module-level reference around the call
// gives the same guarantee Rust gets from `thread_local!` in `highlight.rs`.
let currentRuntime: RuntimeLike | undefined;

function requireCurrentRuntime(fnName: string): RuntimeLike {
  if (!currentRuntime) {
    throw new Error(
      `${fnName}() must be called inside Formatter.render(). ` +
        `For top-level token iteration, create a highlighter with ` +
        `createHighlighter({ languages: [...] }) and call hl.highlightIter().`,
    );
  }
  return currentRuntime;
}

/**
 * Iterate over highlighted tokens for `source`, calling `onToken` for each flat span.
 *
 * Sync free function usable inside {@link Formatter.render}. For top-level
 * (non-formatter) iteration, use `hl.highlightIter` on a {@link Highlighter}
 * instance instead.
 */
export function highlightIter(
  source: string,
  language: LanguageRef | undefined,
  theme: Theme | undefined,
  onToken: HighlightCallback,
): void {
  const runtime = requireCurrentRuntime("highlightIter");
  runHighlightIter(runtime, source, detectLanguageRef(source, language), theme, onToken);
}

/**
 * Return the nested highlight event stream for `source`.
 *
 * Sync free function usable inside {@link Formatter.render}. Use this when your
 * formatter needs paired open/close markers around nested scopes (e.g. BBCode
 * tags) that the flat {@link highlightIter} callback API would lose.
 */
export function highlightEvents(
  source: string,
  language: LanguageRef | undefined,
  options?: { rainbowBrackets?: boolean },
): SyntaxHighlightEvent[];
export function highlightEvents<T>(
  source: string,
  language: LanguageRef | undefined,
  options: HighlightOptions<T>,
): HighlightEvent<T>[];
export function highlightEvents<T>(
  source: string,
  language: LanguageRef | undefined,
  options: HighlightOptions<T> = {},
): HighlightEvent<T>[] {
  const runtime = requireCurrentRuntime("highlightEvents");
  return runHighlightEvents(runtime, source, detectLanguageRef(source, language), options);
}

function runFormatter<T>(
  runtime: RuntimeLike,
  source: string,
  fmt: Formatter<T>,
  detectedRef: LanguageRef | string,
  options: HighlightOptions<T>,
): string {
  const loaded = resolveLoadedLanguage(runtime, detectedRef);
  if (builtinFormatterKind(fmt)) {
    const nativeOutput = runtime.format?.(source, loaded, fmt, options);
    if (nativeOutput !== undefined) return nativeOutput;
  }

  const events = runHighlightEvents(runtime, source, detectedRef, options);
  const prevRuntime = currentRuntime;
  const prevLanguage = fmt.language;
  currentRuntime = runtime;
  fmt.language = detectedRef;
  try {
    return fmt.render(source, events);
  } finally {
    fmt.language = prevLanguage;
    currentRuntime = prevRuntime;
  }
}

async function runFormatterAsync<T>(
  runtime: RuntimeLike,
  source: string,
  fmt: Formatter<T>,
  detectedRef: LanguageRef | string,
  options: HighlightOptions<T>,
): Promise<string> {
  const loaded = resolveLoadedLanguage(runtime, detectedRef);
  if (builtinFormatterKind(fmt)) {
    const nativeOutput = await runtime.formatAsync?.(source, loaded, fmt, options);
    if (nativeOutput !== undefined) return nativeOutput;
  }
  return runFormatter(runtime, source, fmt, detectedRef, options);
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
async function resolveInitialLanguage(
  input: LanguageInput,
  lazyRegistry: Map<string, LazyLanguage>,
): Promise<Language | undefined> {
  // Language object — load eagerly
  if (isLanguage(input)) {
    return input;
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
    return undefined;
  }

  // () => Promise<{ default: Language }> — lazy function
  if (typeof input === "function") {
    const mod = await input();
    return mod.default;
  }

  // Promise<{ default: Language }> — eager dynamic import
  const mod = await input;
  return mod.default;
}

function registerLazyBundle(bundle: LanguageBundle, lazyRegistry: Map<string, LazyLanguage>): void {
  for (const [id, lazy] of Object.entries(bundle)) {
    if (lazyRegistry.has(id)) {
      continue;
    }

    lazyRegistry.set(id, lazy);
    for (const alias of lazy.aliases) {
      lazyRegistry.set(alias, lazy);
    }
  }
}

async function loadHighlighterLanguage(
  input: Language | LazyLanguage | string,
  runtime: RuntimeLike,
  lazyRegistry: Map<string, LazyLanguage>,
): Promise<void> {
  const id = typeof input === "string" ? input : input.id;
  if (runtime.getLoadedLanguage(id)) {
    return;
  }

  if (isLanguage(input)) {
    await loadLanguageDefinition(runtime, input);
    return;
  }

  if (typeof input === "string") {
    const lazy = lazyRegistry.get(input);
    if (lazy) {
      const language = await lazy();
      await loadLanguageDefinition(runtime, language);
      return;
    }

    const builtin = await loadBuiltinLanguageById(input);
    if (!builtin) {
      throw new Error(`Language "${input}" is not registered in any bundle.`);
    }

    await loadLanguageDefinition(runtime, builtin);
    return;
  }

  const language = await input();
  await loadLanguageDefinition(runtime, language);
}

function getRegisteredLanguageIds(
  runtime: RuntimeLike,
  lazyRegistry: Map<string, LazyLanguage>,
): string[] {
  return [...new Set([...runtime.getLoadedLanguageIds(), ...lazyRegistry.keys()])];
}

async function loadInitialLanguages(
  inputs: LanguageInput[],
  runtime: RuntimeLike,
  lazyRegistry: Map<string, LazyLanguage>,
): Promise<void> {
  const eagerDefinitions: Array<Promise<Language | undefined>> = [];

  for (const input of inputs) {
    if (isLanguageBundle(input)) {
      registerLazyBundle(input, lazyRegistry);
      continue;
    }

    eagerDefinitions.push(resolveInitialLanguage(input, lazyRegistry));
  }

  const languages = (await Promise.all(eagerDefinitions)).filter(
    (language): language is Language => language !== undefined,
  );
  for (const language of languages) {
    runtime.registerLanguage({ id: language.id, aliases: language.aliases });
  }

  await Promise.all([
    runtime.loadPlaintext(),
    ...languages.map((language) => loadLanguageDefinition(runtime, language)),
  ]);
}

async function prepareRuntimeHighlight(
  runtime: RuntimeLike,
  source: string,
  language: LanguageRef | undefined,
): Promise<LanguageRef | string> {
  await runtime.initParser();

  const detectedRef = detectLanguageRef(source, language);
  await ensureLanguageLoaded(runtime, detectedRef);
  return detectedRef;
}

export function createHighlighterModule(factory: HighlighterModuleFactory) {
  return {
    async createHighlighter(init: CreateHighlighterOptions = {}): Promise<Highlighter> {
      const runtime = factory.createRuntime({ wasmResolver: init.wasmResolver });
      await runtime.initParser();

      const lazyRegistry = new Map<string, LazyLanguage>();
      await loadInitialLanguages(init.languages ?? [], runtime, lazyRegistry);

      return {
        highlight: (source, fmt, options = {}) => {
          const detectedRef = detectLanguageRef(source, fmt.language);
          return runFormatter(runtime, source, fmt, detectedRef, options);
        },
        highlightIter: (source, language, theme, onToken) =>
          runHighlightIter(runtime, source, detectLanguageRef(source, language), theme, onToken),
        async loadLanguage(input) {
          await loadHighlighterLanguage(input, runtime, lazyRegistry);
        },
        get languages() {
          return runtime.getLoadedLanguageIds();
        },
        get registeredLanguages() {
          return getRegisteredLanguageIds(runtime, lazyRegistry);
        },
      };
    },

    async highlight<T>(
      source: string,
      fmt: Formatter<T>,
      options: HighlightOptions<T> = {},
    ): Promise<string> {
      const runtime = factory.getDefaultRuntime();
      const detectedRef = await prepareRuntimeHighlight(runtime, source, fmt.language);

      return runFormatterAsync(runtime, source, fmt, detectedRef, options);
    },
  };
}

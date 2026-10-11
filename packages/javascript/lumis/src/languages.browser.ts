/** Language discovery, parser loading, and parser sources. */
import { createLoadLanguages } from "./core/load-languages.js";
import { loadLanguage as runtimeLoadLanguage } from "./runtime/browser.js";

export {
  availableLanguages as available,
  loadedLanguages as loaded,
  configureWasmResolver,
  configureLanguagePackageResolver as configurePackageResolver,
} from "./runtime/browser.js";
export * from "./language-api.js";

/**
 * Load languages into the runtime `highlight()` uses, by name.
 *
 * Loaded parsers are cached in the default runtime for subsequent highlights.
 *
 * Accepts catalog names, aliases, and `bundle-<name>` tokens.
 *
 * Highlighting loads on demand regardless, so this is an optimization. At
 * startup, prefer not blocking on it:
 *
 * ```ts
 * import { load } from '@lumis-sh/lumis/languages'
 *
 * await startServer()
 *
 * load(['javascript', 'html', 'css']).catch((error) => {
 *   logger.warn({ error }, 'Lumis warm-up failed; languages load on demand')
 * })
 * ```
 *
 * Every name is attempted. If any fail, it rejects with an `AggregateError`
 * naming each one, after the rest have loaded.
 */
export const load = createLoadLanguages(runtimeLoadLanguage);

import { LANGUAGES } from "./generated/languages-meta.js";
import { parseLanguageHint } from "./guess-language.js";
import type { LanguageInfo, ThemeInfo } from "./types.js";

export function normalizeLanguageName(value: string): string {
  return value.replaceAll(/[A-Z]/gu, (character) => character.toLowerCase());
}

/**
 * Look up language metadata by name, alias, extension, or path.
 * Empty input resolves to plaintext; unknown input returns undefined.
 *
 * ```ts
 * import { get } from '@lumis-sh/lumis/languages'
 * get('js')    // { id: 'javascript', name: 'JavaScript', ... }
 * get('main.rs') // { id: 'rust', name: 'Rust', ... }
 * get('nope')  // undefined
 * ```
 */
export function getLanguage(name: string): LanguageInfo | undefined {
  const resolved = parseLanguageHint(name);
  const language = LANGUAGES.find(({ id }) => id === resolved);
  return language && cloneLanguageInfo(language);
}

export function cloneLanguageInfo(language: LanguageInfo): LanguageInfo {
  return {
    ...language,
    aliases: [...language.aliases],
    extensions: [...language.extensions],
    globs: [...language.globs],
    emacsModes: [...language.emacsModes],
    shebangs: [...language.shebangs],
  };
}

export function cloneThemeInfo(theme: ThemeInfo): ThemeInfo {
  return { ...theme };
}

import { LANGUAGES } from "./generated/languages-meta.js";
import type { LanguageInfo, ThemeInfo } from "./types.js";

export function normalizeLanguageName(value: string): string {
  return value.replaceAll(/[A-Z]/gu, (character) => character.toLowerCase());
}

/**
 * Look one language up by id or alias.
 *
 * ```ts
 * import { get } from '@lumis-sh/lumis/languages'
 * get('js')    // { id: 'javascript', name: 'JavaScript', ... }
 * get('nope')  // undefined
 * ```
 */
export function getLanguage(nameOrAlias: string): LanguageInfo | undefined {
  const normalized = normalizeLanguageName(nameOrAlias.trim());
  const language = LANGUAGES.find(
    ({ id, aliases }) =>
      normalizeLanguageName(id) === normalized ||
      aliases.some((alias) => normalizeLanguageName(alias) === normalized),
  );
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

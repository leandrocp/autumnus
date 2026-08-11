import type { LanguageInfo, ThemeInfo } from "./types.js";

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

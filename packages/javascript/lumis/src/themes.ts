import { THEMES } from "./generated/themes-meta.js";
import type { ThemeInfo } from "./types.js";

/**
 * List all built-in themes with their name and appearance.
 *
 * ```ts
 * import { availableThemes } from '@lumis-sh/lumis'
 * const themes = availableThemes()
 * // [{ name: 'dracula', appearance: 'dark' }, ...]
 * ```
 */
export function availableThemes(): ThemeInfo[] {
  return THEMES;
}

/**
 * Replace non-alphanumeric characters in a theme name with hyphens.
 *
 * ```ts
 * sanitizeThemeName('github light')  // "github-light"
 * ```
 */
export function sanitizeThemeName(name: string): string {
  let result = "";
  for (let i = 0; i < name.length; i += 1) {
    const code = name.charCodeAt(i);
    if (
      (code >= 48 && code <= 57) ||
      (code >= 65 && code <= 90) ||
      (code >= 97 && code <= 122) ||
      code === 45 ||
      code === 95
    ) {
      result += name[i];
    } else {
      result += "-";
    }
  }
  return result;
}

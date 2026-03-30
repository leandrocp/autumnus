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
  return name.replace(/[^0-9A-Za-z_-]/g, "-");
}

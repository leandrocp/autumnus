import { THEME_DATA } from "../generated/theme-data.js";
import type { Theme } from "../types.js";

export { availableThemes as available } from "../themes.js";
export { closest } from "./closest.js";
export type { TerminalColors } from "./closest.js";
export type { Theme, ThemeInfo, HighlightStyle } from "../types.js";

/** Look up a built-in theme by exact name, or return undefined. */
export function get(name: string): Theme | undefined {
  const theme = THEME_DATA.find((candidate) => candidate.name === name);
  return theme && structuredClone(theme);
}

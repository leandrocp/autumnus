import type { HighlightStyle, Theme } from "../types.js";
import { getScopedThemeStyle } from "../formatter/html.js";

function inheritStyle(style: HighlightStyle, parent: HighlightStyle): HighlightStyle {
  return {
    fg: style.fg ?? parent.fg,
    bg: style.bg ?? parent.bg,
    bold: style.bold ? true : parent.bold,
    italic: style.italic ? true : parent.italic,
    underline: style.underline === false ? parent.underline : (style.underline ?? parent.underline),
    strikethrough: style.strikethrough ? true : parent.strikethrough,
  };
}

export function resolveStackStyle(
  theme: Theme | undefined,
  scopes: readonly { scope: string; language: string }[],
): HighlightStyle | undefined {
  let resolved: HighlightStyle | undefined;
  for (const { scope, language } of scopes) {
    const style = getScopedThemeStyle(theme, scope, language);
    if (!style) continue;
    resolved = resolved ? inheritStyle(style, resolved) : style;
  }
  return resolved;
}

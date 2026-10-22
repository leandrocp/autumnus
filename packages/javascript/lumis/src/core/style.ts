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

/**
 * The style of the innermost layer, inheriting what each enclosing one leaves
 * unset. A layer carrying its own `style`, such as a diff's changed word, uses
 * it instead of looking its scope up.
 */
export function resolveStackStyle(
  theme: Theme | undefined,
  scopes: readonly { scope: string; language: string; style?: HighlightStyle }[],
): HighlightStyle | undefined {
  let resolved: HighlightStyle | undefined;
  for (const layer of scopes) {
    const style = layer.style ?? getScopedThemeStyle(theme, layer.scope, layer.language);
    if (!style) continue;
    resolved = resolved ? inheritStyle(style, resolved) : style;
  }
  return resolved;
}

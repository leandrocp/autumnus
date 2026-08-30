import type { HighlightEvent, HighlightStyle, TerminalFormatter, Theme } from "../types.js";
import { encodeSource, decodeSourceSlice, getScopedThemeStyle, getThemeStyle } from "./html.js";
import { paint } from "./ansi-core.js";

function fallbackBackground(formatter: TerminalFormatter): string | undefined {
  const background = formatter.background;
  if (background === undefined) return undefined;
  if (background === "theme") return getThemeStyle(formatter.theme, "normal")?.bg;
  return background;
}

function paintWithBackground(
  text: string,
  style: HighlightStyle | undefined,
  fallbackBg: string | undefined,
): string {
  if (style && fallbackBg && style.bg === undefined) {
    return paint(text, { ...style, bg: fallbackBg });
  }
  if (style) return paint(text, style);
  if (fallbackBg) return paint(text, { bg: fallbackBg });
  return text;
}

function displayWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    width += char === "\t" ? 4 : 1;
  }
  return width;
}

function linePadding(
  fallbackBg: string | undefined,
  width: number | undefined,
  lineWidth: number,
): string {
  if (fallbackBg === undefined || width === undefined || lineWidth >= width) {
    return "";
  }

  return paintWithBackground(" ".repeat(width - lineWidth), undefined, fallbackBg);
}

/** Split keeping the newline on the segment it ended, like Rust's `split_inclusive`. */
function splitInclusive(text: string): string[] {
  const segments = text.split("\n");
  const last = segments.pop() ?? "";
  const result = segments.map((segment) => `${segment}\n`);
  if (last !== "") result.push(last);
  return result;
}

function activeStyle(
  scopeStack: Array<{ scope: string; language: string }>,
  theme: Theme | undefined,
): HighlightStyle | undefined {
  const active = scopeStack.at(-1);
  if (!active || active.scope.length === 0) return undefined;
  return getScopedThemeStyle(theme, active.scope, active.language);
}

export function formatTerminal(
  source: string,
  events: HighlightEvent[],
  formatter: TerminalFormatter,
): string {
  let output = "";
  const sourceBytes = encodeSource(source);
  const scopeStack: Array<{ scope: string; language: string }> = [];
  const fallbackBg = fallbackBackground(formatter);
  let lineWidth = 0;

  for (const event of events) {
    if (event.type === "start") {
      scopeStack.push({ scope: event.scope, language: event.language });
      continue;
    }

    if (event.type === "end") {
      scopeStack.pop();
      continue;
    }

    const text = decodeSourceSlice(sourceBytes, event.startByte, event.endByte);
    const style = activeStyle(scopeStack, formatter.theme);

    if (fallbackBg === undefined) {
      output += paintWithBackground(text, style, undefined);
      continue;
    }

    for (const segment of splitInclusive(text)) {
      const hasNewline = segment.endsWith("\n");
      const content = hasNewline ? segment.slice(0, -1) : segment;

      if (content !== "") {
        output += paintWithBackground(content, style, fallbackBg);
        lineWidth += displayWidth(content);
      }

      if (hasNewline) {
        output += linePadding(fallbackBg, formatter.width, lineWidth);
        output += "\n";
        lineWidth = 0;
      }
    }
  }

  if (!source.endsWith("\n")) {
    output += linePadding(fallbackBg, formatter.width, lineWidth);
  }

  return output;
}

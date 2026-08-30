import type { HighlightStyle } from "../types.js";

/** ANSI reset escape sequence. */
export const ANSI_RESET = "\u001B[0m";

/**
 * Parse a hex color string to RGB components.
 *
 * ```ts
 * hexToRgb('#ff79c6')  // [255, 121, 198]
 * hexToRgb('abc')      // undefined
 * ```
 */
export function hexToRgb(hex: string): [number, number, number] | undefined {
  const normalized = hex.startsWith("#") ? hex.slice(1) : hex;
  if (normalized.length !== 6) return undefined;

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  if ([r, g, b].some((value) => Number.isNaN(value))) {
    return undefined;
  }

  return [r, g, b];
}

/**
 * Build an ANSI 24-bit color escape sequence.
 *
 * ```ts
 * rgbToAnsi(255, 121, 198, false)  // "\x1b[38;2;255;121;198m" (foreground)
 * rgbToAnsi(40, 42, 54, true)      // "\x1b[48;2;40;42;54m" (background)
 * ```
 */
export function rgbToAnsi(r: number, g: number, b: number, isBackground: boolean): string {
  return isBackground ? `\u001B[48;2;${r};${g};${b}m` : `\u001B[38;2;${r};${g};${b}m`;
}

/**
 * Convert a `HighlightStyle` to ANSI escape codes.
 *
 * ```ts
 * styleToAnsi({ fg: '#ff79c6', bold: true })
 * // "\x1b[38;2;255;121;198m\x1b[1m"
 * ```
 */
function colorCode(hex: string | undefined, background: boolean): string | undefined {
  if (!hex) return undefined;

  const rgb = hexToRgb(hex);
  return rgb ? rgbToAnsi(rgb[0], rgb[1], rgb[2], background) : undefined;
}

const UNDERLINE_CODES: Record<string, string> = {
  true: "\u001B[4m",
  solid: "\u001B[4m",
  wavy: "\u001B[4:3m",
  undercurl: "\u001B[4:3m",
  double: "\u001B[4:2m",
  dotted: "\u001B[4:4m",
  dashed: "\u001B[4:5m",
};

function underlineCode(underline: HighlightStyle["underline"]): string | undefined {
  if (underline === false || underline === undefined) return undefined;
  return UNDERLINE_CODES[String(underline)];
}

export function styleToAnsi(style: HighlightStyle | undefined): string {
  if (!style) return "";

  const codes: string[] = [];

  const fg = colorCode(style.fg, false);
  if (fg) codes.push(fg);

  const bg = colorCode(style.bg, true);
  if (bg) codes.push(bg);

  if (style.bold) codes.push("\u001B[1m");
  if (style.italic) codes.push("\u001B[3m");

  const underline = underlineCode(style.underline);
  if (underline) codes.push(underline);

  if (style.strikethrough) codes.push("\u001B[9m");

  return codes.join("");
}

/**
 * Render text with ANSI escape codes from a style, with reset on each newline.
 */
export function paint(text: string, style: HighlightStyle | undefined): string {
  const open = styleToAnsi(style);
  if (!open) {
    return text;
  }

  if (style?.bg) {
    let result = ANSI_RESET + open;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i]!;
      if (char === "\n") {
        result += ANSI_RESET;
        result += "\n";
        if (i + 1 < text.length) {
          result += open;
        }
      } else {
        result += char;
      }
    }

    if (!text.endsWith("\n")) {
      result += ANSI_RESET;
    }

    return result;
  }

  return `${ANSI_RESET}${open}${text}${ANSI_RESET}`;
}

/**
 * Wrap text with ANSI escape codes from a style.
 *
 * @deprecated Use `paint()` instead.
 */
export function wrapWithAnsi(text: string, style: HighlightStyle | undefined): string {
  return paint(text, style);
}

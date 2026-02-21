import type { HighlightStyle } from "../types.js";

const ANSI_RESET = "\u001b[0m";

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
  return isBackground ? `\u001b[48;2;${r};${g};${b}m` : `\u001b[38;2;${r};${g};${b}m`;
}

/**
 * Convert a `HighlightStyle` to ANSI escape codes.
 *
 * ```ts
 * styleToAnsi({ fg: '#ff79c6', bold: true })
 * // "\x1b[38;2;255;121;198m\x1b[1m"
 * ```
 */
export function styleToAnsi(style: HighlightStyle | undefined): string {
  if (!style) return "";

  const codes: string[] = [];

  if (style.fg) {
    const rgb = hexToRgb(style.fg);
    if (rgb) codes.push(rgbToAnsi(rgb[0], rgb[1], rgb[2], false));
  }

  if (style.bg) {
    const rgb = hexToRgb(style.bg);
    if (rgb) codes.push(rgbToAnsi(rgb[0], rgb[1], rgb[2], true));
  }

  if (style.bold) codes.push("\u001b[1m");
  if (style.italic) codes.push("\u001b[3m");

  switch (style.underline) {
    case true:
    case "solid":
      codes.push("\u001b[4m");
      break;
    case "wavy":
      codes.push("\u001b[4:3m");
      break;
    case "double":
      codes.push("\u001b[4:2m");
      break;
    case "dotted":
      codes.push("\u001b[4:4m");
      break;
    case "dashed":
      codes.push("\u001b[4:5m");
      break;
  }

  if (style.strikethrough) codes.push("\u001b[9m");

  return codes.join("");
}

/**
 * Wrap text with ANSI escape codes from a style, with reset on each newline.
 *
 * ```ts
 * wrapWithAnsi('const', { fg: '#ff79c6' })
 * // "\x1b[0m\x1b[38;2;255;121;198mconst\x1b[0m"
 * ```
 */
export function wrapWithAnsi(text: string, style: HighlightStyle | undefined): string {
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

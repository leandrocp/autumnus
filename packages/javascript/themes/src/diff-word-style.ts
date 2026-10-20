import type { StyleEntry, ThemeData } from "./types.js";

/** The side of a diff a changed word is on. */
export type DiffWordKind = "removed" | "added";

/** The class linked HTML marks a changed word with. */
export function diffWordClass(kind: DiffWordKind): string {
  return `l-diff-word-${kind}`;
}

const LINE_SCOPE: Readonly<Record<DiffWordKind, string>> = {
  removed: "diff.minus",
  added: "diff.plus",
};

const STEP = 0.1;

const FALLBACK: Readonly<Record<ThemeData["appearance"], { bg: string; fg: string }>> = {
  dark: { bg: "#1e1e1e", fg: "#d4d4d4" },
  light: { bg: "#ffffff", fg: "#1f1f1f" },
};

/**
 * The background of words that changed on one side of a diff.
 *
 * No colorscheme defines one, so it is derived from the theme's own
 * `diff.minus` or `diff.plus` color: the same hue, a step lighter than the
 * line's background on a dark theme and darker on a light one, and the other
 * way when that step would leave the text under 3:1 contrast.
 *
 * The port of `Theme::diff_word_style` in `crates/lumis-core/src/themes.rs`,
 * copied from `@lumis-sh/lumis`, which does not depend on this package at
 * runtime. `packages/javascript/lumis/test/diff-words.test.ts` holds both
 * copies to `fixtures/diff-words.json`.
 */
export function diffWordStyle(
  theme: ThemeData | undefined,
  kind: DiffWordKind,
): StyleEntry | undefined {
  const colors = theme && lineColors(theme, kind);
  return colors && { bg: hex(wordBackground(theme.appearance === "dark", colors)) };
}

interface LineColors {
  text: Rgb;
  lineBg: Rgb;
  hueSource: Rgb;
}

function lineColors(theme: ThemeData, kind: DiffWordKind): LineColors | undefined {
  const normal = { ...FALLBACK[theme.appearance], ...theme.highlights["normal"] };
  const line = theme.highlights[LINE_SCOPE[kind]];
  if (!line) return undefined;

  const background = parseHex(normal.bg);
  const text = parseHex(normal.fg);
  const lineBg = line.bg === undefined ? background : parseHex(line.bg);
  const hueSource = line.fg === undefined ? lineBg : parseHex(line.fg);
  return background && text && lineBg && hueSource ? { text, lineBg, hueSource } : undefined;
}

function wordBackground(dark: boolean, { text, lineBg, hueSource }: LineColors): Rgb {
  const [lightness, baseChroma] = oklch(lineBg);
  const [, accentChroma, hue] = oklch(hueSource);
  const chroma = Math.max(baseChroma + 0.04, Math.min(accentChroma * 0.6, 0.12));
  const shade = (step: number): Rgb =>
    fromOklch(Math.min(Math.max(lightness + step, 0.12), 0.97), chroma, hue);

  const step = dark ? STEP : -STEP;
  const word = shade(step);
  return contrast(text, word) < 3 && contrast(text, lineBg) >= 3 ? shade(-step) : word;
}

/** sRGB channels in `0..=1`. */
type Rgb = readonly [number, number, number];

function parseHex(value: string): Rgb | undefined {
  if (!/^#[0-9a-fA-F]{6}$/u.test(value)) return undefined;
  const channel = (at: number): number => Number.parseInt(value.slice(at, at + 2), 16) / 255;
  return [channel(1), channel(3), channel(5)];
}

function hex(color: Rgb): string {
  return `#${color
    .map((channel) =>
      Math.round(Math.min(Math.max(channel, 0), 1) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function linear(color: Rgb): Rgb {
  const [red, green, blue] = color.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return [red!, green!, blue!];
}

/** WCAG 2.1 contrast ratio. */
function contrast(left: Rgb, right: Rgb): number {
  const luminance = (color: Rgb): number => {
    const [red, green, blue] = linear(color);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const [a, b] = [luminance(left), luminance(right)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Lightness, chroma and hue in radians, through Björn Ottosson's Oklab. */
function oklch(color: Rgb): [number, number, number] {
  const [red, green, blue] = linear(color);
  const long = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const medium = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const short = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
  const lightness = 0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short;
  const greenRed = 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short;
  const blueYellow = 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short;
  return [lightness, Math.hypot(greenRed, blueYellow), Math.atan2(blueYellow, greenRed)];
}

function fromOklch(lightness: number, chroma: number, hue: number): Rgb {
  const [greenRed, blueYellow] = [chroma * Math.cos(hue), chroma * Math.sin(hue)];
  const long = (lightness + 0.3963377774 * greenRed + 0.2158037573 * blueYellow) ** 3;
  const medium = (lightness - 0.1055613458 * greenRed - 0.0638541728 * blueYellow) ** 3;
  const short = (lightness - 0.0894841775 * greenRed - 1.291485548 * blueYellow) ** 3;
  const channels = [
    4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
    -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
    -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
  ].map((channel) => {
    const clamped = Math.min(Math.max(channel, 0), 1);
    return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
  });
  return [channels[0]!, channels[1]!, channels[2]!];
}

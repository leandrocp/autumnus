import type { StyleEntry, ThemeData } from "./types.js";

/** Options for {@link buildCss}. */
export interface BuildCssOptions {
  /** Whether italic theme styles should be emitted. Defaults to `true`. */
  enableItalic?: boolean;
  /** Prefix prepended to every generated selector. Defaults to `""`. */
  selectorPrefix?: string;
  /** Selector used for the `<pre>` code block rule. Defaults to `"pre.lumis"`. */
  preSelector?: string;
  /**
   * Extra `[property, value]` declarations for the base code block rule. A property that matches
   * one the theme already sets (`color`, `background-color`) replaces that value instead of duplicating it.
   */
  baseRules?: [string, string][];
}

/**
 * Build a CSS stylesheet for a theme.
 *
 * Most applications can use the bundled CSS files from `@lumis-sh/themes/css/*`,
 * but this is useful when CSS needs to be embedded, scoped, or customized, for
 * example to scope a dark theme under a `data-theme` selector.
 *
 * ```ts
 * import { buildCss } from '@lumis-sh/themes'
 * import githubDark from '@lumis-sh/themes/github_dark'
 *
 * const css = buildCss(githubDark, {
 *   selectorPrefix: 'html[data-theme="dark"] ',
 *   preSelector: '.lumis',
 *   baseRules: [
 *     ['background-color', 'var(--code-background)'],
 *     ['border-radius', '0.375rem'],
 *     ['padding', '1rem'],
 *   ],
 * })
 * ```
 */
export function buildCss(theme: ThemeData, options: BuildCssOptions = {}): string {
  const enableItalic = options.enableItalic ?? true;
  const selectorPrefix = options.selectorPrefix ?? "";
  const preSelector = options.preSelector ?? "pre.lumis";
  const baseRules = options.baseRules ?? [];

  const rules: string[] = [];

  rules.push(
    `/* ${theme.name}\n * revision: ${theme.revision ?? ""}\n */\n\n${selectorPrefix}${preSelector}`,
  );

  const normal = theme.highlights["normal"];
  const baseStyle = renderBaseStyle(normal, baseRules, "\n  ");

  if (baseStyle === "") {
    rules.push(" {}\n");
  } else {
    rules.push(` {\n  ${baseStyle}\n}\n`);
  }

  const entries = Object.entries(theme.highlights).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  for (const [scope, style] of entries) {
    // `normal` defines the code block's base colors, already emitted above and inherited by all
    // text. It is never applied as a token class, so a `.normal` rule would be dead CSS.
    if (scope === "normal") {
      continue;
    }

    const styleCss = renderStyle(style, enableItalic, "\n  ");

    if (styleCss !== "") {
      rules.push(`${selectorPrefix}.lumis-${scope.replaceAll(".", "-")} {\n  ${styleCss}\n}\n`);
    }
  }

  return rules.join("");
}

function renderBaseStyle(
  normal: StyleEntry | undefined,
  baseRules: [string, string][],
  separator: string,
): string {
  // Start from the theme's base declarations, then merge `baseRules` over them: a rule whose
  // property already exists replaces it in place, otherwise it is appended. This keeps a single
  // declaration per property (overriding `background-color` does not duplicate the theme's).
  const decls: [string, string][] = [];

  if (normal?.fg) {
    decls.push(["color", normal.fg]);
  }
  if (normal?.bg) {
    decls.push(["background-color", normal.bg]);
  }

  for (const [property, value] of baseRules) {
    const existing = decls.find(([p]) => p === property);
    if (existing) {
      existing[1] = value;
    } else {
      decls.push([property, value]);
    }
  }

  return decls.map(([property, value]) => `${property}: ${value};`).join(separator);
}

function renderStyle(style: StyleEntry, enableItalic: boolean, separator: string): string {
  const rules: string[] = [];

  if (style.fg) {
    rules.push(`color: ${style.fg};`);
  }

  if (style.bg) {
    rules.push(`background-color: ${style.bg};`);
  }

  if (style.bold) {
    rules.push("font-weight: bold;");
  }

  if (enableItalic && style.italic) {
    rules.push("font-style: italic;");
  }

  const underline = underlineDecoration(style.underline);

  if (underline && style.strikethrough) {
    rules.push(`text-decoration: ${underline} line-through;`);
  } else if (underline) {
    rules.push(`text-decoration: ${underline};`);
  } else if (style.strikethrough) {
    rules.push("text-decoration: line-through;");
  }

  return rules.join(separator);
}

function underlineDecoration(underline: StyleEntry["underline"]): string | undefined {
  switch (underline) {
    case "solid":
      return "underline";
    case "wavy":
    case "undercurl":
      return "underline wavy";
    case "double":
      return "underline double";
    case "dotted":
      return "underline dotted";
    case "dashed":
      return "underline dashed";
    default:
      return undefined;
  }
}

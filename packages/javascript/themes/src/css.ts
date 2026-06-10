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
   * When `true`, token selectors are scoped under `preSelector`, so `.keyword`
   * becomes `.lumis .keyword` if `preSelector` is `".lumis"`. Defaults to `false`.
   */
  scopeTokens?: boolean;
  /** Background override for the base code block rule. */
  background?: string;
  /** Extra `[property, value]` declarations appended to the base code block rule. */
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
 *   scopeTokens: true,
 *   background: 'var(--code-background)',
 *   baseRules: [
 *     ['border-radius', '0.375rem'],
 *     ['padding', '1rem'],
 *     ['overflow-x', 'auto'],
 *   ],
 * })
 * ```
 */
export function buildCss(theme: ThemeData, options: BuildCssOptions = {}): string {
  const enableItalic = options.enableItalic ?? true;
  const selectorPrefix = options.selectorPrefix ?? "";
  const preSelector = options.preSelector ?? "pre.lumis";
  const scopeTokens = options.scopeTokens ?? false;
  const background = options.background;
  const baseRules = options.baseRules ?? [];

  const rules: string[] = [];

  rules.push(
    `/* ${theme.name}\n * revision: ${theme.revision ?? ""}\n */\n\n${selectorPrefix}${preSelector}`,
  );

  const normal = theme.highlights["normal"];
  const baseStyle = renderBaseStyle(normal, background, baseRules, "\n  ");

  if (baseStyle === "") {
    rules.push(" {}\n");
  } else {
    rules.push(` {\n  ${baseStyle}\n}\n`);
  }

  const tokenSelectorPrefix = scopeTokens ? `${preSelector} ` : "";

  const entries = Object.entries(theme.highlights).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  for (const [scope, style] of entries) {
    const styleCss = renderStyle(style, enableItalic, "\n  ");

    if (styleCss !== "") {
      rules.push(
        `${selectorPrefix}${tokenSelectorPrefix}.${scope.replaceAll(".", "-")} {\n  ${styleCss}\n}\n`,
      );
    }
  }

  return rules.join("");
}

function renderBaseStyle(
  normal: StyleEntry | undefined,
  background: string | undefined,
  baseRules: [string, string][],
  separator: string,
): string {
  const rules: string[] = [];

  if (normal?.fg) {
    rules.push(`color: ${normal.fg};`);
  }

  if (background !== undefined) {
    rules.push(`background-color: ${background};`);
  } else if (normal?.bg) {
    rules.push(`background-color: ${normal.bg};`);
  }

  for (const [property, value] of baseRules) {
    rules.push(`${property}: ${value};`);
  }

  return rules.join(separator);
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

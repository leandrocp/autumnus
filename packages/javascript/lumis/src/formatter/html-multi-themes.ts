import type { HighlightEvent, HighlightSpan, HtmlMultiThemesFormatter, Theme } from "../types.js";
import { sanitizeThemeName } from "../themes.js";
import {
  closingTags,
  formatHighlightIterLines,
  getHighlightLineClass,
  getThemeStyle,
  joinClasses,
  lineIsHighlighted,
  openCodeTag,
  openTag,
  spanMultiThemesAttrs,
  styleToCss,
  wrapLine,
  wrapWithHeader,
} from "./html.js";

function buildNormalThemeVars(
  styles: string[],
  prefix: string,
  themes: Record<string, Theme>,
  excludeTheme?: string,
): void {
  for (const [themeName, theme] of Object.entries(themes)) {
    if (themeName === excludeTheme) {
      continue;
    }

    const sanitized = sanitizeThemeName(themeName);
    const style = getThemeStyle(theme, "normal");
    if (style?.fg) styles.push(`${prefix}-${sanitized}:${style.fg};`);
    if (style?.bg) styles.push(`${prefix}-${sanitized}-bg:${style.bg};`);
  }
}

function buildPreThemeStyle(options: {
  themes: Record<string, Theme>;
  defaultTheme?: string;
  cssVariablePrefix?: string;
}): string | undefined {
  const prefix = options.cssVariablePrefix ?? "--lumis";
  const styles: string[] = [];

  if (options.defaultTheme === "light-dark()") {
    const lightNormal = getThemeStyle(options.themes.light, "normal");
    const darkNormal = getThemeStyle(options.themes.dark, "normal");
    const lightFg = lightNormal?.fg ?? "#000000";
    const lightBg = lightNormal?.bg ?? "#ffffff";
    const darkFg = darkNormal?.fg ?? "#ffffff";
    const darkBg = darkNormal?.bg ?? "#000000";

    styles.push(`color: light-dark(${lightFg}, ${darkFg});`);
    styles.push(`background-color: light-dark(${lightBg}, ${darkBg});`);
  } else if (options.defaultTheme) {
    const defaultStyle = getThemeStyle(options.themes[options.defaultTheme], "normal");
    if (defaultStyle?.fg) styles.push(`color:${defaultStyle.fg};`);
    if (defaultStyle?.bg) styles.push(`background-color:${defaultStyle.bg};`);
    buildNormalThemeVars(styles, prefix, options.themes, options.defaultTheme);
  } else {
    buildNormalThemeVars(styles, prefix, options.themes);
  }

  return styles.length > 0 ? styles.join(" ") : undefined;
}

function spanAttrs(
  span: HighlightSpan,
  formatter: HtmlMultiThemesFormatter,
): Record<string, string | undefined> {
  return spanMultiThemesAttrs({
    language: span.language,
    scope: span.scope,
    themes: formatter.themes,
    defaultTheme: formatter.defaultTheme,
    cssVariablePrefix: formatter.cssVariablePrefix,
    italic: formatter.italic,
    includeHighlights: formatter.includeHighlights,
  });
}

function generatePreClasses(formatter: HtmlMultiThemesFormatter): string {
  return (
    joinClasses("lumis", "lumis-themes", formatter.preClass, ...Object.keys(formatter.themes)) ??
    "lumis lumis-themes"
  );
}

function generatePreStyle(formatter: HtmlMultiThemesFormatter): string | undefined {
  return buildPreThemeStyle({
    themes: formatter.themes,
    defaultTheme: formatter.defaultTheme,
    cssVariablePrefix: formatter.cssVariablePrefix,
  });
}

function highlightLineStyle(
  formatter: HtmlMultiThemesFormatter,
  lineNumber: number,
): string | undefined {
  const highlightLines = formatter.highlightLines;
  if (!lineIsHighlighted(highlightLines?.lines, lineNumber)) {
    return undefined;
  }

  if (highlightLines?.style && highlightLines.style !== "theme") {
    return highlightLines.style;
  }

  if (!formatter.defaultTheme || formatter.defaultTheme === "light-dark()") {
    return undefined;
  }

  const style = getThemeStyle(formatter.themes[formatter.defaultTheme], "highlighted");
  return styleToCss(style, { italic: formatter.italic }) || undefined;
}

function highlightLineClass(
  formatter: HtmlMultiThemesFormatter,
  lineNumber: number,
): string | undefined {
  return getHighlightLineClass(
    formatter.highlightLines?.lines,
    lineNumber,
    formatter.highlightLines?.class,
  );
}

function getLineAttrs(
  formatter: HtmlMultiThemesFormatter,
  lineNumber: number,
): { className?: string; style?: string } {
  return {
    className: highlightLineClass(formatter, lineNumber),
    style: highlightLineStyle(formatter, lineNumber),
  };
}

export function formatHtmlMultiThemes(
  source: string,
  events: HighlightEvent[],
  formatter: HtmlMultiThemesFormatter,
): string {
  const theme = formatter.defaultTheme ? formatter.themes[formatter.defaultTheme] : undefined;
  const { lines } = formatHighlightIterLines(source, events, formatter.language, theme, {
    openSpan: (span, _style) => openTag("span", spanAttrs(span, formatter)),
  });

  const pre = openTag("pre", {
    class: generatePreClasses(formatter),
    style: generatePreStyle(formatter),
  });
  const code = openCodeTag(formatter.language);
  const body = lines
    .map((line, idx) => wrapLine(idx + 1, line, getLineAttrs(formatter, idx + 1)))
    .join("");

  return wrapWithHeader(`${pre}${code}${body}${closingTags()}`, formatter.header);
}

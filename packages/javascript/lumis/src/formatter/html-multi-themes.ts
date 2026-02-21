import type { HighlightEvent, HighlightSpan, HtmlMultiThemesFormatter, Theme } from "../types.js";
import {
  closingTags,
  formatHighlightIterLines,
  getHighlightLineClass,
  getScopedThemeStyle,
  getThemeStyle,
  joinClasses,
  lineIsHighlighted,
  openCodeTag,
  openTag,
  openSpanTag,
  styleToCss,
  textDecoration,
  wrapLine,
  wrapWithHeader,
} from "./html.js";
import { sanitizeThemeName } from "../themes.js";

function pushThemeCssVars(
  cssVars: string[],
  prefix: string,
  themeName: string,
  span: HighlightSpan,
  theme: Theme | undefined,
): void {
  const style = getScopedThemeStyle(theme, span.scope, span.language);
  if (!style) return;

  const sanitized = sanitizeThemeName(themeName);
  if (style.fg) cssVars.push(`${prefix}-${sanitized}:${style.fg};`);
  if (style.bg) cssVars.push(`${prefix}-${sanitized}-bg:${style.bg};`);
  cssVars.push(`${prefix}-${sanitized}-font-style:${style.italic ? "italic" : "normal"};`);
  cssVars.push(`${prefix}-${sanitized}-font-weight:${style.bold ? "bold" : "normal"};`);
  cssVars.push(`${prefix}-${sanitized}-text-decoration:${textDecoration(style) ?? "none"};`);
}

function spanAttrs(
  span: HighlightSpan,
  formatter: HtmlMultiThemesFormatter,
): Record<string, string | undefined> {
  const themes = formatter.themes;
  const defaultTheme = formatter.defaultTheme;
  const prefix = formatter.cssVariablePrefix ?? "--lumis";

  const attrs: Record<string, string | undefined> = {};
  if (formatter.includeHighlights) {
    attrs["data-highlight"] = span.scope;
  }

  if (Object.keys(themes).length === 0) {
    return attrs;
  }

  const inlineStyles: string[] = [];
  const cssVars: string[] = [];

  if (defaultTheme === "light-dark()") {
    const lightStyle = getScopedThemeStyle(themes.light, span.scope, span.language);
    const darkStyle = getScopedThemeStyle(themes.dark, span.scope, span.language);

    if (lightStyle && darkStyle) {
      if (lightStyle.fg && darkStyle.fg) {
        inlineStyles.push(`color: light-dark(${lightStyle.fg}, ${darkStyle.fg});`);
      }
      if (lightStyle.bg && darkStyle.bg) {
        inlineStyles.push(`background-color: light-dark(${lightStyle.bg}, ${darkStyle.bg});`);
      }
      inlineStyles.push(
        `font-weight: light-dark(${lightStyle.bold ? "bold" : "normal"}, ${darkStyle.bold ? "bold" : "normal"});`,
      );
      if (formatter.italic) {
        inlineStyles.push(
          `font-style: light-dark(${lightStyle.italic ? "italic" : "normal"}, ${darkStyle.italic ? "italic" : "normal"});`,
        );
      }

      const lightDecoration = textDecoration(lightStyle) ?? "none";
      const darkDecoration = textDecoration(darkStyle) ?? "none";
      inlineStyles.push(`text-decoration: light-dark(${lightDecoration}, ${darkDecoration});`);
    }
  } else if (defaultTheme) {
    const defaultStyle = getScopedThemeStyle(themes[defaultTheme], span.scope, span.language);
    if (defaultStyle) {
      const css = styleToCss(defaultStyle, {
        italic: formatter.italic,
        compact: true,
      });
      if (css) {
        inlineStyles.push(css);
      }

      const sanitized = sanitizeThemeName(defaultTheme);
      cssVars.push(
        `${prefix}-${sanitized}-font-style:${defaultStyle.italic ? "italic" : "normal"};`,
      );
      cssVars.push(`${prefix}-${sanitized}-font-weight:${defaultStyle.bold ? "bold" : "normal"};`);
      cssVars.push(
        `${prefix}-${sanitized}-text-decoration:${textDecoration(defaultStyle) ?? "none"};`,
      );
    }

    for (const [themeName, theme] of Object.entries(themes)) {
      if (themeName === defaultTheme) continue;
      pushThemeCssVars(cssVars, prefix, themeName, span, theme);
    }
  } else {
    for (const [themeName, theme] of Object.entries(themes)) {
      pushThemeCssVars(cssVars, prefix, themeName, span, theme);
    }
  }

  const styleParts = [...inlineStyles, ...cssVars].filter(Boolean);
  if (styleParts.length > 0) {
    attrs.style = styleParts.join(" ");
  }

  return attrs;
}

function generatePreClasses(formatter: HtmlMultiThemesFormatter): string {
  return (
    joinClasses("lumis", "lumis-themes", formatter.preClass, ...Object.keys(formatter.themes)) ??
    "lumis lumis-themes"
  );
}

function generatePreStyle(formatter: HtmlMultiThemesFormatter): string | undefined {
  const prefix = formatter.cssVariablePrefix ?? "--lumis";
  const styles: string[] = [];

  if (formatter.defaultTheme === "light-dark()") {
    const lightNormal = getThemeStyle(formatter.themes.light, "normal");
    const darkNormal = getThemeStyle(formatter.themes.dark, "normal");
    const lightFg = lightNormal?.fg ?? "#000000";
    const lightBg = lightNormal?.bg ?? "#ffffff";
    const darkFg = darkNormal?.fg ?? "#ffffff";
    const darkBg = darkNormal?.bg ?? "#000000";

    styles.push(`color: light-dark(${lightFg}, ${darkFg});`);
    styles.push(`background-color: light-dark(${lightBg}, ${darkBg});`);
  } else if (formatter.defaultTheme) {
    const defaultStyle = getThemeStyle(formatter.themes[formatter.defaultTheme], "normal");
    if (defaultStyle?.fg) styles.push(`color:${defaultStyle.fg};`);
    if (defaultStyle?.bg) styles.push(`background-color:${defaultStyle.bg};`);

    for (const [themeName, theme] of Object.entries(formatter.themes)) {
      if (themeName === formatter.defaultTheme) continue;
      const sanitized = sanitizeThemeName(themeName);
      const style = getThemeStyle(theme, "normal");
      if (style?.fg) styles.push(`${prefix}-${sanitized}:${style.fg};`);
      if (style?.bg) styles.push(`${prefix}-${sanitized}-bg:${style.bg};`);
    }
  } else {
    for (const [themeName, theme] of Object.entries(formatter.themes)) {
      const sanitized = sanitizeThemeName(themeName);
      const style = getThemeStyle(theme, "normal");
      if (style?.fg) styles.push(`${prefix}-${sanitized}:${style.fg};`);
      if (style?.bg) styles.push(`${prefix}-${sanitized}-bg:${style.bg};`);
    }
  }

  return styles.length > 0 ? styles.join(" ") : undefined;
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

export function formatHtmlMultiThemes(
  source: string,
  events: HighlightEvent[],
  formatter: HtmlMultiThemesFormatter,
): string {
  const theme = formatter.defaultTheme ? formatter.themes[formatter.defaultTheme] : undefined;
  const { lines } = formatHighlightIterLines(source, events, formatter.language, theme, {
    openSpan: (span) => openSpanTag(spanAttrs(span, formatter)),
  });

  const preClasses = generatePreClasses(formatter);
  const preStyle = generatePreStyle(formatter);
  const pre = openTag("pre", { class: preClasses, style: preStyle });
  const code = openCodeTag(formatter.language);
  const body = lines
    .map((line, idx) =>
      wrapLine(idx + 1, line, {
        className: highlightLineClass(formatter, idx + 1),
        style: highlightLineStyle(formatter, idx + 1),
      }),
    )
    .join("");
  return wrapWithHeader(`${pre}${code}${body}${closingTags()}`, formatter.header);
}
